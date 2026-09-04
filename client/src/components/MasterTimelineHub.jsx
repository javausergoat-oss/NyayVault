import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FolderKanban, 
  Shield, 
  Search, 
  Filter, 
  Calendar, 
  FileText,
  User
} from 'lucide-react';
import { getCases, getCaseDocuments } from '../services/api';
import CaseTimeline from './CaseTimeline';

export default function MasterTimelineHub({ onCaseSelect }) {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await getCases();
        const loaded = res.cases || [];
        setCases(loaded);
        if (loaded.length > 0) {
          setSelectedCaseId(loaded[0].id);
        }
      } catch (err) {
        console.error('Failed to load cases in timeline', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;
    const fetchDocs = async () => {
      try {
        const res = await getCaseDocuments(selectedCaseId);
        setDocuments(res.documents || []);
      } catch (err) {
        console.error('Failed to load documents for timeline', err);
      }
    };
    fetchDocs();
  }, [selectedCaseId]);

  const activeCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Clock size={16} />
            <span>Chronological Forensics • Evidentiary Trail</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Forensic Case Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track chronological journey of evidence ingestion, judicial filings, forensic reports, and court milestones.
          </p>
        </div>

        {cases.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.case_number} — {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Case Quick Status Bar */}
      {activeCase && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
              <FolderKanban size={18} />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{activeCase.title}</div>
              <div className="text-[11px] text-slate-400 font-mono">{activeCase.case_number}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <div>
              Stage: <strong className="text-emerald-600">{activeCase.status || 'INVESTIGATION'}</strong>
            </div>
            <div>
              Security: <strong className="text-slate-700 dark:text-slate-300">{activeCase.security_level}</strong>
            </div>
            <div>
              Events: <strong className="text-slate-700 dark:text-slate-300">{documents.length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Component */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <CaseTimeline documents={documents} />
      </div>
    </div>
  );
}
