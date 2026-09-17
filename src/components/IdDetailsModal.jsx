import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShardabilityStatus } from '../utils/limbusCalculator.js';
import { getIdentityTactics, KEYWORD_THEMES } from '../utils/identityTactics.js';

const KEYWORD_COLORS = { Burn: '#ef4444', Bleed: '#dc2626', Tremor: '#eab308', Poise: '#22c55e', Charge: '#a855f7', Rupture: '#0ea5e9', Sinking: '#3b82f6' };
const SIN_COLORS = { Wrath: '#dc2626', Lust: '#ea580c', Sloth: '#ca8a04', Gluttony: '#16a34a', Gloom: '#0ea5e9', Pride: '#4f46e5', Envy: '#9333ea' };

function generateSlug(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function IdDetailsModal({ idData, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [navSection, setNavSection] = useState('tactics');
  const tactics = React.useMemo(() => getIdentityTactics(idData), [idData]);

  const slug = idData.slug || generateSlug(idData.name);
  const rarity = idData.rarity || 3;
  const bgUrl = `https://assets.limbusdeck.com/identities/${rarity === 1 ? 'full' : 'full-uptied'}/${slug}.webp`;

  const skills = idData.skills || [];
  const passives = idData.passives || [];
  const alternateSkills = idData.alternateSkills || [];
  
  const defenseSkill = idData.defense || null;
  const attackSkills = skills;

  const renderSkillBlock = (skill, idx, isAlt = false) => {
    if (!skill) return null;
    
    // Parse effects string for UI triggers if any
    const renderEffectLine = (effStr, i) => {
        if (typeof effStr !== 'string') effStr = String(effStr);
        // Find triggers like [On Hit], [Clash Win]
        const triggerMatch = effStr.match(/^\[(.*?)\]\s*(.*)$/);
        let trigger = null;
        let text = effStr;
        if (triggerMatch) {
            trigger = triggerMatch[1];
            text = triggerMatch[2];
        }

        return (
            <div key={i} className="flex gap-3 text-sm text-gray-300">
                <div className="shrink-0 w-20 pt-0.5">
                    {trigger ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded border border-[#c9a84c]/30 text-center inline-block min-w-full">
                            {trigger}
                        </span>
                    ) : (
                        <div className="flex items-center gap-1.5 justify-center">
                            <span className="text-[10px] font-bold text-gray-500">EFFECT</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 leading-relaxed">
                    {text}
                </div>
            </div>
        );
    };

    return (
      <>
      <div key={skill.name} className="mb-6 rounded-lg overflow-hidden border border-[#333] bg-[#0a0a0a]">
        <div className="flex justify-between items-center p-3 border-b border-[#333] bg-black/40">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: SIN_COLORS[skill.affinity] || '#fff' }}></span>
                <span className="text-sm font-bold text-white">{skill.affinity || 'Unknown'}</span>
             </div>
             <span className="text-[#333]">|</span>
             <span className="text-sm font-bold text-gray-300">{skill.type || 'Unknown'}</span>
             {(() => {
               const st = tactics?.skillsTactical?.[idx];
               if (!st || isAlt) return null;
               return (
                 <span className="ml-2 text-[10px] font-bold text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/30 px-2 py-0.5 rounded shadow-sm">
                   {st.roleTag}
                 </span>
               );
             })()}
          </div>
        </div>

        <div className="p-4 border-b border-[#333] bg-gradient-to-r from-[#111] to-black">
           <div className="flex justify-between items-center">
             <div>
               <h4 className="text-2xl font-black text-white tracking-wide">{skill.name}</h4>
               {(() => {
                 const st = tactics?.skillsTactical?.[idx];
                 if (!st || isAlt) return null;
                 return (
                   <p className="text-xs text-gray-400 mt-1 italic">{st.tacticalSummary}</p>
                 );
               })()}
             </div>
             
             <div className="flex items-center gap-4 bg-black/80 px-4 py-2 rounded-lg border border-[#333] shadow-inner">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Base</span>
                    <span className="text-xl font-bold text-white">{skill.basePower !== undefined ? skill.basePower : '?'}</span>
                 </div>
                 <span className="text-xl font-black text-[#c9a84c]">+</span>
                 <div className="flex flex-col min-w-[80px]">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Coin</span>
                    <div className="flex items-center gap-1 justify-center">
                       <div className="flex gap-0.5">
                         {Array.from({ length: skill.coins || 1 }).map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-[#c9a84c] bg-[#c9a84c]/20 shadow-[0_0_5px_rgba(201,168,76,0.2)]"></div>
                         ))}
                       </div>
                        {skill.coinPower > 0 ? (
                          <span className="text-lg font-bold text-white ml-2">x +{skill.coinPower}</span>
                        ) : skill.coinPower < 0 ? (
                          <span className="text-lg font-bold text-red-400 ml-2">x {skill.coinPower}</span>
                        ) : null}
                    </div>
                 </div>
                 <span className="text-xl font-black text-gray-600">=</span>
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Max</span>
                    <span className="text-xl font-black text-yellow-500">
                        {skill.basePower !== undefined && skill.coinPower !== undefined && skill.coins !== undefined 
                            ? (skill.coinPower < 0 ? `${skill.basePower} (Tails Max)` : (skill.basePower + (skill.coinPower * skill.coins))) 
                            : '?'}
                    </span>
                 </div>
             </div>
           </div>
        </div>

        {skill.effects && skill.effects.length > 0 && (
          <div className="p-4 flex flex-col gap-3 bg-[#0a0a0a]">
            {skill.effects.map((eff, i) => renderEffectLine(eff, i))}
          </div>
        )}
      </div>
      
      {/* ALTERNATE SKILLS — slot/index based, no fragile name matching */}
      {!isAlt && alternateSkills && alternateSkills.length > 0 && (() => {
        const tabIdx = idx;
        const relevant = alternateSkills.filter(alt => {
          if (alt.slot !== undefined && alt.slot !== null) return alt.slot === tabIdx;
          if (alt.replaces !== undefined && alt.replaces !== null) return alt.replaces === tabIdx;
          // No positional data — show under last skill tab only
          return tabIdx === (attackSkills.length - 1);
        });
        if (!relevant.length) return null;
        return relevant.map((alt, altIdx) => (
          <div key={`alt-${altIdx}`} className="mt-6 mb-6 rounded-lg overflow-hidden border-2 border-dashed border-[#c9a84c]/50 bg-black/40 p-1">
            <div className="text-[11px] text-[#c9a84c] uppercase tracking-widest font-bold mb-1 mt-1 ml-2">Alternate / Enhanced Skill</div>
            {renderSkillBlock(alt, idx, true)}
          </div>
        ));
      })()}
    </>
  );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-6 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-7xl w-full h-[90vh] flex flex-col md:flex-row bg-[#0a0a0a] border border-[#333] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl" onClick={e => e.stopPropagation()}>
        
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-2xl pointer-events-none scale-110" style={{ backgroundImage: `url(${bgUrl})` }} />

        <div className="w-full md:w-[350px] shrink-0 border-r border-[#333] flex flex-col bg-black/60 relative z-10 overflow-y-auto custom-scrollbar">
            <div className="relative w-full aspect-[2/3] group cursor-crosshair border-b border-[#333]">
                <img src={bgUrl} className="w-full h-full object-cover transition-opacity duration-300 absolute inset-0 opacity-100" alt="Art" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-[#000000aa] to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#c9a84c] text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Identity</span>
                      <span className="text-yellow-500 text-sm drop-shadow-md">{'★'.repeat(idData.rarity || 1)}</span>
                   </div>
                   <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">{idData.name}</h2>
                   {(() => {
                     const shardStatus = getShardabilityStatus(idData);
                     return (
                       <div className="mt-1.5 flex flex-wrap items-center gap-2">
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider ${
                           shardStatus.reason === 'walpurgis'
                             ? 'bg-purple-950/90 text-purple-300 border border-purple-600/60'
                             : shardStatus.reason === 'previous_season'
                             ? 'bg-zinc-900/90 text-zinc-300 border border-zinc-600'
                             : shardStatus.reason === 'current_season'
                             ? 'bg-amber-950/90 text-amber-300 border border-amber-500/80'
                             : shardStatus.reason === 'standard'
                             ? 'bg-gray-900/80 text-gray-400 border border-gray-700'
                             : 'bg-black/70 text-gray-300 border border-white/20'
                         }`}>
                           {shardStatus.fullBadge}
                         </span>
                         <span className={`text-xs font-semibold ${
                           shardStatus.shardable ? 'text-green-400' : 'text-amber-400'
                         }`}>
                           ● {shardStatus.message}
                         </span>
                       </div>
                     );
                   })()}
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
                <div className="bg-[#111] border border-[#333] rounded-lg p-4 space-y-2.5">
                   <h3 className="text-[10px] text-[#c9a84c] uppercase tracking-widest font-bold mb-1">Combat Profile</h3>
                   <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                       <span className="text-xs text-gray-500 font-medium">HP</span>
                       <span className="text-green-400 font-bold text-sm">{idData.hp || '?'}</span>
                   </div>
                   <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                       <span className="text-xs text-gray-500 font-medium">Speed</span>
                       <span className="text-yellow-400 font-bold text-sm">{idData.speed || '?'}</span>
                   </div>
                   <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                       <span className="text-xs text-gray-500 font-medium">Defense</span>
                       <span className="text-gray-200 font-bold text-xs">
                         {defenseSkill ? `${defenseSkill.type || 'Guard'} (${defenseSkill.affinity || 'None'})` : 'None'}
                       </span>
                   </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#222]">
                        <span className="text-xs text-gray-500 font-medium">Max Clash</span>
                        <span className="text-amber-400 font-black text-sm">
                          {skills.reduce((max, s) => {
                            const p = (s.coinPower || 0) < 0 ? (s.basePower || 0) : (s.basePower || 0) + (s.coinPower || 0) * (s.coins || 1);
                            return Math.max(max, p);
                          }, 0)}
                        </span>
                    </div>
                   <div>
                       <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Archetype</span>
                       <div className="flex flex-wrap gap-1">
                         {tactics.primaryKeywords.map(kw => {
                           const theme = KEYWORD_THEMES[kw];
                           return (
                             <span key={kw} className={`text-[10px] font-bold px-2 py-0.5 rounded ${theme?.bg || 'bg-white/10'} ${theme?.text || 'text-white'} border ${theme?.border || 'border-white/20'}`}>
                               {theme?.icon || '✦'} {kw}
                             </span>
                           );
                         })}
                       </div>
                   </div>
                </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col relative z-10 bg-[#0a0a0a]/90 overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-[#333] bg-black/60 flex-wrap gap-3">
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                   {navSection === 'tactics' ? 'Tactical Dossier' : navSection === 'skills' ? 'Combat Skills' : navSection === 'defense' ? 'Defense Skill' : 'Passives'}
                </h3>
                
                <div className="flex bg-[#111] p-1 rounded-lg border border-[#333] shadow-md">
                   {['tactics', 'skills', 'defense', 'passives'].map(sec => (
                     <button 
                        key={sec}
                        onClick={() => setNavSection(sec)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md uppercase tracking-widest transition-all ${navSection === sec ? 'bg-[#c9a84c] text-black shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                     >
                        {sec === 'tactics' ? '⚔️ Tactics' : sec}
                     </button>
                   ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="wait">
                   {navSection === 'tactics' && tactics && (
                     <motion.div key="tactics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                       
                       {/* Archetype & Role Overview Banner */}
                       <div className="p-5 rounded-xl border border-[#c9a84c]/40 bg-gradient-to-br from-[#1a1815] via-[#111] to-black shadow-lg relative overflow-hidden">
                         <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] uppercase font-black tracking-widest text-[#c9a84c] bg-[#c9a84c]/20 px-2 py-0.5 rounded border border-[#c9a84c]/40">
                               Combat Strategy
                             </span>
                             <span className="text-xs text-gray-400 font-mono">
                               {tactics.isCurated ? '★ Specialized Tactical Analysis' : '● General Combat Evaluation'}
                             </span>
                           </div>
                           <div className="flex gap-1.5 flex-wrap">
                             {tactics.primaryKeywords.map(kw => {
                               const theme = KEYWORD_THEMES[kw] || { text: 'text-gray-300', bg: 'bg-white/10', border: 'border-white/20', icon: '✦' };
                               return (
                                 <span key={kw} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${theme.border} ${theme.bg} ${theme.text} flex items-center gap-1 shadow-sm`}>
                                   <span>{theme.icon}</span> {kw}
                                 </span>
                               );
                             })}
                           </div>
                         </div>

                         <h3 className="text-2xl font-black text-white mb-1 tracking-wide">{tactics.archetype}</h3>
                         <p className="text-sm text-gray-300 font-medium leading-relaxed mb-4">
                           Primary Combat Role: <strong className="text-[#c9a84c]">{tactics.role}</strong>
                         </p>

                          {/* Custom Status Effects & Kit Mechanics Decoded */}
                          <div className="space-y-3 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs uppercase tracking-widest font-black text-[#c9a84c] flex items-center gap-1.5">
                                <span>⚡</span> Custom Status Effects & Kit Mechanics
                              </h4>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {tactics.uniqueMechanics.length} Active System{tactics.uniqueMechanics.length > 1 ? 's' : ''}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {tactics.uniqueMechanics.map((mech, i) => (
                                <div key={i} className="p-4 rounded-xl bg-black/70 border border-[#333] hover:border-[#c9a84c]/50 transition-all flex flex-col justify-between space-y-2 shadow-md">
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="font-bold text-white text-sm tracking-wide">{mech.title}</span>
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 rounded">
                                      {mech.badge}
                                    </span>
                                  </div>

                                  {mech.trigger && (
                                    <div className="text-[11px] text-[#c9a84c]/90 font-mono flex items-start gap-1.5 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                                      <span className="font-bold flex-shrink-0 text-[#c9a84c]">⚡ Trigger:</span>
                                      <span>{mech.trigger}</span>
                                    </div>
                                  )}

                                  <div className="text-xs text-gray-300 leading-relaxed font-sans">
                                    <span className="text-gray-400 font-bold block mb-0.5 text-[10px] uppercase tracking-wider">Combat Application:</span>
                                    {mech.explanation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Critical Hazard Alert Banner */}
                        {tactics.hazardAlert && (
                          <div className="p-4 rounded-xl border border-red-500/60 bg-red-950/30 shadow-[0_0_25px_rgba(239,68,68,0.2)] flex items-start gap-3.5">
                            <span className="text-2xl flex-shrink-0 mt-0.5 animate-pulse">⚠️</span>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-red-400">Critical Combat Warning</span>
                                <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40">{tactics.hazardAlert.badge}</span>
                              </div>
                              <p className="text-xs text-red-200/90 leading-relaxed font-medium">{tactics.hazardAlert.message}</p>
                            </div>
                          </div>
                        )}

                       {/* Turn-by-Turn Combat Rotation */}
                       <div className="p-5 rounded-xl border border-[#333] bg-[#111] space-y-4 shadow-md">
                         <h4 className="text-xs uppercase tracking-widest font-black text-[#c9a84c] flex items-center gap-2">
                           <span>⚔️</span> How to Play in Battle (Turn Rotation)
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <div className="p-3.5 rounded-lg bg-black/50 border border-[#222]">
                             <div className="flex items-center gap-2 mb-2">
                               <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black flex items-center justify-center border border-amber-500/40">1</span>
                               <span className="text-xs font-bold text-white uppercase tracking-wider">Turn 1: Opener</span>
                             </div>
                             <p className="text-xs text-gray-300 leading-relaxed">{tactics.combatRotation.opener}</p>
                           </div>
                           <div className="p-3.5 rounded-lg bg-black/50 border border-[#222]">
                             <div className="flex items-center gap-2 mb-2">
                               <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black flex items-center justify-center border border-amber-500/40">2</span>
                               <span className="text-xs font-bold text-white uppercase tracking-wider">Mid-Fight: Clash & Engine</span>
                             </div>
                             <p className="text-xs text-gray-300 leading-relaxed">{tactics.combatRotation.midGame}</p>
                           </div>
                           <div className="p-3.5 rounded-lg bg-black/50 border border-[#222]">
                             <div className="flex items-center gap-2 mb-2">
                               <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black flex items-center justify-center border border-amber-500/40">3</span>
                               <span className="text-xs font-bold text-white uppercase tracking-wider">Finisher: Win Condition</span>
                             </div>
                             <p className="text-xs text-gray-300 leading-relaxed">{tactics.combatRotation.finisher}</p>
                           </div>
                         </div>
                       </div>

                       {/* Skills Tactical Summary */}
                       <div className="p-5 rounded-xl border border-[#333] bg-[#111] space-y-3">
                         <h4 className="text-xs uppercase tracking-widest font-black text-gray-400 flex items-center gap-2">
                           <span>📋</span> Skill Tactical Breakdown
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {tactics.skillsTactical.map((st, i) => (
                             <div key={i} className="p-3 rounded-lg bg-black/50 border border-[#333] flex flex-col justify-between gap-2">
                               <div>
                                 <div className="flex items-center justify-between mb-1">
                                   <span className="text-[10px] font-bold text-gray-500 uppercase">Skill {st.slot}</span>
                                   <span className="text-[10px] font-bold text-[#c9a84c] bg-[#c9a84c]/10 px-1.5 py-0.5 rounded border border-[#c9a84c]/30">
                                     {st.roleTag}
                                   </span>
                                 </div>
                                 <div className="text-sm font-bold text-white truncate" title={st.name}>{st.name}</div>
                                 <p className="text-[11px] text-gray-300 mt-1 leading-snug">{st.tacticalSummary}</p>
                               </div>
                               <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-[#222]">
                                 <span>Max Clash: <strong className="text-yellow-400">{st.maxPower}</strong></span>
                                 <span>{st.coins} Coin{st.coins > 1 ? 's' : ''}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Synergy & Best Partners */}
                       <div className="p-4 rounded-xl border border-[#333] bg-black/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                         <div className="space-y-1">
                           <span className="text-[10px] uppercase font-bold tracking-wider text-[#c9a84c]">Recommended Teammates</span>
                           <div className="flex flex-wrap gap-1.5 pt-0.5">
                             {tactics.teamSynergies.bestPartners.map((partner, i) => (
                               <span key={i} className="text-xs bg-[#1a1a1a] text-gray-200 border border-[#444] px-2 py-0.5 rounded font-medium">
                                 {partner}
                               </span>
                             ))}
                           </div>
                         </div>
                         <p className="text-xs text-gray-400 italic max-w-sm">
                           💡 {tactics.teamSynergies.tip}
                         </p>
                       </div>

                     </motion.div>
                   )}

                   {navSection === 'skills' && (
                     <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="flex border-b border-[#333] mb-6">
                           {attackSkills.map((s, idx) => (
                             <button
                               key={idx}
                               onClick={() => setActiveTab(idx)}
                               className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === idx ? 'text-[#c9a84c] border-[#c9a84c] bg-[#c9a84c]/5' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[#333]'}`}
                             >
                               Skill {idx + 1}
                             </button>
                           ))}
                        </div>
                        
                        {attackSkills[activeTab] && renderSkillBlock(attackSkills[activeTab], activeTab)}
                     </motion.div>
                   )}

                   {navSection === 'defense' && (
                     <motion.div key="defense" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {defenseSkill ? renderSkillBlock(defenseSkill, 3) : <p className="text-gray-500 text-center py-10">No defense skill data available.</p>}
                     </motion.div>
                   )}

                   {navSection === 'passives' && (
                     <motion.div key="passives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {passives.map((p, idx) => (
                           <div key={idx} className="bg-[#111] border-2 border-[#333] rounded-xl p-5 relative overflow-hidden shadow-md">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c]">Passive</span>
                                   <h4 className="text-lg font-bold text-white leading-tight mt-1">{p.name}</h4>
                                 </div>
                              </div>
                              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{Array.isArray(p.effects) ? p.effects.join('\n') : (p.effects || p.description)}</p>
                           </div>
                        ))}
                     </motion.div>
                   )}
                </AnimatePresence>
            </div>

            <button className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black/50 w-8 h-8 flex items-center justify-center rounded-full border border-[#333] transition-colors hover:bg-[#333]" onClick={onClose}>
                ✕
            </button>
        </div>
      </motion.div>
    </div>
  );
}
