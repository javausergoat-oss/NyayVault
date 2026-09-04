import { useState } from 'react';
import { Search, Network, Loader2, FileText, Database } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Network size={22} className="text-emerald-600 dark:text-emerald-400" /> Cross-Case Pattern Radar
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Query vector embeddings across isolated case vaults to identify suspect entities, phone numbers, or operational patterns.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/30">
            <Database size={14} /> Global Vector Space
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:border-emerald-500 focus:outline-none transition-colors text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Enter suspect name, phone number, vehicle registration, or MO pattern..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[#1b4d3e] hover:bg-[#143c30] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Scan Network'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs rounded-xl border border-rose-200 dark:border-rose-900/30 font-semibold">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network size={16} className="text-emerald-600" />
            Matched Cases: {results.length} Linked Investigation Vaults
          </h2>

          {results.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 rounded-2xl">
              <Network size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No cross-case pattern linkages detected for this query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((caseNode, idx) => (
                <div key={caseNode.case_id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-6">
                  
                  {/* Case Details */}
                  <div className="md:w-1/3 space-y-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pr-4 pb-4 md:pb-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match #{idx + 1}</div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{caseNode.case_title}</h3>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-mono font-bold">
                      {caseNode.case_number}
                    </span>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
                      <FileText size={14} />
                      {caseNode.evidence_links?.length || 0} Corroborating File(s)
                    </p>
                  </div>

                  {/* Evidence Snippets */}
                  <div className="md:w-2/3 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Corroborating Evidence Snippets
                    </h4>
                    
                    {caseNode.evidence_links?.map((link, lidx) => (
                      <div key={lidx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <FileText size={14} className="text-emerald-600" />
                            {link.filename}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                            Similarity: {(link.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-300 italic font-mono text-[11px]">
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
