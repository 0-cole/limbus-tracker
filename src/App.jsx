import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import IdentitiesPage from './pages/IdentitiesPage';
import EgoPage from './pages/EgoPage';
import WantListPage from './pages/WantListPage';
import InventoryPage from './pages/InventoryPage';
import SchedulePage from './pages/SchedulePage';
import ChangelogPage from './pages/ChangelogPage';
import OnboardingModal from './components/OnboardingModal';
import TutorialTour from './components/TutorialTour';
import UpdateNotification from './components/UpdateNotification';
import MephistophelesBorderTrack from './components/MephistophelesBorderTrack';
import { useStore } from './stores/useStore';

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
  const initStore = useStore((s) => s.initStore);
  const isLoaded = useStore((s) => s.isLoaded);

  useEffect(() => {
    initStore();
  }, [initStore]);

  if (!isLoaded) return null;

  return (
    <>
      <UpdateNotification />
      <OnboardingModal />
      <TutorialTour />
      <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <MephistophelesBorderTrack />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
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
                </Routes>
              </motion.div>
            </AnimatePresence>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
}
