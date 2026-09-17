import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore.js';
import { Search, Plus, Trash2, Calculator, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { getEntityImageUrl } from '../utils/imageUtils.js';
import { normalizeText, getSinnerSortIndex } from '../utils/textUtils.js';
import { getOwnedShards, getShardabilityStatus } from '../utils/limbusCalculator.js';

export default function WantListPage() {
  const { 
    wantList, 
    toggleWantList, 
    moveWantListPriority, 
    setWantListPriority, 
    reorderWantList, 
    inventory, 
    updateInventory, 
    acquiredIds, 
    acquiredEgos, 
    identitiesData, 
    egosData 
  } = useStore();
  const [search, setSearch] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingPriorityItem, setEditingPriorityItem] = useState(null);
  const [tempPriorityValue, setTempPriorityValue] = useState('');

  const GRADE_ORDER = { ZAYIN: 1, TETH: 2, HE: 3, WAW: 4, ALEPH: 5 };

  // Combine unowned IDs and EGOs
  const unownedItems = [
    ...identitiesData.filter(id => !acquiredIds.has(id.name)).map(id => ({ ...id, type: 'id' })),
    ...egosData.filter(ego => !acquiredEgos.has(ego.name)).map(ego => ({ ...ego, type: 'ego' }))
  ];

  const normSearch = normalizeText(search);

  const filteredUnowned = unownedItems
    .filter(item => {
      if (wantList.has(item.name)) return false;
      if (!normSearch) return true;
      const normName = normalizeText(item.name);
      const normSinner = normalizeText(item.sinner);
      return normName.includes(normSearch) || normSinner.includes(normSearch);
    })
    .sort((a, b) => {
      // 1. Sort by Type: IDs first, EGOs second
      if (a.type !== b.type) return a.type === 'id' ? -1 : 1;
      
      // 2. Sort by Sinner Number (1 through 12)
      const sinnerA = getSinnerSortIndex(a.sinner);
      const sinnerB = getSinnerSortIndex(b.sinner);
      if (sinnerA !== sinnerB) return sinnerA - sinnerB;

      // 3. Sort logic based on Type
      if (a.type === 'id') {
        // ID Sorting: Tiering Level (lower tierIndex is better) -> Star amount (descending) -> Alphabetical
        if (a.tierIndex !== b.tierIndex) return a.tierIndex - b.tierIndex;
        if (a.rarity !== b.rarity) return b.rarity - a.rarity;
      } else if (a.type === 'ego') {
        // EGO Sorting: Grade -> Alphabetical
        const gradeA = GRADE_ORDER[a.grade] || 99;
        const gradeB = GRADE_ORDER[b.grade] || 99;
        if (gradeA !== gradeB) return gradeA - gradeB;
      }

      // 4. Alphabetical Order by Name (fallback for both)
      return a.name.localeCompare(b.name);
    });

  const getRequiredShards = (item) => {
    if (item.type === 'ego') return 400;
    if (item.type === 'id') return item.rarity === 3 ? 400 : 150;
    return 400; // default
  };

  // Compute shard allocation cascading by priority order
  const availableShardsMap = {};
  const sinnerCounts = {};
  const rawWantedItems = [...wantList].map((name, index) => {
    const item = unownedItems.find(i => i.name === name) || { name, type: 'unknown', sinner: 'unknown', rarity: 3 };
    const normSinner = normalizeText(item.sinner);
    sinnerCounts[normSinner] = (sinnerCounts[normSinner] || 0) + 1;
    return { ...item, priority: index + 1 };
  });

  const wantedItems = rawWantedItems.map(item => {
    const normSinner = normalizeText(item.sinner);
    const totalOwned = getOwnedShards(inventory?.shards, item.sinner);
    if (!(normSinner in availableShardsMap)) {
      availableShardsMap[normSinner] = totalOwned;
    }
    const req = getRequiredShards(item);
    const curAvail = availableShardsMap[normSinner] || 0;
    const allocated = Math.min(req, curAvail);
    availableShardsMap[normSinner] = Math.max(0, curAvail - allocated);
    const isSharedSinner = (sinnerCounts[normSinner] || 0) > 1;

    return {
      ...item,
      req,
      totalOwned,
      allocated,
      percent: Math.min(100, Math.round((allocated / req) * 100)),
      isSharedSinner
    };
  });

  const handleDropReorder = (fromIdx, toIdx) => {
    if (fromIdx === toIdx || fromIdx === null || toIdx === null) return;
    const currentOrder = wantedItems.map(item => item.name);
    const [moved] = currentOrder.splice(fromIdx, 1);
    currentOrder.splice(toIdx, 0, moved);
    reorderWantList(currentOrder);
  };

  const commitPriority = (itemName) => {
    const num = parseInt(tempPriorityValue, 10);
    if (!isNaN(num) && num >= 1) {
      setWantListPriority(itemName, num);
    }
    setEditingPriorityItem(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-[#e5e5e5] min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold font-limbus text-[#c9a84c]">Want List & Shards</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Shard Calculator & Current Want List */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-limbus flex items-center gap-2 text-[#c9a84c]">
                <Calculator size={20} /> Target Calculator & Priority
              </h2>
              {wantedItems.length > 1 && (
                <span className="text-[11px] text-gray-400 font-mono">
                  Drag ⠿ or click # to set priority rank
                </span>
              )}
            </div>
            
            {wantedItems.length === 0 ? (
              <p className="text-[#737373] text-sm">Add IDs or EGOs to your want list to see shard requirements.</p>
            ) : (
              <div className="space-y-3">
                {wantedItems.map((item, idx) => {
                  const req = item.req;
                  const allocated = item.allocated;
                  const totalOwned = item.totalOwned;
                  const percent = item.percent;
                  const shardStatus = getShardabilityStatus(item);
                  const isFirst = idx === 0;
                  const isLast = idx === wantedItems.length - 1;
                  const isDragging = draggedItem === item.name;
                  const isDragOver = dragOverIndex === idx;

                  return (
                    <div 
                      key={item.name} 
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.name);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedItem(item.name);
                        setDraggedIndex(idx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== idx) setDragOverIndex(idx);
                      }}
                      onDragLeave={(e) => {
                        if (dragOverIndex === idx) setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== idx) {
                          handleDropReorder(draggedIndex, idx);
                        }
                        setDraggedItem(null);
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedItem(null);
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`p-3 bg-[#111] rounded border relative overflow-hidden group transition-all duration-150 ${
                        isDragging 
                          ? 'opacity-40 scale-[0.98] border-dashed border-[#c9a84c]' 
                          : isDragOver
                          ? 'border-[#c9a84c] ring-2 ring-[#c9a84c]/60 shadow-[0_0_15px_rgba(201,168,76,0.3)]'
                          : 'border-[#333] hover:border-[#555]'
                      }`}
                    >
                      <div className="absolute top-0 left-0 bottom-0 bg-[#c9a84c]/20 pointer-events-none" style={{ width: `${percent}%` }} />
                        <div className="relative flex justify-between items-center z-10">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Grip / Drag Handle */}
                            <div 
                              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-[#c9a84c] transition-colors p-1 -ml-1 flex items-center justify-center shrink-0 select-none"
                              title="Drag to reorder priority"
                            >
                              <GripVertical size={16} />
                            </div>

                            {/* Priority Controls & Interactive Editable Badge */}
                            <div className="flex flex-col items-center justify-center shrink-0 pr-1.5 border-r border-[#333]/80">
                              <button
                                onClick={() => moveWantListPriority(item.name, 'up')}
                                disabled={isFirst}
                                className={`p-0.5 rounded transition-colors ${isFirst ? 'text-gray-600 opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-[#c9a84c] hover:bg-white/5'}`}
                                title={isFirst ? 'Highest Priority' : 'Increase Priority'}
                              >
                                <ChevronUp size={14} />
                              </button>
                              
                              {editingPriorityItem === item.name ? (
                                <input 
                                  type="number"
                                  min="1"
                                  max={wantedItems.length}
                                  value={tempPriorityValue}
                                  autoFocus
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => setTempPriorityValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitPriority(item.name);
                                    if (e.key === 'Escape') setEditingPriorityItem(null);
                                  }}
                                  onBlur={() => commitPriority(item.name)}
                                  className="w-10 text-center text-[11px] font-black font-mono text-[#c9a84c] bg-black border border-[#c9a84c] rounded px-0.5 py-0.5 outline-none shadow-[0_0_8px_rgba(201,168,76,0.6)] my-0.5"
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingPriorityItem(item.name);
                                    setTempPriorityValue(String(item.priority));
                                  }}
                                  title="Click to manually type priority rank, or drag card with ⠿"
                                  className="text-[11px] font-black font-mono text-[#c9a84c] hover:text-white px-1.5 py-0.5 rounded bg-black/70 border border-[#c9a84c]/40 hover:border-[#c9a84c] hover:bg-[#c9a84c]/20 my-0.5 shadow-sm transition-all cursor-pointer"
                                >
                                  #{item.priority}
                                </button>
                              )}

                              <button
                                onClick={() => moveWantListPriority(item.name, 'down')}
                                disabled={isLast}
                                className={`p-0.5 rounded transition-colors ${isLast ? 'text-gray-600 opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-[#c9a84c] hover:bg-white/5'}`}
                                title={isLast ? 'Lowest Priority' : 'Decrease Priority'}
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>

                            <div className="w-10 h-10 bg-black rounded overflow-hidden border border-gray-700 flex-shrink-0 flex items-center justify-center">
                              <img src={getEntityImageUrl(item)} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} className="w-full h-full object-cover opacity-70" alt="" />
                              <div className="hidden w-full h-full bg-[#222] text-xs text-gray-500 items-center justify-center font-bold">?</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm leading-tight max-w-[180px] sm:max-w-[220px] truncate">{item.name}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  shardStatus.reason === 'walpurgis'
                                    ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                                    : shardStatus.reason === 'previous_season'
                                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                                    : shardStatus.reason === 'current_season'
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                                    : 'bg-[#222] text-gray-400 border border-gray-700'
                                }`}>
                                  {shardStatus.badge}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#737373] mt-0.5">
                                <span className="capitalize">{item.sinner} {item.type.toUpperCase()}</span>
                                {item.isSharedSinner && (
                                  <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                                    {allocated} allocated ({totalOwned} total owned)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs font-mono font-bold text-white">{allocated}</span>
                              <span className="text-xs text-[#737373]">/ {req}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5" title="Total owned shards in inventory for this Sinner">
                              <span className="text-[10px] text-gray-400">Total:</span>
                              <input 
                                type="number" 
                                value={totalOwned} 
                                onChange={(e) => updateInventory({ shards: { ...inventory.shards, [item.sinner]: parseInt(e.target.value) || 0 } })}
                                className="w-14 bg-[#0a0a0a] border border-[#333] rounded px-1 py-0.5 text-[11px] text-right focus:border-[#c9a84c] outline-none"
                              />
                            </div>
                          </div>
                          <button onClick={() => toggleWantList(item.name)} className="text-red-400 opacity-60 hover:opacity-100 transition-opacity p-1" title="Remove from Want List">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Shardability Warning Notice */}
                      {!shardStatus.shardable && (
                        <div className={`mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-xs font-semibold px-1 relative z-10 ${
                          shardStatus.reason === 'walpurgis'
                            ? 'text-purple-300'
                            : 'text-amber-400'
                        }`}>
                          {shardStatus.reason === 'walpurgis' ? (
                            <>
                              <span>🌙</span>
                              <span>Walpurgisnacht Exclusive: Cannot be sharded until Walpurgisnacht (Date TBA)</span>
                            </>
                          ) : (
                            <>
                              <span>🔒</span>
                              <span>Season 7 Locked: Unshardable in Dispenser during Season 8 (Extraction Only)</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add to Want List */}
        <div className="glass-card p-6 flex flex-col max-h-[70vh]">
          <h2 className="text-xl font-bold mb-4 font-limbus text-[#c9a84c]">Discover Targets</h2>
          
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#737373]" />
            <input type="text" placeholder="Search unowned IDs or EGOs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded pl-10 pr-4 py-2 focus:border-[#c9a84c] outline-none" />
          </div>

          <div className="overflow-y-auto space-y-2 pr-2">
            {filteredUnowned.length === 0 && search && (
              <p className="text-[#737373] text-sm text-center py-4">No unowned items match your search.</p>
            )}
            
            {filteredUnowned.some(i => i.type === 'id') && (
              <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-10 py-2 border-b border-[#333] mb-2">
                <h3 className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase">Identities</h3>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {filteredUnowned.filter(i => i.type === 'id').map(item => (
                <motion.div layout key={item.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-between items-center p-3 bg-[#111] hover:bg-[#1a1a1a] rounded border border-[#333] transition-colors mb-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{item.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        item.season === null
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                          : item.season === 7
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                          : item.season === 8
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                          : 'bg-[#222] text-gray-400 border border-gray-700'
                      }`}>
                        {item.season === null ? '🌙 Walpurgis' : item.season === 7 ? 'S7 (Locked)' : item.season === 8 ? 'Season 8' : item.season === 0 ? 'Standard' : `Season ${item.season}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] capitalize">{item.sinner} • {'★'.repeat(item.rarity)}</p>
                  </div>
                  <button onClick={() => toggleWantList(item.name)} className="p-2 bg-[#c9a84c] text-black rounded hover:bg-white transition-colors">
                    <Plus size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredUnowned.some(i => i.type === 'ego') && (
              <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-10 py-2 border-b border-[#333] mb-2 mt-4">
                <h3 className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase">E.G.O</h3>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {filteredUnowned.filter(i => i.type === 'ego').map(item => (
                <motion.div layout key={item.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-between items-center p-3 bg-[#111] hover:bg-[#1a1a1a] rounded border border-[#333] transition-colors mb-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{item.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        item.season === null
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                          : item.season === 7
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                          : item.season === 8
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                          : 'bg-[#222] text-gray-400 border border-gray-700'
                      }`}>
                        {item.season === null ? '🌙 Walpurgis' : item.season === 7 ? 'S7 (Locked)' : item.season === 8 ? 'Season 8' : item.season === 0 ? 'Standard' : `Season ${item.season}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] capitalize">{item.sinner} • {item.grade}</p>
                  </div>
                  <button onClick={() => toggleWantList(item.name)} className="p-2 bg-[#c9a84c] text-black rounded hover:bg-white transition-colors">
                    <Plus size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
