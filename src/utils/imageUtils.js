export function getEntityImageUrl(item) {
  if (!item) return '';
  if (item.slug) {
    if (item.grade) {
      return `https://assets.limbusdeck.com/egos/full/${item.slug}.webp`;
    }
    return `https://assets.limbusdeck.com/identities/full-uptied/${item.slug}.webp`;
  }
  
  // Use Wiki's Special:FilePath which automatically redirects to the correct image hash path
  let fileName = item.name.replace(/\[.*?\]/g, '').replace(/\|\|\|\|/g, '').replace(/\|\|/g, '').trim().replace(/ /g, '_');
  
  if (item.grade || item.rarity) {
    // It's an EGO or an ID. 
    // Both usually use "[Name] Icon.png" on the wiki for the small square picture.
    fileName += '_Icon.png';
  }
  
  return `https://limbuscompany.wiki.gg/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}
