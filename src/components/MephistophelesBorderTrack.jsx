import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import mephistophelesImg from '../assets/mephistopheles.png';
import sinnersData from '../data/sinners.json';

// Character dialogue bank organized by active route
const TAB_DIALOGUES = {
  '/': [
    { sinner: 'Charon', quote: 'Vroom vroom. Mephistopheles is full of gas. Charon is ready to drive anywhere Dante points.', color: '#06b6d4' },
    { sinner: 'Faust', quote: 'The management dashboard is operating within nominal parameters. Do not alter system toggles haphazardly, Dante.', color: '#c084fc' },
    { sinner: 'Heathcliff', quote: 'We just gonna sit here staring at gauges all afternoon? Mephi\'s engine is revving—let\'s go break something!', color: '#fb923c' },
    { sinner: 'Don Quixote', quote: 'Hark, Manager! Behold the grand chronicle of our valiant bus! Our chivalric crusade shines upon every meter!', color: '#fbbf24' },
    { sinner: 'Ishmael', quote: 'Check the daily reset clock, Dante. We cannot afford to waste a single Enkephalin conversion today.', color: '#38bdf8' },
    { sinner: 'Vergilius', quote: 'Keep your eyes on the road, Dante. If this bus gets dented, you\'re the one polishing the bumper.', color: '#ef4444' },
  ],
  '/schedule': [
    { sinner: 'Meursault', quote: 'The Mirror Dungeon schedule has been synchronized to your exact specifications. Deviation is not recommended.', color: '#a3a3a3' },
    { sinner: 'Ishmael', quote: 'Manager, please stick strictly to the timetable. If we waste modules, we will be stranded in the middle of nowhere again.', color: '#38bdf8' },
    { sinner: 'Outis', quote: 'Executive Manager! Your strategic timetable is immaculate! Only a visionary commander could organize Mirror Dungeons so flawlessly!', color: '#6ee7b7' },
    { sinner: 'Yi Sang', quote: 'A schedule... A cycle recurring endlessly like two mirrors facing each other in the dark. How ideal.', color: '#4a90d9' },
    { sinner: 'Sinclair', quote: 'A-another Mirror Dungeon run scheduled for today?! My shoulders are still aching from yesterday\'s boss...', color: '#a78bfa' },
    { sinner: 'Don Quixote', quote: 'FOR THE SIMULATION CRUSADE! EACH MIRROR ENCOUNTER SHALL HEAR THE THUNDER OF JUSTICE!', color: '#fbbf24' },
  ],
  '/inventory': [
    { sinner: 'Rodion', quote: 'Ooh, look at all those shiny nominal crates! Manager, can we crack open just one? Come on, lucky gambler\'s intuition~', color: '#f472b6' },
    { sinner: 'Hong Lu', quote: 'My, what fascinating little boxes! In my family\'s manor we kept jade chests, but these yellow crates have such a rustic charm~', color: '#34d399' },
    { sinner: 'Gregor', quote: 'Keep a steady eye on that shard count, buddy. Don\'t go burning through your hard-earned crates all at once.', color: '#fca5a5' },
    { sinner: 'Sinclair', quote: 'U-um, Manager... are you completely sure we have enough Enkephalin modules? What if we run out in the backstreets?!', color: '#a78bfa' },
    { sinner: 'Outis', quote: 'Rest assured, Executive Manager! Not a single module or thread crate shall be misplaced under my watchful vigilance!', color: '#6ee7b7' },
    { sinner: 'Heathcliff', quote: 'Crates, modules, whatever. As long as you keep \'em stocked so we can smash heads, I don\'t give a damn.', color: '#fb923c' },
  ],
  '/want-list': [
    { sinner: 'Ryōshū', quote: 'T.T. (Targeted Termination). Dispense the chosen weapon soon, Dante. My blade thirsts for new canvas.', color: '#f87171' },
    { sinner: 'Don Quixote', quote: 'TO ATTAIN SUCH GLORIOUS IDENTITIES! I SWEAR UPON MY LANCE WE SHALL DISPENSE THEM ALL!', color: '#fbbf24' },
    { sinner: 'Rodion', quote: 'Patience is a virtue, Dante darling... but pulling from the dispenser right now sounds way more thrilling~', color: '#f472b6' },
    { sinner: 'Heathcliff', quote: 'That 000 ID right there. Get me enough shards for it, and I\'ll personally cave in the next Distortion\'s skull.', color: '#fb923c' },
    { sinner: 'Faust', quote: 'Target allocation registered. Faust calculates an 87.4% probability of successful acquisition before the season concludes.', color: '#c084fc' },
    { sinner: 'Gregor', quote: 'Putting me on the wishlist, Manager? Hey, I\'m flattered. Just hope I don\'t let you down out there.', color: '#fca5a5' },
  ],
  '/identities': [
    { sinner: 'Faust', quote: 'Faust knows all identities across all mirror worlds. Peruse their dossiers with care, Dante.', color: '#c084fc' },
    { sinner: 'Heathcliff', quote: 'Look at all these other versions of me. Every single one of \'em looks pissed off. Good.', color: '#fb923c' },
    { sinner: 'Hong Lu', quote: 'Fascinating... A world where I\'m an officer, and another where I\'m in a pirate crew! How wonderfully playful~', color: '#34d399' },
    { sinner: 'Ryōshū', quote: 'S.A. (Splendid Art). Each reflection has its own exquisite technique to paint the canvas red.', color: '#f87171' },
    { sinner: 'Gregor', quote: 'Seeing all these alternate versions of myself... at least not all of \'em got stuck with a bug arm, haha.', color: '#fca5a5' },
    { sinner: 'Yi Sang', quote: 'Countless selves existing beyond the glass. Which one of us is the mirror, and which the reflection?', color: '#4a90d9' },
  ],
  '/ego': [
    { sinner: 'Sinclair', quote: 'T-the E.G.O resonance... it feels overwhelming just looking at them... Dante, please be careful...', color: '#a78bfa' },
    { sinner: 'Gregor', quote: 'E.G.O, huh? Better than sprouting another chitin limb, I suppose. Just make sure the resonance doesn\'t fry our brains.', color: '#fca5a5' },
    { sinner: 'Yi Sang', quote: 'Wings forged from the depths of the psyche... When resonant, they flutter towards the light.', color: '#4a90d9' },
    { sinner: 'Meursault', quote: 'The E.G.O equipment is functional and ready for immediate deployment upon your direct command.', color: '#a3a3a3' },
    { sinner: 'Ishmael', quote: 'Watch your Sanity when commanding WAW and ALEPH E.G.O, Manager. One corroded Sinner can wipe the whole team.', color: '#38bdf8' },
    { sinner: 'Rodion', quote: 'E.G.O suits always have the best dramatic flair. Although, that 4th Match Flame is practically a sauna inside~', color: '#f472b6' },
  ],
  '/changelog': [
    { sinner: 'Kenneth', quote: 'Dante! Please! I just filed this report, don\'t tell me you found another unregistered patron on the bus!', color: '#c9a84c' },
    { sinner: 'Outis', quote: 'Every amendment to this manifest proves the Executive Manager\'s unrivaled administrative supremacy!', color: '#6ee7b7' },
    { sinner: 'Charon', quote: 'Kenneth looks very tired. Charon gives Kenneth one star candy. He says \'thank you\' and starts crying.', color: '#06b6d4' },
    { sinner: 'Vergilius', quote: 'Another update filed. Dante, make sure the Sinners actually read the operational notices this time.', color: '#ef4444' },
    { sinner: 'Heathcliff', quote: 'Who writes all these patch notes anyway? Some nervous bloke hiding under a desk with ink on his glasses?', color: '#fb923c' },
  ],
};

