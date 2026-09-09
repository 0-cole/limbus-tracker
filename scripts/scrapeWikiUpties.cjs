const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/identities.json');
let identities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function scrape() {
   for (let i = 0; i < identities.length; i++) {
       const id = identities[i];
       
       const hasUnknown = id.skills && id.skills.some(s => s.affinity === 'Unknown' || s.type === 'Unknown' || s.name === 'Fa Jin');
       if (!hasUnknown) continue;
       
       console.log(`[${i+1}/${identities.length}] Fixing ${id.name}...`);
       try {
           const html = await fetch(`https://limbuscompany.wiki.gg/wiki/${encodeURIComponent(id.name.replace(/ /g, '_'))}`).then(r => r.text());
           const $ = cheerio.load(html);
           $('.tooltip').remove();
           
           id.upties = { 1: [], 2: [], 3: [], 4: [] };
           
           $('.tabber__tab').each((idx, el) => {
              const tabName = $(el).text();
              if (tabName.match(/^Skill \d+$/) || tabName === 'Defense') {
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
                          if (text.includes('[On Hit]') || text.includes('[On Use]') || text.includes('[Clash') || text.includes('[Combat Start]')) {
                             if (!effects.includes(text) && text.length > 5) {
                                effects.push(text);
                             }
                          }
                       });
                       
                       let skillName = tabName;
                       const nameEl = utDiv.find('.skillgrad-font div').first();
                       if(nameEl.length) skillName = nameEl.text().trim();
                       
                       id.upties[ut].push({
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
           
           if (id.upties['4'] && id.upties['4'].length > 0) {
               id.skills = id.upties['4'];
           }
           
       } catch(e) {
           console.log(`Failed on ${id.name}`);
       }
       
       fs.writeFileSync(dataPath, JSON.stringify(identities, null, 2));
       await new Promise(r => setTimeout(r, 100)); // sleep to avoid ban
   }
   console.log('Done!');
}
scrape();
