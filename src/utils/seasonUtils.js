// This is intentionally editable in the Schedule page whenever Project Moon
// announces the next season's end. Values are interpreted as Korea Standard Time.
export const DEFAULT_SEASON_END_DATE = '2026-09-17T10:00';

export function getSeasonEndDate(bpState) {
  const value = bpState?.seasonEndDate || DEFAULT_SEASON_END_DATE;
  return `${value}:00+09:00`;
}
