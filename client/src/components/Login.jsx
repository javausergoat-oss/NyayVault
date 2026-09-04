import { useState } from 'react';
import { Fingerprint, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-slate-100 p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-2xl border border-slate-800 bg-[#0e1422] shadow-2xl space-y-6"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-1 shadow-xs">
            <Fingerprint size={26} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">NYAY VAULT</h1>
          <p className="text-xs text-slate-400 font-medium">
            Authorized Law Enforcement & Judiciary Access Only. All logins are audited under Sec 63.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 flex items-start gap-2 text-xs">
            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
            <p className="font-semibold text-rose-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Officer Badge Number
            </label>
            <input
              type="text"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-white focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="e.g. POL-1"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={16} /> Authenticating...</>
            ) : (
              'Access Evidence Vault'
            )}
          </button>
        </form>
        
        <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400 space-y-1">
          <p>Testing Password: <strong className="text-slate-200">sih2026</strong></p>
          <p className="text-[10px] text-slate-500">Badges: POL-1, JUD-1, ADV-1, ADV-2, REG-1</p>
        </div>
      </motion.div>
    </div>
  );
}
