import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, ShieldAlert, Award, Library } from 'lucide-react';

const FLOORS = [
  { name: 'Floor of General Works', librarian: 'Roland', theme: 'Kether', desc: 'The base of the Library. Neutral, solemn, and where all paths converge.' },
  { name: 'Floor of History', librarian: 'Malkuth', theme: 'Malkuth', desc: 'Burning resolve and fourth match flames. Stand up, no matter how many times you fall.' },
  { name: 'Floor of Technological Sciences', librarian: 'Yesod', theme: 'Yesod', desc: 'Discipline, strict calculation, and grinding gears of sorrow.' },
  { name: 'Floor of Literature', librarian: 'Hod', theme: 'Hod', desc: 'Quiet reflection, shy empathy, and the desire to become a better person.' },
  { name: 'Floor of Art', librarian: 'Netzach', theme: 'Netzach', desc: 'Intoxicating brew, weary laughter, and the lingering dread of tomorrow.' },
  { name: 'Floor of Natural Sciences', librarian: 'Tiphereth', theme: 'Tiphereth', desc: 'Radiant conviction and the sorrow of eternal parting.' },
  { name: 'Floor of Language', librarian: 'Gebura', theme: 'Gebura', desc: 'The Red Mist. Pure battle instinct, absolute courage, and overwhelming discipline.' },
  { name: 'Floor of Social Sciences', librarian: 'Chesed', theme: 'Chesed', desc: 'A fragrant cup of black coffee and gentle remorse for those left behind.' },
  { name: 'Floor of Philosophy', librarian: 'Binah', theme: 'Binah', desc: 'Arbiter of the Head. Golden arbiters, locking chains, and tea poured in absolute poise.' },
  { name: 'Floor of Religion', librarian: 'Hokma', theme: 'Hokma', desc: 'Devotion unto eternity. The ticking clock and the memories of Ayin.' },
];

const BOOKS_TO_OFFER = [
  {
    book: "Yi Sang's Crow's Eye View Notebook",
    author: "Yi Sang",
    angelaReaction: '"The geometry of despair and shattered wings... A profound reflection on fragmented selfhood. I will place this in the Floor of Literature."',
  },
  {
    book: "Don Quixote's Illustrated Chivalric Code",
    author: "Don Quixote",
    angelaReaction: '"Vibrant crayon illustrations and grand proclamations of justice. Delusional, yet surprisingly earnest. Malkuth may find inspiration here."',
  },
  {
    book: "Meursault's Exact Chronological Case File",
    author: "Meursault",
    angelaReaction: '"Exacting precision. Not a single emotional adjective was spared or wasted. Yesod will appreciate such rigorous indexing."',
  },
  {
    book: "Sinclair's Journal: Demian and The Mark",
    author: "Emil Sinclair",
    angelaReaction: '"The egg must break before the bird can fly... We understand that sentiment all too intimately here. This book will resonate deeply."',
  },
  {
    book: "Kenneth's Overtime Maintenance Logs",
    author: "Kenneth (Limbus Records)",
    angelaReaction: '"A terrifyingly dense catalog of unresolved bug tickets and caffeine consumption. Even my former million-year loop feels slightly more peaceful."',
  },
];

