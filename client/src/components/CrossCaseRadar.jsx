import { useState } from 'react';
import { Search, Network, ArrowRight, Loader2, FileText, Database } from 'lucide-react';
import { fetchApi } from '../services/api';

export default function CrossCaseRadar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetchApi(`/intelligence/cross-case?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      setError(err.message || 'Cross-case search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Network size={120} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-500/30">
            <Database size={14} /> National Intelligence Grid (NATGRID) API
          </div>
          <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
            Cross-Case Pattern Radar
          </h1>
          <p className="text-indigo-200 text-lg mb-8">
            Query the global semantic vector space to find connections, entities, and patterns hidden across isolated case files nationwide.
          </p>

          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-4 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-32 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
              placeholder="Enter suspect name, phone number, vehicle, or pattern..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Scan Network'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Network className="text-indigo-500" />
            Pattern Matches Found: {results.length} Linked Cases
          </h2>

          {results.length === 0 ? (
            <div className="card p-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-border rounded-2xl bg-card">
              <Network size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No cross-case patterns detected for this query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {results.map((caseNode, idx) => (
                <div key={caseNode.case_id} className="card p-0 overflow-hidden border border-border shadow-sm rounded-2xl bg-card flex flex-col md:flex-row">
                  
                  {/* Case Info Sidebar */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-border">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Match {idx + 1}</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-white mb-2">{caseNode.case_title}</div>
                    <div className="inline-block px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-mono text-sm mb-4">
                      {caseNode.case_number}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-auto">
                      <FileText size={16} />
                      {caseNode.evidence_links.length} Connected Evidence Files
                    </div>
                  </div>

                  {/* Connected Evidence List */}
                  <div className="p-6 md:w-2/3 space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b border-border pb-2">
                      Corroborating Evidence Snippets
                    </h3>
                    
                    {caseNode.evidence_links.map((link, lidx) => (
                      <div key={lidx} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative pl-10">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-xl"></div>
                        
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                            {link.filename}
                          </div>
                          <div className="text-xs font-bold text-slate-400" title="Vector Similarity Score">
                            Match: {(link.similarity * 100).toFixed(1)}%
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                          "{link.snippet}"
                        </p>
                        
                      </div>
                    ))}
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
