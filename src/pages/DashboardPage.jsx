import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore.js';
import { CheckCircle, XCircle, AlertCircle, Calendar, Target, Flame, CalendarDays, Battery, Archive, Award, Trash2, Clock, Check } from 'lucide-react';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import { getNextResets } from '../utils/timeUtils.js';
import { getSeasonEndDate } from '../utils/seasonUtils.js';

import DailyCycleTracker from '../components/DailyCycleTracker.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DashboardPage() {
  const { 
    weeklyProgress, updateWeekly, scheduleState, updateScheduleState, 
    bpState, updateBpState, inventory, wantList, identitiesData, egosData, 
    activeBanner, weeklyArchive = [], archiveCurrentWeek, deleteWeeklyArchive 
  } = useStore();
  const [showWhenGameStarts, setShowWhenGameStarts] = useState(true);

  const cantoUnlockedHard = (bpState.canto === undefined || bpState.canto >= 8);
  const preferHardMd = bpState.preferHardMd !== false;
  const effectiveHasMdHard = cantoUnlockedHard && preferHardMd && (bpState.hasMdHard !== false);

  const [currentDayStr, setCurrentDayStr] = useState('');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    // Determine today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayIndex = now.getDay();
    setCurrentDayStr(todayStr);
    setCurrentDayIndex(todayIndex);

    const updated = { ...weeklyProgress };
    
    if (updated.lastCheckedDate !== todayStr) {
      if (!updated.dailyStatus) updated.dailyStatus = {};
      
      if (updated.lastCheckedDate) {
        const last = new Date(updated.lastCheckedDate);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1 && updated.dailyStatus[updated.lastCheckedDate] !== 'done') {
          updated.dailyStatus[updated.lastCheckedDate] = 'missed';
        }
      }
      updated.lastCheckedDate = todayStr;
      if (!updated.dailyStatus[todayStr]) {
        updated.dailyStatus[todayStr] = scheduleState.dailiesDone ? 'done' : 'pending';
      }
      updateWeekly(updated);
    }
  }, [weeklyProgress, updateWeekly, scheduleState.dailiesDone]);

  useEffect(() => {
    if (!window.electronAPI?.getGameLaunchPreference) return;
    window.electronAPI.getGameLaunchPreference().then(setShowWhenGameStarts).catch(() => {});
  }, []);

  // Calculate missed days to suggest backup plans
  const missedDaysCount = Object.values(weeklyProgress.dailyStatus || {}).filter(v => v === 'missed').length;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-[#e5e5e5] h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-limbus text-[#c9a84c]">Command Dashboard</h1>
          <p className="text-[#737373] mt-1 flex items-center gap-2">
            <Calendar size={16} /> {DAYS[currentDayIndex]}, {currentDayStr}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
        {/* Daily Cycle Tracker (Unified) */}
        <div className="lg:col-span-2">
          <DailyCycleTracker />
        </div>

        {/* Right Column: Preferences & Contingency */}
        <div className="space-y-6">
          {/* MD Hard Mode Preference Card */}
          <div className="glass-card p-6 border-[#c9a84c]/20">
            <h2 className="text-lg font-bold mb-3 font-limbus text-white flex items-center gap-2">
              <Flame size={18} className="text-[#c9a84c]" /> Mirror Dungeon Preference
            </h2>
            {cantoUnlockedHard ? (
              <div>
                <p className="text-xs text-gray-400 mb-4">
                  You have Hard Mode unlocked. Choose whether to plan 1 Hard run (18 modules for 225 EXP) or 3 Regular runs (15 modules total for 135 EXP).
                </p>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    preferHardMd ? 'bg-[#c9a84c]/10 border-[#c9a84c]' : 'bg-black/40 border-[#333] hover:border-gray-500'
                  }`}>
                    <div>
                      <div className="text-white text-xs font-bold">Hard Mode (18 modules)</div>
                      <div className="text-[10px] text-gray-400">225 EXP (3 bonuses at once)</div>
                    </div>
                    <input 
                      type="radio" 
                      name="mdPref" 
                      checked={preferHardMd} 
                      onChange={() => updateBpState({ preferHardMd: true, hasMdHard: true })} 
                      className="accent-[#c9a84c] w-4 h-4" 
                    />
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    !preferHardMd ? 'bg-[#c9a84c]/10 border-[#c9a84c]' : 'bg-black/40 border-[#333] hover:border-gray-500'
                  }`}>
                    <div>
                      <div className="text-white text-xs font-bold">Regular MDs Only (5 mod/run)</div>
                      <div className="text-[10px] text-gray-400">45 EXP per bonus (15 mod total)</div>
                    </div>
                    <input 
                      type="radio" 
                      name="mdPref" 
                      checked={!preferHardMd} 
                      onChange={() => updateBpState({ preferHardMd: false, hasMdHard: false })} 
                      className="accent-[#c9a84c] w-4 h-4" 
                    />
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Story progress: <strong className="text-white">Canto {bpState.canto || 1}</strong>. Hard Mode unlocks at Canto VIII. All weekly runs will be calculated as Regular MDs (5 modules).
              </p>
            )}
          </div>

          {/* Missed Days & Backup Plans */}
          <div className="glass-card p-6 border-red-900/30">
            <h2 className="text-lg font-bold mb-3 font-limbus text-red-400 flex items-center gap-2">
              <AlertCircle size={18} /> Contingency Status
            </h2>
            {missedDaysCount === 0 ? (
              <p className="text-[#737373] text-xs">You are currently on schedule. No contingencies required.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#e5e5e5]">You missed <span className="font-bold text-red-400">{missedDaysCount}</span> daily login(s) recently.</p>
                <div className="p-3 bg-red-950/30 border border-red-900 rounded">
                  <p className="font-bold text-xs text-red-300 mb-1">Schedule Adjusted:</p>
                  <p className="text-[11px] text-[#ccc]">The grind roadmap has automatically redistributed your missed EXP over the remaining days of the season.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Calendar Overview */}
      {(() => {
        const { nextWeekly } = getNextResets(Date.now());
        const resetDate = new Date(nextWeekly);
        const resetDayIndex = resetDate.getDay();
        const resetDayName = DAYS[resetDayIndex];
        const resetTimeStr = resetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        return (
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-limbus text-white">Weekly Calendar Overview</h2>
                {bpState.asapMode && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    🚀 ASAP Mode Active
                  </span>
                )}
              </div>
              <span className="text-xs text-amber-400 font-bold bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                🔄 Resets every {resetDayName} ({resetTimeStr} Local / 06:00 KST)
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, idx) => {
                // Determine date for this day of the week based on today
                const diff = idx - currentDayIndex;
                const date = new Date();
                date.setDate(date.getDate() + diff);
                const dateStr = date.toISOString().split('T')[0];
                const status = weeklyProgress.dailyStatus?.[dateStr];
                const isResetDay = idx === resetDayIndex;
                const isToday = diff === 0;
                const mdDoneToday = isToday && (scheduleState.mdTodayDone || (scheduleState.todayLoggedRuns?.length > 0));

                let bgClass = "bg-[#111] border-[#333]";
                let icon = null;

                if (status === 'done') {
                  bgClass = "bg-[#c9a84c]/20 border-[#c9a84c]";
                  icon = <CheckCircle className="text-[#c9a84c] mx-auto mt-2" size={20} />;
                } else if (status === 'missed') {
                  bgClass = "bg-red-950/30 border-red-900";
                  icon = <XCircle className="text-red-500 mx-auto mt-2" size={20} />;
                } else if (diff < 0) {
                  // Past day without explicit missed flag - keep clean/neutral
                  bgClass = "bg-black/30 border-[#222] opacity-60";
                } else if (isToday) {
                  bgClass = mdDoneToday ? "bg-emerald-950/30 border-emerald-500/50" : "bg-[#222] border-white";
                }

                return (
                  <div key={day} className={`p-3 rounded-lg border text-center transition-all ${bgClass}`}>
                    <div className="flex items-center justify-center gap-1">
                      <p className={`text-xs font-bold ${isToday ? 'text-white' : 'text-[#737373]'}`}>{day.slice(0,3)}</p>
                      {isResetDay && <span className="text-[8px] bg-amber-500/30 text-amber-300 font-black px-1 rounded">Reset</span>}
                    </div>
                    <p className="text-[10px] text-[#555]">{date.getDate()}</p>
                    {icon}
                    {mdDoneToday && (
                      <div className="mt-1.5 text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1 py-0.5 rounded border border-emerald-500/30">
                        ⚔️ MD Done
                      </div>
                    )}
                    {isResetDay && scheduleState.weekliesDone && (
                      <div className="mt-1 text-[9px] bg-yellow-500/20 text-yellow-300 font-bold px-1 py-0.5 rounded border border-yellow-500/30">
                        👑 Weeklies
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Total User Progress & Weekly Archives ── */}
      {(() => {
        const curWeek = scheduleState.currentWeekStats || {};
        const todayRuns = scheduleState.todayLoggedRuns || [];
        const todayShards = scheduleState.todayLoggedShards || [];
        
        const currentWeekRuns = (curWeek.mdRuns || 0) + todayRuns.length;
        const currentWeekExp = (curWeek.expEarned || 0) + todayRuns.reduce((s, r) => s + (r.exp || 0), 0);
        const currentWeekShards = (curWeek.shardsEarned || 0) + todayShards.reduce((s, sh) => s + (sh.amount > 0 ? sh.amount : 0), 0);
        const currentWeekCrates = (curWeek.cratesEarned || 0) + todayShards.filter(s => s.crateType).reduce((s, c) => s + (c.amount > 0 ? c.amount : 0), 0);

        const lifetimeRuns = weeklyArchive.reduce((acc, a) => acc + (a.mdRunsCompleted || 0), 0) + currentWeekRuns;
        const lifetimeExp = weeklyArchive.reduce((acc, a) => acc + (a.totalExpEarned || 0), 0) + currentWeekExp;
        const lifetimeShards = weeklyArchive.reduce((acc, a) => acc + (a.shardsEarned || 0), 0) + currentWeekShards;
        const lifetimeCrates = weeklyArchive.reduce((acc, a) => acc + (a.cratesEarned || 0), 0) + currentWeekCrates;

        return (
          <div className="mt-12 pt-8 border-t border-[#333]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                  <Award size={24} /> Total User Progress & Weekly Archives
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Lifetime grinding accomplishments and archived weekly reset history.
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Snapshot and archive your progress for the current cycle?')) {
                    archiveCurrentWeek();
                  }
                }}
                className="px-3.5 py-2 rounded-lg bg-black/60 border border-[#c9a84c]/50 hover:border-[#c9a84c] text-xs font-bold text-[#c9a84c] hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
                title="Manually archive current cycle stats"
              >
                <Archive size={14} />
                <span>Archive Current Cycle</span>
              </button>
            </div>

            {/* Lifetime Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#111] border border-[#333] rounded-xl p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Lifetime MD Runs</span>
                <span className="text-2xl font-black text-white font-mono">{lifetimeRuns}</span>
              </div>
              <div className="bg-[#111] border border-[#333] rounded-xl p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Lifetime EXP</span>
                <span className="text-2xl font-black text-[#22c55e] font-mono">+{lifetimeExp}</span>
              </div>
              <div className="bg-[#111] border border-[#333] rounded-xl p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Shards Farmed</span>
                <span className="text-2xl font-black text-[#eab308] font-mono">+{lifetimeShards}</span>
              </div>
              <div className="bg-[#111] border border-[#333] rounded-xl p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Past Cycles</span>
                <span className="text-2xl font-black text-purple-400 font-mono">{weeklyArchive.length}</span>
              </div>
            </div>

            {/* Current Cycle Live Stats */}
            <div className="bg-gradient-to-r from-black/80 via-[#14120c] to-black/80 border border-[#c9a84c]/30 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c9a84c] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">Active Weekly Cycle (In Progress)</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Auto-resets Wed 5:00 PM EST</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                <div className="bg-black/50 p-2.5 rounded border border-[#222]">
                  <span className="text-gray-500 text-[10px] block">Runs Completed</span>
                  <span className="text-white font-bold font-mono text-sm">{currentWeekRuns} MDs</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded border border-[#222]">
                  <span className="text-gray-500 text-[10px] block">EXP Generated</span>
                  <span className="text-green-400 font-bold font-mono text-sm">+{currentWeekExp} EXP</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded border border-[#222]">
                  <span className="text-gray-500 text-[10px] block">Shards Farmed</span>
                  <span className="text-yellow-400 font-bold font-mono text-sm">+{currentWeekShards} Shards</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded border border-[#222]">
                  <span className="text-gray-500 text-[10px] block">Bonuses Left</span>
                  <span className="text-white font-bold font-mono text-sm">{Math.max(0, 3 - (scheduleState.mdBonusesClaimed || 0))} / 3</span>
                </div>
              </div>
            </div>

            {/* Past Weekly Archives Accordion / History */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Archive size={14} /> Archived Weekly Records ({weeklyArchive.length})
              </h3>

              {weeklyArchive.length === 0 ? (
                <div className="bg-[#111]/60 border border-[#222] rounded-xl p-8 text-center">
                  <Archive size={32} className="mx-auto text-gray-600 mb-2 opacity-60" />
                  <p className="text-sm font-bold text-gray-300">No past weekly archives yet</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Every Wednesday at 5:00 PM EST, when Mirror Dungeons reset, your completed runs and earned resources are automatically archived here!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {weeklyArchive.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-[#111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{entry.weekLabel}</span>
                          {entry.weekliesCompleted && (
                            <span className="text-[9px] bg-yellow-500/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">
                              👑 Weeklies Completed
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-mono">
                          <span>MDs: <strong className="text-white">{entry.mdRunsCompleted || 0}</strong></span>
                          <span>EXP: <strong className="text-green-400">+{entry.totalExpEarned || 0}</strong></span>
                          <span>Shards: <strong className="text-yellow-400">+{entry.shardsEarned || 0}</strong></span>
                          {entry.cratesEarned > 0 && <span>Crates: <strong className="text-amber-300">+{entry.cratesEarned}</strong></span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete archive record for ${entry.weekLabel}?`)) {
                              deleteWeeklyArchive(entry.id);
                            }
                          }}
                          className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete archive entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Data Management Section */}
      <div className="mt-12 pt-8 border-t border-[#333]">
        <h2 className="text-xl font-bold mb-4 font-limbus text-red-400 flex items-center gap-2">
          <AlertCircle size={20} /> App Settings & Data
        </h2>
        
        <div className="space-y-4">

          {window.electronAPI?.setGameLaunchPreference && (
            <label className="bg-[#111] border border-[#333] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer">
              <div>
                <h3 className="font-bold text-white mb-1">Open when Limbus Company starts</h3>
                <p className="text-sm text-gray-400">The tracker starts quietly in the background with Windows so it can open when the game launches. Turn this off to disable both behaviors.</p>
              </div>
              <input
                type="checkbox"
                checked={showWhenGameStarts}
                onChange={async (event) => {
                  const enabled = event.target.checked;
                  setShowWhenGameStarts(enabled);
                  const saved = await window.electronAPI.setGameLaunchPreference(enabled);
                  if (!saved) setShowWhenGameStarts(!enabled);
                }}
                className="w-5 h-5 accent-[#c9a84c]"
              />
            </label>
          )}

          <div className="bg-red-900/10 border border-red-900/50 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-white mb-1">Hard Reset Database</h3>
              <p className="text-sm text-gray-400">This will permanently wipe all of your inventory, settings, and checklists, and run the initial setup wizard again.</p>
            </div>
            <button 
              onClick={async () => {
                if (window.confirm('Are you absolutely sure you want to wipe all data? This will reset all IDs, inventory, and settings, and start the setup wizard again.')) {
                   await useStore.getState().resetAllData();
                   window.location.reload();
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              Wipe All Data
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
