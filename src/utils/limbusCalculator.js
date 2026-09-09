/**
 * src/utils/limbusCalculator.js
 * Deterministic Engine & Roadmap Generator
 */
import { getRemainingCycles, getNextResets } from './timeUtils.js';

export function calculateLimbusGrind(
  wishlist,
  inventory,
  bpState,
  scheduleState,
  seasonEndDate
) {
  // 1. Deficit Math
  const targetShards = {};
  for (const item of wishlist) {
    const cost = item.rarity === '00' ? 150 : 400;
    targetShards[item.sinnerId] = (targetShards[item.sinnerId] || 0) + cost;
  }

  let totalShardDeficit = 0;
  for (const sinner of Object.keys(targetShards)) {
    const owned = inventory.shards[sinner] || 0;
    const deficit = Math.max(0, targetShards[sinner] - owned);
    totalShardDeficit += deficit;
  }

  // 2. Active Crate to EXP Conversion
  const R_crate = 2.0; // Expected shards per crate
  const netCratesNeeded = Math.max(0, Math.ceil(totalShardDeficit / R_crate) - inventory.nominableCrates);
  
  const cratesPerLevel = bpState.isPremium ? 3 : 1;
  const bpLevelsNeeded = Math.ceil(netCratesNeeded / cratesPerLevel);
  let bpExpNeeded = bpLevelsNeeded * 10;

  // Offset by current partial EXP
  if (bpState.currentExp > 0 && bpExpNeeded > 0) {
    bpExpNeeded = Math.max(0, bpExpNeeded - bpState.currentExp);
  }

  // 3. Time Remaining & Resets
  const { daysLeft, weeksLeft } = getRemainingCycles(seasonEndDate);

  // 4. Passive EXP Estimation
  const hardBonusYield = 225; // Hard Mode (3 bonuses at once)
  const normalBonusYield = 45; // Normal Mode (1 bonus)
  const bonusYield = bpState.hasMdHard ? hardBonusYield : normalBonusYield;
  
  const futureDailyExp = Math.max(0, daysLeft - 1) * 10;
  const futureWeeklyExp = Math.max(0, weeksLeft - 1) * 20;

  const truePassiveExp = futureDailyExp + futureWeeklyExp + 
    (scheduleState.dailiesProgress >= 5 ? 0 : 10) + 
    (scheduleState.weekliesDone ? 0 : 20);

  // 5. Active Grind Output
  const BASE_MD_EXP = 30; 
  let expDeficitAfterPassive = Math.max(0, bpExpNeeded - truePassiveExp);
  
  let plannedRuns = [];
  let availableBonuses = Math.max(0, weeksLeft - 1) * 3 + (3 - scheduleState.mdBonusesClaimed);
  
  // If user has Hard Mode, they consume 3 bonuses at once for 225 EXP.
  // If Normal Mode, they consume 1 bonus for 45 EXP.
  while (expDeficitAfterPassive > 0 && availableBonuses > 0) {
      if (bpState.hasMdHard && availableBonuses >= 3) {
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
    daysLeft
  };
}

export function generateRoadmap(
  daysLeft,
  plannedRuns,
  scheduleState,
  bpState
) {
  const roadmap = [];
  let totalRunsLeft = plannedRuns.length;
  
  const availableDays = daysLeft > 0 ? daysLeft : 1;
  const baseMdsPerDay = Math.floor(totalRunsLeft / availableDays);
  let remainderMds = totalRunsLeft % availableDays;
  
  let cumulativeExp = 0;
  
  // Track our current date cursor to simulate weekly resets
  let cursorMs = Date.now();
  let currentBonuses = Math.max(0, 3 - (scheduleState.mdBonusesClaimed || 0));
  let currentDailiesDone = scheduleState.dailiesProgress >= 5;
  let currentWeekliesDone = scheduleState.weekliesDone;
  
  let totalModulesNeeded = 0;

  for (let i = 0; i < availableDays; i++) {
    // 1. Calculate how many runs to do today
    let runsCountToday = baseMdsPerDay;
    if (remainderMds > 0) {
       runsCountToday++;
       remainderMds--;
    }
    
    // 2. Perform runs and consume bonuses
    let gainedExpFromRuns = 0;
    let runsList = [];
    for(let r=0; r<runsCountToday; r++){
        if (bpState && bpState.hasMdHard && currentBonuses >= 3) {
            currentBonuses -= 3;
            gainedExpFromRuns += 225;
            totalModulesNeeded += 18;
            runsList.push({ type: 'Hard Bonus', exp: 225 });
        } else if (currentBonuses >= 1) {
            currentBonuses -= 1;
            gainedExpFromRuns += 45;
            totalModulesNeeded += 5;
            runsList.push({ type: 'Normal Bonus', exp: 45 });
        } else {
            gainedExpFromRuns += 30;
            totalModulesNeeded += 5;
            runsList.push({ type: 'Normal', exp: 30 });
        }
    }

    // 3. Passive EXP
    let passiveGained = 0;
    if (!currentDailiesDone) passiveGained += 10;
    if (!currentWeekliesDone) passiveGained += 20;

    // 4. Record Day
    let totalGainedToday = gainedExpFromRuns + passiveGained;
    cumulativeExp += totalGainedToday;
    const weekdayStr = new Date(cursorMs).toLocaleDateString('en-US', { weekday: 'short' });

    roadmap.push({
      day: i + 1,
      weekday: weekdayStr,
      runs: runsCountToday,
      runsList: runsList,
      gainedExpFromRuns: gainedExpFromRuns,
      passiveGained: passiveGained,
      gained: totalGainedToday,
      totalExp: cumulativeExp
    });

    // 5. Advance Cursor to next day and trigger resets if necessary
    const resets = getNextResets(cursorMs);
    currentDailiesDone = false; // Tomorrow gives daily EXP again
    if (resets.nextWeekly === resets.nextDaily) {
        currentWeekliesDone = false;
    }
    if (resets.nextMdWeekly === resets.nextDaily) {
        currentBonuses = 3;
    } else if (resets.nextMdWeekly > cursorMs && resets.nextMdWeekly < resets.nextDaily) {
        currentBonuses = 3;
    }
    cursorMs = resets.nextDaily;
  }
  
  return { roadmap, totalModulesNeeded };
}
