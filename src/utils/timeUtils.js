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

  // Local time windows for clear roadmap demarcation
  // Pre-Reset Window: 12:00 AM (midnight) up to the daily reset (e.g. 5:00 PM local)
  // Post-Reset Window: Daily reset up to 11:59 PM (midnight)
  const isPreResetWindow = !isAfterResetToday;
  const windowPhase = isPreResetWindow ? 'Pre-Reset Window' : 'Post-Reset Window';
  const windowTimeRange = isPreResetWindow 
    ? `12:00 AM – ${resetLocalTime}` 
    : `${startLocalTime} – 11:59 PM`;
  const windowDesc = isPreResetWindow
    ? `Finishing today's server cycle (Cycle ends at ${resetLocalTime} today / 06:00 KST)`
    : `New server cycle active (Cycle resets at ${resetLocalTime} tomorrow / 06:00 KST)`;

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
    isPreResetWindow,
    windowPhase,
    windowTimeRange,
    windowDesc,
    explanation: isAfterResetToday
      ? `Today's ${startLocalTime} reset has passed. You are currently in the ${cycleDayName} cycle (Server Day: ${cycleDateLabel}). It remains active until ${resetLocalTime} tomorrow.`
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
  if (!seasonEndDateIso || seasonEndDateIso === 'Unknown' || seasonEndDateIso === 'TBA') {
    return { daysLeft: 260, weeksLeft: 37, isUnknown: true };
  }
  
  const endMs = new Date(seasonEndDateIso).getTime();
  const nowMs = Date.now();
  
  // If end date has passed, season 8 has begun -> fallback to nominal season length (~8.5 months / 260 days)
  if (isNaN(endMs) || endMs <= nowMs) {
    return { daysLeft: 260, weeksLeft: 37, isUnknown: true };
  }

  const now = new Date(nowMs);
  
  // Calculate remaining calendar days that have playable time before endMs.
  // A calendar day has playable time if its start (00:00 local time) is strictly before endMs.
  let daysLeft = 0;
  let cursorDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  while (cursorDay.getTime() < endMs) {
    daysLeft++;
    cursorDay.setDate(cursorDay.getDate() + 1);
  }

  // Calculate remaining weekly resets that occur strictly before endMs.
  let weeksLeft = 0;
  let cursorMs = nowMs;
  while (cursorMs < endMs) {
    let nextResets = getNextResets(cursorMs);
    if (nextResets.nextWeekly < endMs) {
      weeksLeft++;
      cursorMs = nextResets.nextWeekly + 1000;
    } else {
      break;
    }
  }

  return { daysLeft, weeksLeft };
}
