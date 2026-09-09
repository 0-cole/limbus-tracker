const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

async function scrape() {
  console.log('Fetching EGOs List...');
  const html = await fetch('https://limbusdeck.com/en/database/egos').then(r => r.text());
  const $ = cheerio.load(html);
  const links = $('a[href^="/en/database/egos/"]').map((i, el) => $(el).attr('href')).get();
  // Filter out duplicates
  const uniqueLinks = [...new Set(links)];
  
  console.log(`Found ${uniqueLinks.length} EGOs to scrape.`);
  
  const egos = [];
  
  for (let i = 0; i < uniqueLinks.length; i++) {
     const link = uniqueLinks[i];
     const slug = link.split('/').pop();
     console.log(`[${i+1}/${uniqueLinks.length}] Scraping EGO ${slug}...`);
     
     try {
       const pageHtml = await fetch(`https://limbusdeck.com${link}`).then(r => r.text());
       const $p = cheerio.load(pageHtml);
       
       const name = $p('h1').first().text().trim();
       
       // Sinner Name from the Breadcrumbs
       const breadcrumb = $p('nav a').map((i, el) => $p(el).text().trim()).get();
       const sinner = breadcrumb[1] || 'Unknown';
       
       // Grade / Rarity
       const gradeText = $p('.text-amber-400').first().text().trim(); 
       let grade = 'ZAYIN';
       if (gradeText === '★') grade = 'ZAYIN';
       if (gradeText === '★★') grade = 'TETH';
       if (gradeText === '★★★') grade = 'HE';
       if (gradeText === '★★★★') grade = 'WAW';
       if (gradeText === '★★★★★') grade = 'ALEPH';
       
       // Passives
       const passives = [];
       $p('#passives h3').each((i, el) => {
          const pName = $p(el).text().trim();
          const pDesc = $p(el).parent().parent().find('p').text().trim();
          passives.push({ name: pName, description: pDesc });
       });
       
       // Skills (Awakening / Corrosion)
       const skills = [];
       $p('#skills [role="tabpanel"]').each((i, el) => {
          const skillPanel = $p(el);
          const skillNameRaw = $p('#skills button[role="tab"]').eq(i).text().trim(); 
          let skillName = skillNameRaw;
          if (skillNameRaw.includes('Awakening')) skillName = 'Awakening';
          if (skillNameRaw.includes('Corrosion')) skillName = 'Corrosion';
          
          const typeAndSin = [];
          skillPanel.find('.border-b > div').first().find('span').each((_, s) => typeAndSin.push($p(s).text().trim()));
          
          const stats = [];
          skillPanel.find('.bg-muted\\/50 p.text-2xl').each((_, s) => stats.push($p(s).text().trim()));
          const coinsRaw = skillPanel.find('.bg-muted\\/50 span.text-sm').text().trim(); 
          
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
             coins: coinsRaw.includes('x') ? parseInt(coinsRaw.split('x')[0]) || 1 : 1, 
             effects: effects
          });
       });
       
       // Keywords
       const keywords = [];
       $p('section#hero a[href*="/guides/keyword/"] span').each((i, el) => {
          keywords.push($p(el).text().trim());
       });
       
       egos.push({
          slug: slug,
          name: name,
          sinner: sinner.toLowerCase().replace(/ /g, '-').replace('ō', 'o'),
          grade: grade,
          keywords: keywords,
          skills: skills,
          passives: passives,
          season: $p('span:contains("Season")').first().text().trim() || 'Standard'
       });
       
     } catch (e) {
       console.log(`Failed to scrape ${slug}:`, e.message);
     }
  }
  
  fs.writeFileSync(path.join(__dirname, '../src/data/egos.json'), JSON.stringify(egos, null, 2));
  console.log('Saved to src/data/egos.json');
}

scrape();
