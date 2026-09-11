import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gasterEye from '../assets/gaster_eye.png';

// Authentic Undertale Wingdings Unicode glyph mapping
const WINGDINGS_MAP = {
  'A': '✌', 'B': '👌', 'C': '👍', 'D': '👎', 'E': '☜', 'F': '☞',
  'G': '☝', 'H': '☟', 'I': '✋', 'J': '☺', 'K': '😐', 'L': '☹',
  'M': '💣', 'N': '☠', 'O': '⚐', 'P': '🏱', 'Q': '✈', 'R': '☼',
  'S': '💧', 'T': '❄', 'U': '🕆', 'V': '✞', 'W': '🕈', 'X': '✠',
  'Y': '✡', 'Z': '☸',
  'a': '✌', 'b': '👌', 'c': '👍', 'd': '👎', 'e': '☜', 'f': '☞',
  'g': '☝', 'h': '☟', 'i': '✋', 'j': '☺', 'k': '😐', 'l': '☹',
  'm': '💣', 'n': '☠', 'o': '⚐', 'p': '🏱', 'q': '✈', 'r': '☼',
  's': '💧', 't': '❄', 'u': '🕆', 'v': '✞', 'w': '🕈', 'x': '✠',
  'y': '✡', 'z': '☸',
  '0': '📁', '1': '📂', '2': '📄', '3': '🗏', '4': '🗐', '5': '🗄',
  '6': '⌛', '7': '🖮', '8': '🖰', '9': '🖲',
  '.': '●', ',': '📭', '!': '✏', '?': '❓', "'": '⬥', '"': '⬦',
  '-': '▪', ':': '⧫', ' ': ' '
};

function charToWingdings(char) {
  return WINGDINGS_MAP[char] || char;
}

