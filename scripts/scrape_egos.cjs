const puppeteer = require('puppeteer');
const fs = require('fs');

function cleanEffectText(text) {
    if (!text) return text;
    let clean = text;
    clean = clean.replace(/BurnBurnTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Burn");
    clean = clean.replace(/BleedBleedThe next Y time\(s\) this unit tosses an attack skill Coin, take X fixed damage\./g, "Bleed");
    clean = clean.replace(/TremorTremorTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Tremor");
    clean = clean.replace(/PoisePoiseBoost critical hit chance by X\*5% for the next Y hit\(s\)\./g, "Poise");
    clean = clean.replace(/ChargeChargeTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Charge");
    clean = clean.replace(/RuptureRuptureTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Rupture");
    clean = clean.replace(/SinkingSinkingTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Sinking");
    return clean.trim();
}

async function scrapeEgos() {
    const egosPath = 'src/data/egos.json';
    let egos = JSON.parse(fs.readFileSync(egosPath, 'utf8'));
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    for (let i = 0; i < egos.length; i++) {
        let egoData = egos[i];
        let slug = egoData.slug || egoData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        console.log(`[${i+1}/${egos.length}] Scraping EGO ${slug}...`);
        try {
            await page.goto(`https://limbusdeck.com/en/database/egos/${slug}`, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Wait for the specific numbers or SVG to load which indicates skills are rendered
            await page.waitForFunction(() => {
                const els = document.querySelectorAll('div');
                for (const el of els) {
                    if (el.textContent.trim() === 'Base' || el.textContent.trim() === 'Coin') return true;
                }
                return false;
            }, { timeout: 15000 });
            
            const newSkills = await page.evaluate(() => {
                const skills = [];
                
                const baseEls = Array.from(document.querySelectorAll('div')).filter(d => d.textContent.trim() === 'Base');
                const coinEls = Array.from(document.querySelectorAll('div')).filter(d => d.textContent.trim() === 'Coin');
                
                for (let k = 0; k < Math.min(baseEls.length, 2); k++) {
                    const baseEl = baseEls[k];
                    const coinEl = coinEls[k];
                    
                    let name = k === 0 ? 'Awakening' : 'Corrosion';
                    
                    let basePower = 0;
                    if (baseEl && baseEl.parentElement) {
                        const valText = baseEl.parentElement.querySelector('.text-5xl, .text-4xl, .text-3xl')?.textContent.trim() || '0';
                        basePower = parseInt(valText);
                    }
                    
                    let coinPower = 0;
                    let coins = 1;
                    if (coinEl && coinEl.parentElement) {
                        const coinText = coinEl.parentElement.querySelector('.text-lg, .text-xl, .text-2xl')?.textContent.trim() || '0';
                        coinPower = parseInt(coinText.replace('+', ''));
                        if (coinText.includes('-')) coinPower = -Math.abs(coinPower);
                        coins = coinEl.parentElement.querySelectorAll('.rounded-full.border').length || 1;
                    }
                    
                    let container = baseEl;
                    for (let p = 0; p < 4; p++) {
                        if (container && container.parentElement) container = container.parentElement;
                    }
                    const effectEls = Array.from(container.querySelectorAll('ul li, .flex.items-start'));
                    const effects = effectEls.map(el => el.textContent.trim()).filter(t => t && t.length > 3);
                    
                    // We can also extract sin/type by checking color or icons, but we'll default for now
                    skills.push({ name, basePower, coinPower, coins, effects });
                }
                
                return skills;
            });
            
            if (newSkills && newSkills.length > 0) {
                newSkills.forEach(ns => {
                   ns.affinity = ns.affinity || 'Pride';
                   ns.type = ns.type || 'Slash';
                });
                egoData.skills = newSkills;
                console.log(`Success! Extracted ${newSkills.length} skills.`);
            } else {
                console.log(`Failed to extract skills for ${slug}`);
            }
            
        } catch (e) {
            console.log(`Failed to scrape ${slug}`);
        }
        
        if (i % 5 === 0) fs.writeFileSync(egosPath, JSON.stringify(egos, null, 2));
    }
    
    fs.writeFileSync(egosPath, JSON.stringify(egos, null, 2));
    await browser.close();
    console.log('--- EGO_COMPLETED ---');
}

scrapeEgos();
