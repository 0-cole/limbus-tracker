import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Siren, AlertOctagon, X, ShieldAlert, Radio } from 'lucide-react';
import GasterCrackScene from './components/GasterCrackScene.jsx';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import IdentitiesPage from './pages/IdentitiesPage';
import EgoPage from './pages/EgoPage';
import WantListPage from './pages/WantListPage';
import InventoryPage from './pages/InventoryPage';
import SchedulePage from './pages/SchedulePage';
import ChangelogPage from './pages/ChangelogPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingModal from './components/OnboardingModal';
import TutorialTour from './components/TutorialTour';
import UpdateNotification from './components/UpdateNotification';
import Season8NoticeModal from './components/Season8NoticeModal';
import SyncConflictModal from './components/SyncConflictModal';
import MephistophelesBorderTrack from './components/MephistophelesBorderTrack';
import { useStore } from './stores/useStore';

const KONAMI_SEQUENCE = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright',
  'b', 'a'
];

function SecondTrumpetModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-[#0e0707] border-2 border-red-600 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.6)] relative flex flex-col max-h-[90vh]">
        {/* Flashing Hazard Stripe Top Bar */}
        <div className="h-3 w-full bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_15px,#000_15px,#000_30px)] animate-pulse" />

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-950 via-[#1c0a0a] to-red-950 border-b border-red-900/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 relative">
              <Siren size={28} className="animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-red-400 block animate-pulse">
                ⚠️ [FACILITY HAZARD: PROTOCOL #02]
              </span>
              <h2 className="text-2xl font-black font-limbus text-white tracking-wider flex items-center gap-2">
                SECOND TRUMPET SOUNDED
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-mono text-red-300">
              <span>ALARM FREQUENCY: 140 dB</span>
              <span className="font-bold text-red-400 animate-pulse">SUPPRESSION IN PROGRESS</span>
            </div>
            <p className="text-xs text-red-200 leading-relaxed font-mono">
              The Second Trumpet has resonated across the bus! Mephistopheles navigation systems are experiencing severe resonance overload. Emergency override sequence detected via master input controls.
            </p>
          </div>

          {/* Sinner Reaction Intercom */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Intercom Black-Box Audio Logs:
            </span>
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-2 font-mono">
              <p><strong className="text-cyan-400">Charon:</strong> "Vroom vroom! Red lights flashing like cherries! Mephistopheles goes supersonic speed! Dante, hold on tight!"</p>
              <p><strong className="text-orange-400">Heathcliff:</strong> "WHAT IS THAT DEAFENING RACKET?! WHO CARES ABOUT TRUMPETS?! I'M GOING TO BASH THE ALARM SENSOR INTO DUST!"</p>
              <p><strong className="text-purple-400">Faust:</strong> "Faust recognizes this klaxon. The Manager has triggered the ancient facility emergency protocol. It is advised to silence it before an Arbiter is deployed."</p>
              <p><strong className="text-amber-400">Don Quixote:</strong> "A TRUMPET CALL! A HERALD OF VALIANT COMBAT! FEAR NOT, FOR JUSTICE SHALL PREVAIL IN THIS DARK HOUR!"</p>
              <p><strong className="text-red-400">Vergilius:</strong> "...Dante. You have exactly five seconds to turn this alarm off before I turn off your head."</p>
            </div>
          </div>

          {/* Kenneth Memo */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
              📋 Records Keeper Kenneth — Emergency Radio Broadcast
            </span>
            <p className="text-xs italic text-gray-200 font-mono leading-relaxed">
              "DANTE! WHAT BUTTON COMBINATION DID YOU JUST MASH INTO THE MEPHISTOPHELES NAVIGATION COMPUTER?! The emergency sirens are echoing through all 26 Districts! Charon just blew past a K Corp checkpoint at 120 MPH shouting 'Fast bus!' and Corporate is calling my personal phone! HIT THE DISENGAGE BUTTON BEFORE WE GET BOMBED FROM ORBIT!"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-black/70 border-t border-red-900/40 flex justify-between items-center">
          <span className="text-[11px] font-mono text-gray-500">
            Konami Sequence [↑ ↑ ↓ ↓ ← → ← → B A] Recognized
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
          >
            Disengage Second Trumpet
          </button>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
    if (window.electronAPI && window.electronAPI.logError) {
      window.electronAPI.logError(`${error.toString()}\n${info.componentStack}`);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-black min-h-screen">
          <h1 className="text-2xl font-bold">App Crashed</h1>
          <pre className="mt-4 text-sm whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          <pre className="mt-4 text-xs whitespace-pre-wrap text-gray-500">{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.34, 1.56, 0.64, 1],
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const initStore = useStore((s) => s.initStore);
  const isLoaded = useStore((s) => s.isLoaded);
  const appSettings = useStore((s) => s.appSettings);
  const [showTrumpetAlert, setShowTrumpetAlert] = useState(false);
  const konamiIndexRef = useRef(0);

  // If this window was spawned as the transparent Gaster crack overlay
  const searchParams = new URLSearchParams(window.location.search);
  const isCrackMode = searchParams.get('mode') === 'gaster_crack';

  useEffect(() => {
    if (window.electronAPI?.onGasterComplete) {
      window.electronAPI.onGasterComplete(() => {
        sessionStorage.setItem('limbus_gaster_apology_pending', 'true');
        navigate('/?incident=gaster_anomaly');
      });
      return () => {
        window.electronAPI.removeGasterComplete?.();
      };
    }
  }, [navigate]);

  if (isCrackMode) {
    return <GasterCrackScene />;
  }

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      const key = e.key.toLowerCase();
      const expected = KONAMI_SEQUENCE[konamiIndexRef.current];

      if (key === expected) {
        konamiIndexRef.current += 1;
        if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
          setShowTrumpetAlert(true);
          konamiIndexRef.current = 0;
        }
      } else {
        konamiIndexRef.current = key === 'arrowup' ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isLoaded) return null;

  return (
    <>
      <UpdateNotification />
      <OnboardingModal />
      <TutorialTour />
      <Season8NoticeModal />
      <SyncConflictModal />
      {showTrumpetAlert && <SecondTrumpetModal onClose={() => setShowTrumpetAlert(false)} />}
      <div 
        data-theme={appSettings?.activeTheme || 'gold'}
        data-compact={Boolean(appSettings?.compactMode)}
        className={`flex h-screen bg-[#0a0a0a] overflow-hidden ${appSettings?.compactMode ? 'compact-density' : ''}`}
      >
        <Sidebar />
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <main id="app-main-scroll" className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <MephistophelesBorderTrack />
            <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="min-h-full"
              >
                <Routes location={location}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/identities" element={<IdentitiesPage />} />
                  <Route path="/ego" element={<EgoPage />} />
                  <Route path="/want-list" element={<WantListPage />} />
                  <Route path="/changelog" element={<ChangelogPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      {appSettings?.crtScanlines && (
        <div className="fixed inset-0 crt-overlay pointer-events-none z-[9999]" />
      )}
    </>
  );
}
