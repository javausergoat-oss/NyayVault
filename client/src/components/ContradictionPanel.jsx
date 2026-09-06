import { useState } from 'react';
import { findContradictions } from '../services/api';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContradictionPanel({ caseId }) {
  const [contradictions, setContradictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await findContradictions(caseId);
      setContradictions(res.contradictions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
              Contradiction & Discrepancy Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cross-references witness statements, timestamps, and evidence records for factual conflicts.
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
            {contradictions === null ? 'Analyze Discrepancies' : 'Re-Analyze'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs rounded-xl border border-rose-200 dark:border-rose-900/30 font-semibold">
            {error}
          </div>
        )}

        <AnimatePresence>
          {contradictions !== null && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              {contradictions.length === 0 ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-center border border-emerald-200 dark:border-emerald-900/30 text-xs">
                  <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-600" />
                  <h4 className="font-bold text-sm">No Document Contradictions Detected</h4>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400">All cross-referenced timestamps, statements, and evidence facts are consistent.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contradictions.map((c, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs space-y-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                        <div>
                          <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs">
                            {c.description}
                          </h4>
                          <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-amber-800 dark:text-amber-400">
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 font-bold">{c.doc1}</span>
                            <span>vs</span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 font-bold">{c.doc2}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
