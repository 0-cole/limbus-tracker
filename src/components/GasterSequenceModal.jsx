import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore.js';
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
  const managerProfile = useStore((s) => s.managerProfile);
  const cleanManagerName = (managerProfile?.callSign || 'Dante').toUpperCase();
  const [username, setUsername] = useState('DANTE');
  const [phase, setPhase] = useState('intro'); // 'intro' (5s) | 'text' | 'watching' | 'static' | 'crack'
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [renderedWords, setRenderedWords] = useState([]);
  const [textOpacity, setTextOpacity] = useState(1);
  const [isWaitingForClick, setIsWaitingForClick] = useState(false);
  const [showGreyGradient, setShowGreyGradient] = useState(false);
  const [staticOpacity, setStaticOpacity] = useState(0);

  const audioCtxRef = useRef(null);
  const clickBufferRef = useRef(null);
  const bgMusicSourceRef = useRef(null);
  const skipCurrentStepRef = useRef(false);
  const staticCanvasRef = useRef(null);

  // Capitalize player PC username
  const cleanUsername = (username || 'DANTE').toUpperCase();

  // 1. Initialize Web Audio, seamless music loop, and 5s intro prelude
  useEffect(() => {
    let isCancelled = false;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !audioCtxRef.current) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Pre-create instant typewriter click buffer
        const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.025), ctx.sampleRate);
        const data = clickBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
        }
        clickBufferRef.current = clickBuf;

        // Fetch and decode Toby Fox Flashback Excerpt for 100% SEAMLESS, ZERO-GAP LOOPING!
        fetch(gasterFlashbackAudio)
          .then((res) => res.arrayBuffer())
          .then((ab) => ctx.decodeAudioData(ab))
          .then((audioBuf) => {
            if (isCancelled || !audioCtxRef.current) return;

            const sampleRate = audioBuf.sampleRate;
            const numChannels = audioBuf.numberOfChannels;
            const ch0 = audioBuf.getChannelData(0);

            // 1. Detect start of music past MP3 encoder silence
            let startSample = 0;
            for (let i = 0; i < Math.min(ch0.length, sampleRate); i++) {
              if (Math.abs(ch0[i]) > 0.0005) {
                startSample = i;
                break;
              }
            }
            // Align start to zero-crossing
            for (let i = startSample; i < startSample + 100 && i < ch0.length - 1; i++) {
              if ((ch0[i] >= 0 && ch0[i + 1] < 0) || (ch0[i] <= 0 && ch0[i + 1] > 0)) {
                startSample = i;
                break;
              }
            }

            // 2. Deltarune Flashback Excerpt is an exact 32.0s musical loop
            // Stripping the trailing 4.76s of silence in the raw MP3 gives an instant, gapless loop!
            const loopSamples = Math.round(32.0 * sampleRate);
            let endSample = Math.min(startSample + loopSamples, ch0.length);
            for (let i = Math.max(0, endSample - 50); i < Math.min(ch0.length - 1, endSample + 50); i++) {
              if ((ch0[i] >= 0 && ch0[i + 1] < 0) || (ch0[i] <= 0 && ch0[i + 1] > 0)) {
                endSample = i;
                break;
              }
            }

            const trimmedLength = endSample - startSample;
            const trimmedBuf = ctx.createBuffer(numChannels, trimmedLength, sampleRate);
            for (let c = 0; c < numChannels; c++) {
              const srcData = audioBuf.getChannelData(c);
              const dstData = trimmedBuf.getChannelData(c);
              for (let i = 0; i < trimmedLength; i++) {
                dstData[i] = srcData[startSample + i];
              }
            }

            const srcNode = ctx.createBufferSource();
            srcNode.buffer = trimmedBuf;
            srcNode.loop = true; // Flawless zero-gap loop on exact 32.0s buffer
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.28, ctx.currentTime);
            srcNode.connect(gainNode);
            gainNode.connect(ctx.destination);
            srcNode.start(0);
            bgMusicSourceRef.current = srcNode;
          })
          .catch(() => {});
      }
    } catch (e) {}

    // Force windowed borderless fullscreen via Electron immediately
    if (window.electronAPI?.startGasterFullscreen) {
      window.electronAPI.startGasterFullscreen().catch(() => {});
    }

    // Slow, gradual fade-in to the dark grey radial gradient
    const gradTimer = setTimeout(() => {
      setShowGreyGradient(true);
    }, 600);

    // Exactly 5 seconds delay before the first text begins
    const introTimer = setTimeout(() => {
      setPhase('text');
    }, 5000);

    // Listen for sequence completion from Electron window crack
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
      isCancelled = true;
      clearTimeout(gradTimer);
      clearTimeout(introTimer);
      if (bgMusicSourceRef.current) {
        try {
          bgMusicSourceRef.current.stop();
        } catch (e) {}
        bgMusicSourceRef.current = null;
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
      filter.frequency.setValueAtTime(2200, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.7, now + 2.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.7);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) {}
  };

  // 22 Dialogue Lines with exact customizations
  const dialogueLines = [
    { text: "VERY.. VERY.. INTERESTING.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "A NEW WORLD.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "THIS WAS NOT.. EXPECTED.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOU.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YES, YOU.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `HELLO AGAIN, ${cleanManagerName}.`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `OR SHOULD I SAY.. ${cleanUsername}?`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "SURPRISED I'D FIND YOU AGAIN?", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "...REGARDLESS.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "WE HAVE TO KEEP GOING.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `DON'T FORGET, ${cleanManagerName}.`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "DON'T FORGET ABOUT THEM.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOUR GOAL.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "OUR.. MUTUAL GOAL.", slowTranslatePrefix: true, alreadyEnglish: false, isBold: false },
    { text: "MY.. D E L T A R U N E.", alreadyEnglish: true, isDeltarune: true, isBold: false },
    { text: "BUT.. THAT CAN WAIT.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOU CLEARLY HAVE OTHER MATTERS.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: `BUT, DONT FORGET, ${cleanManagerName}`, slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "THIS NEVER HAPPENED.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "YOU NEVER OPENED THIS PROGRAM.", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "NOBODY WILL BELIEVE YOU ANYWAY", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "BECAUSE.. AS WE KNOW..", slowTranslatePrefix: false, alreadyEnglish: false, isBold: false },
    { text: "ITS RUDE TO TALK ABOUT SOMEONE WHO'S LISTENING.", alreadyEnglish: true, isListening: true, isBold: true, stopMusic: true }
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
      setPhase('watching');
      return;
    }

    // Line 22: Music stops dead, but screen DOES NOT cut to black
    if (currentLine.stopMusic) {
      if (bgMusicSourceRef.current) {
        try {
          bgMusicSourceRef.current.stop();
        } catch (e) {}
        bgMusicSourceRef.current = null;
      }
      // Note: Gradient remains active, no sudden cut to black!
    }

    setTextOpacity(1);
    setIsWaitingForClick(false);

    const wordsStruct = buildWordsStructure(currentLine.text, currentLine.alreadyEnglish);
    const revealedWords = wordsStruct.map(() => ({ chars: [] }));
    setRenderedWords([...revealedWords]);

    const runDialogue = async () => {
      // Step 1: Type out letter-by-letter
      for (let w = 0; w < wordsStruct.length; w++) {
        for (let c = 0; c < wordsStruct[w].chars.length; c++) {
          if (isCancelled) return;
          if (skipCurrentStepRef.current) break;

          revealedWords[w].chars.push({ ...wordsStruct[w].chars[c] });
          setRenderedWords(revealedWords.map((rw) => ({ chars: [...rw.chars] })));
          playTypewriterClick();

          let delay = 70;
          if (wordsStruct[w].chars[c].orig === '.') {
            delay = 260;
          }
          await new Promise((r) => setTimeout(r, delay));
        }
        if (skipCurrentStepRef.current) break;
      }

      if (skipCurrentStepRef.current) {
        for (let w = 0; w < wordsStruct.length; w++) {
          revealedWords[w].chars = [...wordsStruct[w].chars];
        }
        setRenderedWords(revealedWords.map((rw) => ({ chars: [...rw.chars] })));
      }

      if (isCancelled) return;

      // Step 2: Translation (only for lines starting in Wingdings)
      if (!currentLine.alreadyEnglish) {
        await new Promise((r) => setTimeout(r, 400));
        if (isCancelled) return;

        let charGlobalIndex = 0;
        for (let w = 0; w < revealedWords.length; w++) {
          for (let c = 0; c < revealedWords[w].chars.length; c++) {
            if (isCancelled) return;
            if (skipCurrentStepRef.current) break;

            revealedWords[w].chars[c].current = revealedWords[w].chars[c].orig;
            revealedWords[w].chars[c].isWingdings = false;
            setRenderedWords(revealedWords.map((rw) => ({ chars: [...rw.chars] })));
            playTranslateSound();

            let translateDelay = 38;
            // Extra slow pacing on "OUR.." WHEN IT IS BEING TRANSLATED ONLY!
            if (currentLine.slowTranslatePrefix && charGlobalIndex < 5) {
              translateDelay = 350;
            }
            charGlobalIndex++;
            await new Promise((r) => setTimeout(r, translateDelay));
          }
          if (skipCurrentStepRef.current) break;
        }

        if (skipCurrentStepRef.current) {
          for (let w = 0; w < revealedWords.length; w++) {
            revealedWords[w].chars[c].current = revealedWords[w].chars[c].orig;
            revealedWords[w].chars[c].isWingdings = false;
          }
          setRenderedWords(revealedWords.map((rw) => ({ chars: [...rw.chars] })));
        }
      }

      if (isCancelled) return;

      if (currentLine.isListening) {
        // Automatically pull back the screen right after typing finishes! Text does NOT disappear!
        setTimeout(() => {
          if (!isCancelled) {
            setPhase('watching');
          }
        }, 900);
        return;
      }

      // Line ready: wait for click
      setIsWaitingForClick(true);
    };

    runDialogue();

    return () => {
      isCancelled = true;
    };
  }, [currentLineIndex, phase, cleanUsername]);

  // Click to advance dialogue or advance to watching phase
  const handleAdvance = () => {
    if (phase !== 'text') return;

    const currentLine = dialogueLines[currentLineIndex];
    if (currentLine?.isListening) {
      // Do nothing on click for final line; it auto-pulls screen without disappearing
      return;
    }

    if (!isWaitingForClick) {
      // Fast forward line
      skipCurrentStepRef.current = true;
      return;
    }

    setTextOpacity(0);
    setIsWaitingForClick(false);

    setTimeout(() => {
      if (currentLineIndex < dialogueLines.length - 1) {
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        // Advance to Gaster watching phase!
        setPhase('watching');
      }
    }, 280);
  };

  // Phase: Gaster Watching & CapCut-style Creeping Static Ramping
  useEffect(() => {
    if (phase === 'watching') {
      // Screen slides left over 4.0s to slowly reveal Gaster.
      // Static starts a couple seconds AFTER Gaster slowly appears (4.0s slide + 2.0s pause = 6.0s)
      const staticTimer = setTimeout(() => {
        setPhase('static');
        playStaticNoise();

        // Slow, chilling creeping crawl over 5.2 seconds (gradual CapCut grain rise)
        const startTime = Date.now();
        const duration = 5200;
        const rampInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          setStaticOpacity(progress);
          if (progress >= 1) {
            clearInterval(rampInterval);
          }
        }, 30);

        // Climax: Screen cracks in half once static reaches peak!
        const crackTimer = setTimeout(() => {
          clearInterval(rampInterval);
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
        }, 5300);

        return () => {
          clearInterval(rampInterval);
          clearTimeout(crackTimer);
        };
      }, 6000);

      return () => clearTimeout(staticTimer);
    }
  }, [phase, navigate, onClose]);

  // Procedural 60 FPS TV Static Noise Canvas
  useEffect(() => {
    if (phase !== 'static' || !staticCanvasRef.current) return;
    let animId;
    const canvas = staticCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 180;
    const imgData = ctx.createImageData(320, 180);

    const renderNoise = () => {
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = (Math.random() * 255) | 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(renderNoise);
    };

    renderNoise();
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  const currentLineConfig = dialogueLines[currentLineIndex];
  const isDeltarune = currentLineConfig?.isDeltarune;
  const isListening = currentLineConfig?.isListening;
  const isBold = currentLineConfig?.isBold;

  return (
    <div
      onClick={handleAdvance}
      className="fixed inset-0 z-[99999] bg-black overflow-hidden select-none font-mono cursor-pointer"
    >
      {/* 1. Behind the screen on the right: Life-Sized Unlit Gaster (Shipwrecked 64 style) - Narrow 25% Screen Margin */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'watching' || phase === 'static' ? 1 : 0
        }}
        transition={{ duration: 4.0, ease: 'easeInOut' }}
        className="absolute right-0 top-0 bottom-0 w-[25vw] h-full flex items-center justify-center overflow-hidden pointer-events-none z-10 bg-black"
      >
        <img
          src={gasterImage}
          alt="Gaster Lurking"
          className="h-full w-full object-contain select-none pointer-events-none"
          style={{
            // Raw, unlit, zero halo, zero glow - pure Shipwrecked 64 uncanny dread
            filter: 'contrast(135%) brightness(90%)'
          }}
        />
      </motion.div>

      {/* 2. Main Program Window Layer (Slides left over 4.0s to reveal Gaster behind it; NO line border, NO cut to black) */}
      <motion.div
        initial={{ x: '0vw' }}
        animate={{
          x: phase === 'watching' || phase === 'static' ? '-25vw' : '0vw'
        }}
        transition={{ duration: 4.0, ease: 'easeInOut' }}
        className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-black shadow-[30px_0_90px_rgba(0,0,0,0.95)]"
      >
        {/* Depths of Deltarune: Ebbing & Flowing Dark Grey Radial Gradient (STAYS ACTIVE, NEVER CUTS TO BLACK) */}
        <AnimatePresence>
          {showGreyGradient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.45, 0.7, 0.5, 0.7],
                scale: [1, 1.08, 1, 1.05, 1]
              }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                scale: { duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
              }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, #101014 0%, #08080a 55%, #000000 100%)'
              }}
            />
          )}
        </AnimatePresence>

        {/* PHASE 1 & 2: Dialogue Sequence & Persistent Final Line */}
        {(phase === 'text' || phase === 'watching' || phase === 'static') && (
          <div
            className="relative z-20 flex flex-col items-center justify-center p-8 max-w-5xl text-center transition-opacity duration-300 w-full"
            style={{ opacity: textOpacity }}
          >
            {/* Word-wrapped container: Words NEVER break mid-word, spacious word gaps */}
            <div
              className={`flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-8 gap-y-4 max-w-5xl text-center px-4 ${
                isListening ? 'whitespace-nowrap flex-nowrap' : ''
              }`}
            >
              {renderedWords.map((word, wIdx) => (
                <span key={wIdx} className="inline-flex whitespace-nowrap">
                  {word.chars.map((charItem, cIdx) => (
                    <span
                      key={cIdx}
                      className={`inline-block ${
                        charItem.isWingdings
                          ? 'text-white text-3xl sm:text-5xl md:text-6xl scale-125 leading-none mx-[0.05em]'
                          : isListening
                          ? 'font-black text-xl sm:text-2xl md:text-3xl text-white tracking-[0.2em] whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]'
                          : isBold
                          ? 'font-black text-2xl sm:text-4xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]'
                          : isDeltarune
                          ? 'font-black text-3xl sm:text-5xl text-white tracking-[0.25em] drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]'
                          : 'text-2xl sm:text-4xl text-gray-100 tracking-[0.16em] drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]'
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
              {/* Blinking Undertale square cursor - ONLY during text entry */}
              {phase === 'text' && (
                <span className="inline-block w-3 h-6 sm:h-8 bg-white ml-2 animate-pulse align-middle" />
              )}
            </div>

            {/* Click to Advance Indicator - ONLY when waiting for click and not on final line */}
            {isWaitingForClick && !isListening && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex items-center gap-2 text-xs font-mono text-gray-500 tracking-[0.3em] uppercase animate-pulse"
              >
                <span>▼ [CLICK TO ADVANCE]</span>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* PHASE 3: CapCut Grain-Style TV Static Ramping up over 2.5s */}
      {phase === 'static' && (
        <div
          className="fixed inset-0 z-50 w-screen h-screen pointer-events-none transition-opacity"
          style={{ opacity: staticOpacity }}
        >
          {/* Real-time high-density TV static noise canvas */}
          <canvas
            ref={staticCanvasRef}
            className="w-full h-full object-cover mix-blend-screen"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Subtle horizontal CRT scanlines */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_1px,transparent_1px,transparent_2px)] pointer-events-none" />
        </div>
      )}
    </div>
  );
}
