import { useState } from 'react';
import { Search, FileText, Loader2, Sparkles } from 'lucide-react';
import { semanticSearchCase } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSearch({ caseId }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await semanticSearchCase(caseId, query);
      setResults(res.results || []);
    } catch (err) {
      alert('Search failed: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-8 bg-card border border-border shadow-lg rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
        
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-white relative z-10">
          <Sparkles className="text-indigo-500" /> Smart Semantic Search
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
          Search evidence by context and meaning using AI vector embeddings (pgvector).
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="e.g. 'Suspect's escape vehicle' or 'Financial transactions in May'"
              className="w-full pl-11 pr-4 py-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white text-base shadow-inner"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-70 whitespace-nowrap" 
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Search AI'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 shadow-lg rounded-2xl"
          >
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-border pb-4">Search Results</h3>
            
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 text-indigo-500">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p className="font-medium animate-pulse">Running semantic vector analysis...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>No relevant evidence found for this query.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {results.map((res, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={res.chunk_id || i} 
                    className="border border-border rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors bg-slate-50 dark:bg-slate-800/30"
                  >
                    <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-indigo-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{res.document_name}</span>
                        <span className="badge badge-gray text-xs">{res.document_type}</span>
                      </div>
                      <div className="badge badge-green text-xs font-mono font-bold" title="Cosine Similarity Score">
                        Match: {(res.similarity_score * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                      "{res.text_content}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
