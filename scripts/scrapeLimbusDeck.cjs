const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

async function scrape() {
  console.log('Fetching Identities List...');
  const html = await fetch('https://limbusdeck.com/en/database/identities').then(r => r.text());
  const $ = cheerio.load(html);
  const links = $('a[href^="/en/database/identities/"]').map((i, el) => $(el).attr('href')).get();
  // Filter out duplicates
  const uniqueLinks = [...new Set(links)];
  
  console.log(`Found ${uniqueLinks.length} Identities to scrape.`);
  
  const identities = [];
  
  for (let i = 0; i < uniqueLinks.length; i++) {
     const link = uniqueLinks[i];
     const slug = link.split('/').pop();
     console.log(`[${i+1}/${uniqueLinks.length}] Scraping ${slug}...`);
     
     try {
       const pageHtml = await fetch(`https://limbusdeck.com${link}`).then(r => r.text());
       const $p = cheerio.load(pageHtml);
       
       const name = $p('h1').first().text().trim();
       const subtitle = $p('h1').next('p').text().trim() || name; // sometimes it has KR name
       
       // Sinner Name (e.g. Hong Lu) from the Breadcrumbs
       const breadcrumb = $p('nav a').map((i, el) => $p(el).text().trim()).get();
       const sinner = breadcrumb[1] || 'Unknown';
       
       // Rarity
       const rarityText = $p('.text-amber-400').first().text().trim(); // "★★★"
       const rarity = rarityText.length || 1;
       
       // Traits/Affiliations
       const traits = [];
       $p('span:contains("Affiliation")').parent().find('a').each((i, el) => {
          traits.push($p(el).text().trim());
       });
       
       // Passives
       const passives = [];
       $p('#passives h3').each((i, el) => {
          const pName = $p(el).text().trim();
          const pDesc = $p(el).parent().parent().find('p').text().trim();
          passives.push({ name: pName, description: pDesc });
       });
       
       // Skills
       const skills = [];
       $p('#skills [role="tabpanel"]').each((i, el) => {
          // The skills are hidden in tabpanels but we can just grab text
          const skillPanel = $p(el);
          const skillNameRaw = $p('#skills button[role="tab"]').eq(i).text().trim(); // e.g. "S1Fa Jin"
          const skillName = skillNameRaw.replace(/^S[1-3]/, '');
          
          const typeAndSin = [];
          skillPanel.find('.border-b > div').first().find('span').each((_, s) => typeAndSin.push($p(s).text().trim()));
          // First is usually Sin (e.g. Gloom), second is Type (e.g. Pierce)
          
          const stats = [];
          skillPanel.find('.bg-muted\\/50 p.text-2xl').each((_, s) => stats.push($p(s).text().trim()));
          const coinsRaw = skillPanel.find('.bg-muted\\/50 span.text-sm').text().trim(); // e.g. "x+7"
          
          // Effects
          const effects = [];
          skillPanel.find('.text-muted-foreground > span').each((_, s) => {
             const t = $p(s).text().trim();
             if (t) effects.push(t);
          });
          
          skills.push({
             name: skillName,
             affinity: typeAndSin[0] || 'Unknown',
             type: typeAndSin[1] || 'Unknown',
             basePower: parseInt(stats[0]) || 0,
             coinPower: parseInt(coinsRaw.replace(/[^0-9]/g, '')) || 0,
             coins: coinsRaw.includes('x') ? parseInt(coinsRaw.split('x')[0]) || 1 : 1, // Will fix later if needed
             effects: effects
          });
       });
       
       // Keywords
       const keywords = [];
       $p('section#hero a[href*="/guides/keyword/"] span').each((i, el) => {
          keywords.push($p(el).text().trim());
       });
       
       identities.push({
          slug: slug,
          name: name,
          sinner: sinner.toLowerCase().replace(/ /g, '-').replace('ō', 'o'),
          rarity: rarity,
          traits: traits,
          keywords: keywords,
          skills: skills,
          passives: passives,
          season: $p('span:contains("Season")').first().text().trim() || 'Standard'
       });
       
     } catch (e) {
       console.log(`Failed to scrape ${slug}:`, e.message);
     }
  }
  
  fs.writeFileSync(path.join(__dirname, '../src/data/identities.json'), JSON.stringify(identities, null, 2));
  console.log('Saved to src/data/identities.json');
}

scrape();
