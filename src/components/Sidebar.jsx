import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Sparkles,
  LayoutDashboard,
  Heart,
  ChevronLeft,
  ChevronRight,
  Battery,
  Calendar,
  GitBranch,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import AuthModal from './AuthModal';
import { syncEngine } from '../services/syncEngine';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview' },
  { path: '/schedule', icon: Calendar, label: 'Schedule', description: 'Mirror Dungeon' },
  { path: '/inventory', icon: Battery, label: 'Inventory', description: 'Economy & Shards' },
  { path: '/want-list', icon: Heart, label: 'Wishlist', description: 'Targeted Goals' },
  { path: '/identities', icon: Users, label: 'Identities', description: 'ID Database' },
  { path: '/ego', icon: Sparkles, label: 'E.G.O', description: 'EGO Database' },
  { path: '/changelog', icon: GitBranch, label: 'Changelog', description: 'Version History' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showDonBanner, setShowDonBanner] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState(syncEngine.getSyncStatus());

  useEffect(() => {
    syncEngine.getUser().then(setCurrentUser);
    const { data: { subscription } } = syncEngine.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });
    const unsubSync = syncEngine.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });
    return () => {
      subscription?.unsubscribe();
      unsubSync();
    };
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 2500) {
      setClickCount(1);
    } else {
      const next = clickCount + 1;
      setClickCount(next);
      if (next >= 5) {
        setShowDonBanner(true);
        setClickCount(0);
        setTimeout(() => setShowDonBanner(false), 4500);
      }
    }
    setLastClickTime(now);
  };

  return (
    <motion.aside
      className="flex flex-col h-full bg-limbus-surface border-r border-limbus-border relative"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Don Quixote Easter Egg Floating Banner */}
      {showDonBanner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-black px-6 py-3 rounded-xl border-2 border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.8)] flex items-center gap-3"
        >
          <span className="text-2xl animate-bounce">🎠</span>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-950 font-mono">Don Quixote Intervention</div>
            <div className="text-sm font-limbus">"HALT, EVILDOER! JUSTICE SHALL PREVAIL! ROCHINANTE, CHARGE!!!"</div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div 
        onClick={handleLogoClick}
        className="flex items-center gap-3 px-4 py-5 border-b border-limbus-border cursor-pointer select-none group"
        title="Limbus Tracker"
      >
        <motion.div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-limbus-accent to-limbus-accent-dim flex items-center justify-center text-black font-bold text-sm flex-shrink-0 group-hover:shadow-[0_0_12px_rgba(201,168,76,0.6)]"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          LT
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h1 className="font-limbus text-lg text-limbus-accent leading-tight">
              Limbus
            </h1>
            <p className="text-[10px] text-limbus-muted -mt-0.5">Tracker</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0"
                >
                  <item.icon
                    size={20}
                    className={isActive ? 'text-limbus-accent' : ''}
                  />
                </motion.div>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-limbus-muted -mt-0.5">
                      {item.description}
                    </span>
                  </motion.div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <motion.button
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                   bg-limbus-card border border-limbus-border flex items-center justify-center
                   text-limbus-muted hover:text-limbus-accent hover:border-limbus-accent/30
                   transition-colors z-10"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>

      {/* Cloud Sync Status / Button */}
      <div className="px-2 py-2 border-t border-limbus-border/60">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAuthModalOpen(true)}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all border ${
            currentUser
              ? syncStatus.status === 'error'
                ? 'bg-red-950/25 border-red-500/40 hover:border-red-500/60 text-red-400'
                : syncStatus.status === 'syncing'
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400'
              : 'bg-neutral-900/60 border-neutral-800 hover:border-[#c9a84c]/40 text-neutral-300 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
          title={currentUser ? (syncStatus.status === 'error' ? `Auto-Sync Failed: ${syncStatus.error || 'Network error'}` : `Synced as ${currentUser.email}`) : 'Log in to sync across devices'}
        >
          <div className="relative flex-shrink-0">
            {currentUser ? (
              syncStatus.status === 'error' ? (
                <AlertTriangle size={18} className="text-red-400" />
              ) : syncStatus.status === 'syncing' ? (
                <Loader2 size={18} className="text-amber-300 animate-spin" />
              ) : (
                <Cloud size={18} className="text-emerald-400" />
              )
            ) : (
              <Cloud size={18} className="text-[#c9a84c]" />
            )}
            {currentUser && syncStatus.status !== 'error' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-neutral-900" />
            )}
            {currentUser && syncStatus.status === 'error' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-neutral-900 animate-ping" />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left overflow-hidden">
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <span>
                  {currentUser
                    ? syncStatus.status === 'error'
                      ? 'Auto-Sync Failed'
                      : syncStatus.status === 'syncing'
                      ? 'Syncing...'
                      : 'Cloud Synced'
                    : 'Sync Devices'}
                </span>
                {currentUser && syncStatus.status === 'synced' && <CheckCircle2 size={12} className="text-emerald-400" />}
                {currentUser && syncStatus.status === 'error' && <AlertTriangle size={12} className="text-red-400" />}
              </div>
              <span className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                {currentUser
                  ? syncStatus.status === 'error'
                    ? 'Click to retry'
                    : currentUser.email
                  : 'Log in / Register'}
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-limbus-border/40">
        {!collapsed && (
          <p className="text-[10px] text-limbus-muted text-center">
            Limbus Company Companion
          </p>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </motion.aside>
  );
}