export default function GasterSequenceModal({ onClose }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('DANTE');
  const [phase, setPhase] = useState('text'); // 'text' | 'eye' | 'crack' | 'reforming'
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [renderedChars, setRenderedChars] = useState([]);
  const [textOpacity, setTextOpacity] = useState(1);
  const [eyeStage, setEyeStage] = useState(1); // 1: small, 2: medium, 3: large
  const [crackSplit, setCrackSplit] = useState(false);

  const audioCtxRef = useRef(null);

  // Initialize Web Audio synth safely
  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const now = ctx.currentTime;
      if (type === 'typewriter') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420 + Math.random() * 80, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'translate') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'deep_drone') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(48, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 16);
      } else if (type === 'crack') {
        // Crisp glass fracture sound
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1500, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      }
    } catch (e) {
      // Audio fallback without crash
    }
  };

  // Fetch actual Windows username via Electron preload
  useEffect(() => {
    let mounted = true;
    if (window.electronAPI?.getSystemUsername) {
      window.electronAPI.getSystemUsername()
        .then((sysUser) => {
          if (mounted && sysUser) setUsername(sysUser);
        })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, []);

  // Define 14 dialogue sentences
  const dialogueLines = [
    { text: "VERY.. VERY.. INTERESTING.", slowPrefix: false, neverTranslate: false },
    { text: "A NEW WORLD.", slowPrefix: false, neverTranslate: false },
    { text: "THIS WAS NOT.. EXPECTED.", slowPrefix: false, neverTranslate: false },
    { text: "YOU.", slowPrefix: false, neverTranslate: false },
    { text: "YES, YOU.", slowPrefix: false, neverTranslate: false },
    { text: `HELLO AGAIN, ${username}.`, slowPrefix: false, neverTranslate: false },
    { text: "SURPRISED I'D FIND YOU AGAIN?", slowPrefix: false, neverTranslate: false },
    { text: "...REGARDLESS.", slowPrefix: false, neverTranslate: false },
    { text: "WE HAVE TO KEEP GOING.", slowPrefix: false, neverTranslate: false },
    { text: `DON'T FORGET, ${username}.`, slowPrefix: false, neverTranslate: false },
    { text: "DON'T FORGET ABOUT THEM.", slowPrefix: false, neverTranslate: false },
    { text: "YOUR GOAL.", slowPrefix: false, neverTranslate: false },
    { text: "OUR.. MUTUAL GOAL.", slowPrefix: true, neverTranslate: false },
    { text: "MY.. D E L T A R U N E.", slowPrefix: true, neverTranslate: true }
  ];

  // Process sentence typewriter & translation
  useEffect(() => {
    if (phase !== 'text') return;

    let isCancelled = false;
    const currentLine = dialogueLines[currentLineIndex];
    if (!currentLine) {
      setPhase('eye');
      return;
    }

    const fullText = currentLine.text;
    setTextOpacity(1);
    setRenderedChars([]);

    const runSentence = async () => {
      // Step 1: Type out in Wingdings letter-by-letter
      const chars = [];
      for (let i = 0; i < fullText.length; i++) {
        if (isCancelled) return;
        const char = fullText[i];
        chars.push({
          orig: char,
          current: charToWingdings(char),
          isWingdings: true
        });
        setRenderedChars([...chars]);
        playSound('typewriter');

        // Pacing: slow down on dots or slowPrefix (e.g. "OUR..")
        let delay = 90;
        if (currentLine.slowPrefix && i < 5) {
          delay = 240; // extra slow for "OUR.." or "MY.."
        } else if (currentLine.neverTranslate) {
          delay = 190; // slow ominous cadence for DELTARUNE
        } else if (char === '.') {
          delay = 320;
        }
        await new Promise((r) => setTimeout(r, delay));
      }

      if (isCancelled) return;

      // Step 2: Translation
      if (!currentLine.neverTranslate) {
        // Pause before translating
        await new Promise((r) => setTimeout(r, 450));
        if (isCancelled) return;

        // Translate letter-by-letter into English
        for (let i = 0; i < chars.length; i++) {
          if (isCancelled) return;
          chars[i] = {
            ...chars[i],
            current: chars[i].orig,
            isWingdings: false
          };
          setRenderedChars([...chars]);
          if (chars[i].orig !== ' ') {
            playSound('translate');
          }
          await new Promise((r) => setTimeout(r, 45));
        }

        // Hold translated text for user to read
        await new Promise((r) => setTimeout(r, 1400));
      } else {
        // Line 14: Never translates! Holds in deep Wingdings
        await new Promise((r) => setTimeout(r, 3000));
      }

      if (isCancelled) return;

      // Step 3: Fade out
      setTextOpacity(0);
      await new Promise((r) => setTimeout(r, 600));

      if (isCancelled) return;

      // Next line or switch to eye phase
      if (currentLineIndex < dialogueLines.length - 1) {
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        setPhase('eye');
      }
    };

    runSentence();

    return () => {
      isCancelled = true;
    };
  }, [currentLineIndex, phase, username]);

  // Phase 2: Eye Growth escalation (~15 seconds)
  useEffect(() => {
    if (phase !== 'eye') return;
    playSound('deep_drone');

    // Stage 1: Small (0s - 5s)
    setEyeStage(1);

    const timer1 = setTimeout(() => {
      setEyeStage(2); // Stage 2: Medium (5s - 10s)
    }, 5000);

    const timer2 = setTimeout(() => {
      setEyeStage(3); // Stage 3: Large (10s - 15s)
    }, 10000);

    const timer3 = setTimeout(() => {
      // Transition to screen crack
      setPhase('crack');
    }, 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [phase]);

  // Phase 3: Screen Fracture & Reformation
  useEffect(() => {
    if (phase !== 'crack') return;

    playSound('crack');
    setCrackSplit(true);

    // After screen splits open, start reformation
    const reformTimer = setTimeout(() => {
      setPhase('reforming');
      setCrackSplit(false);
    }, 1600);

    // After reformation completes, redirect to dashboard with incident flag
    const doneTimer = setTimeout(() => {
      // Record triggered state so it never repeats (unless cdblair418@gmail.com)
      try {
        localStorage.setItem('limbus_gaster_triggered', 'true');
      } catch (e) {}

      // Navigate to dashboard with incident parameter
      navigate('/?incident=gaster_anomaly');
      if (onClose) onClose();
    }, 2800);

    return () => {
      clearTimeout(reformTimer);
      clearTimeout(doneTimer);
    };
  }, [phase, navigate, onClose]);

  const isLastLine = dialogueLines[currentLineIndex]?.neverTranslate;

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden select-none flex items-center justify-center font-mono">
      {/* Background Deep Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,15,15,1)_0%,rgba(0,0,0,1)_100%)] pointer-events-none" />

      {/* PHASE 1: Centered Wingdings / English Dialogue */}
      {phase === 'text' && (
        <div
          className="relative z-20 flex flex-col items-center justify-center p-8 max-w-3xl text-center transition-opacity duration-500"
          style={{ opacity: textOpacity }}
        >
          <div
            className={`font-mono tracking-[0.25em] transition-all duration-300 ${
              isLastLine
                ? 'text-3xl sm:text-5xl text-purple-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] drop-shadow-[0_0_40px_rgba(168,85,247,0.7)] animate-pulse'
                : 'text-2xl sm:text-4xl text-gray-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'
            }`}
            style={{
              fontFamily: isLastLine ? '"Segoe UI Symbol", "Wingdings", monospace' : undefined,
              letterSpacing: isLastLine ? '0.35em' : '0.2em'
            }}
          >
            {renderedChars.map((item, idx) => (
              <span
                key={idx}
                className={
                  item.isWingdings
                    ? 'inline-block transform transition-transform duration-100'
                    : 'inline-block text-white'
                }
              >
                {item.current}
              </span>
            ))}
            {/* Blinking Undertale square cursor */}
            <span className="inline-block w-3 h-6 sm:h-8 bg-white ml-2 animate-pulse align-middle" />
          </div>

          {/* Subtext depth shadow for the DELTARUNE finale */}
          {isLastLine && (
            <p className="mt-8 text-xs font-mono text-purple-400/50 tracking-[0.5em] uppercase animate-pulse">
              [PROPHECY RECURSION // ANOMALOUS PROTOCOL]
            </p>
          )}
        </div>
      )}

      {/* PHASE 2: Creepy Eye Icon Escalation */}
      {phase === 'eye' && (
        <div className="relative z-30 flex items-center justify-center w-full h-full">
          <motion.div
            animate={{
              x: eyeStage === 1 ? [-2, 2, -1, 1, 0] : eyeStage === 2 ? [-6, 7, -8, 5, -2, 0] : [-16, 18, -20, 15, -10, 0],
              y: eyeStage === 1 ? [1, -2, 2, 0] : eyeStage === 2 ? [5, -6, 7, -4, 0] : [14, -12, 16, -10, 4, 0],
              scale: eyeStage === 1 ? [0.95, 1.05, 1] : eyeStage === 2 ? [1.4, 1.55, 1.45] : [2.6, 2.9, 2.7],
              filter: eyeStage === 1
                ? ['brightness(0.9)', 'brightness(1.1)']
                : eyeStage === 2
                ? ['brightness(1.2) contrast(150%)', 'brightness(0.8) contrast(120%)']
                : [
                    'brightness(1.5) contrast(200%) invert(0%)',
                    'brightness(2) contrast(250%) invert(80%)',
                    'brightness(1.3) contrast(180%) invert(0%)'
                  ]
            }}
            transition={{
              duration: eyeStage === 1 ? 0.3 : eyeStage === 2 ? 0.18 : 0.08,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex items-center justify-center select-none pointer-events-none"
          >
            <img
              src={gasterEye}
              alt="Anomalous Eye"
              className={`object-contain transition-all duration-1000 ${
                eyeStage === 1
                  ? 'w-24 h-24 opacity-85 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                  : eyeStage === 2
                  ? 'w-44 h-44 opacity-95 drop-shadow-[0_0_35px_rgba(239,68,68,0.7)]'
                  : 'w-72 h-72 opacity-100 drop-shadow-[0_0_60px_rgba(255,255,255,0.9)] drop-shadow-[0_0_100px_rgba(220,38,38,0.9)]'
              }`}
            />
          </motion.div>

          {/* Glitch CRT static scanlines overlay during Stage 2 & 3 */}
          {eyeStage >= 2 && (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.06)_2px,rgba(255,255,255,0.06)_4px)] pointer-events-none z-40 animate-pulse" />
          )}
        </div>
      )}

      {/* PHASE 3: Jagged Screen Crack & Fracture Split */}
      {(phase === 'crack' || phase === 'reforming') && (
        <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Left Split Half */}
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={crackSplit ? { x: -85, y: -25, rotate: -2.5 } : { x: 0, y: 0, rotate: 0 }}
            transition={{ duration: phase === 'reforming' ? 0.9 : 0.25, ease: 'easeOut' }}
            className="absolute inset-0 bg-black"
            style={{
              clipPath: 'polygon(0 0, 52% 0, 47% 24%, 55% 48%, 46% 72%, 52% 100%, 0 100%)'
            }}
          >
            <div className="w-full h-full bg-[#080808] opacity-90 border-r border-white/40" />
          </motion.div>

          {/* Right Split Half */}
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={crackSplit ? { x: 85, y: 25, rotate: 2.5 } : { x: 0, y: 0, rotate: 0 }}
            transition={{ duration: phase === 'reforming' ? 0.9 : 0.25, ease: 'easeOut' }}
            className="absolute inset-0 bg-black"
            style={{
              clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 52% 100%, 46% 72%, 55% 48%, 47% 24%)'
            }}
          >
            <div className="w-full h-full bg-[#080808] opacity-90 border-l border-white/40" />
          </motion.div>

          {/* Glowing Jagged White Fracture Seam */}
          <svg className="absolute inset-0 w-full h-full z-50 pointer-events-none drop-shadow-[0_0_20px_#ffffff]">
            <polyline
              points="52vw,0 47vw,24vh 55vw,48vh 46vw,72vh 52vw,100vh"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Void Reality Burst Light behind the crack */}
          {crackSplit && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-full bg-white/80 blur-md animate-pulse" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
