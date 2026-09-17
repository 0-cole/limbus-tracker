/**
 * src/utils/limbusCalculator.js
 * Deterministic Engine & Roadmap Generator with Egoshard Allocation Milestones
 */
import { getRemainingCycles, getNextResets } from './timeUtils.js';
import { getSeasonEndDate } from './seasonUtils.js';

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

export function getShardabilityStatus(item, currentSeason = 8) {
  if (!item) return { shardable: true, label: 'Available', badge: 'Standard', color: 'gray', message: 'Available in Dispenser' };

  // Check Walpurgisnacht: season === null or undefined, or flagged isWalpurgis
  const isWalpurgis = item.season === null || item.season === undefined || item.isWalpurgis === true;
  if (isWalpurgis) {
    return {
      shardable: false,
      reason: 'walpurgis',
      badge: 'Walpurgis',
      fullBadge: 'Walpurgisnacht Exclusive',
      color: 'purple',
      message: 'Cannot be sharded until Walpurgisnacht (Date TBA)'
    };
  }

  const seasonNum = typeof item.season === 'number' ? item.season : parseInt(item.season);

  // Previous season (Season 7 in Season 8) is locked from Dispenser sharding
  if (seasonNum === 7) {
    return {
      shardable: false,
      reason: 'previous_season',
      badge: 'Season 7 (Locked)',
      fullBadge: 'Season 7 (Locked)',
      color: 'zinc',
      message: 'Unshardable in Dispenser during Season 8 (Extraction Only)'
    };
  }

  // Current Season (Season 8)
  if (seasonNum === currentSeason) {
    return {
      shardable: true,
      reason: 'current_season',
      badge: `Season ${currentSeason}`,
      fullBadge: `Season ${currentSeason}`,
      color: 'gold',
      message: `Available in Season ${currentSeason} Dispenser`
    };
  }

  // Standard (Season 0)
  if (seasonNum === 0 || isNaN(seasonNum)) {
    return {
      shardable: true,
      reason: 'standard',
      badge: 'Standard',
      fullBadge: 'Standard Fare',
      color: 'gray',
      message: 'Always available in Dispenser'
    };
  }

  // Past Seasons 1 to 6
  if (seasonNum > 0 && seasonNum < (currentSeason - 1)) {
    return {
      shardable: true,
      reason: 'past_season',
      badge: `Season ${seasonNum}`,
      fullBadge: `Season ${seasonNum}`,
      color: 'blue',
      message: 'Available in Dispenser'
    };
  }

  return {
    shardable: true,
    reason: 'standard',
    badge: `Season ${seasonNum}`,
    fullBadge: `Season ${seasonNum}`,
    color: 'gray',
    message: 'Available in Dispenser'
  };
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
  
  const asapMode = bpState?.asapMode === true || bpState?.relyOnMds === true;

  // In ASAP Mode, we rely on Mirror Dungeons directly to reach our shard goals ASAP
  // rather than waiting days/weeks for passive daily logins and future weekly resets to slowly bridge the gap.
  const futureDailyExp = asapMode ? 0 : Math.max(0, daysLeft - 1) * 10;
  const futureWeeklyExp = asapMode ? 0 : Math.max(0, weeksLeft - 1) * 20;

  const todayDailyExp = asapMode ? 0 : Math.max(0, (5 - (scheduleState?.dailiesProgress || 0)) * 2);
  const currentWeekliesProg = scheduleState?.weekliesProgress !== undefined ? scheduleState.weekliesProgress : (scheduleState?.weekliesDone ? 5 : 0);
  const todayWeeklyExp = asapMode ? 0 : Math.max(0, (5 - currentWeekliesProg) * 4);

  const truePassiveExp = futureDailyExp + futureWeeklyExp + todayDailyExp + todayWeeklyExp;

  // 5. Active Grind Output
  const BASE_MD_EXP = 30; 
  let expDeficitAfterPassive = Math.max(0, bpExpNeeded - truePassiveExp);
  
  let plannedRuns = [];
  // In ASAP mode, the player wants to grind NOW and does not wait weeks for future reset cycles.
  // We only count bonuses available right now this week.
  let availableBonuses = asapMode
    ? Math.max(0, 3 - (scheduleState?.mdBonusesClaimed || 0))
    : Math.max(0, weeksLeft - 1) * 3 + (3 - (scheduleState?.mdBonusesClaimed || 0));
  
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
  const asapMode = bpState?.asapMode === true || bpState?.relyOnMds === true;
  const customDailyRuns = Math.max(1, bpState?.customDailyRuns || 3);
  let totalRunsLeft = plannedRuns.length;
  
  const totalSeasonDays = Math.max(1, daysLeft > 0 ? daysLeft : 260);
  const availableDays = Math.min(totalSeasonDays, 30);
  const baseMdsPerDay = Math.floor(totalRunsLeft / totalSeasonDays);
  let remainderMds = totalRunsLeft % totalSeasonDays;
  let remainingRunsPool = totalRunsLeft;
  
  let cumulativeExp = 0;
  
  // Track our current date cursor to simulate weekly resets
  let cursorMs = Date.now();
  let nextWeeklyResetMs = getNextResets(cursorMs).nextWeekly;
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Count how many bonus runs have already been logged today vs. the mdBonusesClaimed total.
  // This prevents the roadmap from suggesting bonus runs that the player already did today
  // via Quick Log (which already incremented mdBonusesClaimed).
  const todayLoggedRuns = scheduleState?.todayLoggedRuns || [];
  const todayBonusesUsed = todayLoggedRuns.reduce((sum, r) => sum + (r.bonusUsed || 0), 0);
  const todayExpLogged = todayLoggedRuns.reduce((sum, r) => sum + (r.exp || 0), 0);

  // currentBonuses = bonuses still available for the rest of the week
  // (mdBonusesClaimed already includes today's Quick Log runs)
  let currentBonuses = Math.max(0, 3 - (scheduleState?.mdBonusesClaimed || 0));
  let currentDailiesDone = (scheduleState?.dailiesProgress || 0) >= 5;
  let currentWeekliesDone = scheduleState?.weekliesDone || false;
  let currentWeekliesProg = scheduleState?.weekliesProgress !== undefined ? scheduleState.weekliesProgress : (currentWeekliesDone ? 5 : 0);
  const effectiveHasMdHard = (bpState?.canto === undefined || bpState?.canto >= 8) && (bpState?.preferHardMd !== false) && (bpState?.hasMdHard !== false);

  
  const safeMath = bpState?.safeMath === true;
  const R_crate = safeMath ? 1.5 : 2.0;
  const cratesPerLevel = bpState?.isPremium ? 3 : 1;

  // 1. Prepare Target Items & Progress for Egoshard Milestones
  const shardsInventory = inventory?.shards || {};
  const wishlistArr = Array.isArray(wishlist) ? wishlist : Array.from(wishlist || []);

  // Track remaining available inventory shards per Sinner so duplicate Sinners cascade properly in priority order
  const availableShards = {};
  for (const item of wishlistArr) {
    const sinnerKey = item.sinner || item.sinnerId;
    const normSinner = normalizeSinnerId(sinnerKey);
    if (!(normSinner in availableShards)) {
      availableShards[normSinner] = getOwnedShards(shardsInventory, sinnerKey || normSinner);
    }
  }

  let targetProgress = wishlistArr.map((item, index) => {
    const sinnerKey = item.sinner || item.sinnerId;
    const sinnerId = normalizeSinnerId(sinnerKey);
    const cost = item.rarity === '00' ? 150 : 400;

    // Allocate available shards strictly in priority order
    const curAvail = availableShards[sinnerId] || 0;
    const allocatedFromOwned = Math.min(cost, curAvail);
    availableShards[sinnerId] = Math.max(0, curAvail - allocatedFromOwned);

    const remaining = Math.max(0, cost - allocatedFromOwned);
    const alreadyCraftable = allocatedFromOwned >= cost;
    const shardStatus = getShardabilityStatus(item);

    return {
      priority: index + 1,
      name: item.name || sinnerId,
      sinnerId,
      sinnerName: item.sinner || sinnerId,
      rarity: item.rarity || '000',
      cost,
      startingShards: allocatedFromOwned,
      ownedShards: allocatedFromOwned,
      currentShards: allocatedFromOwned,
      remainingDeficit: remaining,
      alreadyCraftable,
      completed: alreadyCraftable,
      completedDay: alreadyCraftable ? 0 : null,
      completedDate: alreadyCraftable ? 'Already Craftable' : null,
      shardStatus
    };
  });

  // Preserve wishlist priority order (do NOT sort by remaining deficit)

  let activeTargetIdx = 0;
  // Advance past already completed targets
  while (activeTargetIdx < targetProgress.length && targetProgress[activeTargetIdx].completed) {
    activeTargetIdx++;
  }

  // Pre-allocate existing nominable crates in inventory
  let initialNominableCrates = inventory?.nominableCrates || 0;
  const initialInventoryCompletedTargets = [];
  while (activeTargetIdx < targetProgress.length && initialNominableCrates > 0) {
    const cur = targetProgress[activeTargetIdx];
    if (cur.completed) {
      activeTargetIdx++;
      continue;
    }
    const needed = cur.cost - cur.currentShards;
    const cratesToUse = Math.min(initialNominableCrates, Math.ceil(needed / R_crate));
    const shardYield = cratesToUse * R_crate;
    cur.currentShards = Math.min(cur.cost, cur.currentShards + shardYield);
    initialNominableCrates -= cratesToUse;
    cur.cratesUsedFromInventory = (cur.cratesUsedFromInventory || 0) + cratesToUse;
    if (cur.currentShards >= cur.cost) {
      cur.completed = true;
      cur.completedDay = 1;
      cur.completedDate = `Day 1 (Using ${cur.cratesUsedFromInventory} Inventory Crates)`;
      cur.isInventoryCraft = true;
      initialInventoryCompletedTargets.push({
        priority: cur.priority,
        name: cur.name,
        sinnerId: cur.sinnerId,
        sinnerName: cur.sinnerName,
        cost: cur.cost,
        day: 1,
        date: 'Day 1',
        isInventoryCraft: true,
        cratesUsed: cur.cratesUsedFromInventory,
        shardStatus: cur.shardStatus
      });
      activeTargetIdx++;
    }
  }

  let totalModulesNeeded = 0;
  let partialExpAccumulator = bpState?.currentExp || 0;
  let totalCratesGenerated = 0;

  const seasonEndIso = getSeasonEndDate(bpState);
  const seasonEndMs = seasonEndIso ? new Date(seasonEndIso).getTime() : null;

  for (let i = 0; i < availableDays; i++) {
    // 1. Calendar Date & Weekly Reset for Day i
    const isToday = i === 0;
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekdayStr = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Hard cutoff: If this calendar day starts strictly after the season has already ended, stop generating days.
    const dayStartMs = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0).getTime();
    if (seasonEndMs && seasonEndMs > Date.now() && dayStartMs >= seasonEndMs) {
      break;
    }

    const nextDayStartMs = dayStartMs + 24 * 60 * 60 * 1000;
    const isSeasonEndDay = seasonEndMs ? (seasonEndMs > dayStartMs && seasonEndMs <= nextDayStartMs) : false;
    const seasonEndLocalTime = isSeasonEndDay ? new Date(seasonEndMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

    // Check if the upcoming weekly reset falls on this calendar day
    const dayEndMs = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999).getTime();
    let isWeeklyReset = false;
    if (!isToday && nextWeeklyResetMs <= dayEndMs) {
      isWeeklyReset = true;
      nextWeeklyResetMs += 7 * 24 * 60 * 60 * 1000;
      // On the weekly reset day, bonuses refresh to 3 and weeklies reset
      currentBonuses = 3;
      currentWeekliesDone = false;
      currentWeekliesProg = 0;
    }

    // 2. Calculate how many runs to do today
    const allTargetsAlreadyCompleted = targetProgress.length > 0 && targetProgress.every(t => t.completed);
    let runsCountToday = 0;
    if (allTargetsAlreadyCompleted) {
      // All wishlist targets are already completed! Rest and enjoy.
      runsCountToday = 0;
    } else if (paceMode === 'rush') {
      runsCountToday = Math.min(customDailyRuns, remainingRunsPool);
    } else {
      runsCountToday = baseMdsPerDay;
      if (remainderMds > 0) {
         runsCountToday++;
         remainderMds--;
      }
      if (asapMode && runsCountToday === 0 && remainingRunsPool > 0) {
        runsCountToday = Math.min(1, remainingRunsPool);
      }
    }
    
    // 3. Perform runs and consume bonuses
    let gainedExpFromRuns = 0;
    let runsList = [];
    let modulesUsedToday = 0;
    // Dailies always cost 5 modules if not yet done
    if (!currentDailiesDone) modulesUsedToday += 5;

    // For today (day 0): only suggest runs that haven't been logged yet.
    // todayLoggedRuns are already in the store, so we subtract them from
    // what the roadmap would otherwise suggest, and pre-credit their EXP.
    const plannedRunsToday = runsCountToday;
    let effectiveRunsCountToday = runsCountToday;
    if (isToday) {
      if (scheduleState?.mdTodayDone) {
        effectiveRunsCountToday = 0;
      } else if (todayLoggedRuns.length > 0) {
        // Clamp remaining runs to what's still needed after already-logged ones
        effectiveRunsCountToday = Math.max(0, runsCountToday - todayLoggedRuns.length);
      }
    }
    const runsToDeductFromPool = isToday ? effectiveRunsCountToday : runsCountToday;
    remainingRunsPool = Math.max(0, remainingRunsPool - runsToDeductFromPool);

    for(let r=0; r<effectiveRunsCountToday; r++){
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
    // Note: Do NOT add `todayExpLogged` into `gainedExpFromRuns` here.
    // Runs already logged today have already been credited to the player's live inventory,
    // shards, and battle pass level. Day 1 forward simulation must strictly calculate crates
    // and EXP from uncompleted, remaining runs so resources are not double-counted.

    // 4. Passive EXP
    const todayDailyExpRemaining = Math.max(0, (5 - (scheduleState?.dailiesProgress || 0)) * 2);
    let dailyExpGained = asapMode ? 0 : (isToday ? todayDailyExpRemaining : (!currentDailiesDone ? 10 : 0));
    const todayWeeklyExpRemaining = Math.max(0, (5 - currentWeekliesProg) * 4);
    let weeklyExpGained = asapMode ? 0 : (isToday ? todayWeeklyExpRemaining : ((!currentWeekliesDone && isWeeklyReset) ? 20 : 0));
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
    if (isToday && initialInventoryCompletedTargets.length > 0) {
      milestonesReachedToday.push(...initialInventoryCompletedTargets);
    }

    while (activeTargetIdx < targetProgress.length && shardsToAlloc > 0) {
      const cur = targetProgress[activeTargetIdx];
      if (cur.completed) {
        activeTargetIdx++;
        continue;
      }
      const needed = cur.cost - cur.currentShards;
      const alloc = Math.min(shardsToAlloc, needed);
      cur.currentShards += alloc;
      shardsToAlloc -= alloc;
      if (cur.currentShards >= cur.cost && !cur.completed) {
        cur.completed = true;
        cur.completedDay = i + 1;
        cur.completedDate = `${weekdayStr}, ${dateStr}`;
        milestonesReachedToday.push({
          priority: cur.priority,
          name: cur.name,
          sinnerId: cur.sinnerId,
          sinnerName: cur.sinnerName,
          cost: cur.cost,
          day: i + 1,
          date: `${weekdayStr}, ${dateStr}`,
          shardStatus: cur.shardStatus
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
      isSeasonEndDay,
      seasonEndLocalTime,
      runs: runsCountToday,
      plannedRuns: plannedRunsToday,
      remainingRuns: isToday ? effectiveRunsCountToday : runsCountToday,
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
        priority: currentActiveTarget.priority,
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

