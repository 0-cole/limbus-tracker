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
  Loader2,
  Settings,
  Swords
} from 'lucide-react';
import AuthModal from './AuthModal';
import { syncEngine } from '../services/syncEngine';
import ManagerAvatar from './ManagerAvatar';
import { useStore } from '../stores/useStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview' },
  { path: '/deckbuilder', icon: Swords, label: 'Deck Builder', description: 'Squad & Synergies' },
  { path: '/schedule', icon: Calendar, label: 'Schedule', description: 'Mirror Dungeon' },
  { path: '/inventory', icon: Battery, label: 'Inventory', description: 'Economy & Shards' },
  { path: '/want-list', icon: Heart, label: 'Wishlist', description: 'Targeted Goals' },
  { path: '/identities', icon: Users, label: 'Identities', description: 'ID Database' },
  { path: '/ego', icon: Sparkles, label: 'E.G.O', description: 'EGO Database' },
  { path: '/changelog', icon: GitBranch, label: 'Changelog', description: 'Version History' },
  { path: '/settings', icon: Settings, label: 'Settings', description: 'Preferences & System' },
];

export default function Sidebar() {
  const managerProfile = useStore((s) => s.managerProfile);
  const [collapsed, setCollapsed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [easterEgg, setEasterEgg] = useState(null);
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
    let next = 1;
    if (now - lastClickTime <= 2500) {
      next = clickCount + 1;
    }
    setClickCount(next);
    setLastClickTime(now);

    if (next === 5) {
      setEasterEgg({
        icon: '🎠',
        title: 'Don Quixote Intervention',
        msg: '"HALT, EVILDOER! JUSTICE SHALL PREVAIL! ROCHINANTE, CHARGE!!!"',
        bg: 'from-amber-600 via-yellow-500 to-amber-600',
        border: 'border-yellow-300',
        shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.8)]',
        textColor: 'text-black',
        subColor: 'text-amber-950',
      });
      setTimeout(() => setEasterEgg(null), 4500);
    } else if (next === 9) {
      setEasterEgg({
        icon: '🚌',
        title: 'Mephistopheles Passenger Log',
        msg: '"Vroom vroom. Engine purrs happily. Charon wants star candies. Dante drive? No. Dante is bad driver. Charon drives."',
        bg: 'from-cyan-900 via-cyan-600 to-cyan-900',
        border: 'border-cyan-300',
        shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.8)]',
        textColor: 'text-white',
        subColor: 'text-cyan-200',
      });
      setTimeout(() => setEasterEgg(null), 5000);
    } else if (next === 13) {
      setEasterEgg({
        icon: '🔴',
        title: 'Senior Guide Vergilius',
        msg: '"Dante... Why are you repeatedly hammering on the console? If you break the dashboard, the repair bill comes directly out of your paycheck."',
        bg: 'from-red-950 via-red-700 to-red-950',
        border: 'border-red-500',
        shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.8)]',
        textColor: 'text-white',
        subColor: 'text-red-300',
      });
      setTimeout(() => setEasterEgg(null), 5000);
    } else if (next === 17) {
      setEasterEgg({
        icon: '🥪',
        title: 'The Black Silence — Roland',
        msg: '"That\'s that, and this is this. ...Say clockhead, all that frantic clicking is making me hungry. Know any good sandwich spots in this District?"',
        bg: 'from-slate-900 via-slate-700 to-slate-900',
        border: 'border-slate-400',
        shadow: 'shadow-[0_0_30px_rgba(148,163,184,0.8)]',
        textColor: 'text-white',
        subColor: 'text-slate-300',
      });
      setTimeout(() => setEasterEgg(null), 5000);
    } else if (next >= 21) {
      setEasterEgg({
        icon: '📖',
        title: 'Head Librarian — Angela',
        msg: '"Welcome to the Library of Ruina, Manager Dante. May you find your book in this place. Please do not disturb the patrons."',
        bg: 'from-teal-950 via-cyan-800 to-teal-950',
        border: 'border-cyan-400',
        shadow: 'shadow-[0_0_30px_rgba(45,212,191,0.8)]',
        textColor: 'text-white',
        subColor: 'text-cyan-200',
      });
      setClickCount(0);
      setTimeout(() => setEasterEgg(null), 5000);
    }
  };

  return (
    <motion.aside
      className="flex flex-col h-full bg-limbus-surface border-r border-limbus-border relative"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Easter Egg Floating Banner */}
      {easterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r ${easterEgg.bg} ${easterEgg.textColor} font-black px-6 py-3 rounded-xl border-2 ${easterEgg.border} ${easterEgg.shadow} flex items-center gap-3 max-w-lg`}
        >
          <span className="text-2xl animate-bounce flex-shrink-0">{easterEgg.icon}</span>
          <div>
            <div className={`text-[10px] uppercase tracking-widest ${easterEgg.subColor} font-mono`}>{easterEgg.title}</div>
            <div className="text-xs md:text-sm font-limbus leading-snug">{easterEgg.msg}</div>
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
          className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold text-sm flex-shrink-0 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--theme-primary, #c9a84c), var(--theme-accent, #8a7030))',
            boxShadow: '0 0 12px var(--theme-glow, rgba(201,168,76,0.5))',
          }}
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

      {/* Manager Profile Footer Card */}
      <div className="px-2 py-2 border-t border-limbus-border/40">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 p-2 rounded-xl transition-all border ${
              isActive
                ? 'bg-neutral-900 border-[#c9a84c]/50 shadow-[0_0_12px_rgba(201,168,76,0.15)]'
                : 'border-transparent hover:border-[#c9a84c]/30 hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`
          }
          title={`Executive Manager: ${managerProfile?.callSign || 'Dante'} (Click to open Settings)`}
        >
          <ManagerAvatar size="sm" showBorder={true} />
          {!collapsed && (
            <div className="flex flex-col text-left overflow-hidden min-w-0">
              <span className="text-xs font-bold text-white truncate font-limbus">
                {managerProfile?.callSign || 'Dante'}
              </span>
              <span className="text-[10px] text-[#c9a84c] truncate font-mono">
                Executive Manager
              </span>
            </div>
          )}
        </NavLink>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </motion.aside>
  );
}
