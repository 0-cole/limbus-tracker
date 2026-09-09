const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const userDataPath = app.getPath('userData');
const dynamicDataPath = path.join(userDataPath, 'dynamic_database.json');

// Initialize dynamic database if it doesn't exist
if (!fs.existsSync(dynamicDataPath)) {
  fs.writeFileSync(dynamicDataPath, JSON.stringify({ identities: [], egos: [], activeBanner: null }, null, 2));
}

async function fetchWikiAPI(pageName) {
  try {
    const url = `https://limbuscompany.wiki.gg/api.php?action=parse&page=${encodeURIComponent(pageName.replace(/ /g, '_'))}&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'LimbusTrackerApp/1.0' } });
    const json = await res.json();
    if (json && json.parse && json.parse.text) return json.parse.text['*'];
    return null;
  } catch (e) {
    return null;
  }
}

async function scrapeSkills(html) {
  const $ = cheerio.load(html);
  const skills = [];
  
  $('.tabber__tab').each((i, el) => {
    const tabName = $(el).text();
    if (tabName.match(/^Skill \d+$/) || tabName.toLowerCase().includes('awakening') || tabName.toLowerCase().includes('corrosion')) {
      const tabId = $(el).attr('aria-controls');
      const panel = $('#' + tabId);
      panel.find('.tooltip-contents').remove();
      
      let basePower = 0, coinPower = 0, name = 'Unknown';
      
      const bTags = panel.find('b').toArray();
      let foundBase = false;
      for(let tag of bTags) {
         const t = $(tag).text().trim();
         if(t.match(/^\d+$/) && !foundBase) { basePower = parseInt(t); foundBase = true; }
         else if(t.match(/^[\+\-]?\d+$/)) { coinPower = parseInt(t.replace('+','')); }
      }
  
      const nameEl = panel.find('.skillgrad-font div').first();
      if(nameEl.length) name = nameEl.text().trim();
      
      const attackTypeImg = panel.find('img[alt^="Slash"], img[alt^="Pierce"], img[alt^="Blunt"]').first();
      const attackType = attackTypeImg.length ? attackTypeImg.attr('alt').replace('.png', '') : 'Unknown';
      
      const sinImg = panel.find('.skillIcon img').first();
      let sin = 'Unknown';
      if(sinImg.length) {
          sin = sinImg.attr('alt').replace('.png','').replace(/[0-9]/g, '');
      }
      
      let coins = 1;
      const coinMatch = panel.text().match(/Amt\.\s*x(\d+)/);
      if(coinMatch) coins = parseInt(coinMatch[1]);
      
      let effects = [];
      const effectTextNodes = panel.find('font').toArray();
      for(let f of effectTextNodes) {
          if($(f).text().includes('[On Hit]') || $(f).text().includes('[On Use]') || $(f).text().includes('[Clash')) {
              let text = $(f).parent().text().replace(/\s+/g, ' ').trim();
              effects.push(text);
          }
      }
      
      skills.push({ name, type: attackType, affinity: sin, basePower, coinPower, coins, effects });
    }
  });
  return skills;
}

function canonicalKey(name) {
  if (!name) return '';
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_【】\[\]:]/g, '')
    .toLowerCase();
}

async function checkForUpdates(baseIds, baseEgos) {
  console.log('[AutoUpdater] Checking for new Identities and EGOs...');
  
  const dynamicData = JSON.parse(fs.readFileSync(dynamicDataPath, 'utf-8'));
  const knownIds = new Set(baseIds.map(i => canonicalKey(i.name)).concat(dynamicData.identities.map(i => canonicalKey(i.name))));
  
  const idsHtml = await fetchWikiAPI('List_of_Identities');
  if (idsHtml) {
    const $ = cheerio.load(idsHtml);
    const newIdentities = [];
    
    // Convert array of elements to an array to allow await inside a loop
    const idLinks = $('.IDRec a').toArray();
    for (const el of idLinks) {
      const title = $(el).attr('title');
      if (title && !knownIds.has(canonicalKey(title)) && !title.includes('File:')) {
        console.log(`[AutoUpdater] Found new Identity: ${title}`);
        const html = await fetchWikiAPI(title);
        let skills = [];
        if (html) {
          skills = await scrapeSkills(html);
        }
            
            // Try to extract rarity/sinner from the title
            let rarity = 3;
            if (title.includes('LCB Sinner')) rarity = 1;
            else if ($(el).parent().find('.Rar2').length) rarity = 2; // naive check
            
            // Determine sinner
            const sinnersList = ['Yi Sang', 'Faust', 'Don Quixote', 'Ryōshū', 'Meursault', 'Hong Lu', 'Heathcliff', 'Ishmael', 'Rodion', 'Sinclair', 'Outis', 'Gregor'];
            let sinner = 'unknown';
            for (let s of sinnersList) {
                if(title.includes(s)) sinner = s.toLowerCase().replace(/ /g, '-').replace('ō', 'o').replace('ū', 'u');
            }
            
            newIdentities.push({
                name: title,
                sinner: sinner,
                rarity: rarity,
                tierIndex: 999, // default unranked
                skills: skills,
                isDynamic: true
            });
            knownIds.add(title);
            // Throttle
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    if (newIdentities.length > 0) {
        dynamicData.identities.push(...newIdentities);
        console.log(`[AutoUpdater] Added ${newIdentities.length} new Identities.`);
    }
  }

  // Check Active Banner
  try {
    const bannerHtml = await fetchWikiAPI('Extraction/Banner_History');
    if (bannerHtml) {
      const $ = cheerio.load(bannerHtml);
      // Get first row of first lcbtable2
      const firstRow = $('.lcbtable2').first().find('tr').first();
      if (firstRow.length) {
         let text = firstRow.text().replace(/\s+/g, ' ').trim();
         // Parse date range: "2026.9.3 12:00 - 2026.9.17 10:00 Target Name"
         const dateMatch = text.match(/(\d{4}\.\d{1,2}\.\d{1,2} \d{1,2}:\d{2}) - (\d{4}\.\d{1,2}\.\d{1,2} \d{1,2}:\d{2})\s+(.+)/);
         if (dateMatch) {
            dynamicData.activeBanner = {
               text: dateMatch[3],
               rawString: text
            };
            console.log(`[AutoUpdater] Found active banner: ${dateMatch[3]}`);
         } else {
            dynamicData.activeBanner = { text: text, rawString: text };
         }
      }
    }
  } catch(e) { console.error('Banner scrape failed', e); }

  fs.writeFileSync(dynamicDataPath, JSON.stringify(dynamicData, null, 2));
}

module.exports = { checkForUpdates, dynamicDataPath };
