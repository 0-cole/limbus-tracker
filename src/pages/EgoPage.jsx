import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, CheckCircle, Info } from 'lucide-react';
import { useStore } from '../stores/useStore.js';
import sinnersData from '../data/sinners.json';
import { parseEffectsIntoTriggerGroups, getSkillTriggerColor, extractKeywordsFromEffects } from '../utils/skillParser';
import { normalizeText, normalizeSinnerId, getSinnerInfo, getSinnerSortIndex, parseSeasonNumber, getCardImageUrl } from '../utils/textUtils.js';

const KEYWORD_COLORS = { Burn: '#ef4444', Bleed: '#dc2626', Tremor: '#eab308', Poise: '#22c55e', Charge: '#a855f7', Rupture: '#0ea5e9', Sinking: '#3b82f6' };
const SIN_COLORS = { Wrath: '#dc2626', Lust: '#ea580c', Sloth: '#ca8a04', Gluttony: '#16a34a', Gloom: '#0ea5e9', Pride: '#4f46e5', Envy: '#9333ea' };
const GRADE_COLORS = { ZAYIN: '#22c55e', TETH: '#06b6d4', HE: '#eab308', WAW: '#a855f7', ALEPH: '#ef4444' };
const GRADE_ORDER = { ZAYIN: 0, TETH: 1, HE: 2, WAW: 3, ALEPH: 4 };

