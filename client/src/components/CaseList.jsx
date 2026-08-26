import { useState, useEffect } from 'react';
import { Briefcase, Plus, Lock, FolderOpen, ArrowRight } from 'lucide-react';
import { getCases, createCase } from '../services/api';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function CaseList({ onCaseSelect }) {
  const [cases, setCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
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
      alert('Failed to load cases: ' + err.message);
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
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Active Investigations</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Select a case file to manage intelligence, evidence, and audits.</p>
        </div>
        <button 
          className="btn-primary shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center gap-2 px-6 py-3 rounded-full font-bold" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Open New Case
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : cases.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-16 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 border-dashed border-2"
        >
          <Briefcase size={64} className="mb-4 opacity-50" />
          <p className="text-xl font-medium text-slate-700 dark:text-slate-300">No active cases found.</p>
          <p className="mt-2">Open a new case to begin digitizing evidence.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 hover:-translate-y-1"
              onClick={() => onCaseSelect(c.id)}
            >
              {/* Animated Hover Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FolderOpen size={24} />
                </div>
                <span className={cn(
                  "badge text-xs flex items-center gap-1",
                  c.security_level === 'TOP_SECRET' ? 'badge-red' : 'badge-gray'
                )}>
                  {c.security_level === 'TOP_SECRET' && <Lock size={10} />}
                  {c.security_level}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 relative z-10 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.case_number}</h3>
              <p className="text-sm font-semibold mb-3 relative z-10 text-slate-700 dark:text-slate-300">{c.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 relative z-10">{c.description}</p>
              
              <div className="mt-6 flex justify-between items-center relative z-10 border-t border-border pt-4">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {c.document_count} Evidence Files
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Open Vault <ArrowRight size={16} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Open New Case</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Case/FIR Number</label>
                <input 
                  required
                  className="w-full p-3 rounded-lg border border-border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={newCase.caseNumber}
                  onChange={e => setNewCase({...newCase, caseNumber: e.target.value})}
                  placeholder="e.g. FIR-2026-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Title</label>
                <input 
                  required
                  className="w-full p-3 rounded-lg border border-border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={newCase.title}
                  onChange={e => setNewCase({...newCase, title: e.target.value})}
                  placeholder="Short descriptive title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] dark:text-white"
                  value={newCase.description}
                  onChange={e => setNewCase({...newCase, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Security Level</label>
                <select 
                  className="w-full p-3 rounded-lg border border-border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white [&>option]:bg-white [&>option]:text-black dark:[&>option]:bg-slate-800 dark:[&>option]:text-white"
                  value={newCase.securityLevel}
                  onChange={e => setNewCase({...newCase, securityLevel: e.target.value})}
                >
                  <option value="CONFIDENTIAL">Confidential</option>
                  <option value="RESTRICTED">Restricted</option>
                  <option value="TOP_SECRET">Top Secret</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button type="button" className="btn-outline px-5 py-2 rounded-lg font-medium" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-medium shadow-md shadow-blue-500/20">Open Case</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
