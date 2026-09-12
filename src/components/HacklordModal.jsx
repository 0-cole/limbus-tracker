import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Stamp, X, Skull, Award, CheckCircle, Crosshair } from 'lucide-react';
import EASTER_EGG_IMAGES from '../assets/easter_eggs/index.js';

export default function HacklordModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [testResult, setTestResult] = useState(null);
  const [stampPounded, setStampPounded] = useState(false);

  const handleFailQuiz = (answer) => {
    setTestResult(`❌ INCORRECT! Answered "${answer}". Only an unredeemable LARPER would pick that!`);
  };

  const handleConfess = () => {
    setStampPounded(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        className="bg-[#18080a] border-4 border-[#ef4444] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(239,68,68,0.5)] text-gray-100 flex flex-col relative font-sans"
      >
        {/* Flashing Hazard Header */}
        <div className="p-6 border-b-2 border-[#ef4444]/50 bg-gradient-to-r from-[#2b080c] via-[#450a0a] to-[#2b080c] relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-red-950 border-2 border-red-500 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] shrink-0">
                <img src={EASTER_EGG_IMAGES.hacklord} alt="Hacklord" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded border border-red-800">
                    CRITICAL CITATION #99281-LARP
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    ERLKING SHEDLETSKY (1x1x1x1)
                  </span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-wider mt-1 flex items-center gap-2 font-mono">
                  YOU ARE A LARPER!
                </h2>
                <p className="text-xs text-red-200/90 font-bold uppercase tracking-wide">
                  Subject: JOHN JAMES SHEDLETSKY III • Alias: HACKLORD
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Dictionary Definition Card */}
          <div className="p-4 rounded-xl bg-black/70 border-2 border-red-900/60 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldAlert size={16} /> Official Urban Terminology Registry
            </div>
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-sm leading-relaxed text-gray-200">
              <span className="font-black text-red-400 font-mono text-base">LARP•ER</span>{" "}
              <span className="text-xs text-gray-400 italic">/ˈlärpər/ (noun)</span>:
              <p className="mt-1 text-xs text-gray-300">
                Someone who fakes being a fan of something or pretends to be a hardcore veteran of a game/community just to fit in or appear knowledgeable.
              </p>
            </div>
          </div>

          {/* Forsaken & Erlking Shedletsky Lore */}
          <div className="p-4 rounded-xl bg-[#120406] border border-red-950 space-y-2.5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                <Skull size={14} /> FORSAKEN (2024) Dossier: Erlking 1x1x1x1
              </h4>
              <span className="text-[10px] font-mono text-gray-400">Class: Vengeful Necromancer</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Based on the former Roblox admin <strong>John Shedletsky</strong> in the asymmetrical horror game <em>FORSAKEN</em>. Originally known as <strong className="text-emerald-400">"Erlking Shedletsky"</strong> before his redesign, he wields a massive black-silver greatsword, wears a barbed black Domino Crown, and carries a dark coffin chained to his back wrapped in ghostly green chains. After the tragic ban of his wife <strong className="text-yellow-300">BrightEyes</strong>, he swore to <em className="text-red-400 font-bold">"Kill every Shedletsky across the multiverse."</em>
            </p>
            <div className="p-2.5 rounded bg-black/60 border border-red-900/50 text-[11px] font-mono text-red-200 space-y-1">
              <p className="font-bold text-red-400">🚨 WHY YOU ARE OFFICIALLY CHARGED WITH LARPING:</p>
              <p className="text-gray-300">
                You searched "Hacklord" in a Limbus Company database thinking you could flex secret knowledge about Erlking Heathcliff, Every Catherine, and Forsaken 1x1x1x1 skins. Records Keeper Kenneth intercepted your query immediately.
              </p>
            </div>
          </div>

          {/* Audit Findings */}
          <div className="p-4 rounded-xl bg-[#0f0406] border border-red-950 space-y-1.5">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-red-400">
              📋 Kenneth's Verified Field Interrogation Notes:
            </h5>
            <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
              <li>Has zero registered Mirror Dungeon Hard Mode clears on record.</li>
              <li>Referred to Vergilius as <span className="text-red-300 font-bold">"that angry red guy with the glare"</span>.</li>
              <li>Thought "Every BrightEyes" was an E.G.O identity for Ishmael.</li>
              <li>Attempted to bribe Mephistopheles with a bucket of fried chicken (Telamonster special).</li>
            </ul>
          </div>

          {/* Interactive Larp Quiz */}
          <div className="p-4 rounded-xl bg-black/60 border border-[#331115] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-200 font-mono">PROVE YOU'RE NOT A LARPER:</span>
              <span className="text-[10px] text-red-400 font-bold">Multiverse Sanity Check</span>
            </div>
            <p className="text-xs text-gray-300 font-medium">
              "Who must be erased from every mirror world reflection across the City?"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleFailQuiz("Every Shedletsky")}
                className="p-2.5 rounded-lg text-left text-xs bg-[#1f090c] hover:bg-red-900/40 border border-red-900/50 text-gray-200 transition-colors cursor-pointer"
              >
                A) Every Shedletsky (FORSAKEN)
              </button>
              <button
                onClick={() => handleFailQuiz("Every Heathcliff")}
                className="p-2.5 rounded-lg text-left text-xs bg-[#1f090c] hover:bg-red-900/40 border border-red-900/50 text-gray-200 transition-colors cursor-pointer"
              >
                B) Every Heathcliff (Limbus Company)
              </button>
              <button
                onClick={() => handleFailQuiz("John Roblox")}
                className="p-2.5 rounded-lg text-left text-xs bg-[#1f090c] hover:bg-red-900/40 border border-red-900/50 text-gray-200 transition-colors cursor-pointer"
              >
                C) John Roblox & Telamon
              </button>
              <button
                onClick={() => handleFailQuiz("I am a certified LARPER")}
                className="p-2.5 rounded-lg text-left text-xs bg-[#1f090c] hover:bg-red-900/40 border border-red-900/50 text-gray-200 transition-colors cursor-pointer"
              >
                D) I don't know, I am a certified LARPER
              </button>
            </div>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded bg-red-950/80 border border-red-700 text-xs font-bold text-red-300 font-mono"
              >
                {testResult}
              </motion.div>
            )}
          </div>

          {/* Surrender Button */}
          <div className="pt-2">
            <button
              onClick={handleConfess}
              disabled={stampPounded}
              className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-800 hover:to-red-800 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Stamp size={16} />
              <span>{stampPounded ? "STAMP OF SHAME APPLIED! CLOSING..." : "Confess to LARPING & Return to Bus"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
