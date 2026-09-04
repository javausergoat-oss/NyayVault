import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Building, 
  BadgeCheck,
  UserCheck,
  Scale,
  Gavel,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { getUsers } from '../services/api';

export default function UsersDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.users || []);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const roles = [
    { id: 'ALL', label: 'All Personnel' },
    { id: 'INVESTIGATING_OFFICER', label: 'Investigating Officers' },
    { id: 'JUDICIAL_OFFICER', label: 'Judiciary / Magistrates' },
    { id: 'LAWYER_PROSECUTION', label: 'Prosecution' },
    { id: 'LAWYER_DEFENSE', label: 'Defense Counsel' },
    { id: 'REGISTRAR', label: 'Court Clerks / Registry' },
  ];

  const permissionsMatrix = [
    { feature: 'Upload Digital Evidence', io: true, judicial: true, prosecution: true, defense: true, reg: true },
    { feature: 'Live SHA-256 Verification', io: true, judicial: true, prosecution: true, defense: true, reg: true },
    { feature: 'PII AI Redaction & Censoring', io: true, judicial: true, prosecution: true, defense: true, reg: true },
    { feature: 'Cross-Case Pattern Radar (NATGRID)', io: true, judicial: false, prosecution: false, defense: false, reg: false },
    { feature: 'File Charge Sheet Stage', io: true, judicial: false, prosecution: false, defense: false, reg: false },
    { feature: 'Advance to Trial / Judgment / Close', io: false, judicial: true, prosecution: true, defense: false, reg: false },
    { feature: 'Export BSA 2023 / 65B Certificates', io: true, judicial: true, prosecution: true, defense: true, reg: true },
    { feature: 'Access Top Secret Security Tier', io: true, judicial: true, prosecution: false, defense: false, reg: false },
  ];

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || 
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.badge_number && u.badge_number.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));
    return matchesRole && matchesQuery;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'INVESTIGATING_OFFICER': return <Shield className="text-blue-500" size={16} />;
      case 'JUDICIAL_OFFICER': return <Gavel className="text-purple-500" size={16} />;
      case 'LAWYER_PROSECUTION': return <Scale className="text-rose-500" size={16} />;
      case 'LAWYER_DEFENSE': return <BadgeCheck className="text-emerald-500" size={16} />;
      case 'REGISTRAR': return <FileSpreadsheet className="text-amber-500" size={16} />;
      default: return <UserCheck className="text-slate-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Multi-Agency Access Control • Zero-Trust Role Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Personnel & Access Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized officers, judicial authorities, legal counsel, and registrars with cryptographic credential verification.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">
          <span>Total Officers: {users.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
            {roles.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleFilter(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  roleFilter === r.id
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, badge, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            Loading personnel roster...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No officers match your search.
          </div>
        ) : (
          filteredUsers.map(user => {
            const initials = user.full_name
              ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'OFF';

            return (
              <div 
                key={user.id} 
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {user.full_name}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        {getRoleIcon(user.role)}
                        <span>{user.role.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    {user.badge_number}
                  </span>
                </div>

                <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Department:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{user.department || 'Law & Justice'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Clearance:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">TIER-1 AUTHORIZED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Key Card:</span>
                    <span className="font-mono text-[10px]">{user.id.substring(0, 12)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RBAC Governance Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) Governance Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enforced at API gateway level via JSON Web Token role verification.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold">
            Zero Trust Architecture
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">System Operation / Action</th>
                <th className="py-3 px-4 text-center">Police (IO)</th>
                <th className="py-3 px-4 text-center">Magistrate</th>
                <th className="py-3 px-4 text-center">Prosecution</th>
                <th className="py-3 px-4 text-center">Defense</th>
                <th className="py-3 px-4 text-center">Registrar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {permissionsMatrix.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">{item.feature}</td>
                  <td className="py-2.5 px-4 text-center">{item.io ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                  <td className="py-2.5 px-4 text-center">{item.judicial ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                  <td className="py-2.5 px-4 text-center">{item.prosecution ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                  <td className="py-2.5 px-4 text-center">{item.defense ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                  <td className="py-2.5 px-4 text-center">{item.reg ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
