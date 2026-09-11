import { create } from 'zustand';
import baseIdentities from '../data/identities.json';
import baseEgos from '../data/egos.json';
import personalPreset from '../data/personalPreset.json';
import sinnersData from '../data/sinners.json';
import { getOwnedShards, normalizeSinnerId } from '../utils/limbusCalculator.js';
import { checkResets } from '../utils/timeUtils.js';
import { syncEngine } from '../services/syncEngine.js';

// Initial state values
const defaultState = {
  onboardingCompleted: false,
  tutorialCompleted: false,
  acquiredIds: new Set(),
  acquiredEgos: new Set(),
  wantList: new Set(),
  
  // Economy & Inventory
  inventory: {
    shards: {}, // { 'yi-sang': 120, 'faust': 400, ... }
    nominableCrates: 0,
    randomCrates: 0,
    modules: 0,
    enkephalin: 0,
    maxEnkephalin: 140, // Base default for max level
    enkephalinLastSynced: Date.now(),
    extractionTickets: 0,
    lunacy: 0
  },
  
  // Battle Pass & Schedule Settings
  bpState: {
    level: 1,
    currentExp: 0,
    isPremium: false,
    canto: 8,
    preferHardMd: true,
    hasMdHard: true,
    safeMath: false, // 1.5 shards/crate vs 2.0
    autoConvertMdCrates: true, // Auto-convert crates gained from MD runs directly to target Sinner shards
    targetSinnerForCrates: '', // Preferred sinner for auto-conversion (defaults to first wantList sinner or Sinclair)
    asapMode: false, // Rely on MDs directly to reach goals ASAP instead of waiting on future passive dailies/weeklies
    paceMode: 'relaxed', // 'relaxed' | 'rush'
    customDailyRuns: 3, // custom MD runs per day when in 'rush' mode
    daysLeft: 45 // Default
  },
  
  scheduleState: {
    mode: 'general', // 'general' | 'targeted'
    startDate: new Date().toISOString().split('T')[0], // Persistent schedule baseline anchor
    dailiesDone: false, // Legacy
    dailiesProgress: 0,
    weekliesDone: false,
    canClaimWeeklies: false,
    mdTodayDone: false,
    todayLoggedRuns: [], // [ { id, type, exp, modules, bonusUsed } ]
    todayLoggedShards: [], // [ { id, sinnerId, amount, label } ]
    mdBonusesClaimed: 0, // 0 to 3
    lastResetCheck: Date.now(), // Used to determine if a daily/weekly reset has passed
    currentWeekStats: { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] }
  },

  weeklyArchive: [], // [ { id, weekLabel, archivedAt, mdRunsCompleted, totalExpEarned, shardsEarned, cratesEarned, weekliesCompleted, dailiesCompleted, runs: [] } ]
  shardCounts: {}, // Legacy, keeping for backwards compatibility
  weeklyProgress: {
    lastCheckedDate: null,
    mirrorDungeon: false,
    dailyStatus: {},
  },
  customMetadata: {},
  identitiesData: baseIdentities,
  egosData: baseEgos,
  activeBanner: null
};

