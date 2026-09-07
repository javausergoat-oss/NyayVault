import React from 'react';
import { 
  Shield, 
  Landmark, 
  Database, 
  Fingerprint, 
  Scale, 
  Users, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function JudicialPipelineBadge({ className = '' }) {
  const { t } = useTranslation();

  const nodes = [
    {
      id: 'police',
      label: 'Police IO',
      status: 'Connected',
      statusType: 'success', // green
      exhibits: '184 exhibits',
      icon: Shield,
      color: 'text-blue-400 bg-[#0c1f4a] border-blue-500/60 shadow-blue-500/20'
    },
    {
      id: 'registrar',
      label: 'Registrar',
      status: 'Connected',
      statusType: 'success',
      exhibits: '184 exhibits',
      icon: Landmark,
      color: 'text-purple-400 bg-[#221040] border-purple-500/60 shadow-purple-500/20'
    },
    {
      id: 'vault',
      label: 'Evidence Vault',
      status: 'Online',
      statusType: 'emerald', // highlighted center
      exhibits: '184 exhibits',
      icon: Database,
      isCenter: true,
      color: 'text-emerald-300 bg-[#022c22] border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500/20'
    },
    {
      id: 'forensics',
      label: 'Forensics',
      status: 'Connected',
      statusType: 'success',
      exhibits: '42 exhibits',
      icon: Fingerprint,
      color: 'text-cyan-400 bg-[#082f49] border-cyan-500/60 shadow-cyan-500/20'
    },
    {
      id: 'judiciary',
      label: 'Judiciary',
      status: 'Limited Access',
      statusType: 'warning', // amber
      exhibits: '12 exhibits',
      icon: Scale,
      color: 'text-amber-400 bg-[#361e04] border-amber-500/60 shadow-amber-500/20'
    },
    {
      id: 'counsel',
      label: 'Counsel',
      status: 'Restricted',
      statusType: 'danger', // rose/red
      exhibits: '5 exhibits',
      icon: Users,
      color: 'text-rose-400 bg-[#3f0719] border-rose-500/60 shadow-rose-500/20'
    }
  ];

  return (
    <div className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-[#060b18] border border-slate-800/80 text-white shadow-2xl ${className}`}>
      
      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="text-xs sm:text-sm font-black font-mono tracking-widest uppercase text-white">
            ICJS INTEROPERABLE GRID • LIVE
          </span>
          <span className="text-slate-400 text-xs hidden md:inline font-mono pl-2 border-l border-slate-800">
            Secure exchange &nbsp;•&nbsp; Controlled access &nbsp;•&nbsp; Evidence continuity
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c1a36] border border-blue-800/60 text-blue-300 text-xs font-bold self-start sm:self-auto shadow-xs">
          <Activity size={13} className="text-blue-400" />
          <span>SHA-256 Synchronized</span>
        </div>
      </div>

      {/* Main 6 Node Pipeline Flow */}
      <div className="overflow-x-auto py-4">
        <div className="flex items-center justify-between min-w-[760px] px-4">
          {nodes.map((node, idx) => {
            const NodeIcon = node.icon;
            return (
              <React.Fragment key={node.id}>
                {/* Node Container */}
                <div className="flex flex-col items-center gap-2 text-center group">
                  <div 
                    className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                      node.isCenter ? 'w-16 h-16 border-2' : 'w-14 h-14 border'
                    } ${node.color}`}
                  >
                    <NodeIcon size={node.isCenter ? 26 : 22} />
                  </div>

                  <div>
                    <h3 className={`text-xs font-extrabold tracking-tight ${node.isCenter ? 'text-white text-sm' : 'text-slate-100'}`}>
                      {node.label}
                    </h3>

                    {/* Status Pill */}
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        node.statusType === 'success' || node.statusType === 'emerald'
                          ? 'bg-emerald-400'
                          : node.statusType === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`} />
                      <span className={`text-[11px] font-bold ${
                        node.statusType === 'success' || node.statusType === 'emerald'
                          ? 'text-emerald-400'
                          : node.statusType === 'warning'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {node.status}
                      </span>
                    </div>

                    <p className={`text-[10px] font-mono mt-0.5 ${node.isCenter ? 'text-emerald-300/80 font-bold' : 'text-slate-400'}`}>
                      {node.exhibits}
                    </p>
                  </div>
                </div>

                {/* Arrow Connector between nodes */}
                {idx < nodes.length - 1 && (
                  <div className="flex items-center justify-center shrink-0 text-slate-600 px-1">
                    <div className="w-8 h-px bg-gradient-to-r from-slate-700 via-emerald-500/40 to-slate-700 relative flex items-center justify-center">
                      <ArrowRight size={14} className="text-emerald-400/80 absolute -top-1.5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar / Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold">
          <Lock size={14} className="text-slate-400" />
          <span>Security & Integration</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-slate-300 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>SHA-256 Hashing Enabled</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Tamper-Proof Storage (S3/MinIO)</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Audit Logging Active</span>
          </div>
        </div>
      </div>

    </div>
  );
}
