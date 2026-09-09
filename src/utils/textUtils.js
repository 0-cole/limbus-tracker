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
  if (norm.startsWith('rodion')) return 'rodion';
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
