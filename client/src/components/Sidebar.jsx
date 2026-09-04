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
  Fingerprint
} from 'lucide-react';

export default function Sidebar({ activeView, onViewChange, currentUser }) {
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

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 transition-colors">
      {/* Top Brand / Logo */}
      <div>
        <div className="p-5 pb-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <Fingerprint size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase leading-tight">
              Digital Evidence Vault
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
              Secure. Traceable. Trusted.
            </p>
          </div>
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
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-2xs font-bold border border-emerald-100 dark:border-emerald-900/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                <span>{item.label}</span>
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
          Towards Data-Driven Justice
        </p>
        <span className="text-[9px] text-slate-400 font-mono mt-0.5">SIH-26190 GovTech</span>
      </div>
    </aside>
  );
}
