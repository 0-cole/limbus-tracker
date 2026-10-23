// scripts/syncLimbusDeckComplete.cjs
// Extracts 100% of LimbusDeck's datasets + Limbus Company client status glossary
// and enriches src/data/identities.json, src/data/egos.json, and auxiliary JSONs.

const fs = require('fs');
const path = require('path');

const EXTRACTED_DIR = 'C:/Users/cdbla/.gemini/antigravity/brain/9beca90b-f2da-4618-bde8-a9209f8a8a44/scratch/multiroute_extracted';
const GAME_LOC_DIR = 'C:/Program Files (x86)/Steam/steamapps/common/Limbus Company/LimbusCompany_Data/Assets/Resources_moved/Localize/en';
const DATA_DIR = path.resolve(__dirname, '../src/data');

const SINNER_NAMES = {
  1: 'Yi Sang',
  2: 'Faust',
  3: 'Don Quixote',
  4: 'Ryōshū',
  5: 'Meursault',
  6: 'Hong Lu',
  7: 'Heathcliff',
  8: 'Ishmael',
  9: 'Rodion',
  10: 'Sinclair',
  11: 'Outis',
  12: 'Gregor'
};

const SIN_CAP = {
  wrath: 'Wrath',
  lust: 'Lust',
  sloth: 'Sloth',
  gluttony: 'Gluttony',
  gloom: 'Gloom',
  pride: 'Pride',
  envy: 'Envy'
};

const ATK_CAP = {
  slash: 'Slash',
  pierce: 'Pierce',
  blunt: 'Blunt',
  guard: 'Guard',
  evade: 'Evade',
  counter: 'Counter'
};

const KW_CAP = {
  burn: 'Burn',
  bleed: 'Bleed',
  tremor: 'Tremor',
  rupture: 'Rupture',
  sinking: 'Sinking',
  poise: 'Poise',
  charge: 'Charge'
};

// 1. Extract LimbusDeck IDENTITIES (190) & EGOS (116)
const idChunk = fs.readFileSync(path.join(EXTRACTED_DIR, '3o-8c1-ji611u.js'), 'utf8');
const idMatch = idChunk.match(/let t=(\[\{.*?\}\]);for\(let e of t\)/s);
if (!idMatch) throw new Error('Failed to match IDENTITIES in 3o-8c1-ji611u.js');
const ldIdentities = eval(idMatch[1]);

const egoChunk = fs.readFileSync(path.join(EXTRACTED_DIR, '0fsrk512cua9c.js'), 'utf8');
const egoMatch = egoChunk.match(/let t=(\[\{.*?\}\]);for\(let n of t\)/s);
if (!egoMatch) throw new Error('Failed to match EGOS in 0fsrk512cua9c.js');
const ldEgos = eval(egoMatch[1]);

// Extract JA names from 11k7o81q3jnw-.js (mod 371351)
const c11 = fs.readFileSync(path.join(EXTRACTED_DIR, '11k7o81q3jnw-.js'), 'utf8');
const jaEgoMatch = c11.match(/"JA_EGO_NAMES",0,(\{.*?\}),"JA_IDENTITY_NAMES",0,(\{.*?\})\]/s);
let jaEgoNames = {}, jaIdentityNames = {};
if (jaEgoMatch) {
  jaEgoNames = eval('(' + jaEgoMatch[1] + ')');
  jaIdentityNames = eval('(' + jaEgoMatch[2] + ')');
}
for (const id of ldIdentities) {
  if (jaIdentityNames[id.id]) id.nameJa = jaIdentityNames[id.id];
}
for (const ego of ldEgos) {
  if (jaEgoNames[ego.id]) ego.nameJa = jaEgoNames[ego.id];
}

