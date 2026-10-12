// scripts/mergeOfficialClientEgos.cjs
const fs = require('fs');
const path = require('path');

const GAME_DIR = 'C:/Program Files (x86)/Steam/steamapps/common/Limbus Company/LimbusCompany_Data/Assets/Resources_moved/Localize/en';
const localEgosPath = path.resolve(__dirname, '../src/data/egos.json');
const localEgos = JSON.parse(fs.readFileSync(localEgosPath, 'utf8'));

const egosRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Egos.json'), 'utf8')).dataList;
const egoSkillsRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Skills_Ego.json'), 'utf8')).dataList;
const egoPassivesRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Passive_Ego.json'), 'utf8')).dataList;

const SINNER_MAP = {
  'yi sang': '201',
  'faust': '202',
  'don quixote': '203',
  'ryōshū': '204',
  'ryoshu': '204',
  'meursault': '205',
  'hong lu': '206',
  'heathcliff': '207',
  'ishmael': '208',
  'rodion': '209',
  'sinclair': '210',
  'outis': '211',
  'gregor': '212'
};

const egoSkillMap = new Map();
for (const s of egoSkillsRaw) {
  egoSkillMap.set(Number(s.id), s);
}

const egoPassiveMap = new Map();
for (const p of egoPassivesRaw) {
  egoPassiveMap.set(Number(p.id), p);
}

function normalizeKey(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

let enrichedCount = 0;

for (const localEgo of localEgos) {
  const sinnerPrefix = SINNER_MAP[localEgo.sinner?.toLowerCase()] || '';
  const localEgoNameKey = normalizeKey(localEgo.name);
  
  // Find matching client EGO
  const match = egosRaw.find(e => {
    const eIdStr = String(e.id);
    if (sinnerPrefix && !eIdStr.startsWith(sinnerPrefix)) return false;
    const cNameKey = normalizeKey(e.name);
    return localEgoNameKey.includes(cNameKey) || cNameKey.includes(localEgoNameKey);
  });

  if (match) {
    localEgo.gameId = match.id;
    localEgo.clientName = match.name;
    localEgo.clientDesc = match.desc;

    // Match skills (Awakening / Corrosion)
    const idPrefix = String(match.id);
    const matchedSkills = [];
    for (const [sId, sData] of egoSkillMap.entries()) {
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
      localEgo.clientSkills = matchedSkills;
      enrichedCount++;
    }

    // Match passives
    const matchedPassives = [];
    for (const [pId, pData] of egoPassiveMap.entries()) {
      if (String(pId).startsWith(idPrefix)) {
        matchedPassives.push({
          passiveId: pId,
          name: pData.name || '',
          desc: pData.desc || ''
        });
      }
    }
    if (matchedPassives.length > 0) {
      localEgo.clientPassives = matchedPassives;
    }
  }
}

fs.writeFileSync(localEgosPath, JSON.stringify(localEgos, null, 2), 'utf8');
console.log(`Success! Enriched ${enrichedCount} of ${localEgos.length} E.G.O equipment entries with authoritative game data.`);
