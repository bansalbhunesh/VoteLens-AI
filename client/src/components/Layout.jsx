/**
 * Layout — App shell with navigation.
 */

import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '../utils/constants';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col gradient-mesh">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav
        className="glass-strong sticky top-0 z-40 border-b border-white/5"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-3 group"
              aria-label="VoteLens AI Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                🗳️
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-primary-400">Vote</span>
                <span className="text-accent-400">Lens</span>
                <span className="text-surface-300 font-normal ml-1">AI</span>
              </span>
            </NavLink>

            {/* Nav Links */}
            <div className="flex items-center gap-1" role="menubar">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/10'
                        : 'text-surface-200 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <span className="text-base" aria-hidden="true">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-1" role="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} VoteLens AI
          </p>
          <p className="text-xs text-surface-600">
            Educational use only · Non-partisan · Powered by Gemini 2.5 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