const STORAGE_KEY = 'limbus_mephi_border_progress';

export default function MephistophelesBorderTrack() {
  const location = useLocation();
  const containerRef = useRef(null);

  // Position progress along perimeter: 0.0 to 1.0
  const progressRef = useRef(0);
  const [busCoords, setBusCoords] = useState({ x: 0, y: 0, rotation: 90, side: 'top' });

  // Sinner dialogue state
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [honkEffect, setHonkEffect] = useState(false);
  const fadeTimeoutRef = useRef(null);
  const nextDialogueTimeoutRef = useRef(null);

  // Inset margin from container edges in pixels
  // Bus is 32px wide x 70px long (facing up by default)
  const BUS_WIDTH = 30;
  const BUS_HEIGHT = 65;
  // Use half the bus length so the entire bus body stays cleanly within the viewport
  const INSET = 36;

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0 && val <= 1) {
          progressRef.current = val;
        }
      }
    } catch (e) {
      // Ignore storage read errors
    }
  }, []);

  // Compute (x, y, rotation, side) given container dimensions and progress
  const updateBusPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width - INSET * 2;
    const h = rect.height - INSET * 2;
    if (w <= 0 || h <= 0) return;

    const totalPerimeter = 2 * (w + h);
    const d = progressRef.current * totalPerimeter;

    let x = 0;
    let y = 0;
    let rotation = 0;
    let side = 'top';

    if (d < w) {
      // Top edge: Left to Right
      x = INSET + d;
      y = INSET;
      rotation = 90;
      side = 'top';
    } else if (d < w + h) {
      // Right edge: Top to Bottom
      x = INSET + w;
      y = INSET + (d - w);
      rotation = 180;
      side = 'right';
    } else if (d < 2 * w + h) {
      // Bottom edge: Right to Left
      x = INSET + w - (d - (w + h));
      y = INSET + h;
      rotation = 270;
      side = 'bottom';
    } else {
      // Left edge: Bottom to Top
      x = INSET;
      y = INSET + h - (d - (2 * w + h));
      rotation = 0;
      side = 'left';
    }

    let containerWidth = rect.width;
    let containerHeight = rect.height;

    setBusCoords({ x, y, rotation, side, containerWidth, containerHeight });
  }, [INSET]);

  // Main driving animation loop
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId;

    // Full loop takes ~55 seconds
    const LAP_DURATION_MS = 55000;

    const loop = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Increment progress
      progressRef.current = (progressRef.current + delta / LAP_DURATION_MS) % 1;

      updateBusPosition();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Periodically save progress to localStorage every 2 seconds
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, progressRef.current.toString());
      } catch (e) {
        // Ignore storage write errors
      }
    }, 2000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(saveInterval);
      try {
        localStorage.setItem(STORAGE_KEY, progressRef.current.toString());
      } catch (e) {}
    };
  }, [updateBusPosition]);

  // Trigger a random dialogue for the current tab
  const triggerDialogue = useCallback(() => {
    const list = TAB_DIALOGUES[location.pathname] || TAB_DIALOGUES['/'];
    const randomItem = list[Math.floor(Math.random() * list.length)];
    setActiveDialogue(randomItem);

    // Clear any previous fade timeout
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);

    // Natural fade out after 6.5 seconds
    fadeTimeoutRef.current = setTimeout(() => {
      setActiveDialogue(null);
    }, 6500);
  }, [location.pathname]);

  // Schedule random dialogues every 15-30 seconds
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 15000; // 15 to 30 seconds
      nextDialogueTimeoutRef.current = setTimeout(() => {
        triggerDialogue();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (nextDialogueTimeoutRef.current) clearTimeout(nextDialogueTimeoutRef.current);
    };
  }, [triggerDialogue]);

  // When tab changes: if a dialogue is active, fade it out after 3.5 seconds
  useEffect(() => {
    if (activeDialogue) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => {
        setActiveDialogue(null);
      }, 3500);
    }
  }, [location.pathname]);

  // User manual click on the bus: horn honk + instant dialogue
  const handleBusClick = (e) => {
    e.stopPropagation();
    setHonkEffect(true);
    setTimeout(() => setHonkEffect(false), 800);
    triggerDialogue();
  };

  // Compute speech bubble absolute position inside the container,
  // clamping it dynamically so it never overflows screen edges
  const getBubbleStyle = () => {
    const BUBBLE_WIDTH = 270;
    const BUBBLE_HEIGHT = 100;
    const cw = busCoords.containerWidth || 1200;
    const ch = busCoords.containerHeight || 800;

    let bx = busCoords.x;
    let by = busCoords.y;

    if (busCoords.side === 'top') {
      by = busCoords.y + BUS_HEIGHT / 2 + 18;
      bx = busCoords.x - BUBBLE_WIDTH / 2;
    } else if (busCoords.side === 'bottom') {
      by = busCoords.y - BUS_HEIGHT / 2 - BUBBLE_HEIGHT - 18;
      bx = busCoords.x - BUBBLE_WIDTH / 2;
    } else if (busCoords.side === 'right') {
      bx = busCoords.x - BUS_HEIGHT / 2 - BUBBLE_WIDTH - 18;
      by = busCoords.y - BUBBLE_HEIGHT / 2;
    } else {
      // left
      bx = busCoords.x + BUS_HEIGHT / 2 + 18;
      by = busCoords.y - BUBBLE_HEIGHT / 2;
    }

    // Dynamic clamping to prevent cutting off at any screen edge
    const padding = 16;
    bx = Math.max(padding, Math.min(bx, cw - BUBBLE_WIDTH - padding));
    by = Math.max(padding, Math.min(by, ch - BUBBLE_HEIGHT - padding));

    return {
      left: `${bx}px`,
      top: `${by}px`,
      width: `${BUBBLE_WIDTH}px`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* ── Thin Line Border Track ── */}
      <div
        className="absolute rounded-xl transition-all duration-300 pointer-events-none"
        style={{
          top: INSET,
          left: INSET,
          right: INSET,
          bottom: INSET,
          border: '1.5px dashed rgba(201, 168, 76, 0.25)',
          boxShadow: '0 0 12px rgba(201, 168, 76, 0.06), inset 0 0 12px rgba(201, 168, 76, 0.04)',
        }}
      />

      {/* ── Mephistopheles Bus Vehicle ── */}
      <div
        onClick={handleBusClick}
        title="Mephistopheles (Click to honk / speak!)"
        className="absolute pointer-events-auto cursor-pointer select-none group"
        style={{
          left: busCoords.x,
          top: busCoords.y,
          transform: `translate(-50%, -50%) rotate(${busCoords.rotation}deg)`,
          transition: 'transform 0.08s ease-out',
        }}
      >
        {/* Diesel Engine Rumble Wrapper */}
        <div
          className={`relative ${honkEffect ? 'scale-125' : 'group-hover:scale-110'} transition-transform duration-200`}
          style={{
            animation: 'mephi-rumble 0.16s infinite linear',
          }}
        >
          <img
            src={mephistophelesImg}
            alt="Mephistopheles Bus"
            style={{
              width: `${BUS_WIDTH}px`,
              height: `${BUS_HEIGHT}px`,
              filter: honkEffect
                ? 'drop-shadow(0 0 12px rgba(234,179,8,1))'
                : 'drop-shadow(0 0 5px rgba(0,0,0,0.9)) drop-shadow(0 0 10px rgba(201,168,76,0.4))',
            }}
            className="object-contain"
          />

          {/* Honk visual pulse */}
          {honkEffect && (
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-yellow-400 pointer-events-none"
            />
          )}
        </div>
      </div>

      {/* ── Independent Speech Bubble Popover (Directly tracks bus and clamps to container) ── */}
      <AnimatePresence>
        {activeDialogue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute pointer-events-auto z-50 p-3.5 rounded-xl bg-[#0d0d12]/95 backdrop-blur-md border shadow-2xl transition-[left,top] duration-150 ease-out"
            style={{
              ...getBubbleStyle(),
              borderColor: activeDialogue.color || '#c9a84c',
              boxShadow: `0 0 25px ${activeDialogue.color}33, 0 10px 36px rgba(0,0,0,0.85)`,
            }}
          >
            {/* Speaker Header */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: activeDialogue.color }}
              />
              <span
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: activeDialogue.color }}
              >
                {activeDialogue.sinner}
              </span>
              <span className="text-[10px] text-gray-400 font-mono ml-auto">
                Mephi Comms
              </span>
            </div>

            {/* Quote text */}
            <p className="text-xs text-gray-100 font-serif leading-relaxed italic">
              "{activeDialogue.quote}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for mechanical engine vibration */}
      <style>{`
        @keyframes mephi-rumble {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(0.5px, -0.5px) rotate(0.4deg); }
          50% { transform: translate(-0.5px, 0.4px) rotate(-0.4deg); }
          75% { transform: translate(0.4px, 0.5px) rotate(0.3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
