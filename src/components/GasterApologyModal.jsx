import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Terminal, X, ShieldAlert, Check } from 'lucide-react';

export default function GasterApologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-gradient-to-b from-[#141418] via-[#0d0d10] to-[#08080a] border-2 border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden font-sans text-gray-200"
      >
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-amber-950/60 px-5 py-3 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle size={16} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-limbus text-xs sm:text-sm font-bold text-amber-300 tracking-wider flex items-center gap-2">
                <span>📋 Senior Archivist Kenneth — Urgent Diagnostic Notice</span>
              </h3>
              <p className="text-[10px] font-mono text-amber-400/70">
                LCB Records & After-Action Division • [POST-INCIDENT PROTOCOL]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Box */}
          <div className="p-3 rounded-xl bg-black/60 border border-amber-800/30 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-amber-400">
              <Terminal size={14} />
              <span>TERMINAL TELEMETRY: RE-STABILIZED</span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">
              INCIDENT 0x564F4944
            </span>
          </div>

          {/* Kenneth's Frantic Narrative */}
          <div className="space-y-3 text-xs leading-relaxed text-gray-300">
            <p className="font-semibold text-amber-200 italic font-mono">
              "D-Dante?! Manager Dante, please tell me you're picking this up through the executive radio?!"
            </p>
            <p>
              *ragged breathing over heavy radio static* ...The entire Mephistopheles terminal just experienced a complete, unexplainable reality crash. All internal photon sensors plummeted to absolute negative readings, the navigation radar froze, and Charon wouldn't stop shouting about <span className="text-white font-mono bg-black/60 px-1 py-0.5 rounded">"hands speaking in the windshield"</span>!
            </p>
            <p>
              I was sitting at my desk cataloging Mirror Dungeon supply tickets when every single monitor in the archives suddenly flickered pitch black, displayed endless rows of alien glyphs, and the viewport glass physically looked like it split into jagged halves! Corporate's central mainframe nearly dispatched a containment sweep to District 4!
            </p>
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-red-400">
                <ShieldAlert size={14} />
                <span>ARCHIVAL INVESTIGATION NOTE:</span>
              </div>
              <p>
                "I caught a glimpse of the memory stack right before the power cut out. It originated from an unindexed dossier in the identities database. Dante... I swear on my life, <strong>I did not write or upload whatever that was</strong>. That record doesn't follow any known City or Wing classification."
              </p>
            </div>
            <p>
              I have immediately executed a permanent hard-purge of that anomalous query. The corrupted dossier has been completely severed from the search registry so nobody ever clicks it again.
            </p>
            <p className="text-gray-400 text-[11px] italic">
              Please, Manager... I've had two panic attacks and three cups of lukewarm instant coffee today. Let's just pretend this never happened before Vergilius demands an official written autopsy.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/60 border-t border-[#2a2a30] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-gray-500">
            System status: Nominal • Registry entry wiped
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={14} />
            Acknowledge System Restoration
          </button>
        </div>
      </motion.div>
    </div>
  );
}
