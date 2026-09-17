import { supabase } from './supabaseClient';
import { useStore } from '../stores/useStore';
import { getLimbusCycleInfo } from '../utils/timeUtils.js';

export function getLocalDeviceId() {
  try {
    let id = localStorage.getItem('limbus_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('limbus_device_id', id);
    }
    return id;
  } catch (e) {
    return 'dev_default';
  }
}

export function getLocalDeviceName() {
  try {
    let name = localStorage.getItem('limbus_device_name');
    if (!name) {
      const isWindows = /Windows/i.test(navigator.userAgent || '');
      const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent || '');
      const os = isWindows ? 'Computer (Windows)' : isMac ? 'Mac' : 'Device';
      name = `${os} [${getLocalDeviceId().substring(4, 8)}]`;
      localStorage.setItem('limbus_device_name', name);
    }
    return name;
  } catch (e) {
    return 'Primary Device';
  }
}

export function setLocalDeviceName(name) {
  try {
    localStorage.setItem('limbus_device_name', name);
  } catch (e) {}
}

let syncTimeout = null;
let autoInterval = null;
let isSyncing = false;
let isHydrating = false;
let lastLocalUserEdit = 0;
let lastCloudSync = 0;
let lastConflictResolvedAt = 0;
let activeConflictState = null;
let realtimeChannel = null;

let syncListeners = new Set();
let conflictListeners = new Set();
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

function setConflictState(conflict) {
  activeConflictState = conflict;
  conflictListeners.forEach(listener => listener(conflict));
}

function ensureRealtimeChannel(userId) {
  if (realtimeChannel || !userId) return;
  try {
    realtimeChannel = supabase.channel(`user_sync_${userId}`, {
      config: { broadcast: { self: false } }
    });

    realtimeChannel
      .on('broadcast', { event: 'conflict_detected' }, ({ payload }) => {
        if (payload) {
          setConflictState(payload);
        }
      })
      .on('broadcast', { event: 'conflict_resolved' }, async ({ payload }) => {
        setConflictState(null);
        if (payload?.resolvedAt) {
          lastConflictResolvedAt = payload.resolvedAt;
        }
        await syncEngine.pullSaveFromCloud(true);
      })
      .on('broadcast', { event: 'data_updated' }, async () => {
        if (!activeConflictState) {
          await syncEngine.pullSaveFromCloud(false);
        }
      })
      .subscribe();
  } catch (e) {
    console.warn('Realtime sync channel setup warning:', e);
  }
}

