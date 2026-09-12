import React, { useState } from 'react';
import { Target, Flame, CalendarDays, CheckCircle, Swords, PackagePlus, Sparkles, Zap, X } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { calculateLimbusGrind, generateRoadmap, normalizeSinnerId, getOwnedShards } from '../utils/limbusCalculator.js';
import { getNextResets, getLimbusCycleInfo } from '../utils/timeUtils.js';
import { getSeasonEndDate } from '../utils/seasonUtils.js';
import { getEnkephalinCapForLevel, getEnkephalinCountdown } from '../utils/enkephalinLevels.js';
import sinnersData from '../data/sinners.json';

export default function DailyCycleTracker() {
  const { 
    scheduleState, 
    updateScheduleState, 
    weeklyProgress,
    updateWeekly,
    bpState, 
    updateBpState,
    injectBpExp, 
    logMdRun, 
    undoMdRun, 
    addShards,
    undoAddShards,
    openCratesForSinner,
    addCrates,
    inventory, 
    updateInventory,
    toggleDailyMissionStep,
    setAllDailyMissions,
    saveStore,
    wantList, 
    identitiesData, 
    egosData 
  } = useStore();

  const cantoUnlockedHard = (bpState.canto === undefined || bpState.canto >= 8);
  const effectiveHasMdHard = cantoUnlockedHard && (bpState.preferHardMd !== false) && (bpState.hasMdHard !== false);

  const seasonEndDate = getSeasonEndDate(bpState);

  const targetItems = [...(wantList || [])].map(name => {
    return identitiesData?.find(id => id.name === name) || egosData?.find(ego => ego.name === name);
  }).filter(Boolean);
  const calcItems = targetItems.map(item => ({ sinnerId: item.sinner, rarity: !!item.grade ? 'EGO' : (item.rarity === 3 ? '000' : '00') }));

  const calcResult = React.useMemo(() => calculateLimbusGrind(
    calcItems, inventory, { ...bpState, hasMdHard: effectiveHasMdHard }, scheduleState, seasonEndDate
  ), [calcItems, inventory, bpState, effectiveHasMdHard, scheduleState, seasonEndDate]);

  const roadmapData = React.useMemo(() => generateRoadmap(
    calcResult.daysLeft, calcResult.plannedRuns, scheduleState, { ...bpState, hasMdHard: effectiveHasMdHard }, targetItems, inventory
  ), [calcResult.daysLeft, calcResult.plannedRuns, scheduleState, bpState, effectiveHasMdHard, targetItems, inventory]);
  
  const todayRoadmap = (roadmapData?.roadmap ? roadmapData.roadmap[0] : roadmapData?.[0]) || { runs: 0, runsList: [] };
  const mdRequiredToday = todayRoadmap.runs > 0;

  const [timeUntilDaily, setTimeUntilDaily] = useState('');
  const [timeUntilMd, setTimeUntilMd] = useState('');
  const [showManualLogger, setShowManualLogger] = useState(false);
  const [showShardLogger, setShowShardLogger] = useState(false);

  const defaultTargetSinner = bpState.targetSinnerForCrates || (targetItems[0]?.sinner ? normalizeSinnerId(targetItems[0].sinner) : 'sinclair');

  const [selectedSinner, setSelectedSinner] = useState(defaultTargetSinner);
  const [shardAmount, setShardAmount] = useState(20);

  const [shardLoggerTab, setShardLoggerTab] = useState((inventory.nominableCrates || 0) > 0 ? 'open_crates' : 'direct_log');
  const [cratesToOpen, setCratesToOpen] = useState(1);
  const [cratesShardsResult, setCratesShardsResult] = useState(2);
  const [cratesTargetSinner, setCratesTargetSinner] = useState(defaultTargetSinner);
  const [manualShardsEdited, setManualShardsEdited] = useState(false);

  const handleCratesCountChange = (count) => {
    const clamped = Math.max(1, count);
    setCratesToOpen(clamped);
    if (!manualShardsEdited) {
      const rate = bpState.safeMath ? 1.5 : 2.0;
      setCratesShardsResult(Math.round(clamped * rate));
    }
  };

  const [showEnkephalinModal, setShowEnkephalinModal] = useState(false);
  const [enkephalinModalTrigger, setEnkephalinModalTrigger] = useState('md');
  const [enkephalinInputVal, setEnkephalinInputVal] = useState(inventory.enkephalin !== undefined ? inventory.enkephalin : (inventory.maxEnkephalin || 119));
  const [companyLevelInputVal, setCompanyLevelInputVal] = useState(inventory.companyLevel || 35);
  const [enkephalinCountdown, setEnkephalinCountdown] = useState(() => getEnkephalinCountdown(inventory));

  React.useEffect(() => {
    const updateCountdown = () => {
      setEnkephalinCountdown(getEnkephalinCountdown(inventory));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [inventory]);

  const promptEnkephalinSync = (trigger = 'md') => {
    setEnkephalinModalTrigger(trigger);
    setEnkephalinInputVal(inventory.enkephalin !== undefined ? inventory.enkephalin : (inventory.maxEnkephalin || 119));
    setCompanyLevelInputVal(inventory.companyLevel || 35);
    setShowEnkephalinModal(true);
  };

  const [cycleInfo, setCycleInfo] = useState(getLimbusCycleInfo());

  React.useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const info = getLimbusCycleInfo(now);
      setCycleInfo(info);

      const { nextDaily, nextMdWeekly } = getNextResets(now);
      const nextDailyDate = new Date(nextDaily);
      const nextMdDate = new Date(nextMdWeekly);
      
      const localTimeDaily = nextDailyDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const localDayMd = nextMdDate.toLocaleDateString('en-US', { weekday: 'short' });
      const localTimeMd = nextMdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      const formatDiff = (target) => {
        const diffMs = target - now;
        if (diffMs <= 0) return 'Resetting...';
        const d = Math.floor(diffMs / 86400000);
        const h = Math.floor((diffMs % 86400000) / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
      };
      
      setTimeUntilDaily(`${formatDiff(nextDaily)} (${localTimeDaily})`);
      setTimeUntilMd(`${formatDiff(nextMdWeekly)} (${localDayMd} ${localTimeMd})`);
    };
    updateTimers();
    const interval = setInterval(updateTimers, 60000);
    return () => clearInterval(interval);
  }, []);

  const bonusesClaimed = scheduleState.mdBonusesClaimed || 0;
  const bonusesAvailable = Math.max(0, 3 - bonusesClaimed);
  const todayRuns = scheduleState.todayLoggedRuns || [];

  const totalRequiredMd = todayRoadmap?.plannedRuns !== undefined ? todayRoadmap.plannedRuns : (todayRoadmap?.runs || 0);
  const isMdCompletedToday = scheduleState.mdTodayDone || (totalRequiredMd > 0 ? todayRuns.length >= totalRequiredMd : todayRuns.length > 0);
  const isMdInProgress = !isMdCompletedToday && totalRequiredMd > 0 && todayRuns.length > 0 && todayRuns.length < totalRequiredMd;

  // Toggle today's required runs
  const handleToggleRequiredMd = () => {
    if (isMdCompletedToday) {
      // Undo all runs logged today
      todayRuns.forEach(r => undoMdRun(r.id));
      updateScheduleState({ mdTodayDone: false });
    } else {
      // Automatically log the remaining runs specified in today's roadmap
      if (todayRoadmap.runsList && todayRoadmap.runsList.length > 0) {
        todayRoadmap.runsList.forEach(run => {
          logMdRun(run.runKey || (run.type === 'Hard Bonus' ? 'hard_bonus' : run.type === 'Normal Bonus' ? 'normal_bonus' : 'normal_nobonus'));
        });
      } else {
        // Fallback default run for rest day
        if (effectiveHasMdHard && bonusesAvailable >= 3) {
          logMdRun('hard_bonus');
        } else if (bonusesAvailable >= 1) {
          logMdRun('normal_bonus');
        } else {
          logMdRun('normal_nobonus');
        }
      }
      updateScheduleState({ mdTodayDone: true });
      promptEnkephalinSync('md');
    }
  };

  return (
    <div className="glass-card p-0 overflow-hidden border-[#c9a84c]/20 h-full flex flex-col">
      <div className="bg-[#1a1a1a] p-4 border-b border-[#333] flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
          <CalendarDays size={20} /> Daily Cycle Tracker
        </h2>
        <div className="text-right flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => promptEnkephalinSync('manual')}
            className="text-xs bg-black/50 hover:bg-black/80 border border-[#444] hover:border-[#c9a84c] px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all text-gray-200 cursor-pointer shadow-sm group"
            title={`Manager Lv. ${inventory.companyLevel || 35} • Cap: ${inventory.maxEnkephalin || 119} • Click to adjust level or Enkephalin`}
          >
            <span className="text-[10px] font-bold text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/30 px-1.5 py-0.5 rounded">
              Lv. {inventory.companyLevel || 35}
            </span>
            <div className="flex items-center gap-1">
              <Zap size={13} className="text-[#eab308]" />
              <span className="font-mono font-bold text-white text-xs">
                {inventory.enkephalin !== undefined ? inventory.enkephalin : (inventory.maxEnkephalin || 119)}
              </span>
              {(inventory.enkephalin || 0) > (inventory.maxEnkephalin || 119) ? (
                <span className="text-[9px] bg-amber-500/30 text-amber-300 font-bold px-1 rounded">OVER</span>
              ) : (
                <span className="text-[11px] text-gray-400 font-mono">/{inventory.maxEnkephalin || 119}</span>
              )}
            </div>
            {!enkephalinCountdown.isFull && (
              <span className="text-[10px] text-emerald-400/90 font-mono pl-1.5 border-l border-[#333]">
                +{enkephalinCountdown.nextPointStr}
              </span>
            )}
          </button>
          <div className="text-xs text-gray-400">Daily: <span className="text-white font-mono">{timeUntilDaily}</span></div>
          <div className="text-xs text-gray-400">MD Reset: <span className="text-[#eab308] font-mono">{timeUntilMd}</span></div>
        </div>
      </div>

      {/* ACTIVE CYCLE DISTINCTION BANNER */}
      <div className="bg-[#141414] px-4 py-2.5 border-b border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded font-black uppercase tracking-wider text-[10px] border ${
            cycleInfo.isAfterResetToday 
              ? 'bg-purple-950/40 text-purple-300 border-purple-500/40' 
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {cycleInfo.isAfterResetToday ? "⚡ Tomorrow's Cycle Active" : "⚡ Today's Cycle Active"}
          </span>
          <span className="text-white font-bold">
            Cycle: <span className="text-[#c9a84c]">{cycleInfo.cycleDateLabel}</span>
          </span>
          <span className="text-gray-400 text-[11px]">
            ({cycleInfo.isAfterResetToday 
              ? `Rolled over at ${cycleInfo.startLocalTime} local / 06:00 KST` 
              : `Active until ${cycleInfo.resetLocalTime} local / 06:00 KST`})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-300">
          <span className="text-gray-400">Resets In:</span>
          <span className="font-mono font-bold text-amber-400">{cycleInfo.remainingStr}</span>
          <div className="relative group cursor-pointer text-gray-400 hover:text-white">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-600 hover:border-amber-400 text-[10px] font-bold">?</span>
            <div className="absolute right-0 top-6 z-50 w-80 p-3 rounded-lg bg-[#1a1a1a] border border-[#444] shadow-2xl text-[11px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none leading-relaxed">
              <p className="font-bold text-[#c9a84c] mb-1">Server Day vs. Local Time (5:00 PM Reset)</p>
              <p className="mb-1.5">Limbus Company operates on <strong>Korea Standard Time (06:00 KST)</strong>, which corresponds to <strong>{cycleInfo.resetLocalTime} Local Time</strong>.</p>
              <p className="mb-1.5">{cycleInfo.isAfterResetToday 
                ? `Since ${cycleInfo.startLocalTime} has passed, the server has already rolled over into tomorrow's cycle (${cycleInfo.cycleDayName}). Any missions you complete from now until ${cycleInfo.resetLocalTime} tomorrow count towards this cycle!` 
                : `You are currently in ${cycleInfo.cycleDayName}'s cycle. It will reset today at ${cycleInfo.resetLocalTime} into tomorrow's cycle.`}</p>
              <p className="text-gray-400 text-[10px]">Your daily missions and mirror dungeon logs are tied directly to this official cycle so you never lose progress across resets.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col justify-start">
        
        {/* REQUIRED MD TODAY SECTION */}
        <div className={`p-4 rounded-xl border transition-all ${
          isMdCompletedToday 
            ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' 
            : isMdInProgress
              ? 'bg-amber-950/20 border-amber-500/50'
              : mdRequiredToday 
                ? 'bg-red-950/20 border-red-900/50' 
                : 'bg-[#111] border-[#333]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={18} className={isMdCompletedToday ? 'text-[#c9a84c]' : isMdInProgress ? 'text-amber-400' : mdRequiredToday ? 'text-red-500' : 'text-gray-500'} />
                <h3 className="font-bold text-lg text-white">
                  {isMdCompletedToday 
                    ? "Today's Mirror Dungeon Completed" 
                    : isMdInProgress
                      ? `Today's Mirror Dungeon: In Progress (${todayRuns.length}/${totalRequiredMd} Runs)`
                      : mdRequiredToday 
                        ? "Did you do your Mirror Dungeon today?" 
                        : "No Required MD Today (Rest Day)"}
                </h3>
              </div>
              
              {mdRequiredToday ? (
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    {isMdCompletedToday 
                      ? `Marked done (${todayRuns.length}/${totalRequiredMd} runs)! BP EXP and weekly bonuses have been updated.` 
                      : isMdInProgress
                        ? `${todayRuns.length} of ${totalRequiredMd} runs logged today (${totalRequiredMd - todayRuns.length} remaining):`
                        : `Roadmap requires ${totalRequiredMd}x run(s) today:`}
                  </p>
                  {isMdCompletedToday ? (
                    <div className="flex flex-wrap gap-2">
                      {todayRuns.map((r, i) => (
                        <span key={i} className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <span>✓ {r.label || r.type}</span>
                          <span className="text-[10px] text-emerald-400/80">({r.exp} EXP)</span>
                        </span>
                      ))}
                    </div>
                  ) : isMdInProgress ? (
                    <div className="space-y-1.5">
                      {todayRuns.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">Logged:</span>
                          {todayRuns.map((r, i) => (
                            <span key={i} className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <span>✓ {r.label || r.type}</span>
                              <span className="text-[10px] text-emerald-400/80">({r.exp} EXP)</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {todayRoadmap.runsList && todayRoadmap.runsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-amber-400 font-bold uppercase">Remaining:</span>
                          {todayRoadmap.runsList.map((run, i) => (
                            <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                              run.type === 'Hard Bonus' 
                                ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' 
                                : run.type === 'Normal Bonus' 
                                  ? 'bg-[#c9a84c]/20 text-[#eab308] border border-[#c9a84c]/30' 
                                  : 'bg-[#333] text-gray-300'
                            }`}>
                              <span>{run.type}</span>
                              <span className="text-[10px] text-gray-400">({run.exp} EXP • {run.modules} mod)</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {todayRoadmap.runsList?.map((run, i) => (
                        <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          run.type === 'Hard Bonus' 
                            ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' 
                            : run.type === 'Normal Bonus' 
                              ? 'bg-[#c9a84c]/20 text-[#eab308] border border-[#c9a84c]/30' 
                              : 'bg-[#333] text-gray-300'
                        }`}>
                          <span>{run.type}</span>
                          <span className="text-[10px] text-gray-400">({run.exp} EXP • {run.modules} mod)</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  {isMdCompletedToday 
                    ? "You logged extra runs today! Schedule adjusted accordingly." 
                    : "You are on pace. Feel free to rest or log an extra run below."}
                </p>
              )}
            </div>

            <button 
              onClick={handleToggleRequiredMd}
              className={`w-12 h-12 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                isMdCompletedToday 
                  ? 'bg-[#c9a84c] border-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.4)] cursor-pointer' 
                  : isMdInProgress
                    ? 'border-amber-400 hover:border-[#c9a84c] text-amber-400/50 hover:text-white cursor-pointer'
                    : 'border-gray-500 hover:border-[#c9a84c] text-transparent hover:text-white cursor-pointer'
              }`}
              title={isMdCompletedToday ? "Click to undo today's completion" : isMdInProgress ? `Click to log remaining ${totalRequiredMd - todayRuns.length} run(s)` : "Click to mark completed"}
            >
              <CheckCircle size={26} className={isMdCompletedToday ? 'text-black' : isMdInProgress ? 'text-amber-400' : ''} />
            </button>
          </div>
        </div>

        {/* LOG A RUN (MANUAL / AD-HOC LOGGING) */}
        <div className="bg-[#111] border border-[#333] rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Swords size={16} className="text-[#c9a84c]" /> Log a Mirror Dungeon Run
              </h4>
              <p className="text-[11px] text-gray-400">
                Weekly Bonuses Remaining: <span className="font-bold text-[#eab308]">{bonusesAvailable} / 3</span>
              </p>
            </div>
            <button 
              onClick={() => setShowManualLogger(!showManualLogger)} 
              className="text-xs text-[#c9a84c] hover:underline font-bold"
            >
              {showManualLogger ? 'Hide Options' : '+ Quick Log'}
            </button>
          </div>

          {showManualLogger && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#222]">
              {/* Hard Bonus Option */}
              <button
                disabled={!cantoUnlockedHard || !effectiveHasMdHard || bonusesAvailable < 3}
                onClick={() => {
                  logMdRun('hard_bonus');
                  promptEnkephalinSync('md');
                }}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all ${
                  cantoUnlockedHard && effectiveHasMdHard && bonusesAvailable >= 3
                    ? 'bg-red-950/30 border-red-800 hover:border-red-500 text-white cursor-pointer'
                    : 'bg-black/30 border-[#222] text-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-400">Hard Bonus</span>
                  <span className="text-[10px] text-red-300 font-mono">18 mod</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  +225 EXP <span className="text-[9px] text-gray-500">(3 bonuses)</span>
                </div>
              </button>

              {/* Normal Bonus Option */}
              <button
                disabled={bonusesAvailable < 1}
                onClick={() => {
                  logMdRun('normal_bonus');
                  promptEnkephalinSync('md');
                }}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all ${
                  bonusesAvailable >= 1
                    ? 'bg-yellow-950/30 border-yellow-800 hover:border-[#c9a84c] text-white cursor-pointer'
                    : 'bg-black/30 border-[#222] text-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#eab308]">Normal Bonus</span>
                  <span className="text-[10px] text-yellow-300 font-mono">5 mod</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  +45 EXP <span className="text-[9px] text-gray-500">(1 bonus)</span>
                </div>
              </button>

              {/* Normal No Bonus Option */}
              <button
                onClick={() => {
                  logMdRun('normal_nobonus');
                  promptEnkephalinSync('md');
                }}
                className="p-2.5 rounded border bg-black/50 border-[#333] hover:border-gray-400 text-white text-left flex flex-col justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-300">Normal (No Bonus)</span>
                  <span className="text-[10px] text-gray-400 font-mono">5 mod</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  +30 EXP <span className="text-[9px] text-gray-500">(0 bonus)</span>
                </div>
              </button>

              {/* Auto-Convert MD Crates to Shards Setting */}
              <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-black/40 border border-[#333] mt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 select-none">
                  <input 
                    type="checkbox"
                    checked={bpState.autoConvertMdCrates !== false}
                    onChange={(e) => updateBpState({ autoConvertMdCrates: e.target.checked })}
                    className="accent-[#c9a84c] rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#eab308]" /> Auto-convert MD crates directly to shards
                  </span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Target:</span>
                  <select
                    value={bpState.targetSinnerForCrates || defaultTargetSinner}
                    onChange={(e) => {
                      updateBpState({ targetSinnerForCrates: e.target.value });
                      setCratesTargetSinner(e.target.value);
                    }}
                    className="bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-white focus:border-[#c9a84c] outline-none"
                  >
                    {sinnersData.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({getOwnedShards(inventory.shards, s.id)} owned)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* List of runs logged today */}
          {todayRuns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#222]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Runs Logged Today</div>
              <div className="flex flex-wrap gap-2">
                {todayRuns.map(run => (
                  <div key={run.id} className="bg-black/60 border border-[#444] rounded px-2.5 py-1 flex items-center gap-2 text-xs">
                    <span className="text-white font-medium">{run.label || run.type}</span>
                    <span className="text-green-400 font-bold">+{run.exp} EXP</span>
                    <button 
                      onClick={() => undoMdRun(run.id)}
                      className="text-gray-500 hover:text-red-400 ml-1 transition-colors"
                      title="Undo this run"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LOG EGOSHARDS & CRATES TODAY */}
        <div className="bg-[#111] border border-[#333] rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <PackagePlus size={16} className="text-[#c9a84c]" /> Egoshard Crates & Shard Manager
              </h4>
              <p className="text-[11px] text-gray-400">
                Open owned Nominable Crates for Sinners, or record extra drops from events and extractions.
              </p>
            </div>
            <button 
              onClick={() => setShowShardLogger(!showShardLogger)} 
              className="text-xs text-[#c9a84c] hover:underline font-bold"
            >
              {showShardLogger ? 'Hide Options' : '+ Open Crates / Log Shards'}
            </button>
          </div>

          {showShardLogger && (
            <div className="pt-2 border-t border-[#222] space-y-3">
              {/* Tab Navigation: Open Crates vs Direct Log */}
              <div className="flex border-b border-[#222] gap-1">
                <button
                  type="button"
                  onClick={() => setShardLoggerTab('open_crates')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    shardLoggerTab === 'open_crates'
                      ? 'border-[#c9a84c] text-[#c9a84c]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <PackagePlus size={14} /> Open / Crack Crates
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {inventory.nominableCrates || 0} owned
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShardLoggerTab('direct_log')}
                  className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    shardLoggerTab === 'direct_log'
                      ? 'border-[#c9a84c] text-[#c9a84c]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  ➕ Direct Log (Drops / Gacha)
                </button>
              </div>

              {/* TAB 1: OPEN CRATES INTO SHARDS */}
              {shardLoggerTab === 'open_crates' ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Sinner</label>
                      <select 
                        value={cratesTargetSinner}
                        onChange={(e) => setCratesTargetSinner(e.target.value)}
                        className="w-full bg-black border border-[#444] rounded p-2 text-xs text-white focus:border-[#c9a84c] outline-none"
                      >
                        {sinnersData.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({getOwnedShards(inventory.shards, s.id)} owned)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Crates to Use</label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          {inventory.nominableCrates || 0} in box
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <input 
                          type="number"
                          min="1"
                          max={inventory.nominableCrates || 1}
                          value={cratesToOpen}
                          onChange={(e) => handleCratesCountChange(parseInt(e.target.value) || 1)}
                          className="w-20 bg-black border border-[#444] rounded p-1.5 text-sm text-white font-mono text-center focus:border-[#c9a84c] outline-none"
                        />
                        <div className="flex gap-1 flex-wrap">
                          {(inventory.nominableCrates || 0) > 0 && (
                            <button 
                              type="button"
                              onClick={() => handleCratesCountChange(inventory.nominableCrates)}
                              className="px-2 py-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-amber-300 font-bold cursor-pointer"
                            >
                              All ({inventory.nominableCrates})
                            </button>
                          )}
                          {[5, 10, 20].map(val => (
                            <button 
                              key={val}
                              type="button"
                              disabled={(inventory.nominableCrates || 0) < val}
                              onClick={() => handleCratesCountChange(val)}
                              className="px-2 py-1 text-xs bg-black/50 border border-[#333] hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed rounded text-gray-300 font-mono cursor-pointer"
                            >
                              +{val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shards Gained</label>
                        <span className="text-[9px] text-gray-500 italic">avg ~2/crate</span>
                      </div>
                      <input 
                        type="number"
                        min="1"
                        value={cratesShardsResult}
                        onChange={(e) => {
                          setCratesShardsResult(Math.max(1, parseInt(e.target.value) || 1));
                          setManualShardsEdited(true);
                        }}
                        className="w-full bg-black border border-[#444] rounded p-1.5 text-sm text-green-400 font-mono font-bold text-center focus:border-[#c9a84c] outline-none"
                        title="Defaults to 2 shards/crate. Adjust if your in-game roll differed!"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 flex-wrap gap-2">
                    <span className="text-[11px] text-gray-400 italic">
                      {(inventory.nominableCrates || 0) <= 0 
                        ? "You have 0 Nominable Crates. Run Mirror Dungeons or complete weeklies to earn more!" 
                        : `Opening ${cratesToOpen} crate(s) will deduct them from your box and add ${cratesShardsResult} shards.`}
                    </span>
                    <button 
                      type="button"
                      disabled={(inventory.nominableCrates || 0) < 1 || cratesToOpen > (inventory.nominableCrates || 0)}
                      onClick={() => {
                        const sinnerObj = sinnersData.find(s => s.id === cratesTargetSinner) || { id: cratesTargetSinner, name: cratesTargetSinner };
                        openCratesForSinner(cratesTargetSinner, cratesToOpen, cratesShardsResult);
                        setCratesToOpen(1);
                        setManualShardsEdited(false);
                        const rate = bpState.safeMath ? 1.5 : 2.0;
                        setCratesShardsResult(Math.round(1 * rate));
                      }}
                      className="px-4 py-2 bg-[#c9a84c] hover:bg-[#d4b96a] disabled:bg-[#333] disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(201,168,76,0.3)]"
                    >
                      <PackagePlus size={14} /> Open {cratesToOpen} Crates ➔ +{cratesShardsResult} Shards
                    </button>
                  </div>
                </div>
              ) : (
                /* TAB 2: DIRECT LOG */
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Sinner / Resource</label>
                      <select 
                        value={selectedSinner}
                        onChange={(e) => setSelectedSinner(e.target.value)}
                        className="w-full bg-black border border-[#444] rounded p-2 text-xs text-white focus:border-[#c9a84c] outline-none"
                      >
                        <optgroup label="Sinner Egoshards">
                          {sinnersData.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({getOwnedShards(inventory.shards, s.id)} owned)</option>
                          ))}
                        </optgroup>
                        <optgroup label="Egocrates">
                          <option value="crate_nominable">Nominable Egocrates ({inventory.nominableCrates || 0} owned)</option>
                          <option value="crate_random">Random Egocrates ({inventory.randomCrates || 0} owned)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Amount Gained</label>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          min="1"
                          max="999"
                          value={shardAmount}
                          onChange={(e) => setShardAmount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 bg-black border border-[#444] rounded p-1.5 text-sm text-white font-mono text-center focus:border-[#c9a84c] outline-none"
                        />
                        <div className="flex gap-1">
                          {[10, 20, 50].map(val => (
                            <button 
                              key={val}
                              type="button"
                              onClick={() => setShardAmount(val)}
                              className="px-2 py-1 text-xs bg-black/50 border border-[#333] hover:border-gray-500 rounded text-gray-300 font-mono cursor-pointer"
                            >
                              +{val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={() => {
                        if (selectedSinner === 'crate_nominable') {
                          addCrates('nominable', shardAmount);
                        } else if (selectedSinner === 'crate_random') {
                          addCrates('random', shardAmount);
                        } else {
                          const sinnerObj = sinnersData.find(s => s.id === selectedSinner);
                          addShards(selectedSinner, shardAmount, `+${shardAmount} ${sinnerObj?.name || selectedSinner} Shards`);
                        }
                      }}
                      className="px-4 py-1.5 bg-[#c9a84c] text-black font-bold text-xs rounded hover:bg-[#d4b96a] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <PackagePlus size={14} /> Add to Inventory
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List of shards/crates logged today */}
          {scheduleState.todayLoggedShards && scheduleState.todayLoggedShards.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#222]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Shards & Crates Logged Today</div>
              <div className="flex flex-wrap gap-2">
                {scheduleState.todayLoggedShards.map(item => (
                  <div key={item.id} className="bg-black/60 border border-[#444] rounded px-2.5 py-1 flex items-center gap-2 text-xs">
                    <span className="text-white font-medium">{item.label}</span>
                    <button 
                      onClick={() => {
                        if (item.sinnerId) undoAddShards(item.id);
                        else if (item.crateType) {
                          // Undo crate
                          const prop = item.crateType === 'nominable' ? 'nominableCrates' : 'randomCrates';
                          const cur = inventory[prop] || 0;
                          useStore.getState().updateInventory({ [prop]: Math.max(0, cur - item.amount) });
                          const newLogged = (scheduleState.todayLoggedShards || []).filter(r => r.id !== item.id);
                          updateScheduleState({ todayLoggedShards: newLogged });
                        }
                      }}
                      className="text-gray-500 hover:text-red-400 ml-1 transition-colors"
                      title="Undo this shard entry"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DAILY MISSIONS (5 STEPS) */}
        <div className={`p-4 rounded-xl border transition-all ${scheduleState.dailiesProgress >= 5 ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' : 'bg-[#111] border-[#333]'}`}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Target size={18} className="text-[#c9a84c]" /> Daily Missions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                10 Pass EXP total (+2 EXP per mission). Steps 4 & 5 auto-deduct 2 Modules (or 40 Enkephalin) for Luxcavations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const allDone = scheduleState.dailiesProgress >= 5;
                  useStore.getState().setAllDailyMissions(!allDone);
                  if (!allDone) promptEnkephalinSync('dailies');
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded border transition-all cursor-pointer ${
                  scheduleState.dailiesProgress >= 5
                    ? 'bg-red-950/30 border-red-800/60 text-red-400 hover:bg-red-900/40'
                    : 'bg-[#c9a84c]/20 border-[#c9a84c]/40 text-[#eab308] hover:bg-[#c9a84c]/30'
                }`}
              >
                {scheduleState.dailiesProgress >= 5 ? 'Reset All Dailies' : 'Complete All 5 (+10 EXP)'}
              </button>
              <div className="text-2xl font-black text-[#c9a84c]">
                {scheduleState.dailiesProgress} <span className="text-lg text-gray-500">/ 5</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { step: 1, name: 'Daily Login', desc: 'Log into game', cost: 'Free', icon: '🏢' },
              { step: 2, name: 'Stage 1x', desc: 'Clear 1 battle', cost: 'Free', icon: '⚔️' },
              { step: 3, name: 'Stage 3x', desc: 'Clear 3 battles', cost: 'Free', icon: '⚔️' },
              { step: 4, name: 'EXP Luxcavation', desc: 'Clear EXP Lux', cost: '2 Mod (40 Enk)', icon: '🧪' },
              { step: 5, name: 'Thread Luxcavation', desc: 'Clear Thread Lux', cost: '2 Mod (40 Enk)', icon: '🧵' }
            ].map(m => {
              const isDone = !!(scheduleState.dailyMissionSteps?.[m.step] ?? (scheduleState.dailiesProgress >= m.step));
              const deduction = scheduleState.dailyMissionDeductions?.[m.step];
              return (
                <button
                  key={m.step}
                  type="button"
                  onClick={() => {
                    const res = toggleDailyMissionStep(m.step);
                    if (res?.isAllDone) {
                      promptEnkephalinSync('dailies');
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                    isDone
                      ? 'bg-[#c9a84c]/15 border-[#c9a84c] text-white shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                      : 'bg-[#181818] border-[#333] hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{m.icon}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isDone 
                        ? 'bg-[#c9a84c] text-black' 
                        : 'bg-black/50 text-gray-400 border border-[#333]'
                    }`}>
                      {isDone ? '✓ DONE' : '+2 EXP'}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white leading-tight">{m.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{m.desc}</div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className={`font-mono ${isDone ? 'text-amber-300 font-bold' : 'text-gray-500'}`}>
                      {m.cost}
                    </span>
                    {deduction && (
                      <span className="text-[9px] text-red-400 font-mono">
                        -{deduction.modules > 0 ? `${deduction.modules}m` : ''}{deduction.enkephalin > 0 ? `${deduction.enkephalin}e` : ''}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* WEEKLIES SECTION */}
        <div className={`p-4 rounded-xl border transition-all ${scheduleState.weekliesDone ? 'bg-[#c9a84c]/10 border-[#c9a84c]/50' : 'bg-[#111] border-[#333]'}`}>
          {!scheduleState.canClaimWeeklies ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Can you claim your Weeklies yet?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Requires 1 Normal/Hard MD and minor weekly tasks.</p>
              </div>
              <button 
                onClick={() => updateScheduleState({ canClaimWeeklies: true })} 
                className="px-6 py-2 rounded bg-[#222] border border-[#444] hover:border-[#c9a84c] font-bold text-white transition-colors"
              >
                Yes
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Have you claimed them?</h3>
                <p className="text-xs text-gray-400 mt-0.5">20 Pass EXP rewarded instantly.</p>
              </div>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={() => {
                    if (scheduleState.weekliesDone) injectBpExp(-20);
                    updateScheduleState({ canClaimWeeklies: false, weekliesDone: false });
                  }} 
                  className="px-4 py-2 text-sm text-gray-500 hover:text-white"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    const newWeekliesDone = !scheduleState.weekliesDone;
                    updateScheduleState({ weekliesDone: newWeekliesDone });
                    injectBpExp(newWeekliesDone ? 20 : -20);
                  }}
                  className={`px-6 py-2 rounded font-bold transition-colors ${
                    scheduleState.weekliesDone 
                      ? 'bg-[#c9a84c] text-black shadow-[0_0_10px_rgba(201,168,76,0.3)]' 
                      : 'bg-[#222] text-white border border-[#444] hover:border-[#c9a84c]'
                  }`}
                >
                  {scheduleState.weekliesDone ? 'Claimed (+20 EXP)' : 'Claim Now'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ENKEPHALIN & COMPANY LEVEL PROMPT MODAL */}
      {showEnkephalinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-[#c9a84c]/50 rounded-2xl max-w-md w-full p-6 shadow-[0_0_35px_rgba(201,168,76,0.25)] flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#c9a84c]">
                <Zap size={22} className="text-[#eab308]" />
                <h3 className="font-bold text-lg font-limbus text-white">Manager Level & Enkephalin</h3>
              </div>
              <button 
                onClick={() => setShowEnkephalinModal(false)}
                className="text-gray-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Set your Company Level to auto-balance your official Enkephalin cap, and update your current Enkephalin (including overfilled energy from level-ups or boxes).
            </p>

            {/* SECTION 1: COMPANY LEVEL INPUT & AUTO-BALANCED CAP */}
            <div className="bg-black/60 border border-[#333] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Company (Manager) Level</label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Auto Cap: <span className="text-white text-sm underline">{getEnkephalinCapForLevel(companyLevelInputVal)}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="1"
                  max="300"
                  value={companyLevelInputVal}
                  onChange={(e) => setCompanyLevelInputVal(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
                  className="w-24 bg-[#111] border border-[#444] rounded-lg p-2 text-xl font-bold font-mono text-center text-white focus:border-[#c9a84c] focus:outline-none"
                />
                <div className="flex gap-1 flex-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCompanyLevelInputVal(prev => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 text-xs bg-[#222] hover:bg-[#333] border border-[#444] rounded text-gray-300 font-mono cursor-pointer"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyLevelInputVal(prev => Math.min(300, prev + 1))}
                    className="px-2.5 py-1 text-xs bg-[#222] hover:bg-[#333] border border-[#444] rounded text-gray-300 font-mono cursor-pointer"
                  >
                    +1
                  </button>
                  {[35, 50, 70, 100].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCompanyLevelInputVal(lvl)}
                      className="px-2 py-1 text-[11px] bg-black/40 hover:bg-black/70 border border-[#333] rounded text-gray-400 hover:text-white font-mono cursor-pointer"
                    >
                      Lv.{lvl}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Official Limbus table: Level 1 = 60 cap • Level 35 = 119 cap • Level 300 = 216 cap.
              </p>
            </div>

            {/* SECTION 2: CURRENT ENKEPHALIN INPUT */}
            <div className="bg-black/60 border border-[#333] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Current Enkephalin</label>
                <span className="text-xs text-gray-400 font-mono">
                  Cap: <strong className="text-white">{getEnkephalinCapForLevel(companyLevelInputVal)}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min="0"
                  max="999"
                  value={enkephalinInputVal}
                  onChange={(e) => setEnkephalinInputVal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#111] border border-[#444] rounded-lg p-2.5 text-xl font-bold font-mono text-center text-white focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              {enkephalinInputVal > getEnkephalinCapForLevel(companyLevelInputVal) && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2">
                  <Zap size={16} className="shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Overfilled Energy: </span>
                    +{enkephalinInputVal - getEnkephalinCapForLevel(companyLevelInputVal)} above cap. 
                    <span className="block text-[11px] text-amber-400/80 mt-0.5">
                      Natural regeneration will pause until energy drops below {getEnkephalinCapForLevel(companyLevelInputVal)}.
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Adjustment Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button 
                  type="button"
                  onClick={() => setEnkephalinInputVal(getEnkephalinCapForLevel(companyLevelInputVal))}
                  className="px-2.5 py-1 text-xs bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 border border-[#c9a84c]/40 text-[#eab308] rounded font-bold transition-colors cursor-pointer"
                >
                  Set to Cap ({getEnkephalinCapForLevel(companyLevelInputVal)})
                </button>
                <button 
                  type="button"
                  onClick={() => setEnkephalinInputVal(prev => prev + getEnkephalinCapForLevel(companyLevelInputVal))}
                  className="px-2.5 py-1 text-xs bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 rounded transition-colors cursor-pointer"
                >
                  +{getEnkephalinCapForLevel(companyLevelInputVal)} (Level Up)
                </button>
                <button 
                  type="button"
                  onClick={() => setEnkephalinInputVal(prev => prev + 20)}
                  className="px-2.5 py-1 text-xs bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 rounded font-mono transition-colors cursor-pointer"
                >
                  +20 Box
                </button>
                <button 
                  type="button"
                  onClick={() => setEnkephalinInputVal(prev => prev + 60)}
                  className="px-2.5 py-1 text-xs bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 rounded font-mono transition-colors cursor-pointer"
                >
                  +60 Box
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button"
                onClick={() => setShowEnkephalinModal(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  const targetCap = getEnkephalinCapForLevel(companyLevelInputVal);
                  updateInventory({
                    companyLevel: companyLevelInputVal,
                    maxEnkephalin: targetCap,
                    enkephalin: enkephalinInputVal
                  });
                  saveStore();
                  setShowEnkephalinModal(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#c9a84c] hover:bg-[#d4b96a] text-black rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle size={15} /> Save & Auto-Balance Cap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
