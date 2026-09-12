import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Volume2,
  Palette,
  Monitor,
  Database,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  Cloud,
  RefreshCw,
  Trash2,
  Sparkles,
  Radio,
  Sliders,
  Bell,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../stores/useStore.js';
import { THEMES } from '../styles/themes.js';
import { playMephiHorn } from '../components/MephistophelesBorderTrack.jsx';
import ManagerAvatar from '../components/ManagerAvatar.jsx';
import sinnersData from '../data/sinners.json';
import { SPECIAL_EASTER_EGGS } from '../data/specialEasterEggs.js';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';
import vergiliusImg from '../assets/vergilius.png';
import mephistophelesImg from '../assets/mephistopheles.png';
import { syncEngine } from '../services/syncEngine.js';
import AuthModal from '../components/AuthModal.jsx';

const ALL_RADIO_CHARACTERS = [
  { id: 'yi-sang', name: 'Yi Sang', color: '#4a90d9' },
  { id: 'faust', name: 'Faust', color: '#c084fc' },
  { id: 'don-quixote', name: 'Don Quixote', color: '#fbbf24' },
  { id: 'ryoshu', name: 'Ryōshū', color: '#f87171' },
  { id: 'meursault', name: 'Meursault', color: '#a3a3a3' },
  { id: 'hong-lu', name: 'Hong Lu', color: '#34d399' },
  { id: 'heathcliff', name: 'Heathcliff', color: '#fb923c' },
  { id: 'ishmael', name: 'Ishmael', color: '#38bdf8' },
  { id: 'rodion', name: 'Rodion', color: '#f472b6' },
  { id: 'sinclair', name: 'Sinclair', color: '#a78bfa' },
  { id: 'outis', name: 'Outis', color: '#6ee7b7' },
  { id: 'gregor', name: 'Gregor', color: '#fca5a5' },
  { id: 'charon', name: 'Charon', color: '#06b6d4' },
  { id: 'vergilius', name: 'Vergilius', color: '#ef4444' },
  { id: 'kenneth', name: 'Kenneth', color: '#c9a84c' },
];

