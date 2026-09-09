import { create } from 'zustand';
import baseIdentities from '../data/identities.json';
import baseEgos from '../data/egos.json';
import personalPreset from '../data/personalPreset.json';
import { checkResets } from '../utils/timeUtils.js';

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
    hasMdHard: true,
    daysLeft: 45 // Default
  },
  
  scheduleState: {
    mode: 'general', // 'general' | 'targeted'
    dailiesDone: false, // Legacy
    dailiesProgress: 0,
    weekliesDone: false,
    canClaimWeeklies: false,
    mdTodayDone: false,
    mdBonusesClaimed: 0, // 0 to 3
    lastResetCheck: Date.now() // Used to determine if a daily/weekly reset has passed
  },

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
      let data;
      let dynamicData = { identities: [], egos: [] };
      
      if (window.electronAPI) {
        data = await window.electronAPI.loadData();
        dynamicData = await window.electronAPI.loadDynamicData();
      } else {
        const local = localStorage.getItem('limbus-tracker-data');
        if (local) data = JSON.parse(local);
      }

      const mergedIdsMap = new Map();
      baseIdentities.forEach(id => mergedIdsMap.set(id.name, id));
      (dynamicData.identities || []).forEach(id => mergedIdsMap.set(id.name, id));
      const mergedIds = Array.from(mergedIdsMap.values());

      const mergedEgosMap = new Map();
      baseEgos.forEach(ego => mergedEgosMap.set(ego.name, ego));
      (dynamicData.egos || []).forEach(ego => mergedEgosMap.set(ego.name, ego));
      const mergedEgos = Array.from(mergedEgosMap.values());

      if (data && Object.keys(data).length > 0) {
        let loadedSchedule = { ...defaultState.scheduleState, ...(data.scheduleState || {}) };
        
        // Check for daily/weekly resets
        const resets = checkResets(loadedSchedule.lastResetCheck);
        if (resets.hasDailyReset) {
            loadedSchedule.dailiesDone = false;
            loadedSchedule.dailiesProgress = 0;
            loadedSchedule.mdTodayDone = false;
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
          shardCounts: data.shardCounts || {},
          weeklyProgress: data.weeklyProgress || defaultState.weeklyProgress,
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

      // Start background timer to check resets while app is running
      setInterval(() => {
        const currentSchedule = get().scheduleState;
        const intervalResets = checkResets(currentSchedule.lastResetCheck);
        if (intervalResets.hasDailyReset || intervalResets.hasWeeklyReset || intervalResets.hasMdWeeklyReset) {
          get().updateScheduleState({
            ...(intervalResets.hasDailyReset ? { dailiesDone: false, dailiesProgress: 0, mdTodayDone: false } : {}),
            ...(intervalResets.hasWeeklyReset ? { weekliesDone: false, canClaimWeeklies: false } : {}),
            ...(intervalResets.hasMdWeeklyReset ? { mdBonusesClaimed: 0 } : {}),
            lastResetCheck: intervalResets.now
          });
        }
      }, 60000); // Check every minute

    } catch (e) {
      console.error("Store init error:", e);
      set({ isLoaded: true });
    }
  },

  saveStore: async () => {
    if (!get().isLoaded) return;
    const state = get();
    const dataToSave = {
      onboardingCompleted: state.onboardingCompleted,
      tutorialCompleted: state.tutorialCompleted,
      acquiredIds: Array.from(state.acquiredIds),
      acquiredEgos: Array.from(state.acquiredEgos),
      wantList: Array.from(state.wantList),
      shardCounts: state.shardCounts,
      weeklyProgress: state.weeklyProgress,
      customMetadata: state.customMetadata,
      inventory: state.inventory,
      bpState: state.bpState,
      scheduleState: state.scheduleState,
    };
    if (window.electronAPI) {
      await window.electronAPI.saveData(dataToSave);
    } else {
      localStorage.setItem('limbus-tracker-data', JSON.stringify(dataToSave));
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
    set((state) => {
      let newLevel = state.bpState.level;
      let newExp = state.bpState.currentExp + amount;

      while (newExp >= 10) {
        newLevel++;
        newExp -= 10;
      }
      while (newExp < 0 && newLevel > 1) {
        newLevel--;
        newExp += 10;
      }
      if (newExp < 0) newExp = 0;

      return {
        bpState: { ...state.bpState, level: newLevel, currentExp: newExp }
      };
    });
    get().saveStore();
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
}));
