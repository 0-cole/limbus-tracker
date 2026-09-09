import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore.js';
import { CheckCircle, XCircle, AlertCircle, Calendar, Target, Flame, CalendarDays, Battery } from 'lucide-react';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import { getSeasonEndDate } from '../utils/seasonUtils.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DashboardPage() {
  const { weeklyProgress, updateWeekly, scheduleState, updateScheduleState, bpState, inventory, wantList, identitiesData, egosData, activeBanner } = useStore();
  const [showWhenGameStarts, setShowWhenGameStarts] = useState(true);
  const hasMdHard = bpState.hasMdHard !== false;

  const seasonEndDate = getSeasonEndDate(bpState);

  const targetItems = [...(wantList || [])].map(name => {
    return identitiesData?.find(id => id.name === name) || egosData?.find(ego => ego.name === name);
  }).filter(Boolean);
  const calcItems = targetItems.map(item => ({ sinnerId: item.sinner, rarity: !!item.grade ? 'EGO' : (item.rarity === 3 ? '000' : '00') }));

  const calcResult = React.useMemo(() => calculateLimbusGrind(
    calcItems, inventory, { ...bpState, hasMdHard }, scheduleState, seasonEndDate
  ), [calcItems, inventory, bpState, hasMdHard, scheduleState, seasonEndDate]);

  const roadmap = React.useMemo(() => generateRoadmap(
    calcResult.daysLeft, calcResult.plannedRuns, scheduleState, { ...bpState, hasMdHard }
  ), [calcResult.daysLeft, calcResult.plannedRuns, scheduleState, bpState, hasMdHard]);
  
  const todayRoadmap = roadmap[0] || { runs: 0 };
  const mdRequiredToday = todayRoadmap.runs > 0;

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

  const toggleToday = () => {
    const updated = { ...weeklyProgress };
    const currentStatus = updated.dailyStatus[currentDayStr];
    const isDone = currentStatus === 'done';
    updated.dailyStatus[currentDayStr] = isDone ? 'pending' : 'done';
    updateWeekly(updated);
    updateScheduleState({ dailiesDone: !isDone });
  };

  const toggleMD = () => {
    const updated = { ...weeklyProgress };
    updated.mirrorDungeon = !updated.mirrorDungeon;
    updateWeekly(updated);
    updateScheduleState({ weekliesDone: updated.mirrorDungeon });
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Big Day Block */}
        <div className="glass-card p-0 lg:col-span-2 overflow-hidden border-[#c9a84c]/20">
          <div className="bg-[#1a1a1a] p-4 border-b border-[#333] flex items-center justify-between">
            <h2 className="text-xl font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
              <CalendarDays size={20} /> Daily Cycle Tracker
            </h2>
            <div className="text-sm font-mono text-gray-400">Day 1 of Schedule</div>
          </div>
          <div className="p-6 space-y-6">
            
            {mdRequiredToday && (
              <div className={`p-4 rounded-xl border transition-all ${scheduleState.mdTodayDone ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' : 'bg-red-950/20 border-red-900/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <Flame size={18} className={scheduleState.mdTodayDone ? 'text-[#c9a84c]' : 'text-red-500'} /> 
                      Required Mirror Dungeon
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Your roadmap requires <span className="font-bold text-white">{todayRoadmap.runs}x Mirror Dungeon</span> today to stay on pace.</p>
                  </div>
                  <button 
                    onClick={() => updateScheduleState({ mdTodayDone: !scheduleState.mdTodayDone })}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${scheduleState.mdTodayDone ? 'bg-[#c9a84c] border-[#c9a84c] text-black' : 'border-gray-500 hover:border-[#c9a84c] text-transparent hover:text-white'}`}
                  >
                    <CheckCircle size={24} className={scheduleState.mdTodayDone ? 'text-black' : ''} />
                  </button>
                </div>
              </div>
            )}

            <div className={`p-4 rounded-xl border transition-all ${scheduleState.dailiesProgress >= 5 ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' : 'bg-[#111] border-[#333]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Target size={18} className="text-[#c9a84c]" /> Daily Missions
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">10 Pass EXP. Login, thread, EXP, and luxcavations.</p>
                </div>
                <div className="text-2xl font-black text-[#c9a84c]">
                  {scheduleState.dailiesProgress} <span className="text-lg text-gray-500">/ 5</span>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(step => (
                  <div 
                    key={step} 
                    onClick={() => updateScheduleState({ dailiesProgress: scheduleState.dailiesProgress === step ? step - 1 : step })}
                    className={`h-10 flex-1 rounded cursor-pointer transition-all ${scheduleState.dailiesProgress >= step ? 'bg-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.3)]' : 'bg-[#222] hover:bg-[#333]'}`}
                  />
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${scheduleState.weekliesDone ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' : 'bg-[#111] border-[#333]'}`}>
              {!scheduleState.canClaimWeeklies ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">Can you claim your Weeklies yet?</h3>
                    <p className="text-sm text-gray-400 mt-1">Requires 1 Normal/Hard MD and minor tasks.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateScheduleState({ canClaimWeeklies: true })} className="px-6 py-2 rounded bg-[#222] border border-[#444] hover:border-[#c9a84c] font-bold transition-colors">Yes</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">Have you claimed them?</h3>
                    <p className="text-sm text-gray-400 mt-1">20 Pass EXP rewarded instantly.</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => updateScheduleState({ canClaimWeeklies: false, weekliesDone: false })} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Back</button>
                    <button 
                      onClick={() => updateScheduleState({ weekliesDone: !scheduleState.weekliesDone })}
                      className={`px-6 py-2 rounded font-bold transition-colors ${scheduleState.weekliesDone ? 'bg-[#c9a84c] text-black shadow-[0_0_10px_rgba(201,168,76,0.3)]' : 'bg-[#222] border border-[#444] hover:border-[#c9a84c]'}`}
                    >
                      {scheduleState.weekliesDone ? 'Claimed!' : 'Claim Now'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Missed Days & Backup Plans */}
        <div className="glass-card p-6 border-red-900/30">
          <h2 className="text-xl font-bold mb-4 font-limbus text-red-400 flex items-center gap-2">
            <AlertCircle size={20} /> Contingency Plans
          </h2>
          {missedDaysCount === 0 ? (
            <p className="text-[#737373] text-sm">You are on schedule. No contingencies required.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#e5e5e5]">You missed <span className="font-bold text-red-400">{missedDaysCount}</span> daily login(s) recently.</p>
              <div className="p-3 bg-red-950/30 border border-red-900 rounded">
                <p className="font-bold text-sm text-red-300 mb-1">Backup Directive:</p>
                <p className="text-xs text-[#ccc]">Run {missedDaysCount} extra Normal Mirror Dungeon(s) this week to compensate for lost Daily Pass XP.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 font-limbus text-white">Weekly Calendar Overview</h2>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, idx) => {
            // Determine date for this day of the week based on today
            const diff = idx - currentDayIndex;
            const date = new Date();
            date.setDate(date.getDate() + diff);
            const dateStr = date.toISOString().split('T')[0];
            const status = weeklyProgress.dailyStatus?.[dateStr];

            let bgClass = "bg-[#111] border-[#333]";
            let icon = null;

            if (status === 'done') {
              bgClass = "bg-[#c9a84c]/20 border-[#c9a84c]";
              icon = <CheckCircle className="text-[#c9a84c] mx-auto mt-2" size={20} />;
            } else if (status === 'missed' || (diff < 0 && !status)) {
              bgClass = "bg-red-950/30 border-red-900";
              icon = <XCircle className="text-red-500 mx-auto mt-2" size={20} />;
            } else if (diff === 0) {
              bgClass = "bg-[#222] border-white";
            }

            return (
              <div key={day} className={`p-3 rounded border text-center ${bgClass}`}>
                <p className={`text-xs font-bold ${diff === 0 ? 'text-white' : 'text-[#737373]'}`}>{day.slice(0,3)}</p>
                <p className="text-[10px] text-[#555]">{date.getDate()}</p>
                {icon}
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="mt-12 pt-8 border-t border-[#333]">
        <h2 className="text-xl font-bold mb-4 font-limbus text-red-400 flex items-center gap-2">
          <AlertCircle size={20} /> App Settings & Data
        </h2>
        
        <div className="space-y-4">
          <div className="bg-[#111] border border-[#333] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-white mb-1">Replay App Tutorial</h3>
              <p className="text-sm text-gray-400">Launch the interactive UI tutorial again to learn how the tracker works.</p>
            </div>
            <button 
              onClick={() => {
                useStore.getState().setTutorialCompleted(false);
              }}
              className="px-4 py-2 bg-[#222] border border-[#444] hover:border-[#c9a84c] text-white font-bold rounded transition-colors whitespace-nowrap"
            >
              Replay Tutorial
            </button>
          </div>

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
              onClick={() => {
                if (window.confirm('Are you absolutely sure you want to wipe all data? This cannot be undone.')) {
                   localStorage.removeItem('limbus-tracker-data');
                   if (window.electronAPI) {
                     window.electronAPI.saveData({}).then(() => window.location.reload());
                   } else {
                     window.location.reload();
                   }
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors whitespace-nowrap"
            >
              Wipe All Data
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
