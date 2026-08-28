import { motion } from 'framer-motion';
import { Clock, Shield, Search, Gavel, Scale, FileText, User } from 'lucide-react';

export default function CaseTimeline({ documents }) {
  // Sort documents by uploaded_at ascending
  const sortedDocs = [...(documents || [])].sort(
    (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
  );

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'INVESTIGATION': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', shadow: 'shadow-blue-500/20', icon: Search };
      case 'JUDICIAL': return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', shadow: 'shadow-purple-500/20', icon: Gavel };
      case 'DEFENSE': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/20', icon: Shield };
      case 'PROSECUTION': return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', shadow: 'shadow-rose-500/20', icon: Scale };
      case 'REGISTRAR': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/20', icon: FileText };
      default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', shadow: 'shadow-slate-500/20', icon: FileText };
    }
  };

  if (!sortedDocs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Timeline Events Yet</h3>
        <p className="text-slate-500 mt-2">Upload evidence to start building the case journey.</p>
      </div>
    );
  }

  return (
    <div className="relative py-10 max-w-4xl mx-auto">
      {/* Central Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent -translate-x-1/2 rounded-full" />

      <div className="space-y-12">
        {sortedDocs.map((doc, idx) => {
          const theme = getCategoryTheme(doc.document_category);
          const Icon = theme.icon;
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              className={`relative flex items-center justify-between w-full ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
            >
              {/* Empty space for alternating layout on desktop */}
              <div className="hidden md:block w-5/12" />

              {/* Center Node (Glowing Dot) */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm z-10">
                <div className={`w-3 h-3 rounded-full bg-current ${theme.color} shadow-[0_0_10px_currentColor]`} />
              </div>

              {/* Content Card (21st.dev inspired glassmorphism) */}
              <div className={`w-[calc(100%-3rem)] ml-12 md:ml-0 md:w-5/12`}>
                <div className={`group relative p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border ${theme.border} rounded-2xl shadow-lg ${theme.shadow} transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden`}>
                  
                  {/* Subtle Background Glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.color}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1" title={doc.filename}>
                      {doc.filename}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${theme.bg} ${theme.color}`}>
                        {doc.document_category}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        {doc.document_type}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User size={14} className="opacity-70" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{doc.uploaded_by_name}</span>
                        <span className="text-xs opacity-70">({doc.uploaded_by_badge})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500">
                        <Shield size={12} className="opacity-70" />
                        <span className="truncate">SHA: {doc.sha256_hash.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
