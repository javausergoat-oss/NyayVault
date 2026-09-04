import { 
  LayoutDashboard, 
  Folder, 
  FileText, 
  Search, 
  BarChart3, 
  GitCommit, 
  ShieldCheck, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  Landmark 
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Sidebar({ activeView, onViewChange, currentUser }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'cases', label: t('Cases'), icon: Folder },
    { id: 'evidence', label: t('Evidence'), icon: FileText },
    { id: 'search', label: t('Search'), icon: Search },
    { id: 'analysis', label: t('Analysis'), icon: BarChart3 },
    { id: 'timeline', label: t('Timeline'), icon: GitCommit },
    { id: 'audit', label: t('Audit'), icon: ShieldCheck },
    { id: 'reports', label: t('Reports'), icon: FileSpreadsheet },
  ];

  const adminItems = [
    { id: 'users', label: t('Users'), icon: Users },
    { id: 'settings', label: t('Settings'), icon: Settings },
  ];

  return (
    <aside className="w-60 min-h-[calc(100vh-65px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 shrink-0 transition-colors duration-300">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#edf7f2] dark:bg-emerald-950/50 text-[#1b4d3e] dark:text-emerald-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#1b4d3e] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 pb-2">
            <div className="border-t border-slate-200 dark:border-slate-800" />
          </div>

          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#edf7f2] dark:bg-emerald-950/50 text-[#1b4d3e] dark:text-emerald-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#1b4d3e] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Watermark */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
        <Landmark size={32} className="stroke-[1.25] text-slate-300 dark:text-slate-700 mb-1" />
        <span className="text-[11px] font-medium leading-tight tracking-tight text-slate-400 dark:text-slate-500 max-w-[130px] text-center">
          Towards Data-Driven Justice
        </span>
        <span className="text-[10px] font-medium leading-tight text-slate-400 dark:text-slate-500 mt-2">
          भारत सरकार
        </span>
        <span className="text-[10px] font-medium leading-tight text-slate-400 dark:text-slate-500">
          Government of India
        </span>
      </div>
    </aside>
  );
}
