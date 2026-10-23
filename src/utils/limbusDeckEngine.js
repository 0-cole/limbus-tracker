// src/utils/limbusDeckEngine.js
// Exact reverse-engineered engines from limbusdeck.com via REA:
// - Bracket Tag Parser & Color Classifier (mod 524663)
// - In-Text Keyword & Status Tokenizer (mod 626587 & 715704)
// - Advanced Effect Text Search Engine (mod 804318)
// - Hall of Records Rank Resolver (mod 98951)
// - "Based on My Pool" Pull Impact & Party Readiness Engine (mod 416858)
// - Exact Markov-Chain DP Clash Solver (mod 803245)

import recordsIndex from '../data/recordsIndex.json';
import traitsDictionary from '../data/traitsDictionary.json';
import recommendedParties from '../data/recommendedParties.json';
import statusDictionary from '../data/statusDictionary.json';

export const LD_SIN_COLORS = {
  wrath: '#dc2626',
  lust: '#ea580c',
  sloth: '#ca8a04',
  gluttony: '#16a34a',
  gloom: '#0ea5e9',
  pride: '#4f46e5',
  envy: '#9333ea',
  Wrath: '#dc2626',
  Lust: '#ea580c',
  Sloth: '#ca8a04',
  Gluttony: '#16a34a',
  Gloom: '#0ea5e9',
  Pride: '#4f46e5',
  Envy: '#9333ea'
};

export const LD_KEYWORD_COLORS = {
  burn: '#ef4444',
  bleed: '#dc2626',
  tremor: '#d97706',
  rupture: '#22c55e',
  sinking: '#3b82f6',
  poise: '#06b6d4',
  charge: '#8b5cf6',
  Burn: '#ef4444',
  Bleed: '#dc2626',
  Tremor: '#d97706',
  Rupture: '#22c55e',
  Sinking: '#3b82f6',
  Poise: '#06b6d4',
  Charge: '#8b5cf6'
};

export const LD_GRADE_COLORS = {
  ZAYIN: '#22c55e',
  TETH: '#06b6d4',
  HE: '#eab308',
  WAW: '#a855f7',
  ALEPH: '#ef4444'
};

export const SINNER_META = [
  { id: 1, name: 'Yi Sang', nameKo: '이상', slug: 'yi-sang', color: '#d4d4d8' },
  { id: 2, name: 'Faust', nameKo: '파우스트', slug: 'faust', color: '#f9a8d4' },
  { id: 3, name: 'Don Quixote', nameKo: '돈키호테', slug: 'don-quixote', color: '#fde047' },
  { id: 4, name: 'Ryōshū', nameKo: '료슈', slug: 'ryoshu', color: '#f87171' },
  { id: 5, name: 'Meursault', nameKo: '뫼르소', slug: 'meursault', color: '#60a5fa' },
  { id: 6, name: 'Hong Lu', nameKo: '홍루', slug: 'hong-lu', color: '#5eead4' },
  { id: 7, name: 'Heathcliff', nameKo: '히스클리프', slug: 'heathcliff', color: '#a855f7' },
  { id: 8, name: 'Ishmael', nameKo: '이스마엘', slug: 'ishmael', color: '#fb923c' },
  { id: 9, name: 'Rodion', nameKo: '로쟈', slug: 'rodion', color: '#ef4444' },
  { id: 10, name: 'Sinclair', nameKo: '싱클레어', slug: 'sinclair', color: '#bef264' },
  { id: 11, name: 'Outis', nameKo: '오티스', slug: 'outis', color: '#6ee7b7' },
  { id: 12, name: 'Gregor', nameKo: '그레고르', slug: 'gregor', color: '#d97706' }
];

export const EGO_LINKED_KEYWORDS = {
  'lobotomy-ego-solemn-lament-yi-sang': {
    keywords: ['tremor'],
    viaEn: 'Solemn Lament',
    viaKo: '엄숙한 애도',
    ego: { id: 110, slug: 'solemn-lament-yi-sang', grade: 'HE' }
  },
  'blade-lineage-mentor-meursault': {
    keywords: ['bleed'],
    viaEn: 'Shadow-vested Bladesinger',
    viaKo: '착영휘도',
    ego: { id: 109, slug: 'shadow-vested-bladesinger-[着影揮刀]-meursault', grade: 'HE' }
  }
};

