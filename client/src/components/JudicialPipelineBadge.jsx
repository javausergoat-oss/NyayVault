import React, { useRef } from 'react';
import { 
  Shield, 
  Scale, 
  Gavel, 
  UserCheck, 
  HardDrive, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import AnimatedBeam from './ui/AnimatedBeam';
import { useTranslation } from '../hooks/useTranslation';

export default function JudicialPipelineBadge({ className = '' }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const policeRef = useRef(null);
  const regRef = useRef(null);
  const judgeRef = useRef(null);
  const counselRef = useRef(null);
  const vaultRef = useRef(null);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1226] to-[#040817] border border-blue-900/40 text-white shadow-xl ${className}`}
    >
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
            ICJS Interoperable Grid • Live
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-[10px] font-bold">
          <Activity size={12} className="text-blue-400" />
          <span>SHA-256 Synchronized</span>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="relative flex items-center justify-between py-6 px-2 sm:px-6">
        {/* Left Side: Police IO */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div 
            ref={policeRef}
            className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/50 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10"
          >
            <Shield size={22} className="stroke-[2.2]" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-white">Police IO</p>
            <p className="text-[9px] text-slate-400 font-mono">FIR & Exhibits</p>
          </div>
        </div>

        {/* Center-Left: Registrar */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div 
            ref={regRef}
            className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/50 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10"
          >
            <Scale size={22} className="stroke-[2.2]" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-white">Registrar</p>
            <p className="text-[9px] text-slate-400 font-mono">Bench Allocation</p>
          </div>
        </div>

        {/* Center: Evidence Vault & Hash Engine */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div 
            ref={vaultRef}
            className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/60 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10"
          >
            <HardDrive size={26} className="stroke-[2.2]" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-black text-emerald-400">Vault & Ledger</p>
            <p className="text-[9px] text-emerald-300/80 font-mono">AWS S3 / PGlite</p>
          </div>
        </div>

        {/* Center-Right: Presiding Judge */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div 
            ref={judgeRef}
            className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10"
          >
            <Gavel size={22} className="stroke-[2.2]" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-white">Magistrate</p>
            <p className="text-[9px] text-slate-400 font-mono">Trial Bench</p>
          </div>
        </div>

        {/* Right Side: Legal Counsels */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div 
            ref={counselRef}
            className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10"
          >
            <UserCheck size={22} className="stroke-[2.2]" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-white">Counsels</p>
            <p className="text-[9px] text-slate-400 font-mono">State & Defense</p>
          </div>
        </div>

        {/* Animated Beams connecting nodes */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={policeRef}
          toRef={regRef}
          duration={3.5}
          gradientStartColor="#3b82f6"
          gradientStopColor="#8b5cf6"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={regRef}
          toRef={vaultRef}
          duration={4}
          gradientStartColor="#8b5cf6"
          gradientStopColor="#10b981"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={vaultRef}
          toRef={judgeRef}
          duration={4}
          gradientStartColor="#10b981"
          gradientStopColor="#f59e0b"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={vaultRef}
          toRef={counselRef}
          duration={4.5}
          gradientStartColor="#10b981"
          gradientStopColor="#f43f5e"
        />
      </div>

      {/* Bottom Subtext */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          Zero-Trust Evidentiary Handshake: Access is strictly granted by Court Registry allocation under Section 65B of BSA, 2023.
        </p>
      </div>
    </div>
  );
}
