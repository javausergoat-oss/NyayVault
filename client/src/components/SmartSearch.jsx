import { useState, useEffect } from 'react';
import { Search, FileText, Loader2, Database } from 'lucide-react';
import { semanticSearchCase } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSearch({ caseId, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await semanticSearchCase(caseId, searchQuery);
      setResults(res.results || []);
    } catch (err) {
      console.error('Semantic search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Database size={18} className="text-emerald-600 dark:text-emerald-400" /> Contextual Semantic Search
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Query evidence by legal intent, dates, suspects, or facts using vector embeddings.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text" 
              placeholder="e.g. 'Suspect escape vehicle' or 'Call logs between midnight and 3 AM'"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-emerald-500 focus:outline-none transition-colors text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="bg-[#1b4d3e] hover:bg-[#143c30] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 transition-colors" 
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search Index'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Matched Evidence Snippets ({results.length})
            </h3>
            
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-xs font-semibold animate-pulse">Running semantic index query...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Search size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No direct contextual match found for this query.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((res, i) => (
                  <div 
                    key={res.chunk_id || i} 
                    className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />
                        <span>{res.document_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {res.document_type || 'Evidence Document'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                        Match Score: {(res.similarity_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border-l-2 border-emerald-500 font-mono">
                      "{res.text_content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
