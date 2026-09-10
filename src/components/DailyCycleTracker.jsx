import React, { useState } from 'react';
import { Target, Flame, CalendarDays, CheckCircle, Swords, PackagePlus, Sparkles, Zap, X } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { calculateLimbusGrind, generateRoadmap, normalizeSinnerId } from '../utils/limbusCalculator.js';
import { getNextResets } from '../utils/timeUtils.js';
import { getSeasonEndDate } from '../utils/seasonUtils.js';
import sinnersData from '../data/sinners.json';

export default function DailyCycleTracker() {
  const { 
    scheduleState, 
    updateScheduleState, 
    bpState, 
    injectBpExp, 
    logMdRun, 
    undoMdRun, 
    addShards,
    undoAddShards,
    addCrates,
    inventory, 
    updateInventory,
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

  const [selectedSinner, setSelectedSinner] = useState('sinclair');
  const [shardAmount, setShardAmount] = useState(20);

  const [showEnkephalinModal, setShowEnkephalinModal] = useState(false);
  const [enkephalinModalTrigger, setEnkephalinModalTrigger] = useState('md');
  const [enkephalinInputVal, setEnkephalinInputVal] = useState(inventory.enkephalin || 0);

  const promptEnkephalinSync = (trigger = 'md') => {
    setEnkephalinModalTrigger(trigger);
    setEnkephalinInputVal(inventory.enkephalin || 0);
    setShowEnkephalinModal(true);
  };

  React.useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
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

  const totalRequiredMd = todayRoadmap?.runs || 0;
  const isMdCompletedToday = totalRequiredMd > 0 ? todayRuns.length >= totalRequiredMd : (scheduleState.mdTodayDone || todayRuns.length > 0);
  const isMdInProgress = totalRequiredMd > 0 && todayRuns.length > 0 && todayRuns.length < totalRequiredMd;

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
            className="text-xs bg-black/40 hover:bg-black/70 border border-[#333] hover:border-[#c9a84c] px-2.5 py-1 rounded flex items-center gap-1.5 transition-all text-gray-300 cursor-pointer"
            title="Account for level-up overfill or sync current Enkephalin"
          >
            <Zap size={13} className="text-[#eab308]" />
            <span>Enk:</span>
            <span className="font-mono font-bold text-white">{inventory.enkephalin || 0}</span>
            {inventory.enkephalin > (inventory.maxEnkephalin || 120) ? (
              <span className="text-[9px] bg-amber-500/30 text-amber-300 font-bold px-1 rounded">OVER</span>
            ) : (
              <span className="text-[10px] text-gray-500 font-mono">/{inventory.maxEnkephalin || 120}</span>
            )}
          </button>
          <div className="text-xs text-gray-400">Daily: <span className="text-white font-mono">{timeUntilDaily}</span></div>
          <div className="text-xs text-gray-400">MD Reset: <span className="text-[#eab308] font-mono">{timeUntilMd}</span></div>
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
                <PackagePlus size={16} className="text-[#c9a84c]" /> Log Shards & Crates Gained Today
              </h4>
              <p className="text-[11px] text-gray-400">
                Record extra Egoshards or Crates earned from extractions, events, or luxcavations.
              </p>
            </div>
            <button 
              onClick={() => setShowShardLogger(!showShardLogger)} 
              className="text-xs text-[#c9a84c] hover:underline font-bold"
            >
              {showShardLogger ? 'Hide Options' : '+ Log Shards'}
            </button>
          </div>

          {showShardLogger && (
            <div className="pt-2 border-t border-[#222] space-y-3">
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
                        <option key={s.id} value={s.id}>{s.name} ({inventory.shards?.[s.id] || 0} owned)</option>
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
                          className="px-2 py-1 text-xs bg-black/50 border border-[#333] hover:border-gray-500 rounded text-gray-300 font-mono"
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
                  className="px-4 py-1.5 bg-[#c9a84c] text-black font-bold text-xs rounded hover:bg-[#d4b96a] transition-colors flex items-center gap-1.5"
                >
                  <PackagePlus size={14} /> Add to Inventory
                </button>
              </div>
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
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Target size={18} className="text-[#c9a84c]" /> Daily Missions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">10 Pass EXP total (+2 EXP per mission step). Login, thread, EXP, and luxcavations.</p>
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
                  if (newProgress === 5) {
                    promptEnkephalinSync('dailies');
                  }
                }}
                className={`h-10 flex-1 rounded cursor-pointer transition-all flex items-center justify-center font-bold text-xs ${
                  scheduleState.dailiesProgress >= step 
                    ? 'bg-[#c9a84c] text-black shadow-[0_0_10px_rgba(201,168,76,0.3)]' 
                    : 'bg-[#222] text-gray-600 hover:bg-[#333]'
                }`}
              >
                +2
              </div>
            ))}
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

      {/* ENKEPHALIN LEVEL UP / OVERFILL PROMPT MODAL */}
      {showEnkephalinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-[#c9a84c]/50 rounded-2xl max-w-md w-full p-6 shadow-[0_0_35px_rgba(201,168,76,0.25)] flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#c9a84c]">
                <Zap size={22} className="text-[#eab308]" />
                <h3 className="font-bold text-lg font-limbus text-white">Manager Level-Up & Enkephalin</h3>
              </div>
              <button 
                onClick={() => setShowEnkephalinModal(false)}
                className="text-gray-500 hover:text-white p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {enkephalinModalTrigger === 'dailies'
                ? "You just completed your Daily Missions! Did your Manager Level increase or did your Enkephalin overfill?"
                : enkephalinModalTrigger === 'md'
                ? "You just logged a Mirror Dungeon run! If your Manager Level increased or Enkephalin overfilled, update your current count below:"
                : "Log or adjust your current Enkephalin (including overfilled energy from level-ups):"}
            </p>

            <div className="bg-black/60 border border-[#333] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Enkephalin</label>
                <span className="text-xs text-gray-500 font-mono">
                  Natural Cap: <strong className="text-gray-300">{inventory.maxEnkephalin || 120}</strong>
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

              {enkephalinInputVal > (inventory.maxEnkephalin || 120) && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2">
                  <Zap size={16} className="shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Overfilled Energy: </span>
                    +{enkephalinInputVal - (inventory.maxEnkephalin || 120)} above cap. 
                    <span className="block text-[11px] text-amber-400/80 mt-0.5">
                      Natural regeneration will pause until energy drops below cap.
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Adjustment Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button 
                  type="button"
                  onClick={() => setEnkephalinInputVal(prev => prev + (inventory.maxEnkephalin || 120))}
                  className="px-2.5 py-1 text-xs bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 border border-[#c9a84c]/40 text-[#eab308] rounded font-bold transition-colors cursor-pointer"
                >
                  +{inventory.maxEnkephalin || 120} (Level Up)
                </button>
                <button 
                  type="button"
                  onClick={() => setEnkephalinInputVal(inventory.maxEnkephalin || 120)}
                  className="px-2.5 py-1 text-xs bg-[#222] hover:bg-[#333] border border-[#444] text-gray-300 rounded transition-colors cursor-pointer"
                >
                  Cap ({inventory.maxEnkephalin || 120})
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
                No Level Up / Skip
              </button>
              <button 
                type="button"
                onClick={() => {
                  updateInventory({ enkephalin: enkephalinInputVal });
                  saveStore();
                  setShowEnkephalinModal(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#c9a84c] hover:bg-[#d4b96a] text-black rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle size={15} /> Save & Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
