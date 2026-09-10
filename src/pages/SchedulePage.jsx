import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { Calculator, Calendar, Check, AlertTriangle, ArrowRight, Target, Flame, Settings } from 'lucide-react';
import DailyCycleTracker from '../components/DailyCycleTracker.jsx';
import sinnersData from '../data/sinners.json';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import { getEntityImageUrl } from '../utils/imageUtils.js';
import { 
  DEFAULT_SEASON_END_DATE, 
  getSeasonEndDate, 
  getUserTimeZoneShort, 
  toLocalInputString, 
  formatLocalDateTime, 
  formatKstDateTime 
} from '../utils/seasonUtils.js';

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
  const { scheduleState, updateScheduleState, bpState, updateBpState, inventory, wantList, identitiesData, egosData, activeBanner, reanchorSchedule } = useStore();
  const safeMath = bpState.safeMath === true;
  const canto = bpState.canto || 8;
  const cantoUnlockedHard = canto >= 8;
  const preferHardMd = bpState.preferHardMd !== false;
  const hasMdHard = cantoUnlockedHard && preferHardMd;

  // Update store when canto changes
  const handleCantoChange = (val) => {
    updateBpState({ canto: val, hasMdHard: val >= 8 && preferHardMd });
  };

  // Players can update this once a new season is announced; it is converted to their local timezone.
  const seasonEndDate = getSeasonEndDate(bpState);
  const userTzShort = getUserTimeZoneShort();

  // 1. Figure out targeted goals
  const targetItems = [...(wantList || [])].map(name => {
    return identitiesData?.find(id => id.name === name) || egosData?.find(ego => ego.name === name);
  }).filter(Boolean);

  const calcItems = targetItems.map(item => ({ 
    name: item.name,
    sinner: item.sinner,
    sinnerId: item.sinner, 
    rarity: !!item.grade ? 'EGO' : (item.rarity === 3 ? '000' : '00') 
  }));

  // 2. Math via Deterministic Engine
  const calcResult = useMemo(() => calculateLimbusGrind(
    calcItems,
    inventory,
    { ...bpState, canto, preferHardMd, hasMdHard, safeMath },
    scheduleState,
    seasonEndDate
  ), [calcItems, inventory, bpState, canto, preferHardMd, hasMdHard, safeMath, scheduleState, seasonEndDate]);

  const paceMode = bpState.paceMode || 'relaxed';
  const customDailyRuns = bpState.customDailyRuns || 3;

  const rawPacePerDay = calcResult.daysLeft > 0 ? (calcResult.rawMdsNeeded / calcResult.daysLeft) : 0;
  const effectivePace = paceMode === 'rush' ? customDailyRuns : rawPacePerDay;
  const paceDisplay = effectivePace.toFixed(effectivePace % 1 === 0 ? 0 : 1);
  
  let burnoutColor = 'text-[#22c55e]';
  let burnoutBg = 'border-[#22c55e]/30 bg-emerald-950/30';
  let burnoutStatus = 'Relaxed Pace';
  let burnoutDescription = 'Comfortable daily pace with plenty of breathing room.';

  if (effectivePace > 1.5 && effectivePace <= 3.0) {
    burnoutColor = 'text-[#eab308]';
    burnoutBg = 'border-[#eab308]/30 bg-amber-950/30';
    burnoutStatus = 'Moderate Grind';
    burnoutDescription = 'Steady, consistent grinding pace. Manageable with daily play.';
  } else if (effectivePace > 3.0 && effectivePace <= 4.5) {
    burnoutColor = 'text-[#ef4444]';
    burnoutBg = 'border-[#ef4444]/40 bg-red-950/40';
    burnoutStatus = 'High Burnout Risk';
    burnoutDescription = 'Heavy grind load! May cause fatigue and require significant daily time.';
  } else if (effectivePace > 4.5) {
    burnoutColor = 'text-red-500';
    burnoutBg = 'border-red-600 bg-red-950/60 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
    burnoutStatus = 'Extreme Burnout Chance';
    burnoutDescription = 'Grinding 5+ Mirror Dungeons per day will lead to extreme fatigue, distorted sanity, and burnout.';
  }

  // Generate Roadmap with Egoshard Milestones
  const { roadmap, totalModulesNeeded, targetMilestones } = useMemo(() => generateRoadmap(
    calcResult.daysLeft,
    calcResult.plannedRuns,
    scheduleState,
    { ...bpState, canto, preferHardMd, hasMdHard, safeMath },
    targetItems,
    inventory
  ), [calcResult.daysLeft, calcResult.plannedRuns, scheduleState, bpState, canto, preferHardMd, hasMdHard, safeMath, targetItems, inventory]);

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

            <div className="bg-black/50 p-3 rounded space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-gray-300 font-bold text-sm flex items-center gap-1.5">
                    Season End ({userTzShort})
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Automatically matched to your local timezone ({userTzShort}).
                  </span>
                </div>
                <input
                  type="datetime-local"
                  value={toLocalInputString(seasonEndDate)}
                  onChange={e => {
                    if (!e.target.value) return;
                    const localDt = new Date(e.target.value);
                    if (!isNaN(localDt.getTime())) {
                      updateBpState({ seasonEndDate: localDt.toISOString() });
                    }
                  }}
                  className="bg-[#1a1a1a] border border-[#444] text-white text-sm rounded p-1.5 focus:border-[#c9a84c] outline-none"
                />
              </div>
              <div className="pt-2 border-t border-[#333]/60 flex flex-wrap items-center justify-between text-[10px] text-gray-400 gap-2">
                <span>🌐 Local: <strong className="text-gray-200">{formatLocalDateTime(seasonEndDate)}</strong></span>
                <span>🇰🇷 KST Maintenance: <strong className="text-amber-400/90">{formatKstDateTime(seasonEndDate)}</strong></span>
              </div>
            </div>

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
                  <span className="text-[10px] text-gray-500">Auto-resets Wednesday at 5:00 PM local time</span>
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
              <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                 <span>MD Hard Mode:</span>
                 <span className={cantoUnlockedHard ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                    {cantoUnlockedHard ? "Unlocked" : "Locked (Canto VIII required)"}
                 </span>
              </div>
            </div>

            {cantoUnlockedHard && (
              <label className="flex justify-between items-center bg-black/50 p-3 rounded cursor-pointer group hover:border-[#c9a84c]/50 transition-colors border border-transparent">
                <div>
                  <span className="text-white font-bold text-sm block group-hover:text-[#c9a84c] transition-colors">Plan Hard Mirror Dungeon</span>
                  <span className="text-[10px] text-gray-400">18 modules for 225 EXP (uncheck for 3 Regular runs @ 5 mod each)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferHardMd} 
                  onChange={e => updateBpState({ preferHardMd: e.target.checked, hasMdHard: e.target.checked })} 
                  className="w-5 h-5 accent-[#c9a84c]" 
                />
              </label>
            )}

            <label className="flex justify-between items-center bg-black/50 p-3 rounded cursor-pointer group">
              <span className="text-[#eab308] font-bold text-sm group-hover:text-white">Premium Pass (3x Crates)</span>
              <input type="checkbox" checked={bpState.isPremium} onChange={e => updateBpState({isPremium: e.target.checked})} className="w-5 h-5 accent-[#c9a84c]" />
            </label>
            <label className="flex justify-between items-center bg-black/50 p-3 rounded cursor-pointer group">
              <div>
                <span className="text-gray-300 font-bold text-sm group-hover:text-white block">Safe Math (1.5 Shards/Crate)</span>
                <span className="text-[10px] text-gray-500">Uncheck for expected average (2.0 Shards/Crate)</span>
              </div>
              <input type="checkbox" checked={safeMath} onChange={e => updateBpState({safeMath: e.target.checked})} className="w-5 h-5 accent-[#c9a84c]" />
            </label>
            <label className="flex justify-between items-center bg-black/50 p-3 rounded cursor-pointer group hover:border-[#c9a84c]/50 transition-colors border border-transparent">
              <div>
                <span className="text-white font-bold text-sm group-hover:text-[#c9a84c] transition-colors flex items-center gap-1.5">
                  🚀 ASAP Mode (Rely on MDs over Dailies)
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Grind MDs to craft goals directly without waiting on future daily logins. Reaches targets days earlier.
                </span>
              </div>
              <input 
                type="checkbox" 
                checked={bpState.asapMode || false} 
                onChange={e => updateBpState({ asapMode: e.target.checked })} 
                className="w-5 h-5 accent-[#c9a84c]" 
              />
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
              {bpState.asapMode ? (
                <p className="text-amber-400 text-sm font-medium">
                  🚀 <strong>ASAP Mode Active:</strong> Grinding purely via Mirror Dungeons (<strong className="text-white">{calcResult.rawMdsNeeded} MDs</strong>) to hit your shard goals directly without waiting on future daily logins!
                </p>
              ) : (
                <p className="text-gray-400 text-sm">
                  You will passively earn <strong className="text-white">{calcResult.passiveExp} EXP</strong> by doing your Dailies and Weeklies.
                  This leaves <strong className="text-red-400">{calcResult.expToGrind} EXP</strong> left to grind.
                </p>
              )}
            </div>
          </div>
          
          <div className="h-auto">
            <DailyCycleTracker />
          </div>
        </div>
      </div>

      {/* Burnout Meter & Pacing Selector */}
      <div className={`border-2 rounded-xl p-6 md:p-8 mb-8 shadow-lg bg-black/40 backdrop-blur transition-all ${
        effectivePace > 4.5 ? 'border-red-600 bg-red-950/30 shadow-[0_0_30px_rgba(220,38,38,0.3)]' :
        effectivePace > 3.0 ? 'border-red-900/60 bg-red-950/20' :
        effectivePace > 1.5 ? 'border-amber-900/50 bg-amber-950/10' : 'border-[#333]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#333]">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Flame className={burnoutColor} size={28} /> Daily Pace: {paceDisplay} MDs / Day
              </h2>
              <span className={`text-xs uppercase font-black px-3 py-1 rounded-full border ${burnoutBg} ${burnoutColor}`}>
                {burnoutStatus}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {paceMode === 'relaxed' ? (
                <>You need to run <strong className="text-white">{calcResult.rawMdsNeeded} Mirror Dungeons</strong> spread across the remaining {calcResult.daysLeft} days of the season{bpState.asapMode ? ' (relying directly on MDs to reach shard goals ASAP)' : ''}.</>
              ) : (
                <>Rushing at <strong className="text-white">{customDailyRuns} MDs/day</strong> will complete all <strong className="text-white">{calcResult.rawMdsNeeded} required runs</strong> in approximately <strong className="text-amber-400">{Math.ceil(calcResult.rawMdsNeeded / (customDailyRuns || 1))} days</strong>{bpState.asapMode ? ' (ASAP pure MD grind)' : ''}.</>
              )}
            </p>
            <p className={`text-xs mt-1.5 font-medium ${burnoutColor}`}>{burnoutDescription}</p>
            {bpState.asapMode && (
              <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <span>🚀</span>
                <span>ASAP Mode Active: Mirror Dungeons scheduled directly to finish goals without waiting on future daily logins!</span>
              </div>
            )}
          </div>

          {/* Mode Selector Tabs + ASAP Toggle */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
            <div className="flex bg-[#111] p-1.5 rounded-lg border border-[#333]">
              <button
                onClick={() => updateBpState({ paceMode: 'relaxed' })}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  paceMode === 'relaxed' 
                    ? 'bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)] font-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ☕ Relaxed Pace
              </button>
              <button
                onClick={() => updateBpState({ paceMode: 'rush' })}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  paceMode === 'rush' 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] font-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚡ Rush Pace
              </button>
            </div>

            {/* ASAP Mode Pill Button */}
            <button
              onClick={() => updateBpState({ asapMode: !bpState.asapMode })}
              title="Rely on Mirror Dungeons over passive daily logins to reach shard goals as fast as possible"
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                bpState.asapMode 
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                  : 'bg-[#111] text-gray-400 border-[#333] hover:text-white hover:border-[#555]'
              }`}
            >
              <span>🚀 ASAP Mode</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-black font-mono ${
                bpState.asapMode ? 'bg-black text-amber-400' : 'bg-[#222] text-gray-400'
              }`}>
                {bpState.asapMode ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Rush Mode Controls (Only visible when Rush Pace is selected) */}
        {paceMode === 'rush' && (
          <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Customize Rush Intensity
              </span>
              <p className="text-xs text-gray-500">
                Choose how many Mirror Dungeons you want to speed-run per day.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center bg-[#111] border border-[#333] rounded-lg overflow-hidden">
                <button
                  onClick={() => updateBpState({ customDailyRuns: Math.max(1, customDailyRuns - 1) })}
                  className="px-3 py-2 text-gray-400 hover:text-white hover:bg-[#222] font-bold text-base transition-colors"
                >
                  -
                </button>
                <div className="px-4 py-2 text-white font-black text-sm min-w-[70px] text-center bg-black/40">
                  {customDailyRuns} / day
                </div>
                <button
                  onClick={() => updateBpState({ customDailyRuns: Math.min(20, customDailyRuns + 1) })}
                  className="px-3 py-2 text-gray-400 hover:text-white hover:bg-[#222] font-bold text-base transition-colors"
                >
                  +
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5, 8].map(num => (
                  <button
                    key={num}
                    onClick={() => updateBpState({ customDailyRuns: num })}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      customDailyRuns === num
                        ? (num >= 5 ? 'bg-red-600 text-white font-black shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-[#c9a84c] text-black font-black')
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a] border border-[#333]'
                    }`}
                  >
                    {num >= 5 ? `${num} 🔥` : num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Egoshard Allocation & Target Milestones Guide */}
      {targetMilestones && targetMilestones.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target size={24} className="text-[#c9a84c]" /> Egoshard Allocation Plan & Milestones
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Nominable Egocrates are prioritized towards your closest goal first, then automatically rollover to subsequent targets once crafted.
              </p>
            </div>
            <button 
              onClick={() => {
                reanchorSchedule();
                alert("Schedule baseline re-anchored to today!");
              }} 
              className="text-xs px-3 py-1.5 rounded bg-black/50 border border-[#444] hover:border-[#c9a84c] text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Reset Day 1 anchor to today's date"
            >
              Re-anchor Schedule to Today
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targetMilestones.map((target, idx) => {
              const currentOwned = target.startingShards !== undefined ? target.startingShards : (target.ownedShards || 0);
              const pct = Math.min(100, Math.round((currentOwned / target.cost) * 100));
              const isAlreadyCraftable = target.alreadyCraftable;
              const willCraftInRoadmap = target.completed;

              return (
                <div key={idx} className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                  isAlreadyCraftable 
                    ? 'bg-gradient-to-br from-[#22c55e]/20 to-black border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.15)]' 
                    : willCraftInRoadmap 
                      ? 'bg-gradient-to-br from-[#c9a84c]/15 to-black border-[#c9a84c]/70 shadow-[0_0_15px_rgba(201,168,76,0.1)]' 
                      : 'bg-[#111] border-[#333]'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#c9a84c] text-black">
                      Step {idx + 1} Target
                    </span>
                    <span className="text-xs text-gray-400 capitalize font-medium">{target.sinnerName}</span>
                  </div>

                  <h3 className="font-bold text-white text-base truncate mb-3" title={target.name}>
                    {target.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Current Shards Owned</span>
                      <span className="text-white font-mono font-bold">
                        {Math.floor(currentOwned)} <span className="text-gray-500">/ {target.cost}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden border border-[#333]">
                      <div 
                        className={`h-full transition-all duration-500 ${isAlreadyCraftable ? 'bg-[#22c55e]' : 'bg-[#c9a84c]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#222]">
                      <span className="text-[11px] text-gray-500">Milestone Date:</span>
                      <span className={`text-xs font-bold font-mono ${
                        isAlreadyCraftable 
                          ? 'text-[#22c55e]' 
                          : willCraftInRoadmap 
                            ? 'text-yellow-400' 
                            : 'text-gray-500'
                      }`}>
                        {isAlreadyCraftable 
                          ? '✅ Ready to Craft Now' 
                          : willCraftInRoadmap 
                            ? `${target.completedDate || `Day ${target.completedDay}`}` 
                            : `In Progress (+${target.cost - currentOwned} needed)`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roadmap Table */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6 flex items-center gap-2">
        <Calendar size={24} className="text-[#c9a84c]" /> Grind Roadmap (Next 30 Days)
      </h2>
      <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden mb-12">
         <div className="grid grid-cols-6 bg-black/60 p-4 border-b border-[#333] font-bold text-sm text-gray-400 uppercase tracking-wider">
            <div>Day & Date</div>
            <div>Required MDs</div>
            <div>EXP Gained</div>
            <div className="text-[#60a5fa]">Modules Cost</div>
            <div>Total EXP Generated</div>
            <div className="text-[#c9a84c]">Target & Milestone</div>
         </div>
           <div className="max-h-[360px] overflow-y-auto">
               {(() => {
                const goalIdx = calcResult.bpExpNeeded > 0 ? roadmap.findIndex(r => r.totalExp >= calcResult.bpExpNeeded) : -1;
                const todayRuns = scheduleState.todayLoggedRuns || [];
                const mdDoneToday = scheduleState.mdTodayDone || todayRuns.length > 0;
                const dailiesProgress = scheduleState.dailiesProgress || 0;
                const dailiesDone = scheduleState.dailiesDone || dailiesProgress >= 5;
                const weekliesDone = scheduleState.weekliesDone || false;
                const canClaimWeeklies = scheduleState.canClaimWeeklies || false;

                return roadmap.map((row, idx) => {
                  const isGoal = idx === goalIdx;
                  const hasMilestone = row.milestonesReachedToday && row.milestonesReachedToday.length > 0;
                  const isRowCompleted = row.isToday && mdDoneToday && dailiesDone;

                  return (
                    <div key={idx} className={`grid grid-cols-6 p-4 border-b border-[#333]/50 text-sm transition-colors ${
                      hasMilestone 
                        ? 'bg-[#c9a84c]/20 border-[#c9a84c]' 
                        : isGoal 
                          ? 'bg-[#22c55e]/20 border-[#22c55e]' 
                          : isRowCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : row.isToday 
                              ? 'bg-[#c9a84c]/10 border-[#c9a84c]/40' 
                              : row.isWeeklyReset 
                                ? 'bg-amber-950/15 border-amber-900/30' 
                                : ''
                    }`}>
                        <div className="font-bold text-white flex flex-col justify-center">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>Day {row.day}</span>
                            {row.isToday && (
                              <span className="text-[9px] uppercase tracking-wider bg-[#c9a84c] text-black font-black px-1.5 py-0.5 rounded shadow-sm">
                                Today
                              </span>
                            )}
                            {row.isWeeklyReset && (
                              <span className="text-[9px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-1.5 py-0.5 rounded">
                                🔄 Weekly Reset
                              </span>
                            )}
                            {isGoal && !hasMilestone && (
                              <span className="text-[9px] uppercase tracking-wider bg-[#22c55e] text-black px-1.5 py-0.5 rounded font-black shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                                Goal Met
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 font-normal mt-0.5">
                            {row.weekday}, {row.date}
                          </span>
                        </div>

                        {/* Required MDs */}
                        <div className="flex flex-col justify-center">
                          {row.isToday && mdDoneToday ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 w-fit shadow-sm">
                                <Check size={12} className="text-emerald-400" /> Done ({todayRuns.length}/{Math.max(1, row.runs)} Runs)
                              </span>
                              {todayRuns.map((r, i) => (
                                <span key={i} className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-medium">
                                  ✓ {r.type} (+{r.exp} EXP)
                                </span>
                              ))}
                            </div>
                          ) : row.runs > 0 ? (
                            <div className="flex flex-col gap-1">
                              {row.runsList.map((run, i) => (
                                <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${
                                  run.type === 'Hard Bonus' 
                                    ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' 
                                    : run.type === 'Normal Bonus' 
                                      ? 'bg-[#c9a84c]/20 text-[#eab308] border border-[#c9a84c]/30' 
                                      : 'bg-[#333] text-gray-300'
                                }`}>
                                  1x {run.type}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">Rest (No MD Required)</span>
                          )}
                        </div>

                        {/* EXP Gained */}
                        <div className="font-mono text-sm flex flex-col justify-center">
                          {row.isToday ? (
                            <>
                              {todayRuns.length > 0 ? (
                                <div className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Check size={12} /> +{todayRuns.reduce((acc, r) => acc + r.exp, 0)} <span className="text-[10px] text-emerald-300/80 font-normal">MD Logged</span>
                                </div>
                              ) : row.runs > 0 ? (
                                <div className="text-green-400 font-bold">+{row.gainedExpFromRuns} <span className="text-[10px] text-gray-400 font-normal">MD</span></div>
                              ) : (
                                <div className="text-gray-500 text-xs">0 MD</div>
                              )}
                              {dailiesDone ? (
                                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                                  <Check size={10} /> +10 Dailies (Done)
                                </div>
                              ) : (
                                <div className="text-[11px] text-[#c9a84c]">
                                  +{dailiesProgress * 2} / +10 Dailies
                                </div>
                              )}
                              {weekliesDone && (
                                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                                  <Check size={10} /> +20 Weeklies (Done)
                                </div>
                              )}
                              {!weekliesDone && canClaimWeeklies && (
                                <div className="text-[11px] text-amber-400 font-bold">
                                  🎁 +20 Weeklies (Claimable)
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {row.runs > 0 ? (
                                <div className="text-green-400 font-bold">+{row.gainedExpFromRuns} <span className="text-[10px] text-gray-400 font-normal">MD</span></div>
                              ) : (
                                <div className="text-gray-500 text-xs">0 MD</div>
                              )}
                              {row.isWeeklyReset ? (
                                <div className="text-[11px] text-amber-400 font-medium">
                                  +20 Weeklies + 10 Dailies
                                </div>
                              ) : row.passiveGained > 0 ? (
                                <div className="text-[11px] text-[#c9a84c]">
                                  +{row.passiveGained} Dailies
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>

                        {/* Modules Cost */}
                        <div className="flex flex-col justify-center">
                          {row.isToday && (todayRuns.length > 0 || dailiesDone) ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-emerald-400 font-bold font-mono text-xs flex items-center gap-1">
                                <Check size={12} /> {todayRuns.reduce((acc, r) => acc + r.modules, 0) + (dailiesDone ? 5 : 0)} <span className="text-[10px] text-emerald-300/80 font-normal">mod spent</span>
                              </span>
                              <div className="flex flex-col gap-0.5 text-[10px] text-gray-500">
                                {dailiesDone && <span>✓ 5 Dailies</span>}
                                {todayRuns.map((r, i) => (
                                  <span key={i}>✓ {r.modules} {r.type}</span>
                                ))}
                              </div>
                            </div>
                          ) : row.modulesUsed > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[#60a5fa] font-bold font-mono text-xs">{row.modulesUsed} <span className="text-[10px] text-gray-400 font-normal">modules</span></span>
                              <div className="flex flex-col gap-0.5 text-[10px] text-gray-500">
                                <span>5 Dailies</span>
                                {row.runsList.map((run, i) => (
                                  <span key={i}>{run.modules} {run.type}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">0</span>
                          )}
                        </div>

                        {/* Total EXP Generated */}
                        <div className="text-white font-mono font-bold flex flex-col justify-center">
                          <div className="flex items-center gap-1.5">
                            <span>{row.totalExp}</span>
                            <span className="text-xs text-gray-500 font-normal">(+{row.gained})</span>
                          </div>
                          {isGoal && <span className="text-[#22c55e] text-xs font-bold mt-0.5">Goal ({calcResult.bpExpNeeded} EXP)</span>}
                        </div>

                        {/* Egoshard Target / Milestone Column */}
                        <div className="flex flex-col justify-center text-xs">
                          {hasMilestone ? (
                            <div className="space-y-1">
                              {row.milestonesReachedToday.map((m, mi) => (
                                <div key={mi} className="bg-[#c9a84c] text-black font-black text-[10px] px-2 py-1 rounded shadow flex items-center gap-1 truncate" title={m.name}>
                                  <span>🏆</span>
                                  <span className="truncate">CRAFT: {m.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : row.activeFarmingTarget ? (
                            <div className="text-gray-300 flex flex-col">
                              <span className="text-[10px] text-[#c9a84c] font-bold flex items-center gap-1 truncate">
                                <span>🎯</span>
                                <span className="truncate">{row.activeFarmingTarget.name}</span>
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {row.activeFarmingTarget.currentShards} / {row.activeFarmingTarget.targetCost} Shards
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-[10px]">All Goals Reached</span>
                          )}
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
