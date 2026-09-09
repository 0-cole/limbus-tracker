import { getCardImageUrl } from './textUtils.js';

export function getEntityImageUrl(item) {
  if (!item) return '';
  const url = getCardImageUrl(item, item.type === 'ego' || !!item.grade);
  if (url) return encodeURI(url);
  
  // Fallback
  let fileName = item.name.replace(/\[.*?\]/g, '').replace(/\|\|\|\|/g, '').replace(/\|\|/g, '').trim().replace(/ /g, '_');
  if (item.grade || item.rarity) {
    fileName += '_Icon.png';
  }
  return `https://limbuscompany.wiki.gg/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

