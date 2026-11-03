import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, AlertCircle, ArrowRight, X, Clock, ShieldAlert, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'lt_walpurgis_approaching_notice_nov2026';

export default function WalpurgisNotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsOpen(true);

        // Dispatch desktop notification via Electron or Web Notification API
        const notifTitle = '🌙 Walpurgisnacht is Approaching!';
        const notifBody = 'The 7th Walpurgis Night limited crossover event opens soon. Conserve Lunacy & Egoshards for exclusive IDs & E.G.O!';

        if (window.electronAPI?.showNotification) {
          window.electronAPI.showNotification({
            title: notifTitle,
            body: notifBody,
            silent: false
          });
        } else if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notifTitle, { body: notifBody });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification(notifTitle, { body: notifBody });
              }
            });
          }
        }
      }
    } catch (e) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}
    setIsOpen(false);
  };

  const handleGoToIdentities = () => {
    handleDismiss();
    navigate('/identities');
  };

  const handleGoToSchedule = () => {
    handleDismiss();
    navigate('/schedule');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-[#0d0714] border-2 border-purple-500/80 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.4)] relative flex flex-col max-h-[90vh]"
        >
          {/* Top Mystic Gradient Accent Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-fuchsia-400 to-amber-400 animate-pulse" />

          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-purple-950/70 via-[#160a24] to-slate-950/80 border-b border-purple-900/40 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 relative">
                <Moon size={26} className="text-purple-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block flex items-center gap-1.5">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>[SPECIAL EVENT ADVISORY // HIGH PRIORITY]</span>
                </span>
                <h2 className="text-2xl font-black font-limbus text-white tracking-wider flex items-center gap-2">
                  WALPURGISNACHT IS SOON
                </h2>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-4 text-sm">
            {/* Primary Notice Box */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-amber-400" />
                  <span>UPCOMING EVENT WINDOW</span>
                </span>
                <span className="font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                  Target Extraction Soon
                </span>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed font-mono">
                Astronomical resonance anomalies detected across Mephistopheles navigation systems. The <strong className="text-white">Walpurgisnacht</strong> limited-time crossover extraction event is scheduled to open shortly!
              </p>
            </div>

            {/* Tactical Shard Advisory */}
            <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-400" />
                <span>Critical Dispenser & Shard Invariants</span>
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong className="text-white">Strict Time-Gated Dispensation:</strong> Walpurgis Identities (e.g., <em>Regret Faust</em>, <em>Magic Bullet Outis</em>, <em>Dawn Office Sinclair</em>, <em>Solemn Lament Yi Sang</em>, <em>Queen of Hatred Don Quixote</em>, <em>Knight of Despair Rodion</em>, <em>Night Awls Gregor</em>, <em>Jeong's Office Ishmael</em>) and crossover E.G.O can <strong className="text-amber-300">ONLY</strong> be crafted using Egoshards while Walpurgisnacht is actively running.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>
                    <strong className="text-white">Conserve Crates & Lunacy:</strong> Each targeted 000 ID or WAW/ALEPH E.G.O requires <strong className="text-amber-300">400 Egoshards</strong> (~200 Nominable Crates). Do not spend shards or crates on standard pool targets until your Walpurgis reserves are secured.
                  </span>
                </li>
              </ul>
            </div>

            {/* Kenneth's Operational Memo */}
            <div className="p-3.5 rounded-xl bg-purple-900/10 border border-purple-500/20 text-[11px] text-gray-400 italic font-mono flex items-start gap-2.5">
              <Award size={16} className="text-purple-400 shrink-0 mt-0.5" />
              <span>
                "Dante, Charon is already watching the stars and humming. If you burn your Nominable Crates on standard units today, don't come crying to Records when the Walpurgis banner goes live tomorrow. Keep at least 400 shards in the vault!" — Kenneth, Records Keeper
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-black/60 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleGoToIdentities}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Walpurgis Pool</span>
              <ArrowRight size={13} />
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleGoToSchedule}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Plan Grind</span>
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Acknowledge</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
