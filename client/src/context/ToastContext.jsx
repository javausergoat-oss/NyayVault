import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Copy, 
  Check, 
  Lock, 
  X 
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', hash = null, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type, hash, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Operation Successful') => 
      addToast({ title, message, type: 'success' }),
    error: (message, title = 'Security / Action Error') => 
      addToast({ title, message, type: 'error' }),
    warning: (message, title = 'Judicial Notice') => 
      addToast({ title, message, type: 'warning' }),
    info: (message, title = 'System Update') => 
      addToast({ title, message, type: 'info' }),
    crypto: (title, hash, message = 'Cryptographic SHA-256 seal verified') =>
      addToast({ title, message, hash, type: 'crypto', duration: 6000 })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Floating Toast Viewport */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (toast.hash) {
      navigator.clipboard.writeText(toast.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-500/30 dark:border-emerald-500/40',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          icon: ShieldCheck,
          accent: 'from-emerald-500 to-teal-600'
        };
      case 'error':
        return {
          border: 'border-rose-500/30 dark:border-rose-500/40',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
          icon: XCircle,
          accent: 'from-rose-500 to-red-600'
        };
      case 'warning':
        return {
          border: 'border-amber-500/30 dark:border-amber-500/40',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          icon: AlertTriangle,
          accent: 'from-amber-500 to-orange-600'
        };
      case 'crypto':
        return {
          border: 'border-blue-500/40 dark:border-blue-500/50',
          bg: 'bg-slate-950/95 text-white',
          iconBg: 'bg-blue-500/20 text-blue-400',
          icon: Lock,
          accent: 'from-blue-500 via-indigo-500 to-purple-600'
        };
      default:
        return {
          border: 'border-blue-500/30 dark:border-blue-500/40',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
          icon: Info,
          accent: 'from-blue-500 to-indigo-600'
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className={`pointer-events-auto relative overflow-hidden backdrop-blur-xl border ${style.border} ${style.bg} p-4 rounded-2xl shadow-2xl shadow-slate-950/20`}
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${style.accent}`} />

      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
          <Icon size={18} className="stroke-[2.2]" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {toast.title}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>

          {toast.hash && (
            <div className="mt-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 truncate">
                {toast.hash}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                title="Copy Hash"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
