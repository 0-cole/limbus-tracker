const fs = require('fs');
const path = require('path');

const idsPath = path.join(__dirname, '../src/data/identities.json');
const egosPath = path.join(__dirname, '../src/data/egos.json');

const ids = JSON.parse(fs.readFileSync(idsPath, 'utf8'));
const egos = JSON.parse(fs.readFileSync(egosPath, 'utf8'));

// Extract true sinner from name
function extractSinner(name) {
    const sinners = ['yi-sang', 'faust', 'don-quixote', 'ryoshu', 'ryōshū', 'meursault', 'hong-lu', 'heathcliff', 'ishmael', 'rodion', 'sinclair', 'outis', 'gregor'];
    const lowerName = name.toLowerCase();
    
    // Check specific edge cases or special formatting
    for (const sinner of sinners) {
        // Special replacement for Ryōshū
        const checkSinner = sinner === 'ryōshū' ? 'ryoshu' : sinner;
        if (lowerName.includes(sinner.replace('-', ' '))) {
            return checkSinner;
        }
    }
    return "unknown";
}

function cleanEffectText(text) {
    let clean = text;
    // Strip tooltip duplications
    clean = clean.replace(/BurnBurnTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Burn");
    clean = clean.replace(/BleedBleedTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Bleed");
    clean = clean.replace(/TremorTremorTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Tremor");
    clean = clean.replace(/PoisePoiseBoost critical hit chance by X\*5% for the next Y hit\(s\)\./g, "Poise");
    clean = clean.replace(/ChargeChargeTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Charge"); // Approximate
    clean = clean.replace(/RuptureRuptureTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Rupture");
    clean = clean.replace(/SinkingSinkingTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Sinking");
    
    // Strip Nerve strike
    clean = clean.replace(/Nerve Strike - Hong LuNerve Strike - Hong Lu- Max Stack: 3 - The unit that inflicted this Nerve Strike gains the following effects based on target's \(or targeted Part's\) Nerve Strike Stack · 1x Stack: Gain Clash Power \+1 · 2x Stack: Gain Base Power \+1 · 3x Stack: Gain Clash Power \+1 and Base Power \+1 - Expires if the unit that inflicted it inflicts this effect against a different target \(or a different Part\) - Replaced when another unit inflicts Nerve Strike \(Stacks are preserved\)/g, "Nerve Strike - Hong Lu");

    // Defense Level Down
    clean = clean.replace(/Defense Level DownDefense Level DownDefense Level -X for this turn\./g, "Defense Level Down");

    // Strip leading stat headers like "Fa Jin 62 (60+2) Atk Weight ⯀Amt. x3 "
    clean = clean.replace(/^.*?\d+ \(\d+\+\d+\) Atk Weight ⯀(?:Amt\. x\d+)?\s*/, "");
    clean = clean.replace(/^.*?\d+ \(\d+\+\d+\) Atk Weight ⯀\s*/, "");
    
    return clean.trim();
}

// Fix Identities
for (let id of ids) {
    id.sinner = extractSinner(id.name);
    
    // Backfill unknown affinities from uptie 4
    if (id.skills) {
        for (let i = 0; i < id.skills.length; i++) {
            let baseSkill = id.skills[i];
            
            // Try to find the same skill in uptie 4
            let u4skills = id.upties && id.upties['4'] ? id.upties['4'] : [];
            let u4skill = u4skills[i];
            
            if (baseSkill.affinity === 'Unknown' && u4skill && u4skill.affinity !== 'Unknown') {
                baseSkill.affinity = u4skill.affinity;
            }
            if (baseSkill.type === 'Unknown' && u4skill && u4skill.type !== 'Unknown') {
                baseSkill.type = u4skill.type;
            }
            
            // Clean effects
            if (baseSkill.effects) {
                baseSkill.effects = baseSkill.effects.map(cleanEffectText);
            }
        }
    }
    
    // Clean effects in all upties
    if (id.upties) {
        for (let tier in id.upties) {
            for (let skill of id.upties[tier]) {
                if (skill.effects) {
                    skill.effects = skill.effects.map(cleanEffectText);
                }
            }
        }
    }
}

// Fix EGOs
for (let ego of egos) {
    ego.sinner = extractSinner(ego.name);
}

fs.writeFileSync(idsPath, JSON.stringify(ids, null, 2));
fs.writeFileSync(egosPath, JSON.stringify(egos, null, 2));

console.log('Fixed identities and egos!');
