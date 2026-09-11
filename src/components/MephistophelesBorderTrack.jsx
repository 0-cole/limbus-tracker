import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import mephistophelesImg from '../assets/mephistopheles.png';
import sinnersData from '../data/sinners.json';

// Character dialogue bank organized by active route (at least 2-3 for each sinner per tab)
const TAB_DIALOGUES = {
  '/': [
    { sinner: 'Charon', quote: 'Vroom vroom. Mephistopheles is full of gas. Charon is ready to drive anywhere Dante points.', color: '#06b6d4' },
    { sinner: 'Charon', quote: 'Blinky blinky dashboard lights. Charon wants to press the red hazard button.', color: '#06b6d4' },
    { sinner: 'Faust', quote: 'The management dashboard is operating within nominal parameters. Do not alter system toggles haphazardly, Dante.', color: '#c084fc' },
    { sinner: 'Faust', quote: 'Faust has already calculated every metric anomaly displayed upon these screens.', color: '#c084fc' },
    { sinner: 'Heathcliff', quote: 'We just gonna sit here staring at gauges all afternoon? Mephi\'s engine is revving—let\'s go break something!', color: '#fb923c' },
    { sinner: 'Heathcliff', quote: 'Oi, clockhead! Step on it or let me take the wheel!', color: '#fb923c' },
    { sinner: 'Don Quixote', quote: 'Hark, Manager! Behold the grand chronicle of our valiant bus! Our chivalric crusade shines upon every meter!', color: '#fbbf24' },
    { sinner: 'Don Quixote', quote: 'Onward, glorious steed of steel! Rocinante and Mephistopheles shall charge as one!', color: '#fbbf24' },
    { sinner: 'Ishmael', quote: 'Check the daily reset clock, Dante. We cannot afford to waste a single Enkephalin conversion today.', color: '#38bdf8' },
    { sinner: 'Ishmael', quote: 'I hope you calibrated the compass. I really don\'t feel like drifting off course into another storm.', color: '#38bdf8' },
    { sinner: 'Vergilius', quote: 'Keep your eyes on the road, Dante. If this bus gets dented, you\'re the one polishing the bumper.', color: '#ef4444' },
    { sinner: 'Vergilius', quote: 'Sit down, Heathcliff. Don Quixote, stop shouting. Dante, drive.', color: '#ef4444' },
    { sinner: 'Ryōshū', quote: 'H.M.P.P. (HamHamPangPang) pitstop. Dante, step on the accelerator.', color: '#f87171' },
    { sinner: 'Gregor', quote: 'Man, the engine vibration on this bus always gives me a headache. Mind if I crack a window?', color: '#fca5a5' },
    { sinner: 'Yi Sang', quote: 'The wheels revolve, yet we remain in place. Is movement merely an illusion of the passing scenery?', color: '#4a90d9' },
    { sinner: 'Hong Lu', quote: 'Such scenic vistas outside! Though the smoke from the Backstreets does smudge the windows a bit~', color: '#34d399' },
  ],
  '/schedule': [
    { sinner: 'Meursault', quote: 'The Mirror Dungeon schedule has been synchronized to your exact specifications. Deviation is not recommended.', color: '#a3a3a3' },
    { sinner: 'Meursault', quote: 'Optimal efficiency dictates executing daily operations before the 05:00 server reset.', color: '#a3a3a3' },
    { sinner: 'Ishmael', quote: 'Manager, please stick strictly to the timetable. If we waste modules, we will be stranded in the middle of nowhere again.', color: '#38bdf8' },
    { sinner: 'Ishmael', quote: 'Double check the bonus reward flags. If you forget to claim the weekly hard bonus, that is on you.', color: '#38bdf8' },
    { sinner: 'Outis', quote: 'Executive Manager! Your strategic timetable is immaculate! Only a visionary commander could organize Mirror Dungeons so flawlessly!', color: '#6ee7b7' },
    { sinner: 'Outis', quote: 'I have already reviewed today\'s mission rota. Every Sinner shall execute your commands without hesitation!', color: '#6ee7b7' },
    { sinner: 'Yi Sang', quote: 'A schedule... A cycle recurring endlessly like two mirrors facing each other in the dark. How ideal.', color: '#4a90d9' },
    { sinner: 'Yi Sang', quote: 'One routine concludes, another commences. The clock ticks forward without prejudice.', color: '#4a90d9' },
    { sinner: 'Sinclair', quote: 'A-another Mirror Dungeon run scheduled for today?! My shoulders are still aching from yesterday\'s boss...', color: '#a78bfa' },
    { sinner: 'Sinclair', quote: 'I-I\'ll do my best! Just please don\'t make me fight the Bull alone again!', color: '#a78bfa' },
    { sinner: 'Don Quixote', quote: 'FOR THE SIMULATION CRUSADE! EACH MIRROR ENCOUNTER SHALL HEAR THE THUNDER OF JUSTICE!', color: '#fbbf24' },
    { sinner: 'Hong Lu', quote: 'Are we really venturing into that dreary dungeon again? I was hoping we could visit a tea parlor today~', color: '#34d399' },
    { sinner: 'Heathcliff', quote: 'More dungeon grinding? Fine by me! Let\'s just get in there and smash some heads so we can get paid!', color: '#fb923c' },
  ],
  '/inventory': [
    { sinner: 'Rodion', quote: 'Ooh, look at all those shiny nominal crates! Manager, can we crack open just one? Come on, lucky gambler\'s intuition~', color: '#f472b6' },
    { sinner: 'Rodion', quote: 'Saving up crates is responsible and all, but opening them is where the real adrenaline is, Dante~', color: '#f472b6' },
    { sinner: 'Hong Lu', quote: 'My, what fascinating little boxes! In my family\'s manor we kept jade chests, but these yellow crates have such a rustic charm~', color: '#34d399' },
    { sinner: 'Hong Lu', quote: 'Look at all these threads. They shimmer just like the silk robes from the Southern syndicate workshops.', color: '#34d399' },
    { sinner: 'Gregor', quote: 'Keep a steady eye on that shard count, buddy. Don\'t go burning through your hard-earned crates all at once.', color: '#fca5a5' },
    { sinner: 'Gregor', quote: 'If we find any extra smoke rations in those crates, save a box for me, will ya?', color: '#fca5a5' },
    { sinner: 'Sinclair', quote: 'U-um, Manager... are you completely sure we have enough Enkephalin modules? What if we run out in the backstreets?!', color: '#a78bfa' },
    { sinner: 'Sinclair', quote: 'I carefully counted the thread crates. Everything matches the manifest!', color: '#a78bfa' },
    { sinner: 'Outis', quote: 'Rest assured, Executive Manager! Not a single module or thread crate shall be misplaced under my watchful vigilance!', color: '#6ee7b7' },
    { sinner: 'Heathcliff', quote: 'Crates, modules, whatever. As long as you keep \'em stocked so we can smash heads, I don\'t give a damn.', color: '#fb923c' },
    { sinner: 'Faust', quote: 'The current inventory allocations are adequate. Faust recommends holding surplus crates until the targeted banner.', color: '#c084fc' },
    { sinner: 'Meursault', quote: 'Supply audit complete. Zero discrepancies detected.', color: '#a3a3a3' },
  ],
  '/want-list': [
    { sinner: 'Ryōshū', quote: 'T.T. (Targeted Termination). Dispense the chosen weapon soon, Dante. My blade thirsts for new canvas.', color: '#f87171' },
    { sinner: 'Ryōshū', quote: 'A.O. (Artistic Obsession). That identity belongs in my studio.', color: '#f87171' },
    { sinner: 'Don Quixote', quote: 'TO ATTAIN SUCH GLORIOUS IDENTITIES! I SWEAR UPON MY LANCE WE SHALL DISPENSE THEM ALL!', color: '#fbbf24' },
    { sinner: 'Don Quixote', quote: 'Manager! May I request the most heroic armor available in the Dispenser?!', color: '#fbbf24' },
    { sinner: 'Rodion', quote: 'Patience is a virtue, Dante darling... but pulling from the dispenser right now sounds way more thrilling~', color: '#f472b6' },
    { sinner: 'Heathcliff', quote: 'That 000 ID right there. Get me enough shards for it, and I\'ll personally cave in the next Distortion\'s skull.', color: '#fb923c' },
    { sinner: 'Heathcliff', quote: 'Stop window shopping and hand over the shards already!', color: '#fb923c' },
    { sinner: 'Faust', quote: 'Target allocation registered. Faust calculates an 87.4% probability of successful acquisition before the season concludes.', color: '#c084fc' },
    { sinner: 'Gregor', quote: 'Putting me on the wishlist, Manager? Hey, I\'m flattered. Just hope I don\'t let you down out there.', color: '#fca5a5' },
    { sinner: 'Ishmael', quote: 'Make sure we actually need what\'s on that list, Dante. We can\'t just grab whatever looks flashy.', color: '#38bdf8' },
    { sinner: 'Outis', quote: 'A flawless procurement strategy! Prioritizing these assets will surely secure our next military triumph!', color: '#6ee7b7' },
  ],
  '/identities': [
    { sinner: 'Faust', quote: 'Faust knows all identities across all mirror worlds. Peruse their dossiers with care, Dante.', color: '#c084fc' },
    { sinner: 'Faust', quote: 'Every identity extracted possesses unique passive synergies. Do not neglect their support capabilities.', color: '#c084fc' },
    { sinner: 'Heathcliff', quote: 'Look at all these other versions of me. Every single one of \'em looks pissed off. Good.', color: '#fb923c' },
    { sinner: 'Heathcliff', quote: 'Queequeg... Linton... What kind of twisted jokes are these mirror worlds playing on us?', color: '#fb923c' },
    { sinner: 'Hong Lu', quote: 'Fascinating... A world where I\'m an officer, and another where I\'m in a pirate crew! How wonderfully playful~', color: '#34d399' },
    { sinner: 'Hong Lu', quote: 'The Kurokumo robes look quite stylish, don\'t you think? Such intricate embroidery~', color: '#34d399' },
    { sinner: 'Ryōshū', quote: 'S.A. (Splendid Art). Each reflection has its own exquisite technique to paint the canvas red.', color: '#f87171' },
    { sinner: 'Ryōshū', quote: 'F.O.S. (Flock of Swords). The W Corp cleanup squad knows how to dismantle matter cleanly.', color: '#f87171' },
    { sinner: 'Gregor', quote: 'Seeing all these alternate versions of myself... at least not all of \'em got stuck with a bug arm, haha.', color: '#fca5a5' },
    { sinner: 'Gregor', quote: 'Wait, is that one wearing a Sous-Chef apron?! Who let me near the kitchen knives?!', color: '#fca5a5' },
    { sinner: 'Yi Sang', quote: 'Countless selves existing beyond the glass. Which one of us is the mirror, and which the reflection?', color: '#4a90d9' },
    { sinner: 'Sinclair', quote: 'Some of these... alternate versions of me... they look so intimidating. Especially that Inquisitor one...', color: '#a78bfa' },
  ],
  '/ego': [
    { sinner: 'Sinclair', quote: 'T-the E.G.O resonance... it feels overwhelming just looking at them... Dante, please be careful...', color: '#a78bfa' },
    { sinner: 'Sinclair', quote: 'Branch of Knowledge... whenever I hold it, I feel like something is whispering directly into my head...', color: '#a78bfa' },
    { sinner: 'Gregor', quote: 'E.G.O, huh? Better than sprouting another chitin limb, I suppose. Just make sure the resonance doesn\'t fry our brains.', color: '#fca5a5' },
    { sinner: 'Gregor', quote: 'Legerdemain always makes an apple appear. Honestly, not the worst party trick during long bus trips.', color: '#fca5a5' },
    { sinner: 'Yi Sang', quote: 'Wings forged from the depths of the psyche... When resonant, they flutter towards the light.', color: '#4a90d9' },
    { sinner: 'Yi Sang', quote: 'Sunshower... Even under sorrow\'s downpour, the umbrella holds steady.', color: '#4a90d9' },
    { sinner: 'Meursault', quote: 'The E.G.O equipment is functional and ready for immediate deployment upon your direct command.', color: '#a3a3a3' },
    { sinner: 'Meursault', quote: 'Pursuance demands strict adherence to justice. My conviction remains unaltered.', color: '#a3a3a3' },
    { sinner: 'Ishmael', quote: 'Watch your Sanity when commanding WAW and ALEPH E.G.O, Manager. One corroded Sinner can wipe the whole team.', color: '#38bdf8' },
    { sinner: 'Ishmael', quote: 'Ardor Blossom Star gets ridiculously hot. Don\'t stand downwind when I activate it.', color: '#38bdf8' },
    { sinner: 'Rodion', quote: 'E.G.O suits always have the best dramatic flair. Although, that 4th Match Flame is practically a sauna inside~', color: '#f472b6' },
  ],
  '/changelog': [
    { sinner: 'Kenneth', quote: 'Dante! Please! I just filed this report, don\'t tell me you found another unregistered patron on the bus!', color: '#c9a84c' },
    { sinner: 'Kenneth', quote: 'I haven\'t slept in four days. If the Manager asks for another revision, I might actually dissolve into Enkephalin.', color: '#c9a84c' },
    { sinner: 'Outis', quote: 'Every amendment to this manifest proves the Executive Manager\'s unrivaled administrative supremacy!', color: '#6ee7b7' },
    { sinner: 'Charon', quote: 'Kenneth looks very tired. Charon gives Kenneth one star candy. He says \'thank you\' and starts crying.', color: '#06b6d4' },
    { sinner: 'Vergilius', quote: 'Another update filed. Dante, make sure the Sinners actually read the operational notices this time.', color: '#ef4444' },
    { sinner: 'Vergilius', quote: 'Kenneth, stop shivering. You\'re getting ink stains on the upholstery.', color: '#ef4444' },
    { sinner: 'Heathcliff', quote: 'Who writes all these patch notes anyway? Some nervous bloke hiding under a desk with ink on his glasses?', color: '#fb923c' },
    { sinner: 'Gregor', quote: 'Looks like a lot of paperwork. I\'ll just stick to squashing the bugs we find on the road.', color: '#fca5a5' },
    { sinner: 'Faust', quote: 'The changelog has been reviewed. Faust understands the system updates perfectly.', color: '#c084fc' },
  ],
};

