import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Share2, Download, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { encodePartyState, decodePartyState, SINNER_META } from '../../utils/limbusDeckEngine.js';

export default function DeckShareModal({
  isOpen,
  onClose,
  activeSquadSlots = [],
  partySize = 7,
  primaryKeywords = [],
  identitiesData = [],
  onImportSquad
}) {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState(null);

  // Encode current squad
  const currentDeckCode = useMemo(() => {
    return encodePartyState({
      partySize,
      primaryKeywords,
      slots: activeSquadSlots
    });
  }, [partySize, primaryKeywords, activeSquadSlots]);

  const limbusDeckUrl = `https://limbusdeck.com/en/build?b=${currentDeckCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(limbusDeckUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentDeckCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {}
  };

  const handleCopyMarkdown = async () => {
    try {
      const activeMembers = activeSquadSlots.filter(s => s.identity);
      const lines = [
        `**Limbus Tracker Squad Formation (${activeMembers.length} Sinners)**`,
        `*Target Keywords:* ${primaryKeywords.join(', ') || 'General / Balanced'}`,
        `*Deck Code:* \`${currentDeckCode}\``,
        `*LimbusDeck Link:* ${limbusDeckUrl}`,
        '',
        '**Deployed Roster:**',
        ...activeMembers.map((s, idx) => `${idx + 1}. **${s.identity.sinner}** — ${s.identity.name} (★${s.identity.rarity || 3})`)
      ];
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {}
  };

  // Preview decoded input
  const parsedImport = useMemo(() => {
    if (!importInput.trim()) {
      setImportError(null);
      return null;
    }

    // Extract b= parameter if pasted a full URL
    let code = importInput.trim();
    if (code.includes('b=')) {
      try {
        const u = new URL(code);
        code = u.searchParams.get('b') || code;
      } catch (err) {
        const match = code.match(/[?&]b=([A-Za-z0-9_-]+)/);
        if (match) code = match[1];
      }
    }

    const decoded = decodePartyState(code);
    if (!decoded) {
      setImportError('Invalid deck code or URL format. Could not decode.');
      return null;
    }

    setImportError(null);

    // Resolve identities
    const squad = [];
    decoded.identityIds.forEach((ldId, sIdx) => {
      const sinner = SINNER_META[sIdx];
      if (ldId > 0) {
        const found = identitiesData.find(id => id.ldId === ldId);
        if (found) {
          squad.push({ sinnerId: sIdx + 1, sinner, identity: found });
        }
      }
    });

    return {
      partySize: decoded.partySize,
      primaryKeywords: decoded.primaryKeywords,
      squad
    };
  }, [importInput, identitiesData]);

  const handleApplyImport = () => {
    if (parsedImport && onImportSquad) {
      onImportSquad(parsedImport);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-[#15120c] to-[#0c0c0e] border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 flex items-center gap-1">
                <Share2 size={12} /> Base64URL Deck Protocol
              </span>
              <span className="text-xs text-gray-400 font-mono">
                100% LimbusDeck Bi-Directional Compatible
              </span>
            </div>
            <h2 className="text-2xl font-black font-limbus text-white">
              Export & Import Squad Formations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Section 1: Export Current Squad */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#c9a84c] block">
              1. Export Active Squad Code
            </span>

            <div className="p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-gray-300 break-all select-all">
              {currentDeckCode}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-[#c9a84c] hover:bg-[#d4b96b] text-black font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy LimbusDeck URL'}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Raw Code'}</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedText ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedText ? 'Markdown Copied!' : 'Copy Markdown Text'}</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* Section 2: Import Code or URL */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#c9a84c] block">
              2. Import Deck Code or LimbusDeck URL
            </span>

            <textarea
              rows={3}
              placeholder="Paste any LimbusDeck share URL (e.g. https://limbusdeck.com/en/build?b=...) or raw base64 deck code..."
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              className="w-full bg-[#121216] border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder-gray-500 focus:border-[#c9a84c] outline-none"
            />

            {importError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {parsedImport && (
              <div className="p-4 rounded-xl bg-[#141418] border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">
                    Parsed Squad: <strong className="text-[#c9a84c]">{parsedImport.squad.length} Sinners</strong>
                  </span>
                  <span className="font-mono text-gray-400 text-[11px]">
                    Size: {parsedImport.partySize} | Keywords: {parsedImport.primaryKeywords.join(', ') || 'None'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {parsedImport.squad.map(({ sinner, identity }) => (
                    <span
                      key={sinner.id}
                      className="px-2 py-1 rounded bg-black/70 border border-white/10 text-[11px] font-bold text-gray-200"
                    >
                      <span style={{ color: sinner.color }}>{sinner.name}</span>: {identity.name}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleApplyImport}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Download size={15} /> Apply Formation to Active Deck
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
