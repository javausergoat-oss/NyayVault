import { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  User,
  Link2,
  Users,
  FileText,
  Scale,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_PRESETS = [
  { id: 'POL-1', label: 'Police IO (POL-1)' },
  { id: 'JUD-1', label: 'Judge (JUD-1)' },
  { id: 'ADV-1', label: 'Defense (ADV-1)' },
  { id: 'ADV-2', label: 'Prosecutor (ADV-2)' },
  { id: 'REG-1', label: 'Registrar (REG-1)' }
];

export default function Login({ onLoginSuccess }) {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleSelectPreset = (badgeId) => {
    setBadgeNumber(badgeId);
    setPassword('sih2026');
    setShowDemoMenu(false);
    setError('');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge_number: badgeNumber.trim(), password })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Backend server is unreachable. Please verify API connection.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials. Please verify and try again.');
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
    <div className="min-h-screen w-full bg-[#f8fafd] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Soft abstract ambient curves as seen in the reference mockup */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/60 via-indigo-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/70 via-sky-50/50 to-transparent rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-gradient-to-tl from-slate-100/80 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a 
            href="https://doj.gov.in" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Visit Ministry of Justice / Department of Justice website"
            className="flex items-center gap-3.5 group cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img 
              src="/emblem.svg" 
              alt="Government of India" 
              className="h-16 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform" 
            />
            <div className="leading-snug">
              <div className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                Ministry of Justice
              </div>
              <div className="text-xs text-slate-500 font-medium">Government of India</div>
            </div>
          </a>

          <div className="h-10 w-px bg-slate-200" />

          <div className="leading-snug">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Nyay<span className="text-blue-600">Vault</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Evidence Today. A Safer Tomorrow.</div>
          </div>
        </div>
      </header>

      {/* Main 2-Column Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 lg:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Hero & Value Proposition */}
        <div className="flex flex-col justify-center max-w-lg">
          <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-3">
            NYAYVAULT
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Transparent<br />
            Evidence.<br />
            <span className="text-blue-600">Stronger Justice.</span>
          </h1>

          <div className="w-12 h-1 bg-blue-600 rounded-full mt-4 mb-5" />

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md mb-7">
            A unified, tamper-proof platform for evidence management and a transparent chain of custody.
          </p>

          {/* 4 Feature Points */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/60">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Tamper-Proof Records</div>
                <div className="text-xs text-slate-500">Immutable & verifiable</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/60">
                <Link2 size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">End-to-End Chain of Custody</div>
                <div className="text-xs text-slate-500">Track every action</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/60">
                <Users size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Role-Based Access</div>
                <div className="text-xs text-slate-500">For Police, Prosecution, Defense, Judiciary</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/60">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Audit-Ready Logs</div>
                <div className="text-xs text-slate-500">Transparent & accountable</div>
              </div>
            </div>
          </div>

          {/* Left Hero Bottom Tagline */}
          <div className="mt-9 flex items-center gap-3">
            <div className="w-10 h-[2px] bg-blue-600" />
            <span className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              TECHNOLOGY FOR A MORE JUST INDIA
            </span>
          </div>
        </div>

        {/* Right Column: The Login Card */}
        <div className="flex justify-center lg:justify-end w-full">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[430px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-7 sm:p-9 relative"
          >
            {/* Scales of Justice Brand Icon */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0e1d3e] text-white flex items-center justify-center shadow-lg shadow-blue-950/20 mb-3.5">
                <Scale size={28} className="stroke-[1.8]" />
              </div>

              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Nyay<span className="text-blue-600">Vault</span>
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-1">
                SECURE EVIDENCE PORTAL
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
                >
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1-Click Demo Auto-Fill Bar */}
            <div className="mb-5 p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-600" />
                  Auto-Fill Demo Credentials:
                </span>
                <span className="text-[10px] text-blue-600 font-semibold font-mono">Pass: sih2026</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {DEMO_PRESETS.map((p) => {
                  const isSelected = badgeNumber === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white border border-blue-200/80 text-blue-900 hover:bg-blue-100/70'
                      }`}
                      title={`Auto-fill as ${p.label}`}
                    >
                      {p.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                  OFFICER / PERSONNEL BADGE ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    required
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="e.g. POL-1 or JUD-1"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                  PASSPHRASE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your passphrase"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 text-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Access NyayVault</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative flex py-4 items-center justify-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="shrink-0 px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                OR
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Government SSO Button with 1-Click Demo Presets */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm group"
              >
                <img 
                  src="/emblem.svg" 
                  alt="Emblem of India" 
                  className="w-5 h-7 object-contain group-hover:scale-105 transition-transform" 
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">Login with Government SSO</div>
                  <div className="text-[10px] text-slate-500 font-medium">(ePramaan / MeriPehchaan)</div>
                </div>
              </button>

              {/* Demo Roles Quick Picker Popover */}
              <AnimatePresence>
                {showDemoMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 space-y-1"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                      Select Evaluator Persona:
                    </div>
                    {DEMO_PRESETS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPreset(item.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] text-slate-400">Pass: sih2026</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Compliance Badge */}
            <div className="mt-6 pt-2 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <ShieldCheck size={16} className="text-emerald-500 fill-emerald-50" />
                <span>BNS & BSA 2023 Compliant</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Secure | Auditable | Government Certified
              </div>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Subtle bottom spacing */}
      <div className="h-6" />
    </div>
  );
}
