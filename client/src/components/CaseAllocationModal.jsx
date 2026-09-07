import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scale, 
  Gavel, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Users,
  Briefcase
} from 'lucide-react';
import { getUsers, assignCase } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../context/ToastContext';
import ShimmerButton from './ui/ShimmerButton';

export default function CaseAllocationModal({ caseItem, onClose, onSuccess }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Form states
  const [selectedJudge, setSelectedJudge] = useState('');
  const [selectedProsecutor, setSelectedProsecutor] = useState('');
  const [selectedDefense, setSelectedDefense] = useState('');
  const [isLegalAid, setIsLegalAid] = useState(false);
  const [hearingDate, setHearingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Populate existing assignments if present
  useEffect(() => {
    if (caseItem?.assignments && Array.isArray(caseItem.assignments)) {
      const judge = caseItem.assignments.find(a => a.assigned_role === 'BENCH_JUDGE');
      const prosecutor = caseItem.assignments.find(a => a.assigned_role === 'PROSECUTION_COUNSEL');
      const defense = caseItem.assignments.find(a => a.assigned_role === 'DEFENSE_COUNSEL');
      if (judge) setSelectedJudge(judge.user_id);
      if (prosecutor) setSelectedProsecutor(prosecutor.user_id);
      if (defense) setSelectedDefense(defense.user_id);
    }
  }, [caseItem]);

  // Load all personnel
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const res = await getUsers();
        setUsers(res.users || []);
      } catch (err) {
        console.error('Failed to load users for allocation:', err);
        setError('Failed to load court directory. Please check network.');
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, []);

  const judges = users.filter(u => u.role === 'JUDICIAL_OFFICER');
  const prosecutors = users.filter(u => u.role === 'LAWYER_PROSECUTION');
  const defenseLawyers = users.filter(u => u.role === 'LAWYER_DEFENSE');

  // 1-Click Smart Roaster Auto-Allocate
  const handleAutoAllocate = () => {
    if (judges.length > 0) setSelectedJudge(judges[0].id);
    if (prosecutors.length > 0) setSelectedProsecutor(prosecutors[0].id);
    if (defenseLawyers.length > 0) setSelectedDefense(defenseLawyers[0].id);
    setNotes('Allocated via Automated Court Roaster System. Listed for scrutiny and bail/remand verification.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedJudge) {
      setError('Please assign a Presiding Judicial Officer / Magistrate.');
      return;
    }
    if (!selectedProsecutor) {
      setError('Please assign a Public Prosecutor.');
      return;
    }
    if (!selectedDefense) {
      setError('Please assign a Defense Advocate (or DLSA Legal Aid).');
      return;
    }

    try {
      setLoading(true);
      const res = await assignCase(caseItem.id, {
        judgeId: selectedJudge,
        prosecutorId: selectedProsecutor,
        defenseId: selectedDefense,
        hearingDate,
        notes: isLegalAid ? `[DLSA Legal Aid Appointed] ${notes}` : notes
      });

      if (onSuccess) {
        onSuccess(res.case || caseItem);
      }
      toast.success(`Bench & counsels assigned to ${caseItem.case_number || 'case'}`, 'Allocation Confirmed');
      onClose();
    } catch (err) {
      console.error('Failed to allocate case:', err);
      const errMsg = err.message || 'Failed to complete allocation.';
      setError(errMsg);
      toast.error(errMsg, 'Allocation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header Banner */}
        <div className="bg-[#0e1d3e] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Scale size={22} />
              </div>
              <div>
                <span className="text-[11px] font-mono tracking-widest text-blue-300 uppercase font-bold">
                  {t('Court Registry Allocation Desk')}
                </span>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>{t('Docket & Bench Allocation')}</span>
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Allocation Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Case Info Strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-slate-400" />
              <span className="font-mono font-bold text-slate-900 dark:text-white">{caseItem?.case_number}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-xs">{caseItem?.title}</span>
            </div>
            <button
              type="button"
              onClick={handleAutoAllocate}
              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles size={12} />
              <span>{t('Auto-Fill Roster')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Presiding Judge */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Gavel size={14} className="text-blue-600 dark:text-blue-400" />
                <span>{t('Presiding Judicial Officer / Magistrate')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedJudge}
                onChange={(e) => setSelectedJudge(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
              >
                <option value="">-- {t('Select Presiding Judge')} --</option>
                {judges.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.full_name} ({j.badge_number}) • {j.email}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Public Prosecutor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('Public Prosecutor / State Counsel')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProsecutor}
                onChange={(e) => setSelectedProsecutor(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
              >
                <option value="">-- {t('Select Prosecution Counsel')} --</option>
                {prosecutors.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.badge_number})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Defense Counsel */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck size={14} className="text-purple-600 dark:text-purple-400" />
                <span>{t('Defense Counsel / Legal Aid')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDefense}
                onChange={(e) => setSelectedDefense(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
              >
                <option value="">-- {t('Select Defense Counsel')} --</option>
                {defenseLawyers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.badge_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DLSA Legal Aid Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="legalAidCheck"
              checked={isLegalAid}
              onChange={(e) => setIsLegalAid(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="legalAidCheck" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              {t('Assign under Legal Services Authority (DLSA) Free Legal Aid Scheme')}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hearing Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                <span>{t('First Cause List / Hearing Date')}</span>
              </label>
              <input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
              />
            </div>

            {/* Allocation Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase size={14} className="text-blue-600 dark:text-blue-400" />
                <span>{t('Registry Directive / Notes')}</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Scrutiny of FIR and Bail Application"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{t('Cryptographic SHA-256 seal will be added to the registry audit ledger.')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="text-xs font-bold"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('Allocating...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>{t('Confirm & Seal Allocation')}</span>
                  </>
                )}
              </ShimmerButton>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
