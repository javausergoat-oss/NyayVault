import { Shield, LogOut, Sun, Moon, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ onCaseSelect, theme, toggleTheme, onLogout, currentUser, activeView, onViewChange }) {
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
              SIH Vault
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
              Evidence System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser?.role === 'INVESTIGATING_OFFICER' && (
            <button
              onClick={() => onViewChange(activeView === 'radar' ? 'cases' : 'radar')}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors border ${activeView === 'radar' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent dark:border-slate-700'}`}
            >
              Cross-Case Radar
            </button>
          )}
          
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
