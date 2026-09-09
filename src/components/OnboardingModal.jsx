import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../stores/useStore.js';
import { ChevronRight, Check } from 'lucide-react';

export default function OnboardingModal() {
  const { onboardingCompleted, setOnboardingCompleted, bpState, updateBpState, scheduleState, updateScheduleState, inventory, updateInventory, saveStore } = useStore();
  const [step, setStep] = useState(1);
  
  if (onboardingCompleted) return null;

  const handleComplete = () => {
    setOnboardingCompleted(true);
    saveStore();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#111] border border-[#c9a84c] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(201,168,76,0.15)] flex flex-col"
      >
        <div className="bg-[#1a1a1a] p-4 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-[#c9a84c] font-bold text-xl tracking-wider uppercase">Welcome to Limbus Tracker</h2>
          <div className="text-gray-500 font-mono text-sm">Step {step} of 4</div>
        </div>
        
        <div className="p-8 flex-1 min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6">
                <div>
                  <h3 className="text-2xl text-white font-bold mb-2">Manager Calibration</h3>
                  <p className="text-gray-400">To properly calculate your optimal Mirror Dungeon schedule, we need to calibrate the Limbus Pass system.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div>
                      <div className="text-white font-bold">Current Battle Pass Level</div>
                      <div className="text-sm text-gray-400">Your current level on the Limbus Pass</div>
                    </div>
                    <input 
                      type="number" min="1" max="999"
                      className="bg-black border border-[#333] rounded px-3 py-2 text-white w-24 text-right focus:border-[#c9a84c] focus:outline-none"
                      value={bpState.level}
                      onChange={(e) => updateBpState({ level: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                  </label>

                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div>
                      <div className="text-white font-bold text-[#eab308]">Premium Limbus Pass</div>
                      <div className="text-sm text-gray-400">Do you own the paid Premium track? (Provides 3x Crates past max level)</div>
                    </div>
                    <input 
                      type="checkbox"
                      className="w-6 h-6 accent-[#c9a84c]"
                      checked={bpState.isPremium}
                      onChange={(e) => updateBpState({ isPremium: e.target.checked })}
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6">
                <div>
                  <h3 className="text-2xl text-white font-bold mb-2">Weekly Check-in</h3>
                  <p className="text-gray-400">Tell us what you have already completed before installing this app. (Resets Thursday 06:00 KST)</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div className="text-white font-bold">Completed Daily Missions Today?</div>
                    <input type="checkbox" className="w-6 h-6 accent-[#c9a84c]" checked={scheduleState.dailiesDone} onChange={(e) => updateScheduleState({ dailiesDone: e.target.checked })} />
                  </label>

                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div className="text-white font-bold">Completed Weekly Missions This Week?</div>
                    <input type="checkbox" className="w-6 h-6 accent-[#c9a84c]" checked={scheduleState.weekliesDone} onChange={(e) => updateScheduleState({ weekliesDone: e.target.checked })} />
                  </label>

                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div>
                      <div className="text-white font-bold">Mirror Dungeon Bonuses Claimed</div>
                      <div className="text-sm text-gray-400">Out of 3 weekly bonuses</div>
                    </div>
                    <select 
                      className="bg-black border border-[#333] rounded px-3 py-2 text-white w-24 focus:border-[#c9a84c] focus:outline-none"
                      value={scheduleState.mdBonusesClaimed}
                      onChange={(e) => updateScheduleState({ mdBonusesClaimed: parseInt(e.target.value) })}
                    >
                      <option value="0">0 / 3</option>
                      <option value="1">1 / 3</option>
                      <option value="2">2 / 3</option>
                      <option value="3">3 / 3</option>
                    </select>
                  </label>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
              <motion.div key="step3" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6">
                <div>
                  <h3 className="text-2xl text-white font-bold mb-2">Enkephalin Synchronization</h3>
                  <p className="text-gray-400">The app will predict your Enkephalin regeneration in the background and notify you when it fills up.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div>
                      <div className="text-white font-bold">Current Enkephalin</div>
                      <div className="text-sm text-gray-400">How much energy do you have right now?</div>
                    </div>
                    <input 
                      type="number" min="0" max="999"
                      className="bg-black border border-[#333] rounded px-3 py-2 text-white w-24 text-right focus:border-[#c9a84c] focus:outline-none"
                      value={inventory.enkephalin}
                      onChange={(e) => updateInventory({ enkephalin: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                  </label>

                  <label className="flex items-center justify-between bg-black/50 p-4 border border-[#333] rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div>
                      <div className="text-white font-bold">Max Enkephalin Capacity</div>
                      <div className="text-sm text-gray-400">Based on your Company Level.</div>
                    </div>
                    <input 
                      type="number" min="10" max="999"
                      className="bg-black border border-[#333] rounded px-3 py-2 text-white w-24 text-right focus:border-[#c9a84c] focus:outline-none"
                      value={inventory.maxEnkephalin}
                      onChange={(e) => updateInventory({ maxEnkephalin: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-6">
                <div>
                  <h3 className="text-2xl text-white font-bold mb-2">Current Crates</h3>
                  <p className="text-gray-400">Don't worry about entering Shards right now—you can do that from the Inventory tab later. Let's just grab your Crates.</p>
                </div>
                
                <div className="space-y-4 pt-4 flex gap-4">
                  <label className="flex-1 bg-black/50 p-4 border border-[#333] rounded-lg text-center cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div className="text-[#eab308] font-bold text-lg mb-2">Nominable Egocrates</div>
                    <input 
                      type="number" min="0"
                      className="bg-black border border-[#333] rounded px-3 py-2 text-white w-full text-center text-xl focus:border-[#c9a84c] focus:outline-none"
                      value={inventory.nominableCrates}
                      onChange={(e) => updateInventory({ nominableCrates: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                    <div className="text-xs text-gray-500 mt-2">Yellow crates where you choose the Sinner</div>
                  </label>

                  <label className="flex-1 bg-black/50 p-4 border border-[#333] rounded-lg text-center cursor-pointer hover:border-[#c9a84c] transition-colors">
                    <div className="text-gray-300 font-bold text-lg mb-2">Random Egocrates</div>
                    <input 
                      type="number" min="0"
                      className="bg-black border border-[#333] rounded px-3 py-2 text-white w-full text-center text-xl focus:border-[#c9a84c] focus:outline-none"
                      value={inventory.randomCrates}
                      onChange={(e) => updateInventory({ randomCrates: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                    <div className="text-xs text-gray-500 mt-2">White crates that give random Shards</div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 border-t border-[#333] flex justify-between">
          <button 
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => step > 1 ? setStep(step - 1) : null}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-[#c9a84c] text-black font-bold rounded hover:bg-[#d4b96a] transition-colors flex items-center gap-2"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              className="px-6 py-2 bg-[#22c55e] text-black font-bold rounded hover:bg-[#34d399] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Check size={16} /> Complete Setup
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
