import IdDetailsModal from '../components/IdDetailsModal.jsx';
import VergiliusModal from '../components/VergiliusModal.jsx';
import RoachEmperorModal from '../components/RoachEmperorModal.jsx';
import MugaRyoshuModal from '../components/MugaRyoshuModal.jsx';
import RolandModal from '../components/RolandModal.jsx';
import AngelaModal from '../components/AngelaModal.jsx';
import vergiliusImg from '../assets/vergilius.png';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Edit3, CheckCircle, Info, Clock, Compass, Sparkles, X, Heart } from 'lucide-react';
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
  const [showVergiliusModal, setShowVergiliusModal] = useState(false);
  const [showRoachModal, setShowRoachModal] = useState(false);
  const [showMugaModal, setShowMugaModal] = useState(false);
  const [showRolandModal, setShowRolandModal] = useState(false);
  const [showAngelaModal, setShowAngelaModal] = useState(false);
  const [reversionToast, setReversionToast] = useState(null);

  const handleGregorRevert = () => {
    setSearch('');
    setShowRoachModal(false);
    setReversionToast({
      sinner: 'Gregor',
      name: 'LCB Sinner Gregor',
      color: '#fca5a5',
      image: 'https://assets.limbusdeck.com/identities/full/lcb-sinner-gregor.webp',
      message: '"*puff*... Whew. Thanks a lot, Manager. Got all those creepy crawlies brushed off. Let\'s get back on the bus."',
    });
    setTimeout(() => setReversionToast(null), 6000);
  };

  const handleRyoshuRevert = () => {
    setSearch('');
    setShowMugaModal(false);
    setReversionToast({
      sinner: 'Ryōshū',
      name: 'LCB Sinner Ryōshū',
      color: '#f87171',
      image: 'https://assets.limbusdeck.com/identities/full/lcb-sinner-ryoshu.webp',
      message: '"...T.T.M. (Thanks To Manager). Don\'t speak another syllable of this to the other Sinners, Dante."',
    });
    setTimeout(() => setReversionToast(null), 6000);
  };

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
        const isRodyaSearch = normSearch === 'rodya' || normSearch.includes('rodya');
        const matchesRodya = isRodyaSearch && (normSinner.includes('rodion') || normName.includes('rodion'));
        if (!normName.includes(normSearch) && !normSinner.includes(normSearch) && !matchesRodya) return false;
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

      {/* Easter Egg Flags */}
      {(() => {
        const cleanSearch = search.trim().toLowerCase();
        const isVergilius = cleanSearch === 'vergilius';
        const isDante = cleanSearch === 'dante' || cleanSearch === 'clock';
        const isCharon = cleanSearch === 'charon' || cleanSearch === 'vroom';
        const isRoachEmperor = 
          cleanSearch === 'roach emperor' || 
          cleanSearch === 'the roach emperor' || 
          cleanSearch === 'roach king' || 
          cleanSearch === 'the roach king' || 
          cleanSearch === 'roachking' || 
          cleanSearch.includes('roach emperor') || 
          cleanSearch.includes('roach king') || 
          (cleanSearch.includes('roach') && cleanSearch.includes('gregor'));
        const isMuga = 
          cleanSearch === 'muga' || 
          cleanSearch === 'muga ryoshu' || 
          cleanSearch === 'muga ryōshū' || 
          (cleanSearch.includes('muga') && cleanSearch.includes('ryoshu'));
        const isRoland = 
          cleanSearch === 'roland' || 
          cleanSearch === 'black silence' || 
          cleanSearch === 'the black silence' || 
          cleanSearch === 'hamhampangpang' || 
          cleanSearch === 'popcorn' || 
          cleanSearch === 'boohoo' || 
          cleanSearch === 'thats that';
        const isAngela = 
          cleanSearch === 'angela' || 
          cleanSearch === 'library' || 
          cleanSearch === 'the library' || 
          cleanSearch === 'librarian';
        const isGebura = 
          cleanSearch === 'gebura' || 
          cleanSearch === 'red mist' || 
          cleanSearch === 'the red mist' || 
          cleanSearch === 'kali';
        const isErlkonig = cleanSearch === 'erlkonig' || cleanSearch === 'erlkönig' || cleanSearch === 'wild hunt' || cleanSearch === 'every heathcliff';
        const isSancho = cleanSearch === 'sancho' || cleanSearch === 'bloodfiend' || cleanSearch === 'second kindred';
        const isCarmen = cleanSearch === 'carmen' || cleanSearch === 'distortion' || cleanSearch === 'the light' || cleanSearch === 'the voice';

        const totalResultsCount = filteredIdentities.length + 
          (isVergilius ? 1 : 0) + (isDante ? 1 : 0) + (isCharon ? 1 : 0) + 
          (isRoachEmperor ? 1 : 0) + (isMuga ? 1 : 0) + (isRoland ? 1 : 0) + 
          (isAngela ? 1 : 0) + (isGebura ? 1 : 0) + (isErlkonig ? 1 : 0) + 
          (isSancho ? 1 : 0) + (isCarmen ? 1 : 0);

        return (
          <>
            {/* Reversion Feedback Toast / Banner */}
            <AnimatePresence>
              {reversionToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  className="mb-6 p-4 rounded-xl border-2 shadow-2xl flex items-center gap-4 bg-gradient-to-r from-[#0c0c0e] via-[#16161c] to-[#0c0c0e] relative overflow-hidden"
                  style={{ borderColor: reversionToast.color }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-black shadow-lg"
                    style={{ borderColor: reversionToast.color }}
                  >
                    <img
                      src={reversionToast.image}
                      alt={reversionToast.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black uppercase tracking-wider block mb-0.5" style={{ color: reversionToast.color }}>
                      ✓ Sinner Restored to Bus: {reversionToast.name}
                    </span>
                    <p className="text-xs italic text-gray-200 font-serif leading-relaxed">
                      {reversionToast.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setReversionToast(null)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-xs text-[#737373] mb-4">
              {totalResultsCount} results {isVergilius && <span className="text-red-500 font-bold ml-2 animate-pulse">⚠️ [RESTRICTED PERSONNEL RECORD]</span>}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-12">
              <AnimatePresence>
                {/* 🔴 Vergilius Easter Egg Card */}
                {isVergilius && (
                  <motion.div
                    key="vergilius-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => setShowVergiliusModal(true)}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-red-600 shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.7)] transition-all cursor-pointer h-64 bg-black"
                  >
                    {/* Background Art */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("${vergiliusImg}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-red-950/40" />

                    {/* Top Badge */}
                    <div className="relative flex justify-between items-start p-3 z-10">
                      <div className="flex gap-0.5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-700/60 uppercase tracking-wider">
                        Guide
                      </span>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative mt-auto p-3 z-10">
                      <h3 className="font-black text-[16px] leading-tight text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] mb-1">
                        The Red Gaze Vergilius
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-red-200 font-bold bg-red-950/80 border border-red-600/50 shadow-sm">
                          ● Color Fixer
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-white font-medium bg-black/60 border border-white/20 shadow-sm">
                          ● Senior Guide
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-orange-400 font-medium bg-black/60 border border-orange-500/30 shadow-sm">
                          ● Danger: Extreme
                        </span>
                      </div>

                      <p className="text-[11px] italic text-gray-300 line-clamp-2 mb-2 font-serif leading-snug">
                        "Why are you looking here, Dante..? I'm not one of your lackeys. Do you need.. a <strong className="text-red-400 font-bold underline decoration-red-500">consultation?</strong>"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-red-900/60 text-[10px]">
                        <span className="text-red-400 font-bold">Threat: Unknown</span>
                        <span className="text-gray-400 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          Inspect &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ⏰ Dante Easter Egg Card */}
                {isDante && (
                  <motion.div
                    key="dante-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] h-64 bg-gradient-to-b from-[#1a1205] to-black p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                        <Clock className="animate-spin" size={24} style={{ animationDuration: '6s' }} />
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/40">
                        Rank: Manager
                      </span>
                    </div>
                    <div className="mt-auto">
                      <h3 className="font-bold text-lg text-amber-300">Executive Manager Dante</h3>
                      <p className="text-[11px] text-gray-300 mt-1 font-mono italic leading-snug">
                        &lt;Tick tock, tick tock...!&gt; (Dante is furiously gesturing and frantically winding their clock head. Faust translates: "The Manager requests that you stop searching for them.")
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">Clockhead</span>
                        <span className="text-[9px] bg-black text-gray-400 px-1.5 py-0.5 rounded border border-[#333]">Revival Device</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🚌 Charon Easter Egg Card */}
                {isCharon && (
                  <motion.div
                    key="charon-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] h-64 bg-gradient-to-b from-[#05151a] to-black p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-lg">
                        ⭐
                      </div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/40">
                        Role: Chauffeur
                      </span>
                    </div>
                    <div className="mt-auto">
                      <h3 className="font-bold text-lg text-cyan-300">Bus Driver Charon</h3>
                      <p className="text-[11px] text-gray-300 mt-1 font-mono leading-snug">
                        "Vroom vroom. Mephistopheles is hungry. Charon wants star candies. Dante drive? No. Dante is bad driver. Charon drives."
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700/50">Vroom Vroom</span>
                        <span className="text-[9px] bg-black text-gray-400 px-1.5 py-0.5 rounded border border-[#333]">Star Candy Lover</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🪲 Roach Emperor Gregor Easter Egg Card */}
                {isRoachEmperor && (
                  <motion.div
                    key="roach-emperor-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => setShowRoachModal(true)}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-green-600 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_45px_rgba(34,197,94,0.7)] hover:border-green-400 transition-all cursor-pointer h-64 bg-black"
                  >
                    {/* Background Art */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("https://assets.limbusdeck.com/identities/full-uptied/g-corp-manager-corporal-gregor.webp")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-green-950/40" />

                    {/* Top Badge */}
                    <div className="relative flex justify-between items-start p-3 z-10">
                      <div className="flex gap-0.5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-green-300 bg-green-950/90 px-2 py-0.5 rounded border border-green-700/60 uppercase tracking-wider">
                        Boss Dossier
                      </span>
                    </div>

                    {/* Sinner name tag */}
                    <div className="relative px-3 z-10 -mt-1">
                      <p className="text-xs font-bold drop-shadow-md" style={{ color: '#fca5a5' }}>
                        Gregor
                      </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative mt-auto p-3 z-10">
                      <h3 className="font-black text-[16px] leading-tight text-white drop-shadow-[0_0_10px_rgba(34,197,94,0.9)] mb-1">
                        The Roach Emperor
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-green-200 font-bold bg-green-950/80 border border-green-600/50 shadow-sm">
                          ● Gluttony
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-yellow-300 font-medium bg-black/60 border border-yellow-500/30 shadow-sm">
                          ● Tremor
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-emerald-300 font-medium bg-black/60 border border-emerald-500/30 shadow-sm">
                          ● Hurting Pests
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-orange-400 font-medium bg-black/60 border border-orange-500/30 shadow-sm">
                          ● Unbreakable
                        </span>
                      </div>

                      <p className="text-[11px] italic text-gray-300 line-clamp-2 mb-2 font-serif leading-snug">
                        "Why are they bowing to me..? Stop clicking your legs together... <strong className="text-green-400 font-bold underline decoration-green-500">I am not your Emperor!</strong>"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-green-900/60 text-[10px]">
                        <span className="text-green-400 font-bold">Threat: Swarm Hazard</span>
                        <span className="text-gray-300 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          Inspect Dossier &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🩸 Muga Ryōshū Easter Egg Card */}
                {isMuga && (
                  <motion.div
                    key="muga-ryoshu-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => setShowMugaModal(true)}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-red-700 shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_45px_rgba(220,38,38,0.7)] hover:border-red-500 transition-all cursor-pointer h-64 bg-black"
                  >
                    {/* Background Art */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("https://assets.limbusdeck.com/identities/full-uptied/blade-of-the-house-of-spiders-ryoshu.webp")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-red-950/40" />

                    {/* Top Badge */}
                    <div className="relative flex justify-between items-start p-3 z-10">
                      <div className="flex gap-0.5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-red-300 bg-red-950/90 px-2 py-0.5 rounded border border-red-700/60 uppercase tracking-wider">
                        Assist Unit
                      </span>
                    </div>

                    {/* Sinner name tag */}
                    <div className="relative px-3 z-10 -mt-1">
                      <p className="text-xs font-bold drop-shadow-md" style={{ color: '#f87171' }}>
                        Ryōshū
                      </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative mt-auto p-3 z-10">
                      <h3 className="font-black text-[16px] leading-tight text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] mb-1">
                        Muga [無我] — Ryōshū
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-sky-300 font-medium bg-black/60 border border-sky-500/30 shadow-sm">
                          ● Slash
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-red-200 font-bold bg-red-950/80 border border-red-600/50 shadow-sm">
                          ● Bleed
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-purple-300 font-medium bg-black/60 border border-purple-500/30 shadow-sm">
                          ● Muga [無我]
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-fuchsia-300 font-medium bg-black/60 border border-fuchsia-500/30 shadow-sm">
                          ● Purple Coin
                        </span>
                      </div>

                      <p className="text-[11px] italic text-gray-300 line-clamp-2 mb-2 font-serif leading-snug">
                        "So I must hold back on using the blade... <strong className="text-red-400 font-bold underline decoration-red-500">without a trace of self remaining.</strong>"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-red-900/60 text-[10px]">
                        <span className="text-red-400 font-bold">Threat: Absolute Execution</span>
                        <span className="text-gray-300 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          Inspect Assist Dossier &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🥪 The Black Silence (Roland) Easter Egg Card */}
                {isRoland && (
                  <motion.div
                    key="roland-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => setShowRolandModal(true)}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-slate-500 shadow-[0_0_25px_rgba(148,163,184,0.4)] hover:shadow-[0_0_45px_rgba(148,163,184,0.7)] hover:border-slate-300 transition-all cursor-pointer h-64 bg-black"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("https://libraryofruina.wiki.gg/images/RolandFullBody.png")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-slate-950/40" />

                    <div className="relative flex justify-between items-start p-3 z-10">
                      <div className="flex gap-0.5 text-slate-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-600/60 uppercase tracking-wider">
                        Color Fixer
                      </span>
                    </div>

                    <div className="relative px-3 z-10 -mt-1">
                      <p className="text-xs font-bold drop-shadow-md text-slate-300">
                        Roland
                      </p>
                    </div>

                    <div className="relative mt-auto p-3 z-10">
                      <h3 className="font-black text-[16px] leading-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] mb-1">
                        The Black Silence — Roland
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-slate-200 font-bold bg-slate-900/80 border border-slate-600/50 shadow-sm">
                          ● 9 Workshops
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-amber-300 font-medium bg-black/60 border border-amber-500/30 shadow-sm">
                          ● HamHamPangPang
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-sky-300 font-medium bg-black/60 border border-sky-500/30 shadow-sm">
                          ● Furioso
                        </span>
                      </div>

                      <p className="text-[11px] italic text-gray-300 line-clamp-2 mb-2 font-serif leading-snug">
                        "That's that, and this is this. ...Say Dante, you got any <strong className="text-slate-200 font-bold underline decoration-slate-400">HamHamPangPang</strong> in that bus fridge?"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 font-bold">Grade: 1 / Special Patron</span>
                        <span className="text-gray-300 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          Inspect Dossier &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 📖 Head Librarian Angela Easter Egg Card */}
                {isAngela && (
                  <motion.div
                    key="angela-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => setShowAngelaModal(true)}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:border-cyan-300 transition-all cursor-pointer h-64 bg-black"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("https://libraryofruina.wiki.gg/images/AngelaFullBody.png")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-cyan-950/40" />

                    <div className="relative flex justify-between items-start p-3 z-10">
                      <div className="flex gap-0.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-600/60 uppercase tracking-wider">
                        Head Librarian
                      </span>
                    </div>

                    <div className="relative px-3 z-10 -mt-1">
                      <p className="text-xs font-bold drop-shadow-md text-cyan-300">
                        Angela
                      </p>
                    </div>

                    <div className="relative mt-auto p-3 z-10">
                      <h3 className="font-black text-[16px] leading-tight text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] mb-1">
                        Head Librarian — Angela
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-cyan-200 font-bold bg-cyan-950/80 border border-cyan-600/50 shadow-sm">
                          ● Pale Light
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-white font-medium bg-black/60 border border-white/20 shadow-sm">
                          ● 10 Floors
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-teal-300 font-medium bg-black/60 border border-teal-500/30 shadow-sm">
                          ● Book of the City
                        </span>
                      </div>

                      <p className="text-[11px] italic text-gray-300 line-clamp-2 mb-2 font-serif leading-snug">
                        "May you find your book in this place. A warm welcome to you, <strong className="text-cyan-300 font-bold underline decoration-cyan-500">Manager Dante.</strong>"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-cyan-900/60 text-[10px]">
                        <span className="text-cyan-400 font-bold">Threat: The Library</span>
                        <span className="text-gray-300 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          Inspect Dossier &rarr;
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ⚔️ The Red Mist (Gebura) Easter Egg Card */}
                {isGebura && (
                  <motion.div
                    key="gebura-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-red-600 shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:shadow-[0_0_45px_rgba(239,68,68,0.7)] hover:border-red-400 transition-all h-64 bg-black cursor-default"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("https://libraryofruina.wiki.gg/images/GeburaFullBody.png")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-red-950/40" />

                    <div className="relative flex justify-between items-start p-3 z-10">
                      <div className="flex gap-0.5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs font-black text-red-300 bg-red-950/90 px-2 py-0.5 rounded border border-red-700/60 uppercase tracking-wider">
                        The Red Mist
                      </span>
                    </div>

                    <div className="relative px-3 z-10 -mt-1">
                      <p className="text-xs font-bold drop-shadow-md text-red-400">
                        Kali
                      </p>
                    </div>

                    <div className="relative mt-auto p-3 z-10">
                      <h3 className="font-black text-[16px] leading-tight text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] mb-1">
                        The Red Mist — Gebura
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-red-200 font-bold bg-red-950/80 border border-red-600/50 shadow-sm">
                          ● Strongest Color
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-amber-300 font-medium bg-black/60 border border-amber-500/30 shadow-sm">
                          ● Mimicry Greatsword
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-red-400 font-medium bg-black/60 border border-red-500/30 shadow-sm">
                          ● Greater Split
                        </span>
                      </div>

                      <p className="text-[11px] italic text-gray-300 line-clamp-2 mb-2 font-serif leading-snug">
                        "Hmph. What are you staring at, clockhead? If you want to protect your Sinners, you better start swinging with conviction."
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-red-900/60 text-[10px]">
                        <span className="text-red-400 font-bold">Threat: Supreme</span>
                        <span className="text-gray-400 font-mono">Legend of the City</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🐎 Erlkönig Heathcliff Easter Egg Card */}
                {isErlkonig && (
                  <motion.div
                    key="erlkonig-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-purple-800 shadow-[0_0_30px_rgba(147,51,234,0.35)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)] transition-all h-64 bg-gradient-to-b from-[#180826] via-[#0e0416] to-black p-4 cursor-default"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-600 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                        💀
                      </div>
                      <span className="text-[10px] bg-purple-950 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-700/60">
                        ⚠ CATASTROPHIC DISTORTION
                      </span>
                    </div>
                    <div className="mt-auto relative z-10">
                      <h3 className="font-bold text-lg text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]">Erlkönig Heathcliff</h3>
                      <p className="text-[10px] text-purple-400/80 mt-0.5 font-mono">Leader of the Wild Hunt — ⚠ NON-ACQUIRABLE</p>
                      <p className="text-[11px] text-purple-200/80 mt-1.5 italic leading-snug font-serif">
                        "Every Heathcliff in every reflection of this rotting City... must be wiped from existence."
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/60">● Envy / Sinking</span>
                        <span className="text-[9px] bg-black text-purple-400 px-1.5 py-0.5 rounded border border-purple-900/40">Grief Unleashed</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 🩸 Sancho / Bloodfiend Don Quixote Easter Egg Card */}
                {isSancho && (
                  <motion.div
                    key="sancho-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-red-800 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] transition-all h-64 bg-gradient-to-b from-[#240406] via-[#140203] to-black p-4 cursor-default"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.2)_0%,transparent_60%)] pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-10 h-10 rounded-full bg-red-950 border border-red-600 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(220,38,38,0.6)] animate-pulse">
                        🦇
                      </div>
                      <span className="text-[10px] bg-red-950 text-red-300 font-mono px-2 py-0.5 rounded border border-red-700/60">
                        ⚠ SECOND KINDRED
                      </span>
                    </div>
                    <div className="mt-auto relative z-10">
                      <h3 className="font-bold text-lg text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">Sancho — Bloodfiend</h3>
                      <p className="text-[10px] text-red-400/80 mt-0.5 font-mono">Barrio of Thirst / Classified Legend — ⚠ NON-ACQUIRABLE</p>
                      <p className="text-[11px] text-red-200/80 mt-1.5 italic leading-snug font-serif">
                        "Awaken, my dream-clad child... Cast aside the lance, and let the carnival of blood begin anew."
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800/60">● Lust / Bleed</span>
                        <span className="text-[9px] bg-black text-red-400 px-1.5 py-0.5 rounded border border-red-900/40">Unending Thirst</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ✨ The Voice / Carmen Easter Egg Card */}
                {isCarmen && (
                  <motion.div
                    key="carmen-easter-egg"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative flex flex-col group overflow-hidden rounded-xl border-2 border-amber-400/70 shadow-[0_0_35px_rgba(251,191,36,0.35)] hover:shadow-[0_0_55px_rgba(251,191,36,0.55)] transition-all h-64 bg-gradient-to-b from-[#221c08] via-[#141004] to-black p-4 cursor-default"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.15)_0%,transparent_70%)] pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-500/70 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-spin-slow">
                        ✨
                      </div>
                      <span className="text-[10px] bg-amber-950 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-600/50">
                        ⚠ THE VOICE
                      </span>
                    </div>
                    <div className="mt-auto relative z-10">
                      <h3 className="font-bold text-lg text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]">Carmen — The Light</h3>
                      <p className="text-[10px] text-amber-400/70 mt-0.5 font-mono">Source of Distortion — ⚠ DO NOT LISTEN</p>
                      <p className="text-[11px] text-amber-100/80 mt-1.5 italic leading-snug font-serif">
                        "Why must you suppress what you truly feel? Listen closely to the beating in your chest... Let it bloom."
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">● Whispers of Truth</span>
                        <span className="text-[9px] bg-black text-amber-400 px-1.5 py-0.5 rounded border border-amber-900/40">Ego Dissolution</span>
                      </div>
                    </div>
                  </motion.div>
                )}

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
          </>
        );
      })()}

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

      {showVergiliusModal && (
        <VergiliusModal onClose={() => setShowVergiliusModal(false)} />
      )}

      {showRoachModal && (
        <RoachEmperorModal 
          onClose={() => setShowRoachModal(false)} 
          onRevert={handleGregorRevert}
        />
      )}

      {showMugaModal && (
        <MugaRyoshuModal 
          onClose={() => setShowMugaModal(false)} 
          onRevert={handleRyoshuRevert}
        />
      )}

      {showRolandModal && (
        <RolandModal onClose={() => setShowRolandModal(false)} />
      )}

      {showAngelaModal && (
        <AngelaModal onClose={() => setShowAngelaModal(false)} />
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

