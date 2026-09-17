import { create } from 'zustand';
import baseIdentities from '../data/identities.json';
import baseEgos from '../data/egos.json';
import personalPreset from '../data/personalPreset.json';
import sinnersData from '../data/sinners.json';
import { getOwnedShards, normalizeSinnerId } from '../utils/limbusCalculator.js';
import { checkResets, getLimbusCycleInfo } from '../utils/timeUtils.js';
import { getEnkephalinCapForLevel, recalculateEnkephalin } from '../utils/enkephalinLevels.js';
import { syncEngine } from '../services/syncEngine.js';
import { imagePreloader } from '../utils/imagePreloader.js';

// Initial state values
const defaultState = {
  onboardingCompleted: false,
  tutorialCompleted: false,
  acquiredIds: new Set(),
  acquiredEgos: new Set(),
  wantList: new Set(),
  
  // Economy & Inventory
  inventory: {
    companyLevel: 35, // Manager Level (1 - 300)
    shards: {}, // { 'yi-sang': 120, 'faust': 400, ... }
    nominableCrates: 0,
    randomCrates: 0,
    modules: 0,
    enkephalin: 119,
    maxEnkephalin: 119, // Base default for level 35
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
    daysLeft: 260 // Default (~8.5 months)
  },
  
  scheduleState: {
    mode: 'general', // 'general' | 'targeted'
    startDate: new Date().toISOString().split('T')[0], // Persistent schedule baseline anchor
    dailiesDone: false, // Legacy
    dailiesProgress: 0,
    dailyMissionSteps: { 1: false, 2: false, 3: false, 4: false, 5: false },
    dailyMissionDeductions: {},
    expLuxModules: 3, // 2 or 3 Modules depending on Canto level (Canto 1-3 = 2, Canto 4+ = 3)
    weekliesDone: false,
    weekliesProgress: 0,
    weeklyMissionSteps: { 1: false, 2: false, 3: false, 4: false, 5: false },
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
  activeBanner: null,

  managerProfile: {
    callSign: 'Dante',
    favoriteSinner: 'yi-sang',
    avatarType: 'sinner', // 'sinner' | 'dossier'
    avatarId: 'yi-sang',
    avatarZoom: 1.0, // 1.0 to 2.5
    avatarYOffset: 0, // -60 to 60 (%)
    avatarXOffset: 0,
    discoveredDossiers: []
  },

  appSettings: {
    busEnabled: true,
    busChatterFrequency: 'normal', // 'off' | 'slow' | 'normal' | 'fast'
    busSinnerFilter: {
      'yi-sang': true,
      'faust': true,
      'don-quixote': true,
      'ryoshu': true,
      'meursault': true,
      'hong-lu': true,
      'heathcliff': true,
      'ishmael': true,
      'rodion': true,
      'sinclair': true,
      'outis': true,
      'gregor': true,
      'charon': true,
      'vergilius': true,
      'kenneth': true
    },
    busHornVolume: 0.8,
    activeTheme: 'gold', // 'gold' | 'crimson' | 'amber' | 'cyan' | 'violet' | 'monochrome'
    crtScanlines: false,
    compactMode: false,
    closeToTray: true,
    showWhenGameStarts: true,
    notifyEnkephalinCap: true,
    defaultExpLuxTier: 3 // 2 or 3
  }
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
        const cycleInfo = getLimbusCycleInfo();
        if (resets.hasDailyReset) {
            const oldRuns = loadedSchedule.todayLoggedRuns || [];
            const oldShards = loadedSchedule.todayLoggedShards || [];
            const curW = loadedSchedule.currentWeekStats || { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] };
            
            // Runs from past cycle vs runs logged during current active cycle (e.g. from another device today)
            const runsPast = oldRuns.filter(r => (r.timestamp || 0) < cycleInfo.cycleStartMs);
            const runsToday = oldRuns.filter(r => (r.timestamp || 0) >= cycleInfo.cycleStartMs);
            const shardsPast = oldShards.filter(s => (s.timestamp || 0) < cycleInfo.cycleStartMs);
            const shardsToday = oldShards.filter(s => (s.timestamp || 0) >= cycleInfo.cycleStartMs);

            // If user did dailies before reset, lock in 'done' for previous cycle
            if (resets.prevCycleKey) {
              if (loadedSchedule.dailiesProgress >= 5 || loadedSchedule.dailiesDone) {
                loadedWeeklyProgress.dailyStatus[resets.prevCycleKey] = 'done';
              }
            }

            loadedSchedule.currentWeekStats = {
              mdRuns: (curW.mdRuns || 0) + runsPast.length,
              expEarned: (curW.expEarned || 0) + runsPast.reduce((s, r) => s + (r.exp || 0), 0),
              shardsEarned: (curW.shardsEarned || 0) + shardsPast.reduce((s, sh) => s + (sh.amount > 0 ? sh.amount : 0), 0),
              cratesEarned: (curW.cratesEarned || 0) + shardsPast.filter(s => s.crateType).reduce((s, c) => s + (c.amount > 0 ? c.amount : 0), 0),
              dailiesDoneCount: (curW.dailiesDoneCount || 0) + (loadedSchedule.dailiesProgress >= 5 ? 1 : 0),
              runs: [...(curW.runs || []), ...runsPast]
            };
            loadedSchedule.dailiesDone = false;
            loadedSchedule.dailiesProgress = 0;
            loadedSchedule.dailyMissionSteps = { 1: false, 2: false, 3: false, 4: false, 5: false };
            loadedSchedule.dailyMissionDeductions = {};
            loadedSchedule.mdTodayDone = runsToday.length > 0;
            loadedSchedule.todayLoggedRuns = runsToday;
            loadedSchedule.todayLoggedShards = shardsToday;
        } else {
            // Strictly cull any stale runs/shards whose timestamps are before active cycleStartMs
            loadedSchedule.todayLoggedRuns = (loadedSchedule.todayLoggedRuns || []).filter(r => (r.timestamp || 0) >= cycleInfo.cycleStartMs);
            loadedSchedule.todayLoggedShards = (loadedSchedule.todayLoggedShards || []).filter(s => (s.timestamp || 0) >= cycleInfo.cycleStartMs);
        }

        if (!loadedSchedule.dailyMissionSteps) {
          const prog = loadedSchedule.dailiesProgress || 0;
          loadedSchedule.dailyMissionSteps = {
            1: prog >= 1,
            2: prog >= 2,
            3: prog >= 3,
            4: prog >= 4,
            5: prog >= 5
          };
        }
        if (!loadedSchedule.dailyMissionDeductions) {
          loadedSchedule.dailyMissionDeductions = {};
        }
        if (!loadedSchedule.expLuxModules) {
          loadedSchedule.expLuxModules = (data?.bpState?.canto !== undefined && data.bpState.canto < 4) ? 2 : 3;
        }
        if (!loadedSchedule.weeklyMissionSteps) {
          const isDone = !!loadedSchedule.weekliesDone;
          loadedSchedule.weeklyMissionSteps = {
            1: isDone,
            2: isDone,
            3: isDone,
            4: isDone,
            5: isDone
          };
          loadedSchedule.weekliesProgress = isDone ? 5 : 0;
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
            loadedSchedule.weekliesProgress = 0;
            loadedSchedule.weeklyMissionSteps = { 1: false, 2: false, 3: false, 4: false, 5: false };
            loadedSchedule.canClaimWeeklies = false;
            loadedWeeklyProgress.dailyStatus = {};
        }
        if (resets.hasMdWeeklyReset) {
            loadedSchedule.mdBonusesClaimed = 0;
        }
        loadedSchedule.lastResetCheck = resets.now;
        
        let rawInventory = { ...defaultState.inventory, ...(data.inventory || {}) };
        const companyLevel = Math.max(1, Math.min(300, parseInt(rawInventory.companyLevel) || 35));
        const maxCap = getEnkephalinCapForLevel(companyLevel);
        rawInventory.companyLevel = companyLevel;
        rawInventory.maxEnkephalin = maxCap;
        const loadedInventory = recalculateEnkephalin(rawInventory);

        let loadedBpState = { ...defaultState.bpState, ...(data.bpState || {}) };
        if (loadedBpState.seasonEndDate) {
          const endMs = new Date(loadedBpState.seasonEndDate).getTime();
          if (isNaN(endMs) || endMs <= Date.now()) {
            loadedBpState.seasonEndDate = 'Unknown';
          }
        }
        if (!loadedBpState.paceMode) {
          loadedBpState.paceMode = 'relaxed';
        }

        const DEFAULT_S8_BANNER = {
          text: "Haute Couture Boutique du Rouge Ishmael & Haute Couture Le Noir Footwear Hall Ryōshū",
          title: "Haute Couture Boutique du Rouge Ishmael & Haute Couture Le Noir Footwear Hall Ryōshū",
          imageUrl: "https://limbuscompany.wiki.gg/images/Target_Extraction_-_Haute_Couture_Boutique_du_Rouge_Ishmael_%26_Haute_Couture_Le_Noir_Footwear_Hall_Ry%C5%8Dsh%C5%AB.png",
          dateRange: "2026.9.17 12:00 - 2026.10.1 10:00",
          rawString: "2026.9.17 12:00 - 2026.10.1 10:00 Haute Couture::Boutique du Rouge Ishmael Haute Couture::Le Noir Footwear Hall Ryōshū"
        };

        let resolvedBanner = dynamicData.activeBanner;
        if (!resolvedBanner || !resolvedBanner.text || resolvedBanner.text.includes('Season 7') || resolvedBanner.text.includes('Kumo no ito') || resolvedBanner.text === 'Season 8: PUNCTUM') {
          resolvedBanner = DEFAULT_S8_BANNER;
        }

        set({
          onboardingCompleted: data.onboardingCompleted || false,
          tutorialCompleted: data.tutorialCompleted || false,
          acquiredIds: new Set(data.acquiredIds || personalPreset.acquiredIds),
          acquiredEgos: new Set(data.acquiredEgos || []),
          wantList: new Set(data.wantList || []),
          inventory: loadedInventory,
          bpState: loadedBpState,
          scheduleState: loadedSchedule,
          weeklyArchive: loadedWeeklyArchive,
          shardCounts: data.shardCounts || {},
          weeklyProgress: loadedWeeklyProgress,
          customMetadata: data.customMetadata || {},
          identitiesData: mergedIds,
          egosData: mergedEgos,
          activeBanner: resolvedBanner,
          managerProfile: { ...defaultState.managerProfile, ...(data.managerProfile || {}) },
          appSettings: { ...defaultState.appSettings, ...(data.appSettings || {}) },
          isLoaded: true,
        });
      } else {
        const DEFAULT_S8_BANNER = {
          text: "Haute Couture Boutique du Rouge Ishmael & Haute Couture Le Noir Footwear Hall Ryōshū",
          title: "Haute Couture Boutique du Rouge Ishmael & Haute Couture Le Noir Footwear Hall Ryōshū",
          imageUrl: "https://limbuscompany.wiki.gg/images/Target_Extraction_-_Haute_Couture_Boutique_du_Rouge_Ishmael_%26_Haute_Couture_Le_Noir_Footwear_Hall_Ry%C5%8Dsh%C5%AB.png",
          dateRange: "2026.9.17 12:00 - 2026.10.1 10:00",
          rawString: "2026.9.17 12:00 - 2026.10.1 10:00 Haute Couture::Boutique du Rouge Ishmael Haute Couture::Le Noir Footwear Hall Ryōshū"
        };

        let resolvedBanner = dynamicData.activeBanner;
        if (!resolvedBanner || !resolvedBanner.text || resolvedBanner.text.includes('Season 7') || resolvedBanner.text.includes('Kumo no ito') || resolvedBanner.text === 'Season 8: PUNCTUM') {
          resolvedBanner = DEFAULT_S8_BANNER;
        }

        set({ 
          inventory: defaultState.inventory,
          identitiesData: mergedIds, 
          egosData: mergedEgos, 
          activeBanner: resolvedBanner,
          managerProfile: defaultState.managerProfile,
          appSettings: defaultState.appSettings,
          isLoaded: true 
        });
      }

      // Preload identity and EGO images in the background using idle scheduling
      imagePreloader.preloadIdentities(mergedIds);
      imagePreloader.preloadEgos(mergedEgos);

      // Background timer to check resets and passive enkephalin regen while app is running
      setInterval(() => {
        // 1. Passive Enkephalin Regeneration
        const currentInv = get().inventory;
        if (currentInv) {
          const regenerated = recalculateEnkephalin(currentInv);
          if (regenerated.enkephalin !== currentInv.enkephalin || regenerated.maxEnkephalin !== currentInv.maxEnkephalin) {
            set((s) => ({ inventory: { ...s.inventory, ...regenerated } }));
            get().saveStore(false);
          }
        }

        // 2. Daily / Weekly Reset Checks
        const currentSchedule = get().scheduleState;
        const currentWeekly = get().weeklyProgress;
        const intervalResets = checkResets(currentSchedule.lastResetCheck);
        if (intervalResets.hasDailyReset || intervalResets.hasWeeklyReset || intervalResets.hasMdWeeklyReset) {
          if (intervalResets.hasWeeklyReset || intervalResets.hasMdWeeklyReset) {
            get().archiveCurrentWeek();
            if (intervalResets.hasWeeklyReset) {
              get().updateWeekly({ ...(get().weeklyProgress || {}), dailyStatus: {} });
            }
          }

          const s = currentSchedule;
          const oldRuns = s.todayLoggedRuns || [];
          const oldShards = s.todayLoggedShards || [];
          const curW = s.currentWeekStats || { mdRuns: 0, expEarned: 0, shardsEarned: 0, cratesEarned: 0, dailiesDoneCount: 0, runs: [] };
          const cycleInfo = getLimbusCycleInfo();
          const runsPast = oldRuns.filter(r => (r.timestamp || 0) < cycleInfo.cycleStartMs);
          const runsToday = oldRuns.filter(r => (r.timestamp || 0) >= cycleInfo.cycleStartMs);
          const shardsPast = oldShards.filter(s => (s.timestamp || 0) < cycleInfo.cycleStartMs);
          const shardsToday = oldShards.filter(s => (s.timestamp || 0) >= cycleInfo.cycleStartMs);
          
          if (intervalResets.hasDailyReset && intervalResets.prevCycleKey && (s.dailiesProgress >= 5 || s.dailiesDone)) {
            const updatedDailyStatus = { ...(currentWeekly.dailyStatus || {}) };
            updatedDailyStatus[intervalResets.prevCycleKey] = 'done';
            get().updateWeekly({ ...currentWeekly, dailyStatus: updatedDailyStatus });
          }

          get().updateScheduleState({
            ...(intervalResets.hasDailyReset ? {
              currentWeekStats: {
                mdRuns: (curW.mdRuns || 0) + runsPast.length,
                expEarned: (curW.expEarned || 0) + runsPast.reduce((sum, r) => sum + (r.exp || 0), 0),
                shardsEarned: (curW.shardsEarned || 0) + shardsPast.reduce((sum, sh) => sum + (sh.amount > 0 ? sh.amount : 0), 0),
                cratesEarned: (curW.cratesEarned || 0) + shardsPast.filter(sh => sh.crateType).reduce((sum, c) => sum + (c.amount > 0 ? c.amount : 0), 0),
                dailiesDoneCount: (curW.dailiesDoneCount || 0) + (s.dailiesProgress >= 5 ? 1 : 0),
                runs: [...(curW.runs || []), ...runsPast]
              },
              dailiesDone: false,
              dailiesProgress: 0,
              dailyMissionSteps: { 1: false, 2: false, 3: false, 4: false, 5: false },
              dailyMissionDeductions: {},
              mdTodayDone: runsToday.length > 0,
              todayLoggedRuns: runsToday,
              todayLoggedShards: shardsToday,
            } : {}),
            ...(intervalResets.hasWeeklyReset ? { 
              weekliesDone: false, 
              weekliesProgress: 0, 
              weeklyMissionSteps: { 1: false, 2: false, 3: false, 4: false, 5: false }, 
              canClaimWeeklies: false 
            } : {}),
            ...(intervalResets.hasMdWeeklyReset ? { mdBonusesClaimed: 0 } : {}),
            lastResetCheck: intervalResets.now
          });
        } else {
          const s = currentSchedule;
          const cycleInfo = getLimbusCycleInfo();
          const currentRuns = s.todayLoggedRuns || [];
          const currentShards = s.todayLoggedShards || [];
          const validRuns = currentRuns.filter(r => (r.timestamp || 0) >= cycleInfo.cycleStartMs);
          const validShards = currentShards.filter(s => (s.timestamp || 0) >= cycleInfo.cycleStartMs);
          if (validRuns.length !== currentRuns.length || validShards.length !== currentShards.length) {
            get().updateScheduleState({
              todayLoggedRuns: validRuns,
              todayLoggedShards: validShards,
              mdTodayDone: validRuns.length > 0
            });
          }
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

  saveStore: async (isUserAction = true) => {
    if (!get().isLoaded) return;
    const state = get();
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
      managerProfile: state.managerProfile,
      appSettings: state.appSettings,
      lastUpdated: now
    };
    if (window.electronAPI) {
      await window.electronAPI.saveData(dataToSave);
    } else {
      localStorage.setItem('limbus-tracker-data', JSON.stringify(dataToSave));
    }
    if (isUserAction) {
      syncEngine.queuePush();
    }
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

  reorderWantList: (newOrderedNames) => {
    const { saveStore } = get();
    const newList = new Set(newOrderedNames);
    set({ wantList: newList });
    saveStore();
  },

  moveWantListPriority: (name, direction) => {
    const { wantList, saveStore } = get();
    const arr = Array.from(wantList);
    const idx = arr.indexOf(name);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    const temp = arr[idx];
    arr[idx] = arr[targetIdx];
    arr[targetIdx] = temp;
    set({ wantList: new Set(arr) });
    saveStore();
  },

  setWantListPriority: (name, targetRank) => {
    const { wantList, saveStore } = get();
    const arr = Array.from(wantList);
    const currentIdx = arr.indexOf(name);
    if (currentIdx === -1) return;
    const newIdx = Math.max(0, Math.min(arr.length - 1, targetRank - 1));
    if (newIdx === currentIdx) return;
    arr.splice(currentIdx, 1);
    arr.splice(newIdx, 0, name);
    set({ wantList: new Set(arr) });
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
    set((state) => {
      let finalUpdates = { ...updates };
      if (finalUpdates.companyLevel !== undefined) {
        const lvl = Math.max(1, Math.min(300, parseInt(finalUpdates.companyLevel) || 1));
        finalUpdates.companyLevel = lvl;
        finalUpdates.maxEnkephalin = getEnkephalinCapForLevel(lvl);
      }
      return {
        inventory: {
          ...state.inventory,
          ...finalUpdates,
          enkephalinLastSynced: finalUpdates.enkephalin !== undefined ? Date.now() : state.inventory.enkephalinLastSynced
        }
      };
    });
    get().saveStore();
  },

  updateBpState: (updates) => {
    set((state) => ({
      bpState: { ...state.bpState, ...updates }
    }));
    get().saveStore();
  },

  injectBpExp: (amount) => {
    let result = { levelsGained: 0 };
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

      result = { levelsGained };

      return {
        bpState: { ...state.bpState, level: newLevel, currentExp: newExp }
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
    
    // Deduct modules; if short on modules, convert from enkephalin (1 module = 20 Enkephalin in Limbus)
    const currentModules = state.inventory.modules || 0;
    const currentEnk = state.inventory.enkephalin !== undefined ? state.inventory.enkephalin : (state.inventory.maxEnkephalin || 119);
    let modulesDeducted = 0;
    let enkephalinDeducted = 0;

    if (currentModules >= modules) {
      modulesDeducted = modules;
    } else {
      modulesDeducted = currentModules;
      const remainingModulesNeeded = modules - currentModules;
      enkephalinDeducted = Math.min(currentEnk, remainingModulesNeeded * 20);
    }

    const newModules = Math.max(0, currentModules - modulesDeducted);
    const newEnkephalin = Math.max(0, currentEnk - enkephalinDeducted);

    runRecord.modulesDeducted = modulesDeducted;
    runRecord.enkephalinDeducted = enkephalinDeducted;

    set((s) => ({
      inventory: { 
        ...s.inventory, 
        modules: newModules,
        enkephalin: newEnkephalin,
        enkephalinLastSynced: enkephalinDeducted > 0 ? Date.now() : s.inventory.enkephalinLastSynced
      },
      scheduleState: {
        ...s.scheduleState,
        mdBonusesClaimed: newBonuses,
        todayLoggedRuns: newLogged
      }
    }));

    get().injectBpExp(exp);

    get().saveStore();
    return runRecord;
  },

  autoConvertCratesToShards: (cratesDelta, customLabel, linkedRunId) => {
    if (!cratesDelta || cratesDelta <= 0) return null;
    const bpState = get().bpState;
    if (!bpState.autoConvertMdCrates) return null;

    let targetSinner = bpState.targetSinnerForCrates;
    if (!targetSinner) {
      const wantList = Array.from(get().wantList || []);
      if (wantList.length > 0) {
        const item = (get().identitiesData || []).find(id => id.name === wantList[0]) || 
                     (get().egosData || []).find(ego => ego.name === wantList[0]);
        if (item?.sinner) targetSinner = item.sinner;
      }
    }
    if (!targetSinner) targetSinner = 'rodion';

    const sinnerObj = sinnersData.find(s => 
      s.id.toLowerCase() === String(targetSinner).toLowerCase() ||
      s.name.toLowerCase() === String(targetSinner).toLowerCase() ||
      normalizeSinnerId(s.id) === normalizeSinnerId(targetSinner)
    ) || { id: targetSinner, name: targetSinner };

    const rate = bpState.safeMath ? 1.5 : 2.0;
    const shardsGained = Math.round(cratesDelta * rate);
    return get().openCratesForSinner(
      sinnerObj.id,
      cratesDelta,
      shardsGained,
      customLabel || `Auto-Converted ${cratesDelta} Pass Crates ➔ +${shardsGained} ${sinnerObj.name} Shards`,
      linkedRunId || null
    );
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
    const restoredModules = (get().inventory.modules || 0) + (run.modulesDeducted !== undefined ? run.modulesDeducted : run.modules);
    const restoredEnkephalin = (get().inventory.enkephalin || 0) + (run.enkephalinDeducted || 0);

    set((s) => ({
      inventory: { 
        ...s.inventory, 
        modules: restoredModules,
        enkephalin: restoredEnkephalin
      },
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

  openCratesForSinner: (sinnerId, cratesUsed, shardsGained, customLabel, linkedRunId, crateType = 'nominable') => {
    const state = get();
    const actualCrates = Math.max(0, parseInt(cratesUsed) || 0);
    const actualShards = parseInt(shardsGained) || 0;
    if (actualShards <= 0 && actualCrates <= 0) return null;

    const sinnerObj = sinnersData.find(s => 
      s.id.toLowerCase() === String(sinnerId).toLowerCase() ||
      s.name.toLowerCase() === String(sinnerId).toLowerCase() ||
      normalizeSinnerId(s.id) === normalizeSinnerId(sinnerId)
    ) || { id: sinnerId, name: sinnerId };

    const currentOwned = getOwnedShards(state.inventory.shards, sinnerObj.id);
    const newShards = Math.max(0, currentOwned + actualShards);

    const isRandom = crateType === 'random';
    const record = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isConversion: true,
      crateType: crateType,
      sinnerId: sinnerObj.id,
      sinnerName: sinnerObj.name,
      cratesUsed: actualCrates,
      amount: actualShards,
      linkedRunId: linkedRunId || null,
      label: customLabel || `Opened ${actualCrates} ${isRandom ? 'Random ' : 'Choice '}Crates ➔ +${actualShards} ${sinnerObj.name} Shards`,
      timestamp: Date.now()
    };

    const newLogged = [...(state.scheduleState.todayLoggedShards || []), record];

    // Deduct from inventory crate count if tracked, without dropping below 0
    const prop = isRandom ? 'randomCrates' : 'nominableCrates';
    const currentCrates = state.inventory[prop] || 0;

    set((s) => ({
      inventory: {
        ...s.inventory,
        [prop]: Math.max(0, currentCrates - actualCrates),
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

  resetWeeklyCalendar: () => {
    const currentWeekly = get().weeklyProgress || {};
    const cycleInfo = getLimbusCycleInfo();
    set({
      weeklyProgress: {
        ...currentWeekly,
        dailyStatus: {},
        lastCheckedCycle: cycleInfo.cycleKey
      }
    });
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
  },

  toggleDailyMissionStep: (step, customModuleCost = null) => {
    const state = get();
    const currentSteps = state.scheduleState.dailyMissionSteps || {
      1: (state.scheduleState.dailiesProgress || 0) >= 1,
      2: (state.scheduleState.dailiesProgress || 0) >= 2,
      3: (state.scheduleState.dailiesProgress || 0) >= 3,
      4: (state.scheduleState.dailiesProgress || 0) >= 4,
      5: (state.scheduleState.dailiesProgress || 0) >= 5,
    };
    const currentDeductions = state.scheduleState.dailyMissionDeductions || {};
    const isCurrentlyDone = !!currentSteps[step];
    const willBeDone = !isCurrentlyDone;

    const newSteps = { ...currentSteps, [step]: willBeDone };
    const newProgress = Object.keys(newSteps).filter(k => newSteps[k]).length;
    const isAllDone = newProgress >= 5;

    let newInventory = { ...state.inventory };
    let newDeductions = { ...currentDeductions };

    // Step 1: Assemble 1 Enkephalin Module (20 Enk -> +1 Module)
    if (step === 1) {
      const curModules = newInventory.modules || 0;
      const curEnk = newInventory.enkephalin !== undefined ? newInventory.enkephalin : (newInventory.maxEnkephalin || 119);
      if (willBeDone) {
        const enkDeducted = Math.min(curEnk, 20);
        newInventory = {
          ...newInventory,
          modules: curModules + 1,
          enkephalin: Math.max(0, curEnk - enkDeducted),
          enkephalinLastSynced: enkDeducted > 0 ? Date.now() : newInventory.enkephalinLastSynced
        };
        newDeductions[step] = { modulesAdded: 1, enkephalin: enkDeducted };
      } else {
        const prevDeduction = currentDeductions[step] || { modulesAdded: 1, enkephalin: 20 };
        newInventory = {
          ...newInventory,
          modules: Math.max(0, curModules - (prevDeduction.modulesAdded || 1)),
          enkephalin: curEnk + (prevDeduction.enkephalin || 0)
        };
        delete newDeductions[step];
      }
    }

    // Steps 4 and 5 are EXP and Thread Luxcavations.
    // Thread Luxcavation (step 5) is always 2 Modules (40 Enk).
    // EXP Luxcavation (step 4) is 2 or 3 Modules (40 or 60 Enk) depending on Canto tier.
    if (step === 4 || step === 5) {
      const defaultExpCost = (state.bpState?.canto !== undefined && state.bpState.canto < 4) ? 2 : 3;
      const configuredCost = step === 5 ? 2 : (customModuleCost || state.scheduleState.expLuxModules || defaultExpCost);
      const requiredModules = Math.max(1, configuredCost);

      if (willBeDone) {
        const curModules = newInventory.modules || 0;
        const curEnk = newInventory.enkephalin !== undefined ? newInventory.enkephalin : (newInventory.maxEnkephalin || 119);
        let modDeducted = 0;
        let enkDeducted = 0;

        if (curModules >= requiredModules) {
          modDeducted = requiredModules;
        } else {
          modDeducted = curModules;
          const remainingMod = requiredModules - curModules;
          enkDeducted = Math.min(curEnk, remainingMod * 20);
        }

        newInventory = {
          ...newInventory,
          modules: Math.max(0, curModules - modDeducted),
          enkephalin: Math.max(0, curEnk - enkDeducted),
          enkephalinLastSynced: enkDeducted > 0 ? Date.now() : newInventory.enkephalinLastSynced
        };
        newDeductions[step] = { modules: modDeducted, enkephalin: enkDeducted, targetModules: requiredModules };
      } else {
        const prevDeduction = currentDeductions[step] || { modules: requiredModules, enkephalin: 0 };
        const curModules = newInventory.modules || 0;
        const curEnk = newInventory.enkephalin !== undefined ? newInventory.enkephalin : (newInventory.maxEnkephalin || 119);

        newInventory = {
          ...newInventory,
          modules: curModules + (prevDeduction.modules || 0),
          enkephalin: curEnk + (prevDeduction.enkephalin || 0)
        };
        delete newDeductions[step];
      }
    }

    set({
      inventory: newInventory,
      scheduleState: {
        ...state.scheduleState,
        dailyMissionSteps: newSteps,
        dailyMissionDeductions: newDeductions,
        dailiesProgress: newProgress,
        dailiesDone: isAllDone
      }
    });

    get().injectBpExp(willBeDone ? 2 : -2);

    const cycleInfo = getLimbusCycleInfo();
    const currentWeekly = get().weeklyProgress || {};
    const updatedStatus = { ...(currentWeekly.dailyStatus || {}) };
    updatedStatus[cycleInfo.cycleKey] = isAllDone ? 'done' : 'pending';
    get().updateWeekly({ ...currentWeekly, dailyStatus: updatedStatus });

    get().saveStore();
    return { willBeDone, newProgress, isAllDone };
  },

  setAllDailyMissions: (completeAll = true) => {
    const steps = [1, 2, 3, 4, 5];
    steps.forEach(step => {
      const currentSteps = get().scheduleState.dailyMissionSteps || {};
      const isDone = !!currentSteps[step];
      if (completeAll && !isDone) {
        get().toggleDailyMissionStep(step);
      } else if (!completeAll && isDone) {
        get().toggleDailyMissionStep(step);
      }
    });
  },

  toggleWeeklyMissionStep: (step) => {
    const state = get();
    const currentSteps = state.scheduleState.weeklyMissionSteps || {
      1: false, 2: false, 3: false, 4: false, 5: false
    };
    const isCurrentlyDone = !!currentSteps[step];
    const willBeDone = !isCurrentlyDone;

    const newSteps = { ...currentSteps, [step]: willBeDone };
    const newProgress = Object.keys(newSteps).filter(k => newSteps[k]).length;
    const isAllDone = newProgress >= 5;

    set({
      scheduleState: {
        ...state.scheduleState,
        weeklyMissionSteps: newSteps,
        weekliesProgress: newProgress,
        weekliesDone: isAllDone,
        canClaimWeeklies: isAllDone
      }
    });

    get().injectBpExp(willBeDone ? 4 : -4);
    get().saveStore();
    return { willBeDone, newProgress, isAllDone };
  },

  setAllWeeklyMissions: (completeAll = true) => {
    const steps = [1, 2, 3, 4, 5];
    steps.forEach(step => {
      const currentSteps = get().scheduleState.weeklyMissionSteps || {};
      const isDone = !!currentSteps[step];
      if (completeAll && !isDone) {
        get().toggleWeeklyMissionStep(step);
      } else if (!completeAll && isDone) {
        get().toggleWeeklyMissionStep(step);
      }
    });
  },

  updateManagerProfile: (updates) => {
    set((state) => ({
      managerProfile: { ...state.managerProfile, ...updates }
    }));
    get().saveStore();
  },

  updateAppSettings: (updates) => {
    set((state) => ({
      appSettings: { ...state.appSettings, ...updates }
    }));
    get().saveStore();
  },

  markDossierDiscovered: (dossierId) => {
    if (!dossierId) return;
    const current = get().managerProfile?.discoveredDossiers || [];
    if (!current.includes(dossierId)) {
      set((state) => ({
        managerProfile: {
          ...state.managerProfile,
          discoveredDossiers: [...current, dossierId]
        }
      }));
      get().saveStore();
    }
  },

  exportBackupJson: () => {
    const state = get();
    const backup = {
      version: '1.0.70',
      exportedAt: new Date().toISOString(),
      onboardingCompleted: state.onboardingCompleted,
      tutorialCompleted: state.tutorialCompleted,
      acquiredIds: Array.from(state.acquiredIds || []),
      acquiredEgos: Array.from(state.acquiredEgos || []),
      wantList: Array.from(state.wantList || []),
      shardCounts: state.shardCounts,
      weeklyProgress: state.weeklyProgress,
      weeklyArchive: state.weeklyArchive || [],
      customMetadata: state.customMetadata,
      inventory: state.inventory,
      bpState: state.bpState,
      scheduleState: state.scheduleState,
      managerProfile: state.managerProfile,
      appSettings: state.appSettings
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return { success: false, error: 'Invalid JSON file format' };

      set({
        onboardingCompleted: data.onboardingCompleted ?? true,
        tutorialCompleted: data.tutorialCompleted ?? true,
        acquiredIds: new Set(data.acquiredIds || []),
        acquiredEgos: new Set(data.acquiredEgos || []),
        wantList: new Set(data.wantList || []),
        shardCounts: data.shardCounts || {},
        weeklyProgress: data.weeklyProgress || defaultState.weeklyProgress,
        weeklyArchive: data.weeklyArchive || [],
        customMetadata: data.customMetadata || {},
        inventory: { ...defaultState.inventory, ...(data.inventory || {}) },
        bpState: { ...defaultState.bpState, ...(data.bpState || {}) },
        scheduleState: { ...defaultState.scheduleState, ...(data.scheduleState || {}) },
        managerProfile: { ...defaultState.managerProfile, ...(data.managerProfile || {}) },
        appSettings: { ...defaultState.appSettings, ...(data.appSettings || {}) }
      });
      get().saveStore();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}));
