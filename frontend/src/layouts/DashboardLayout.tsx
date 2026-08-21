import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Briefcase,
  Users,
  Star,
  Columns,
  Search,
  Menu,
  X,
  Plus,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../components/common/BrandLogo';
import { AmbientBackground } from '../components/common/AmbientBackground';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/candidates?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Analytics', path: '/analytics', icon: BarChart2 },
    { label: 'Screen Resumes', path: '/screen', icon: FileCheck2 },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Shortlisted', path: '/shortlisted', icon: Star },
    { label: 'Compare Matrix', path: '/compare', icon: Columns },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 flex text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Background Animated Beams */}
      <AmbientBackground />

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-midnight-900 border-r border-midnight-700/80 sticky top-0 h-screen z-30 shadow-2xl shadow-midnight-950/50">
        {/* Brand Header */}
        <div className="p-5 border-b border-midnight-700/80 cursor-pointer hover:bg-midnight-800/30 transition-colors" onClick={() => navigate('/')}>
          <BrandLogo size="md" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 pb-2 pt-1 font-mono">
            AI RECRUITER PLATFORM
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-cyan-300 bg-midnight-800 border border-midnight-700 shadow-glow-cyan/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-850'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavLine"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-r"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-midnight-700/80 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>v1.0 Pro Edition</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-sans font-semibold">
            Online
          </span>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight-950/80 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="w-72 bg-midnight-900 border-r border-midnight-700 h-full p-5 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <BrandLogo size="sm" />
                  <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive ? 'bg-midnight-800 text-cyan-300 border border-midnight-700' : 'text-slate-400 hover:bg-midnight-850'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-midnight-950/80 backdrop-blur-md border-b border-midnight-700/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72 lg:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates by name, credential, or skill..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-midnight-900 border border-midnight-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all font-sans"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/screen')}
              className="btn-gradient text-xs px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Screen Resumes</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan">
              <div className="w-full h-full bg-midnight-950 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                HR
              </div>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
