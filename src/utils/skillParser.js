export function cleanEffectText(text) {
    if (!text) return text;
    let clean = text;
    
    // Completely obliterate wiki tooltips based on robust patterns
    clean = clean.replace(/ChargeChargeResource used by certain skills for additional effects\. Its Count can go up to 20\. Count lowers by 1 at the end of each turn\.( Count to gain Final Power \+2)?/g, "Charge");
    clean = clean.replace(/Charge BarrierCharge Barrier- Gain \(X \* 3\) Shield\.- Lose 1 Charge Barrier # after losing \(X \* 3\) Shield\.- \(If the unit is a W Corp\. employee, ALL Charge Barrier effects activate at \(X \* 5\) instead of at \(X \* 3\)\)- Turn End: Gain a Charge Count for each Charge Barrier #, and Charge Barrier and Shield Gained from Charge Barrier expire completely next turn equal to ChargeChargeResource used by certain skills for additional effects\. Its Count can go up to 20\. Count lowers by 1 at the end of each turn\. Potency on self \(once per turn; max 5\)/g, "Charge Barrier");
    clean = clean.replace(/Dimensional RiftDimensional RiftTurn End: Gain \+X Rupture Count/g, "Dimensional Rift");
    clean = clean.replace(/Nerve Strike - Don QuixoteNerve Strike - Don Quixote- Max Stack: 3 - The unit that inflicted this Nerve Strike gains the following effects based on target's \(or targeted Part's\) Nerve Strike Stack · 1x Stack: Gain Clash Power \+1 · 2x Stack: Gain Base Power \+1 · 3x Stack: Gain Clash Power \+1 and Base Power \+1 - Expires if the unit that inflicted it inflicts this effect against a different target \(or a different Part\) - Replaced when another unit inflicts Nerve Strike \(Stacks are preserved\)/g, "Nerve Strike - Don Quixote");
    clean = clean.replace(/Nerve Strike - Hong LuNerve Strike - Hong Lu- Max Stack: 3 - The unit that inflicted this Nerve Strike gains the following effects based on target's \(or targeted Part's\) Nerve Strike Stack · 1x Stack: Gain Clash Power \+1 · 2x Stack: Gain Base Power \+1 · 3x Stack: Gain Clash Power \+1 and Base Power \+1 - Expires if the unit that inflicted it inflicts this effect against a different target \(or a different Part\) - Replaced when another unit inflicts Nerve Strike \(Stacks are preserved\)/g, "Nerve Strike - Hong Lu");
    
    clean = clean.replace(/BurnBurnTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Burn");
    clean = clean.replace(/BleedBleedTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Bleed");
    clean = clean.replace(/TremorTremorTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Tremor");
    clean = clean.replace(/PoisePoiseBoost critical hit chance by X\*5% for the next Y hit\(s\)\./g, "Poise");
    clean = clean.replace(/ChargeChargeTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Charge");
    clean = clean.replace(/RuptureRuptureTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Rupture");
    clean = clean.replace(/SinkingSinkingTurn End: Take X fixed damage\. Lasts Y turn\(s\)\./g, "Sinking");

    clean = clean.replace(/Defense Level DownDefense Level DownDefense Level -X for this turn\./g, "Defense Level Down");
    clean = clean.replace(/Defense Level UpDefense Level UpDefense Level \+X for this turn\./g, "Defense Level Up");

    // Remove "Atk Weight" headers that scrape from wiki
    clean = clean.replace(/^.*?\d+ \(\d+\+\d+\) Atk Weight ⯀(?:Amt\. x\d+)?\s*/, "");
    clean = clean.replace(/^.*?\d+ \(\d+\+\d+\) Atk Weight ⯀\s*/, "");
    
    return clean.trim();
}

export function parseEffectsIntoTriggerGroups(effects) {
    const groups = [];
    let currentGroup = { trigger: 'Passive', effects: [] };
    
    for (const eff of effects) {
        const cleanEff = cleanEffectText(eff);
        
        // Find trigger like [On Use], [On Hit], [Clash Win]
        const match = cleanEff.match(/^\[(.*?)\] (.*)$/);
        
        if (match) {
            const trigger = match[1];
            const text = match[2];
            groups.push({ trigger, text });
        } else {
            // Check if it has a prefix inside the string but not at the very start
            // Usually scraped data has them separated cleanly, but just in case
            if (cleanEff) {
                groups.push({ trigger: 'Passive', text: cleanEff });
            }
        }
    }
    
    return groups;
}

export function extractKeywordsFromEffects(effects) {
    const kws = { Burn: 0, Bleed: 0, Tremor: 0, Rupture: 0, Sinking: 0, Poise: 0, Charge: 0 };
    const effectStr = (effects || []).map(cleanEffectText).join(' ');
    
    Object.keys(kws).forEach(k => {
        kws[k] = (effectStr.match(new RegExp(k, 'gi')) || []).length;
    });
    
    return Object.entries(kws).filter(([k,v]) => v > 0).sort((a,b) => b[1] - a[1]);
}

export function getSkillTriggerColor(trigger) {
    if (trigger.includes('On Use')) return '#3b82f6'; // Blue
    if (trigger.includes('On Hit')) return '#ef4444'; // Red
    if (trigger.includes('Clash Win')) return '#eab308'; // Yellow
    if (trigger.includes('On Crit')) return '#22c55e'; // Green
    if (trigger.includes('Reuse') || trigger.includes('Fail')) return '#a855f7'; // Purple
    if (trigger.includes('Combat Start') || trigger.includes('Turn End')) return '#f97316'; // Orange
    return '#737373'; // Default Gray
}
