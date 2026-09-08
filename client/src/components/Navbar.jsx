import { Shield, LogOut, Sun, Moon, UserCircle, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

export default function Navbar({ onCaseSelect, theme, toggleTheme, onLogout, currentUser, activeView, onViewChange }) {
  const { t, language, toggleLanguage } = useTranslation();
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-border shadow-sm transition-colors duration-300"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onCaseSelect(null)}
        >
          <img src="/logo.png" alt="NyayVault Logo" className="w-10 h-10 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Nyay<span className="text-blue-600 dark:text-blue-400">Vault</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
              Judicial Evidence Vault
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeView === 'dashboard' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {t('Dashboard')}
            </button>
            <button
              onClick={() => onViewChange('cases')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeView === 'cases' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {t('Cases')}
            </button>
            {currentUser.role === 'INVESTIGATING_OFFICER' && (
              <button
                onClick={() => onViewChange('radar')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeView === 'radar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
              >
                {t('Cross-Case Radar')}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={toggleLanguage} 
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700 font-medium text-sm"
            title="Toggle Language"
          >
            <Languages size={18} />
            {language === 'en' ? 'हि' : 'EN'}
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 pl-2 pr-4 py-1.5 rounded-full border border-border">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                <UserCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser.full_name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-transparent dark:border-red-900/30 ml-2"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
