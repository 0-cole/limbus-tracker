import React from 'react';
import { Target, Flame, CalendarDays, CheckCircle } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import { getNextResets } from '../utils/timeUtils.js';
import { getSeasonEndDate } from '../utils/seasonUtils.js';

export default function DailyCycleTracker() {
  const { scheduleState, updateScheduleState, bpState, injectBpExp, inventory, wantList, identitiesData, egosData, activeBanner } = useStore();
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
  
  const todayRoadmap = roadmap[0] || { runs: 0, runsList: [] };
  const mdRequiredToday = todayRoadmap.runs > 0;

  const [timeUntilDaily, setTimeUntilDaily] = React.useState('');
  const [timeUntilMd, setTimeUntilMd] = React.useState('');

  React.useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const { nextDaily, nextMdWeekly } = getNextResets(now);
      
      const formatDiff = (target) => {
        const diffMs = target - now;
        if (diffMs <= 0) return 'Resetting...';
        const d = Math.floor(diffMs / 86400000);
        const h = Math.floor((diffMs % 86400000) / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
      };
      
      setTimeUntilDaily(formatDiff(nextDaily));
      setTimeUntilMd(formatDiff(nextMdWeekly));
    };
    updateTimers();
    const interval = setInterval(updateTimers, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-0 overflow-hidden border-[#c9a84c]/20 h-full flex flex-col">
      <div className="bg-[#1a1a1a] p-4 border-b border-[#333] flex items-center justify-between">
        <h2 className="text-xl font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
          <CalendarDays size={20} /> Daily Cycle Tracker
        </h2>
        <div className="text-right">
            <div className="text-xs text-gray-400">Daily Reset: <span className="text-white font-mono">{timeUntilDaily}</span></div>
            <div className="text-xs text-gray-400">MD Reset: <span className="text-[#eab308] font-mono">{timeUntilMd}</span></div>
        </div>
      </div>
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-center">
        
        {mdRequiredToday && (
          <div className={`p-4 rounded-xl border transition-all ${scheduleState.mdTodayDone ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' : 'bg-red-950/20 border-red-900/50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Flame size={18} className={scheduleState.mdTodayDone ? 'text-[#c9a84c]' : 'text-red-500'} /> 
                  Required Mirror Dungeons
                </h3>
                <div className="flex gap-2 mt-2">
                  {todayRoadmap.runsList?.map((run, i) => (
                    <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded ${run.type === 'Hard Bonus' ? 'bg-[#ef4444]/20 text-[#ef4444]' : run.type === 'Normal Bonus' ? 'bg-[#c9a84c]/20 text-[#eab308]' : 'bg-[#333] text-gray-300'}`}>
                      {run.type}
                    </span>
                  ))}
                </div>
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
                onClick={() => {
                  const newProgress = scheduleState.dailiesProgress === step ? step - 1 : step;
                  const diff = newProgress - scheduleState.dailiesProgress;
                  updateScheduleState({ dailiesProgress: newProgress });
                  injectBpExp(diff * 2);
                }}
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
                <button onClick={() => {
                  if (scheduleState.weekliesDone) injectBpExp(-20);
                  updateScheduleState({ canClaimWeeklies: false, weekliesDone: false });
                }} className="px-4 py-2 text-sm text-gray-500 hover:text-white">Back</button>
                <button 
                  onClick={() => {
                    const newWeekliesDone = !scheduleState.weekliesDone;
                    updateScheduleState({ weekliesDone: newWeekliesDone });
                    injectBpExp(newWeekliesDone ? 20 : -20);
                  }}
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
  );
}
