import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Package, Layers, ArrowRight, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'lt_s8_shard_halving_notice_v1077';

export default function Season8NoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsOpen(true);
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

  const handleGoToInventory = () => {
    handleDismiss();
    navigate('/inventory');
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
          className="w-full max-w-xl bg-[#0f0f0f] border-2 border-[#c9a84c] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(201,168,76,0.3)] relative flex flex-col max-h-[90vh]"
        >
          {/* Top Gold Accent Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-[#c9a84c] via-[#f59e0b] to-[#c9a84c]" />

          {/* Header */}
          <div className="p-6 bg-gradient-to-b from-[#1c170d] to-[#0f0f0f] border-b border-[#332a14] flex justify-between items-start">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#c9a84c] text-black">
                    Season 8: Punctum
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    One-Time Notice
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-limbus text-white tracking-wide mt-1">
                  Egoshard & Box Rollover Advisory
                </h2>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex flex-col gap-1.5">
              <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Attention Managers:
              </span>
              <p>
                With the launch of Season 8, the standard Limbus Company season rollover has occurred: 
                <strong> 50% of your unused Egoshards and Egoshard Crates have been converted into Thread!</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 shrink-0 mt-0.5">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">Sinner Shards Halved</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Your in-game sinner shards were halved (rounded down) and the rest turned into Thread.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-950/50 border border-yellow-800/50 text-yellow-400 shrink-0 mt-0.5">
                  <Package size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">Boxes Halved</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Nominable & Random Egoshard boxes were also halved and converted into Thread.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1.5">
              <span className="font-bold text-[#c9a84c] uppercase tracking-wider block">
                ⚠️ Action Needed in Limbus Tracker:
              </span>
              <p className="text-gray-300">
                To prevent accidental data loss, <strong>Limbus Tracker does NOT automatically modify your recorded shard or box counts</strong>.
              </p>
              <p className="text-gray-400">
                Please open your in-game inventory, verify your new post-maintenance shard and crate numbers, and update them in the <strong>Inventory</strong> tab so your schedule calculations remain 100% accurate!
              </p>
            </div>

            {/* Kenneth in-universe flavor memo */}
            <div className="p-3 rounded-xl bg-[#141414] border border-white/5 text-[11px] text-gray-400 italic font-mono">
              <span className="text-[#c9a84c] not-italic font-bold block mb-0.5">📋 Records Keeper Kenneth:</span>
              "Dante, please check your actual shard lockers before planning ten Mirror Dungeons! Half your boxes just dissolved into sewing thread—don't scream at me when your crates aren't where you left them!"
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 bg-black/80 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-gray-500 font-mono text-center sm:text-left">
              This notice will only appear once for this update.
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleDismiss}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/10"
              >
                Dismiss
              </button>
              <button
                onClick={handleGoToInventory}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#c9a84c] hover:bg-[#d8b95d] text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(201,168,76,0.3)] cursor-pointer"
              >
                <span>Go to Inventory</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