export default function AngelaModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('floors');
  const [bookIndex, setBookIndex] = useState(0);
  const [offeredCount, setOfferedCount] = useState(0);

  const offerNextBook = () => {
    setBookIndex((prev) => (prev + 1) % BOOKS_TO_OFFER.length);
    setOfferedCount((c) => c + 1);
  };

  const currentBook = BOOKS_TO_OFFER[bookIndex];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-2xl w-full relative bg-[#040e14] border-2 border-cyan-500/70 shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden max-h-[90vh] flex flex-col rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-950 via-cyan-400 to-cyan-950" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-cyan-400 hover:text-white transition-colors bg-cyan-950/80 p-1.5 rounded-full border border-cyan-800/50 z-20"
        >
          <X size={16} />
        </button>

        {/* ── HEADER ── */}
        <div className="flex gap-4 items-start p-5 border-b border-cyan-900/40 bg-black/60">
          {/* Avatar / Portrait */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex-shrink-0 bg-black">
            <img
              src="https://libraryofruina.wiki.gg/images/AngelaFullBody.png"
              alt="Angela"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-1 left-0 right-0 text-center">
              <span className="text-[8px] bg-cyan-950/90 text-cyan-200 font-black px-1.5 py-0.5 rounded border border-cyan-600/50 uppercase tracking-wider">
                HEAD LIBRARIAN
              </span>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-0.5">
              <Sparkles size={12} className="text-cyan-300" /> Mistress of the Library • Pale Light
            </div>
            <h2 className="text-xl font-black text-cyan-100 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] leading-tight mb-0.5">
              Head Librarian — Angela
            </h2>
            <p className="text-xs text-cyan-400/80 mb-2">Architect of the Library / Former Lobotomy Corp AI</p>
            <div className="text-xs italic text-cyan-200/90 font-serif bg-cyan-950/40 border border-cyan-800/40 rounded p-2 leading-relaxed relative">
              <span className="text-cyan-400 text-base absolute -top-2 left-2">"</span>
              May you find your book in this place. A warm welcome to you, Manager Dante of Limbus Company.{' '}
              <strong className="text-cyan-300 underline decoration-cyan-500/60">Take care not to lose yourself in the pages.</strong>
              <span className="text-cyan-400 text-base absolute -bottom-3 right-2">"</span>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-cyan-900/30 bg-black/40 text-center text-xs">
          {[
            { label: 'Floors', value: '10 Layers', color: 'text-cyan-300' },
            { label: 'Collection', value: 'Complete', color: 'text-white' },
            { label: 'Affinity', value: 'Pale Light', color: 'text-cyan-400' },
            { label: 'Status', value: 'Free Will', color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/60 border border-cyan-900/30 rounded py-1.5">
              <span className="text-[9px] text-cyan-600 block font-bold uppercase">{stat.label}</span>
              <span className={`font-mono font-black text-xs md:text-sm ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ── TAB NAV ── */}
        <div className="flex border-b border-cyan-900/40 bg-black/40 px-5">
          {[
            { id: 'floors', label: 'Library Floors', icon: <Library size={12} /> },
            { id: 'offering', label: 'Offer a Sinner Book', icon: <BookOpen size={12} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all mr-1 ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === 'floors' ? (
              <motion.div key="floors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-2.5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">The 10 Sephirah Floors</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {FLOORS.map((fl) => (
                    <div key={fl.name} className="bg-[#06151f] border border-cyan-900/50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-cyan-200">{fl.name}</span>
                        <span className="text-[10px] text-cyan-400/80 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
                          {fl.librarian}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-snug">{fl.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="offering" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="bg-[#071924] border border-cyan-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={18} className="text-cyan-400" />
                    <h4 className="font-bold text-cyan-200 text-sm">Present a Book from Mephistopheles</h4>
                    <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-700/40 px-2 py-0.5 rounded font-mono ml-auto">
                      Books Cataloged: {offeredCount}
                    </span>
                  </div>

                  <div className="bg-black/60 border border-cyan-900/50 rounded-lg p-4 mb-4">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Offered Volume:</div>
                    <div className="text-base font-black text-white mb-0.5">{currentBook.book}</div>
                    <div className="text-[11px] text-gray-400 mb-2">Author: {currentBook.author}</div>
                    <div className="text-xs italic text-cyan-100 font-serif leading-relaxed pl-3 border-l-2 border-cyan-400">
                      {currentBook.angelaReaction}
                    </div>
                  </div>

                  <button
                    onClick={offerNextBook}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 text-black font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    <BookOpen size={14} /> Offer Another Sinner Book to Angela
                  </button>
                </div>

                <div className="bg-black/60 border border-cyan-900/40 rounded-xl p-4 text-xs font-mono text-cyan-400/80 leading-relaxed">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-600 mb-1 font-bold">Librarian Dictum</div>
                  "Every life in the City is a story worth archiving. Whether they become guests or patrons depends on the choices they make before stepping through the doors."
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-cyan-900/40 bg-black/50">
          <span className="text-xs font-mono text-cyan-500">
            "May you find your book in this place."
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-black bg-cyan-400 text-black hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
