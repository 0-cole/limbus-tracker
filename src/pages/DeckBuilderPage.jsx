import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Sparkles, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  RotateCcw, 
  Eye, 
  ExternalLink, 
  Shield, 
  Zap, 
  Edit3, 
  ChevronDown, 
  Users, 
  Flame, 
  Droplets, 
  Activity, 
  Wind, 
  X,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../stores/useStore.js';
import sinnersData from '../data/sinners.json';
import { CANONICAL_SINNER_ORDER, getSinnerInfo, getCardImageUrl, normalizeSinnerId } from '../utils/textUtils.js';
import { 
  KEYWORDS, 
  KEYWORD_THEMES, 
  SIN_COLORS, 
  detectKeywords, 
  analyzeTeamSynergy, 
  getIdentityTactics 
} from '../utils/identityTactics.js';
import IdDetailsModal from '../components/IdDetailsModal.jsx';

export default function DeckBuilderPage() {
  const {
    identitiesData,
    acquiredIds,
    savedDecks = [],
    activeDeckId,
    activeDeck,
    setDeckSlot,
    clearDeckSlot,
    clearAllDeckSlots,
    setDeckFieldedCount,
    setDeckName,
    createDeckPreset,
    loadDeckPreset,
    deleteDeckPreset,
    autoFillKeywordDeck
  } = useStore();

  // Local UI State
  const [selectedKeyword, setSelectedKeyword] = useState('Bleed');
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [selectorSinner, setSelectorSinner] = useState(null); // Sinner object when modal open
  const [dossierIdentity, setDossierIdentity] = useState(null); // Identity object for Tactical Dossier modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Selector Modal Filters
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerKeyword, setPickerKeyword] = useState('All');
  const [pickerAttackType, setPickerAttackType] = useState('All');

  // Active Deck Data
  const currentDeck = activeDeck || savedDecks[0] || { id: 'default', name: 'Main Squad', fieldedCount: 6, slots: {} };
  const fieldedCount = currentDeck.fieldedCount || 6;
  const slots = currentDeck.slots || {};

  // Build full identity objects for each sinner slot
  const slottedIdentitiesMap = useMemo(() => {
    const map = {};
    CANONICAL_SINNER_ORDER.forEach(sinnerKey => {
      const assignedName = slots[sinnerKey];
      if (assignedName) {
        const found = identitiesData.find(id => id.name === assignedName);
        if (found) map[sinnerKey] = found;
      }
    });
    return map;
  }, [slots, identitiesData]);

  // Slotted identities as an array for synergy calculations
  const allSlottedList = useMemo(() => {
    return Object.values(slottedIdentitiesMap);
  }, [slottedIdentitiesMap]);

  // Frontline vs Support identities
  const frontlineIdentities = useMemo(() => {
    return CANONICAL_SINNER_ORDER.slice(0, fieldedCount)
      .map(sinnerKey => slottedIdentitiesMap[sinnerKey])
      .filter(Boolean);
  }, [slottedIdentitiesMap, fieldedCount]);

  // Synergy Analysis based on frontline combatants (or all slotted if < fieldedCount)
  const synergyData = useMemo(() => {
    const targetList = frontlineIdentities.length > 0 ? frontlineIdentities : allSlottedList;
    return analyzeTeamSynergy(targetList);
  }, [frontlineIdentities, allSlottedList]);

  // Handlers
  const handleAutoFill = (kw) => {
    autoFillKeywordDeck(kw || selectedKeyword, onlyOwned);
  };

  const handleStartRename = () => {
    setTempName(currentDeck.name || 'Squad');
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (tempName.trim()) {
      setDeckName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCreateNewSquad = () => {
    const newName = `Squad ${savedDecks.length + 1}`;
    createDeckPreset(newName);
  };

  const handleDeleteSquad = () => {
    if (savedDecks.length <= 1) return;
    deleteDeckPreset(currentDeck.id);
  };

  // Selector Modal Candidates
  const availableCandidatesForSinner = useMemo(() => {
    if (!selectorSinner) return [];
    const targetKey = selectorSinner.id;

    return identitiesData.filter(id => {
      // Must match this Sinner
      if (normalizeSinnerId(id.sinner) !== targetKey) return false;

      // Filter by My Pool
      if (onlyOwned && !acquiredIds.has(id.name)) return false;

      // Filter by Keyword
      if (pickerKeyword !== 'All') {
        const kws = detectKeywords(id);
        if (!kws.includes(pickerKeyword)) return false;
      }

      // Filter by Attack Type
      if (pickerAttackType !== 'All') {
        const hasAttackType = (id.skills || []).some(s => s.type === pickerAttackType);
        if (!hasAttackType) return false;
      }

      // Filter by Search Query
      if (pickerSearch.trim()) {
        const q = pickerSearch.toLowerCase();
        const matchesName = id.name.toLowerCase().includes(q);
        const matchesSkill = (id.skills || []).some(s => s.name?.toLowerCase().includes(q));
        if (!matchesName && !matchesSkill) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort acquired first, then rarity (3 > 2 > 1)
      const aAcq = acquiredIds.has(a.name) ? 1 : 0;
      const bAcq = acquiredIds.has(b.name) ? 1 : 0;
      if (bAcq !== aAcq) return bAcq - aAcq;
      return (b.rarity || 0) - (a.rarity || 0);
    });
  }, [selectorSinner, identitiesData, onlyOwned, acquiredIds, pickerKeyword, pickerAttackType, pickerSearch]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 lg:p-8 space-y-6 pb-24">
      {/* 1. Header Bar: Title & Preset Manager */}
      <div className="bg-[#120d0d] border border-red-950/60 rounded-2xl p-4 lg:p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Swords size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-limbus tracking-wider text-white">
                  DECK BUILDER // SQUAD SYNERGIES
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  v1.0.82
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Assemble 12-sinner compositions, calculate real-time Sin resonances, and inspect tactical dossiers.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Preset Selector Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={currentDeck.id}
              onChange={(e) => loadDeckPreset(e.target.value)}
              className="w-full md:w-48 bg-[#181111] border border-amber-500/30 rounded-xl px-3 py-2 text-sm text-amber-200 font-bold focus:outline-none focus:border-amber-500 cursor-pointer appearance-none pr-8"
            >
              {savedDecks.map(deck => (
                <option key={deck.id} value={deck.id} className="bg-[#181111] text-white">
                  {deck.name || 'Unnamed Squad'}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/60 pointer-events-none" />
          </div>

          {/* Rename Active Preset */}
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                className="bg-[#181111] border border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none w-32"
                placeholder="Squad name..."
                autoFocus
              />
              <button
                onClick={handleSaveRename}
                className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer"
                title="Save Name"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartRename}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Rename Squad"
            >
              <Edit3 size={15} />
            </button>
          )}

          {/* New Preset */}
          <button
            onClick={handleCreateNewSquad}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.1)]"
          >
            <Plus size={14} />
            <span>New Squad</span>
          </button>

          {/* Delete Preset */}
          {savedDecks.length > 1 && (
            <button
              onClick={handleDeleteSquad}
              className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-800/40 transition-colors cursor-pointer"
              title="Delete Squad"
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Fielded Count Control */}
          <div className="flex items-center gap-2 bg-[#181111] border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Main:
            </span>
            <select
              value={fieldedCount}
              onChange={(e) => setDeckFieldedCount(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-amber-400 cursor-pointer focus:outline-none"
            >
              {[5, 6, 7, 8, 12].map(num => (
                <option key={num} value={num} className="bg-[#181111] text-white">
                  {num} Sinners
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Strategy Toolbar: Keyword Filters, Auto-Fill, My Pool Toggle */}
      <div className="bg-[#120d0d] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Keyword Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1.5">
            <Filter size={13} className="text-amber-400" />
            <span>Archetype:</span>
          </span>
          {KEYWORDS.map(kw => {
            const theme = KEYWORD_THEMES[kw];
            const isSelected = selectedKeyword === kw;
            return (
              <button
                key={kw}
                onClick={() => setSelectedKeyword(kw)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? `${theme.bg} ${theme.text} border-2 ${theme.border} shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105`
                    : 'bg-white/5 text-gray-400 hover:text-gray-200 border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{theme.icon}</span>
                <span>{kw}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Auto-Fill & My Pool */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* My Pool Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer select-none bg-[#181111] border border-white/10 px-3 py-1.5 rounded-xl hover:border-white/20 transition-all">
            <input
              type="checkbox"
              checked={onlyOwned}
              onChange={(e) => setOnlyOwned(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            <span>My Pool Only ({acquiredIds.size} Owned)</span>
          </label>

          {/* Auto-Fill Button */}
          <button
            onClick={() => handleAutoFill(selectedKeyword)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-102"
          >
            <Zap size={14} className="fill-black" />
            <span>Auto-Fill {selectedKeyword}</span>
          </button>

          {/* Clear Button */}
          {showClearConfirm ? (
            <div className="flex items-center gap-1 bg-red-950/60 border border-red-700/60 px-2 py-1 rounded-xl">
              <span className="text-[11px] text-red-200 font-bold mr-1">Confirm?</span>
              <button
                onClick={() => {
                  clearAllDeckSlots();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={allSlottedList.length === 0}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
              title="Clear Entire Squad"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Workspace: 12-Sinner Board + Synergy HUD */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (12 Sinner Slots) */}
        <div className="xl:col-span-8 space-y-6">
          {/* FRONTLINE SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-300">
                  ⚔️ MAIN COMBAT SQUAD (Slots 1–{fieldedCount})
                </h2>
              </div>
              <span className="text-xs text-gray-400">
                Active combatants participating in turns & clashes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {CANONICAL_SINNER_ORDER.slice(0, fieldedCount).map((sinnerKey, idx) => {
                const sinner = getSinnerInfo(sinnerKey);
                const assignedIdentity = slottedIdentitiesMap[sinnerKey];
                return (
                  <SinnerSlotCard
                    key={sinnerKey}
                    sinner={sinner}
                    slotIndex={idx + 1}
                    isFrontline={true}
                    identity={assignedIdentity}
                    onOpenSelector={() => setSelectorSinner(sinner)}
                    onOpenDossier={() => setDossierIdentity(assignedIdentity)}
                    onClearSlot={() => clearDeckSlot(sinnerKey)}
                  />
                );
              })}
            </div>
          </div>

          {/* SUPPORT BENCH SECTION */}
          {fieldedCount < 12 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400/60" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">
                    🛡️ SUPPORT BENCH (Slots {fieldedCount + 1}–12)
                  </h2>
                </div>
                <span className="text-xs text-gray-500">
                  Support passives active while stationed on Mephistopheles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CANONICAL_SINNER_ORDER.slice(fieldedCount).map((sinnerKey, idx) => {
                  const sinner = getSinnerInfo(sinnerKey);
                  const assignedIdentity = slottedIdentitiesMap[sinnerKey];
                  return (
                    <SinnerSlotCard
                      key={sinnerKey}
                      sinner={sinner}
                      slotIndex={fieldedCount + idx + 1}
                      isFrontline={false}
                      identity={assignedIdentity}
                      onOpenSelector={() => setSelectorSinner(sinner)}
                      onOpenDossier={() => setDossierIdentity(assignedIdentity)}
                      onClearSlot={() => clearDeckSlot(sinnerKey)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Synergy HUD) */}
        <div className="xl:col-span-4 space-y-4 sticky top-6">
          <div className="bg-[#120d0d] border border-amber-500/20 rounded-2xl p-5 space-y-5 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  REAL-TIME SYNERGY HUD
                </h3>
              </div>
              <span className="text-xs text-amber-400 font-bold">
                {allSlottedList.length} / 12 Slotted
              </span>
            </div>

            {/* Dominant Keyword Focus */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Dominant Archetype
              </div>
              {synergyData.dominantKeyword ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {KEYWORD_THEMES[synergyData.dominantKeyword[0]]?.icon || '⚡'}
                    </span>
                    <div>
                      <div className="text-sm font-black text-white">
                        {synergyData.dominantKeyword[0]} Focus
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {synergyData.dominantKeyword[1]} identities contributing
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Synergized
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">
                  No dominant keyword yet. Slotted units will align into a synergy archetype.
                </div>
              )}
            </div>

            {/* Sin Affinity Resonance Meter */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className="text-gray-400">Sin Affinity Distribution</span>
                <span className="text-gray-500">Skills & Defense</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(synergyData.sinCounts).map(([sin, count]) => {
                  const color = SIN_COLORS[sin] || '#666';
                  const isHighRes = count >= 4;
                  return (
                    <div key={sin} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="flex items-center gap-1.5 font-bold" style={{ color }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          {sin}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isHighRes && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded animate-pulse">
                              ⚡ A-Reson (4+)
                            </span>
                          )}
                          <span className="font-mono text-gray-300 font-bold">{count}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (count / 12) * 100)}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attack Type Coverage */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <span>Damage Type Coverage</span>
                <span className="text-gray-500 font-mono">
                  {synergyData.attackCounts.Slash + synergyData.attackCounts.Pierce + synergyData.attackCounts.Blunt} Skills
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'Slash', count: synergyData.attackCounts.Slash, icon: '🗡️', color: 'text-red-400', border: 'border-red-500/30' },
                  { type: 'Pierce', count: synergyData.attackCounts.Pierce, icon: '🏹', color: 'text-amber-400', border: 'border-amber-500/30' },
                  { type: 'Blunt', count: synergyData.attackCounts.Blunt, icon: '🔨', color: 'text-blue-400', border: 'border-blue-500/30' },
                ].map(atk => (
                  <div
                    key={atk.type}
                    className={`bg-white/[0.02] border ${atk.border} rounded-xl p-2 text-center`}
                  >
                    <div className="text-base">{atk.icon}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                      {atk.type}
                    </div>
                    <div className={`text-sm font-black font-mono ${atk.color}`}>
                      {atk.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Faction Synergies */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Active Faction Ties
              </div>
              {synergyData.activeFactions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {synergyData.activeFactions.map(({ faction, count }) => (
                    <span
                      key={faction}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      <span>{faction}</span>
                      <span className="text-[10px] font-mono bg-amber-500/30 px-1 rounded text-white">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">
                  Slot 2+ identities from the same faction (Blade Lineage, Liu, W Corp, etc.) to trigger faction buffs.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Identity Selector Modal */}
      <AnimatePresence>
        {selectorSinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-[#120d0d] border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div 
                className="p-5 border-b border-white/10 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${selectorSinner.color}22 0%, #120d0d 100%)` }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm border"
                    style={{ backgroundColor: `${selectorSinner.color}40`, borderColor: selectorSinner.color }}
                  >
                    #{String(selectorSinner.number).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-limbus text-white">
                      ASSIGN IDENTITY // {selectorSinner.name.toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Choose an identity to equip into this Sinner slot.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectorSinner(null);
                    setPickerSearch('');
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Filters */}
              <div className="p-4 border-b border-white/5 bg-[#181111] space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search identity or skill name..."
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  {/* Attack Type Selector */}
                  <div className="flex items-center gap-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-1">
                    {['All', 'Slash', 'Pierce', 'Blunt'].map(atk => (
                      <button
                        key={atk}
                        onClick={() => setPickerAttackType(atk)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          pickerAttackType === atk
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {atk}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-gray-400 mr-1">Keyword:</span>
                  {['All', ...KEYWORDS].map(kw => {
                    const isSelected = pickerKeyword === kw;
                    return (
                      <button
                        key={kw}
                        onClick={() => setPickerKeyword(kw)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {kw}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Candidate Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCandidatesForSinner.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                    No matching identities found. Adjust filters or search terms.
                  </div>
                ) : (
                  availableCandidatesForSinner.map(id => {
                    const isOwned = acquiredIds.has(id.name);
                    const isCurrentlyEquipped = slots[selectorSinner.id] === id.name;
                    const tactics = getIdentityTactics(id);
                    const kws = detectKeywords(id);

                    return (
                      <div
                        key={id.name}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          isCurrentlyEquipped
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : 'bg-[#181111] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Image or Sinner Color Block */}
                          <div className="w-14 h-14 rounded-lg bg-black/60 border border-white/10 overflow-hidden flex-shrink-0 relative">
                            <img
                              src={getCardImageUrl(id)}
                              alt={id.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute top-0.5 left-0.5 px-1 rounded bg-black/70 text-[9px] font-bold text-amber-400">
                              {'★'.repeat(id.rarity || 1)}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white truncate block">
                                {id.name}
                              </span>
                              {isOwned ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                  Owned
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/10">
                                  Unowned
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                              {tactics.archetype || 'Combat Vanguard'}
                            </div>

                            {/* Keywords */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {kws.map(k => (
                                <span
                                  key={k}
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-gray-300 border border-white/10"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-2">
                          <button
                            onClick={() => setDossierIdentity(id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Tactics</span>
                          </button>
                          <button
                            onClick={() => {
                              setDeckSlot(selectorSinner.id, id.name);
                              setSelectorSinner(null);
                              setPickerSearch('');
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isCurrentlyEquipped
                                ? 'bg-amber-500 text-black'
                                : 'bg-white/10 hover:bg-amber-500 hover:text-black text-white'
                            }`}
                          >
                            {isCurrentlyEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Tactical Dossier Modal */}
      {dossierIdentity && (
        <IdDetailsModal
          idData={dossierIdentity}
          onClose={() => setDossierIdentity(null)}
        />
      )}
    </div>
  );
}

// Sub-component: Sinner Slot Card (Empty or Slotted)
function SinnerSlotCard({
  sinner,
  slotIndex,
  isFrontline,
  identity,
  onOpenSelector,
  onOpenDossier,
  onClearSlot
}) {
  if (!identity) {
    // EMPTY SLOT
    return (
      <div 
        onClick={onOpenSelector}
        className="group relative rounded-2xl border-2 border-dashed border-white/10 hover:border-amber-500/40 bg-[#120d0d]/60 hover:bg-[#150f0f] p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: sinner?.color || '#888' }} 
            />
            <span className="text-xs font-black font-limbus tracking-wider text-gray-300">
              #{String(slotIndex).padStart(2, '0')} {sinner?.name.toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">
            {isFrontline ? 'Frontline' : 'Support'}
          </span>
        </div>

        <div className="text-center py-4 space-y-1.5">
          <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-amber-500/20 text-gray-400 group-hover:text-amber-300 mx-auto flex items-center justify-center transition-colors border border-white/10 group-hover:border-amber-500/30">
            <Plus size={18} />
          </div>
          <div className="text-xs font-bold text-gray-400 group-hover:text-gray-200 transition-colors">
            Assign Identity
          </div>
        </div>

        <div className="text-[10px] text-center text-gray-600">
          Click to choose from {sinner?.name}'s pool
        </div>
      </div>
    );
  }

  // SLOTTED IDENTITY
  const tactics = getIdentityTactics(identity);
  const kws = detectKeywords(identity);
  const skills = identity.skills || [];

  return (
    <div 
      className="relative rounded-2xl border border-white/10 hover:border-amber-500/40 bg-[#140e0e] p-4 transition-all duration-200 flex flex-col justify-between min-h-[160px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] group overflow-hidden"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: sinner?.color || '#d97706'
      }}
    >
      {/* Top Bar: Sinner #, Name, Frontline badge */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black font-limbus tracking-wider text-gray-300 truncate">
            #{String(slotIndex).padStart(2, '0')} {sinner?.name.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {isFrontline ? 'Frontline' : 'Support'}
          </span>
        </div>
      </div>

      {/* Main Info: Image, Name, Stars, Archetype */}
      <div className="flex items-start gap-3 my-2.5">
        <div className="w-14 h-14 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0 relative shadow-inner">
          <img
            src={getCardImageUrl(identity)}
            alt={identity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-0.5 left-0.5 px-1 rounded bg-black/80 text-[8px] font-black text-amber-400">
            {'★'.repeat(identity.rarity || 1)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-white truncate leading-tight group-hover:text-amber-200 transition-colors" title={identity.name}>
            {identity.name}
          </div>
          <div className="text-[10px] text-amber-400 font-bold mt-0.5 truncate">
            {tactics.archetype}
          </div>

          {/* Keywords & Attack Types */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {kws.slice(0, 3).map(k => (
              <span
                key={k}
                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-gray-300 border border-white/10"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Strip: S1, S2, S3 with Sin Affinity colors and Damage Type */}
      <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 my-1">
        {skills.map((s, sIdx) => {
          const sinColor = SIN_COLORS[s.affinity] || '#888';
          const atkIcon = s.type === 'Slash' ? '🗡️' : s.type === 'Pierce' ? '🏹' : '🔨';
          return (
            <div
              key={sIdx}
              className="text-[10px] flex items-center justify-center gap-1 font-mono font-bold text-gray-300 py-0.5 rounded bg-white/[0.03]"
              title={`Skill ${sIdx + 1}: ${s.name} (${s.affinity} / ${s.type})`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sinColor }} />
              <span className="text-[9px]">{atkIcon}</span>
              <span className="text-[9px] text-gray-400">S{sIdx + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Action Buttons: Tactics, Swap, Clear */}
      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
        <button
          onClick={onOpenDossier}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.05)]"
        >
          <Swords size={12} />
          <span>Tactics</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSelector}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Swap Identity"
          >
            Swap
          </button>
          <button
            onClick={onClearSlot}
            className="p-1 rounded-lg bg-white/5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
            title="Clear Slot"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