function EgoCard({ ego, meta, acquired, onToggleAcquired, onEdit, onClickDetails }) {
  const sinnerInfo = getSinnerInfo(ego.sinner);
  const [imgError, setImgError] = useState(false);
  
  // Use LimbusDeck CDN for images
  const bgUrl = imgError ? null : getCardImageUrl(ego, true);

  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
      className={`relative flex flex-col group overflow-hidden rounded-xl border-2 transition-all cursor-pointer h-64 ${acquired ? 'border-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.2)]' : 'border-[#333] opacity-80 hover:opacity-100 hover:border-[#666]'}`}
      onClick={() => onClickDetails(ego)}
    >
      {/* Background Art */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: bgUrl ? `url("${encodeURI(bgUrl)}")` : 'none' }}
      />
      {bgUrl && <img src={bgUrl} onError={() => setImgError(true)} className="hidden" alt="preload check" />}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

      {/* Top Section */}
      <div className="relative flex justify-between items-start p-3 z-10">
        <span className="text-xs font-bold px-2 py-0.5 rounded backdrop-blur-md bg-black/40 border border-white/10 shadow-sm" style={{ color: GRADE_COLORS[ego.grade] || '#fff' }}>
          {ego.grade}
        </span>
        <p className="text-sm font-bold drop-shadow-md" style={{ color: sinnerInfo?.color || '#fff' }}>
          {sinnerInfo?.name || ego.sinner}
        </p>
      </div>
      
      {/* Bottom Section */}
      <div className="relative mt-auto p-3 z-10">
        <h3 className="font-bold text-[16px] leading-tight text-white drop-shadow-md mb-2">{ego.name}</h3>
        
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
          <button onClick={(e) => { e.stopPropagation(); onToggleAcquired(ego.name); }} className={`text-xs px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 backdrop-blur-sm ${acquired ? 'bg-[#c9a84c] text-black' : 'bg-black/60 text-white border border-white/20 hover:bg-white/20'}`}>
            {acquired ? <><CheckCircle size={12}/> Acquired</> : 'Acquire'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EgoPage() {
  const { egosData, acquiredEgos, toggleAcquiredEgo, customMetadata, updateCustomMetadata } = useStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ sinners: new Set(), grades: new Set(), sins: new Set() });
  const [showAcquiredOnly, setShowAcquiredOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');
  
  const [editingEgo, setEditingEgo] = useState(null);
  const [detailsEgo, setDetailsEgo] = useState(null);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [category]: new Set(prev[category]) };
      if (newFilters[category].has(value)) newFilters[category].delete(value);
      else newFilters[category].add(value);
      return newFilters;
    });
  };

  const getMetadata = (ego) => {
    if (customMetadata?.[ego.name]) return customMetadata[ego.name];
    
    let sins = new Set();
    let keywords = new Set();
    
    if (ego.sins) ego.sins.forEach(s => sins.add(s));
    
    const skillsToScan = (ego.upties && ego.upties[4]) ? ego.upties[4] : (ego.skills || []);
    skillsToScan.forEach(skill => {
        if (skill.affinity) sins.add(skill.affinity);
        if (skill.sin) sins.add(skill.sin);
        
        const effectStr = JSON.stringify(skill.effects || []).toLowerCase();
        ['burn', 'bleed', 'tremor', 'poise', 'sinking', 'charge', 'rupture'].forEach(kw => {
            if (effectStr.includes(kw)) keywords.add(kw.charAt(0).toUpperCase() + kw.slice(1));
        });
    });
    
    return { 
      cost: Array.from(sins), 
      sins: Array.from(sins), 
      keywords: Array.from(keywords)
    };
  };

  const filteredEgos = useMemo(() => {
    const normSearch = normalizeText(search);
    const selectedSinnerIds = new Set(Array.from(filters.sinners).map(s => normalizeSinnerId(s)));

    let result = (egosData || []).filter(ego => {
      if (!ego.grade) return false;
      if (normSearch) {
        const normName = normalizeText(ego.name);
        const normSinner = normalizeText(ego.sinner);
        if (!normName.includes(normSearch) && !normSinner.includes(normSearch)) return false;
      }
      if (showAcquiredOnly && !acquiredEgos.has(ego.name)) return false;
      if (selectedSinnerIds.size > 0 && !selectedSinnerIds.has(normalizeSinnerId(ego.sinner))) return false;
      if (filters.grades.size > 0 && !filters.grades.has(ego.grade)) return false;
      
      const meta = getMetadata(ego);
      if (filters.sins.size > 0 && !meta.cost?.some(sin => filters.sins.has(sin))) return false;
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
        const gradeA = GRADE_ORDER[a.grade] ?? -1;
        const gradeB = GRADE_ORDER[b.grade] ?? -1;
        if (gradeA !== gradeB) return gradeB - gradeA;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'By Grade') {
        const gradeA = GRADE_ORDER[a.grade] ?? -1;
        const gradeB = GRADE_ORDER[b.grade] ?? -1;
        if (gradeA !== gradeB) return gradeB - gradeA;
        const seasonDiff = parseSeasonNumber(b.season) - parseSeasonNumber(a.season);
        if (seasonDiff !== 0) return seasonDiff;
        return a.name.localeCompare(b.name);
      }
      // Default: 'Newest'
      const seasonDiff = parseSeasonNumber(b.season) - parseSeasonNumber(a.season);
      if (seasonDiff !== 0) return seasonDiff;
      const gradeA = GRADE_ORDER[a.grade] ?? -1;
      const gradeB = GRADE_ORDER[b.grade] ?? -1;
      if (gradeA !== gradeB) return gradeB - gradeA;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [search, filters, showAcquiredOnly, sortBy, acquiredEgos, customMetadata]);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-[#e5e5e5] h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold font-limbus text-[#c9a84c]">E.G.O</h1>
        <div className="flex gap-2">
          {['Newest', 'By Sinner', 'By Grade', 'Name'].map(sort => (
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
            <input type="text" placeholder={`Search ${egosData.length} E.G.O.s...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded pl-10 pr-4 py-2 focus:border-[#c9a84c] outline-none transition-colors" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showAcquiredOnly} onChange={() => setShowAcquiredOnly(!showAcquiredOnly)} className="limbus-checkbox" />
            <span className="font-bold text-sm">Acquired Only</span>
          </label>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-[#333]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#737373] uppercase tracking-widest font-bold">Filters</span>
            <button onClick={() => setFilters({ sinners: new Set(), grades: new Set(), sins: new Set() })} className="text-xs text-[#c9a84c] hover:text-white transition-colors border border-[#c9a84c] px-3 py-1 rounded-full">
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
            <span className="font-bold text-[#737373] w-24">Grade:</span>
            {Object.keys(GRADE_COLORS).map(g => (
              <button key={g} onClick={() => toggleFilter('grades', g)} className={`filter-chip transition-all ${filters.grades.has(g) ? 'bg-[#c9a84c] text-black border-[#c9a84c] font-black shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-105' : 'hover:border-gray-400'}`}>{g}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="font-bold text-[#737373] w-24">Cost Sins:</span>
            {Object.keys(SIN_COLORS).map(sin => (
              <button key={sin} onClick={() => toggleFilter('sins', sin)} className={`filter-chip transition-all ${filters.sins.has(sin) ? 'text-white border-white font-black ring-2 ring-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'hover:border-gray-400'}`} style={filters.sins.has(sin) ? { backgroundColor: SIN_COLORS[sin] } : {}}>{sin}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#737373] mb-4">{filteredEgos.length} results</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-12">
        <AnimatePresence>
          {filteredEgos.map(ego => (
            <EgoCard 
              key={ego.name} 
              ego={ego} 
              meta={getMetadata(ego)} 
              acquired={acquiredEgos.has(ego.name)} 
              onToggleAcquired={toggleAcquiredEgo} 
              onEdit={() => setEditingId(ego)}
              onClickDetails={() => setDetailsId(ego)}
            />
          ))}
        </AnimatePresence>
      </div>

      {editingId && (
        <EditMetadataModal 
          egoData={editingId} 
          currentMeta={getMetadata(editingId)} 
          onSave={(meta) => { updateCustomMetadata(editingId.name, meta); setEditingId(null); }} 
          onClose={() => setEditingId(null)} 
        />
      )}

      {detailsId && (
        <IdDetailsModal 
          egoData={detailsId} 
          meta={getMetadata(detailsId)} 
          onClose={() => setDetailsId(null)} 
        />
      )}
    </motion.div>
  );
}

function IdDetailsModal({ egoData, meta, onClose }) {
  const [selectedThreadspin, setSelectedThreadspin] = useState(4);
  
  // Use CDN for background image
  const slug = egoData.slug || generateSlug(egoData.name);
  const bgUrl = `https://assets.limbusdeck.com/egos/full/${slug}.webp`;

  const currentSkills = (egoData.upties && egoData.upties[selectedThreadspin] && egoData.upties[selectedThreadspin].length > 0) ? egoData.upties[selectedThreadspin] : egoData.skills;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-6 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card max-w-5xl w-full h-[85vh] flex flex-col bg-[#0a0a0a] border border-[#333] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl" onClick={e => e.stopPropagation()}>
        
        {/* BLURRY BACKGROUND */}
        <div className="absolute inset-0 bg-cover bg-top bg-no-repeat opacity-40 blur-md pointer-events-none scale-105 transition-all duration-500" style={{ backgroundImage: `url(${bgUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/80 to-[#0a0a0a] pointer-events-none" />

        <div className="p-6 border-b border-white/10 flex justify-between items-start relative z-10 bg-black/20">
          <div className="flex gap-6 items-end">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-2 border-[#c9a84c]/50 shadow-2xl shrink-0">
              <img src={bgUrl} className="w-full h-full object-cover" alt="EGO Art" />
            </div>
            <div className="pb-2">
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-tight">{egoData.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                 <p className="text-[#c9a84c] text-lg capitalize font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,1)] flex items-center gap-2">
                    <span>{egoData.sinner}</span>
                    <span className="text-white/30">•</span>
                    <span>{egoData.grade}</span>
                 </p>
                 {/* THREADSPIN SELECTOR */}
                 <div className="flex bg-black/50 rounded-lg p-1 border border-white/10 shadow-inner">
                    {[1, 2, 3, 4].map(ut => (
                       <button 
                         key={ut} 
                         onClick={() => setSelectedThreadspin(ut)}
                         className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedThreadspin === ut ? 'bg-[#c9a84c] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                       >
                         Threadspin {ut}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="flex gap-2 mt-3">
                 {egoData.keywords && egoData.keywords.map(k => (
                   <span key={k} className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded bg-black/60 border border-white/10 text-white font-bold backdrop-blur-md shadow-sm">{k}</span>
                 ))}
                 {egoData.traits && egoData.traits.map(t => (
                   <span key={t} className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#c9a84c] font-bold backdrop-blur-md shadow-sm">{t}</span>
                 ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex justify-center items-center bg-black/50 hover:bg-red-500/80 hover:text-white border border-white/10 rounded-full font-bold transition-all backdrop-blur-md z-20 shrink-0 text-white/50">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 text-sm relative z-10 scrollbar-hide">
          {!currentSkills || currentSkills.length === 0 ? (
            <div className="p-4 rounded border border-blue-900/50 bg-blue-900/10 text-blue-200 flex gap-3 backdrop-blur-md">
              <Info className="shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold mb-1">Threadspin Data Syncing</p>
                <p>The background scraper is currently pulling the deep skill breakdown for this specific Threadspin tier from the wiki. Check back in a moment.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentSkills.map((skill, i) => {
                const label = skill.name.includes('Corrosion') ? 'Corrosion' : 'Awakening';
                const borderColor = SIN_COLORS[skill.affinity] || '#333';
                const bgColor = borderColor + '20';
                const maxPower = skill.basePower + (skill.coinPower * (skill.coins || 1));
                
                const triggerGroups = parseEffectsIntoTriggerGroups(skill.effects || []);
                const kws = extractKeywordsFromEffects(skill.effects);
                
                return (
                  <div key={i} className="rounded-xl overflow-hidden bg-[#0a0a0a] backdrop-blur-md shadow-lg border flex flex-col" style={{ borderColor: borderColor + '50' }}>
                    <div className="flex flex-col gap-1 p-2.5 font-bold border-b" style={{backgroundColor: bgColor, borderBottomColor: borderColor + '50', borderTop: `4px solid ${borderColor}`}}>
                      <div className="flex justify-between items-center w-full">
                         <span style={{color: borderColor}} className="text-[10px] uppercase tracking-wider">{label}</span>
                         <div className="flex gap-1 items-center">
                            <span className="text-[10px] text-gray-300 font-medium">{skill.type}</span>
                            <span className="text-[10px] font-bold ml-1" style={{color: borderColor}}>{skill.affinity}</span>
                         </div>
                      </div>
                      <span className="text-white truncate font-bold text-sm tracking-tight">{skill.name}</span>
                    </div>
                    <div className="p-3 space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-center items-center text-xs bg-black/40 p-3 rounded-lg border border-white/5 w-full mx-auto max-w-[200px]">
                        <div className="font-bold flex items-center justify-between w-full">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Base</span>
                            <span className="text-white text-lg leading-none">{skill.basePower}</span>
                          </div>
                          <span className="text-gray-600 font-black text-lg">+</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Coin</span>
                            <span className="text-[#c9a84c] text-lg leading-none flex items-center"><span className="text-xs mr-0.5">x</span>{Math.abs(skill.coinPower)}</span>
                          </div>
                          <span className="text-gray-600 font-black text-lg">=</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Max</span>
                            <span className={skill.coinPower >= 0 ? "text-green-400 text-xl leading-none" : "text-red-400 text-xl leading-none"}>{maxPower}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 px-1 py-1">
                        {Array.from({length: skill.coins || 1}).map((_, idx) => (
                           <div key={idx} className={`w-5 h-5 rounded-full border shadow-[0_0_10px_rgba(234,179,8,0.3)] ${skill.coinPower < 0 ? 'bg-gradient-to-br from-red-500 to-red-800 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-200'}`}></div>
                        ))}
                      </div>
                      
                      {triggerGroups.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-2 mt-auto">
                          {triggerGroups.map((group, idx) => (
                            <div key={idx} className="text-xs leading-relaxed">
                              {group.trigger !== 'Passive' && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mr-1.5 text-white shadow-sm" style={{ backgroundColor: getSkillTriggerColor(group.trigger) }}>
                                  {group.trigger}
                                </span>
                              )}
                              <span className={group.trigger === 'Passive' ? 'text-gray-400' : 'text-gray-200'}>{group.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {kws.length > 0 && (
                         <div className="flex flex-wrap gap-1 pt-2 mt-2 border-t border-white/5">
                           {kws.map(([kw]) => (
                             <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded text-white font-medium bg-black/60 border shadow-sm" style={{ borderColor: KEYWORD_COLORS[kw] + '50' }}>
                               <span style={{color: KEYWORD_COLORS[kw]}}>●</span> {kw}
                             </span>
                           ))}
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PASSIVES */}
          {egoData.passives && egoData.passives.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="font-bold text-[#c9a84c] text-xl pb-2 border-b border-white/5 uppercase tracking-widest drop-shadow">Passives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {egoData.passives.map((passive, i) => (
                    <div key={i} className="bg-black/50 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                       <h4 className="font-bold text-white mb-2 pb-2 border-b border-white/5">{passive.name}</h4>
                       <p className="text-xs text-gray-400 leading-relaxed font-mono">{Array.isArray(passive.effects) ? passive.effects.join('\n') : (passive.effects || passive.description)}</p>
                    </div>
                 ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#222]">
            <div className="space-y-4">
              <h3 className="font-bold text-[#c9a84c] text-lg border-b border-[#333] pb-2">Sin Resource Cost</h3>
              <div className="flex gap-2 flex-wrap">
                {egoData.cost ? 
                  Object.entries(egoData.cost).map(([sin, amount]) => (
                    <span key={sin} className="px-2 py-1 rounded text-white font-bold flex gap-1 items-center" style={{ backgroundColor: SIN_COLORS[sin] }}>
                       <span>{sin}</span>
                       <span className="bg-black/40 px-1.5 rounded">{amount}</span>
                    </span>
                  ))
                : meta.cost?.map(sin => <span key={sin} className="px-2 py-1 rounded text-white" style={{ backgroundColor: SIN_COLORS[sin] }}>{sin}</span>)}
              </div>
              {egoData.sanityCost && <p className="text-gray-400 mt-2">Sanity Cost: <span className="text-white">{egoData.sanityCost}</span></p>}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-[#c9a84c] text-lg border-b border-[#333] pb-2">Defensive Affinity</h3>
              <div className="flex gap-2 flex-wrap">
                {(egoData.affinity || meta.affinity) ? <span className="px-2 py-1 rounded text-white font-bold" style={{ backgroundColor: SIN_COLORS[egoData.affinity || meta.affinity] }}>{egoData.affinity || meta.affinity}</span> : <span className="text-gray-500">Not set</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EditMetadataModal({ egoData, currentMeta, onSave, onClose }) {
  const [meta, setMeta] = useState(currentMeta);
  
  const toggleCost = (sin) => setMeta(prev => {
    const arr = prev.cost || [];
    return { ...prev, cost: arr.includes(sin) ? arr.filter(s => s !== sin) : [...arr, sin] };
  });

  const setAffinity = (sin) => setMeta(prev => ({ ...prev, affinity: prev.affinity === sin ? null : sin }));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card max-w-md w-full p-6 relative bg-[#0a0a0a]" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-1 font-limbus text-[#c9a84c]">Edit E.G.O Data</h2>
        <p className="text-sm text-[#737373] mb-6">{egoData.name}</p>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm font-bold mb-2">Resource Cost</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SIN_COLORS).map(sin => (
                <button key={sin} onClick={() => toggleCost(sin)} className={`text-xs px-2 py-1 rounded border ${meta.cost?.includes(sin) ? 'border-white text-white' : 'border-[#333] text-[#737373]'}`} style={meta.cost?.includes(sin) ? {backgroundColor: SIN_COLORS[sin]} : {}}>
                  {sin}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">Defensive Affinity</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(SIN_COLORS).map(sin => (
                <button key={sin} onClick={() => setAffinity(sin)} className={`text-xs px-2 py-1 rounded border ${meta.affinity === sin ? 'border-white text-white' : 'border-[#333] text-[#737373]'}`} style={meta.affinity === sin ? {backgroundColor: SIN_COLORS[sin]} : {}}>
                  {sin}
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
