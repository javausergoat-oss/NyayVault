import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Search, 
  Radar, 
  Clock, 
  ShieldCheck, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  Landmark,
  Scale,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

export default function Sidebar({ activeView, onViewChange, currentUser, mobileOpen, onCloseMobile }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: FolderKanban },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'radar', label: 'Analysis', icon: Radar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'audit', label: 'Audit', icon: ShieldCheck },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    onViewChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col justify-between h-full w-full">
      {/* Top Brand / Logo */}
      <div>
        <div className="p-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0e1d3e] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-950/20">
              <Scale size={20} className="stroke-[1.9]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Nyay<span className="text-blue-600">Vault</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {t('Secure Evidence Portal')}
              </p>
            </div>
          </div>
          {isMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close navigation"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'cases' && activeView === 'case');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-2xs font-bold border border-blue-100 dark:border-blue-900/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                <span>{t(item.label)}</span>
              </button>
            );
          })}
        </nav>
      </div>


      {/* Bottom Legal Watermark */}
      <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
          <Landmark size={20} className="stroke-[1.6]" />
        </div>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
          {t('Towards Data-Driven Justice')}
        </p>
        <span className="text-[9px] text-slate-400 font-mono mt-0.5">SIH-26190 GovTech</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= lg) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 transition-colors">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay (< lg) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full z-10 shadow-2xl flex flex-col overflow-y-auto"
            >
              <SidebarContent isMobile={true} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
