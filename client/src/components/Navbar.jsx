import { useState } from 'react';
import { Fingerprint, Search, Bell, ChevronDown, Sun, Moon, LogOut, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

export default function Navbar({ onCaseSelect, theme, toggleTheme, onLogout, currentUser, onViewChange, searchQuery, setSearchQuery }) {
  const { language, toggleLanguage } = useTranslation();
  const [internalSearch, setInternalSearch] = useState('');

  const getUserInitials = (name) => {
    if (!name) return 'AK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery(internalSearch);
    }
    if (onViewChange) {
      onViewChange('search');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300 px-6 py-2.5"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => onViewChange && onViewChange('dashboard')}
        >
          <div className="w-10 h-10 rounded-full bg-[#edf7f2] dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shadow-sm group-hover:scale-105 transition-transform">
            <Fingerprint className="text-[#1b4d3e] dark:text-emerald-400" size={22} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider uppercase leading-none">
              NYAY VAULT
            </h1>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight mt-0.5">
              Digital Evidence Vault
            </p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
              Secure. Traceable. Trusted.
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input 
              type="text"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder="Search evidence, cases, people, or ask a question..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2 border border-transparent focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </form>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <button 
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
            title="Toggle Language"
          >
            <Languages size={15} />
            {language === 'en' ? 'हि' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              {getUserInitials(currentUser?.full_name)}
            </div>
            <div className="hidden sm:flex flex-col text-left cursor-pointer">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {currentUser?.full_name || 'Aditya Kochar'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize leading-tight flex items-center gap-0.5">
                {currentUser?.role ? currentUser.role.replace('_', ' ').toLowerCase() : 'Investigator'}
                <ChevronDown size={12} className="text-slate-400" />
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
