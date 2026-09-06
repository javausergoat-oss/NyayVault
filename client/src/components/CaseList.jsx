import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Lock, 
  FolderOpen, 
  ArrowRight, 
  X, 
  Scale, 
  Gavel, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getCases, createCase } from '../services/api';
import { CaseCardSkeleton } from './ui/Skeleton';
import { useTranslation } from '../hooks/useTranslation';
import CaseAllocationModal from './CaseAllocationModal';

export const canCreateCase = (role) => {
  return ['INVESTIGATING_OFFICER', 'REGISTRAR', 'COURT_REGISTRAR', 'ADMIN'].includes(role);
};

export default function CaseList({ onCaseSelect, currentUser }) {
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [allocatingCase, setAllocatingCase] = useState(null);
  const [allocationFilter, setAllocationFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ALLOCATED'
  const [loading, setLoading] = useState(true);

  const isRegistrar = currentUser?.role === 'REGISTRAR';
  const isCaseCreator = canCreateCase(currentUser?.role);

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
    if (!isCaseCreator) {
      alert('Forbidden: Only Police Investigators and Court Registrars can open new case dockets.');
      return;
    }
    try {
      await createCase(newCase);
      setShowModal(false);
      setNewCase({ caseNumber: '', title: '', description: '', securityLevel: 'RESTRICTED' });
      loadCases();
    } catch (err) {
      alert('Failed to create case: ' + err.message);
    }
  };

  const unallocatedCount = cases.filter(c => !c.assignments || c.assignments.length === 0).length;
  const allocatedCount = cases.length - unallocatedCount;

  const filteredCases = cases.filter(c => {
    const isUnassigned = !c.assignments || c.assignments.length === 0;
    if (allocationFilter === 'PENDING') return isUnassigned;
    if (allocationFilter === 'ALLOCATED') return !isUnassigned;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('Active Investigation Vaults')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('Select an investigation file to access evidence, transcripts, and cryptographic audits.')}</p>
        </div>
        {isCaseCreator && (
          <button 
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer" 
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> {t('Open New Case File')}
          </button>
        )}
      </div>

      {/* Registrar Allocation Desk Banner & Filters */}
      {isRegistrar && cases.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold">{t('Court Registry Allocation Desk')}</h3>
              <p className="text-[11px] text-blue-200 mt-0.5">
                {unallocatedCount > 0 
                  ? t(`${unallocatedCount} new case(s) awaiting Judicial Bench and Counsel assignment.`)
                  : t('All police-filed cases have been allocated to judicial benches.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setAllocationFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                allocationFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('All Cases')} ({cases.length})
            </button>
            <button
              onClick={() => setAllocationFilter('PENDING')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                allocationFilter === 'PENDING' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-amber-300 hover:text-white'
              }`}
            >
              {t('Awaiting Allocation')} ({unallocatedCount})
            </button>
            <button
              onClick={() => setAllocationFilter('ALLOCATED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                allocationFilter === 'ALLOCATED' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-emerald-300 hover:text-white'
              }`}
            >
              {t('Allocated')} ({allocatedCount})
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CaseCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-16 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400">
          <Briefcase size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('No active cases found.')}</p>
          <p className="text-xs mt-1">
            {isCaseCreator 
              ? t('Open a new case file to start digitizing evidence.') 
              : t('Cases will appear here once officially allocated to your bench or counsel brief by the Registrar.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => {
            const isUnassigned = !c.assignments || c.assignments.length === 0;
            const judge = c.assignments?.find(a => a.assigned_role === 'BENCH_JUDGE');
            const prosecutor = c.assignments?.find(a => a.assigned_role === 'PROSECUTION_COUNSEL');
            const defense = c.assignments?.find(a => a.assigned_role === 'DEFENSE_COUNSEL');

            return (
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
                    <div className="flex items-center gap-1.5">
                      {isUnassigned ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {t('Awaiting Bench')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50 flex items-center gap-1">
                          <Scale size={10} />
                          {t('Bench Allocated')}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        c.security_level === 'TOP_SECRET' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {c.security_level === 'TOP_SECRET' && <Lock size={10} />}
                        {c.security_level}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {c.case_number}
                    </h3>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{c.title}</p>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description || t('No description provided.')}
                  </p>

                  {/* Assigned Bench info */}
                  {judge && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold truncate">
                        <Gavel size={12} className="shrink-0 text-indigo-500" />
                        <span className="truncate">{judge.full_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                        {prosecutor && <span className="truncate">State: {prosecutor.full_name.split(' ')[0]}</span>}
                        {defense && <span className="truncate">Def: {defense.full_name.split(' ')[0]}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                  {/* Registrar Quick Allocate Button */}
                  {isRegistrar && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAllocatingCase(c);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isUnassigned
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Scale size={13} />
                      <span>{isUnassigned ? t('Allocate Bench & Counsels') : t('Re-allocate Bench')}</span>
                    </button>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium text-[11px]">
                      {c.document_count || 0} {t('Evidence Artifacts')}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-xs group-hover:translate-x-1 transition-transform">
                      {t('Access Vault')} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Allocation Modal for Court Registrar */}
      {allocatingCase && (
        <CaseAllocationModal
          caseItem={allocatingCase}
          onClose={() => setAllocatingCase(null)}
          onSuccess={() => {
            setAllocatingCase(null);
            loadCases();
          }}
        />
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
