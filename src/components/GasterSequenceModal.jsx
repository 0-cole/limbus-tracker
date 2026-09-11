import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gasterFlashbackAudio from '../assets/gaster_flashback.mp3';
import gasterImage from '../assets/gaster_image.jpg';

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
  const [phase, setPhase] = useState('intro'); // 'intro' (5s) | 'text' | 'peek' | 'static' | 'crack'
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [renderedWords, setRenderedWords] = useState([]);
  const [textOpacity, setTextOpacity] = useState(1);
  const [isWaitingForClick, setIsWaitingForClick] = useState(false);
  const [bgGradientOpacity, setBgGradientOpacity] = useState(0);

  const audioCtxRef = useRef(null);
  const clickBufferRef = useRef(null);
  const bgMusicRef = useRef(null);
  const skipCurrentStepRef = useRef(false);

  // Capitalize player username as requested
  const cleanUsername = (username || 'DANTE').toUpperCase();

  // Initialize Web Audio synth and background music
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !audioCtxRef.current) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Pre-create instant click buffer (zero GC, zero CPU stutter)
        const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.025), ctx.sampleRate);
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

    // Play Toby Fox Flashback Excerpt quietly on loop
    try {
      const music = new Audio(gasterFlashbackAudio);
      music.loop = true;
      music.volume = 0.28;
      music.play().catch(() => {});
      bgMusicRef.current = music;
    } catch (e) {}

    // Fade in subtle grey gradient from pitch black over 3 seconds
    const gradTimer = setTimeout(() => {
      setBgGradientOpacity(1);
    }, 400);

    // 5 seconds delay before the first text appears
    const introTimer = setTimeout(() => {
      setPhase('text');
    }, 5000);

    // Listen for completion from Electron window crack
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
      clearTimeout(gradTimer);
      clearTimeout(introTimer);
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      window.electronAPI?.removeGasterComplete?.();
    };
  }, [navigate, onClose]);

  // Fetch actual Windows username via Electron preload
  useEffect(() => {
    let mounted = true;
    if (window.electronAPI?.getSystemUsername) {
      window.electronAPI.getSystemUsername()
        .then((sysUser) => {
          if (mounted && sysUser) setUsername(sysUser.toUpperCase());
        })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, []);

  // Fast typewriter click
  const playTypewriterClick = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx || !clickBufferRef.current) return;
      if (ctx.state === 'suspended') ctx.resume();
      const source = ctx.createBufferSource();
      source.buffer = clickBufferRef.current;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
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
      osc.frequency.setValueAtTime(1050 + Math.random() * 120, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.028);
    } catch (e) {}
  };

  // Loud static noise generator during the static phase
  const playStaticNoise = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 2.8);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.65, now + 2.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  };

  // 22 Dialogue Lines exactly as specified
  const dialogueLines = [
    { text: "VERY.. VERY.. INTERESTING.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "A NEW WORLD.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "THIS WAS NOT.. EXPECTED.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOU.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YES, YOU.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `HELLO AGAIN, ${cleanUsername}.`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "SURPRISED I'D FIND YOU AGAIN?", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "...REGARDLESS.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "WE HAVE TO KEEP GOING.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `DON'T FORGET, ${cleanUsername}.`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "DON'T FORGET ABOUT THEM.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOUR GOAL.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "OUR.. MUTUAL GOAL.", slowTranslatePrefix: true, alreadyEnglish: false, isBold: false },
    { text: "MY.. D E L T A R U N E.", alreadyEnglish: true, isDeltarune: true, isBold: false },
    { text: "BUT.. THAT CAN WAIT.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOU CLEARLY HAVE OTHER MATTERS.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `BUT, DONT FORGET, ${cleanUsername}`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "THIS NEVER HAPPENED.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOU NEVER OPENED THIS APP.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "NOBODY WILL BELIEVE YOU ANYWAY", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "BECAUSE.. AS WE KNOW..", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "ITS RUDE TO TALK ABOUT SOMEONE WHO IS LISTENING.", alreadyEnglish: false, isBold: true, stopMusic: true }
  ];

  // Helper to construct words structure to prevent awkward mid-word breaks
  const buildWordsStructure = (text, alreadyEnglish) => {
    const rawWords = text.split(' ');
    return rawWords.map((rawWord) => ({
      chars: rawWord.split('').map((char) => ({
        orig: char,
        current: alreadyEnglish ? char : charToWingdings(char),
        isWingdings: !alreadyEnglish
      }))
    }));
  };

  // Typewriter & Translation Engine
  useEffect(() => {
    if (phase !== 'text') return;

    let isCancelled = false;
    skipCurrentStepRef.current = false;
    const currentLine = dialogueLines[currentLineIndex];
    if (!currentLine) {
      setPhase('peek');
      return;
    }

    // Music stops dead right when Line 22 begins
    if (currentLine.stopMusic && bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }

    setTextOpacity(1);
    setIsWaitingForClick(false);

    // Initial words structure
    const wordsStruct = buildWordsStructure(currentLine.text, currentLine.alreadyEnglish);
    
    // We will progressively reveal the letters
    const revealedWords = wordsStruct.map(w => ({
      chars: []
    }));
    setRenderedWords([...revealedWords]);

    const runDialogue = async () => {
      // Step 1: Type out in Wingdings (or English for Line 14)
      for (let w = 0; w < wordsStruct.length; w++) {
        for (let c = 0; c < wordsStruct[w].chars.length; c++) {
          if (isCancelled) return;
          if (skipCurrentStepRef.current) break;

          revealedWords[w].chars.push({ ...wordsStruct[w].chars[c] });
          setRenderedWords(revealedWords.map(rw => ({ chars: [...rw.chars] })));
          playTypewriterClick();

          let delay = 70;
          if (currentLine.isDeltarune) {
            delay = 200; // Slower cadence for MY.. D E L T A R U N E.
          } else if (wordsStruct[w].chars[c].orig === '.') {
            delay = 260;
          }
          await new Promise((r) => setTimeout(r, delay));
        }
        if (skipCurrentStepRef.current) break;
      }

      // If skipped, ensure all characters are present in their Wingdings/initial state
      if (skipCurrentStepRef.current) {
        for (let w = 0; w < wordsStruct.length; w++) {
          revealedWords[w].chars = [...wordsStruct[w].chars];
        }
        setRenderedWords(revealedWords.map(rw => ({ chars: [...rw.chars] })));
      }

      if (isCancelled) return;

      // Step 2: Translation to English (if not already in English)
      if (!currentLine.alreadyEnglish) {
        // Short pause before translating
        await new Promise((r) => setTimeout(r, 450));
        if (isCancelled) return;

        let charGlobalIndex = 0;
        for (let w = 0; w < revealedWords.length; w++) {
          for (let c = 0; c < revealedWords[w].chars.length; c++) {
            if (isCancelled) return;
            if (skipCurrentStepRef.current) break;

            revealedWords[w].chars[c].current = revealedWords[w].chars[c].orig;
            revealedWords[w].chars[c].isWingdings = false;
            setRenderedWords(revealedWords.map(rw => ({ chars: [...rw.chars] })));
            playTranslateSound();

            let translateDelay = 38;
            // Extra slow pacing on "OUR.." WHEN IT IS BEING TRANSLATED ONLY!
            if (currentLine.slowTranslatePrefix && charGlobalIndex < 5) {
              translateDelay = 340;
            }
            charGlobalIndex++;
            await new Promise((r) => setTimeout(r, translateDelay));
          }
          if (skipCurrentStepRef.current) break;
        }

        // If skipped, ensure all characters are fully translated
        if (skipCurrentStepRef.current) {
          for (let w = 0; w < revealedWords.length; w++) {
            for (let c = 0; c < revealedWords[w].chars.length; c++) {
              revealedWords[w].chars[c].current = revealedWords[w].chars[c].orig;
              revealedWords[w].chars[c].isWingdings = false;
            }
          }
          setRenderedWords(revealedWords.map(rw => ({ chars: [...rw.chars] })));
        }
      }

      if (isCancelled) return;

      // Line is fully ready: Prompt user to click to proceed
      setIsWaitingForClick(true);
    };

    runDialogue();

    return () => {
      isCancelled = true;
    };
  }, [currentLineIndex, phase, cleanUsername]);

  // Handle user click to advance dialogue or advance to peek phase
  const handleAdvance = () => {
    if (phase !== 'text') return;

    if (!isWaitingForClick) {
      // User clicked while still typing/translating: fast-forward to the end of this line
      skipCurrentStepRef.current = true;
      return;
    }

    // Line finished: Fade out and move to next line or peek phase
    setTextOpacity(0);
    setIsWaitingForClick(false);

    setTimeout(() => {
      if (currentLineIndex < dialogueLines.length - 1) {
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        // All 22 lines finished: transition to peek phase!
        setPhase('peek');
      }
    }, 280);
  };

  // Phase: Peek & Static Escalation
  useEffect(() => {
    if (phase === 'peek') {
      // Hold Gaster peeking from behind the margin for 2.4s
      const staticTimer = setTimeout(() => {
        setPhase('static');
        playStaticNoise();

        // After 2.5s of violent static, trigger the screen fracture!
        const crackTimer = setTimeout(() => {
          setPhase('crack');
          if (window.electronAPI?.triggerGasterWindowCrack) {
            window.electronAPI.triggerGasterWindowCrack();
          } else {
            // Web fallback
            setTimeout(() => {
              try {
                localStorage.setItem('limbus_gaster_triggered', 'true');
                sessionStorage.setItem('limbus_gaster_apology_pending', 'true');
              } catch (e) {}
              navigate('/?incident=gaster_anomaly');
              if (onClose) onClose();
            }, 3500);
          }
        }, 2500);

        return () => clearTimeout(crackTimer);
      }, 2400);

      return () => clearTimeout(staticTimer);
    }
  }, [phase, navigate, onClose]);

  const currentLineConfig = dialogueLines[currentLineIndex];
  const isDeltarune = currentLineConfig?.isDeltarune;
  const isBold = currentLineConfig?.isBold;

  return (
    <div
      onClick={handleAdvance}
      className="fixed inset-0 z-[99999] bg-black overflow-hidden select-none flex items-center justify-center font-mono cursor-pointer"
    >
      {/* Background Gradient (fades in from pure black) */}
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms] pointer-events-none"
        style={{
          opacity: bgGradientOpacity,
          background: 'radial-gradient(circle at center, #1a1a1c 0%, #0d0d0f 65%, #000000 100%)'
        }}
      />

      {/* PHASE 1: Dialogue Sequence */}
      {phase === 'text' && (
        <div
          className="relative z-20 flex flex-col items-center justify-center p-8 max-w-4xl text-center transition-opacity duration-300"
          style={{ opacity: textOpacity }}
        >
          {/* Word-wrapped container: Words NEVER break mid-word */}
          <div className="flex flex-wrap justify-center items-center gap-x-[0.38em] gap-y-3 max-w-4xl text-center px-4">
            {renderedWords.map((word, wIdx) => (
              <span key={wIdx} className="inline-flex whitespace-nowrap">
                {word.chars.map((charItem, cIdx) => (
                  <span
                    key={cIdx}
                    className={`inline-block ${
                      charItem.isWingdings
                        ? 'text-white'
                        : isBold
                        ? 'font-black text-2xl sm:text-4xl text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                        : isDeltarune
                        ? 'font-black text-3xl sm:text-5xl text-white tracking-[0.25em] drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] drop-shadow-[0_0_40px_rgba(200,200,200,0.5)]'
                        : 'text-2xl sm:text-4xl text-gray-100 tracking-[0.16em] drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                    }`}
                    style={{
                      filter: charItem.isWingdings
                        ? 'grayscale(100%) contrast(300%) brightness(125%)'
                        : undefined
                    }}
                  >
                    {charItem.current === ' ' ? '\u00A0' : charItem.current}
                  </span>
                ))}
              </span>
            ))}
            {/* Blinking Undertale square cursor */}
            <span className="inline-block w-3 h-6 sm:h-8 bg-white ml-2 animate-pulse align-middle" />
          </div>

          {/* Click to Advance Indicator */}
          {isWaitingForClick && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex items-center gap-2 text-xs font-mono text-gray-400 tracking-[0.3em] uppercase animate-pulse"
            >
              <span>▼ [CLICK TO ADVANCE]</span>
            </motion.div>
          )}
        </div>
      )}

      {/* PHASE 2: Window Margin Pull & Gaster Peeking Image */}
      {phase === 'peek' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black">
          {/* Peeking Gaster Image behind the pulled margin */}
          <div className="absolute right-[12%] sm:right-[22%] w-64 h-80 flex items-center justify-center">
            <img
              src={gasterImage}
              alt="Gaster Watching"
              className="w-full h-full object-contain filter contrast-150 brightness-90 drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]"
            />
          </div>

          {/* Sliding Window Curtain / Margin */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-38vw' }}
            transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 bg-gradient-to-r from-black via-[#080808] to-black border-r-4 border-gray-800 shadow-[20px_0_50px_rgba(0,0,0,0.95)]"
          />
        </div>
      )}

      {/* PHASE 3: Violent Static Overtaking the Screen (2-3 seconds) */}
      {phase === 'static' && (
        <div className="absolute inset-0 z-40 overflow-hidden bg-black flex items-center justify-center">
          {/* Gaster image flickering in static */}
          <img
            src={gasterImage}
            alt="Gaster Glitch"
            className="w-72 h-96 object-contain opacity-40 filter invert contrast-200 animate-ping"
          />

          {/* Full Screen Noise / Static Scanline Canvas */}
          <div
            className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.18)_0px,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_3px)] pointer-events-none mix-blend-difference animate-pulse"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none"
          />
          <motion.div
            animate={{
              opacity: [0.4, 0.9, 0.3, 0.95, 0.6],
              filter: ['invert(0%)', 'invert(100%)', 'invert(20%)', 'invert(100%)', 'invert(0%)']
            }}
            transition={{ duration: 0.12, repeat: Infinity }}
            className="absolute inset-0 bg-white/20 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
