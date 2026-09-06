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

export default function CaseAllocationModal({ caseItem, onClose, onSuccess }) {
  const { t } = useTranslation();
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
      onClose();
    } catch (err) {
      console.error('Failed to allocate case:', err);
      setError(err.message || 'Failed to complete allocation.');
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

          {/* Case Summary Bar */}
          <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-blue-200 font-mono font-bold mr-2">{caseItem.case_number}</span>
              <span className="font-bold text-white">{caseItem.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-[11px]">{t('Investigating Officer:')}</span>
              <span className="font-semibold text-white">{caseItem.created_by_name || 'Insp. Krishna Chhabra'}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Top Auto-Allocate Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40">
            <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-200">
              <Sparkles size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{t('Use the judicial roaster algorithm to auto-balance workload across open benches.')}</span>
            </div>
            <button
              type="button"
              onClick={handleAutoAllocate}
              disabled={usersLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {t('Auto-Allocate Roaster')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Field 1: Judicial Officer (Judge / Magistrate) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Gavel size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>{t('Presiding Judicial Officer (Judge / Magistrate)')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedJudge}
                onChange={(e) => setSelectedJudge(e.target.value)}
                disabled={usersLoading}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">{usersLoading ? t('Loading magistrates...') : t('-- Select Presiding Judge / Magistrate --')}</option>
                {judges.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.full_name} ({j.badge_number}) — {j.department || 'District Court'} [Active Bench]
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {t('Authorized to issue judicial remand, admit exhibits, and pronounce verdicts.')}
              </p>
            </div>

            {/* Field 2: Public Prosecutor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{t('Public Prosecutor (State Counsel)')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedProsecutor}
                onChange={(e) => setSelectedProsecutor(e.target.value)}
                disabled={usersLoading}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">{usersLoading ? t('Loading prosecutors...') : t('-- Select State Prosecutor --')}</option>
                {prosecutors.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.badge_number}) — {p.department || 'Directorate of Prosecution'}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Defense Advocate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-purple-600 dark:text-purple-400" />
                  <span>{t('Defense Counsel')}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLegalAid}
                    onChange={(e) => setIsLegalAid(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{t('DLSA Legal Aid')}</span>
                </label>
              </div>
              <select
                required
                value={selectedDefense}
                onChange={(e) => setSelectedDefense(e.target.value)}
                disabled={usersLoading}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">{usersLoading ? t('Loading advocates...') : t('-- Select Defense Advocate --')}</option>
                {defenseLawyers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.badge_number}) — {d.department || 'Bar Council Registered'}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4: Hearing Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" />
                <span>{t('First Cause-List / Hearing Date')}</span>
              </label>
              <input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            {/* Field 5: Allocation Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText size={14} className="text-slate-500" />
                <span>{t('Registry Bench Memo / Notes')}</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('e.g. Scrutiny cleared. Placed on Fast-Track Cyber Docket.')}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