export function getEgoLinkedInfo(slug) {
  return EGO_LINKED_KEYWORDS[slug] || null;
}

export function getTraitLabel(traitKey, locale = 'en') {
  const entry = traitsDictionary?.traits?.[traitKey];
  if (!entry) return traitKey;
  return entry[locale] || entry.en || traitKey;
}

export function getMetaTierLabel(metaTier) {
  switch (metaTier) {
    case 'S': return { tier: 'Tier OP', code: 'op', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    case 'A': return { tier: 'Tier 1', code: 't1', color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
    case 'B': return { tier: 'Tier 2', code: 't2', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
    case 'C': return { tier: 'Tier 3', code: 't3', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    default: return { tier: 'Standard', code: 't4', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
  }
}

// --- Module 524663: Bracket Tag Parser & Color Classifier ---
export function getBracketColor(prefix) {
  if (!prefix) return '#94a3b8';
  const t = prefix.toLowerCase();
  if (t.includes('적중') || t.includes('hit') || t.includes('앞면') || t.includes('heads') || t.includes('crit')) {
    return '#fbbf24'; // Amber-400
  }
  if (t.includes('사용') || t.includes('on use') || t.includes('사용 전') || t.includes('before attack') || t.includes('사용 후')) {
    return '#a78bfa'; // Purple-400
  }
  if (t.includes('전투 시작') || t.includes('combat start')) {
    return '#60a5fa'; // Blue-400
  }
  if (t.includes('종료') || t.includes('end') || t.includes('after')) {
    return '#94a3b8'; // Slate-400
  }
  if (t.includes('턴') || t.includes('turn')) {
    return '#60a5fa'; // Blue-400
  }
  if (t.includes('합') || t.includes('clash') || t.includes('counter') || t.includes('가드') || t.includes('guard') || t.includes('회피') || t.includes('evade')) {
    return '#34d399'; // Emerald-400
  }
  if (t.includes('파괴 불가') || t.includes('unbreakable')) {
    return '#f59e0b'; // Amber-500
  }
  if (t.includes('자신') || t.includes('self') || t.includes('적') || t.includes('enemy') || t.includes('아군') || t.includes('ally')) {
    return '#fb923c'; // Orange-400
  }
  return '#94a3b8';
}

export function splitEffectSegments(effectStr) {
  if (!effectStr || typeof effectStr !== 'string') return [];
  return effectStr
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .flatMap(line => {
      const regex = /\[([^\]]+)\]/g;
      const segments = [];
      let lastIdx = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (segments.length > 0 && lastIdx < match.index) {
          segments[segments.length - 1].text += line.substring(lastIdx, match.index).trim();
        } else if (segments.length === 0 && match.index > 0) {
          segments.push({ prefix: '', text: line.substring(0, match.index).trim() });
        }
        segments.push({ prefix: `[${match[1]}]`, text: '' });
        lastIdx = match.index + match[0].length;
      }
      if (segments.length > 0 && lastIdx < line.length) {
        segments[segments.length - 1].text += line.substring(lastIdx).trim();
      }
      if (segments.length === 0) {
        segments.push({ prefix: '', text: line });
      }
      return segments.filter(s => s.prefix || s.text);
    });
}

export function segmentDisplayText(seg) {
  return seg.prefix ? (seg.text ? `${seg.prefix} ${seg.text}` : seg.prefix) : seg.text;
}

// --- Module 98951: Hall of Records Rank Resolver ---
const RECORD_CATEGORIES = {
  hpMax: { value: e => e.hp, order: 'desc', label: 'Max HP' },
  hpMin: { value: e => e.hp, order: 'asc', label: 'Lowest HP' },
  speedMax: { value: e => e.maxSpeed, order: 'desc', label: 'Max Speed' },
  speedMin: { value: e => e.minSpeed, order: 'asc', label: 'Min Speed' },
  defense: { value: e => e.defenseLevel, order: 'desc', label: 'Defense Level' },
  coins: { value: e => e.coins, order: 'desc', label: 'Total Coins' },
  power: { value: e => e.maxPower, order: 'desc', label: 'Max Skill Power' },
  staggerLate: { value: e => (e.stagger && e.stagger.length > 0 ? e.stagger[0] : null), order: 'asc', label: 'First Stagger %' }
};

export function getIdentityRecordRank(ldId, categoryId) {
  if (!ldId || !recordsIndex) return null;
  const target = recordsIndex.find(e => e.id === ldId);
  if (!target) return null;
  const cat = RECORD_CATEGORIES[categoryId];
  if (!cat) return null;
  const includeOneStar = target.rarity === 1;
  const pool = includeOneStar ? recordsIndex : recordsIndex.filter(e => e.rarity > 1);
  const targetVal = cat.value(target);
  if (targetVal === null || targetVal === undefined) return null;

  let better = 0;
  let tied = 0;
  let total = 0;
  for (const item of pool) {
    const val = cat.value(item);
    if (val === null || val === undefined) continue;
    total++;
    if (val === targetVal) tied++;
    else if (cat.order === 'desc' ? val > targetVal : val < targetVal) better++;
  }
  return {
    rank: better + 1,
    tied,
    total,
    value: targetVal,
    label: cat.label,
    includeOneStar
  };
}

// --- Module 416858: "Based on My Pool" Pull Impact & Party Readiness ---
export function computeIdentityPoolImpact(identity, acquiredNamesSet, allIdentities) {
  if (!identity) return null;
  const ldId = identity.ldId;
  const isOwned = acquiredNamesSet.has(identity.name);

  // Build map from ldId -> Identity
  const byLdId = new Map();
  for (const id of allIdentities) {
    if (id.ldId) byLdId.set(id.ldId, id);
  }

  // Starter 1-star identities are always considered owned
  const isIdOwned = (targetLdId, includeSelf = false) => {
    if (includeSelf && targetLdId === ldId) return true;
    if (!includeSelf && targetLdId === ldId) return isOwned;
    const found = byLdId.get(targetLdId);
    if (!found) return false;
    if (found.rarity === 1) return true;
    return acquiredNamesSet.has(found.name);
  };

  // 1. Recommended Parties containing this Identity
  const containingParties = recommendedParties.filter(p =>
    (p.members || []).some(m => m.identityId === ldId)
  );

  let readyBefore = 0;
  let readyAfter = 0;
  let oneShortCount = 0;
  const partyChanges = [];

  for (const party of containingParties) {
    const members = party.members || [];
    const total = members.length;
    if (total === 0) continue;

    let ownedBefore = 0;
    let ownedAfter = 0;
    const missingMembers = [];

    for (const m of members) {
      const hasBefore = isIdOwned(m.identityId, false);
      const hasAfter = isIdOwned(m.identityId, true);
      if (hasBefore) ownedBefore++;
      if (hasAfter) ownedAfter++;
      if (!hasAfter) {
        const missId = byLdId.get(m.identityId);
        if (missId) missingMembers.push(missId);
      }
    }

    if (ownedBefore === total) readyBefore++;
    if (ownedAfter === total) readyAfter++;
    if (ownedAfter === total - 1) oneShortCount++;

    if (ownedAfter === total) {
      partyChanges.push({ party, status: 'complete', owned: ownedAfter, total, missingMembers });
    } else if (ownedAfter === total - 1) {
      partyChanges.push({ party, status: 'near', owned: ownedAfter, total, missingMembers });
    } else {
      partyChanges.push({ party, status: 'partial', owned: ownedAfter, total, missingMembers });
    }
  }

  // Sort partyChanges: complete first, then near, then highest owned ratio
  partyChanges.sort((a, b) => (b.owned / b.total) - (a.owned / a.total));

  // 2. Sinner ownership stats
  const sameSinnerIds = allIdentities.filter(i => !i.isDummy && (i.sinnerId === identity.sinnerId || i.sinner === identity.sinner));
  const sameSinner3Star = sameSinnerIds.filter(i => i.rarity === 3);
  const sinnerOwnedBefore = sameSinnerIds.filter(i => i.rarity === 1 || acquiredNamesSet.has(i.name)).length;
  const sinner3StarOwned = sameSinner3Star.filter(i => acquiredNamesSet.has(i.name)).length;

  // 3. Primary Faction / Trait collection progress
  const primaryTrait = (identity.traits || []).find(t => t !== 'fixer' && t !== 'syndicate' && t !== 'lcb') || (identity.traits || [])[0] || null;
  let traitSet = null;
  if (primaryTrait) {
    const traitMembers = allIdentities.filter(i => !i.isDummy && (i.traits || []).includes(primaryTrait));
    const traitOwned = traitMembers.filter(i => i.rarity === 1 || acquiredNamesSet.has(i.name)).length;
    traitSet = {
      traitKey: primaryTrait,
      traitName: getTraitLabel(primaryTrait),
      owned: traitOwned,
      total: traitMembers.length,
      afterOwned: isOwned ? traitOwned : Math.min(traitMembers.length, traitOwned + 1)
    };
  }

  // 4. Common Teammates (computed from co-occurrence in the 76 Recommended Meta Parties)
  const teammateCounts = new Map();
  for (const party of containingParties) {
    for (const m of (party.members || [])) {
      if (m.identityId !== ldId) {
        teammateCounts.set(m.identityId, (teammateCounts.get(m.identityId) || 0) + 1);
      }
    }
  }
  const commonTeammates = Array.from(teammateCounts.entries())
    .map(([tid, count]) => ({
      identity: byLdId.get(tid),
      count,
      rate: containingParties.length > 0 ? Math.round((count / containingParties.length) * 100) : 0
    }))
    .filter(x => x.identity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    isOwned,
    containingCount: containingParties.length,
    readyBefore,
    readyAfter,
    oneShortCount,
    partyChanges,
    sinnerStats: {
      owned: sinnerOwnedBefore,
      total: sameSinnerIds.length,
      threeStarOwned: sinner3StarOwned,
      threeStarTotal: sameSinner3Star.length
    },
    traitSet,
    commonTeammates
  };
}

// --- Module 804318: Advanced Effect Text Search Engine ---
export const EFFECT_SCOPES = [
  { id: 'all', label: 'All Effects' },
  { id: 'atk', label: 'Attack Skills (S1–S3)' },
  { id: 's1', label: 'Skill 1' },
  { id: 's2', label: 'Skill 2' },
  { id: 's3', label: 'Skill 3' },
  { id: 'def', label: 'Defense Skills' },
  { id: 'pas', label: 'Passives' }
];

export function searchIdentityEffects(identities, queryStr, scope = 'all', includeVariants = true) {
  const cleanQuery = (queryStr || '').trim().toLowerCase();
  if (!cleanQuery) return new Map();

  // Extract bracket tags like [on hit] and plain search words
  const bracketTerms = [];
  let remainder = cleanQuery.replace(/\[([^\]]+)\]/g, (_, inner) => {
    bracketTerms.push(inner.trim().toLowerCase());
    return ' ';
  });
  const words = remainder.split(/\s+/).filter(Boolean);
  if (bracketTerms.length === 0 && words.length === 0) return new Map();

  const matchesByIdName = new Map();

  for (const id of identities) {
    const matchedLines = [];

    const checkLine = (placeLabel, coinNum, prefix, text) => {
      const fullLine = segmentDisplayText({ prefix, text });
      const lowerFull = fullLine.toLowerCase();
      const lowerPrefix = (prefix || '').toLowerCase();

      for (const bt of bracketTerms) {
        if (!lowerPrefix.includes(bt) && !lowerFull.includes(`[${bt}`)) return;
      }
      for (const w of words) {
        if (!lowerFull.includes(w)) return;
      }

      matchedLines.push({
        placeLabel,
        coinNum,
        prefix,
        text,
        display: fullLine
      });
    };

    // Scan Attack Skills
    if (scope === 'all' || scope === 'atk' || scope === 's1' || scope === 's2' || scope === 's3') {
      const skills = id.ldSkills || id.skills || [];
      skills.forEach((sk, idx) => {
        const slotNum = idx + 1;
        if (scope === 's1' && slotNum !== 1) return;
        if (scope === 's2' && slotNum !== 2) return;
        if (scope === 's3' && slotNum !== 3) return;

        const coinEffects = sk.coinEffects || sk.effects || [];
        coinEffects.forEach((ce, cIdx) => {
          if (!ce) return;
          for (const seg of splitEffectSegments(ce)) {
            checkLine(`S${slotNum}`, cIdx === 0 ? null : cIdx, seg.prefix, seg.text);
          }
        });

        if (includeVariants && Array.isArray(sk.variants)) {
          sk.variants.forEach((v, vIdx) => {
            (v.coinEffects || []).forEach((ce, cIdx) => {
              if (!ce) return;
              for (const seg of splitEffectSegments(ce)) {
                checkLine(`S${slotNum} Var.${vIdx + 1}`, cIdx === 0 ? null : cIdx, seg.prefix, seg.text);
              }
            });
          });
        }
      });
    }

    // Scan Defense Skills
    if (scope === 'all' || scope === 'def') {
      const defSkills = id.ldDefenseSkills || (id.defense ? [id.defense] : []);
      defSkills.forEach((df, idx) => {
        const label = defSkills.length > 1 ? `Def ${idx + 1}` : 'Def';
        const coinEffects = df.coinEffects || df.effects || [];
        coinEffects.forEach((ce, cIdx) => {
          if (!ce) return;
          for (const seg of splitEffectSegments(ce)) {
            checkLine(label, cIdx === 0 ? null : cIdx, seg.prefix, seg.text);
          }
        });
      });
    }

    // Scan Passives
    if (scope === 'all' || scope === 'pas') {
      const passives = id.ldPassives || id.passives || [];
      passives.forEach((pas) => {
        const desc = pas.descriptionEn || (Array.isArray(pas.effects) ? pas.effects.join('\n') : pas.effects) || '';
        const pLabel = pas.type === 'support' ? 'Support' : 'Passive';
        for (const seg of splitEffectSegments(desc)) {
          checkLine(pLabel, null, seg.prefix, seg.text);
        }
      });
    }

    if (matchedLines.length > 0) {
      matchesByIdName.set(id.name, matchedLines);
    }
  }

  return matchesByIdName;
}

export { statusDictionary, recommendedParties, recordsIndex, traitsDictionary };

// --- Module 803245: Exact Markov-Chain Dynamic Programming Clash Solver ---
export const ZERO_MODS = { base: 0, coin: 0, final: 0, clash: 0 };

function clampNum(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function toInt(val, fallback = 0) {
  return Number.isFinite(Number(val)) ? Math.trunc(Number(val)) : fallback;
}

export function headsProbability(sp) {
  return (50 + clampNum(toInt(sp, 0), -45, 45)) / 100;
}

export function levelBonus(lvA, lvB) {
  if (lvA === null || lvB === null || !Number.isFinite(Number(lvA)) || !Number.isFinite(Number(lvB))) {
    return [0, 0];
  }
  const diff = Math.trunc(Number(lvA)) - Math.trunc(Number(lvB));
  if (diff > 0) return [Math.floor(diff / 3), 0];
  if (diff < 0) return [0, Math.floor(-diff / 3)];
  return [0, 0];
}

function getMods(side) {
  const m = side.mods || {};
  return {
    base: toInt(m.base, 0),
    coin: toInt(m.coin, 0),
    final: toInt(m.final, 0),
    clash: toInt(m.clash, 0)
  };
}

function coinCountOf(side) {
  return clampNum(toInt(side.coinCount ?? side.coins, 1), 1, 50);
}

export function roundPowers(side, remainingCoins, paralysisCount, lvOffset) {
  const totalCoins = coinCountOf(side);
  const { coin: coinMod } = getMods(side);
  const cp = side.coinPower;
  const coinArray = Array.from({ length: totalCoins }, (_, i) =>
    toInt(typeof cp === 'number' ? cp : (cp?.[i] ?? cp?.[cp.length - 1] ?? 0), 0) + coinMod
  );
  const curCoins = clampNum(toInt(remainingCoins, 1), 1, coinArray.length);
  const activeCoins = coinArray.slice(coinArray.length - curCoins);
  const para = clampNum(toInt(paralysisCount, 0), 0, curCoins);
  const pHeads = headsProbability(side.sanity);
  const mods = getMods(side);

  let sumDist = new Map([[0, 1]]);
  // First `para` coins are paralyzed (contribute 0 power)
  for (let i = para; i < curCoins; i++) {
    const val = activeCoins[i];
    const nextDist = new Map();
    for (const [sum, prob] of sumDist.entries()) {
      nextDist.set(sum, (nextDist.get(sum) || 0) + prob * (1 - pHeads));
      nextDist.set(sum + val, (nextDist.get(sum + val) || 0) + prob * pHeads);
    }
    sumDist = nextDist;
  }

  const finalDist = new Map();
  const baseWithMod = toInt(side.basePower, 0) + mods.base;
  for (const [coinSum, prob] of sumDist.entries()) {
    const power = Math.max(0, Math.max(0, baseWithMod + coinSum + mods.final) + mods.clash + lvOffset);
    finalDist.set(power, (finalDist.get(power) || 0) + prob);
  }
  return Array.from(finalDist.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([power, p]) => ({ power, p }));
}

export function roundOutcome(distA, distB) {
  let win = 0, tie = 0, lose = 0;
  for (const a of distA) {
    for (const b of distB) {
      const p = a.p * b.p;
      if (a.power > b.power) win += p;
      else if (a.power < b.power) lose += p;
      else tie += p;
    }
  }
  return { win, tie, lose };
}

export function solveClash(sideA, sideB, options = {}) {
  const maxRounds = Math.max(1, toInt(options.maxRounds ?? 99, 99));
  const coinsA = coinCountOf(sideA);
  const coinsB = coinCountOf(sideB);
  const paraA = Math.max(0, toInt(sideA.paralysis, 0));
  const paraB = Math.max(0, toInt(sideB.paralysis, 0));
  const [lvBonusA, lvBonusB] = levelBonus(sideA.offenseLevel, sideB.offenseLevel);

  const cachePowersA = new Map();
  const cachePowersB = new Map();
  const getPowers = (cache, side, c, p, lv) => {
    const key = 64 * c + Math.min(p, c);
    let dist = cache.get(key);
    if (!dist) {
      dist = roundPowers(side, c, p, lv);
      cache.set(key, dist);
    }
    return dist;
  };

  const cacheOutcomes = new Map();
  const getOutcome = (ca, pa, cb, pb) => {
    const key = 65536 * (64 * ca + Math.min(pa, ca)) + (64 * cb + Math.min(pb, cb));
    let out = cacheOutcomes.get(key);
    if (!out) {
      out = roundOutcome(
        getPowers(cachePowersA, sideA, ca, pa, lvBonusA),
        getPowers(cachePowersB, sideB, cb, pb, lvBonusB)
      );
      cacheOutcomes.set(key, out);
    }
    return out;
  };

  const encodeState = (ca, cb, qa, qb) => (((ca * (coinsB + 1) + cb) * (paraA + 1) + qa) * (paraB + 1)) + qb;
  let states = new Map([
    [encodeState(coinsA, coinsB, paraA, paraB), { ca: coinsA, cb: coinsB, qa: paraA, qb: paraB, m: 1 }]
  ]);

  const winByCoins = Array(coinsA + 1).fill(0);
  const loseByCoins = Array(coinsB + 1).fill(0);
  const rounds = Array(maxRounds + 1).fill(0);
  const firstRound = getOutcome(coinsA, paraA, coinsB, paraB);

  const pushState = (map, ca, cb, qa, qb, prob) => {
    if (prob === 0) return;
    const k = encodeState(ca, cb, qa, qb);
    const ex = map.get(k);
    if (ex) ex.m += prob;
    else map.set(k, { ca, cb, qa, qb, m: prob });
  };

  for (let r = 1; r <= maxRounds && states.size > 0; r++) {
    const nextStates = new Map();
    for (const { ca, cb, qa, qb, m } of states.values()) {
      const out = getOutcome(ca, qa, cb, pb);
      const nextQa = Math.max(0, qa - ca);
      const nextQb = Math.max(0, qb - cb);

      if (out.win > 0) {
        if (cb === 1) {
          winByCoins[ca] += m * out.win;
          rounds[r] += m * out.win;
        } else {
          pushState(nextStates, ca, cb - 1, nextQa, nextQb, m * out.win);
        }
      }
      if (out.lose > 0) {
        if (ca === 1) {
          loseByCoins[cb] += m * out.lose;
          rounds[r] += m * out.lose;
        } else {
          pushState(nextStates, ca - 1, cb, nextQa, nextQb, m * out.lose);
        }
      }
      if (out.tie > 0) {
        pushState(nextStates, ca, cb, nextQa, nextQb, m * out.tie);
      }
    }
    states = nextStates;
  }

  let voidProb = 0;
  for (const st of states.values()) voidProb += st.m;

  const winTotal = winByCoins.reduce((a, b) => a + b, 0);
  const loseTotal = loseByCoins.reduce((a, b) => a + b, 0);
  const expectedRounds = rounds.reduce((acc, p, idx) => acc + p * idx, 0);

  return {
    win: winTotal,
    lose: loseTotal,
    void: voidProb,
    first: firstRound,
    winByCoins,
    loseByCoins,
    rounds,
    expectedRounds,
    powersA: getPowers(cachePowersA, sideA, coinsA, paraA, lvBonusA),
    powersB: getPowers(cachePowersB, sideB, coinsB, paraB, lvBonusB)
  };
}

