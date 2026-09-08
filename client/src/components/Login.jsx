import { useState } from 'react';
import { 
  Fingerprint, 
  Lock, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Link2, 
  Users, 
  FileText, 
  Eye, 
  EyeOff, 
  Landmark, 
  Scale, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess, theme, toggleTheme }) {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (roleBadge) => {
    setBadgeNumber(roleBadge);
    setPassword('sih2026');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge_number: badgeNumber, password })
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Backend server unreachable. Ensure server is running on port 5001.');
      }
      
      if (!res.ok) {
        throw new Error(data?.error || `Authentication failed (${res.status})`);
      }

      localStorage.setItem('sih_token', data.token);
      localStorage.setItem('sih_active_user', data.user.id);
      localStorage.setItem('sih_active_role', data.user.role);
      
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ zoom: '110%' }}
      className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 lg:px-12 lg:py-5 overflow-x-hidden overflow-y-auto transition-colors duration-200"
    >
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3 sm:pb-4 shrink-0">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
          {/* Official Department of Justice Portal Link & Logo */}
          <a
            href="https://doj.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
            title="Department of Justice, Ministry of Law & Justice, Government of India (Official Portal - Opens in new tab)"
          >
            <img 
              src="/doj-logo.png" 
              alt="Department of Justice, Ministry of Law & Justice, Government of India" 
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]" 
            />
          </a>

          <div className="h-10 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden shadow-sm border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-50 p-1 shrink-0 flex items-center justify-center">
              <img 
                src="/nyayvault-icon.png" 
                alt="NyayVault Emblem" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Nyay<span className="text-blue-600 dark:text-blue-500">Vault</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 leading-none">
                Evidence Today. A Safer Tomorrow.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        {toggleTheme && (
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs text-xs font-semibold cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} className="text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Grid Content - Centered Compact Container */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto py-2">
        
        {/* Left Side Text & Features */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4 pr-0 lg:pr-2 py-1">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Transparent <br />
              Evidence. <br />
              <span className="text-blue-600 dark:text-blue-400">Stronger Justice.</span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-300 font-medium mt-2 max-w-sm leading-relaxed">
              A unified, tamper-proof platform for evidence management and a transparent chain of custody.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-3 py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">Tamper-Proof Records</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Immutable & verifiable</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                <Link2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">End-to-End Chain of Custody</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Track every action</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">Role-Based Access</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">For Police, Prosecution, Defense, Judiciary</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">Audit-Ready Logs</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Transparent & accountable</p>
              </div>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="pt-1">
            <div className="w-10 h-0.5 bg-blue-600 dark:bg-blue-500 mb-1.5" />
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
              TECHNOLOGY FOR A MORE JUST INDIA
            </p>
          </div>
        </div>

        {/* Right Side Login Card */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm ml-auto h-full flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80"
          >
            {/* Top: Header Badge & Title */}
            <div className="text-center shrink-0 mb-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden mx-auto mb-2 shadow-sm border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-50 p-1 flex items-center justify-center">
                <img 
                  src="/nyayvault-icon.png" 
                  alt="NyayVault" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">NyayVault</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                SECURE EVIDENCE PORTAL
              </p>
            </div>

            {/* Middle Content Container */}
            <div className="space-y-3 flex-1 flex flex-col justify-center my-1">
              {/* Quick Demo Bar */}
              <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl p-2 text-center space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">✨ Auto-Fill Demo Credentials:</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300">Pass: sih2026</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {['POL-1', 'JUD-1', 'ADV-1', 'ADV-2', 'REG-1'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleQuickFill(role)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        badgeNumber === role 
                          ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-600' 
                          : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-slate-700 hover:bg-blue-100/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs">
                  <AlertCircle className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" size={14} />
                  <p className="font-bold text-rose-700 dark:text-rose-300 text-[11px]">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-wider mb-0.5">
                    OFFICER / PERSONNEL BADGE ID
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                    <input
                      type="text"
                      required
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="e.g. POL-1 or JUD-1"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-wider mb-0.5">
                    PASSPHRASE
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter your passphrase"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex justify-center items-center gap-1.5 disabled:opacity-50 mt-1 cursor-pointer"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={14} /> Authenticating...</>
                  ) : (
                    <>Access NyayVault <ArrowRight size={14} /></>
                  )}
                </button>
              </form>

              {/* SSO Option */}
              <div className="space-y-1.5 pt-0.5">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase absolute">OR</span>
                </div>

                <button 
                  type="button"
                  onClick={() => alert('ePramaan / MeriPehchaan Government SSO Integration Active for Production.')}
                  className="w-full py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Landmark size={13} className="text-slate-600 dark:text-slate-400" />
                  <div className="text-left leading-none">
                    <span className="font-bold block text-[10px]">Login with Government SSO</span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-normal">(ePramaan / MeriPehchaan)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom: Footer Compliance Badge */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center shrink-0 mt-2">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" /> BNS & BSA 2023 Compliant
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500">Secure | Auditable | Government Certified</p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0 pt-1">
        NyayVault Digital Evidence System © 2026 · Department of Justice · Ministry of Law & Justice · Government of India
      </div>

    </div>
  );
}
