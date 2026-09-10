import { supabase } from './supabaseClient';
import { useStore } from '../stores/useStore';

let syncTimeout = null;
let isSyncing = false;

export const syncEngine = {
  // Get current auth user
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

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Auth operations
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
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
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  // Push local save to cloud
  pushSaveToCloud: async () => {
    if (isSyncing) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Not signed in, no cloud sync needed

      const store = useStore.getState();
      if (!store.isLoaded) return;

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
        lastUpdated: Date.now()
      };

      isSyncing = true;
      const { error } = await supabase
        .from('user_saves')
        .upsert({
          id: user.id,
          save_data: payload,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error syncing save to cloud:', error);
      }
    } catch (err) {
      console.error('Exception during cloud sync push:', err);
    } finally {
      isSyncing = false;
    }
  },

  // Pull save from cloud
  pullSaveFromCloud: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_saves')
        .select('save_data, updated_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cloud save:', error);
        return false;
      }

      if (data && data.save_data) {
        const cloudData = data.save_data;
        const store = useStore.getState();

        // If local data exists, compare timestamps if available
        const localLastUpdated = store.scheduleState?.lastResetCheck || 0;
        const cloudLastUpdated = cloudData.lastUpdated || (data.updated_at ? new Date(data.updated_at).getTime() : 0);

        // Load into local store
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
          scheduleState: { ...store.scheduleState, ...(cloudData.scheduleState || {}) }
        });

        // Persist locally too (electron file or localStorage)
        if (window.electronAPI) {
          const toSave = {
            ...cloudData,
            acquiredIds: cloudData.acquiredIds || [],
            acquiredEgos: cloudData.acquiredEgos || [],
            wantList: cloudData.wantList || []
          };
          await window.electronAPI.saveData(toSave);
        } else {
          localStorage.setItem('limbus-tracker-data', JSON.stringify(cloudData));
        }

        return true;
      } else {
        // First time cloud user! Upload current local save to cloud
        await syncEngine.pushSaveToCloud();
        return true;
      }
    } catch (err) {
      console.error('Failed to pull save from cloud:', err);
      return false;
    }
  },

  // Debounced auto-push for useStore changes
  queuePush: () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncEngine.pushSaveToCloud();
    }, 1800); // 1.8s debounce
  }
};
