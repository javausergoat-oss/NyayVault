import { Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditTrailView({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="card p-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-border rounded-2xl">
        <Activity size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No audit events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-8 rounded-2xl border border-border shadow-sm bg-card relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 text-slate-900 dark:text-white relative z-10">
        <Activity className="text-emerald-500" /> Immutable Chain of Custody
      </h3>
      
      <div className="flex flex-col gap-4 relative z-10">
        {logs.map((log, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={log.id} 
            className="flex items-start gap-4 p-4 border border-border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
              <Clock size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-bold text-slate-900 dark:text-slate-100">{log.action}</p>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Performed by <span className="font-semibold">{log.user_badge} ({log.user_role})</span>
              </p>
              
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  IP: {log.ip_address}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  Log ID: {log.id.split('-')[0]}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
