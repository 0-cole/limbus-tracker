import sinnersData from '../data/sinners.json';

/**
 * Normalizes text by removing diacritics / macrons (e.g., Ryōshū -> ryoshu, café -> cafe).
 */
export function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ōŌ]/g, 'o')
    .replace(/[ūŪ]/g, 'u')
    .toLowerCase()
    .trim();
}

/**
 * Normalizes any sinner identifier (e.g. "Ryōshū", "ryoshu", "Yi Sang", "yi-sang", "don-quixote")
 * into its canonical slug ID (matching sinners.json id).
 */
export function normalizeSinnerId(sinner) {
  if (!sinner) return '';
  const norm = normalizeText(sinner).replace(/[\s-_]/g, '');
  if (norm.startsWith('yisang')) return 'yi-sang';
  if (norm.startsWith('don')) return 'don-quixote';
  if (norm.startsWith('hong')) return 'hong-lu';
  if (norm.startsWith('ryoshu')) return 'ryoshu';
  if (norm.startsWith('meursault')) return 'meursault';
  if (norm.startsWith('heathcliff')) return 'heathcliff';
  if (norm.startsWith('ishmael')) return 'ishmael';
  if (norm.startsWith('rodion') || norm.startsWith('rodya')) return 'rodion';
  if (norm.startsWith('sinclair')) return 'sinclair';
  if (norm.startsWith('outis')) return 'outis';
  if (norm.startsWith('gregor')) return 'gregor';
  if (norm.startsWith('faust')) return 'faust';
  return norm;
}

/**
 * Retrieves the full sinner object from sinners.json given any variation of sinner name or ID.
 */
export function getSinnerInfo(sinner) {
  if (!sinner) return null;
  const targetId = normalizeSinnerId(sinner);
  return sinnersData.find(s => s.id === targetId || normalizeSinnerId(s.name) === targetId) || null;
}

export const CANONICAL_SINNER_ORDER = [
  'yi-sang',
  'faust',
  'don-quixote',
  'ryoshu',
  'meursault',
  'hong-lu',
  'heathcliff',
  'ishmael',
  'rodion',
  'sinclair',
  'outis',
  'gregor'
];

export function getSinnerSortIndex(sinner) {
  const norm = normalizeSinnerId(sinner);
  const idx = CANONICAL_SINNER_ORDER.indexOf(norm);
  return idx === -1 ? 99 : idx;
}

/**
 * Extracts a numeric season for reliable sorting (e.g. "Season 7 Burn-Bleed Hybrid" -> 7, null -> 0).
 */
export function parseSeasonNumber(season) {
  if (season === null || season === undefined || season === 'Standard') return 0;
  if (typeof season === 'number') return season;
  const match = String(season).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Robust image URL generator for Identities and E.G.O with automatic fallbacks.
 */
export function getCardImageUrl(item, isEgo = false) {
  if (!item) return null;
  const slug = item.slug;
  if (!slug) return null;

  if (isEgo || item.grade) {
    return `https://assets.limbusdeck.com/egos/full/${slug}.webp`;
  }

  // 1-star Base IDs are at /identities/full/, 2-star & 3-star are at /identities/full-uptied/
  if (item.rarity === 1) {
    return `https://assets.limbusdeck.com/identities/full/${slug}.webp`;
  }
  return `https://assets.limbusdeck.com/identities/full-uptied/${slug}.webp`;
}

