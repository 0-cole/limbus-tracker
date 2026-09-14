import { supabase } from './supabaseClient';
import { useStore } from '../stores/useStore';
import { getLimbusCycleInfo } from '../utils/timeUtils.js';

let syncTimeout = null;
let autoInterval = null;
let isSyncing = false;
let isHydrating = false;
let lastLocalEdit = 0;
let lastCloudSync = 0;
let syncListeners = new Set();
let currentSyncStatus = { status: 'idle', message: '', error: null, lastSyncedAt: null };

function emitStatus(status, message = '', error = null) {
  currentSyncStatus = {
    status, // 'idle' | 'syncing' | 'synced' | 'error'
    message,
    error,
    lastSyncedAt: status === 'synced' ? Date.now() : currentSyncStatus.lastSyncedAt
  };
  syncListeners.forEach(listener => listener(currentSyncStatus));
}

export const syncEngine = {
  getSyncStatus: () => currentSyncStatus,

  setHydrating: (val) => {
    isHydrating = !!val;
  },

  isHydrating: () => isHydrating,

  markSynced: (timestamp = Date.now()) => {
    lastCloudSync = timestamp;
    lastLocalEdit = timestamp;
    emitStatus('synced', 'Cloud Synced');
  },

  fetchCloudSave: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_saves')
        .select('save_data, updated_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) return null;
      return data;
    } catch (e) {
      console.warn('Failed to fetch cloud save:', e);
      return null;
    }
  },

  onSyncStatusChange: (callback) => {
    syncListeners.add(callback);
    callback(currentSyncStatus);
    return () => syncListeners.delete(callback);
  },

  getUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      return user;
    } catch (e) {
      console.warn('Failed to get user session:', e);
      return null;
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    emitStatus('idle', 'Logged out');
    if (error) throw error;
  },

  resetPasswordForEmail: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return data;
  },

  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  notifyLocalEdit: () => {
    lastLocalEdit = Date.now();
  },

  pushSaveToCloud: async () => {
    if (isSyncing) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const store = useStore.getState();
      if (!store.isLoaded) return;

      isSyncing = true;
      emitStatus('syncing', 'Syncing data to cloud...');

      const now = Date.now();
      const payload = {
        onboardingCompleted: store.onboardingCompleted,
        tutorialCompleted: store.tutorialCompleted,
        acquiredIds: Array.from(store.acquiredIds || []),
        acquiredEgos: Array.from(store.acquiredEgos || []),
        wantList: Array.from(store.wantList || []),
        shardCounts: store.shardCounts || {},
        weeklyProgress: store.weeklyProgress,
        weeklyArchive: store.weeklyArchive || [],
        customMetadata: store.customMetadata || {},
        inventory: store.inventory,
        bpState: store.bpState,
        scheduleState: store.scheduleState,
        managerProfile: store.managerProfile,
        appSettings: store.appSettings,
        lastUpdated: now
      };

      const { error } = await supabase
        .from('user_saves')
        .upsert({
          id: user.id,
          save_data: payload,
          updated_at: new Date(now).toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing save to cloud:', error);
        emitStatus('error', 'Auto-Sync Failed.', error.message);
      } else {
        lastCloudSync = now;
        emitStatus('synced', 'Cloud Synced');
      }
    } catch (err) {
      console.error('Exception during cloud sync push:', err);
      emitStatus('error', 'Auto-Sync Failed.', err.message);
    } finally {
      isSyncing = false;
    }
  },

  // Pull save from cloud (forcePull bypasses timestamp check for manual clicks or initial app loads)
  pullSaveFromCloud: async (forcePull = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, reason: 'not_logged_in' };

      emitStatus('syncing', 'Checking for cloud updates...');

      const { data, error } = await supabase
        .from('user_saves')
        .select('save_data, updated_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cloud save:', error);
        emitStatus('error', 'Auto-Sync Failed.', error.message);
        return { success: false, reason: error.message };
      }

      if (data && data.save_data) {
        const cloudData = data.save_data;
        const cloudLastUpdated = cloudData.lastUpdated || (data.updated_at ? new Date(data.updated_at).getTime() : 0);

        if (!forcePull) {
          // Only abort pull if the user made a real local edit AFTER the last cloud sync
          if (lastLocalEdit > lastCloudSync && lastLocalEdit > cloudLastUpdated) {
            emitStatus('synced', 'Local data is up to date');
            return { success: false, reason: 'local_newer' };
          }
          if (lastCloudSync >= cloudLastUpdated) {
            emitStatus('synced', 'Cloud Synced');
            return { success: false, reason: 'already_synced' };
          }
        }

        const store = useStore.getState();
        const localSched = store.scheduleState || {};
        const cloudSched = cloudData.scheduleState || {};

        const cycleInfo = getLimbusCycleInfo();
        const activeCycleStart = cycleInfo.cycleStartMs;

        // Merge today's logged runs & shards without duplicates, strictly filtering by current active cycle
        const runsMap = new Map();
        (localSched.todayLoggedRuns || []).filter(r => (r.timestamp || 0) >= activeCycleStart).forEach(r => runsMap.set(r.id, r));
        (cloudSched.todayLoggedRuns || []).filter(r => (r.timestamp || 0) >= activeCycleStart).forEach(r => runsMap.set(r.id, r));

        const shardsMap = new Map();
        (localSched.todayLoggedShards || []).filter(s => (s.timestamp || 0) >= activeCycleStart).forEach(s => shardsMap.set(s.id, s));
        (cloudSched.todayLoggedShards || []).filter(s => (s.timestamp || 0) >= activeCycleStart).forEach(s => shardsMap.set(s.id, s));

        const mergedSchedule = {
          ...localSched,
          ...cloudSched,
          todayLoggedRuns: Array.from(runsMap.values()),
          todayLoggedShards: Array.from(shardsMap.values())
        };

        useStore.setState({
          onboardingCompleted: cloudData.onboardingCompleted ?? store.onboardingCompleted,
          tutorialCompleted: cloudData.tutorialCompleted ?? store.tutorialCompleted,
          acquiredIds: new Set(cloudData.acquiredIds || []),
          acquiredEgos: new Set(cloudData.acquiredEgos || []),
          wantList: new Set(cloudData.wantList || []),
          shardCounts: cloudData.shardCounts || {},
          weeklyProgress: cloudData.weeklyProgress || store.weeklyProgress,
          weeklyArchive: cloudData.weeklyArchive || store.weeklyArchive,
          customMetadata: cloudData.customMetadata || store.customMetadata,
          inventory: { ...store.inventory, ...(cloudData.inventory || {}) },
          bpState: { ...store.bpState, ...(cloudData.bpState || {}) },
          scheduleState: mergedSchedule,
          managerProfile: { ...(store.managerProfile || {}), ...(cloudData.managerProfile || {}) },
          appSettings: { ...(store.appSettings || {}), ...(cloudData.appSettings || {}) }
        });

        if (window.electronAPI) {
          const toSave = {
            ...cloudData,
            acquiredIds: cloudData.acquiredIds || [],
            acquiredEgos: cloudData.acquiredEgos || [],
            wantList: cloudData.wantList || [],
            scheduleState: mergedSchedule,
            managerProfile: { ...(store.managerProfile || {}), ...(cloudData.managerProfile || {}) },
            appSettings: { ...(store.appSettings || {}), ...(cloudData.appSettings || {}) },
            lastUpdated: cloudLastUpdated
          };
          await window.electronAPI.saveData(toSave);
        } else {
          localStorage.setItem('limbus-tracker-data', JSON.stringify({ 
            ...cloudData, 
            scheduleState: mergedSchedule, 
            managerProfile: { ...(store.managerProfile || {}), ...(cloudData.managerProfile || {}) },
            appSettings: { ...(store.appSettings || {}), ...(cloudData.appSettings || {}) },
            lastUpdated: cloudLastUpdated 
          }));
        }

        lastCloudSync = cloudLastUpdated;
        lastLocalEdit = cloudLastUpdated;
        emitStatus('synced', 'Cloud Synced');
        return { success: true, reason: 'pulled' };
      } else {
        await syncEngine.pushSaveToCloud();
        return { success: true, reason: 'first_upload' };
      }
    } catch (err) {
      console.error('Failed to pull save from cloud:', err);
      emitStatus('error', 'Auto-Sync Failed.', err.message);
      return { success: false, reason: err.message };
    }
  },

  queuePush: () => {
    if (isHydrating) return;
    syncEngine.notifyLocalEdit();
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      if (!isHydrating) {
        syncEngine.pushSaveToCloud();
      }
    }, 1500);
  },

  pushLocalToCloud: async () => {
    try {
      await syncEngine.pushSaveToCloud();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  pullCloudToLocal: async () => {
    try {
      const res = await syncEngine.pullSaveFromCloud(true);
      return !!res?.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  start15sInterval: () => {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(async () => {
      const user = await syncEngine.getUser();
      if (!user) return;
      if (lastLocalEdit > lastCloudSync) {
        await syncEngine.pushSaveToCloud();
      } else {
        await syncEngine.pullSaveFromCloud(false);
      }
    }, 15000);
  }
};

syncEngine.start15sInterval();