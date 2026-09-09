const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/egos.json');
let egos = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function scrape() {
   for (let i = 0; i < egos.length; i++) {
       const ego = egos[i];
       
       console.log(`[${i+1}/${egos.length}] Scraping Threadspins for EGO ${ego.name}...`);
       try {
           const searchRes = await fetch(`https://limbuscompany.wiki.gg/api.php?action=opensearch&search=${encodeURIComponent(ego.name)}&limit=1&format=json`).then(r => r.json());
           let pageName = ego.name;
           if (searchRes[1] && searchRes[1].length > 0) {
              pageName = searchRes[1][0];
           }
           
           const html = await fetch(`https://limbuscompany.wiki.gg/wiki/${encodeURIComponent(pageName.replace(/ /g, '_'))}`).then(r => r.text());
           const $ = cheerio.load(html);
           $('.tooltip').remove();
           
           ego.upties = { 1: [], 2: [], 3: [], 4: [] };
           
           $('.tabber__tab').each((idx, el) => {
              const tabName = $(el).text();
              if (tabName.includes('Awakening') || tabName.includes('Corrosion')) {
                 const tabId = $(el).attr('aria-controls');
                 const panel = $('#' + tabId);
                 
                 [1, 2, 3, 4].forEach(ut => {
                    const utDiv = panel.find(`#mw-customcollapsible-ut${ut}`);
                    if (utDiv.length) {
                       let basePower = 0, coinPower = 0;
                       let foundBase = false;
                       utDiv.find('b').each((_, b) => {
                          const t = $(b).text().trim();
                          if(t.match(/^\d+$/) && !foundBase) { basePower = parseInt(t); foundBase = true; }
                          else if(t.match(/^[\+\-]?\d+$/)) { coinPower = parseInt(t.replace('+','')); }
                       });
                       
                       let coins = 1;
                       const coinMatch = utDiv.text().match(/Amt\.\s*x(\d+)/);
                       if(coinMatch) coins = parseInt(coinMatch[1]);
                       
                       const attackTypeImg = utDiv.find('img[alt^="Slash"], img[alt^="Pierce"], img[alt^="Blunt"]').first();
                       const type = attackTypeImg.length ? attackTypeImg.attr('alt').replace('.png', '') : 'Unknown';
                       
                       const sinImg = utDiv.find('.skillIcon img').first();
                       const affinity = sinImg.length ? sinImg.attr('alt').replace('.png','').replace(/[0-9]/g, '') : 'Unknown';
                       
                       const effects = [];
                       utDiv.find('font').each((j, f) => {
                          const text = $(f).parent().text().replace(/\s+/g, ' ').trim();
                          if (text.includes('[On Hit]') || text.includes('[On Use]') || text.includes('[Clash') || text.includes('[Combat Start]') || text.includes('[Indiscriminate]')) {
                             if (!effects.includes(text) && text.length > 5) effects.push(text);
                          }
                       });
                       
                       let skillName = tabName.includes('Awakening') ? 'Awakening' : 'Corrosion';
                       const nameEl = utDiv.find('.skillgrad-font div').first();
                       if(nameEl.length) skillName = nameEl.text().trim();
                       
                       ego.upties[ut].push({
                          name: skillName,
                          affinity,
                          type,
                          basePower,
                          coinPower,
                          coins,
                          effects
                       });
                    }
                 });
              }
           });
           
           if (ego.upties['4'] && ego.upties['4'].length > 0) {
               ego.skills = ego.upties['4'];
           }
       } catch(e) {
           console.log(`Failed on ${ego.name}`, e.message);
       }
       
       fs.writeFileSync(dataPath, JSON.stringify(egos, null, 2));
       await new Promise(r => setTimeout(r, 100)); 
   }
   console.log('Done EGOs!');
}
scrape();
