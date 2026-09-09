import IdDetailsModal from '../components/IdDetailsModal.jsx';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Edit3, CheckCircle, Info } from 'lucide-react';
import { useStore } from '../stores/useStore.js';
import sinnersData from '../data/sinners.json';
import { normalizeText, normalizeSinnerId, getSinnerInfo, getSinnerSortIndex, parseSeasonNumber, getCardImageUrl } from '../utils/textUtils.js';

const SIN_COLORS = { Wrath: '#dc2626', Lust: '#ea580c', Sloth: '#ca8a04', Gluttony: '#16a34a', Gloom: '#0ea5e9', Pride: '#4f46e5', Envy: '#9333ea' };
const KEYWORD_COLORS = { Burn: '#ef4444', Bleed: '#dc2626', Tremor: '#d97706', Rupture: '#22c55e', Sinking: '#3b82f6', Poise: '#06b6d4', Charge: '#8b5cf6' };
const ATTACK_TYPES = ['Slash', 'Pierce', 'Blunt'];

function IdCard({ id, meta, acquired, onToggleAcquired, onEdit, onClickDetails }) {
  const sinnerInfo = getSinnerInfo(id.sinner);
  const [imgError, setImgError] = useState(false);
  const [useAltUrl, setUseAltUrl] = useState(false);
  
  // Use LimbusDeck CDN for images (slug stored in identities.json)
  const defaultBg = getCardImageUrl(id);
  const altBg = id.slug ? `https://assets.limbusdeck.com/identities/full/${id.slug}.webp` : null;
  const bgUrl = imgError ? null : (useAltUrl ? altBg : defaultBg);

  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
      className={`relative flex flex-col group overflow-hidden rounded-xl border-2 transition-all cursor-pointer h-64 ${acquired ? 'border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.2)]' : 'border-[#333] opacity-80 hover:opacity-100 hover:border-[#666]'}`}
      onClick={() => onClickDetails(id)}
    >
      {/* Background Art */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: bgUrl ? `url("${encodeURI(bgUrl)}")` : 'none' }}
      />
      {bgUrl && (
        <img 
          src={bgUrl} 
          onError={() => {
            if (!useAltUrl && altBg && altBg !== defaultBg) {
              setUseAltUrl(true);
            } else {
              setImgError(true);
            }
          }} 
          className="hidden" 
          alt="preload check" 
        />
      )}
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

      {/* Top Section */}
      <div className="relative flex justify-between items-start p-3 z-10">
        <div className="flex text-[#c9a84c] drop-shadow-md">
          {Array.from({length: id.rarity || 1}).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <p className="text-sm font-bold drop-shadow-md" style={{ color: sinnerInfo?.color || '#fff' }}>
          {sinnerInfo?.name || id.sinner}
        </p>
      </div>
      
      {/* Bottom Section */}
      <div className="relative mt-auto p-3 z-10">
        <h3 className="font-bold text-[16px] leading-tight text-white drop-shadow-md mb-2">{id.name}</h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {meta.keywords?.length > 0 ? meta.keywords.map(kw => (
            <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded text-white font-medium bg-black/60 border border-white/20 shadow-sm" style={{ borderColor: KEYWORD_COLORS[kw] }}>
              <span style={{color: KEYWORD_COLORS[kw]}}>●</span> {kw}
            </span>
          )) : (
            <span className="text-[10px] text-gray-400 font-mono bg-black/60 px-1 rounded border border-gray-600 shadow-sm">No Tags</span>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/20">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-xs flex items-center gap-1 text-gray-300 hover:text-white transition-colors bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
            <Edit3 size={12}/> Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleAcquired(id.name); }} className={`text-xs px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 backdrop-blur-sm ${acquired ? 'bg-[#c9a84c] text-black' : 'bg-black/60 text-white border border-white/20 hover:bg-white/20'}`}>
            {acquired ? <><CheckCircle size={12}/> Acquired</> : 'Acquire'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function IdentitiesPage() {
  const { identitiesData, acquiredIds, toggleAcquiredId, customMetadata, updateCustomMetadata } = useStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ sinners: new Set(), rarity: new Set(), sins: new Set(), attackTypes: new Set(), keywords: new Set() });
  const [showAcquiredOnly, setShowAcquiredOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');
  
  const [editingId, setEditingId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [category]: new Set(prev[category]) };
      if (newFilters[category].has(value)) newFilters[category].delete(value);
      else newFilters[category].add(value);
      return newFilters;
    });
  };

  const getMetadata = (id) => {
    if (customMetadata?.[id.name]) return customMetadata[id.name];
    
    let sins = new Set();
    let attackTypes = new Set();
    let keywords = new Set();
    
    // Check root level (fallback for old data structure)
    if (id.sins) id.sins.forEach(s => sins.add(s));
    if (id.attackTypes) id.attackTypes.forEach(s => attackTypes.add(s));
    if (id.keywords) id.keywords.forEach(s => keywords.add(s));
    
    // Extract from skills
    const skillsToScan = (id.upties && id.upties[4]) ? id.upties[4] : (id.skills || []);
    skillsToScan.forEach(skill => {
        if (skill.affinity) sins.add(skill.affinity);
        if (skill.sin) sins.add(skill.sin);
        if (skill.type) attackTypes.add(skill.type);
        if (skill.attackType) attackTypes.add(skill.attackType);
        
        // Very basic keyword extraction from effects
        const effectStr = JSON.stringify(skill.effects || []).toLowerCase();
        ['burn', 'bleed', 'tremor', 'poise', 'sinking', 'charge', 'rupture'].forEach(kw => {
            if (effectStr.includes(kw)) keywords.add(kw.charAt(0).toUpperCase() + kw.slice(1));
        });
    });
    
    return { 
      sins: Array.from(sins), 
      attackTypes: Array.from(attackTypes), 
      keywords: Array.from(keywords) 
    };
  };

  const filteredIdentities = useMemo(() => {
    const normSearch = normalizeText(search);
    const selectedSinnerIds = new Set(Array.from(filters.sinners).map(s => normalizeSinnerId(s)));

    let result = (identitiesData || []).filter(id => {
      if (id.grade) return false; // EGO safety filter
      if (normSearch) {
        const normName = normalizeText(id.name);
        const normSinner = normalizeText(id.sinner);
        if (!normName.includes(normSearch) && !normSinner.includes(normSearch)) return false;
      }
      if (showAcquiredOnly && !acquiredIds.has(id.name)) return false;
      if (selectedSinnerIds.size > 0 && !selectedSinnerIds.has(normalizeSinnerId(id.sinner))) return false;
      if (filters.rarity.size > 0 && !filters.rarity.has(id.rarity)) return false;
      
      const meta = getMetadata(id);
      if (filters.sins.size > 0 && !meta.sins?.some(sin => filters.sins.has(sin))) return false;
      if (filters.attackTypes.size > 0 && !meta.attackTypes?.some(type => filters.attackTypes.has(type))) return false;
      if (filters.keywords.size > 0 && !meta.keywords?.some(kw => filters.keywords.has(kw))) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      if (sortBy === 'By Sinner') {
        const sinA = getSinnerSortIndex(a.sinner);
        const sinB = getSinnerSortIndex(b.sinner);
        if (sinA !== sinB) return sinA - sinB;
        const seasonDiff = parseSeasonNumber(b.season) - parseSeasonNumber(a.season);
        if (seasonDiff !== 0) return seasonDiff;
        if (a.rarity !== b.rarity) return b.rarity - a.rarity;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'By Rarity') {
        if (a.rarity !== b.rarity) return b.rarity - a.rarity;
        const seasonDiff = parseSeasonNumber(b.season) - parseSeasonNumber(a.season);
        if (seasonDiff !== 0) return seasonDiff;
        return a.name.localeCompare(b.name);
      }
      // Default: 'Newest'
      const seasonDiff = parseSeasonNumber(b.season) - parseSeasonNumber(a.season);
      if (seasonDiff !== 0) return seasonDiff;
      if (a.rarity !== b.rarity) return b.rarity - a.rarity;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [search, filters, showAcquiredOnly, sortBy, acquiredIds, customMetadata]);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-[#e5e5e5] h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold font-limbus text-[#c9a84c]">Identities</h1>
        <div className="flex gap-2">
          {['Newest', 'By Sinner', 'By Rarity', 'Name'].map(sort => (
            <button key={sort} onClick={() => setSortBy(sort)} className={`px-4 py-2 rounded glass-card text-sm font-bold transition-colors ${sortBy === sort ? 'text-[#c9a84c] border-[#c9a84c]' : 'text-[#737373] hover:text-white'}`}>
              {sort}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#737373]" />
            <input type="text" placeholder="Search 185 identities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded pl-10 pr-4 py-2 focus:border-[#c9a84c] outline-none transition-colors" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showAcquiredOnly} onChange={() => setShowAcquiredOnly(!showAcquiredOnly)} className="limbus-checkbox" />
            <span className="font-bold text-sm">Acquired Only</span>
          </label>
        </div>
        
        {/* Full Filters */}
        <div className="space-y-3 pt-2 border-t border-[#333]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#737373] uppercase tracking-widest font-bold">Filters</span>
            <button onClick={() => setFilters({ sinners: new Set(), rarity: new Set(), sins: new Set(), attackTypes: new Set(), keywords: new Set() })} className="text-xs text-[#c9a84c] hover:text-white transition-colors border border-[#c9a84c] px-3 py-1 rounded-full">
              Clear Filters
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-[#737373] w-24">Sinner:</span>
            {sinnersData.map(s => (
              <button key={s.id} onClick={() => toggleFilter('sinners', s.name)} className={`filter-chip transition-all ${filters.sinners.has(s.name) ? 'bg-[#c9a84c] text-black border-[#c9a84c] font-black shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-105' : 'hover:border-gray-400'}`}>{s.name}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-[#737373] w-24">Rarity:</span>
            {[1, 2, 3].map(r => (
              <button key={r} onClick={() => toggleFilter('rarity', r)} className={`filter-chip transition-all ${filters.rarity.has(r) ? 'bg-[#c9a84c] text-black border-[#c9a84c] font-black shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-105' : 'hover:border-gray-400'}`}>{'★'.repeat(r)}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-[#737373] w-24">Affinities:</span>
            {Object.keys(SIN_COLORS).map(sin => (
              <button key={sin} onClick={() => toggleFilter('sins', sin)} className={`filter-chip transition-all ${filters.sins.has(sin) ? 'text-white border-white font-black ring-2 ring-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'hover:border-gray-400'}`} style={filters.sins.has(sin) ? { backgroundColor: SIN_COLORS[sin] } : {}}>{sin}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-[#737373] w-24">Attack Types:</span>
            {ATTACK_TYPES.map(type => (
              <button key={type} onClick={() => toggleFilter('attackTypes', type)} className={`filter-chip transition-all ${filters.attackTypes.has(type) ? 'bg-[#c9a84c] text-black border-[#c9a84c] font-black shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-105' : 'hover:border-gray-400'}`}>{type}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-[#737373] w-24">Keywords:</span>
            {Object.keys(KEYWORD_COLORS).map(kw => (
              <button key={kw} onClick={() => toggleFilter('keywords', kw)} className={`filter-chip transition-all ${filters.keywords.has(kw) ? 'text-white border-white font-black ring-2 ring-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'hover:border-gray-400'}`} style={filters.keywords.has(kw) ? { backgroundColor: KEYWORD_COLORS[kw] } : {}}>{kw}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#737373] mb-4">{filteredIdentities.length} results</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-12">
        <AnimatePresence>
          {filteredIdentities.map(id => (
            <IdCard 
              key={id.name} 
              id={id} 
              meta={getMetadata(id)} 
              acquired={acquiredIds.has(id.name)} 
              onToggleAcquired={toggleAcquiredId} 
              onEdit={() => setEditingId(id)}
              onClickDetails={() => setDetailsId(id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {editingId && (
        <EditMetadataModal 
          idData={editingId} 
          currentMeta={getMetadata(editingId)} 
          onSave={(meta) => { updateCustomMetadata(editingId.name, meta); setEditingId(null); }} 
          onClose={() => setEditingId(null)} 
        />
      )}

      {detailsId && (
        <IdDetailsModal 
          idData={detailsId} 
          meta={getMetadata(detailsId)} 
          identitiesData={identitiesData}
          onClose={() => setDetailsId(null)} 
        />
      )}
    </motion.div>
  );
}

function EditMetadataModal({ idData, currentMeta, onSave, onClose }) {
  const [meta, setMeta] = useState(currentMeta);
  const toggleArray = (key, val) => setMeta(prev => {
    const arr = prev[key] || [];
    return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card max-w-md w-full p-6 relative bg-[#0a0a0a]" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-1 font-limbus text-[#c9a84c]">Edit Metadata</h2>
        <p className="text-sm text-[#737373] mb-6">{idData.name}</p>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(KEYWORD_COLORS).map(kw => (
                <button key={kw} onClick={() => toggleArray('keywords', kw)} className={`text-xs px-2 py-1 rounded border ${meta.keywords?.includes(kw) ? 'border-white text-white' : 'border-[#333] text-[#737373]'}`} style={meta.keywords?.includes(kw) ? {backgroundColor: KEYWORD_COLORS[kw]} : {}}>
                  {kw}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">Sins</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SIN_COLORS).map(sin => (
                <button key={sin} onClick={() => toggleArray('sins', sin)} className={`text-xs px-2 py-1 rounded border ${meta.sins?.includes(sin) ? 'border-white text-white' : 'border-[#333] text-[#737373]'}`} style={meta.sins?.includes(sin) ? {backgroundColor: SIN_COLORS[sin]} : {}}>
                  {sin}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">Attack Types</p>
            <div className="flex flex-wrap gap-2">
              {ATTACK_TYPES.map(type => (
                <button key={type} onClick={() => toggleArray('attackTypes', type)} className={`text-xs px-2 py-1 rounded border ${meta.attackTypes?.includes(type) ? 'border-[#c9a84c] bg-[#c9a84c] text-black' : 'border-[#333] text-[#737373]'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-8">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm text-[#737373] hover:text-white transition-colors">Cancel</button>
          <button onClick={() => onSave(meta)} className="px-4 py-2 rounded text-sm font-bold bg-[#c9a84c] text-black hover:bg-[#d4b96b] transition-colors">Save Data</button>
        </div>
      </div>
    </div>
  );
}

