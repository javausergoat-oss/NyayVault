import { useState, useEffect } from 'react';
import { Briefcase, Plus, Lock, FolderOpen, ArrowRight, X } from 'lucide-react';
import { getCases, createCase } from '../services/api';
import { CaseCardSkeleton } from './ui/Skeleton';
import { useTranslation } from '../hooks/useTranslation';

export default function CaseList({ onCaseSelect }) {
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newCase, setNewCase] = useState({
    caseNumber: '',
    title: '',
    description: '',
    securityLevel: 'RESTRICTED'
  });

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await getCases();
      setCases(res.cases || []);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCase(newCase);
      setShowModal(false);
      setNewCase({ caseNumber: '', title: '', description: '', securityLevel: 'RESTRICTED' });
      loadCases();
    } catch (err) {
      alert('Failed to create case: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('Active Investigation Vaults')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('Select an investigation file to access evidence, transcripts, and cryptographic audits.')}</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> {t('Open New Case File')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CaseCardSkeleton key={i} />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-16 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400">
          <Briefcase size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('No active cases found.')}</p>
          <p className="text-xs mt-1">{t('Open a new case file to start digitizing evidence.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => (
            <div 
              key={c.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 p-5 rounded-2xl cursor-pointer transition-all shadow-xs flex flex-col justify-between space-y-4 group"
              onClick={() => onCaseSelect(c.id)}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FolderOpen size={20} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    c.security_level === 'TOP_SECRET' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {c.security_level === 'TOP_SECRET' && <Lock size={10} />}
                    {c.security_level}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {c.case_number}
                  </h3>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{c.title}</p>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium text-[11px]">
                  {c.document_count || 0} {t('Evidence Artifacts')}
                </span>
                <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-xs group-hover:translate-x-1 transition-transform">
                  {t('Access Vault')} <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('Open New Case File')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('Case Number')}</label>
                <input 
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={newCase.caseNumber}
                  onChange={e => setNewCase({...newCase, caseNumber: e.target.value})}
                  placeholder="e.g. FIR-2026-DL-0046"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('Title')}</label>
                <input 
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={newCase.title}
                  onChange={e => setNewCase({...newCase, title: e.target.value})}
                  placeholder="Short descriptive case title"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{t('Description')}</label>
                <textarea 
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={newCase.description}
                  onChange={e => setNewCase({...newCase, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Security Classification</label>
                <select 
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={newCase.securityLevel}
                  onChange={e => setNewCase({...newCase, securityLevel: e.target.value})}
                >
                  <option value="RESTRICTED">Restricted</option>
                  <option value="CONFIDENTIAL">Confidential</option>
                  <option value="TOP_SECRET">Top Secret</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer" onClick={() => setShowModal(false)}>{t('Cancel')}</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer">{t('Open New Case File')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
