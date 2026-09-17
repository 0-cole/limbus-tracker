/**
 * src/utils/seasonUtils.js
 * Automatic timezone conversion between KST (Korea Standard Time) and the User's Local Time (EST/EDT/etc.)
 */

// Default Project Moon Season End maintenance target (Season 8 just started, end date is Unknown/TBA)
export const DEFAULT_SEASON_END_KST = null;
export const DEFAULT_SEASON_END_DATE = 'Unknown';

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
  if (!isoOrDateString || isoOrDateString === 'Unknown' || isoOrDateString === 'TBA') return '';
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
  if (!isoOrDateString || isoOrDateString === 'Unknown' || isoOrDateString === 'TBA') return 'Unknown / TBA';
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return 'Unknown / TBA';
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
  if (!isoOrDateString || isoOrDateString === 'Unknown' || isoOrDateString === 'TBA') return 'Unknown / TBA';
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return 'Unknown / TBA';
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
  if (!value || value === 'Unknown' || value === 'TBA') return null;

  let iso = null;

  // If already contains timezone or is standard ISO
  if (value.includes('Z') || value.includes('+') || (value.includes('-') && value.length > 16 && value.charAt(10) === 'T')) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) iso = d.toISOString();
  } else {
    // If entered from a local datetime-local input (e.g. "2026-09-16T21:00")
    const localDate = new Date(value);
    if (!isNaN(localDate.getTime())) {
      iso = localDate.toISOString();
    } else {
      iso = `${value}:00+09:00`;
    }
  }

  // If the parsed date is already in the past, season has transitioned to Season 8 -> treat as Unknown
  if (iso) {
    const endMs = new Date(iso).getTime();
    if (!isNaN(endMs) && endMs <= Date.now()) {
      return null;
    }
    return iso;
  }

  return null;
}

