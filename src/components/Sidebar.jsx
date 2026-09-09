import { useState } from 'react';
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
  GitBranch
} from 'lucide-react';

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

  return (
    <motion.aside
      className="flex flex-col h-full bg-limbus-surface border-r border-limbus-border relative"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-limbus-border">
        <motion.div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-limbus-accent to-limbus-accent-dim flex items-center justify-center text-black font-bold text-sm flex-shrink-0"
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-limbus-border">
        {!collapsed && (
          <p className="text-[10px] text-limbus-muted text-center">
            Limbus Company Companion
          </p>
        )}
      </div>
    </motion.aside>
  );
}
