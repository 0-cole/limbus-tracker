import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { Calculator, Calendar, Check, AlertTriangle, ArrowRight, Target, Flame, Settings } from 'lucide-react';
import DailyCycleTracker from '../components/DailyCycleTracker.jsx';
import sinnersData from '../data/sinners.json';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import { getEntityImageUrl } from '../utils/imageUtils.js';
import { DEFAULT_SEASON_END_DATE, getSeasonEndDate } from '../utils/seasonUtils.js';

const CANTOS = [
  { id: 1, name: 'Canto I: The Outcast' },
  { id: 2, name: 'Canto II: The Unloving' },
  { id: 3, name: 'Canto III: The Unconfronting' },
  { id: 4, name: 'Canto IV: The Unchanging' },
  { id: 5, name: 'Canto V: The Evil Defining' },
  { id: 6, name: 'Canto VI: The Heartbreaking' },
  { id: 7, name: 'Canto VII: The Dream Ending' },
  { id: 8, name: 'Canto VIII' },
  { id: 9, name: 'Canto IX' },
  { id: 10, name: 'Canto X' }
];

export default function SchedulePage() {
  const { scheduleState, updateScheduleState, bpState, updateBpState, inventory, wantList, identitiesData, egosData, activeBanner } = useStore();
  const [safeMath, setSafeMath] = useState(false);
  const [canto, setCanto] = useState(bpState.canto || 9);

  // Update store when canto changes
  const handleCantoChange = (val) => {
    setCanto(val);
    updateBpState({ canto: val, hasMdHard: val >= 9 });
  };

  const hasMdHard = canto >= 9;

  // Players can update this once a new season is announced; it is always KST.
  const seasonEndDate = getSeasonEndDate(bpState);

  // 1. Figure out targeted goals
  const targetItems = [...(wantList || [])].map(name => {
    return identitiesData?.find(id => id.name === name) || egosData?.find(ego => ego.name === name);
  }).filter(Boolean);

  const calcItems = targetItems.map(item => ({ sinnerId: item.sinner, rarity: !!item.grade ? 'EGO' : (item.rarity === 3 ? '000' : '00') }));

  // 2. Math via Deterministic Engine
  const calcResult = useMemo(() => calculateLimbusGrind(
    calcItems,
    inventory,
    { ...bpState, hasMdHard },
    scheduleState,
    seasonEndDate
  ), [calcItems, inventory, bpState, hasMdHard, scheduleState, seasonEndDate]);

  const pacePerDay = calcResult.daysLeft > 0 ? (calcResult.rawMdsNeeded / calcResult.daysLeft).toFixed(1) : 0;
  
  let burnoutColor = 'text-[#22c55e]';
  let burnoutStatus = 'Relaxed Pace';
  if (pacePerDay > 1.5) { burnoutColor = 'text-[#eab308]'; burnoutStatus = 'Moderate Grind'; }
  if (pacePerDay > 3.0) { burnoutColor = 'text-[#ef4444]'; burnoutStatus = 'High Burnout Risk'; }

  // Generate Roadmap
  const { roadmap, totalModulesNeeded } = useMemo(() => generateRoadmap(
    calcResult.daysLeft,
    calcResult.plannedRuns,
    scheduleState,
    bpState
  ), [calcResult.daysLeft, calcResult.plannedRuns, scheduleState, bpState]);

  // Find banner image URL if active banner text is known
  let bannerImageUrl = null;
  if (activeBanner?.text) {
     // A generic fallback pattern since we just scrape the text, we can build a URL for the wiki
     bannerImageUrl = `https://limbuscompany.wiki.gg/images/thumb/${encodeURIComponent(activeBanner.text.replace(/ /g, '_'))}_Banner.png/600px-img.png`;
  }

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b-2 border-[#333] pb-4">
        <h1 className="text-4xl font-black uppercase tracking-wider text-[#c9a84c]">
          Mirror Dungeon Schedule
        </h1>
        {activeBanner && (
          <div className="text-right">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Active Banner Detected</div>
            <div className="relative group rounded overflow-hidden border border-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.2)]">
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white font-bold text-sm px-2 text-center">{activeBanner.text}</span>
               </div>
               <img src={bannerImageUrl} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} className="h-16 w-auto object-cover" alt="Banner" />
               <div className="hidden h-16 px-4 bg-black flex items-center justify-center text-sm font-bold text-white">{activeBanner.text}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
        {/* Settings Card */}
        <div className="bg-[#111] border border-[#333] rounded-xl p-6 relative overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings size={20} className="text-gray-400" /> Math Settings
          </h2>
          <div className="space-y-4">
            <label className="flex justify-between items-center bg-black/50 p-3 rounded">
              <div>
                <span className="text-gray-300 font-bold text-sm">Days Left in Season</span>
                <span className="text-[10px] text-gray-500 ml-2">Calculated from the date below</span>
              </div>
              <span className="text-white font-mono text-lg font-bold bg-black/60 border border-[#c9a84c]/30 px-3 py-0.5 rounded">{calcResult.daysLeft}</span>
            </label>

            <label className="flex justify-between items-center bg-black/50 p-3 rounded gap-3">
              <div>
                <span className="text-gray-300 font-bold text-sm block">Season End (KST)</span>
                <span className="text-[10px] text-gray-500">Update this when Project Moon announces a new season.</span>
              </div>
              <input
                type="datetime-local"
                value={bpState.seasonEndDate || DEFAULT_SEASON_END_DATE}
                onChange={e => updateBpState({ seasonEndDate: e.target.value || DEFAULT_SEASON_END_DATE })}
                className="bg-[#1a1a1a] border border-[#444] text-white text-sm rounded p-1.5 focus:border-[#c9a84c] outline-none"
              />
            </label>

            <div className="flex gap-4">
              <label className="flex-1 flex justify-between items-center bg-black/50 p-3 rounded">
                <div>
                  <span className="text-gray-300 font-bold text-sm block">BP Level</span>
                </div>
                <input type="number" min="1" value={bpState.level} onChange={e => updateBpState({level: parseInt(e.target.value) || 1})} className="w-16 bg-[#1a1a1a] border border-[#444] text-white text-sm rounded p-1 text-right focus:border-[#c9a84c] outline-none" />
              </label>
              
              <label className="flex-1 flex justify-between items-center bg-black/50 p-3 rounded">
                <div>
                  <span className="text-gray-300 font-bold text-sm block">BP EXP</span>
                  <span className="text-[10px] text-gray-500">Out of 10</span>
                </div>
                <input type="number" min="0" max="9" value={bpState.currentExp} onChange={e => updateBpState({currentExp: parseInt(e.target.value) || 0})} className="w-12 bg-[#1a1a1a] border border-[#444] text-white text-sm rounded p-1 text-right focus:border-[#c9a84c] outline-none" />
              </label>
            </div>

            <label className="flex justify-between items-center bg-black/50 p-3 rounded">
                <div>
                  <span className="text-gray-300 font-bold text-sm block">Bonuses Claimed This Week</span>
                  <span className="text-[10px] text-gray-500">Auto-resets on Thursday</span>
                </div>
                <input type="number" min="0" max="3" value={scheduleState.mdBonusesClaimed || 0} onChange={e => updateScheduleState({mdBonusesClaimed: parseInt(e.target.value) || 0})} className="w-12 bg-[#1a1a1a] border border-[#444] text-white text-sm rounded p-1 text-right focus:border-[#c9a84c] outline-none" />
              </label>
            
            <div className="bg-black/50 p-3 rounded">
              <span className="text-gray-300 font-bold text-sm block mb-2">Story Progress (Unlocks)</span>
              <select 
                value={canto} 
                onChange={e => handleCantoChange(parseInt(e.target.value))}
                className="w-full bg-[#1a1a1a] border border-[#444] text-white text-sm rounded p-2 focus:border-[#c9a84c] outline-none"
              >
                {CANTOS.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                 <span>MD Hard Mode:</span>
                 <span className={hasMdHard ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                    {hasMdHard ? "Unlocked (225 EXP/wk)" : "Locked (135 EXP/wk)"}
                 </span>
              </div>
            </div>

            <label className="flex justify-between items-center bg-black/50 p-3 rounded cursor-pointer group">
              <span className="text-[#eab308] font-bold text-sm group-hover:text-white">Premium Pass (3x Crates)</span>
              <input type="checkbox" checked={bpState.isPremium} onChange={e => updateBpState({isPremium: e.target.checked})} className="w-5 h-5 accent-[#c9a84c]" />
            </label>
            <label className="flex justify-between items-center bg-black/50 p-3 rounded cursor-pointer group">
              <span className="text-gray-300 font-bold text-sm group-hover:text-white">Safe Math (1.5 Shards/Crate)</span>
              <input type="checkbox" checked={safeMath} onChange={e => setSafeMath(e.target.checked)} className="w-5 h-5 accent-[#c9a84c]" />
            </label>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Math Output Card */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 relative overflow-hidden flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-[#333]">
              <div>
                <div className="text-sm text-gray-500 font-bold uppercase mb-2">Shards Needed</div>
                <div className="text-4xl font-black text-white">{calcResult.shardsNeeded}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold uppercase mb-2">Crates Needed</div>
                <div className="text-4xl font-black text-[#eab308]">{calcResult.cratesNeeded}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold uppercase mb-2">BP EXP Needed</div>
                <div className="text-4xl font-black text-[#22c55e]">{calcResult.bpExpNeeded}</div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#333] text-center">
              <p className="text-gray-400 text-sm">
                You will passively earn <strong className="text-white">{calcResult.passiveExp} EXP</strong> by doing your Dailies and Weeklies.
                This leaves <strong className="text-red-400">{calcResult.expToGrind} EXP</strong> left to grind.
              </p>
            </div>
          </div>
          
          <div className="h-auto">
            <DailyCycleTracker />
          </div>
        </div>
      </div>

      {/* Burnout Meter */}
      <div className={`border-2 rounded-xl p-8 flex items-center justify-between mb-8 shadow-lg bg-black/40 backdrop-blur ${pacePerDay > 3 ? 'border-red-900/50' : 'border-[#333]'}`}>
        <div>
          <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <Flame className={burnoutColor} /> Daily Pace: {pacePerDay} MDs / Day
          </h2>
          <p className="text-gray-400">
            You need to run <strong className="text-white">{calcResult.rawMdsNeeded} Mirror Dungeons</strong> before the season ends to reach your Wishlist goals.
          </p>
        </div>
        <div className={`text-xl font-bold uppercase tracking-wider px-4 py-2 rounded border ${burnoutColor} ${pacePerDay > 3 ? 'border-red-900 bg-red-950/30' : 'border-[#333] bg-black/50'}`}>
          {burnoutStatus}
        </div>
      </div>

      {/* Roadmap Table */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-2">
        <Calendar size={24} className="text-[#c9a84c]" /> Grind Roadmap (Next 30 Days)
      </h2>
      <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden mb-12">
         <div className="grid grid-cols-4 bg-black/60 p-4 border-b border-[#333] font-bold text-sm text-gray-400 uppercase tracking-wider">
            <div>Day</div>
            <div>Required MDs</div>
            <div>EXP Gained</div>
            <div>Total EXP Generated</div>
         </div>
           <div className="max-h-[300px] overflow-y-auto">
              {(() => {
                const goalIdx = calcResult.bpExpNeeded > 0 ? roadmap.findIndex(r => r.totalExp >= calcResult.bpExpNeeded) : -1;
                return roadmap.map((row, idx) => {
                  const isGoal = idx === goalIdx;
                  return (
                    <div key={idx} className={`grid grid-cols-4 p-4 border-b border-[#333]/50 text-sm ${isGoal ? 'bg-[#22c55e]/20 border-[#22c55e]' : row.day % 7 === 1 ? 'bg-[#c9a84c]/10' : ''}`}>
                        <div className="font-bold text-white flex items-center">
                          Day {row.day} <span className="text-xs text-gray-400 font-normal ml-2">({row.weekday})</span>
                          {row.day % 7 === 1 && !isGoal && <span className="text-xs text-[#c9a84c] ml-2">(Weekly Reset)</span>}
                          {isGoal && <span className="text-[10px] uppercase tracking-wider bg-[#22c55e] text-black px-2 py-0.5 rounded font-black ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]">Goal Reached</span>}
                        </div>
                          <div>
                            {row.runs > 0 ? (
                              <div className="flex flex-col gap-1">
                                {row.runsList.map((run, i) => (
                                  <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${run.type === 'Hard Bonus' ? 'bg-[#ef4444]/20 text-[#ef4444]' : run.type === 'Normal Bonus' ? 'bg-[#c9a84c]/20 text-[#eab308]' : 'bg-[#333] text-gray-300'}`}>
                                    1x {run.type}
                                  </span>
                                ))}
                              </div>
                            ) : <span className="text-gray-500">Rest</span>}
                          </div>
                        <div className="font-mono text-sm flex flex-col justify-center">
                          {row.runs > 0 ? (
                            <div className="text-green-400 font-bold">+{row.gainedExpFromRuns} <span className="text-[10px] text-gray-400 font-normal">MD</span></div>
                          ) : (
                            <div className="text-gray-500 text-xs">0 MD</div>
                          )}
                          {row.passiveGained > 0 && (
                            <div className="text-[11px] text-[#c9a84c] font-normal">
                              +{row.passiveGained} <span className="text-gray-500">Missions</span>
                            </div>
                          )}
                        </div>
                        <div className="text-white font-mono font-bold flex flex-col justify-center">
                          <div className="flex items-center gap-1.5">
                            <span>{row.totalExp}</span>
                            <span className="text-xs text-gray-500 font-normal">(+{row.gained})</span>
                          </div>
                          {isGoal && <span className="text-[#22c55e] text-xs font-bold mt-0.5">Goal Met ({calcResult.bpExpNeeded} EXP)</span>}
                        </div>
                    </div>
                  );
                });
              })()}
           </div>
      </div>

      {/* Targets */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-2">
        <Target size={24} className="text-[#c9a84c]" /> Targeted Entities
      </h2>
      
      {targetItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#333] rounded-xl text-gray-500">
          <p>Your Wishlist is empty.</p>
          <p className="text-sm mt-2">Go to the Wishlist tab to add Identities and E.G.O to track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {targetItems.map(item => (
            <div key={item.name} className="bg-[#1a1a1a] border border-[#333] rounded p-4 flex gap-4 items-center">
              <div className="w-12 h-12 bg-black rounded overflow-hidden border border-gray-700 flex-shrink-0">
                <img src={getEntityImageUrl(item)} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} className="w-full h-full object-cover opacity-70" alt="" />
                  <div className="hidden w-full h-full bg-[#222] text-xs text-gray-500 items-center justify-center font-bold">?</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 truncate capitalize">{item.sinner}</div>
                <div className="font-bold text-sm text-white truncate">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