export const syncEngine = {
  getSyncStatus: () => currentSyncStatus,
  getActiveConflict: () => activeConflictState,

  onConflictChange: (callback) => {
    conflictListeners.add(callback);
    callback(activeConflictState);
    return () => conflictListeners.delete(callback);
  },

  setHydrating: (val) => {
    isHydrating = !!val;
  },

  isHydrating: () => isHydrating,

  markSynced: (timestamp = Date.now()) => {
    lastCloudSync = timestamp;
    lastLocalUserEdit = timestamp;
    emitStatus('synced', 'Cloud Synced');
  },

  fetchCloudSave: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      ensureRealtimeChannel(user.id);

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
      if (user) ensureRealtimeChannel(user.id);
      return user;
    } catch (e) {
      console.warn('Failed to get user session:', e);
      return null;
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        ensureRealtimeChannel(session.user.id);
      }
      callback(event, session);
    });
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) ensureRealtimeChannel(data.user.id);
    return data;
  },

  signOut: async () => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }
    const { error } = await supabase.auth.signOut();
    emitStatus('idle', 'Logged out');
    setConflictState(null);
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
    lastLocalUserEdit = Date.now();
  },

  pushSaveToCloud: async () => {
    if (isSyncing || activeConflictState) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      ensureRealtimeChannel(user.id);

      const store = useStore.getState();
      if (!store.isLoaded) return;

      isSyncing = true;
      emitStatus('syncing', 'Syncing data to cloud...');

      const now = Date.now();
      const localId = getLocalDeviceId();
      const localName = getLocalDeviceName();

      const payload = {
        deviceId: localId,
        deviceName: localName,
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
        activeConflict: null,
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
        lastLocalUserEdit = now;
        emitStatus('synced', 'Cloud Synced');

        // Broadcast to other open devices so they immediately update
        if (realtimeChannel) {
          realtimeChannel.send({
            type: 'broadcast',
            event: 'data_updated',
            payload: { deviceId: localId, lastUpdated: now }
          });
        }
      }
    } catch (err) {
      console.error('Exception during cloud sync push:', err);
      emitStatus('error', 'Auto-Sync Failed.', err.message);
    } finally {
      isSyncing = false;
    }
  },

  // Pull save from cloud with multi-device divergence & conflict detection
  pullSaveFromCloud: async (forcePull = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, reason: 'not_logged_in' };
      ensureRealtimeChannel(user.id);

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
        const localId = getLocalDeviceId();

        // 1. If cloud data has an existing resolution that this client hasn't processed yet:
        if (cloudData.conflictResolution && cloudData.conflictResolution.resolvedAt > lastConflictResolvedAt) {
          lastConflictResolvedAt = cloudData.conflictResolution.resolvedAt;
          setConflictState(null);
        }

        // 2. If cloud has an active conflict being reviewed:
        if (cloudData.activeConflict) {
          setConflictState(cloudData.activeConflict);
          emitStatus('syncing', 'Sync Conflict Detected — Awaiting Selection');
          return { success: false, reason: 'conflict_active' };
        }

        const store = useStore.getState();
        const localSched = store.scheduleState || {};
        const cloudSched = cloudData.scheduleState || {};
        const localBp = store.bpState || {};
        const cloudBp = cloudData.bpState || {};

        // 3. Multi-device Conflict Detection:
        // If save came from another device, and both devices have divergent user progress/settings:
        const isFromOtherDevice = cloudData.deviceId && cloudData.deviceId !== localId;
        const hasDivergentPace = (localBp.paceMode || 'relaxed') !== (cloudBp.paceMode || 'relaxed');
        const hasDivergentDailies = (localSched.dailiesProgress || 0) !== (cloudSched.dailiesProgress || 0) ||
          JSON.stringify(localSched.dailyMissionSteps || {}) !== JSON.stringify(cloudSched.dailyMissionSteps || {});
        const hasDivergentBp = (localBp.level || 1) !== (cloudBp.level || 1) || (localBp.currentExp || 0) !== (cloudBp.currentExp || 0);

        const hasSubstantialDivergence = hasDivergentPace || hasDivergentDailies || hasDivergentBp;

        // If another device updated the cloud, AND this device made real local edits since last sync, OR settings diverged:
        if (!forcePull && isFromOtherDevice && hasSubstantialDivergence && lastLocalUserEdit > lastCloudSync) {
          const conflictObj = {
            localDevice: {
              deviceId: localId,
              deviceName: getLocalDeviceName(),
              lastUpdated: lastLocalUserEdit || Date.now(),
              paceMode: localBp.paceMode || 'relaxed',
              dailiesDone: localSched.dailiesProgress || 0,
              bpLevel: localBp.level || 1,
              bpExp: localBp.currentExp || 0,
            },
            remoteDevice: {
              deviceId: cloudData.deviceId,
              deviceName: cloudData.deviceName || 'Other Device',
              lastUpdated: cloudLastUpdated,
              paceMode: cloudBp.paceMode || 'relaxed',
              dailiesDone: cloudSched.dailiesProgress || 0,
              bpLevel: cloudBp.level || 1,
              bpExp: cloudBp.currentExp || 0,
            },
            detectedAt: Date.now()
          };

          setConflictState(conflictObj);

          // Broadcast to the other device so the modal opens on both screens simultaneously
          if (realtimeChannel) {
            realtimeChannel.send({
              type: 'broadcast',
              event: 'conflict_detected',
              payload: conflictObj
            });
          }

          // Persist conflict flag in cloud
          await supabase.from('user_saves').upsert({
            id: user.id,
            save_data: { ...cloudData, activeConflict: conflictObj },
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

          emitStatus('syncing', 'Sync Conflict Detected — Action Required');
          return { success: false, reason: 'conflict_raised' };
        }

        if (!forcePull) {
          if (lastLocalUserEdit > lastCloudSync && lastLocalUserEdit > cloudLastUpdated) {
            emitStatus('synced', 'Local data is up to date');
            return { success: false, reason: 'local_newer' };
          }
          if (lastCloudSync >= cloudLastUpdated) {
            emitStatus('synced', 'Cloud Synced');
            return { success: false, reason: 'already_synced' };
          }
        }

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
        lastLocalUserEdit = cloudLastUpdated;
        setConflictState(null);
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

  // Resolve an active conflict: chosenDeviceId becomes the authoritative save across both devices
  resolveConflict: async (chosenDeviceId) => {
    try {
      const localId = getLocalDeviceId();
      const now = Date.now();
      lastConflictResolvedAt = now;

      if (chosenDeviceId === localId) {
        // 1. This local device was chosen: push local data to cloud as authoritative
        const store = useStore.getState();
        const payload = {
          deviceId: localId,
          deviceName: getLocalDeviceName(),
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
          activeConflict: null,
          conflictResolution: {
            resolvedByDeviceId: localId,
            chosenDeviceId: localId,
            resolvedAt: now
          },
          lastUpdated: now
        };

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_saves').upsert({
            id: user.id,
            save_data: payload,
            updated_at: new Date(now).toISOString()
          }, { onConflict: 'id' });

          if (realtimeChannel) {
            realtimeChannel.send({
              type: 'broadcast',
              event: 'conflict_resolved',
              payload: { chosenDeviceId, resolvedAt: now }
            });
          }
        }

        lastCloudSync = now;
        lastLocalUserEdit = now;
        setConflictState(null);
        emitStatus('synced', 'Cloud Synced (Conflict Resolved)');
      } else {
        // 2. The other device was chosen: pull authoritative save from cloud immediately
        const { data: { user } } = await supabase.auth.getUser();
        if (user && realtimeChannel) {
          realtimeChannel.send({
            type: 'broadcast',
            event: 'conflict_resolved',
            payload: { chosenDeviceId, resolvedAt: now }
          });
        }
        setConflictState(null);
        await syncEngine.pullSaveFromCloud(true);
      }
    } catch (e) {
      console.error('Error resolving conflict:', e);
      throw e;
    }
  },

  queuePush: () => {
    if (isHydrating || activeConflictState) return;
    syncEngine.notifyLocalEdit();
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      if (!isHydrating && !activeConflictState) {
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
      if (activeConflictState) {
        // Fast-poll cloud save to see if the conflict was resolved on the other device
        await syncEngine.pullSaveFromCloud(false);
      } else if (lastLocalUserEdit > lastCloudSync) {
        await syncEngine.pushSaveToCloud();
      } else {
        await syncEngine.pullSaveFromCloud(false);
      }
    }, 10000);
  }
};

syncEngine.start15sInterval();