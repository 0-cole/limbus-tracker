import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import sinnersData from '../data/sinners.json';
import { Settings, Battery, Box, Wallet, Zap } from 'lucide-react';
import { calculateLimbusGrind, generateRoadmap, getOwnedShards } from '../utils/limbusCalculator.js';
import { getEnkephalinCapForLevel, getEnkephalinCountdown } from '../utils/enkephalinLevels.js';

export default function InventoryPage() {
  const { inventory, updateInventory, saveStore, wantList, bpState, scheduleState, activeBanner, identitiesData, egosData } = useStore();
  const [currentEnkephalin, setCurrentEnkephalin] = useState(inventory.enkephalin !== undefined ? inventory.enkephalin : (inventory.maxEnkephalin || 119));
  const [countdown, setCountdown] = useState(() => getEnkephalinCountdown(inventory));

  useEffect(() => {
    setCurrentEnkephalin(inventory.enkephalin !== undefined ? inventory.enkephalin : (inventory.maxEnkephalin || 119));
  }, [inventory.enkephalin, inventory.maxEnkephalin]);

  useEffect(() => {
    const ticker = () => {
      setCountdown(getEnkephalinCountdown(inventory));
    };
    ticker();
    const interval = setInterval(ticker, 1000);
    return () => clearInterval(interval);
  }, [inventory]);
  
  // Calculate Roadmap Modules Needed
  const modulesNeeded = React.useMemo(() => {
    if (!wantList || !identitiesData || !egosData) return 0;
    
    const targetItems = [...wantList].map(name => {
      return identitiesData.find(id => id.name === name) || egosData.find(ego => ego.name === name);
    }).filter(Boolean);
    const calcItems = targetItems.map(item => ({ sinnerId: item.sinner, rarity: !!item.grade ? 'EGO' : (item.rarity === 3 ? '000' : '00') }));
    
    const calcResult = calculateLimbusGrind(
      calcItems,
      inventory,
      bpState,
      scheduleState,
      activeBanner ? activeBanner.seasonEndDate : 'Unknown'
    );
    const { totalModulesNeeded } = generateRoadmap(calcResult.daysLeft, calcResult.plannedRuns, scheduleState, bpState);
    return totalModulesNeeded;
  }, [wantList, identitiesData, egosData, inventory, bpState, scheduleState, activeBanner]);

  const handleManualSync = (e) => {
    const val = parseInt(e.target.value) || 0;
    setCurrentEnkephalin(val);
    updateInventory({ enkephalin: val });
    saveStore();
  };

  const handleLevelChange = (lvl) => {
    const validLevel = Math.max(1, Math.min(300, parseInt(lvl) || 1));
    updateInventory({ companyLevel: validLevel });
    saveStore();
  };

  return (
    <div className="p-8 pb-32">
      <h1 className="text-4xl font-black uppercase tracking-wider text-[#c9a84c] mb-8 border-b-2 border-[#333] pb-4">
        Manager Inventory
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enkephalin & Module Tracker */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-[#111] border border-[#333] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-[#222] rotate-12 pointer-events-none">
            <Battery size={200} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
            <Battery className="text-[#22c55e]" /> Enkephalin & Modules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10">
            {/* Enkephalin Box */}
            <div className="bg-black/50 p-4 border border-[#333] rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Current Enkephalin</span>
                {currentEnkephalin > (inventory.maxEnkephalin || 119) && (
                  <span className="text-[9px] bg-amber-500/30 text-amber-300 font-bold px-1.5 py-0.5 rounded">OVERFILLED</span>
                )}
              </div>
              <div className="flex items-end gap-2">
                <input 
                  type="number" 
                  value={currentEnkephalin}
                  onChange={handleManualSync}
                  className="text-4xl font-black bg-transparent w-24 border-b-2 border-[#22c55e] text-[#22c55e] focus:outline-none font-mono"
                />
                <span className="text-xl text-gray-500 font-bold mb-1 font-mono">/ {inventory.maxEnkephalin || 119}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-2 space-y-0.5">
                <p>Regen: 1 point every 6m</p>
                {countdown.isFull ? (
                  <p className="text-emerald-400 font-bold">At Max Capacity</p>
                ) : (
                  <>
                    <p>Next point: <span className="text-emerald-400 font-bold">+{countdown.nextPointStr}</span></p>
                    <p>Full Cap at: <span className="text-white font-bold">{countdown.fullTimeStr}</span></p>
                  </>
                )}
              </div>
            </div>

            {/* Modules Box */}
            <div className="bg-black/50 p-4 border border-[#333] rounded-lg">
              <span className="text-xs text-[#c9a84c] font-bold uppercase tracking-wider block mb-1">Current Modules</span>
              <div className="flex items-end gap-2">
                <input 
                  type="number" 
                  min="0"
                  value={inventory.modules || 0}
                  onChange={e => {
                    updateInventory({ modules: Math.max(0, parseInt(e.target.value) || 0) });
                    saveStore();
                  }}
                  className="text-4xl font-black bg-transparent w-24 border-b-2 border-[#c9a84c] text-[#eab308] focus:outline-none font-mono"
                />
                <div className="flex gap-1 mb-1">
                  <button onClick={() => { updateInventory({ modules: Math.max(0, (inventory.modules||0) + 1) }); saveStore(); }} className="px-2 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] text-xs font-bold rounded text-white cursor-pointer">+1</button>
                  <button onClick={() => { updateInventory({ modules: Math.max(0, (inventory.modules||0) + 5) }); saveStore(); }} className="px-2 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] text-xs font-bold rounded text-white cursor-pointer">+5</button>
                  <button onClick={() => { updateInventory({ modules: Math.max(0, (inventory.modules||0) - 1) }); saveStore(); }} className="px-2 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] text-xs font-bold rounded text-gray-400 cursor-pointer">-1</button>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-2">
                {modulesNeeded > 0 ? (
                  <p>
                    <span className="text-[#c9a84c] font-bold">{modulesNeeded}</span> modules needed for roadmap{' '}
                    {(inventory.modules || 0) >= modulesNeeded ? (
                      <span className="text-green-400 font-bold">✅ Ready</span>
                    ) : (
                      <span className="text-red-400">({modulesNeeded - (inventory.modules || 0)} more needed)</span>
                    )}
                  </p>
                ) : (
                  <p className="text-green-400">Roadmap covered!</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Company Level Auto-Balance Controller */}
          <div className="text-gray-300 font-mono text-xs relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#222]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400 uppercase tracking-wider">Company Level:</span>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  min="1" 
                  max="300" 
                  value={inventory.companyLevel || 35} 
                  onChange={e => handleLevelChange(e.target.value)}
                  className="w-16 bg-[#1a1a1a] border border-[#444] rounded text-white focus:border-[#c9a84c] focus:outline-none text-center font-bold font-mono py-0.5" 
                />
                <button
                  type="button"
                  onClick={() => handleLevelChange((inventory.companyLevel || 35) - 1)}
                  className="px-1.5 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-[11px] text-gray-300 cursor-pointer"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange((inventory.companyLevel || 35) + 1)}
                  className="px-1.5 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-[11px] text-gray-300 cursor-pointer"
                >
                  +1
                </button>
              </div>
            </div>
            <div className="text-[11px] text-amber-400 font-bold">
              Auto-Balanced Cap: <span className="text-white underline">{inventory.maxEnkephalin || 119}</span>
            </div>
          </div>
        </motion.div>

        {/* Universal Crates & Currency */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-[#111] border border-[#333] rounded-xl p-6 relative overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Box className="text-[#eab308]" /> Dispensary Assets
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-black/50 p-3 rounded">
              <span className="text-[#eab308] font-bold">Nominable Egocrates</span>
              <input type="number" value={inventory.nominableCrates} onChange={e => { updateInventory({nominableCrates: parseInt(e.target.value)||0}); saveStore(); }} className="bg-transparent border border-[#333] text-right w-20 px-2 rounded text-white" />
            </div>
            <div className="flex justify-between items-center bg-black/50 p-3 rounded">
              <span className="text-gray-300 font-bold">Random Egocrates</span>
              <input type="number" value={inventory.randomCrates} onChange={e => { updateInventory({randomCrates: parseInt(e.target.value)||0}); saveStore(); }} className="bg-transparent border border-[#333] text-right w-20 px-2 rounded text-white" />
            </div>
            <div className="flex justify-between items-center bg-black/50 p-3 rounded">
              <span className="text-red-400 font-bold">Extraction Tickets</span>
              <input type="number" value={inventory.extractionTickets} onChange={e => { updateInventory({extractionTickets: parseInt(e.target.value)||0}); saveStore(); }} className="bg-transparent border border-[#333] text-right w-20 px-2 rounded text-white" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* Sinner Shards */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Sinner Egoshards</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {sinnersData.map((sinner, i) => (
          <motion.div 
            key={sinner.id}
            initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay: i * 0.02}}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 flex flex-col items-center gap-2 hover:border-[#c9a84c]/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-xl bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${sinner.color}, #ffffff)` }}>
              {sinner.name.charAt(0)}
            </div>
            <span className="font-bold text-sm" style={{ color: sinner.color }}>{sinner.name}</span>
            <input 
              type="number"
              value={getOwnedShards(inventory.shards, sinner.name)}
              onChange={e => { 
                const val = parseInt(e.target.value) || 0;
                updateInventory({ 
                  shards: { 
                    ...inventory.shards, 
                    [sinner.name]: val,
                    [sinner.id]: val 
                  } 
                }); 
                saveStore(); 
              }}
              className="bg-black/50 border border-[#444] rounded text-center w-full py-2 text-xl font-bold text-white focus:border-white focus:outline-none transition-colors"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
