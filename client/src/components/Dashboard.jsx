import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Clock, 
  Users, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  Upload, 
  Sparkles, 
  FileSpreadsheet, 
  Share2, 
  CheckCircle2, 
  Database, 
  Settings2, 
  ShieldCheck, 
  FileVideo, 
  FileSpreadsheet as FileCsv, 
  Image as ImageIcon,
  ArrowRight,
  ExternalLink,
  X
} from 'lucide-react';
import { getCases, createCase } from '../services/api';

export default function Dashboard({ currentUser, onSelectCase, onViewChange }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseOverview, setSelectedCaseOverview] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New Case Form
  const [newCaseData, setNewCaseData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    securityLevel: 'RESTRICTED'
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await getCases();
        const loadedCases = res.cases || [];
        setCases(loadedCases);
        if (loadedCases.length > 0) {
          setSelectedCaseOverview(loadedCases[0]);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleCreateCaseSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCase(newCaseData);
      setShowCreateModal(false);
      setNewCaseData({ caseNumber: '', title: '', description: '', securityLevel: 'RESTRICTED' });
      // Reload
      const res = await getCases();
      setCases(res.cases || []);
    } catch (err) {
      alert("Failed to create case: " + err.message);
    }
  };

  // Mock / default fallback active investigations if database has few
  const displayCases = cases.length > 0 ? cases : [
    { id: 'c1', case_number: 'CR-2026-0045', title: 'Theft Investigation', priority: 'High', status: 'Active', updated_at: '2026-09-04T10:24:00Z', document_count: 184 },
    { id: 'c2', case_number: 'CR-2026-0042', title: 'Cyber Fraud Case', priority: 'Medium', status: 'Review', updated_at: '2026-09-03T14:30:00Z', document_count: 42 },
    { id: 'c3', case_number: 'CR-2026-0038', title: 'Financial Investigation', priority: 'High', status: 'Active', updated_at: '2026-09-02T11:20:00Z', document_count: 96 },
    { id: 'c4', case_number: 'CR-2026-0031', title: 'Identity Forgery', priority: 'Medium', status: 'Closed', updated_at: '2026-09-01T09:15:00Z', document_count: 18 },
    { id: 'c5', case_number: 'CR-2026-0027', title: 'Narcotics Trade', priority: 'Medium', status: 'Active', updated_at: '2026-08-30T16:45:00Z', document_count: 112 },
  ];

  const recentEvidences = [
    { name: 'FIR_0045.pdf', type: 'FIR', caseId: 'CR-2026-0045', status: 'Verified', time: '4 Sep 2025, 09:12', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
    { name: 'Forensic_Report.pdf', type: 'Forensic Report', caseId: 'CR-2026-0042', status: 'Verified', time: '4 Sep 2025, 08:45', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
    { name: 'CCTV_12.mp4', type: 'Video', caseId: 'CR-2026-0045', status: 'Processing', time: '4 Sep 2025, 08:20', icon: FileVideo, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { name: 'Call_Records.csv', type: 'Call Records', caseId: 'CR-2026-0038', status: 'Verified', time: '3 Sep 2025, 17:10', icon: FileCsv, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { name: 'Image_001.jpg', type: 'Image', caseId: 'CR-2026-0042', status: 'Verified', time: '3 Sep 2025, 16:35', icon: ImageIcon, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' },
  ];

  const activeCaseItem = selectedCaseOverview || displayCases[0];

  const roleName = currentUser?.role === 'INVESTIGATING_OFFICER' 
    ? 'Investigator' 
    : currentUser?.role === 'JUDICIAL_OFFICER' 
    ? 'Magistrate' 
    : 'Investigator';

  return (
    <div className="space-y-6 pb-8">
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>👋</span>
            <span>Good Morning, {currentUser?.full_name ? currentUser.full_name.split(' ')[0] : roleName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your investigation workspace
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Thu, 4 Sep 2025
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              10:24 AM
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Case</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases (Green) */}
        <div 
          onClick={() => onViewChange && onViewChange('cases')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
              <Folder size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {displayCases.filter(c => c.status !== 'Closed').length || 12}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Cases
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 2: Total Evidence (Blue) */}
        <div 
          onClick={() => onViewChange && onViewChange('evidence')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                1,248
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Evidence
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 3: Needs Review (Red/Coral) */}
        <div 
          onClick={() => onViewChange && onViewChange('cases')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                26
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Needs Review
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 4: Team Members (Purple) */}
        <div 
          onClick={() => onViewChange && onViewChange('users')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                8
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Team Members
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* 2-Column Main Layout: Left 65% / Right 35% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Investigations & Recent Evidence (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Active Investigations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Active Investigations
              </h2>
              <button 
                type="button" 
                onClick={() => onViewChange && onViewChange('cases')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-5">Case ID</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {displayCases.slice(0, 5).map((c, idx) => {
                    const isHigh = c.priority === 'High' || idx === 0 || idx === 2;
                    const statusText = c.status || (idx === 1 ? 'Review' : idx === 3 ? 'Closed' : 'Active');
                    return (
                      <tr 
                        key={c.id || idx}
                        onClick={() => {
                          setSelectedCaseOverview(c);
                          if (onSelectCase) onSelectCase(c.id);
                        }}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-mono">
                          {c.case_number || `CR-2026-004${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {c.title || 'Case Proceeding'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHigh 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                          }`}>
                            {isHigh ? 'High' : 'Medium'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            statusText === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                              : statusText === 'Review'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(c.updated_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSelectCase && onSelectCase(c.id); }}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Recent Evidence Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Recent Evidence
              </h2>
              <button 
                type="button" 
                onClick={() => onViewChange && onViewChange('evidence')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Uploaded At</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {recentEvidences.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <tr 
                        key={idx}
                        onClick={() => onViewChange && onViewChange('cases')}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${item.color}`}>
                              <Icon size={14} />
                            </div>
                            <span className="truncate max-w-[140px]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {item.type}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                          {item.caseId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {item.time}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <MoreVertical size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Case Overview, Quick Actions & Activity (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Case Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Case Overview
              </h3>
              <button 
                type="button" 
                onClick={() => onSelectCase && onSelectCase(activeCaseItem.id)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                  <Folder size={18} />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {activeCaseItem.case_number || 'CR-2026-0045'}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeCaseItem.title || 'Theft Investigation'}
                  </h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-3 leading-relaxed">
              {activeCaseItem.description || 'Electronics theft case with CCTV evidence and witness statements.'}
            </p>

            {/* 3 Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-center text-blue-500 mb-0.5">
                  <FileText size={15} />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeCaseItem.document_count || 184}
                </div>
                <div className="text-[10px] text-slate-400">Evidence</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-center text-emerald-500 mb-0.5">
                  <Settings2 size={15} />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">7</div>
                <div className="text-[10px] text-slate-400">Processing</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-center text-purple-500 mb-0.5">
                  <Users size={15} />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">12</div>
                <div className="text-[10px] text-slate-400">Under Review</div>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Actions 2x2 Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                type="button"
                onClick={() => onSelectCase && onSelectCase(activeCaseItem.id)}
                className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col items-center text-center transition-all cursor-pointer shadow-2xs"
              >
                <Upload size={18} className="text-emerald-600 mb-1" />
                <span className="text-xs font-bold">Upload Evidence</span>
              </button>

              <button 
                type="button"
                onClick={() => onViewChange && onViewChange('radar')}
                className="p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/40 flex flex-col items-center text-center transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles size={18} className="text-purple-600 mb-1" />
                <span className="text-xs font-bold">Run Analysis</span>
              </button>

              <button 
                type="button"
                onClick={() => onViewChange && onViewChange('reports')}
                className="p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40 flex flex-col items-center text-center transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={18} className="text-amber-600 mb-1" />
                <span className="text-xs font-bold">Generate Report</span>
              </button>

              <button 
                type="button"
                onClick={() => onViewChange && onViewChange('cases')}
                className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/40 flex flex-col items-center text-center transition-all cursor-pointer shadow-2xs"
              >
                <Share2 size={18} className="text-blue-600 mb-1" />
                <span className="text-xs font-bold">Share Case</span>
              </button>
            </div>
          </div>

          {/* Card 3: Evidence Activity */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Evidence Activity
              </h3>
              <button 
                type="button" 
                onClick={() => onViewChange && onViewChange('timeline')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Evidence verified</div>
                  <div className="text-[11px] text-slate-500 font-mono">FIR_0045.pdf (SHA-256 matched)</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">4 Sep, 09:12</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Document uploaded</div>
                  <div className="text-[11px] text-slate-500 font-mono">CCTV_12.mp4</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">4 Sep, 08:20</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Report accessed</div>
                  <div className="text-[11px] text-slate-500">Forensic_Report.pdf by POL-104</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">3 Sep, 18:45</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Chain of custody updated</div>
                  <div className="text-[11px] text-slate-500 font-mono">CCTV_12.mp4</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">3 Sep, 17:30</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Case updated</div>
                  <div className="text-[11px] text-slate-500 font-mono">CR-2026-0045</div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">3 Sep, 16:10</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom System Status Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">System Status:</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            All Systems Operational
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Database size={14} className="text-slate-400" />
            <span>Storage: <strong className="text-emerald-600 dark:text-emerald-400">Operational</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Settings2 size={14} className="text-slate-400" />
            <span>Processing: <strong className="text-emerald-600 dark:text-emerald-400">Operational</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-slate-400" />
            <span>AI Services: <strong className="text-emerald-600 dark:text-emerald-400">Operational</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-slate-400" />
            <span>Integrity: <strong className="text-emerald-600 dark:text-emerald-400">Verified</strong></span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Last Checked: 4 Sep 2025, 10:24
        </div>
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Case Docket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Case Number</label>
                <input
                  type="text"
                  required
                  value={newCaseData.caseNumber}
                  onChange={(e) => setNewCaseData({ ...newCaseData, caseNumber: e.target.value })}
                  placeholder="e.g. CR-2026-0046"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newCaseData.title}
                  onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })}
                  placeholder="e.g. Cyber Investigation or Armed Robbery"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCaseData.description}
                  onChange={(e) => setNewCaseData({ ...newCaseData, description: e.target.value })}
                  placeholder="Brief summary of the incident and seized devices/exhibits..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Create Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