// 2. Extract RECORDS_INDEX from 3py36gywokrwg.js
const recChunk = fs.readFileSync(path.join(EXTRACTED_DIR, '3py36gywokrwg.js'), 'utf8');
const recMatch = recChunk.match(/"RECORDS_INDEX",0,(\[\{.*?\}\])\]/s);
const recordsIndex = recMatch ? eval(recMatch[1]) : [];
fs.writeFileSync(path.join(DATA_DIR, 'recordsIndex.json'), JSON.stringify(recordsIndex, null, 2));
console.log(`Saved recordsIndex.json (${recordsIndex.length} entries)`);

// 3. Extract IDENTITY_META_TIERS and TRAITS from 3z15am40gf--d.js
const c3z = fs.readFileSync(path.join(EXTRACTED_DIR, '3z15am40gf--d.js'), 'utf8');
const metaTierMatch = c3z.match(/,487481,e=>\{"use strict";let t=\{S:100,A:60,B:30,C:10,D:0\},n=(\{.*?\});e\.s/s);
const identityMetaTiers = metaTierMatch ? eval('(' + metaTierMatch[1] + ')') : {};

const traitsMatch = c3z.match(/,278276,e=>\{"use strict";var t=e\.i\(611830\);let n=(\{.*?\});e\.s\(\["TRAITS"/s);
const traitsDict = traitsMatch ? eval('(' + traitsMatch[1] + ')') : {};
fs.writeFileSync(path.join(DATA_DIR, 'traitsDictionary.json'), JSON.stringify({
  traits: traitsDict,
  metaTiers: identityMetaTiers
}, null, 2));
console.log(`Saved traitsDictionary.json (${Object.keys(traitsDict).length} traits)`);

// 4. Copy Recommended Meta Parties (76 parties)
const recPartiesRaw = fs.readFileSync(path.join(EXTRACTED_DIR, 'api_recommended-parties.html'), 'utf8');
const recParties = JSON.parse(recPartiesRaw);
fs.writeFileSync(path.join(DATA_DIR, 'recommendedParties.json'), JSON.stringify(recParties, null, 2));
console.log(`Saved recommendedParties.json (${recParties.length} parties)`);

// 5. Build Status Effect Dictionary from Limbus Company client files
const STANDARD_STATUS_NAMES = new Set([
  'Burn', 'Bleed', 'Tremor', 'Tremor Burst', 'Rupture', 'Sinking', 'Poise', 'Charge',
  'Attack Power Up', 'Attack Power Down', 'Defense Power Up', 'Defense Power Down',
  'Offense Level Up', 'Offense Level Down', 'Defense Level Up', 'Defense Level Down',
  'Damage Up', 'Damage Down', 'Plus Coin Boost', 'Plus Coin Drop', 'Minus Coin Boost', 'Minus Coin Drop',
  'Slash Power Up', 'Pierce Power Up', 'Blunt Power Up',
  'Slash Power Down', 'Pierce Power Down', 'Blunt Power Down',
  'Slash DMG Up', 'Pierce DMG Up', 'Blunt DMG Up',
  'Slash DMG Down', 'Pierce DMG Down', 'Blunt DMG Down',
  'Slash Fragility', 'Pierce Fragility', 'Blunt Fragility',
  'Slash Protection', 'Pierce Protection', 'Blunt Protection',
  'Wrath Power Up', 'Lust Power Up', 'Sloth Power Up', 'Gluttony Power Up', 'Gloom Power Up', 'Pride Power Up', 'Envy Power Up',
  'Wrath DMG Up', 'Lust DMG Up', 'Sloth DMG Up', 'Gluttony DMG Up', 'Gloom DMG Up', 'Pride DMG Up', 'Envy DMG Up',
  'Wrath Fragility', 'Lust Fragility', 'Sloth Fragility', 'Gluttony Fragility', 'Gloom Fragility', 'Pride Fragility', 'Envy Fragility',
  'Wrath Protection', 'Lust Protection', 'Sloth Protection', 'Gluttony Protection', 'Gloom Protection', 'Pride Protection', 'Envy Protection',
  'Fragile', 'Protection', 'Shield', 'Haste', 'Bind', 'Paralyze', 'Aggro', 'Ammo', 'Poise Count', 'Charge Count', 'SP', 'Stagger', 'Unbreakable Coin', 'AoE Attack',
  'Clash Power Up', 'Clash Power Down', 'Final Power Up', 'Final Power Down', 'Base Power Up', 'Base Power Down', 'Coin Power Up', 'Coin Power Down'
]);

const kwById = new Map();
const kwByName = new Map();

if (fs.existsSync(GAME_LOC_DIR)) {
  const kwFiles = fs.readdirSync(GAME_LOC_DIR).filter(f => f.startsWith('EN_BattleKeywords') && f.endsWith('.json'));
  // Sort so base EN_BattleKeywords.json is loaded first, then specific ones
  kwFiles.sort((a, b) => (a === 'EN_BattleKeywords.json' ? -1 : b === 'EN_BattleKeywords.json' ? 1 : a.localeCompare(b)));
  for (const f of kwFiles) {
    try {
      const list = JSON.parse(fs.readFileSync(path.join(GAME_LOC_DIR, f), 'utf8')).dataList || [];
      for (const item of list) {
        if (!item || !item.id || !item.name || !item.desc) continue;
        kwById.set(item.id, {
          tag: item.id,
          name: item.name,
          desc: item.desc
        });
      }
    } catch (e) {}
  }

  function cleanUnity(str) {
    if (!str) return '';
    return str
      .replace(/<[^>]+>/g, '')
      .replace(/\[([A-Za-z0-9_]+)\]/g, (m, id) => {
        const found = kwById.get(id);
        return found ? found.name.replace(/<[^>]+>/g, '').trim() : m;
      })
      .replace(/\r\n/g, '\n')
      .trim();
  }

  for (const entry of kwById.values()) {
    entry.name = cleanUnity(entry.name);
    entry.desc = cleanUnity(entry.desc);
    const isStandard = STANDARD_STATUS_NAMES.has(entry.name);
    entry.unique = !isStandard;
    if (entry.name.length >= 2 && !kwByName.has(entry.name)) {
      kwByName.set(entry.name, entry);
    }
  }
}

// Ensure core 7 statuses + common statuses always exist in kwByName
const FALLBACK_STATUSES = [
  { tag: 'Combustion', name: 'Burn', desc: 'At the end of the turn, take fixed damage by the effect’s Potency. Then, reduce Count by 1.', unique: false },
  { tag: 'Laceration', name: 'Bleed', desc: 'Whenever flipping a Coin while attacking, take fixed damage by the effect’s Potency. Then, reduce Count by 1.', unique: false },
  { tag: 'Vibration', name: 'Tremor', desc: 'When hit by attacks that trigger Tremor Burst, raise the Stagger Threshold by the effect’s Potency. At the end of the turn, reduce Count by 1.', unique: false },
  { tag: 'Burst', name: 'Rupture', desc: 'When hit by an attack, take fixed damage by the effect’s Potency. Then, reduce Count by 1.', unique: false },
  { tag: 'Sinking', name: 'Sinking', desc: 'When hit by an attack, take fixed SP damage by the effect’s Potency (Enemies without SP take Gloom damage instead). Then, reduce Count by 1.', unique: false },
  { tag: 'Breath', name: 'Poise', desc: 'On hit, gain a (Potency × 5)% chance to land a Critical Hit (+20% damage). At the end of the turn, or on Critical Hit, reduce Count by 1.', unique: false },
  { tag: 'Charge', name: 'Charge', desc: 'Resource consumed by certain skills for additional effects. Max Count: 20. At the end of the turn, reduce Count by 1.', unique: false },
  { tag: 'UnbreakableCoin', name: 'Unbreakable Coin', desc: 'This Coin does not break upon Clash Lose. If an attack Skill has this Coin, attack with this Coin after getting hit.', unique: false }
];
for (const fb of FALLBACK_STATUSES) {
  if (!kwByName.has(fb.name)) kwByName.set(fb.name, fb);
  if (!kwById.has(fb.tag)) kwById.set(fb.tag, fb);
}

// Save compact statusDictionary.json
const statusDictArray = Array.from(kwByName.values());
fs.writeFileSync(path.join(DATA_DIR, 'statusDictionary.json'), JSON.stringify(statusDictArray, null, 2));
console.log(`Saved statusDictionary.json (${statusDictArray.length} unique named statuses)`);

// Helper to extract statuses for an Identity or EGO
const sortedStatusNames = Array.from(kwByName.keys())
  .filter(n => n.length >= 3 && !['Key', 'The', 'And', 'For', 'One', 'Two', 'Max', 'Low', 'Hit'].includes(n))
  .sort((a, b) => b.length - a.length);

function resolveStatusesForUnit(clientSkills, clientPassives, textCorpus) {
  const foundMap = new Map();

  // 1) Exact [Tag] extraction from clientSkills / clientPassives raw desc
  const rawChunks = [];
  if (Array.isArray(clientSkills)) {
    for (const cs of clientSkills) {
      if (cs.desc) rawChunks.push(cs.desc);
      if (Array.isArray(cs.coinlist)) {
        for (const c of cs.coinlist) {
          if (Array.isArray(c.coindescs)) {
            for (const cd of c.coindescs) {
              if (cd.desc) rawChunks.push(cd.desc);
            }
          }
        }
      }
    }
  }
  if (Array.isArray(clientPassives)) {
    for (const cp of clientPassives) {
      if (cp.desc) rawChunks.push(cp.desc);
    }
  }
  const rawCombined = rawChunks.join('\n');
  for (const m of rawCombined.matchAll(/\[([A-Za-z0-9_]+)\]/g)) {
    const tag = m[1];
    const st = kwById.get(tag);
    if (st && !foundMap.has(st.name)) {
      foundMap.set(st.name, { tag: st.tag, name: st.name, desc: st.desc, unique: st.unique });
    }
  }

  // 2) Match English status names in textCorpus
  if (textCorpus) {
    for (const name of sortedStatusNames) {
      if (foundMap.has(name)) continue;
      if (textCorpus.includes(name)) {
        // Verify word boundary
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`);
        if (re.test(textCorpus)) {
          const st = kwByName.get(name);
          if (st) {
            foundMap.set(st.name, { tag: st.tag, name: st.name, desc: st.desc, unique: st.unique });
          }
        }
      }
    }
  }

  // Sort: unique first, then alphabetical
  return Array.from(foundMap.values()).sort((a, b) => Number(b.unique) - Number(a.unique) || a.name.localeCompare(b.name));
}

// 6. Compute Display Tier map (matching LimbusDeck mod 259916)
const META_TIER_SCORES = { S: 100, A: 60, B: 30, C: 10, D: 0 };
// Map ldIdentities by slug and by normalized name
const ldIdBySlug = new Map();
const ldIdByName = new Map();
for (const ld of ldIdentities) {
  ldIdBySlug.set(ld.slug, ld);
  ldIdByName.set(ld.nameEn.toLowerCase().trim(), ld);
}

// Load existing src/data/identities.json
const localIdsPath = path.join(DATA_DIR, 'identities.json');
const localIds = JSON.parse(fs.readFileSync(localIdsPath, 'utf8'));
const matchedSlugs = new Set();

function convertLdIdentityToTrackerFormat(ld, existing = {}) {
  const sinnerName = existing.sinner || SINNER_NAMES[ld.sinnerId] || 'Yi Sang';
  const hpMax = Math.floor(ld.hpBase + ld.hpGrowth * (60 - 1));
  const textCorpus = [
    ...(ld.skills || []).flatMap(s => [
      ...(s.coinEffects || []),
      ...(s.variants || []).flatMap(v => v.coinEffects || [])
    ]),
    ...(ld.defenseSkills || []).flatMap(d => [
      ...(d.coinEffects || []),
      ...(d.variants || []).flatMap(v => v.coinEffects || [])
    ]),
    ...(ld.passives || []).map(p => p.descriptionEn || '')
  ].join('\n');

  const statuses = resolveStatusesForUnit(existing.clientSkills, existing.clientPassives, textCorpus);

  // Build backward-compatible skills array while also preserving full ldSkills
  const compatSkills = (ld.skills || []).map(s => ({
    name: s.nameEn || s.nameKo,
    nameKo: s.nameKo,
    affinity: SIN_CAP[s.sin] || s.sin || 'None',
    sin: s.sin,
    type: ATK_CAP[s.attackType] || s.attackType || 'Slash',
    attackType: s.attackType,
    basePower: s.basePower,
    coinPower: s.coinPower,
    coins: s.coinCount,
    coinCount: s.coinCount,
    offenseLevel: s.offenseLevel,
    atkWeight: s.atkWeight || 1,
    targetCount: s.targetCount,
    coinEffects: s.coinEffects || [],
    coinEffectsKo: s.coinEffectsKo || [],
    keywords: s.keywords || [],
    variants: s.variants || [],
    effects: (s.coinEffects || []).filter(Boolean)
  }));

  const firstDef = (ld.defenseSkills || [])[0];
  const compatDefense = firstDef ? {
    name: firstDef.nameEn || firstDef.nameKo,
    nameKo: firstDef.nameKo,
    affinity: SIN_CAP[firstDef.sin] || firstDef.sin || 'None',
    sin: firstDef.sin,
    type: ATK_CAP[firstDef.attackType] || firstDef.attackType || 'Guard',
    attackType: firstDef.attackType,
    basePower: firstDef.basePower,
    coinPower: firstDef.coinPower,
    coins: firstDef.coinCount,
    coinCount: firstDef.coinCount,
    offenseLevel: firstDef.offenseLevel,
    coinEffects: firstDef.coinEffects || [],
    coinEffectsKo: firstDef.coinEffectsKo || [],
    keywords: firstDef.keywords || [],
    variants: firstDef.variants || [],
    effects: (firstDef.coinEffects || []).filter(Boolean)
  } : existing.defense || null;

  const compatPassives = (ld.passives || []).map(p => ({
    name: p.nameEn || p.nameKo,
    nameKo: p.nameKo,
    type: p.type || 'combat',
    affinity: SIN_CAP[p.sin] || p.sin || 'None',
    sin: p.sin,
    requiredResonance: p.requiredResonance || 0,
    conditionType: p.conditionType || 'owned',
    extraConditions: p.extraConditions || [],
    req: p.sin && p.requiredResonance ? `${p.requiredResonance} ${p.conditionType === 'resonance' ? 'Reson' : 'Owned'}` : 'None',
    descriptionEn: p.descriptionEn || '',
    descriptionKo: p.descriptionKo || '',
    structuredEffects: p.effects || [],
    effects: [p.descriptionEn || p.descriptionKo || ''].filter(Boolean)
  }));

  const metaTier = identityMetaTiers[ld.id] || (ld.rarity === 3 ? 'B' : 'D');

  return {
    ...existing,
    name: existing.name || ld.nameEn,
    nameEn: ld.nameEn,
    nameKo: ld.nameKo,
    nameJa: ld.nameJa || existing.nameJa,
    sinner: sinnerName,
    sinnerId: ld.sinnerId,
    ldId: ld.id,
    slug: ld.slug,
    rarity: ld.rarity,
    season: ld.isWalpurgis ? null : ld.season,
    ldSeason: ld.season,
    isStandard: !!ld.isStandard,
    isWalpurgis: !!ld.isWalpurgis,
    releaseDate: ld.releaseDate,
    hp: hpMax,
    hpBase: ld.hpBase,
    hpGrowth: ld.hpGrowth,
    speed: `${ld.minSpeed}~${ld.maxSpeed}`,
    minSpeed: ld.minSpeed,
    maxSpeed: ld.maxSpeed,
    defenseLevel: ld.defenseLevel ?? 0,
    resistances: ld.resistances || { slash: 'normal', pierce: 'normal', blunt: 'normal' },
    staggerThresholds: ld.staggerThresholds || [],
    skills: compatSkills,
    ldSkills: ld.skills || [],
    defense: compatDefense,
    ldDefenseSkills: ld.defenseSkills || [],
    passives: compatPassives,
    ldPassives: ld.passives || [],
    keywords: (ld.keywords || []).map(k => KW_CAP[k] || k),
    ldKeywords: ld.keywords || [],
    traits: ld.traits || existing.traits || [],
    metaTier,
    statuses
  };
}

const enrichedIdentities = localIds.map(item => {
  const ld = ldIdBySlug.get(item.slug) || ldIdByName.get((item.name || '').toLowerCase().trim());
  if (ld) {
    matchedSlugs.add(ld.slug);
    return convertLdIdentityToTrackerFormat(ld, item);
  }
  // Safe fallback for any non-LD / upcoming preview identity
  return {
    ...item,
    nameEn: item.nameEn || item.name,
    sinnerId: item.sinnerId || 5,
    isDummy: true,
    hpBase: item.hpBase || 70,
    hpGrowth: item.hpGrowth || 2.0,
    minSpeed: item.minSpeed || 3,
    maxSpeed: item.maxSpeed || 7,
    defenseLevel: typeof item.defense === 'number' ? 0 : (item.defenseLevel || 0),
    defense: typeof item.defense === 'object' ? item.defense : null,
    resistances: item.resistances || { slash: 'normal', pierce: 'normal', blunt: 'normal' },
    staggerThresholds: item.staggerThresholds || [65, 35],
    ldSkills: item.ldSkills || [],
    ldDefenseSkills: item.ldDefenseSkills || [],
    ldPassives: item.ldPassives || [],
    statuses: item.statuses || []
  };
});

for (const ld of ldIdentities) {
  if (!matchedSlugs.has(ld.slug)) {
    console.log(`[Adding missing LD Identity] ${ld.nameEn} (${ld.slug})`);
    enrichedIdentities.push(convertLdIdentityToTrackerFormat(ld, {}));
  }
}

fs.writeFileSync(localIdsPath, JSON.stringify(enrichedIdentities, null, 2));
console.log(`Updated src/data/identities.json (${enrichedIdentities.length} total identities, ${matchedSlugs.size} matched + ${ldIdentities.length - matchedSlugs.size} added)`);

// 7. Enrich src/data/egos.json with all 116 LimbusDeck EGOs
const ldEgoBySlug = new Map();
const ldEgoByName = new Map();
for (const ego of ldEgos) {
  ldEgoBySlug.set(ego.slug, ego);
  ldEgoByName.set(ego.nameEn.toLowerCase().trim(), ego);
}

const localEgosPath = path.join(DATA_DIR, 'egos.json');
const localEgos = JSON.parse(fs.readFileSync(localEgosPath, 'utf8'));
const matchedEgoSlugs = new Set();

function convertLdEgoToTrackerFormat(ld, existing = {}) {
  const sinnerName = existing.sinner || SINNER_NAMES[ld.sinnerId] || 'Yi Sang';
  const textCorpus = [
    ...(ld.skills || []).flatMap(s => s.coinEffects || []),
    ...(ld.corrosionSkills || []).flatMap(s => s.coinEffects || []),
    ld.passive?.description || ''
  ].join('\n');

  const statuses = resolveStatusesForUnit(existing.clientSkills, existing.clientPassives, textCorpus);

  const costObj = {};
  for (const c of (ld.costs || [])) {
    const capSin = SIN_CAP[c.sin] || c.sin;
    costObj[capSin] = c.amount;
  }

  const allSkills = [
    ...(ld.skills || []).map(s => ({
      name: s.nameEn || s.nameKo,
      nameKo: s.nameKo,
      isCorrosion: false,
      affinity: SIN_CAP[s.sin] || s.sin || 'Wrath',
      sin: s.sin,
      type: ATK_CAP[s.attackType] || s.attackType || 'Slash',
      attackType: s.attackType,
      basePower: s.basePower,
      coinPower: s.coinPower,
      coins: s.coinCount,
      coinCount: s.coinCount,
      coinEffects: s.coinEffects || [],
      coinEffectsKo: s.coinEffectsKo || [],
      keywords: s.keywords || [],
      effects: (s.coinEffects || []).filter(Boolean)
    })),
    ...(ld.corrosionSkills || []).map(s => ({
      name: `Corrosion: ${s.nameEn || s.nameKo}`,
      rawName: s.nameEn || s.nameKo,
      nameKo: s.nameKo,
      isCorrosion: true,
      affinity: SIN_CAP[s.sin] || s.sin || 'Wrath',
      sin: s.sin,
      type: ATK_CAP[s.attackType] || s.attackType || 'Slash',
      attackType: s.attackType,
      basePower: s.basePower,
      coinPower: s.coinPower,
      coins: s.coinCount,
      coinCount: s.coinCount,
      coinEffects: s.coinEffects || [],
      coinEffectsKo: s.coinEffectsKo || [],
      keywords: s.keywords || [],
      effects: (s.coinEffects || []).filter(Boolean)
    }))
  ];

  const kws = new Set();
  for (const s of [...(ld.skills || []), ...(ld.corrosionSkills || [])]) {
    for (const k of (s.keywords || [])) {
      if (k.keyword) kws.add(KW_CAP[k.keyword] || k.keyword);
    }
  }

  return {
    ...existing,
    name: existing.name || ld.nameEn,
    nameEn: ld.nameEn,
    nameKo: ld.nameKo,
    nameJa: ld.nameJa || existing.nameJa,
    sinner: sinnerName,
    sinnerId: ld.sinnerId,
    ldId: ld.id,
    slug: ld.slug,
    grade: ld.grade,
    season: ld.isWalpurgis ? null : ld.season,
    ldSeason: ld.season,
    isStandard: !!ld.isStandard,
    isWalpurgis: !!ld.isWalpurgis,
    releaseDate: ld.releaseDate,
    affinity: SIN_CAP[ld.sin] || ld.sin,
    sin: ld.sin,
    attackType: ld.attackType,
    sanityCost: ld.sanity,
    sanity: ld.sanity,
    cost: Object.keys(costObj).length > 0 ? costObj : existing.cost,
    costs: ld.costs || [],
    resistances: ld.resistances || {},
    skills: allSkills.length > 0 ? allSkills : (existing.skills || []),
    ldSkills: ld.skills || [],
    ldCorrosionSkills: ld.corrosionSkills || [],
    ldPassive: ld.passive || null,
    passives: ld.passive && (ld.passive.name || ld.passive.description)
      ? [{ name: ld.passive.name || 'E.G.O Passive', nameKo: ld.passive.nameKo, description: ld.passive.description, descriptionKo: ld.passive.descriptionKo, effects: [ld.passive.description] }]
      : (existing.passives || []),
    keywords: Array.from(kws),
    statuses
  };
}

const enrichedEgos = localEgos.map(item => {
  const ld = ldEgoBySlug.get(item.slug) || ldEgoByName.get((item.name || '').toLowerCase().trim());
  if (ld) {
    matchedEgoSlugs.add(ld.slug);
    return convertLdEgoToTrackerFormat(ld, item);
  }
  return item;
});

for (const ld of ldEgos) {
  if (!matchedEgoSlugs.has(ld.slug)) {
    console.log(`[Adding missing LD E.G.O] ${ld.nameEn} (${ld.slug})`);
    enrichedEgos.push(convertLdEgoToTrackerFormat(ld, {}));
  }
}

fs.writeFileSync(localEgosPath, JSON.stringify(enrichedEgos, null, 2));
console.log(`Updated src/data/egos.json (${enrichedEgos.length} total EGOs, ${matchedEgoSlugs.size} matched + ${ldEgos.length - matchedEgoSlugs.size} added)`);
