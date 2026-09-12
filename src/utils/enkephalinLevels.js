import enkephalinCaps from '../data/enkephalinCap.json';

/**
 * Limbus Company Official Manager Level -> Enkephalin Cap Table (Levels 1 - 300)
 * Source: Limbus Company Wiki
 */
export const ENKEPHALIN_CAPS = enkephalinCaps;

/**
 * Returns the exact official Enkephalin cap for a given Manager Level (1 - 300).
 * Level 1 starts at 60, Level 35 is 119, Level 300 caps at 216.
 */
export function getEnkephalinCapForLevel(level) {
  const lvl = Math.max(1, Math.min(300, parseInt(level) || 1));
  return ENKEPHALIN_CAPS[String(lvl)] || (lvl <= 1 ? 60 : 216);
}

/**
 * Recalculates passive Enkephalin regeneration that occurred while the app was closed or running.
 * Rate: 1 Enkephalin per 6 minutes (10 per hour).
 * Preserves fractional progress toward the next point and respects max cap / overfill.
 */
export function recalculateEnkephalin(inventory = {}) {
  const now = Date.now();
  const companyLevel = Math.max(1, Math.min(300, parseInt(inventory.companyLevel) || 35));
  const maxCap = getEnkephalinCapForLevel(companyLevel);
  const current = inventory.enkephalin !== undefined ? inventory.enkephalin : maxCap;
  const lastSynced = inventory.enkephalinLastSynced || now;

  // If already at or above cap (e.g. overfilled from level up or boxes), no passive regen occurs
  if (current >= maxCap) {
    return {
      ...inventory,
      companyLevel,
      maxEnkephalin: maxCap,
      enkephalin: current,
      enkephalinLastSynced: now
    };
  }

  const elapsedMs = Math.max(0, now - lastSynced);
  const msPerPoint = 6 * 60 * 1000; // 6 minutes per point
  const pointsGained = Math.floor(elapsedMs / msPerPoint);

  if (pointsGained <= 0) {
    return {
      ...inventory,
      companyLevel,
      maxEnkephalin: maxCap,
      enkephalin: current
    };
  }

  const newEnkephalin = Math.min(maxCap, current + pointsGained);
  const remainderMs = elapsedMs % msPerPoint;
  const newLastSynced = newEnkephalin >= maxCap ? now : (now - remainderMs);

  return {
    ...inventory,
    companyLevel,
    maxEnkephalin: maxCap,
    enkephalin: newEnkephalin,
    enkephalinLastSynced: newLastSynced
  };
}

/**
 * Returns formatted time string until next Enkephalin point and until full.
 */
export function getEnkephalinCountdown(inventory = {}) {
  const now = Date.now();
  const companyLevel = Math.max(1, Math.min(300, parseInt(inventory.companyLevel) || 35));
  const maxCap = getEnkephalinCapForLevel(companyLevel);
  const current = inventory.enkephalin !== undefined ? inventory.enkephalin : maxCap;
  const lastSynced = inventory.enkephalinLastSynced || now;

  if (current >= maxCap) {
    return { isFull: true, nextPointStr: 'Full', fullTimeStr: 'Full' };
  }

  const elapsedMs = Math.max(0, now - lastSynced);
  const msPerPoint = 6 * 60 * 1000;
  const msIntoCycle = elapsedMs % msPerPoint;
  const msToNext = msPerPoint - msIntoCycle;
  const nextMinutes = Math.floor(msToNext / 60000);
  const nextSeconds = Math.floor((msToNext % 60000) / 1000);

  const missingPoints = maxCap - current;
  const totalMsNeeded = msToNext + ((missingPoints - 1) * msPerPoint);
  const fullTargetDate = new Date(now + totalMsNeeded);
  const fullTimeStr = fullTargetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return {
    isFull: false,
    nextPointStr: `${nextMinutes}m ${nextSeconds < 10 ? '0' : ''}${nextSeconds}s`,
    fullTimeStr
  };
}
