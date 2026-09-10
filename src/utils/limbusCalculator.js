/**
 * src/utils/limbusCalculator.js
 * Deterministic Engine & Roadmap Generator with Egoshard Allocation Milestones
 */
import { getRemainingCycles, getNextResets } from './timeUtils.js';

export function normalizeSinnerId(name) {
  if (!name) return 'yi-sang';
  const clean = String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
  if (clean.includes('yisang') || clean.includes('yi')) return 'yi-sang';
  if (clean.includes('faust')) return 'faust';
  if (clean.includes('don') || clean.includes('quixote')) return 'don-quixote';
  if (clean.includes('ryoshu')) return 'ryoshu';
  if (clean.includes('meursault')) return 'meursault';
  if (clean.includes('hong') || clean.includes('lu')) return 'hong-lu';
  if (clean.includes('heathcliff') || clean.includes('heath')) return 'heathcliff';
  if (clean.includes('ishmael') || clean.includes('ish')) return 'ishmael';
  if (clean.includes('rodion') || clean.includes('rodya')) return 'rodion';
  if (clean.includes('sinclair')) return 'sinclair';
  if (clean.includes('outis')) return 'outis';
  if (clean.includes('gregor')) return 'gregor';
  return clean;
}

export function getOwnedShards(shardsInventory = {}, sinnerInput = '') {
  if (!shardsInventory || !sinnerInput) return 0;
  
  // 1. Direct match
  if (shardsInventory[sinnerInput] !== undefined) {
    return Number(shardsInventory[sinnerInput]) || 0;
  }
  
  const targetNorm = normalizeSinnerId(sinnerInput);
  
  // 2. Normalized key match
  if (shardsInventory[targetNorm] !== undefined) {
    return Number(shardsInventory[targetNorm]) || 0;
  }

  // 3. Scan all keys in inventory.shards
  for (const [key, val] of Object.entries(shardsInventory)) {
    if (normalizeSinnerId(key) === targetNorm) {
      return Number(val) || 0;
    }
  }

  return 0;
}

export function calculateLimbusGrind(
  wishlist = [],
  inventory = {},
  bpState = {},
  scheduleState = {},
  seasonEndDate
) {
  const safeMath = bpState?.safeMath === true;
  const R_crate = safeMath ? 1.5 : 2.0;
  const cratesPerLevel = bpState?.isPremium ? 3 : 1;

  // 1. Deficit Math
  const targetShards = {};
  for (const item of wishlist) {
    const sinnerId = normalizeSinnerId(item.sinnerId || item.sinner);
    const cost = item.rarity === '00' ? 150 : 400;
    targetShards[sinnerId] = (targetShards[sinnerId] || 0) + cost;
  }

  const shardsInventory = inventory?.shards || {};
  let totalShardDeficit = 0;
  for (const sinner of Object.keys(targetShards)) {
    const owned = getOwnedShards(shardsInventory, sinner);
    const deficit = Math.max(0, targetShards[sinner] - owned);
    totalShardDeficit += deficit;
  }

  // 2. Active Crate to EXP Conversion
  const nominableCrates = inventory?.nominableCrates || 0;
  const netCratesNeeded = Math.max(0, Math.ceil(totalShardDeficit / R_crate) - nominableCrates);
  
  const bpLevelsNeeded = Math.ceil(netCratesNeeded / cratesPerLevel);
  let bpExpNeeded = bpLevelsNeeded * 10;

  // Offset by current partial EXP
  if (bpState?.currentExp > 0 && bpExpNeeded > 0) {
    bpExpNeeded = Math.max(0, bpExpNeeded - bpState.currentExp);
  }

  // 3. Time Remaining & Resets
  const { daysLeft, weeksLeft } = getRemainingCycles(seasonEndDate);

  // 4. Passive EXP Estimation
  const effectiveHasMdHard = (bpState?.canto === undefined || bpState?.canto >= 8) && (bpState?.preferHardMd !== false) && (bpState?.hasMdHard !== false);
  const hardBonusYield = 225; // Hard Mode (3 bonuses at once)
  const normalBonusYield = 45; // Normal Mode (1 bonus)
  const bonusYield = effectiveHasMdHard ? hardBonusYield : normalBonusYield;
  
  const futureDailyExp = Math.max(0, daysLeft - 1) * 10;
  const futureWeeklyExp = Math.max(0, weeksLeft - 1) * 20;

  const truePassiveExp = futureDailyExp + futureWeeklyExp + 
    ((scheduleState?.dailiesProgress || 0) >= 5 ? 0 : 10) + 
    (scheduleState?.weekliesDone ? 0 : 20);

  // 5. Active Grind Output
  const BASE_MD_EXP = 30; 
  let expDeficitAfterPassive = Math.max(0, bpExpNeeded - truePassiveExp);
  
  let plannedRuns = [];
  let availableBonuses = Math.max(0, weeksLeft - 1) * 3 + (3 - (scheduleState?.mdBonusesClaimed || 0));
  
  // If user has Hard Mode enabled and unlocked, they consume 3 bonuses at once for 225 EXP.
  // If Normal Mode, they consume 1 bonus for 45 EXP.
  while (expDeficitAfterPassive > 0 && availableBonuses > 0) {
      if (effectiveHasMdHard && availableBonuses >= 3) {
          plannedRuns.push(225);
          availableBonuses -= 3;
          expDeficitAfterPassive -= 225;
      } else {
          plannedRuns.push(45);
          availableBonuses--;
          expDeficitAfterPassive -= 45;
      }
  }
  
  if (expDeficitAfterPassive > 0) {
      const unboostedMdsNeeded = Math.ceil(expDeficitAfterPassive / BASE_MD_EXP);
      for(let i=0; i<unboostedMdsNeeded; i++){
          plannedRuns.push(30);
      }
  }

  return {
    shardsNeeded: totalShardDeficit,
    cratesNeeded: netCratesNeeded,
    bpExpNeeded,
    passiveExp: truePassiveExp,
    expToGrind: Math.max(0, bpExpNeeded - truePassiveExp),
    rawMdsNeeded: plannedRuns.length,
    plannedRuns: plannedRuns,
    daysLeft,
    safeMath,
    R_crate
  };
}

