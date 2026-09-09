/**
 * src/utils/timeUtils.js
 * Timezone and Reset Architecture for KST (Korean Standard Time)
 */

export function getNextResets(nowMs = Date.now()) {
  const now = new Date(nowMs);
  
  // Daily Reset: 21:00 UTC (06:00 KST)
  const nextDaily = new Date(now);
  nextDaily.setUTCHours(21, 0, 0, 0);
  if (nextDaily.getTime() <= nowMs) {
    nextDaily.setUTCDate(nextDaily.getUTCDate() + 1);
  }

  // Weekly Reset: Wednesday 21:00 UTC (Thursday 06:00 KST)
  const nextWeekly = new Date(nextDaily);
  while (nextWeekly.getUTCDay() !== 3) {
    nextWeekly.setUTCDate(nextWeekly.getUTCDate() + 1);
  }

  // MD Weekly Reset: Also Wednesday 21:00 UTC (Thursday 06:00 KST). 
  // While maintenance usually blocks logins until 12:00 KST, the server's actual weekly changeover threshold is 06:00 KST.
  const nextMdWeekly = new Date(nextWeekly);

  return {
    nextDaily: nextDaily.getTime(),
    nextWeekly: nextWeekly.getTime(),
    nextMdWeekly: nextMdWeekly.getTime()
  };
}

export function checkResets(lastUpdatedIso) {
  if (!lastUpdatedIso) return { hasDailyReset: true, hasWeeklyReset: true, hasMdWeeklyReset: true, now: Date.now() };

  const nowMs = Date.now();
  const lastMs = new Date(lastUpdatedIso).getTime();
  
  const lastResets = getNextResets(lastMs);

  return {
    hasDailyReset: nowMs >= lastResets.nextDaily,
    hasWeeklyReset: nowMs >= lastResets.nextWeekly,
    hasMdWeeklyReset: nowMs >= lastResets.nextMdWeekly,
    now: nowMs
  };
}

export function getRemainingCycles(seasonEndDateIso) {
  if (!seasonEndDateIso || seasonEndDateIso === 'Unknown') return { daysLeft: 120, weeksLeft: 17 };
  
  const endMs = new Date(seasonEndDateIso).getTime();
  const nowMs = Date.now();
  
  if (endMs <= nowMs) return { daysLeft: 0, weeksLeft: 0 };

  // Calculate remaining days based on daily resets
  let daysLeft = 0;
  let cursorMs = nowMs;
  while(cursorMs < endMs) {
      let nextResets = getNextResets(cursorMs);
      if (nextResets.nextDaily <= endMs) {
          daysLeft++;
          cursorMs = nextResets.nextDaily;
      } else {
          // If we reach here, the next reset is past the end date.
          // Add 1 more day for the final partial day if endMs is strictly after cursorMs
          if (endMs > cursorMs) daysLeft++;
          break;
      }
  }

  // Calculate remaining weeks based on weekly resets
  let weeksLeft = 0;
  cursorMs = nowMs;
  while(cursorMs < endMs) {
      let nextResets = getNextResets(cursorMs);
      if (nextResets.nextWeekly <= endMs) {
          weeksLeft++;
          cursorMs = nextResets.nextWeekly;
      } else {
          if (endMs > cursorMs) weeksLeft++;
          break;
      }
  }

  return { daysLeft, weeksLeft };
}
