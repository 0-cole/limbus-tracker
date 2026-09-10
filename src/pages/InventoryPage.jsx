import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import sinnersData from '../data/sinners.json';
import { Settings, Battery, Box, Wallet } from 'lucide-react';
import { calculateLimbusGrind, generateRoadmap } from '../utils/limbusCalculator.js';
import enkephalinCaps from '../data/enkephalinCap.json';

export default function InventoryPage() {
  const { inventory, updateInventory, saveStore, wantList, bpState, scheduleState, activeBanner, identitiesData, egosData } = useStore();
  const [currentEnkephalin, setCurrentEnkephalin] = useState(inventory.enkephalin);
  
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
  
  // Real-time enkephalin predictor
  useEffect(() => {
    const updatePredictor = () => {
      const now = Date.now();
      const lastSynced = inventory.enkephalinLastSynced || now;
      const diff = now - lastSynced;
      const generated = Math.floor(diff / (6 * 60 * 1000));
      if (inventory.enkephalin >= inventory.maxEnkephalin) {
        setCurrentEnkephalin(inventory.enkephalin);
      } else {
        setCurrentEnkephalin(Math.min(inventory.enkephalin + generated, inventory.maxEnkephalin));
      }
    };
    
    updatePredictor();
    const interval = setInterval(updatePredictor, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [inventory.enkephalin, inventory.enkephalinLastSynced, inventory.maxEnkephalin]);

  const handleManualSync = (e) => {
    const val = parseInt(e.target.value) || 0;
    updateInventory({ enkephalin: val });
    saveStore();
  };

  const timeUntilFull = () => {
    if (currentEnkephalin >= inventory.maxEnkephalin) return "Full";
    const missing = inventory.maxEnkephalin - currentEnkephalin;
    const minutesNeeded = missing * 6;
    
    // Calculate exact time based on last sync + generated
    const now = Date.now();
    const lastSynced = inventory.enkephalinLastSynced || now;
    const diff = now - lastSynced;
    const msIntoCurrentCycle = diff % (6 * 60 * 1000);
    const msUntilNextPoint = (6 * 60 * 1000) - msIntoCurrentCycle;
    
    const totalMsNeeded = msUntilNextPoint + ((missing - 1) * 6 * 60 * 1000);
    
    const targetTime = new Date(now + totalMsNeeded);
    return targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Current Enkephalin</span>
              <div className="flex items-end gap-2">
                <input 
                  type="number" 
                  value={currentEnkephalin}
                  onChange={handleManualSync}
                  className="text-4xl font-black bg-transparent w-24 border-b-2 border-[#22c55e] text-[#22c55e] focus:outline-none"
                />
                <span className="text-xl text-gray-500 font-bold mb-1">/ {inventory.maxEnkephalin}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-2">
                <p>1 point every 6m</p>
                <p>Full Capacity at: <span className="text-white font-bold">{timeUntilFull()}</span></p>
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
                  className="text-4xl font-black bg-transparent w-24 border-b-2 border-[#c9a84c] text-[#eab308] focus:outline-none"
                />
                <div className="flex gap-1 mb-1">
                  <button onClick={() => { updateInventory({ modules: Math.max(0, (inventory.modules||0) + 1) }); saveStore(); }} className="px-2 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] text-xs font-bold rounded text-white">+1</button>
                  <button onClick={() => { updateInventory({ modules: Math.max(0, (inventory.modules||0) + 5) }); saveStore(); }} className="px-2 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] text-xs font-bold rounded text-white">+5</button>
                  <button onClick={() => { updateInventory({ modules: Math.max(0, (inventory.modules||0) - 1) }); saveStore(); }} className="px-2 py-0.5 bg-[#222] hover:bg-[#333] border border-[#444] text-xs font-bold rounded text-gray-400">-1</button>
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
          
          <div className="text-gray-400 font-mono text-sm relative z-10 flex items-center justify-between pt-2 border-t border-[#222]">
            <label className="flex items-center gap-2 text-xs">
              Company Level: 
              <input type="number" min="1" max="300" className="w-14 bg-transparent border-b border-[#333] text-white focus:outline-none text-center font-bold" value={Object.keys(enkephalinCaps).find(k => enkephalinCaps[k] === inventory.maxEnkephalin) || ''} onChange={e => {
                const lvl = parseInt(e.target.value);
                if (lvl >= 1 && lvl <= 300) {
                  updateInventory({ maxEnkephalin: enkephalinCaps[lvl] });
                  saveStore();
                }
              }} />
            </label>
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
              value={inventory.shards[sinner.name] || 0}
              onChange={e => { 
                updateInventory({ shards: { ...inventory.shards, [sinner.name]: parseInt(e.target.value)||0 } }); 
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
