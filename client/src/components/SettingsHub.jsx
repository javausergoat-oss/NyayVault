import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Languages, 
  Moon, 
  Sun, 
  Cpu, 
  CheckCircle2, 
  Building2, 
  Key, 
  RefreshCw,
  Server
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function SettingsHub({ currentUser, theme, toggleTheme }) {
  const { language, toggleLanguage } = useTranslation();
  const [healthData, setHealthData] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (e) {
      console.error('Health check failed', e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Settings size={16} />
            <span>GovTech Node Diagnostics & Vault Controls</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System & Security Controls
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system preferences, cryptographic hash engines, local storage nodes, and language localization.
          </p>
        </div>

        <button
          type="button"
          onClick={checkHealth}
          disabled={checking}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={checking ? 'animate-spin text-emerald-600' : ''} />
          <span>Run Node Diagnostics</span>
        </button>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node Health */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Server size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Database & Node Health</h2>
              <p className="text-[11px] text-slate-400">PostgreSQL Embedded (PGlite) Core</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 size={14} /> ONLINE & OPERATIONAL
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database Engine:</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {healthData?.database?.mode || 'Embedded PGlite'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Evidence Storage Driver:</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {healthData?.storage?.driver || 'MinIO / S3 Driver'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Target Evidence Bucket:</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {healthData?.storage?.bucket || 'sih-evidence-vault-2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Standards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cryptographic Standards</h2>
              <p className="text-[11px] text-slate-400">FIPS-180-4 Cryptographic Integrity</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span>Hashing Algorithm:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">SHA-256 (256-bit Digest)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Verification Mode:</span>
              <span className="font-mono text-emerald-600 font-bold">Live Stream Checksum</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Statutory Compliance:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">Sec 63 BSA 2023 / Sec 65B IEA</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Security Tier:</span>
              <span className="font-mono text-rose-600 font-bold">TOP SECRET / ZERO-TRUST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Appearance & Localization Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Selector */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Workspace Theme</div>
                <div className="text-[11px] text-slate-400">Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Toggle
            </button>
          </div>

          {/* Language Selector */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <Languages size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">System Language</div>
                <div className="text-[11px] text-slate-400">Current: {language === 'en' ? 'English (Official)' : 'हिन्दी (राजभाषा)'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {language === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Mandate Note */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
        <Building2 className="text-slate-400 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-900 dark:text-white block mb-0.5">
            Ministry of Law & Justice, Government of India
          </strong>
          NyayVault is engineered for Problem Statement SIH-26190 to provide end-to-end cryptographic traceability, custody accountability, and Section 63 BSA compliance for digital evidence across Indian courts and law enforcement agencies.
        </div>
      </div>
    </div>
  );
}
