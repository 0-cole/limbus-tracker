import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Monitor, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, Clock, Flame, CheckSquare, Award } from 'lucide-react';
import { syncEngine, getLocalDeviceId, getLocalDeviceName, setLocalDeviceName } from '../services/syncEngine';

export default function SyncConflictModal() {
  const [conflict, setConflict] = useState(() => syncEngine.getActiveConflict());
  const [isResolving, setIsResolving] = useState(false);
  const [editingDeviceName, setEditingDeviceName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(() => getLocalDeviceName());

  useEffect(() => {
    const unsubscribe = syncEngine.onConflictChange((c) => {
      setConflict(c);
      if (!c) {
        setIsResolving(false);
      }
    });
    return unsubscribe;
  }, []);

  if (!conflict) return null;

  const localId = getLocalDeviceId();
  const localDev = conflict.localDevice || {};
  const remoteDev = conflict.remoteDevice || {};

  const handleChoose = async (chosenDeviceId) => {
    setIsResolving(true);
    try {
      await syncEngine.resolveConflict(chosenDeviceId);
    } catch (err) {
      console.error('Failed to resolve sync conflict:', err);
      setIsResolving(false);
    }
  };

  const handleSaveDeviceName = () => {
    if (customNameInput.trim()) {
      setLocalDeviceName(customNameInput.trim());
      setEditingDeviceName(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Unknown time';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) +
        ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="w-full max-w-2xl bg-[#0f0f13] border-2 border-amber-500/80 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col max-h-[92vh]"
        >
          {/* Top Warning Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse" />

          {/* Header */}
          <div className="p-5 bg-gradient-to-b from-[#1a140b] to-[#0f0f13] border-b border-amber-900/40 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500 text-black">
                  Sync Conflict Detected
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Multiple Active Devices
                </span>
              </div>
              <h2 className="text-xl font-black font-limbus text-white tracking-wide mt-1">
                Which Device Has Your Most Recent Data?
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm text-gray-300">
            <p className="text-xs text-gray-400 leading-relaxed">
              We noticed this account was open on two devices at once and their saved progress has diverged. 
              Choose which device's data to keep. <strong>Selecting one will immediately update both devices to match, and this prompt will close on both screens automatically.</strong>
            </p>

            {/* Side by Side Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: THIS DEVICE */}
              <div className="p-4 rounded-xl bg-[#14141c] border-2 border-amber-500/50 flex flex-col justify-between relative shadow-lg">
                <div className="absolute -top-2.5 right-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase tracking-wider font-mono">
                    This Screen
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Laptop size={18} className="text-amber-400 shrink-0" />
                    {editingDeviceName ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={customNameInput}
                          onChange={(e) => setCustomNameInput(e.target.value)}
                          className="bg-black/80 border border-amber-500 text-xs px-2 py-1 rounded text-white font-bold outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleSaveDeviceName}
                          className="text-[10px] bg-amber-500 text-black px-2 py-1 rounded font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="font-bold text-white text-sm truncate">
                          {localDev.deviceName || getLocalDeviceName()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingDeviceName(true)}
                          className="text-[10px] text-gray-500 hover:text-amber-300 underline ml-auto"
                        >
                          Rename
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-gray-400 mb-3 flex items-center gap-1 font-mono">
                    <Clock size={12} className="text-gray-500" />
                    <span>Saved: {formatTimestamp(localDev.lastUpdated)}</span>
                  </div>

                  {/* Telemetry rows */}
                  <div className="space-y-2 text-xs bg-black/40 p-3 rounded-lg border border-[#222]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Flame size={13} className="text-amber-400" /> MD Pace:
                      </span>
                      <span className={`font-bold uppercase font-mono ${localDev.paceMode === 'rush' ? 'text-amber-400' : 'text-gray-300'}`}>
                        {localDev.paceMode === 'rush' ? '⚡ Rush Pace' : 'Relaxed Pace'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-emerald-400" /> Dailies:
                      </span>
                      <span className="font-bold font-mono text-white">
                        {localDev.dailiesDone ?? 0} / 5 Done
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Award size={13} className="text-purple-400" /> Battle Pass:
                      </span>
                      <span className="font-bold font-mono text-purple-300">
                        Lv. {localDev.bpLevel || 1} ({localDev.bpExp || 0}/10 EXP)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#222]">
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleChoose(localId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle size={15} />
                    <span>Keep This Device's Data</span>
                  </button>
                </div>
              </div>

              {/* Card 2: OTHER DEVICE */}
              <div className="p-4 rounded-xl bg-[#14141c] border border-[#333] hover:border-gray-500 flex flex-col justify-between relative shadow-lg">
                <div className="absolute -top-2.5 right-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#333] text-gray-300 uppercase tracking-wider font-mono">
                    Other Device
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor size={18} className="text-cyan-400 shrink-0" />
                    <span className="font-bold text-white text-sm truncate">
                      {remoteDev.deviceName || 'Other Device'}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-400 mb-3 flex items-center gap-1 font-mono">
                    <Clock size={12} className="text-gray-500" />
                    <span>Saved: {formatTimestamp(remoteDev.lastUpdated)}</span>
                  </div>

                  {/* Telemetry rows */}
                  <div className="space-y-2 text-xs bg-black/40 p-3 rounded-lg border border-[#222]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Flame size={13} className="text-amber-400" /> MD Pace:
                      </span>
                      <span className={`font-bold uppercase font-mono ${remoteDev.paceMode === 'rush' ? 'text-amber-400' : 'text-gray-300'}`}>
                        {remoteDev.paceMode === 'rush' ? '⚡ Rush Pace' : 'Relaxed Pace'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-emerald-400" /> Dailies:
                      </span>
                      <span className="font-bold font-mono text-white">
                        {remoteDev.dailiesDone ?? 0} / 5 Done
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-1.5">
                        <Award size={13} className="text-purple-400" /> Battle Pass:
                      </span>
                      <span className="font-bold font-mono text-purple-300">
                        Lv. {remoteDev.bpLevel || 1} ({remoteDev.bpExp || 0}/10 EXP)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#222]">
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => handleChoose(remoteDev.deviceId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/20 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isResolving ? 'animate-spin' : ''} />
                    <span>Keep {remoteDev.deviceName || 'Other Device'}'s Data</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-[#0a0a0e] border-t border-[#222] text-center text-[11px] text-gray-500 font-mono">
            {isResolving ? (
              <span className="text-amber-400 animate-pulse font-bold">
                Synchronizing chosen data across both devices...
              </span>
            ) : (
              <span>
                Both devices stay in sync. Whichever option you click will immediately overwrite the other with the chosen data.
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
