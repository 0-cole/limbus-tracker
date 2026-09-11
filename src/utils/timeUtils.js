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

export function getLimbusCycleInfo(nowMs = Date.now()) {
  const now = new Date(nowMs);

  // Previous daily reset (when this 24-hour cycle began):
  const startDaily = new Date(nowMs);
  startDaily.setUTCHours(21, 0, 0, 0);
  if (startDaily.getTime() > nowMs) {
    startDaily.setUTCDate(startDaily.getUTCDate() - 1);
  }

  // Next daily reset (when this 24-hour cycle ends):
  const nextDaily = new Date(startDaily);
  nextDaily.setUTCDate(nextDaily.getUTCDate() + 1);

  // Active Cycle Key (YYYY-MM-DD in KST date)
  // Since reset is 21:00 UTC (06:00 KST), adding 3 hours to UTC aligns exactly with 00:00 KST date boundary
  const cycleDateObj = new Date(nowMs + 3 * 3600 * 1000);
  const cycleKey = cycleDateObj.toISOString().split('T')[0];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const cycleDayName = dayNames[cycleDateObj.getUTCDay()];
  const cycleMonthName = monthNames[cycleDateObj.getUTCMonth()];
  const cycleDayOfMonth = cycleDateObj.getUTCDate();
  const cycleDateLabel = `${cycleDayName}, ${cycleMonthName} ${cycleDayOfMonth}`;

  // Next reset formatted in local time
  const resetLocalTime = nextDaily.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const startLocalTime = startDaily.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Has today's reset already happened in local day?
  const isAfterResetToday = (startDaily.getDate() === now.getDate());

  const remainingMs = Math.max(0, nextDaily.getTime() - nowMs);
  const h = Math.floor(remainingMs / 3600000);
  const m = Math.floor((remainingMs % 3600000) / 60000);
  const remainingStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return {
    cycleKey,
    cycleDayName,
    cycleDateLabel,
    cycleStartMs: startDaily.getTime(),
    cycleEndMs: nextDaily.getTime(),
    remainingMs,
    remainingStr,
    resetLocalTime,
    startLocalTime,
    isAfterResetToday,
    explanation: isAfterResetToday
      ? `Today's 5:00 PM reset has passed. You are currently in the ${cycleDayName} cycle (Server Day: ${cycleDateLabel}). It remains active until ${resetLocalTime} tomorrow.`
      : `Currently in the ${cycleDayName} cycle (Server Day: ${cycleDateLabel}). Resets at ${resetLocalTime} today.`
  };
}

export function checkResets(lastUpdatedIso) {
  const nowMs = Date.now();
  if (!lastUpdatedIso) {
    const info = getLimbusCycleInfo(nowMs);
    return { 
      hasDailyReset: true, 
      hasWeeklyReset: true, 
      hasMdWeeklyReset: true, 
      now: nowMs,
      prevCycleKey: info.cycleKey,
      currentCycleKey: info.cycleKey
    };
  }

  const lastMs = new Date(lastUpdatedIso).getTime();
  const lastResets = getNextResets(lastMs);

  return {
    hasDailyReset: nowMs >= lastResets.nextDaily,
    hasWeeklyReset: nowMs >= lastResets.nextWeekly,
    hasMdWeeklyReset: nowMs >= lastResets.nextMdWeekly,
    now: nowMs,
    prevCycleKey: getLimbusCycleInfo(lastMs).cycleKey,
    currentCycleKey: getLimbusCycleInfo(nowMs).cycleKey
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
