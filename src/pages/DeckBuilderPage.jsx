import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  X, 
  Search, 
  Filter, 
  Check, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Eye, 
  Layers, 
  Sparkles, 
  Swords, 
  AlertCircle, 
  Copy,
  Edit3,
  Shield,
  Zap
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
  getIdentityTactics,
  getIdentityAffiliation,
  AFFILIATION_RULES,
  detectSynergyPairs
} from '../utils/identityTactics.js';
import IdDetailsModal from '../components/IdDetailsModal.jsx';

// Canonical LimbusDeck Keyword Styling Colors
const LIMBUSDECK_KEYWORD_STYLES = {
  Burn: { bg: '#ef444410', color: '#ef4444', border: '#ef444440', activeBg: '#ef4444' },
  Bleed: { bg: '#dc262610', color: '#dc2626', border: '#dc262640', activeBg: '#dc2626' },
  Tremor: { bg: '#d9770610', color: '#d97706', border: '#d9770640', activeBg: '#d97706' },
  Rupture: { bg: '#22c55e10', color: '#22c55e', border: '#22c55e40', activeBg: '#22c55e' },
  Sinking: { bg: '#3b82f610', color: '#3b82f6', border: '#3b82f640', activeBg: '#3b82f6' },
  Poise: { bg: '#5ba8c810', color: '#5ba8c8', border: '#5ba8c840', activeBg: '#5ba8c8' },
  Charge: { bg: '#06b6d410', color: '#06b6d4', border: '#06b6d440', activeBg: '#06b6d4' }
};

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
    setDeckName,
    createDeckPreset,
    loadDeckPreset,
    deleteDeckPreset
  } = useStore();

  // Local UI State
  const [selectedKeyword, setSelectedKeyword] = useState(null); // Active keyword focus filter
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [selectorSinner, setSelectorSinner] = useState(null); // Sinner object when modal open
  const [dossierIdentity, setDossierIdentity] = useState(null); // Identity object for Tactical Dossier modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [shareToast, setShareToast] = useState(false);

  // Selector Modal Filters
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerKeyword, setPickerKeyword] = useState('All');
  const [pickerAttackType, setPickerAttackType] = useState('All');
  const [pickerAffiliation, setPickerAffiliation] = useState('All');
  const [pickerRarity, setPickerRarity] = useState('All');

  // Active Deck Data
  const currentDeck = activeDeck || savedDecks[0] || { id: 'default', name: 'Main Squad', slots: {} };
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

  // Comprehensive Team Synergy Analysis
  const synergyData = useMemo(() => {
    return analyzeTeamSynergy(allSlottedList);
  }, [allSlottedList]);

  // Handlers for Preset Management
  const handleStartRename = () => {
    setTempName(currentDeck.name || 'Main Squad');
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

  // Share squad composition
  const handleShareDeck = () => {
    const lines = [`[Limbus Tracker] ${currentDeck.name || 'Squad'} Composition:`];
    CANONICAL_SINNER_ORDER.forEach((sKey, i) => {
      const sinner = getSinnerInfo(sKey);
      const id = slottedIdentitiesMap[sKey];
      lines.push(`${i + 1}. ${sinner.name}: ${id ? id.name : '(Empty)'}`);
    });
    if (synergyData.dominantKeyword) {
      lines.push(`Dominant Archetype: ${synergyData.dominantKeyword[0]} (${synergyData.dominantKeyword[1]} members)`);
    }
    const text = lines.join('\n');
    navigator.clipboard?.writeText(text);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
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

      // Filter by Affiliation
      if (pickerAffiliation !== 'All') {
        const aff = getIdentityAffiliation(id.name);
        if (aff !== pickerAffiliation) return false;
      }

      // Filter by Rarity
      if (pickerRarity !== 'All') {
        const rVal = pickerRarity === '000' ? 3 : pickerRarity === '00' ? 2 : 1;
        if (id.rarity !== rVal) return false;
      }

      // Filter by Search Query
      if (pickerSearch.trim()) {
        const q = pickerSearch.toLowerCase();
        const matchesName = id.name.toLowerCase().includes(q);
        const matchesSkill = (id.skills || []).some(s => s.name?.toLowerCase().includes(q));
        const matchesAff = getIdentityAffiliation(id.name).toLowerCase().includes(q);
        if (!matchesName && !matchesSkill && !matchesAff) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort acquired first, then rarity (3 > 2 > 1)
      const aAcq = acquiredIds.has(a.name) ? 1 : 0;
      const bAcq = acquiredIds.has(b.name) ? 1 : 0;
      if (bAcq !== aAcq) return bAcq - aAcq;
      return (b.rarity || 0) - (a.rarity || 0);
    });
  }, [
    selectorSinner, 
    identitiesData, 
    onlyOwned, 
    acquiredIds, 
    pickerKeyword, 
    pickerAttackType, 
    pickerAffiliation, 
    pickerRarity, 
    pickerSearch
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 text-foreground">
      {/* Toast Notification */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-card border border-primary/40 shadow-xl px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-foreground"
          >
            <Check size={16} className="text-emerald-400" />
            <span>Squad composition copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title & Squad Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Deck Builder</h1>
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium">
            {allSlottedList.length}/12 Sinners
          </span>
        </div>

        {/* Squad Preset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={currentDeck.id}
              onChange={(e) => loadDeckPreset(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-ring cursor-pointer pr-7 text-foreground"
            >
              {savedDecks.map(deck => (
                <option key={deck.id} value={deck.id} className="bg-card text-foreground">
                  {deck.name || 'Unnamed Squad'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Rename Squad */}
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                className="bg-card border border-primary rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none w-28"
                placeholder="Squad name..."
                autoFocus
              />
              <button
                onClick={handleSaveRename}
                className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40 cursor-pointer"
                title="Save Name"
              >
                <Check size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartRename}
              className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Rename Squad"
            >
              <Edit3 size={14} />
            </button>
          )}

          {/* New Squad */}
          <button
            onClick={handleCreateNewSquad}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border hover:bg-muted text-xs font-medium transition-all cursor-pointer"
            title="Create New Squad"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Delete Squad */}
          {savedDecks.length > 1 && (
            <button
              onClick={handleDeleteSquad}
              className="p-1.5 rounded-lg border border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Delete Squad"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout Matching LimbusDeck */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6 lg:items-start">
        
        {/* LEFT COLUMN: Sticky Deck Board & 12 Sinner Slots */}
        <div className="lg:sticky lg:top-[72px] space-y-4">
          {/* Deck Action Card */}
          <div className="rounded-2xl border bg-card p-4 space-y-4 shadow-sm">
            {/* Keyword Deck Focus Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">Keyword Deck</span>
              <div className="flex gap-1.5 flex-wrap">
                {KEYWORDS.map(kw => {
                  const style = LIMBUSDECK_KEYWORD_STYLES[kw] || { bg: '#66666610', color: '#888', border: '#66666640', activeBg: '#666' };
                  const isSelected = selectedKeyword === kw;
                  return (
                    <button
                      key={kw}
                      onClick={() => setSelectedKeyword(isSelected ? null : kw)}
                      style={{
                        backgroundColor: isSelected ? style.activeBg : style.bg,
                        color: isSelected ? '#ffffff' : style.color,
                        border: `1px solid ${isSelected ? style.activeBg : style.border}`
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer hover:brightness-110 active:scale-95 shadow-xs"
                    >
                      {kw}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: My Pool Only, Clear All, Share (NO Auto-Fill!) */}
            <div className="flex gap-2 items-center">
              {/* My Pool Only Toggle */}
              <button
                onClick={() => setOnlyOwned(!onlyOwned)}
                className={`flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all truncate cursor-pointer ${
                  onlyOwned
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                My Pool Only {onlyOwned && `(${acquiredIds.size})`}
              </button>

              {/* Clear All Button */}
              {showClearConfirm ? (
                <div className="flex-1 flex items-center gap-1 bg-destructive/10 border border-destructive/40 px-2 py-1 rounded-lg">
                  <span className="text-[11px] text-destructive font-medium mr-1">Clear all?</span>
                  <button
                    onClick={() => {
                      clearAllDeckSlots();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground font-semibold text-xs cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground font-semibold text-xs cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={allSlottedList.length === 0}
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border font-medium text-xs sm:text-sm hover:bg-muted/50 transition-all active:scale-95 truncate disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Clear All
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={handleShareDeck}
                aria-label="Share"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs sm:text-sm hover:bg-muted/50 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Share</span>
              </button>
            </div>
          </div>

          {/* 12 Sinner Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {CANONICAL_SINNER_ORDER.map((sinnerKey, idx) => {
              const sinner = getSinnerInfo(sinnerKey);
              const assignedIdentity = slottedIdentitiesMap[sinnerKey];
              const isHighlightKeyword = selectedKeyword && assignedIdentity 
                ? detectKeywords(assignedIdentity).includes(selectedKeyword)
                : false;

              if (!assignedIdentity) {
                // EMPTY SLOT (Exact LimbusDeck Styling)
                return (
                  <div
                    key={sinnerKey}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectorSinner(sinner);
                      setPickerKeyword(selectedKeyword || 'All');
                    }}
                    className="relative rounded-xl border-2 p-2 text-left transition-all duration-200 overflow-hidden border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30 cursor-pointer group"
                    aria-label={sinner.name}
                  >
                    <div className="flex flex-col items-center justify-center py-3 gap-1">
                      <div 
                        className="w-8 h-8 rounded-lg overflow-hidden opacity-50 flex items-center justify-center relative bg-muted transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${sinner.color}30` }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: sinner.color }} 
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        {sinner.name}
                      </span>
                    </div>
                  </div>
                );
              }

              // SLOTTED IDENTITY (LimbusDeck Card Layout with Affiliation & Tactics)
              const aff = getIdentityAffiliation(assignedIdentity.name);
              const kws = detectKeywords(assignedIdentity);
              const skills = assignedIdentity.skills || [];

              return (
                <div
                  key={sinnerKey}
                  className={`relative rounded-xl border p-2 text-left transition-all duration-200 overflow-hidden bg-card hover:border-muted-foreground/40 group flex flex-col justify-between shadow-xs ${
                    isHighlightKeyword ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                  style={{
                    borderLeft: `3px solid ${sinner.color}`
                  }}
                >
                  {/* Slot Header: Sinner Name & Clear Button */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground truncate">
                      {sinner.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDeckSlot(sinnerKey);
                      }}
                      className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Clear slot"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Thumbnail + Identity Name + Affiliation */}
                  <div 
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => {
                      setSelectorSinner(sinner);
                      setPickerKeyword(selectedKeyword || 'All');
                    }}
                    title="Click to swap identity"
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 relative bg-muted border border-border/60">
                      <img
                        src={getCardImageUrl(assignedIdentity)}
                        alt={assignedIdentity.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-0.5 left-0.5 px-1 rounded bg-black/80 text-[8px] font-bold text-amber-400">
                        {'★'.repeat(assignedIdentity.rarity || 1)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors" title={assignedIdentity.name}>
                        {assignedIdentity.name}
                      </div>
                      {/* Affiliation / Trait Badge */}
                      <div className="text-[10px] text-amber-400/90 font-medium truncate mt-0.5" title={aff}>
                        {aff}
                      </div>
                      {/* Attack Types & Sins */}
                      <div className="flex items-center gap-1 mt-1">
                        {skills.slice(0, 3).map((s, sIdx) => {
                          const sinCol = SIN_COLORS[s.affinity] || '#888';
                          const atkIcon = s.type === 'Slash' ? '🗡️' : s.type === 'Pierce' ? '🏹' : '🔨';
                          return (
                            <span 
                              key={sIdx} 
                              className="w-2 h-2 rounded-full inline-block shrink-0" 
                              style={{ backgroundColor: sinCol }}
                              title={`S${sIdx + 1}: ${s.affinity} / ${s.type}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Keywords & Tactics Button */}
                  <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-border/40">
                    <div className="flex items-center gap-1 flex-wrap min-w-0">
                      {kws.slice(0, 2).map(k => (
                        <span 
                          key={k} 
                          className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground truncate"
                        >
                          {k}
                        </span>
                      ))}
                    </div>

                    {/* Tactics Dossier Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDossierIdentity(assignedIdentity);
                      }}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer shrink-0"
                      title="Open Tactical Dossier"
                    >
                      <Eye size={11} />
                      <span>Tactics</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (380px Sidebar Matching LimbusDeck) */}
        <div className="space-y-4">
          
          {/* 1. Synergy Map */}
          <div className="rounded-2xl border bg-card p-4 overflow-hidden shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Synergy Map
            </h3>
            {allSlottedList.length < 2 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-muted-foreground text-center">
                  Select 2+ members<br />to see synergy map
                </p>
              </div>
            ) : (
              <SynergyNetworkMap slottedIdentities={allSlottedList} />
            )}
          </div>

          {/* 2. Keyword Coverage */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Keyword Coverage
            </h3>
            {allSlottedList.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Select members
              </div>
            ) : (
              <div className="space-y-2.5">
                {KEYWORDS.map(kw => {
                  const count = synergyData.keywordCounts[kw] || 0;
                  const ratio = allSlottedList.length > 0 ? (count / allSlottedList.length) * 100 : 0;
                  const style = LIMBUSDECK_KEYWORD_STYLES[kw];
                  const isDominant = count >= 3;

                  return (
                    <div key={kw} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span 
                            className="w-2 h-2 rounded-full inline-block" 
                            style={{ backgroundColor: style?.color || '#888' }} 
                          />
                          <span className={count > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                            {kw}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isDominant && (
                            <span 
                              className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider"
                              style={{ backgroundColor: style?.bg, color: style?.color, border: `1px solid ${style?.border}` }}
                            >
                              Core Focus
                            </span>
                          )}
                          <span className="text-xs font-mono text-muted-foreground">
                            {count} IDs
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${ratio}%`,
                            backgroundColor: style?.color || '#888'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Affiliation / Faction Synergies */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Faction Synergy
              </h3>
              {synergyData.activeAffiliations.length > 0 && (
                <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {synergyData.activeAffiliations.length} Active
                </span>
              )}
            </div>

            {allSlottedList.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Select members
              </div>
            ) : synergyData.activeAffiliations.length === 0 ? (
              <div className="text-xs text-muted-foreground py-3 text-center">
                No faction synergies active. Slot 2+ identities from The Thumb, Blade Lineage, Zwei, W Corp, etc.
              </div>
            ) : (
              <div className="space-y-3">
                {synergyData.activeAffiliations.map(aff => (
                  <div 
                    key={aff.name}
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Shield size={12} className="text-amber-400" />
                        <span>{aff.name}</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        {aff.count} {aff.count === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {aff.desc}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aff.members.map(m => (
                        <span key={m} className="text-[9px] px-1.5 py-0.2 rounded bg-card border text-muted-foreground truncate max-w-[140px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Sin Distribution */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Sin Distribution
            </h3>
            {allSlottedList.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">-</div>
            ) : (
              <div className="space-y-3">
                {/* Attack Types Balance */}
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/60">
                  {[
                    { label: 'Slash', count: synergyData.attackCounts.Slash, icon: '🗡️', col: 'text-red-400' },
                    { label: 'Pierce', count: synergyData.attackCounts.Pierce, icon: '🏹', col: 'text-amber-400' },
                    { label: 'Blunt', count: synergyData.attackCounts.Blunt, icon: '🔨', col: 'text-blue-400' }
                  ].map(atk => (
                    <div key={atk.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm">{atk.icon}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">{atk.label}</div>
                      <div className={`text-xs font-bold font-mono ${atk.col}`}>{atk.count}</div>
                    </div>
                  ))}
                </div>

                {/* Sins Spectrum */}
                <div className="space-y-1.5">
                  {Object.entries(synergyData.sinCounts).map(([sin, count]) => {
                    const color = SIN_COLORS[sin] || '#666';
                    const maxSins = Math.max(...Object.values(synergyData.sinCounts), 1);
                    const pct = (count / maxSins) * 100;

                    return (
                      <div key={sin} className="flex items-center gap-2 text-xs">
                        <span className="w-16 font-medium text-[11px] flex items-center gap-1" style={{ color }}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          {sin}
                        </span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                        <span className="w-5 text-right font-mono text-muted-foreground text-[11px]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Synergy Pairs */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Synergy Pairs
            </h3>
            {allSlottedList.length < 2 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">Need 2+ members</div>
            ) : synergyData.synergyPairs.length === 0 ? (
              <div className="text-xs text-muted-foreground py-3 text-center">
                No specific pair gimmicks detected. Focus on matching dominant keywords or resonance.
              </div>
            ) : (
              <div className="space-y-2.5">
                {synergyData.synergyPairs.map((pair, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {pair.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-primary/20 text-primary border border-primary/30">
                        {pair.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {pair.duo.join(' + ')}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight pt-0.5">
                      {pair.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Resonance (Exact LimbusDeck Styling with 0.3 Inactive Opacity) */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Resonance
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              {['Wrath', 'Lust', 'Sloth', 'Gluttony', 'Gloom', 'Pride', 'Envy'].map(sin => {
                const count = synergyData.sinCounts[sin] || 0;
                const color = SIN_COLORS[sin] || '#888';
                const isHighRes = count >= 4;
                const isActive = count > 0;

                return (
                  <div
                    key={sin}
                    style={
                      isActive
                        ? {
                            backgroundColor: `${color}15`,
                            color: color,
                            border: `1px solid ${color}60`,
                            opacity: 1
                          }
                        : {
                            backgroundColor: 'transparent',
                            color: 'var(--muted-foreground)',
                            border: '1px solid var(--border)',
                            opacity: 0.3
                          }
                    }
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-300 flex items-center gap-1.5"
                  >
                    <span>{sin}</span>
                    <span className="font-mono font-bold">{count}</span>
                    {isHighRes && (
                      <span className="text-[8px] font-bold uppercase bg-amber-500/30 text-amber-300 px-1 rounded">
                        ⚡ A-Res
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. Analyze Card */}
          <div data-slot="card" className="flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm">
            <div data-slot="card-header" className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pb-2">
              <div data-slot="card-title" className="font-semibold text-base">Analyze</div>
            </div>
            <div data-slot="card-content" className="px-6 space-y-3">
              {allSlottedList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select identities to see analysis</p>
              ) : (
                <SquadTacticalSummary 
                  slottedCount={allSlottedList.length}
                  synergyData={synergyData}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Identity Picker Modal with Full Affiliation & Rarity Filters */}
      <AnimatePresence>
        {selectorSinner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div 
                className="p-4 sm:p-5 border-b border-border flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${selectorSinner.color}25 0%, transparent 100%)` }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs border"
                    style={{ backgroundColor: `${selectorSinner.color}40`, borderColor: selectorSinner.color }}
                  >
                    #{String(selectorSinner.number).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      Choose Identity for {selectorSinner.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Filter this sinner's identities by keyword, attack type, or affiliation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectorSinner(null);
                    setPickerSearch('');
                  }}
                  className="p-1.5 rounded-xl border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Filters */}
              <div className="p-3 sm:p-4 border-b border-border bg-muted/20 space-y-3">
                {/* Search Input & Affiliation Dropdown */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative flex-1 w-full">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search identity, skill, or trait..."
                      className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Affiliation Dropdown */}
                  <div className="relative w-full sm:w-56">
                    <select
                      value={pickerAffiliation}
                      onChange={(e) => setPickerAffiliation(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer pr-7"
                    >
                      <option value="All">All Affiliations</option>
                      {AFFILIATION_RULES.map(rule => (
                        <option key={rule.key} value={rule.key}>
                          {rule.key}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Rarity Filter */}
                  <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-0.5">
                    {['All', '000', '00', '0'].map(r => (
                      <button
                        key={r}
                        onClick={() => setPickerRarity(r)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          pickerRarity === r
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword & Attack Type Rows */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* Keyword Pills */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-1">Keyword:</span>
                    {['All', ...KEYWORDS].map(kw => {
                      const isSelected = pickerKeyword === kw;
                      return (
                        <button
                          key={kw}
                          onClick={() => setPickerKeyword(kw)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                              : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                          }`}
                        >
                          {kw}
                        </button>
                      );
                    })}
                  </div>

                  {/* Attack Type Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-1">Attack:</span>
                    {['All', 'Slash', 'Pierce', 'Blunt'].map(atk => (
                      <button
                        key={atk}
                        onClick={() => setPickerAttackType(atk)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                          pickerAttackType === atk
                            ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                            : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {atk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Candidate Grid */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {availableCandidatesForSinner.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                    No matching identities found. Adjust your filters or search query.
                  </div>
                ) : (
                  availableCandidatesForSinner.map(id => {
                    const isOwned = acquiredIds.has(id.name);
                    const isCurrentlyEquipped = slots[selectorSinner.id] === id.name;
                    const aff = getIdentityAffiliation(id.name);
                    const kws = detectKeywords(id);
                    const skills = id.skills || [];

                    return (
                      <div
                        key={id.name}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          isCurrentlyEquipped
                            ? 'bg-primary/10 border-primary/60 shadow-sm'
                            : 'bg-card border-border hover:border-muted-foreground/40'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative bg-muted border border-border/80">
                            <img
                              src={getCardImageUrl(id)}
                              alt={id.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute top-0.5 left-0.5 px-1 rounded bg-black/80 text-[8px] font-bold text-amber-400">
                              {'★'.repeat(id.rarity || 1)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-foreground truncate block" title={id.name}>
                                {id.name}
                              </span>
                              {isOwned ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                                  Owned
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                                  Unowned
                                </span>
                              )}
                            </div>

                            {/* Affiliation / Faction Badge */}
                            <div className="text-[10px] text-amber-400 font-medium mt-0.5 truncate">
                              {aff}
                            </div>

                            {/* Keywords & Sins */}
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {kws.map(k => (
                                <span
                                  key={k}
                                  className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Skill Affinity Strip */}
                        <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-border/40">
                          {skills.map((s, sIdx) => {
                            const sinCol = SIN_COLORS[s.affinity] || '#888';
                            const atkIcon = s.type === 'Slash' ? '🗡️' : s.type === 'Pierce' ? '🏹' : '🔨';
                            return (
                              <div key={sIdx} className="flex items-center gap-1 text-[10px] text-muted-foreground mr-2 font-mono">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: sinCol }} />
                                <span>{atkIcon}</span>
                                <span>S{sIdx + 1}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Modal Card Actions */}
                        <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-2">
                          <button
                            onClick={() => setDossierIdentity(id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
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
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isCurrentlyEquipped
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border'
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

      {/* Tactical Dossier Modal */}
      {dossierIdentity && (
        <IdDetailsModal
          idData={dossierIdentity}
          onClose={() => setDossierIdentity(null)}
        />
      )}
    </div>
  );
}

// Visual SVG Interactive Synergy Constellation Map
function SynergyNetworkMap({ slottedIdentities }) {
  const width = 340;
  const height = 210;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 78;

  const total = slottedIdentities.length;

  // Compute node positions on circle
  const nodes = useMemo(() => {
    return slottedIdentities.map((id, i) => {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const sinner = getSinnerInfo(id.sinner);
      const kws = detectKeywords(id);
      const aff = getIdentityAffiliation(id.name);
      return {
        id,
        name: id.name,
        sinner,
        kws,
        aff,
        x,
        y
      };
    });
  }, [slottedIdentities, total, centerX, centerY, radius]);

  // Compute connection links
  const links = useMemo(() => {
    const list = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

        // Check shared keyword
        const sharedKw = a.kws.find(k => b.kws.includes(k));
        // Check shared affiliation
        const sharedAff = a.aff !== 'Independent Fixer' && a.aff === b.aff;

        if (sharedKw || sharedAff) {
          const color = sharedAff 
            ? '#f59e0b' 
            : (LIMBUSDECK_KEYWORD_STYLES[sharedKw]?.color || '#3b82f6');
          list.push({
            x1: a.x,
            y1: a.y,
            color,
            label: sharedAff ? a.aff : sharedKw
          });
        }
      }
    }
    return list;
  }, [nodes]);

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="overflow-visible">
        {/* Connection Edges */}
        {links.map((link, idx) => (
          <line
            key={idx}
            x1={link.x1}
            y1={link.y1}
            x2={centerX}
            y2={centerY}
            stroke={link.color}
            strokeWidth={1.5}
            strokeOpacity={0.4}
          />
        ))}

        {/* Outer Orbit Circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border/40"
          strokeDasharray="4 4"
        />

        {/* Center Hub Indicator */}
        <circle
          cx={centerX}
          cy={centerY}
          r={16}
          fill="var(--card)"
          stroke="var(--primary)"
          strokeWidth={1.5}
          className="shadow-sm"
        />
        <text
          x={centerX}
          y={centerY + 4}
          textAnchor="middle"
          className="fill-foreground font-mono text-[9px] font-bold pointer-events-none"
        >
          {links.length}
        </text>

        {/* Sinner Nodes */}
        {nodes.map((node, idx) => (
          <g key={idx} className="cursor-pointer">
            <circle
              cx={node.x}
              cy={node.y}
              r={12}
              fill={node.sinner?.color || '#555'}
              stroke="#ffffff"
              strokeWidth={1.2}
              opacity={0.9}
            />
            <text
              x={node.x}
              y={node.y + 3.5}
              textAnchor="middle"
              className="fill-white font-mono text-[8px] font-bold pointer-events-none"
            >
              #{node.sinner?.number}
            </text>
          </g>
        ))}
      </svg>
      <div className="text-[11px] text-muted-foreground text-center mt-2">
        {links.length} active resonance links across {total} fielded Sinners
      </div>
    </div>
  );
}

// Tactical Squad Summary Inside Analyze Card
function SquadTacticalSummary({ slottedCount, synergyData }) {
  const { dominantKeyword, sinCounts, attackCounts, activeAffiliations, synergyPairs } = synergyData;

  const highestSin = Object.entries(sinCounts).sort((a, b) => b[1] - a[1])[0];
  const maxAtk = Object.entries(attackCounts).sort((a, b) => b[1] - a[1])[0];
  const minAtk = Object.entries(attackCounts).sort((a, b) => a[1] - b[1])[0];

  return (
    <div className="space-y-3">
      {/* Squad Archetype Rating */}
      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/80 space-y-1">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Primary Composition
        </div>
        <div className="text-sm font-bold text-foreground flex items-center justify-between">
          <span>
            {dominantKeyword ? `${dominantKeyword[0]} Archetype` : 'Hybrid Vanguard Squad'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-mono font-semibold">
            {dominantKeyword ? `${dominantKeyword[1]}/12 Synergy` : 'Balanced'}
          </span>
        </div>
      </div>

      {/* Sin Resonance Advice */}
      <div className="text-xs space-y-1">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <Zap size={13} className="text-amber-400" />
          <span>Resonance Viability:</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {highestSin && highestSin[1] >= 4 ? (
            <span className="text-amber-300 font-semibold">
              Absolute Resonance ready: {highestSin[0]} ({highestSin[1]} skills) provides guaranteed high-tier coin bonuses!
            </span>
          ) : (
            <span>
              Highest affinity is {highestSin ? `${highestSin[0]} (${highestSin[1]} skills)` : 'None'}. Aim for 4+ skills in one Sin to unlock Absolute Resonance.
            </span>
          )}
        </p>
      </div>

      {/* Damage Blindspots */}
      <div className="text-xs space-y-1">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <Swords size={13} className="text-amber-400" />
          <span>Damage Profile:</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {minAtk && minAtk[1] <= 1 ? (
            <span>
              Squad is heavily weighted toward {maxAtk ? maxAtk[0] : 'one type'}. Low <strong className="text-foreground">{minAtk[0]} ({minAtk[1]})</strong> coverage may struggle against resistant bosses.
            </span>
          ) : (
            <span>
              Balanced damage spread ({attackCounts.Slash} Slash, {attackCounts.Pierce} Pierce, {attackCounts.Blunt} Blunt).
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
