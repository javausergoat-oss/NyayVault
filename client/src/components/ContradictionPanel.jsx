import { useState } from 'react';
import { findContradictions } from '../services/api';
import { AlertTriangle, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';
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
      <div className="card p-6 border border-border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-500" />
              AI Contradiction Analysis
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cross-references all case documents to identify logical, factual, or temporal discrepancies.
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="btn-primary py-2 px-6 rounded-xl font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <AlertTriangle size={18} />}
            {contradictions === null ? 'Run Analysis' : 'Re-Run Analysis'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <AnimatePresence>
          {contradictions !== null && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              {contradictions.length === 0 ? (
                <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-center border border-emerald-200 dark:border-emerald-800/50">
                  <ShieldCheck size={32} className="mx-auto mb-3" />
                  <h4 className="font-bold text-lg">No Contradictions Found</h4>
                  <p className="text-sm mt-1">The AI verified all documents and found no conflicting information.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contradictions.map((c, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-bold text-red-900 dark:text-red-300">
                            {c.description}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-sm text-red-700 dark:text-red-400">
                            <span className="font-semibold bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                              {c.doc1}
                            </span>
                            <span className="hidden sm:inline">vs</span>
                            <span className="font-semibold bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                              {c.doc2}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
