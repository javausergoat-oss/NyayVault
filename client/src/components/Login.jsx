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
  ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
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
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 text-slate-800 p-4 lg:px-12 lg:py-4 overflow-x-hidden overflow-y-auto lg:overflow-y-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 shrink-0">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <Landmark size={24} className="text-slate-800" />
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Ministry of Justice</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Government of India</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-blue-900 tracking-tight">Nyay<span className="text-blue-600">Vault</span></h1>
            <span className="text-[11px] text-slate-500 font-medium hidden md:inline">Evidence Today. A Safer Tomorrow.</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center my-auto py-2">
        
        {/* Left Side Text & Features */}
        <div className="lg:col-span-7 space-y-3.5 pr-0 lg:pr-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              NYAYVAULT
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mt-0.5">
              Transparent <br />
              Evidence. <br />
              <span className="text-blue-600">Stronger Justice.</span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-600 font-medium mt-2 max-w-md leading-relaxed">
              A unified, tamper-proof platform for evidence management and a transparent chain of custody.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <ShieldCheck size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Tamper-Proof Records</p>
                <p className="text-[11px] text-slate-500 leading-tight">Immutable & verifiable</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Link2 size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">End-to-End Chain of Custody</p>
                <p className="text-[11px] text-slate-500 leading-tight">Track every action</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Users size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Role-Based Access</p>
                <p className="text-[11px] text-slate-500 leading-tight">For Police, Prosecution, Defense, Judiciary</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Audit-Ready Logs</p>
                <p className="text-[11px] text-slate-500 leading-tight">Transparent & accountable</p>
              </div>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="pt-1">
            <div className="w-8 h-0.5 bg-blue-600 mb-1" />
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              TECHNOLOGY FOR A MORE JUST INDIA
            </p>
          </div>
        </div>

        {/* Right Side Login Card */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm mx-auto bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-xl shadow-slate-200/60 space-y-3"
          >
            {/* Header Badge & Title */}
            <div className="text-center">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-1 shadow-sm">
                <Scale size={18} />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">NyayVault</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                SECURE EVIDENCE PORTAL
              </p>
            </div>

            {/* Quick Demo Bar */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2 text-center space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-blue-900">✨ Auto-Fill Demo Credentials:</span>
                <span className="font-mono font-bold text-blue-700">Pass: sih2026</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {['POL-1', 'JUD-1', 'ADV-1', 'ADV-2', 'REG-1'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickFill(role)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      badgeNumber === role 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100/60'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs">
                <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={14} />
                <p className="font-bold text-rose-700 text-[11px]">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-0.5">
                  OFFICER / PERSONNEL BADGE ID
                </label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="e.g. POL-1 or JUD-1"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-0.5">
                  PASSPHRASE
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                    placeholder="Enter your passphrase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex justify-center items-center gap-1.5 disabled:opacity-50 mt-1"
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
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[9px] font-bold text-slate-400 uppercase absolute">OR</span>
              </div>

              <button 
                type="button"
                onClick={() => alert('ePramaan / MeriPehchaan Government SSO Integration Active for Production.')}
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Landmark size={13} className="text-slate-600" />
                <div className="text-left leading-none">
                  <span className="font-bold block text-[10px]">Login with Government SSO</span>
                  <span className="text-[8px] text-slate-400 font-normal">(ePramaan / MeriPehchaan)</span>
                </div>
              </button>
            </div>

            {/* Footer Compliance Badge */}
            <div className="pt-1.5 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" /> BNS & BSA 2023 Compliant
              </p>
              <p className="text-[9px] text-slate-400">Secure | Auditable | Government Certified</p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-slate-400 font-medium shrink-0 pt-0.5">
        NyayVault Digital Evidence System © 2026 · Ministry of Justice · Government of India
      </div>

    </div>
  );
}
