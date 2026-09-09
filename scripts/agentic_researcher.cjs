const puppeteer = require('puppeteer');
const fs = require('fs');

function cleanEffectText(text) {
    if (!text) return text;
    let clean = text;
    clean = clean.replace(/ChargeChargeResource used by certain skills for additional effects\. Its Count can go up to 20\. Count lowers by 1 at the end of each turn\.( Count to gain Final Power \+2)?/g, "Charge");
    clean = clean.replace(/Charge BarrierCharge Barrier- Gain \(X \* 3\) Shield\.- Lose 1 Charge Barrier # after losing \(X \* 3\) Shield\.- \(If the unit is a W Corp\. employee, ALL Charge Barrier effects activate at \(X \* 5\) instead of at \(X \* 3\)\)- Turn End: Gain a Charge Count for each Charge Barrier #, and Charge Barrier and Shield Gained from Charge Barrier expire completely next turn equal to ChargeChargeResource used by certain skills for additional effects\. Its Count can go up to 20\. Count lowers by 1 at the end of each turn\. Potency on self \(once per turn; max 5\)/g, "Charge Barrier");
    clean = clean.replace(/Dimensional RiftDimensional RiftTurn End: Gain \+X Rupture Count/g, "Dimensional Rift");
    clean = clean.replace(/Nerve Strike - Don QuixoteNerve Strike - Don Quixote- Max Stack: 3 - The unit that inflicted this Nerve Strike gains the following effects based on target's \(or targeted Part's\) Nerve Strike Stack  1x Stack: Gain Clash Power \+1  2x Stack: Gain Base Power \+1  3x Stack: Gain Clash Power \+1 and Base Power \+1 - Expires if the unit that inflicted it inflicts this effect against a different target \(or a different Part\) - Replaced when another unit inflicts Nerve Strike \(Stacks are preserved\)/g, "Nerve Strike - Don Quixote");
    clean = clean.replace(/Nerve Strike - Hong LuNerve Strike - Hong Lu- Max Stack: 3 - The unit that inflicted this Nerve Strike gains the following effects based on target's \(or targeted Part's\) Nerve Strike Stack  1x Stack: Gain Clash Power \+1  2x Stack: Gain Base Power \+1  3x Stack: Gain Clash Power \+1 and Base Power \+1 - Expires if the unit that inflicted it inflicts this effect against a different target \(or a different Part\) - Replaced when another unit inflicts Nerve Strike \(Stacks are preserved\)/g, "Nerve Strike - Hong Lu");
    
    clean = clean.replace(/BurnBurnTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Burn");
    clean = clean.replace(/BleedBleedThe next Y time\(s\) this unit tosses an attack skill Coin, take X fixed damage\./g, "Bleed");
    clean = clean.replace(/TremorTremorTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Tremor");
    clean = clean.replace(/PoisePoiseBoost critical hit chance by X\*5% for the next Y hit\(s\)\./g, "Poise");
    clean = clean.replace(/ChargeChargeTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Charge");
    clean = clean.replace(/RuptureRuptureTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Rupture");
    clean = clean.replace(/SinkingSinkingTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Sinking");

    clean = clean.replace(/Defense Level DownDefense Level DownDefense Level -X for this turn\./g, "Defense Level Down");
    clean = clean.replace(/Defense Level UpDefense Level UpDefense Level \+X for this turn\./g, "Defense Level Up");

    // General pattern to strip Wiki keywords: WordWordDescription... 
    // This is aggressive but it cleans up what we miss
    // Example: "BleedBleedThe next Y time(s) this unit tosses an attack skill Coin, take X fixed damage."
    // Let's use a simpler approach: removing the known tooltips, or replacing standard Limbus patterns.
    
    return clean.trim();
}

async function scrapeIdentities() {
    const idsPath = 'src/data/identities.json';
    const egosPath = 'src/data/egos.json';
    
    let identities = JSON.parse(fs.readFileSync(idsPath, 'utf8'));
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    for (let i = 0; i < identities.length; i++) {
        let idData = identities[i];
        
        // Skip ones we already fixed manually or if they look perfectly fine
        // wait, user said ALL ids. Let's do them all!
        let slug = idData.slug || idData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        console.log(`[${i+1}/${identities.length}] Scraping ${slug}...`);
        try {
            await page.goto(`https://limbusdeck.com/en/database/identities/${slug}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
            
            const stats = await page.evaluate(() => {
                const els = Array.from(document.querySelectorAll('div'));
                let hp = '184', speed = '3~7';
                for (const el of els) {
                    if (el.textContent === 'HP' && el.nextElementSibling) hp = el.nextElementSibling.textContent.trim();
                    if (el.textContent === 'Speed' && el.nextElementSibling) speed = el.nextElementSibling.textContent.trim();
                }
                return { hp, speed };
            });
            idData.hp = stats.hp;
            idData.speed = stats.speed;
            
            const tabButtons = await page.$$('[role="tab"]');
            const newSkills = [];
            for (let j = 0; j < tabButtons.length; j++) {
                await tabButtons[j].click();
                await new Promise(r => setTimeout(r, 100));
                
                const skillInfo = await page.evaluate(() => {
                    const activePanel = document.querySelector('[role="tabpanel"][data-state="active"]');
                    if (!activePanel) return null;
                    
                    const nameRaw = document.querySelector('[role="tab"][data-state="active"]').textContent;
                    const name = nameRaw.replace(/^S[1-4]/, '').trim();
                    const isDef = nameRaw.includes('Guard') || nameRaw.includes('Evade') || nameRaw.includes('Counter');
                    
                    const baseEl = Array.from(activePanel.querySelectorAll('div')).find(d => d.textContent.trim() === 'Base');
                    const coinEl = Array.from(activePanel.querySelectorAll('div')).find(d => d.textContent.trim() === 'Coin');
                    
                    let basePower = 0, coinPower = 0, coins = 1;
                    if (baseEl) {
                        basePower = parseInt(baseEl.parentElement.querySelector('.text-5xl, .text-4xl, .text-3xl').textContent.trim() || '0');
                    }
                    if (coinEl) {
                        const coinText = coinEl.parentElement.querySelector('.text-lg, .text-xl, .text-2xl').textContent.trim();
                        coinPower = parseInt(coinText.replace('+', '') || '0');
                        if (coinText.includes('-')) coinPower = -coinPower;
                        coins = coinEl.parentElement.querySelectorAll('.rounded-full.border').length || 1;
                    }
                    
                    const effectEls = Array.from(activePanel.querySelectorAll('ul li, .flex.items-start'));
                    const effects = effectEls.map(el => el.textContent.trim()).filter(t => t);
                    
                    let affinity = 'Pride';
                    let type = 'Slash';
                    const topRow = Array.from(activePanel.querySelectorAll('.border-b > div')).map(d => d.textContent.trim());
                    // Try to guess affinity/type from top row badges
                    const allText = activePanel.textContent;
                    const sinList = ['Wrath', 'Lust', 'Sloth', 'Gluttony', 'Gloom', 'Pride', 'Envy'];
                    const typeList = ['Slash', 'Pierce', 'Blunt'];
                    for (const s of sinList) { if (allText.includes(s)) affinity = s; }
                    for (const t of typeList) { if (allText.includes(t)) type = t; }
                    if (isDef) {
                        if (allText.includes('Guard')) type = 'Guard';
                        if (allText.includes('Evade')) type = 'Evade';
                        if (allText.includes('Counter')) type = 'Counter';
                    }
                    
                    return { name, basePower, coinPower, coins, effects, isDef, affinity, type };
                });
                
                if (skillInfo) {
                    newSkills.push({
                        name: skillInfo.name,
                        affinity: skillInfo.affinity,
                        type: skillInfo.type,
                        basePower: skillInfo.basePower,
                        coinPower: skillInfo.coinPower,
                        coins: skillInfo.coins,
                        effects: skillInfo.effects.map(cleanEffectText)
                    });
                }
            }
            
            // Re-merge with our local data to keep things clean but replace missing skills
            // we don't overwrite if our manual edits are better
            if (idData.name === 'Index Nursefather Yi Sang' || idData.name === 'LCD OSIR Team Ishmael') {
                // Keep manual edits
            } else {
                if (newSkills.length > 0) idData.skills = newSkills;
            }
            
        } catch (e) {
            console.log(`Failed to scrape ${slug}`);
        }
        
        if (i % 5 === 0) fs.writeFileSync(idsPath, JSON.stringify(identities, null, 2));
    }
    
    fs.writeFileSync(idsPath, JSON.stringify(identities, null, 2));
    await browser.close();
    console.log('--- GOAL_COMPLETED ---');
}

scrapeIdentities();
