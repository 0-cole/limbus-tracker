/**
 * src/utils/seasonUtils.js
 * Automatic timezone conversion between KST (Korea Standard Time) and the User's Local Time (EST/EDT/etc.)
 */

// Default Project Moon Season End maintenance target in KST (UTC+9)
export const DEFAULT_SEASON_END_KST = '2026-09-17T10:00:00+09:00';
export const DEFAULT_SEASON_END_DATE = '2026-09-17T10:00';

export function getUserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch (e) {
    return 'America/New_York';
  }
}

export function getUserTimeZoneShort() {
  try {
    const parts = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date());
    return parts.find(p => p.type === 'timeZoneName')?.value || 'EST';
  } catch (e) {
    return 'EST';
  }
}

// Convert an ISO / KST timestamp to a value suitable for <input type="datetime-local"> in local time
export function toLocalInputString(isoOrDateString) {
  if (!isoOrDateString) return '';
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Format local date/time with timezone (e.g. "Sep 16, 2026, 9:00 PM EDT")
export function formatLocalDateTime(isoOrDateString) {
  if (!isoOrDateString) return 'Unknown';
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
}

// Format KST date/time (e.g. "Sep 17, 2026, 10:00 AM KST")
export function formatKstDateTime(isoOrDateString) {
  if (!isoOrDateString) return 'Unknown';
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString('en-US', {
    timeZone: 'Asia/Seoul',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
}

export function getSeasonEndDate(bpState) {
  const value = bpState?.seasonEndDate;
  if (!value) return new Date(DEFAULT_SEASON_END_KST).toISOString();

  // If already contains timezone or is standard ISO
  if (value.includes('Z') || value.includes('+') || (value.includes('-') && value.length > 16 && value.charAt(10) === 'T')) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // If entered from a local datetime-local input (e.g. "2026-09-16T21:00")
  const localDate = new Date(value);
  if (!isNaN(localDate.getTime())) {
    return localDate.toISOString();
  }

  // Fallback as KST date
  return `${value}:00+09:00`;
}

