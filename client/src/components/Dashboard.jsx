import { useState, useEffect } from 'react';
import { Activity, Database, FileCheck2, Users, ShieldAlert, FileText, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
import { getCases } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

export default function Dashboard({ currentUser, onSelectCase }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    totalEvidence: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const cases = await getCases();
        const totalCases = cases.length;
        const activeCases = cases.filter(c => c.status !== 'CLOSED').length;
        const totalEvidence = cases.reduce((acc, c) => acc + (parseInt(c.document_count) || 0), 0);
        
        // Mock recent activity based on cases for demo purposes
        const recentActivity = cases.slice(0, 5).map(c => ({
          id: c.id,
          title: `New evidence uploaded in ${c.case_number}`,
          time: new Date(c.updated_at).toLocaleString('en-IN'),
          caseId: c.id
        }));

        setStats({ totalCases, activeCases, totalEvidence, recentActivity });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {currentUser?.full_name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's an overview of your active cases and system integrity.
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          <ShieldAlert size={16} />
          BSA Sec 63 Compliance Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Cases')}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCases}</h3>
          </div>
        </div>
        
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Database size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Total Evidence Logged')}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEvidence}</h3>
          </div>
        </div>

        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <FileCheck2 size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('Integrity Scans')}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEvidence * 3}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              Evidence by Category
            </h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4">
            {/* Simple CSS Bar Chart */}
            {[{label: 'Investigation', h: '80%', color: 'bg-blue-500'}, {label: 'Judicial', h: '30%', color: 'bg-amber-500'}, {label: 'Prosecution', h: '45%', color: 'bg-emerald-500'}, {label: 'Defense', h: '60%', color: 'bg-red-500'}].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-full h-full group">
                <div className={`w-full max-w-[60px] ${item.color} rounded-t-lg transition-all duration-500 group-hover:opacity-80`} style={{ height: item.h }}></div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 hidden md:block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              {t('Recent Activity')}
            </h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer" onClick={() => onSelectCase(activity.caseId)}>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
