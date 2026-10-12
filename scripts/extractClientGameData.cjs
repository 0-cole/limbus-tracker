// scripts/extractClientGameData.cjs
// Direct authoritative extraction from Limbus Company local game files
const fs = require('fs');
const path = require('path');

const GAME_DIR = 'C:/Program Files (x86)/Steam/steamapps/common/Limbus Company/LimbusCompany_Data/Assets/Resources_moved/Localize/en';

if (!fs.existsSync(GAME_DIR)) {
  console.error('Game localization directory not found:', GAME_DIR);
  process.exit(1);
}

console.log('Loading authoritative client files from:', GAME_DIR);

const personalitiesRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Personalities.json'), 'utf8')).dataList;
const passivesRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Passives.json'), 'utf8')).dataList;
const egosRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Egos.json'), 'utf8')).dataList;
const egoSkillsRaw = JSON.parse(fs.readFileSync(path.join(GAME_DIR, 'EN_Skills_Ego.json'), 'utf8')).dataList;

// Load all 12 sinner skill files
const sinnerSkillMap = new Map();
for (let i = 1; i <= 12; i++) {
  const pad = String(i).padStart(2, '0');
  const filePath = path.join(GAME_DIR, `EN_Skills_personality-${pad}.json`);
  if (fs.existsSync(filePath)) {
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8')).dataList;
    for (const skill of fileData) {
      sinnerSkillMap.set(Number(skill.id), skill);
    }
  }
}

console.log(`Loaded ${personalitiesRaw.length} client identities.`);
console.log(`Loaded ${sinnerSkillMap.size} client skills.`);
console.log(`Loaded ${passivesRaw.length} client passives.`);
console.log(`Loaded ${egosRaw.length} client E.G.O equipment.`);

// Map passives by ID
const passiveMap = new Map();
for (const p of passivesRaw) {
  passiveMap.set(Number(p.id), p);
}

// Compare with existing identities.json
const localIdentitiesPath = path.resolve(__dirname, '../src/data/identities.json');
const localIdentities = JSON.parse(fs.readFileSync(localIdentitiesPath, 'utf8'));

console.log(`Current tracker identities: ${localIdentities.length}`);

// Helper to sanitize name
function normalizeName(str) {
  return str.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const localNameSet = new Set(localIdentities.map(x => normalizeName(x.name).toLowerCase()));

const newIdentities = [];
for (const p of personalitiesRaw) {
  const fullName = normalizeName(`${p.title} ${p.name}`);
  const match = localIdentities.find(x => normalizeName(x.name).toLowerCase() === fullName.toLowerCase());
  
  if (!match) {
    console.log(`[NEW IDENTITY FOUND] ID: ${p.id} | ${fullName}`);
    newIdentities.push({
      id: p.id,
      title: normalizeName(p.title),
      sinner: p.name,
      fullName
    });
  }
}

console.log(`Total new identities to add: ${newIdentities.length}`);
