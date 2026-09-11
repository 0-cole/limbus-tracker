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
  const [phase, setPhase] = useState('text'); // 'text' | 'eye' | 'crack' | 'done'
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [renderedChars, setRenderedChars] = useState([]);
  const [textOpacity, setTextOpacity] = useState(1);
  const [eyeStage, setEyeStage] = useState(1); // 1: small, 2: medium, 3: large
  const [simulatedCrackPhase, setSimulatedCrackPhase] = useState(false);

  const audioCtxRef = useRef(null);
  const clickBufferRef = useRef(null);

  // Pre-initialize lightweight Web Audio synthesizer once to prevent lag
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !audioCtxRef.current) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Pre-create instant click buffer (zero GC, zero CPU stutter)
        const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
        const data = clickBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
        }
        clickBufferRef.current = clickBuf;
      }
    } catch (e) {}

    // Force windowed borderless fullscreen via Electron immediately
    if (window.electronAPI?.startGasterFullscreen) {
      window.electronAPI.startGasterFullscreen().catch(() => {});
    }

    // Listen for sequence completion from Electron
    if (window.electronAPI?.onGasterComplete) {
      window.electronAPI.onGasterComplete(() => {
        try {
          localStorage.setItem('limbus_gaster_triggered', 'true');
          sessionStorage.setItem('limbus_gaster_apology_pending', 'true');
        } catch (e) {}
        navigate('/?incident=gaster_anomaly');
        if (onClose) onClose();
      });
    }

    return () => {
      window.electronAPI?.removeGasterComplete?.();
    };
  }, [navigate, onClose]);

  // Fast typewriter click
  const playTypewriterClick = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx || !clickBufferRef.current) return;
      if (ctx.state === 'suspended') ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = clickBufferRef.current;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (e) {}
  };

  // Translation chirp sound
  const playTranslateSound = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100 + Math.random() * 150, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  };

  // Staged glitch audio: volume scales up with each stage
  const playGlitchAudio = (stage) => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Volume scaling: quiet (0.05), somewhat not quiet (0.20), loud (0.60)
      const vol = stage === 1 ? 0.05 : stage === 2 ? 0.20 : 0.60;

      // Low frequency harsh square drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = stage === 1 ? 'sine' : stage === 2 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(stage === 1 ? 55 : stage === 2 ? 65 : 45, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
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

  // 14 Dialogue Sentences
  // Note: Line 14 ("MY.. DELTARUNE") is already translated to English before typing!
  const dialogueLines = [
    { text: "VERY.. VERY.. INTERESTING.", slowPrefix: false, alreadyEnglish: false },
    { text: "A NEW WORLD.", slowPrefix: false, alreadyEnglish: false },
    { text: "THIS WAS NOT.. EXPECTED.", slowPrefix: false, alreadyEnglish: false },
    { text: "YOU.", slowPrefix: false, alreadyEnglish: false },
    { text: "YES, YOU.", slowPrefix: false, alreadyEnglish: false },
    { text: `HELLO AGAIN, ${username}.`, slowPrefix: false, alreadyEnglish: false },
    { text: "SURPRISED I'D FIND YOU AGAIN?", slowPrefix: false, alreadyEnglish: false },
    { text: "...REGARDLESS.", slowPrefix: false, alreadyEnglish: false },
    { text: "WE HAVE TO KEEP GOING.", slowPrefix: false, alreadyEnglish: false },
    { text: `DON'T FORGET, ${username}.`, slowPrefix: false, alreadyEnglish: false },
    { text: "DON'T FORGET ABOUT THEM.", slowPrefix: false, alreadyEnglish: false },
    { text: "YOUR GOAL.", slowPrefix: false, alreadyEnglish: false },
    { text: "OUR.. MUTUAL GOAL.", slowPrefix: true, alreadyEnglish: false },
    { text: "MY.. DELTARUNE", slowPrefix: true, alreadyEnglish: true }
  ];

  // Typewriter & Translation Engine
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
      // Step 1: Type out letter-by-letter
      const chars = [];
      for (let i = 0; i < fullText.length; i++) {
        if (isCancelled) return;
        const char = fullText[i];

        if (currentLine.alreadyEnglish) {
          // Line 14: Already translated to English before typing!
          chars.push({
            orig: char,
            current: char,
            isWingdings: false
          });
        } else {
          // Lines 1-13: Start in Wingdings
          chars.push({
            orig: char,
            current: charToWingdings(char),
            isWingdings: true
          });
        }

        setRenderedChars([...chars]);
        if (char !== ' ') {
          playTypewriterClick();
        }

        // Pacing adjustments
        let delay = 75;
        if (currentLine.alreadyEnglish) {
          delay = 230; // Extra slow cadence for "MY.. DELTARUNE"
        } else if (currentLine.slowPrefix && i < 5) {
          delay = 220; // Slow cadence for "OUR.."
        } else if (char === '.') {
          delay = 280;
        }
        await new Promise((r) => setTimeout(r, delay));
      }

      if (isCancelled) return;

      // Step 2: Translation (only if not already in English)
      if (!currentLine.alreadyEnglish) {
        // Brief pause before translating
        await new Promise((r) => setTimeout(r, 400));
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
            playTranslateSound();
          }
          await new Promise((r) => setTimeout(r, 40));
        }

        // Hold translated text for user to read
        await new Promise((r) => setTimeout(r, 1300));
      } else {
        // Line 14: Holds in English with deep glowing depth
        await new Promise((r) => setTimeout(r, 2600));
      }

      if (isCancelled) return;

      // Step 3: Fade out smoothly
      setTextOpacity(0);
      await new Promise((r) => setTimeout(r, 500));

      if (isCancelled) return;

      // Next line or advance to eye phase
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

  // Phase 2: Eye Growth escalation (FASTER: ~6.6s total, volume scales up with each stage)
  useEffect(() => {
    if (phase !== 'eye') return;

    // Stage 1: Small (0s - 2.2s) - quietish
    setEyeStage(1);
    playGlitchAudio(1);
    const glitchInterval1 = setInterval(() => playGlitchAudio(1), 550);

    // Stage 2: Medium (2.2s - 4.4s) - somewhat not quiet
    const timer1 = setTimeout(() => {
      clearInterval(glitchInterval1);
      setEyeStage(2);
      playGlitchAudio(2);
      const glitchInterval2 = setInterval(() => playGlitchAudio(2), 350);

      // Stage 3: Large (4.4s - 6.6s) - loud!
      const timer2 = setTimeout(() => {
        clearInterval(glitchInterval2);
        setEyeStage(3);
        playGlitchAudio(3);
        const glitchInterval3 = setInterval(() => playGlitchAudio(3), 180);

        // CLIMAX at ~6.6s: Trigger the Window Crack!
        const timer3 = setTimeout(() => {
          clearInterval(glitchInterval3);
          setPhase('crack');

          // If Electron is running, hand off to transparent desktop overlay
          if (window.electronAPI?.triggerGasterWindowCrack) {
            window.electronAPI.triggerGasterWindowCrack();
          } else {
            // Web fallback simulation
            setSimulatedCrackPhase(true);
            setTimeout(() => {
              try {
                localStorage.setItem('limbus_gaster_triggered', 'true');
                sessionStorage.setItem('limbus_gaster_apology_pending', 'true');
              } catch (e) {}
              navigate('/?incident=gaster_anomaly');
              if (onClose) onClose();
            }, 3500);
          }
        }, 2200);

        return () => clearTimeout(timer3);
      }, 2200);

      return () => clearTimeout(timer2);
    }, 2200);

    return () => {
      clearInterval(glitchInterval1);
      clearTimeout(timer1);
    };
  }, [phase, navigate, onClose]);

  const isDeltaruneLine = dialogueLines[currentLineIndex]?.alreadyEnglish;

  return (
    <div className="fixed inset-0 z-[99999] bg-black overflow-hidden select-none flex items-center justify-center font-mono">
      {/* Background Deep Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,15,15,1)_0%,rgba(0,0,0,1)_100%)] pointer-events-none" />

      {/* PHASE 1: Centered Wingdings / English Dialogue with full whitespace preservation */}
      {phase === 'text' && (
        <div
          className="relative z-20 flex flex-col items-center justify-center p-8 max-w-3xl text-center transition-opacity duration-500"
          style={{ opacity: textOpacity }}
        >
          <div
            className={`font-mono transition-all duration-300 whitespace-pre-wrap ${
              isDeltaruneLine
                ? 'text-3xl sm:text-5xl font-black text-purple-200 tracking-[0.3em] drop-shadow-[0_0_25px_rgba(255,255,255,0.95)] drop-shadow-[0_0_55px_rgba(168,85,247,0.85)] animate-pulse'
                : 'text-2xl sm:text-4xl text-gray-100 tracking-[0.2em] drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'
            }`}
          >
            {renderedChars.map((item, idx) => (
              <span
                key={idx}
                className={
                  item.isWingdings
                    ? 'inline-block transform transition-transform duration-75'
                    : isDeltaruneLine
                    ? 'inline-block text-purple-100'
                    : 'inline-block text-white'
                }
              >
                {item.current === ' ' ? '\u00A0' : item.current}
              </span>
            ))}
            {/* Blinking square Undertale cursor */}
            <span className="inline-block w-3 h-6 sm:h-8 bg-white ml-2 animate-pulse align-middle" />
          </div>

          {/* Subtext depth aura for the DELTARUNE finale */}
          {isDeltaruneLine && (
            <p className="mt-8 text-xs font-mono text-purple-400/60 tracking-[0.55em] uppercase animate-pulse">
              [PROPHECY RECURSION // ANOMALOUS PROTOCOL]
            </p>
          )}
        </div>
      )}

      {/* PHASE 2: Creepy Eye Icon Escalation (Faster, sizes re-calibrated) */}
      {phase === 'eye' && (
        <div className="relative z-30 flex items-center justify-center w-full h-full">
          <motion.div
            animate={{
              x:
                eyeStage === 1
                  ? [-1, 1, 0]
                  : eyeStage === 2
                  ? [-5, 6, -7, 4, -2, 0]
                  : [-18, 20, -22, 16, -12, 0],
              y:
                eyeStage === 1
                  ? [1, -1, 0]
                  : eyeStage === 2
                  ? [4, -5, 6, -3, 0]
                  : [15, -14, 18, -12, 5, 0],
              filter:
                eyeStage === 1
                  ? ['brightness(0.95)', 'brightness(1.05)']
                  : eyeStage === 2
                  ? ['brightness(1.2) contrast(140%)', 'brightness(0.85) contrast(120%)']
                  : [
                      'brightness(1.6) contrast(220%) invert(0%)',
                      'brightness(2.2) contrast(260%) invert(85%)',
                      'brightness(1.4) contrast(190%) invert(0%)'
                    ]
            }}
            transition={{
              duration: eyeStage === 1 ? 0.35 : eyeStage === 2 ? 0.16 : 0.07,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex items-center justify-center select-none pointer-events-none"
          >
            <img
              src={gasterEye}
              alt="Anomalous Eye"
              className={`object-contain transition-all duration-700 ${
                eyeStage === 1
                  ? 'w-10 h-10 opacity-75 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                  : eyeStage === 2
                  ? 'w-36 h-36 opacity-95 drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]'
                  : 'w-72 h-72 opacity-100 drop-shadow-[0_0_60px_rgba(255,255,255,0.95)] drop-shadow-[0_0_120px_rgba(220,38,38,0.95)]'
              }`}
            />
          </motion.div>

          {/* CRT scanlines overlay for Stage 2 & 3 */}
          {eyeStage >= 2 && (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.06)_2px,rgba(255,255,255,0.06)_4px)] pointer-events-none z-40 animate-pulse" />
          )}
        </div>
      )}

      {/* PHASE 3: Browser Fallback Simulation (if running outside Electron) */}
      {simulatedCrackPhase && (
        <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: -250, y: 1200, rotate: -20 }}
            transition={{ duration: 1.6, ease: [0.55, 0.05, 0.95, 0.4] }}
            className="absolute inset-0 bg-black"
            style={{ clipPath: 'polygon(0 0, 52% 0, 48% 50%, 0 54%)' }}
          />
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: 300, y: 1250, rotate: 22 }}
            transition={{ duration: 1.6, ease: [0.55, 0.05, 0.95, 0.4] }}
            className="absolute inset-0 bg-black"
            style={{ clipPath: 'polygon(52% 0, 100% 0, 100% 50%, 48% 50%)' }}
          />
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: -180, y: 1200, rotate: -14 }}
            transition={{ duration: 1.5, ease: [0.55, 0.05, 0.95, 0.4] }}
            className="absolute inset-0 bg-black"
            style={{ clipPath: 'polygon(0 54%, 48% 50%, 54% 100%, 0 100%)' }}
          />
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0 }}
            animate={{ x: 220, y: 1300, rotate: 16 }}
            transition={{ duration: 1.7, ease: [0.55, 0.05, 0.95, 0.4] }}
            className="absolute inset-0 bg-black"
            style={{ clipPath: 'polygon(48% 50%, 100% 50%, 100% 100%, 54% 100%)' }}
          />
        </div>
      )}
    </div>
  );
}
