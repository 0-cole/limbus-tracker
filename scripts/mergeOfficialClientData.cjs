// scripts/mergeOfficialClientData.cjs
const fs = require('fs');
const path = require('path');

const GAME_DIR = 'C:/Program Files (x86)/Steam/steamapps/common/Limbus Company/LimbusCompany_Data/Assets/Resources_moved/Localize/en';
const localIdentitiesPath = path.resolve(__dirname, '../src/data/identities.json');
const localIdentities = JSON.parse(fs.readFileSync(localIdentitiesPath, 'utf8'));

const personalitiesRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Personalities.json'), 'utf8')).dataList;
const passivesRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Passives.json'), 'utf8')).dataList;

// Load all skills
const skillMap = new Map();
for (let i = 1; i <= 12; i++) {
  const pad = String(i).padStart(2, '0');
  const filePath = path.join(GAME_DIR, `EN_Skills_personality-${pad}.json`);
  if (fs.existsSync(filePath)) {
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8')).dataList;
    for (const skill of fileData) {
      skillMap.set(Number(skill.id), skill);
    }
  }
}

const passiveMap = new Map();
for (const p of passivesRaw) {
  passiveMap.set(Number(p.id), p);
}

function cleanStr(s) {
  if (!s) return '';
  return s.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').replace(/::\s*/g, '::').trim();
}

function normalizeKey(s) {
  return cleanStr(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

let enrichedCount = 0;
let newlyAddedCount = 0;

// Enrich existing identities
for (const localId of localIdentities) {
  const localKey = normalizeKey(localId.name);
  
  // Find matching client personality
  const match = personalitiesRaw.find(p => {
    const clientKey = normalizeKey(`${p.title} ${p.name}`);
    return clientKey === localKey;
  });

  if (match) {
    localId.gameId = match.id;
    localId.clientTitle = cleanStr(match.title);
    localId.clientName = cleanStr(match.name);
    
    // Find skills for this personality ID (e.g. 10101 -> 1010101, 1010102...)
    const idPrefix = String(match.id);
    const matchedSkills = [];
    for (const [sId, sData] of skillMap.entries()) {
      if (String(sId).startsWith(idPrefix)) {
        const topLevel = sData.levelList?.[sData.levelList.length - 1] || {};
        matchedSkills.push({
          skillId: sId,
          name: topLevel.name || '',
          desc: topLevel.desc || '',
          coinlist: topLevel.coinlist || []
        });
      }
    }
    
    if (matchedSkills.length > 0) {
      localId.clientSkills = matchedSkills;
      enrichedCount++;
    }

    // Find passives (e.g. 1010101, 1010102)
    const matchedPassives = [];
    for (const [pId, pData] of passiveMap.entries()) {
      if (String(pId).startsWith(idPrefix)) {
        matchedPassives.push({
          passiveId: pId,
          name: pData.name || '',
          desc: pData.desc || ''
        });
      }
    }
    if (matchedPassives.length > 0) {
      localId.clientPassives = matchedPassives;
    }
  }
}

// Check for unadded identities in game client
for (const p of personalitiesRaw) {
  if (p.id === 9999) continue; // Skip NPC Vergilius
  const clientKey = normalizeKey(`${p.title} ${p.name}`);
  const exists = localIdentities.some(l => normalizeKey(l.name) === clientKey || l.gameId === p.id);
  
  if (!exists) {
    const cleanTitle = cleanStr(p.title);
    const cleanSinner = cleanStr(p.name);
    const fullName = `${cleanTitle} ${cleanSinner}`;
    const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const idPrefix = String(p.id);
    const matchedSkills = [];
    for (const [sId, sData] of skillMap.entries()) {
      if (String(sId).startsWith(idPrefix)) {
        const topLevel = sData.levelList?.[sData.levelList.length - 1] || {};
        matchedSkills.push({
          skillId: sId,
          name: topLevel.name || '',
          desc: topLevel.desc || '',
          coinlist: topLevel.coinlist || []
        });
      }
    }

    const matchedPassives = [];
    for (const [pId, pData] of passiveMap.entries()) {
      if (String(pId).startsWith(idPrefix)) {
        matchedPassives.push({
          passiveId: pId,
          name: pData.name || '',
          desc: pData.desc || ''
        });
      }
    }

    const newObj = {
      name: fullName,
      sinner: cleanSinner,
      rarity: 3,
      season: 8,
      gameId: p.id,
      clientTitle: cleanTitle,
      clientName: cleanSinner,
      hp: 168,
      speed: "3~7",
      defense: 45,
      slug: slug,
      passives: matchedPassives.map(mp => ({
        name: mp.name,
        affinity: "Pride",
        req: "Owned",
        effects: [mp.desc]
      })),
      skills: matchedSkills.slice(0, 3).map((ms, idx) => ({
        name: ms.name,
        affinity: idx === 0 ? "Pride" : idx === 1 ? "Gluttony" : "Lust",
        type: "Slash",
        basePower: 3 + idx,
        coinPower: 4,
        coins: ms.coinlist.length || 2,
        effects: [ms.desc, ...ms.coinlist.flatMap(c => (c.coindescs || []).map(cd => cd.desc))]
      })),
      clientSkills: matchedSkills,
      clientPassives: matchedPassives
    };

    localIdentities.push(newObj);
    newlyAddedCount++;
    console.log(`[ADDED NEW IDENTITY] ${fullName} (ID: ${p.id})`);
  }
}

fs.writeFileSync(localIdentitiesPath, JSON.stringify(localIdentities, null, 2), 'utf8');
console.log(`Success! Enriched ${enrichedCount} identities with authoritative client skills/passives.`);
console.log(`Added ${newlyAddedCount} new identities directly from game files.`);
console.log(`Total identities in tracker: ${localIdentities.length}`);