const STORAGE_KEY = 'limbus_mephi_border_progress';

export default function MephistophelesBorderTrack() {
  const location = useLocation();
  const containerRef = useRef(null);

  // Position progress along perimeter: 0.0 to 1.0
  const progressRef = useRef(0);

  // Direct DOM refs for high performance frame updates (eliminates dialogue lag)
  const busRef = useRef(null);
  const bubbleRef = useRef(null);
  const trackBorderRef = useRef(null);

  // Track coordinates and active side without forcing React re-render every frame
  const coordsRef = useRef({ x: 0, y: 0, rotation: 90, side: 'top', cw: 1200, ch: 800 });

  // Sinner dialogue state
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [honkEffect, setHonkEffect] = useState(false);
  const fadeTimeoutRef = useRef(null);
  const nextDialogueTimeoutRef = useRef(null);
  const isDialogueActiveRef = useRef(false);

  // Inset margin from container edges in pixels
  // Bus width is 30px (half-width 15px), so INSET = 18px leaves a tight 3px gap right at the edge
  const BUS_WIDTH = 30;
  const BUS_HEIGHT = 65;
  const INSET = 18;
  const CORNER_R = 20;
  const BUBBLE_WIDTH = 270;
  const BUBBLE_HEIGHT = 100;

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

  // Compute (x, y, rotation, side) dynamically matching page scroll dimensions with smooth cornering
  const updateBusPosition = useCallback(() => {
    // Look up the scrollable main container to scale with full page height
    const scrollContainer = document.getElementById('app-main-scroll') || containerRef.current?.parentElement;
    if (!scrollContainer) return;

    // Use clientWidth to hug the visible viewport width (prevents overflow on smaller laptop screens),
    // and use max(clientHeight, scrollHeight) to scale with vertical page scroll
    const cw = scrollContainer.clientWidth;
    const ch = Math.max(scrollContainer.clientHeight, scrollContainer.scrollHeight);
    if (cw <= 0 || ch <= 0) return;

    // Dynamically adjust track border size to hug the edge of the visible scroll area
    if (trackBorderRef.current) {
      trackBorderRef.current.style.width = `${cw - INSET * 2}px`;
      trackBorderRef.current.style.height = `${ch - INSET * 2}px`;
      trackBorderRef.current.style.borderRadius = `${CORNER_R}px`;
    }

    const topLen = Math.max(0, (cw - 2 * INSET) - 2 * CORNER_R);
    const rightLen = Math.max(0, (ch - 2 * INSET) - 2 * CORNER_R);
    const cornerArc = (Math.PI / 2) * CORNER_R;
    const totalPerimeter = 2 * topLen + 2 * rightLen + 4 * cornerArc;
    if (totalPerimeter <= 0) return;

    let d = (progressRef.current % 1) * totalPerimeter;

    let x = 0;
    let y = 0;
    let rotation = 0;
    let side = 'top';

    // 1. Top straight: Left to Right
    if (d < topLen) {
      x = INSET + CORNER_R + d;
      y = INSET;
      rotation = 90;
      side = 'top';
    } else {
      d -= topLen;
      // 2. Top-Right corner curve
      if (d < cornerArc) {
        const angle = (d / cornerArc) * (Math.PI / 2);
        x = cw - INSET - CORNER_R + Math.sin(angle) * CORNER_R;
        y = INSET + CORNER_R - Math.cos(angle) * CORNER_R;
        rotation = 90 + (d / cornerArc) * 90;
        side = 'top';
      } else {
        d -= cornerArc;
        // 3. Right straight: Top to Bottom
        if (d < rightLen) {
          x = cw - INSET;
          y = INSET + CORNER_R + d;
          rotation = 180;
          side = 'right';
        } else {
          d -= rightLen;
          // 4. Bottom-Right corner curve
          if (d < cornerArc) {
            const angle = (d / cornerArc) * (Math.PI / 2);
            x = cw - INSET - CORNER_R + Math.cos(angle) * CORNER_R;
            y = ch - INSET - CORNER_R + Math.sin(angle) * CORNER_R;
            rotation = 180 + (d / cornerArc) * 90;
            side = 'right';
          } else {
            d -= cornerArc;
            // 5. Bottom straight: Right to Left
            if (d < topLen) {
              x = cw - INSET - CORNER_R - d;
              y = ch - INSET;
              rotation = 270;
              side = 'bottom';
            } else {
              d -= topLen;
              // 6. Bottom-Left corner curve
              if (d < cornerArc) {
                const angle = (d / cornerArc) * (Math.PI / 2);
                x = INSET + CORNER_R - Math.sin(angle) * CORNER_R;
                y = ch - INSET - CORNER_R + Math.cos(angle) * CORNER_R;
                rotation = 270 + (d / cornerArc) * 90;
                side = 'bottom';
              } else {
                d -= cornerArc;
                // 7. Left straight: Bottom to Top
                if (d < rightLen) {
                  x = INSET;
                  y = ch - INSET - CORNER_R - d;
                  rotation = 0;
                  side = 'left';
                } else {
                  d -= rightLen;
                  // 8. Top-Left corner curve
                  const angle = (d / cornerArc) * (Math.PI / 2);
                  x = INSET + CORNER_R - Math.cos(angle) * CORNER_R;
                  y = INSET + CORNER_R - Math.sin(angle) * CORNER_R;
                  rotation = (360 + (d / cornerArc) * 90) % 360;
                  side = 'left';
                }
              }
            }
          }
        }
      }
    }

    coordsRef.current = { x, y, rotation, side, cw, ch };

    // Direct DOM update for bus (zero React state lag)
    if (busRef.current) {
      busRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg)`;
    }

    // Direct DOM update for speech bubble (synchronous 60fps tracking)
    if (bubbleRef.current) {
      let bx = x;
      let by = y;

      if (side === 'top') {
        by = y + BUS_HEIGHT / 2 + 16;
        bx = x - BUBBLE_WIDTH / 2;
      } else if (side === 'bottom') {
        by = y - BUS_HEIGHT / 2 - BUBBLE_HEIGHT - 16;
        bx = x - BUBBLE_WIDTH / 2;
      } else if (side === 'right') {
        bx = x - BUS_HEIGHT / 2 - BUBBLE_WIDTH - 16;
        by = y - BUBBLE_HEIGHT / 2;
      } else {
        // left
        bx = x + BUS_HEIGHT / 2 + 16;
        by = y - BUBBLE_HEIGHT / 2;
      }

      // Dynamic clamping to prevent cutting off at document edges
      const padding = 12;
      bx = Math.max(padding, Math.min(bx, cw - BUBBLE_WIDTH - padding));
      by = Math.max(padding, Math.min(by, ch - BUBBLE_HEIGHT - padding));

      bubbleRef.current.style.transform = `translate(${bx}px, ${by}px)`;
    }
  }, [INSET, CORNER_R, BUS_HEIGHT, BUBBLE_WIDTH, BUBBLE_HEIGHT]);

  // Main driving animation loop
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId;

    // Full loop takes ~60 seconds
    const LAP_DURATION_MS = 60000;

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

  // Trigger dialogue with anti-spam / anti-hang protection
  const triggerDialogue = useCallback(() => {
    // If a dialogue is currently playing, ignore spammed clicks to avoid hang/text overlap
    if (isDialogueActiveRef.current) return;

    const list = TAB_DIALOGUES[location.pathname] || TAB_DIALOGUES['/'];
    const randomItem = list[Math.floor(Math.random() * list.length)];

    isDialogueActiveRef.current = true;
    setActiveDialogue(randomItem);

    // Immediate positioning sync on next paint
    requestAnimationFrame(() => updateBusPosition());

    // Clear any previous fade timeout
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);

    // Dialogue lasts longer (10 seconds)
    fadeTimeoutRef.current = setTimeout(() => {
      setActiveDialogue(null);
      isDialogueActiveRef.current = false;
    }, 10000);
  }, [location.pathname, updateBusPosition]);

  // Schedule random dialogues with longer intervals (30 to 60 seconds)
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 30000 + Math.random() * 30000; // 30 to 60 seconds
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

  // When tab changes: fade dialogue out quickly within 3 seconds
  useEffect(() => {
    if (activeDialogue) {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => {
        setActiveDialogue(null);
        isDialogueActiveRef.current = false;
      }, 3000);
    }
  }, [location.pathname]);

  // User manual click on the bus: horn honk + trigger dialogue safely
  const handleBusClick = (e) => {
    e.stopPropagation();
    setHonkEffect(true);
    setTimeout(() => setHonkEffect(false), 800);
    triggerDialogue();
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      {/* ── Dynamic Scaled Track Border (scales to full scroll size) ── */}
      <div
        ref={trackBorderRef}
        className="absolute rounded-xl pointer-events-none"
        style={{
          top: INSET,
          left: INSET,
          border: '1.5px dashed rgba(201, 168, 76, 0.25)',
          boxShadow: '0 0 12px rgba(201, 168, 76, 0.06), inset 0 0 12px rgba(201, 168, 76, 0.04)',
        }}
      />

      {/* ── Mephistopheles Bus Vehicle ── */}
      <div
        ref={busRef}
        onClick={handleBusClick}
        title="Mephistopheles (Click to honk / speak!)"
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer select-none group origin-center will-change-transform"
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

      {/* ── Direct-Track Speech Bubble (Smooth 60fps tracking, anti-hang, no overlap) ── */}
      <AnimatePresence>
        {activeDialogue && (
          <motion.div
            ref={bubbleRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 pointer-events-auto z-50 p-3.5 rounded-xl bg-[#0d0d12]/95 backdrop-blur-md border shadow-2xl will-change-transform"
            style={{
              width: `${BUBBLE_WIDTH}px`,
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
