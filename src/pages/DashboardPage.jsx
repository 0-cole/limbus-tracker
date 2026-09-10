import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore.js';
import { CheckCircle, XCircle, AlertCircle, Calendar, Target, Flame, CalendarDays, Battery } from 'lucide-react';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import { getSeasonEndDate } from '../utils/seasonUtils.js';

import DailyCycleTracker from '../components/DailyCycleTracker.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DashboardPage() {
  const { weeklyProgress, updateWeekly, scheduleState, updateScheduleState, bpState, updateBpState, inventory, wantList, identitiesData, egosData, activeBanner } = useStore();
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
