import React from 'react';
import { ShieldAlert, RefreshCw, Home, ChevronDown, ChevronUp, Bug } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL: React Error Boundary captured uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafd] dark:bg-slate-950 text-slate-800 dark:text-white flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
          <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-600/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Icon */}
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40">
                  System Guard
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  Interface Integrity Interrupted
                </h2>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                An unexpected interface issue occurred.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Your evidence records and tamper-evident audit logs remain completely intact and secure on the blockchain ledger.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
              >
                <Home size={16} />
                <span>Return to Dashboard</span>
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>
            </div>

            {/* Technical Diagnostics Accordion */}
            {this.state.error && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Bug size={13} />
                    <span>Technical Diagnostics</span>
                  </span>
                  {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                    <p className="text-rose-400 font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-slate-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
