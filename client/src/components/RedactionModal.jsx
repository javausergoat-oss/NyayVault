import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, Check, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RedactionModal({ doc, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/documents/${doc.id}/redact/suggest`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sih_token')}`,
            'x-user-id': localStorage.getItem('sih_active_user')
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to analyze document');
        
        setSuggestions(data.suggestions);
        // Auto-select all by default
        setSelectedIndices(new Set(data.suggestions.map((_, i) => i)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [doc.id]);

  const toggleSelection = (index) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      const selectedRedactions = suggestions.filter((_, i) => selectedIndices.has(i));
      
      const res = await fetch(`/api/documents/${doc.id}/redact/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sih_token')}`,
          'x-user-id': localStorage.getItem('sih_active_user')
        },
        body: JSON.stringify({ redactions: selectedRedactions })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply redactions');
      
      onComplete(data.document);
    } catch (err) {
      setError(err.message);
      setApplying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="card bg-card w-full max-w-3xl flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-border"
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500" />
            <h2 className="text-xl font-bold">AI Redaction Studio</h2>
            <span className="text-sm font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded">
              {doc.filename}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
              <p className="text-lg font-semibold">AI is scanning for sensitive information...</p>
              <p className="text-sm">Detecting PII, Names, and Financial Data</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl border border-red-200 dark:border-red-900/30">
              <p className="font-bold">Error during analysis</p>
              <p>{error}</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <ShieldAlert size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">No sensitive information detected.</p>
              <p className="text-sm">The document appears clean based on standard PII rules.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                The AI detected {suggestions.length} potential pieces of sensitive information. Review and select the items to redact.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((sug, i) => {
                  const isSelected = selectedIndices.has(i);
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleSelection(i)}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30' 
                          : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-mono text-lg font-bold ${isSelected ? 'text-red-700 dark:text-red-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                            {sug.exact_text}
                          </p>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                            {sug.type}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-500 dark:text-slate-500 uppercase text-[10px]">Reason: </span>
                          {sug.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <FileText size={14} />
            Original file will be preserved. A new redacted text copy will be generated.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={loading || applying || suggestions.length === 0 || selectedIndices.size === 0}
              className="btn-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 bg-red-600 hover:bg-red-700 text-white"
            >
              {applying ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
              Generate Redacted Copy
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
