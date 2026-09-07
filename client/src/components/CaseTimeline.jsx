import { Clock, Shield, Search, Gavel, Scale, FileText, User } from 'lucide-react';
import TracingBeam from './ui/TracingBeam';

export default function CaseTimeline({ documents }) {
  const sortedDocs = [...(documents || [])].sort(
    (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'INVESTIGATION': return Search;
      case 'JUDICIAL': return Gavel;
      case 'DEFENSE': return Shield;
      case 'PROSECUTION': return Scale;
      default: return FileText;
    }
  };

  if (!sortedDocs.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Timeline Events Recorded</h3>
        <p className="text-xs mt-1">Upload evidence documents to construct the chronological case log.</p>
      </div>
    );
  }

  return (
    <TracingBeam className="px-2 md:px-6">
      <div className="relative py-4 max-w-3xl mx-auto space-y-6">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

      {sortedDocs.map((doc, idx) => {
        const Icon = getCategoryIcon(doc.document_category);
        return (
          <div key={doc.id || idx} className="relative flex items-start gap-4 pl-12">
            {/* Timeline Node */}
            <div className="absolute left-4 top-1 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-400 flex items-center justify-center z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            </div>

            {/* Timeline Item Card */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {new Date(doc.uploaded_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Icon size={12} />
                  {doc.document_category}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {doc.filename}
              </h4>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{doc.uploaded_by_name}</span>
                  <span>({doc.uploaded_by_badge})</span>
                </div>
                <div className="font-mono text-slate-400">
                  SHA: {doc.sha256_hash?.substring(0, 12)}...
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </TracingBeam>
  );
}