export function generateRoadmap(
  daysLeft,
  plannedRuns = [],
  scheduleState = {},
  bpState = {},
  wishlist = [],
  inventory = {}
) {
  const roadmap = [];
  const paceMode = bpState?.paceMode || 'relaxed';
  const customDailyRuns = Math.max(1, bpState?.customDailyRuns || 3);
  let totalRunsLeft = plannedRuns.length;
  
  const availableDays = daysLeft > 0 ? daysLeft : 1;
  const baseMdsPerDay = Math.floor(totalRunsLeft / availableDays);
  let remainderMds = totalRunsLeft % availableDays;
  let remainingRunsPool = totalRunsLeft;
  
  let cumulativeExp = 0;
  
  // Track our current date cursor to simulate weekly resets
  let cursorMs = Date.now();
  let nextWeeklyResetMs = getNextResets(cursorMs).nextWeekly;
  const todayDateStr = new Date().toISOString().split('T')[0];

  let currentBonuses = Math.max(0, 3 - (scheduleState?.mdBonusesClaimed || 0));
  let currentDailiesDone = (scheduleState?.dailiesProgress || 0) >= 5;
  let currentWeekliesDone = scheduleState?.weekliesDone || false;
  const effectiveHasMdHard = (bpState?.canto === undefined || bpState?.canto >= 8) && (bpState?.preferHardMd !== false) && (bpState?.hasMdHard !== false);
  
  const safeMath = bpState?.safeMath === true;
  const R_crate = safeMath ? 1.5 : 2.0;
  const cratesPerLevel = bpState?.isPremium ? 3 : 1;

  // 1. Prepare Target Items & Progress for Egoshard Milestones
  const shardsInventory = inventory?.shards || {};
  let targetProgress = (wishlist || []).map(item => {
    const sinnerId = normalizeSinnerId(item.sinnerId || item.sinner);
    const cost = item.rarity === '00' ? 150 : 400;
    const owned = getOwnedShards(shardsInventory, item.sinner || item.sinnerId || sinnerId);
    const remaining = Math.max(0, cost - owned);
    const alreadyCraftable = owned >= cost;
    return {
      name: item.name || sinnerId,
      sinnerId,
      sinnerName: item.sinner || sinnerId,
      rarity: item.rarity || '000',
      cost,
      startingShards: owned,
      ownedShards: owned,
      currentShards: owned,
      remainingDeficit: remaining,
      alreadyCraftable,
      completed: alreadyCraftable,
      completedDay: alreadyCraftable ? 0 : null,
      completedDate: alreadyCraftable ? 'Already Craftable' : null
    };
  });

  // Sort targets: items with lowest remaining deficit (closest to completion) come first!
  targetProgress.sort((a, b) => a.remainingDeficit - b.remainingDeficit);

  let activeTargetIdx = 0;
  // Advance past already completed targets
  while (activeTargetIdx < targetProgress.length && targetProgress[activeTargetIdx].completed) {
    activeTargetIdx++;
  }

  // Pre-allocate existing nominable crates in inventory
  let initialNominableCrates = inventory?.nominableCrates || 0;
  while (activeTargetIdx < targetProgress.length && initialNominableCrates > 0) {
    const cur = targetProgress[activeTargetIdx];
    const needed = cur.cost - cur.currentShards;
    const cratesToUse = Math.min(initialNominableCrates, Math.ceil(needed / R_crate));
    const shardYield = cratesToUse * R_crate;
    cur.currentShards = Math.min(cur.cost, cur.currentShards + shardYield);
    initialNominableCrates -= cratesToUse;
    if (cur.currentShards >= cur.cost) {
      cur.completed = true;
      cur.completedDay = 1;
      cur.completedDate = 'Day 1 (From Inventory Crates)';
      activeTargetIdx++;
    }
  }

  let totalModulesNeeded = 0;
  let partialExpAccumulator = bpState?.currentExp || 0;
  let totalCratesGenerated = 0;

  for (let i = 0; i < availableDays; i++) {
    // 1. Calendar Date & Weekly Reset for Day i
    const isToday = i === 0;
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekdayStr = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Check if the upcoming weekly reset falls on this calendar day
    const dayEndMs = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999).getTime();
    let isWeeklyReset = false;
    if (!isToday && nextWeeklyResetMs <= dayEndMs) {
      isWeeklyReset = true;
      nextWeeklyResetMs += 7 * 24 * 60 * 60 * 1000;
      // On the weekly reset day, bonuses refresh to 3 and weeklies reset
      currentBonuses = 3;
      currentWeekliesDone = false;
    }

    // 2. Calculate how many runs to do today
    let runsCountToday = 0;
    if (paceMode === 'rush') {
      runsCountToday = Math.min(customDailyRuns, remainingRunsPool);
      remainingRunsPool -= runsCountToday;
    } else {
      runsCountToday = baseMdsPerDay;
      if (remainderMds > 0) {
         runsCountToday++;
         remainderMds--;
      }
    }
    
    // 3. Perform runs and consume bonuses
    let gainedExpFromRuns = 0;
    let runsList = [];
    let modulesUsedToday = 0;
    // Dailies always cost 5 modules if not yet done
    if (!currentDailiesDone) modulesUsedToday += 5;
    for(let r=0; r<runsCountToday; r++){
        if (effectiveHasMdHard && currentBonuses >= 3) {
            currentBonuses -= 3;
            gainedExpFromRuns += 225;
            totalModulesNeeded += 18;
            modulesUsedToday += 18;
            runsList.push({ type: 'Hard Bonus', runKey: 'hard_bonus', exp: 225, modules: 18 });
        } else if (currentBonuses >= 1) {
            currentBonuses -= 1;
            gainedExpFromRuns += 45;
            totalModulesNeeded += 5;
            modulesUsedToday += 5;
            runsList.push({ type: 'Normal Bonus', runKey: 'normal_bonus', exp: 45, modules: 5 });
        } else {
            gainedExpFromRuns += 30;
            totalModulesNeeded += 5;
            modulesUsedToday += 5;
            runsList.push({ type: 'Normal', runKey: 'normal_nobonus', exp: 30, modules: 5 });
        }
    }

    // 4. Passive EXP
    let dailyExpGained = !currentDailiesDone ? 10 : 0;
    let weeklyExpGained = (!currentWeekliesDone && (isToday || isWeeklyReset)) ? 20 : 0;
    let passiveGained = dailyExpGained + weeklyExpGained;

    // 5. Calculate Crates & Shard Allocation for Today
    let totalGainedToday = gainedExpFromRuns + passiveGained;
    cumulativeExp += totalGainedToday;

    const newExpTotal = partialExpAccumulator + totalGainedToday;
    const newLevels = Math.floor(newExpTotal / 10);
    partialExpAccumulator = newExpTotal % 10;

    const cratesEarnedToday = newLevels * cratesPerLevel;
    totalCratesGenerated += cratesEarnedToday;

    // Allocate earned crates as shards to active target
    let shardsToAlloc = cratesEarnedToday * R_crate;
    const milestonesReachedToday = [];

    while (activeTargetIdx < targetProgress.length && shardsToAlloc > 0) {
      const cur = targetProgress[activeTargetIdx];
      const needed = cur.cost - cur.currentShards;
      const alloc = Math.min(shardsToAlloc, needed);
      cur.currentShards += alloc;
      shardsToAlloc -= alloc;
      if (cur.currentShards >= cur.cost && !cur.completed) {
        cur.completed = true;
        cur.completedDay = i + 1;
        cur.completedDate = `${weekdayStr}, ${dateStr}`;
        milestonesReachedToday.push({
          name: cur.name,
          sinnerId: cur.sinnerId,
          sinnerName: cur.sinnerName,
          cost: cur.cost,
          day: i + 1,
          date: `${weekdayStr}, ${dateStr}`
        });
        activeTargetIdx++;
      }
    }

    const currentActiveTarget = activeTargetIdx < targetProgress.length ? targetProgress[activeTargetIdx] : null;

    roadmap.push({
      day: i + 1,
      date: dateStr,
      weekday: weekdayStr,
      isToday,
      isWeeklyReset,
      runs: runsCountToday,
      runsList: runsList,
      gainedExpFromRuns: gainedExpFromRuns,
      dailyExpGained,
      weeklyExpGained,
      passiveGained: passiveGained,
      gained: totalGainedToday,
      totalExp: cumulativeExp,
      modulesUsed: modulesUsedToday,
      cratesEarnedToday,
      totalCratesGenerated,
      milestonesReachedToday,
      activeFarmingTarget: currentActiveTarget ? {
        name: currentActiveTarget.name,
        sinnerId: currentActiveTarget.sinnerId,
        sinnerName: currentActiveTarget.sinnerName,
        currentShards: Math.floor(currentActiveTarget.currentShards),
        targetCost: currentActiveTarget.cost
      } : null
    });

    // 6. Reset daily flags for next day simulation
    currentDailiesDone = false;
  }
  
  return { 
    roadmap, 
    totalModulesNeeded, 
    targetMilestones: targetProgress 
  };
}