export const useStore = create((set, get) => ({
  ...defaultState,
  isLoaded: false,

  initStore: async () => {
    try {
      syncEngine.setHydrating(true);
      let data;
      let dynamicData = { identities: [], egos: [] };
      
      if (window.electronAPI) {
        data = await window.electronAPI.loadData();
        dynamicData = await window.electronAPI.loadDynamicData();
      } else {
        const local = localStorage.getItem('limbus-tracker-data');
        if (local) data = JSON.parse(local);
      }

      // Check cloud save first: if cloud save is newer than local, adopt cloud save
      let resolvedTimestamp = data?.lastUpdated || 0;
      try {
        const user = await syncEngine.getUser();
        if (user) {
          const cloudResult = await syncEngine.fetchCloudSave();
          if (cloudResult && cloudResult.save_data) {
            const cloudUpdated = cloudResult.save_data.lastUpdated || (cloudResult.updated_at ? new Date(cloudResult.updated_at).getTime() : 0);
            const localUpdated = data?.lastUpdated || 0;
            if (cloudUpdated >= localUpdated) {
              data = cloudResult.save_data;
              resolvedTimestamp = cloudUpdated;
            }
          }
        }
      } catch (err) {
        console.warn('Startup cloud check skipped:', err);
      }

      function canonicalKey(name) {
        if (!name) return '';
        return String(name)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[\s\-_【】\[\]:]/g, '')
          .toLowerCase();
      }

      const mergedIdsMap = new Map();
      baseIdentities.forEach(id => mergedIdsMap.set(canonicalKey(id.name), id));
      (dynamicData.identities || []).forEach(id => {
        const key = canonicalKey(id.name);
        if (!mergedIdsMap.has(key)) {
          mergedIdsMap.set(key, id);
        }
      });
      const mergedIds = Array.from(mergedIdsMap.values());

      const mergedEgosMap = new Map();
      baseEgos.forEach(ego => mergedEgosMap.set(canonicalKey(ego.name), ego));
      (dynamicData.egos || []).forEach(ego => {
        const key = canonicalKey(ego.name);
        if (!mergedEgosMap.has(key)) {
          mergedEgosMap.set(key, ego);
        }
      });
      const mergedEgos = Array.from(mergedEgosMap.values());

      if (data && Object.keys(data).length > 0) {
        let loadedSchedule = { ...defaultState.scheduleState, ...(data.scheduleState || {}) };
        let loadedWeeklyProgress = { ...defaultState.weeklyProgress, ...(data.weeklyProgress || {}) };
        if (!loadedWeeklyProgress.dailyStatus) loadedWeeklyProgress.dailyStatus = {};
        
        // Check for daily/weekly resets
        const resets = checkResets(loadedSchedule.lastResetCheck);
        if (resets.hasDailyReset && !resets.hasWeeklyReset && !resets.hasMdWeeklyReset) {
            const oldRuns = loadedSchedule.todayLoggedRuns || [];
            const oldShards = loadedSchedule.todayLoggedShards || [];
            const curW = loadedSchedule.currentWeekStats || { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] };
            
            // If user did dailies before reset, lock in 'done' for previous cycle
            if (resets.prevCycleKey) {
              if (loadedSchedule.dailiesProgress >= 5 || loadedSchedule.dailiesDone) {
                loadedWeeklyProgress.dailyStatus[resets.prevCycleKey] = 'done';
              }
            }

            loadedSchedule.currentWeekStats = {
              mdRuns: (curW.mdRuns || 0) + oldRuns.length,
              expEarned: (curW.expEarned || 0) + oldRuns.reduce((s, r) => s + (r.exp || 0), 0),
              shardsEarned: (curW.shardsEarned || 0) + oldShards.reduce((s, sh) => s + (sh.amount > 0 ? sh.amount : 0), 0),
              cratesEarned: (curW.cratesEarned || 0) + oldShards.filter(s => s.crateType).reduce((s, c) => s + (c.amount > 0 ? c.amount : 0), 0),
              dailiesDoneCount: (curW.dailiesDoneCount || 0) + (loadedSchedule.dailiesProgress >= 5 ? 1 : 0),
              runs: [...(curW.runs || []), ...oldRuns]
            };
            loadedSchedule.dailiesDone = false;
            loadedSchedule.dailiesProgress = 0;
            loadedSchedule.mdTodayDone = false;
            loadedSchedule.todayLoggedRuns = [];
            loadedSchedule.todayLoggedShards = [];
        }
        
        let loadedWeeklyArchive = data.weeklyArchive || [];
        if ((resets.hasWeeklyReset || resets.hasMdWeeklyReset) && data.scheduleState) {
          const oldSchedule = data.scheduleState;
          const oldWeekStats = oldSchedule.currentWeekStats || { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, runs: [] };
          const oldRuns = oldSchedule.todayLoggedRuns || [];
          const oldShards = oldSchedule.todayLoggedShards || [];
          const totalRuns = (oldWeekStats.mdRuns || 0) + oldRuns.length;
          const totalExp = (oldWeekStats.expEarned || 0) + oldRuns.reduce((s, r) => s + (r.exp || 0), 0);
          const totalShards = (oldWeekStats.shardsEarned || 0) + oldShards.reduce((s, sh) => s + (sh.amount > 0 ? sh.amount : 0), 0);
          const totalCrates = (oldWeekStats.cratesEarned || 0) + oldShards.filter(s => s.crateType).reduce((s, c) => s + (c.amount > 0 ? c.amount : 0), 0);

          if (totalRuns > 0 || totalExp > 0 || totalShards > 0) {
            const dateObj = new Date(oldSchedule.lastResetCheck || Date.now());
            const oneWeekAgo = new Date(dateObj.getTime() - 7 * 24 * 60 * 60 * 1000);
            const weekLabel = `${oneWeekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            loadedWeeklyArchive = [
              {
                id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                weekLabel,
                archivedAt: Date.now(),
                mdRunsCompleted: totalRuns,
                totalExpEarned: totalExp,
                shardsEarned: totalShards,
                cratesEarned: totalCrates,
                weekliesCompleted: oldSchedule.weekliesDone || false,
                dailiesCompleted: oldSchedule.dailiesProgress || 0,
                runs: [...(oldWeekStats.runs || []), ...oldRuns]
              },
              ...loadedWeeklyArchive
            ];
          }
          loadedSchedule.currentWeekStats = { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] };
        }

        if (resets.hasWeeklyReset) {
            loadedSchedule.weekliesDone = false;
            loadedSchedule.canClaimWeeklies = false;
        }
        if (resets.hasMdWeeklyReset) {
            loadedSchedule.mdBonusesClaimed = 0;
        }
        loadedSchedule.lastResetCheck = resets.now;
        
        set({
          onboardingCompleted: data.onboardingCompleted || false,
          tutorialCompleted: data.tutorialCompleted || false,
          acquiredIds: new Set(data.acquiredIds || personalPreset.acquiredIds),
          acquiredEgos: new Set(data.acquiredEgos || []),
          wantList: new Set(data.wantList || []),
          inventory: { ...defaultState.inventory, ...(data.inventory || {}) },
          bpState: { ...defaultState.bpState, ...(data.bpState || {}) },
          scheduleState: loadedSchedule,
          weeklyArchive: loadedWeeklyArchive,
          shardCounts: data.shardCounts || {},
          weeklyProgress: loadedWeeklyProgress,
          customMetadata: data.customMetadata || {},
          identitiesData: mergedIds,
          egosData: mergedEgos,
          activeBanner: dynamicData.activeBanner || null,
          isLoaded: true,
        });
      } else {
        set({ 
          identitiesData: mergedIds, 
          egosData: mergedEgos, 
          activeBanner: dynamicData.activeBanner || null,
          isLoaded: true 
        });
      }

      // Background timer to check resets while app is running
      setInterval(() => {
        const currentSchedule = get().scheduleState;
        const currentWeekly = get().weeklyProgress;
        const intervalResets = checkResets(currentSchedule.lastResetCheck);
        if (intervalResets.hasDailyReset || intervalResets.hasWeeklyReset || intervalResets.hasMdWeeklyReset) {
          if (intervalResets.hasWeeklyReset || intervalResets.hasMdWeeklyReset) {
            get().archiveCurrentWeek();
          } else if (intervalResets.hasDailyReset) {
            const s = currentSchedule;
            const oldRuns = s.todayLoggedRuns || [];
            const oldShards = s.todayLoggedShards || [];
            const curW = s.currentWeekStats || { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] };
            
            // Preserve 'done' for previous cycle if dailies were done
            if (intervalResets.prevCycleKey && (s.dailiesProgress >= 5 || s.dailiesDone)) {
              const updatedDailyStatus = { ...(currentWeekly.dailyStatus || {}) };
              updatedDailyStatus[intervalResets.prevCycleKey] = 'done';
              get().updateWeekly({ ...currentWeekly, dailyStatus: updatedDailyStatus });
            }

            get().updateScheduleState({
              currentWeekStats: {
                mdRuns: (curW.mdRuns || 0) + oldRuns.length,
                expEarned: (curW.expEarned || 0) + oldRuns.reduce((sum, r) => sum + (r.exp || 0), 0),
                shardsEarned: (curW.shardsEarned || 0) + oldShards.reduce((sum, sh) => sum + (sh.amount > 0 ? sh.amount : 0), 0),
                cratesEarned: (curW.cratesEarned || 0) + oldShards.filter(sh => sh.crateType).reduce((sum, c) => sum + (c.amount > 0 ? c.amount : 0), 0),
                dailiesDoneCount: (curW.dailiesDoneCount || 0) + (s.dailiesProgress >= 5 ? 1 : 0),
                runs: [...(curW.runs || []), ...oldRuns]
              },
              dailiesDone: false,
              dailiesProgress: 0,
              mdTodayDone: false,
              todayLoggedRuns: [],
              todayLoggedShards: [],
              lastResetCheck: intervalResets.now
            });
            return;
          }
          get().updateScheduleState({
            ...(intervalResets.hasDailyReset ? { dailiesDone: false, dailiesProgress: 0, mdTodayDone: false, todayLoggedRuns: [], todayLoggedShards: [] } : {}),
            ...(intervalResets.hasWeeklyReset ? { weekliesDone: false, canClaimWeeklies: false } : {}),
            ...(intervalResets.hasMdWeeklyReset ? { mdBonusesClaimed: 0 } : {}),
            lastResetCheck: intervalResets.now
          });
        }
      }, 60000);

      syncEngine.setHydrating(false);
      syncEngine.markSynced(resolvedTimestamp);

    } catch (e) {
      console.error("Store init error:", e);
      set({ isLoaded: true });
      syncEngine.setHydrating(false);
    }
  },

  saveStore: async () => {
    if (!get().isLoaded) return;
    const now = Date.now();
    const dataToSave = {
      onboardingCompleted: state.onboardingCompleted,
      tutorialCompleted: state.tutorialCompleted,
      acquiredIds: Array.from(state.acquiredIds),
      acquiredEgos: Array.from(state.acquiredEgos),
      wantList: Array.from(state.wantList),
      shardCounts: state.shardCounts,
      weeklyProgress: state.weeklyProgress,
      weeklyArchive: state.weeklyArchive || [],
      customMetadata: state.customMetadata,
      inventory: state.inventory,
      bpState: state.bpState,
      scheduleState: state.scheduleState,
      lastUpdated: now
    };
    if (window.electronAPI) {
      await window.electronAPI.saveData(dataToSave);
    } else {
      localStorage.setItem('limbus-tracker-data', JSON.stringify(dataToSave));
    }
    syncEngine.queuePush();
  },

  toggleAcquiredId: (name) => {
    const { acquiredIds, saveStore } = get();
    const newIds = new Set(acquiredIds);
    if (newIds.has(name)) newIds.delete(name);
    else newIds.add(name);
    set({ acquiredIds: newIds });
    saveStore();
  },

  toggleAcquiredEgo: (name) => {
    const { acquiredEgos, saveStore } = get();
    const newEgos = new Set(acquiredEgos);
    if (newEgos.has(name)) newEgos.delete(name);
    else newEgos.add(name);
    set({ acquiredEgos: newEgos });
    saveStore();
  },

  toggleWantList: (name) => {
    const { wantList, saveStore } = get();
    const newList = new Set(wantList);
    if (newList.has(name)) newList.delete(name);
    else newList.add(name);
    set({ wantList: newList });
    saveStore();
  },

  setShardCount: (sinner, count) => {
    set((state) => ({ shardCounts: { ...state.shardCounts, [sinner]: count } }));
    get().saveStore();
  },

  updateCustomMetadata: (name, metadata) => {
    set((state) => ({ customMetadata: { ...state.customMetadata, [name]: metadata } }));
    get().saveStore();
  },

  updateWeekly: (data) => {
    set({ weeklyProgress: data });
    get().saveStore();
  },

  setOnboardingCompleted: (val) => {
    set({ onboardingCompleted: val });
    get().saveStore();
  },
  
  setTutorialCompleted: (val) => {
    set({ tutorialCompleted: val });
    get().saveStore();
  },

  updateInventory: (updates) => {
    set((state) => ({
      inventory: { ...state.inventory, ...updates, enkephalinLastSynced: updates.enkephalin !== undefined ? Date.now() : state.inventory.enkephalinLastSynced }
    }));
    get().saveStore();
  },

  updateBpState: (updates) => {
    set((state) => ({
      bpState: { ...state.bpState, ...updates }
    }));
    get().saveStore();
  },

  injectBpExp: (amount) => {
    let result = { levelsGained: 0, cratesDelta: 0 };
    set((state) => {
      let newLevel = state.bpState.level;
      let newExp = state.bpState.currentExp + amount;

      let levelsGained = 0;
      while (newExp >= 10) {
        newLevel++;
        newExp -= 10;
        levelsGained++;
      }
      while (newExp < 0 && newLevel > 1) {
        newLevel--;
        newExp += 10;
        levelsGained--;
      }
      if (newExp < 0) newExp = 0;

      // In Limbus Company, gaining BP levels awards Nominable Egocrates
      // (3 crates/level with Premium Pass, 1 crate/level without).
      const cratesPerLevel = state.bpState.isPremium ? 3 : 1;
      const cratesDelta = levelsGained * cratesPerLevel;
      const currentCrates = state.inventory.nominableCrates || 0;
      const newNominableCrates = Math.max(0, currentCrates + cratesDelta);

      result = { levelsGained, cratesDelta };

      return {
        bpState: { ...state.bpState, level: newLevel, currentExp: newExp },
        inventory: { ...state.inventory, nominableCrates: newNominableCrates }
      };
    });
    get().saveStore();
    return result;
  },

  resetAllData: async () => {
    try {
      localStorage.removeItem('limbus-tracker-data');
      if (window.electronAPI && window.electronAPI.wipeData) {
        await window.electronAPI.wipeData();
      }
    } catch(e) {
      console.error('Error wiping data:', e);
    }
    set({
      ...defaultState,
      acquiredIds: new Set(),
      acquiredEgos: new Set(),
      wantList: new Set(),
      onboardingCompleted: false,
      tutorialCompleted: false,
      isLoaded: true
    });
  },

  updateScheduleState: (updates) => {
    set((state) => ({
      scheduleState: { ...state.scheduleState, ...updates }
    }));
    get().saveStore();
  },

  logMdRun: (runType) => {
    // runType: 'hard_bonus' | 'normal_bonus' | 'normal_nobonus'
    const state = get();
    let exp = 30;
    let modules = 5;
    let bonusUsed = 0;
    let label = 'Normal Run (No Bonus)';

    if (runType === 'hard_bonus') {
      exp = 225;
      modules = 18;
      bonusUsed = 3;
      label = 'Hard Mode Bonus Run';
    } else if (runType === 'normal_bonus') {
      exp = 45;
      modules = 5;
      bonusUsed = 1;
      label = 'Normal Mode Bonus Run';
    }

    const runRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: runType,
      label,
      exp,
      modules,
      bonusUsed,
      timestamp: Date.now()
    };

    const newBonuses = Math.min(3, (state.scheduleState.mdBonusesClaimed || 0) + bonusUsed);
    const newLogged = [...(state.scheduleState.todayLoggedRuns || []), runRecord];
    const newModules = Math.max(0, (state.inventory.modules || 0) - modules);

    set((s) => ({
      inventory: { ...s.inventory, modules: newModules },
      scheduleState: {
        ...s.scheduleState,
        mdBonusesClaimed: newBonuses,
        todayLoggedRuns: newLogged
      }
    }));

    const expResult = get().injectBpExp(exp);
    const cratesDelta = expResult?.cratesDelta || 0;
    runRecord.cratesEarned = cratesDelta;

    // Auto-convert crates to target Sinner shards if enabled
    const bpState = get().bpState;
    if (bpState.autoConvertMdCrates && cratesDelta > 0) {
      let targetSinner = bpState.targetSinnerForCrates;
      if (!targetSinner) {
        const wantList = Array.from(get().wantList || []);
        if (wantList.length > 0) {
          const item = (get().identitiesData || []).find(id => id.name === wantList[0]) || 
                       (get().egosData || []).find(ego => ego.name === wantList[0]);
          if (item?.sinner) targetSinner = item.sinner;
        }
      }
      if (!targetSinner) targetSinner = 'sinclair';

      const sinnerObj = sinnersData.find(s => 
        s.id.toLowerCase() === String(targetSinner).toLowerCase() ||
        s.name.toLowerCase() === String(targetSinner).toLowerCase() ||
        normalizeSinnerId(s.id) === normalizeSinnerId(targetSinner)
      ) || { id: targetSinner, name: targetSinner };

      const rate = bpState.safeMath ? 1.5 : 2.0;
      const shardsGained = Math.round(cratesDelta * rate);
      get().openCratesForSinner(
        sinnerObj.id,
        cratesDelta,
        shardsGained,
        `Auto-Converted ${cratesDelta} MD Crates ➔ +${shardsGained} ${sinnerObj.name} Shards`,
        runRecord.id
      );
    }

    get().saveStore();
    return runRecord;
  },

  undoMdRun: (runId) => {
    const state = get();
    const run = (state.scheduleState.todayLoggedRuns || []).find(r => r.id === runId);
    if (!run) return;

    // Also undo any auto-converted shards linked to this run
    const linkedShard = (state.scheduleState.todayLoggedShards || []).find(s => s.linkedRunId === runId);
    if (linkedShard) {
      get().undoAddShards(linkedShard.id);
    }

    const newLogged = (get().scheduleState.todayLoggedRuns || []).filter(r => r.id !== runId);
    const newBonuses = Math.max(0, (get().scheduleState.mdBonusesClaimed || 0) - run.bonusUsed);
    const newModules = (get().inventory.modules || 0) + run.modules;

    set((s) => ({
      inventory: { ...s.inventory, modules: newModules },
      scheduleState: {
        ...s.scheduleState,
        mdBonusesClaimed: newBonuses,
        mdTodayDone: newLogged.length === 0 ? false : s.scheduleState.mdTodayDone,
        todayLoggedRuns: newLogged
      }
    }));

    get().injectBpExp(-run.exp);
    get().saveStore();
  },

  openCratesForSinner: (sinnerId, cratesUsed, shardsGained, customLabel, linkedRunId) => {
    const state = get();
    const available = state.inventory.nominableCrates || 0;
    const actualCrates = Math.min(available, Math.max(0, cratesUsed));
    if (actualCrates <= 0 && cratesUsed > 0) return null;

    const sinnerObj = sinnersData.find(s => 
      s.id.toLowerCase() === String(sinnerId).toLowerCase() ||
      s.name.toLowerCase() === String(sinnerId).toLowerCase() ||
      normalizeSinnerId(s.id) === normalizeSinnerId(sinnerId)
    ) || { id: sinnerId, name: sinnerId };

    const currentOwned = getOwnedShards(state.inventory.shards, sinnerObj.id);
    const newShards = Math.max(0, currentOwned + shardsGained);

    const record = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isConversion: true,
      sinnerId: sinnerObj.id,
      sinnerName: sinnerObj.name,
      cratesUsed: actualCrates,
      amount: shardsGained,
      linkedRunId: linkedRunId || null,
      label: customLabel || `Opened ${actualCrates} Crates ➔ +${shardsGained} ${sinnerObj.name} Shards`,
      timestamp: Date.now()
    };

    const newLogged = [...(state.scheduleState.todayLoggedShards || []), record];

    set((s) => ({
      inventory: {
        ...s.inventory,
        nominableCrates: Math.max(0, (s.inventory.nominableCrates || 0) - actualCrates),
        shards: {
          ...s.inventory.shards,
          [sinnerObj.name]: newShards,
          [sinnerObj.id]: newShards
        }
      },
      scheduleState: {
        ...s.scheduleState,
        todayLoggedShards: newLogged
      }
    }));
    get().saveStore();
    return record;
  },

  addShards: (sinnerId, amount, label) => {
    const state = get();
    const sinnerObj = sinnersData.find(s => 
      s.id.toLowerCase() === String(sinnerId).toLowerCase() ||
      s.name.toLowerCase() === String(sinnerId).toLowerCase() ||
      normalizeSinnerId(s.id) === normalizeSinnerId(sinnerId)
    ) || { id: sinnerId, name: sinnerId };

    const currentOwned = getOwnedShards(state.inventory.shards, sinnerObj.id);
    const newCount = Math.max(0, currentOwned + amount);

    const record = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sinnerId: sinnerObj.id,
      sinnerName: sinnerObj.name,
      amount,
      label: label || `${amount > 0 ? '+' : ''}${amount} ${sinnerObj.name} Shards`,
      timestamp: Date.now()
    };

    const newLogged = [...(state.scheduleState.todayLoggedShards || []), record];

    set((s) => ({
      inventory: {
        ...s.inventory,
        shards: {
          ...s.inventory.shards,
          [sinnerObj.name]: newCount,
          [sinnerObj.id]: newCount
        }
      },
      scheduleState: {
        ...s.scheduleState,
        todayLoggedShards: newLogged
      }
    }));
    get().saveStore();
    return record;
  },

  undoAddShards: (recordId) => {
    const state = get();
    const rec = (state.scheduleState.todayLoggedShards || []).find(r => r.id === recordId);
    if (!rec) return;

    const newLogged = (state.scheduleState.todayLoggedShards || []).filter(r => r.id !== recordId);

    if (rec.isConversion) {
      // Revert conversion: restore crates, remove shards
      const currentOwned = getOwnedShards(state.inventory.shards, rec.sinnerId);
      const newShards = Math.max(0, currentOwned - rec.amount);
      const restoredCrates = (state.inventory.nominableCrates || 0) + (rec.cratesUsed || 0);

      set((s) => ({
        inventory: {
          ...s.inventory,
          nominableCrates: restoredCrates,
          shards: {
            ...s.inventory.shards,
            [rec.sinnerName || rec.sinnerId]: newShards,
            [rec.sinnerId]: newShards
          }
        },
        scheduleState: {
          ...s.scheduleState,
          todayLoggedShards: newLogged
        }
      }));
    } else {
      // Normal shard record
      const currentOwned = getOwnedShards(state.inventory.shards, rec.sinnerId);
      const newCount = Math.max(0, currentOwned - rec.amount);

      set((s) => ({
        inventory: {
          ...s.inventory,
          shards: {
            ...s.inventory.shards,
            [rec.sinnerName || rec.sinnerId]: newCount,
            [rec.sinnerId]: newCount
          }
        },
        scheduleState: {
          ...s.scheduleState,
          todayLoggedShards: newLogged
        }
      }));
    }
    get().saveStore();
  },

  addCrates: (type, amount) => {
    // type: 'nominable' | 'random'
    const state = get();
    const prop = type === 'nominable' ? 'nominableCrates' : 'randomCrates';
    const current = state.inventory[prop] || 0;
    const newCount = Math.max(0, current + amount);

    const record = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      crateType: type,
      amount,
      label: `${amount > 0 ? '+' : ''}${amount} ${type === 'nominable' ? 'Nominable' : 'Random'} Crates`,
      timestamp: Date.now()
    };

    const newLogged = [...(state.scheduleState.todayLoggedShards || []), record];

    set((s) => ({
      inventory: {
        ...s.inventory,
        [prop]: newCount
      },
      scheduleState: {
        ...s.scheduleState,
        todayLoggedShards: newLogged
      }
    }));
    get().saveStore();
    return record;
  },

  archiveCurrentWeek: () => {
    const state = get();
    const schedule = state.scheduleState || {};
    const weekStats = schedule.currentWeekStats || { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, runs: [] };
    const todayRuns = schedule.todayLoggedRuns || [];
    const todayShards = schedule.todayLoggedShards || [];

    const totalRuns = (weekStats.mdRuns || 0) + todayRuns.length;
    const totalExp = (weekStats.expEarned || 0) + todayRuns.reduce((s, r) => s + (r.exp || 0), 0);
    const totalShards = (weekStats.shardsEarned || 0) + todayShards.reduce((s, sh) => s + (sh.amount > 0 ? sh.amount : 0), 0);
    const totalCrates = (weekStats.cratesEarned || 0) + todayShards.filter(s => s.crateType).reduce((s, c) => s + (c.amount > 0 ? c.amount : 0), 0);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekLabel = `${oneWeekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const archiveRecord = {
      id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      weekLabel,
      archivedAt: Date.now(),
      mdRunsCompleted: totalRuns,
      totalExpEarned: totalExp,
      shardsEarned: totalShards,
      cratesEarned: totalCrates,
      weekliesCompleted: schedule.weekliesDone || false,
      dailiesCompleted: schedule.dailiesProgress || 0,
      runs: [...(weekStats.runs || []), ...todayRuns]
    };

    set((s) => ({
      weeklyArchive: [archiveRecord, ...(s.weeklyArchive || [])],
      scheduleState: {
        ...s.scheduleState,
        currentWeekStats: { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] }
      }
    }));
    get().saveStore();
    return archiveRecord;
  },

  deleteWeeklyArchive: (id) => {
    set((s) => ({
      weeklyArchive: (s.weeklyArchive || []).filter(a => a.id !== id)
    }));
    get().saveStore();
  },

  reanchorSchedule: () => {
    const todayStr = new Date().toISOString().split('T')[0];
    set((s) => ({
      scheduleState: {
        ...s.scheduleState,
        startDate: todayStr
      }
    }));
    get().saveStore();
  }
}));
