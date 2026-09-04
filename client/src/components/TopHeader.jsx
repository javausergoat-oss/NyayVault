import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Sun, 
  Moon, 
  Languages, 
  LogOut, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function TopHeader({ currentUser, theme, toggleTheme, onLogout, onSearchClick }) {
  const { language, toggleLanguage } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = currentUser?.full_name 
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AK';

  const roleLabel = currentUser?.role === 'INVESTIGATING_OFFICER' 
    ? 'Investigator' 
    : currentUser?.role === 'JUDICIAL_OFFICER' 
    ? 'Magistrate' 
    : currentUser?.role?.replace(/_/g, ' ') || 'Investigator';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Search Bar matching mockup */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            onClick={onSearchClick}
            placeholder="Search evidence, cases, people, or ask a question..."
            className="w-full pl-10 pr-12 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {/* Language Switch */}
        <button 
          onClick={toggleLanguage} 
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold"
          title="Toggle Language"
        >
          {language === 'en' ? 'हिन्दी' : 'English'}
        </button>

        {/* Theme Switch */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/30">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {currentUser?.full_name || 'Aditya Kochar'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {roleLabel}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.full_name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: {currentUser?.badge_number || 'POL-1'}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 mt-1"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