export default function SettingsPage() {
  const {
    managerProfile,
    updateManagerProfile,
    appSettings,
    updateAppSettings,
    scheduleState,
    updateScheduleState,
    exportBackupJson,
    importBackupJson,
  } = useStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [saveToast, setSaveToast] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeInput, setWipeInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [syncState, setSyncState] = useState(syncEngine.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);

  // Local draft states for live profile editing
  const [callSign, setCallSign] = useState(managerProfile?.callSign || 'Dante');
  const [favoriteSinner, setFavoriteSinner] = useState(managerProfile?.favoriteSinner || 'yi-sang');
  const [avatarType, setAvatarType] = useState(managerProfile?.avatarType || 'sinner');
  const [avatarId, setAvatarId] = useState(managerProfile?.avatarId || 'yi-sang');
  const [avatarZoom, setAvatarZoom] = useState(managerProfile?.avatarZoom || 1.0);
  const [avatarYOffset, setAvatarYOffset] = useState(managerProfile?.avatarYOffset || 0);
  const [avatarXOffset, setAvatarXOffset] = useState(managerProfile?.avatarXOffset || 0);

  // Synchronize auth state
  useEffect(() => {
    syncEngine.getUser().then(setCurrentUser);
    const {
      data: { subscription },
    } = syncEngine.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });
    const unsub = syncEngine.onSyncStatusChange((s) => setSyncState(s));
    return () => {
      subscription?.unsubscribe();
      unsub();
    };
  }, []);

  // Show a momentary confirmation toast
  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    updateManagerProfile({
      callSign: callSign.trim() || 'Dante',
      favoriteSinner,
      avatarType,
      avatarId,
      avatarZoom,
      avatarYOffset,
      avatarXOffset,
    });
    // Immediately push profile to cloud save
    syncEngine.pushSaveToCloud();
    triggerToast('Manager Profile saved & synced to cloud!');
  };

  // Reset Avatar Cropping
  const handleResetCrop = () => {
    setAvatarZoom(1.0);
    setAvatarYOffset(0);
    setAvatarXOffset(0);
    updateManagerProfile({
      avatarZoom: 1.0,
      avatarYOffset: 0,
      avatarXOffset: 0,
    });
    triggerToast('Avatar alignment reset to defaults.');
  };

  // Toggle Sinner in Radio Filter
  const handleToggleRadioSinner = (slug) => {
    const currentFilter = appSettings?.busSinnerFilter || {};
    const nextVal = currentFilter[slug] === false;
    updateAppSettings({
      busSinnerFilter: {
        ...currentFilter,
        [slug]: nextVal,
      },
    });
  };

  const handleSetAllRadio = (enabled) => {
    const newFilter = {};
    ALL_RADIO_CHARACTERS.forEach((c) => {
      newFilter[c.id] = enabled;
    });
    updateAppSettings({ busSinnerFilter: newFilter });
  };

  // Backup file export
  const handleExportBackup = () => {
    try {
      const json = exportBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `LimbusTracker_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('Backup file generated and downloaded!');
    } catch (e) {
      alert(`Export failed: ${e.message}`);
    }
  };

  // Backup file import
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importBackupJson(event.target.result);
      if (res.success) {
        triggerToast('Backup restored successfully! Refreshing view...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(`Failed to import backup: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Manual Force Cloud Push
  const handleForceCloudPush = async () => {
    setIsSyncing(true);
    const ok = await syncEngine.pushLocalToCloud();
    setIsSyncing(false);
    if (ok) triggerToast('Local data successfully pushed to Cloud!');
    else alert('Cloud push failed. Check your network or Supabase session.');
  };

  // Manual Force Cloud Pull
  const handleForceCloudPull = async () => {
    setIsSyncing(true);
    const ok = await syncEngine.pullCloudToLocal();
    setIsSyncing(false);
    if (ok) {
      triggerToast('Cloud data loaded! Reloading...');
      setTimeout(() => window.location.reload(), 800);
    } else {
      alert('Cloud pull failed. No newer cloud data found or unauthenticated.');
    }
  };

  // Full data wipe
  const handleConfirmWipe = async () => {
    if (wipeInput.trim() !== 'WIPE') return;
    if (window.electronAPI) {
      await window.electronAPI.wipeData();
    }
    localStorage.removeItem('limbus-tracker-data');
    localStorage.removeItem('limbus_mephi_border_progress');
    setWipeModalOpen(false);
    window.location.reload();
  };

  // List of discovered dossiers for avatar selection
  const userDossiers = managerProfile?.discoveredDossiers || [];
  const discoveredKeys = [
    ...new Set([
      ...userDossiers,
      ...(managerProfile?.avatarType === 'dossier' && managerProfile?.avatarId ? [managerProfile.avatarId] : [])
    ])
  ];
  const unlockedDossiers = SPECIAL_EASTER_EGGS.filter((egg) => discoveredKeys.includes(egg.id));

  // Current preview profile for interactive cropper
  const livePreviewProfile = {
    callSign,
    favoriteSinner,
    avatarType,
    avatarId,
    avatarZoom,
    avatarYOffset,
    avatarXOffset,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-[#e5e5e5] max-w-6xl mx-auto min-h-full pb-24"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-8 z-50 px-5 py-3 rounded-xl bg-[#0f1d14] border border-emerald-500 text-emerald-300 font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2.5"
          >
            <Check size={18} className="text-emerald-400" />
            {saveToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8a7030] flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(201,168,76,0.3)]">
              ⚙️
            </div>
            <div>
              <h1 className="text-3xl font-black font-limbus text-[#c9a84c] tracking-wide">
                System Calibration Console
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                Executive Manager Preferences & Facility Customization
              </p>
            </div>
          </div>
        </div>

        {/* Quick Save Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">Status: Nominal</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-black/40 p-1.5 rounded-2xl border border-neutral-800">
        {[
          { id: 'profile', label: 'Manager Profile', icon: User, desc: 'Call-sign & Avatar' },
          { id: 'audio', label: 'Mephistopheles & Audio', icon: Volume2, desc: 'Bus Track & Radio' },
          { id: 'display', label: 'Themes & Visuals', icon: Palette, desc: 'Themes & Scanlines' },
          { id: 'desktop', label: 'Desktop Integration', icon: Monitor, desc: 'Tray & Game Hook' },
          { id: 'vault', label: 'Data Vault', icon: Database, desc: 'Backups & Cloud' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[170px] flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs text-left cursor-pointer border ${
                isActive
                  ? 'bg-neutral-900 border-[#c9a84c] text-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.15)]'
                  : 'bg-transparent border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#c9a84c]' : 'text-neutral-500'} />
              <div>
                <div className="font-bold">{tab.label}</div>
                <div className="text-[10px] text-neutral-400 font-normal">{tab.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: MANAGER PROFILE & AVATAR STUDIO
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner Note */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3.5">
            <ShieldAlert size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-relaxed font-mono">
              <span className="text-amber-400 font-bold block mb-0.5 uppercase tracking-wide">
                Containment Protocol Notice
              </span>
              Your custom Call-Sign and Portrait are displayed across your HUD, daily mission logs, and Mephistopheles radio dispatches.
              <span className="text-neutral-400 text-[11px] block mt-1 italic">
                (Note: Certain anomalous telemetry or classified archive transmissions may operate outside standard executive protocol.)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Profile Info Form (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-5">
                <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                  <User size={18} /> Executive Identification
                </h3>

                {/* Call-Sign Field */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                    Manager Call-Sign
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value)}
                    placeholder="e.g. Dante, Faust, Ayin..."
                    className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-[#c9a84c] outline-none transition-colors"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Appears on reports, dispatch manifests, and greeting headers.
                  </p>
                </div>

                {/* Favorite Sinner Co-Pilot */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                    Favorite Sinner Co-Pilot
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {sinnersData.map((s) => {
                      const isFav = favoriteSinner === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFavoriteSinner(s.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isFav
                              ? 'bg-neutral-900 border-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.2)]'
                              : 'bg-black/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold truncate text-white">{s.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              No. {s.number < 10 ? `0${s.number}` : s.number}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#a38330] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Profile Changes
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Avatar Cropping Studio (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                    <Sliders size={18} /> Avatar Cropping & Alignment Studio
                  </h3>
                  <button
                    onClick={handleResetCrop}
                    className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={12} /> Reset Alignment
                  </button>
                </div>

                {/* Studio Preview Canvas */}
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-black/60 p-6 rounded-2xl border border-neutral-800">
                  {/* Circular Avatar Canvas */}
                  <div className="relative flex flex-col items-center">
                    <div className="relative">
                      {/* Live Avatar Preview */}
                      <ManagerAvatar
                        profile={livePreviewProfile}
                        size="3xl"
                        showBorder={true}
                        borderColor="border-[#c9a84c]"
                      />
                      {/* Subtle alignment reticle lines */}
                      <div className="absolute inset-0 rounded-full border border-yellow-400/20 pointer-events-none" />
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-white/10 pointer-events-none" />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-white/10 pointer-events-none" />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono mt-3">
                      Circular HUD Preview (160px)
                    </span>
                  </div>

                  {/* Slider Controls */}
                  <div className="flex-1 w-full space-y-4">
                    {/* Zoom Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-neutral-300 flex items-center gap-1">
                          <ZoomIn size={14} className="text-[#c9a84c]" /> Zoom / Magnification
                        </span>
                        <span className="text-[#c9a84c] font-bold">{avatarZoom.toFixed(2)}x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAvatarZoom((z) => Math.max(1.0, +(z - 0.1).toFixed(2)))}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                        >
                          <ZoomOut size={14} />
                        </button>
                        <input
                          type="range"
                          min="1.0"
                          max="2.5"
                          step="0.05"
                          value={avatarZoom}
                          onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                          className="flex-1 accent-[#c9a84c] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setAvatarZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                        >
                          <ZoomIn size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Vertical Y-Offset Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-neutral-300 flex items-center gap-1">
                          <ArrowUp size={14} className="text-[#c9a84c]" /> Vertical Position (Y-Offset)
                        </span>
                        <span className="text-[#c9a84c] font-bold">{avatarYOffset > 0 ? `+${avatarYOffset}%` : `${avatarYOffset}%`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAvatarYOffset((y) => Math.max(-60, y - 2))}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                          title="Shift Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="1"
                          value={avatarYOffset}
                          onChange={(e) => setAvatarYOffset(parseInt(e.target.value, 10))}
                          className="flex-1 accent-[#c9a84c] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setAvatarYOffset((y) => Math.min(60, y + 2))}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                          title="Shift Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Tip: Fine-tune vertical position to frame faces, fedoras, or emblems cleanly in your circular HUD.
                      </p>
                    </div>

                    {/* Horizontal X-Offset Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-neutral-300 flex items-center gap-1">
                          <ArrowLeft size={14} className="text-[#c9a84c]" /> Horizontal Position (X-Offset)
                        </span>
                        <span className="text-[#c9a84c] font-bold">{avatarXOffset > 0 ? `+${avatarXOffset}%` : `${avatarXOffset}%`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAvatarXOffset((x) => Math.max(-50, x - 2))}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={avatarXOffset}
                          onChange={(e) => setAvatarXOffset(parseInt(e.target.value, 10))}
                          className="flex-1 accent-[#c9a84c] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setAvatarXOffset((x) => Math.min(50, x + 2))}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avatar Roster Selection */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Choose Avatar Source
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {unlockedDossiers.length + 15} Available
                    </span>
                  </div>

                  {/* Standard / Special Roster Grid */}
                  <div className="space-y-4">
                    {/* Standard Sinners & Bus Staff */}
                    <div>
                      <div className="text-[11px] font-mono text-neutral-400 mb-2">
                        Limbus Company Personnel:
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5">
                        {/* Dante Clock */}
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarType('sinner');
                            setAvatarId('dante');
                          }}
                          className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                            avatarType === 'sinner' && avatarId === 'dante'
                              ? 'bg-neutral-900 border-[#c9a84c] shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                              : 'bg-black/40 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <ManagerAvatar profile={{ avatarType: 'sinner', avatarId: 'dante' }} size="sm" showBorder={false} />
                          <span className="text-[10px] text-neutral-300 font-bold mt-1.5 truncate">Dante</span>
                        </button>

                        {/* Vergilius */}
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarType('sinner');
                            setAvatarId('vergilius');
                          }}
                          className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                            avatarType === 'sinner' && avatarId === 'vergilius'
                              ? 'bg-neutral-900 border-[#c9a84c] shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                              : 'bg-black/40 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <ManagerAvatar profile={{ avatarType: 'sinner', avatarId: 'vergilius' }} size="sm" showBorder={false} />
                          <span className="text-[10px] text-neutral-300 font-bold mt-1.5 truncate">Vergilius</span>
                        </button>

                        {/* Sinners 1 to 12 */}
                        {sinnersData.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setAvatarType('sinner');
                              setAvatarId(s.id);
                            }}
                            className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                              avatarType === 'sinner' && avatarId === s.id
                                ? 'bg-neutral-900 border-[#c9a84c] shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                                : 'bg-black/40 border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <ManagerAvatar profile={{ avatarType: 'sinner', avatarId: s.id }} size="sm" showBorder={false} />
                            <span className="text-[10px] text-neutral-300 font-bold mt-1.5 truncate">
                              {s.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                      {/* Discovered Easter Egg Dossiers */}
                    <div>
                      <div className="text-[11px] font-mono text-amber-400 mb-2 flex items-center justify-between">
                        <span>Discovered Classified Dossiers ({unlockedDossiers.length}):</span>
                        <span className="text-[10px] text-neutral-400">Search identities to unlock more</span>
                      </div>
                      {unlockedDossiers.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5 max-h-52 overflow-y-auto pr-1">
                          {unlockedDossiers.map((egg) => (
                            <button
                              key={egg.id}
                              type="button"
                              onClick={() => {
                                setAvatarType('dossier');
                                setAvatarId(egg.id);
                              }}
                              className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                                avatarType === 'dossier' && avatarId === egg.id
                                  ? 'bg-neutral-900 border-[#c9a84c] shadow-[0_0_12px_rgba(201,168,76,0.3)]'
                                  : 'bg-black/40 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              <ManagerAvatar profile={{ avatarType: 'dossier', avatarId: egg.id }} size="sm" showBorder={false} />
                              <span className="text-[10px] text-neutral-300 font-bold mt-1.5 truncate w-full text-center">
                                {egg.name.split('—')[0].trim()}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-black/40 border border-dashed border-neutral-800 text-center text-xs text-neutral-500 font-mono">
                          No classified dossiers uncovered yet. Query anomalous keywords in the Identity Archive to unlock special personnel portraits.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MEPHISTOPHELES & SOUND
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'audio' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bus Track Settings */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
              <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                <Volume2 size={18} /> Mephistopheles Navigation & Horn
              </h3>

              {/* Toggle Bus on Border */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-neutral-800">
                <div>
                  <div className="text-sm font-bold text-white">Mephistopheles Perimeter Track</div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Mephi drives smoothly along the edge of your screen and shares live Sinner comms.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appSettings?.busEnabled !== false}
                    onChange={(e) => updateAppSettings({ busEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
                </label>
              </div>

              {/* Air Horn Volume Slider & Tester */}
              <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Dual-Tone Brass Air Horn Volume
                  </span>
                  <span className="text-xs font-mono text-[#c9a84c] font-bold">
                    {Math.round((appSettings?.busHornVolume ?? 0.8) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={appSettings?.busHornVolume ?? 0.8}
                    onChange={(e) => updateAppSettings({ busHornVolume: parseFloat(e.target.value) })}
                    className="flex-1 accent-[#c9a84c] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => playMephiHorn(appSettings?.busHornVolume ?? 0.8)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    🔊 Test Horn
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Synthesized via Web Audio API brass resonator (340Hz + 425Hz). 100% offline & zero-latency.
                </p>
              </div>

              {/* Chatter Frequency */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                  Mephistopheles Radio Chatter Frequency
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'off', label: 'Muted', desc: 'Clicks only' },
                    { id: 'slow', label: 'Relaxed', desc: '1 - 2 mins' },
                    { id: 'normal', label: 'Standard', desc: '30 - 60s' },
                    { id: 'fast', label: 'Chatty', desc: '12 - 25s' },
                  ].map((freq) => {
                    const isSelected = (appSettings?.busChatterFrequency || 'normal') === freq.id;
                    return (
                      <button
                        key={freq.id}
                        type="button"
                        onClick={() => updateAppSettings({ busChatterFrequency: freq.id })}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 border-[#c9a84c] text-[#c9a84c] shadow-[0_0_12px_rgba(201,168,76,0.2)]'
                            : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{freq.label}</div>
                        <div className="text-[10px] opacity-75 font-mono">{freq.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sinner Radio Comms Filter */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                    <Radio size={18} /> Sinner Radio Comms Filters
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Filter which Sinners can broadcast speech bubbles along the bus route.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllRadio(true)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-300 cursor-pointer"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllRadio(false)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-300 cursor-pointer"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {ALL_RADIO_CHARACTERS.map((char) => {
                  const isEnabled = appSettings?.busSinnerFilter?.[char.id] !== false;
                  return (
                    <label
                      key={char.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isEnabled
                          ? 'bg-black/60 border-neutral-700'
                          : 'bg-black/20 border-neutral-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: char.color }}
                        />
                        <span className="text-xs font-bold text-white">{char.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleRadioSinner(char.id)}
                        className="limbus-checkbox"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: THEMES & VISUALS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'display' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Theme Selector */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
            <div>
              <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                <Palette size={18} /> Project Moon Aesthetic Themes
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Select your preferred in-universe color palette and visual accents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(THEMES).map((theme) => {
                const isActive = (appSettings?.activeTheme || 'gold') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      updateAppSettings({ activeTheme: theme.id });
                      triggerToast(`Switched theme to ${theme.name}!`);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                      isActive
                        ? `bg-gradient-to-br ${theme.swatch} ${theme.border} shadow-[0_0_25px_rgba(201,168,76,0.2)]`
                        : 'bg-black/40 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Active Ribbon */}
                    {isActive && (
                      <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/20">
                        ACTIVE
                      </span>
                    )}

                    {/* Color Swatch Bar */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <div className="h-1 flex-1 rounded-full bg-neutral-800 overflow-hidden ml-2">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: theme.primary,
                            width: isActive ? '100%' : '40%',
                          }}
                        />
                      </div>
                    </div>

                    <div className="font-bold text-sm text-white font-limbus">{theme.name}</div>
                    <div className="text-xs text-neutral-400 mt-1 leading-snug">{theme.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aesthetic Filters: Scanlines & Compact Density */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CRT Scanlines */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Retro CRT Terminal Scanlines</div>
                <div className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Overlays a subtle cathode-ray tube phosphor scanline grid across the window.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={Boolean(appSettings?.crtScanlines)}
                  onChange={(e) => updateAppSettings({ crtScanlines: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
              </label>
            </div>

            {/* Compact Density Mode */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Compact Density Mode</div>
                <div className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Tightens padding and table row heights for dense, multi-monitor data viewing.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={Boolean(appSettings?.compactMode)}
                  onChange={(e) => updateAppSettings({ compactMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: DESKTOP INTEGRATION & AUTOMATION
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'desktop' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
            <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
              <Monitor size={18} /> Desktop Hook & System Tray Integration
            </h3>

            {/* Auto-Open when Game Launches */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-neutral-800">
              <div>
                <div className="text-sm font-bold text-white">Auto-Open on Game Launch</div>
                <div className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                  Automatically launches or brings Limbus Tracker to the foreground whenever <code className="text-neutral-300">LimbusCompany.exe</code> is detected running.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={appSettings?.showWhenGameStarts !== false}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    updateAppSettings({ showWhenGameStarts: nextVal });
                    if (window.electronAPI?.setGameLaunchPreference) {
                      window.electronAPI.setGameLaunchPreference(nextVal);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
              </label>
            </div>

            {/* Close to System Tray */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-neutral-800">
              <div>
                <div className="text-sm font-bold text-white">Close to System Tray</div>
                <div className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                  Closing the application window minimizes to the Windows taskbar system tray so Enkephalin cap alerts can continue in the background.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={appSettings?.closeToTray !== false}
                  onChange={(e) => updateAppSettings({ closeToTray: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
              </label>
            </div>

            {/* Enkephalin Cap Alert Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-neutral-800">
              <div>
                <div className="text-sm font-bold text-white">Enkephalin Cap Alerts</div>
                <div className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                  Sends a native Windows desktop alert when your Enkephalin pool reaches 100% capacity so no natural regeneration is wasted.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={appSettings?.notifyEnkephalinCap !== false}
                  onChange={(e) => updateAppSettings({ notifyEnkephalinCap: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
              </label>
            </div>

            {/* Default EXP Luxcavation Tier */}
            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 space-y-3">
              <div className="text-sm font-bold text-white">Default EXP Luxcavation Module Tier</div>
              <div className="text-xs text-neutral-400">
                Configure your baseline EXP Luxcavation cost according to your current Canto progress.
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="radio"
                    name="expLuxTier"
                    checked={(scheduleState?.expLuxModules ?? 3) === 2}
                    onChange={() => updateScheduleState({ expLuxModules: 2 })}
                    className="accent-[#c9a84c]"
                  />
                  <span>2 Modules (Early Canto I-III / 40 Enkephalin)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="radio"
                    name="expLuxTier"
                    checked={(scheduleState?.expLuxModules ?? 3) === 3}
                    onChange={() => updateScheduleState({ expLuxModules: 3 })}
                    className="accent-[#c9a84c]"
                  />
                  <span>3 Modules (Standard Canto IV+ / 60 Enkephalin)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: DATA VAULT & BACKUPS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'vault' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Cloud Sync Status */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                  <Cloud size={18} /> Supabase Cloud Synchronization
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Seamless multi-device cloud synchronization for cross-platform managers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {currentUser ? 'Manage Cloud Account' : 'Log In / Register'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Cloud size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentUser ? `Authenticated as: ${currentUser.email}` : 'Guest Session (Local Storage)'}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Sync Status: {syncState.status} {syncState.error ? `(${syncState.error})` : ''}
                  </div>
                </div>
              </div>

              {currentUser && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleForceCloudPush}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Force Push
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleForceCloudPull}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={14} /> Force Pull
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Local Backup & Restore */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-neutral-800 space-y-6">
            <div>
              <h3 className="text-base font-bold font-limbus text-[#c9a84c] flex items-center gap-2">
                <Database size={18} /> Offline Backup Archive
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Save an unencrypted snapshot of your complete profile, want-lists, inventory, and history as a JSON file.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Download size={16} className="text-[#c9a84c]" /> Export Complete JSON Backup
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Upload size={16} className="text-[#c9a84c]" /> Import JSON Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone: Data Wipe */}
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-4">
            <h3 className="text-base font-bold font-limbus text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> Danger Zone: Factory Reset
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Permanently purges all locally stored identities, shard progress, archives, and custom manager preferences. This action cannot be undone unless you possess an exported JSON backup.
            </p>
            <button
              type="button"
              onClick={() => {
                setWipeInput('');
                setWipeModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-red-900/40 hover:bg-red-900/70 border border-red-600 text-red-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Trash2 size={16} /> Wipe All Local Data
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Data Wipe */}
      {wipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#140a0a] border-2 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)] space-y-5 text-white">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={28} />
              <h2 className="text-lg font-bold font-limbus tracking-wider">Confirm Total System Wipe</h2>
            </div>
            <p className="text-xs text-neutral-300 font-mono leading-relaxed">
              This will completely delete your local saves, reset all want-lists, and clear your manager profile.
            </p>
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                Type <span className="text-red-400 font-bold">WIPE</span> below to authorize:
              </label>
              <input
                type="text"
                value={wipeInput}
                onChange={(e) => setWipeInput(e.target.value)}
                placeholder="WIPE"
                className="w-full bg-black border border-red-800 rounded-xl px-4 py-2 text-sm text-red-300 font-mono focus:border-red-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWipeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={wipeInput.trim() !== 'WIPE'}
                onClick={handleConfirmWipe}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </motion.div>
  );
}
