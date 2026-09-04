import { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Clock, 
  Users, 
  ChevronRight, 
  MoreVertical, 
  Upload, 
  Sparkles, 
  Share2, 
  ArrowUpRight,
  Database,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  FileVideo,
  FileImage,
  Plus,
  X
} from 'lucide-react';
import { getCases, createCase } from '../services/api';

export default function Dashboard({ currentUser, onSelectCase, onViewChange }) {
  const [cases, setCases] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Case Form State
  const [newCase, setNewCase] = useState({
    caseNumber: '',
    title: '',
    description: '',
    priority: 'HIGH',
    securityLevel: 'RESTRICTED'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getCases();
        setCases(res.cases || []);
      } catch (err) {
        console.error("Failed to fetch cases for dashboard", err);
      }
    };
    fetchDashboardData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCase(newCase);
      setShowCreateModal(false);
      setNewCase({ caseNumber: '', title: '', description: '', priority: 'HIGH', securityLevel: 'RESTRICTED' });
      const res = await getCases();
      setCases(res.cases || []);
    } catch (err) {
      alert('Failed to create case: ' + err.message);
    }
  };

  const defaultInvestigations = [
    { id: 'CR-2026-0045', caseNumber: 'CR-2026-0045', title: 'Theft Investigation', priority: 'High', status: 'Active', updatedAt: '4 Sep 2025' },
    { id: 'CR-2026-0042', caseNumber: 'CR-2026-0042', title: 'Cyber Fraud Case', priority: 'Medium', status: 'Review', updatedAt: '3 Sep 2025' },
    { id: 'CR-2026-0038', caseNumber: 'CR-2026-0038', title: 'Financial Investigation', priority: 'High', status: 'Active', updatedAt: '2 Sep 2025' },
    { id: 'CR-2026-0031', caseNumber: 'CR-2026-0031', title: 'Identity Forgery', priority: 'Medium', status: 'Closed', updatedAt: '1 Sep 2025' },
    { id: 'CR-2026-0027', caseNumber: 'CR-2026-0027', title: 'Narcotics Trade', priority: 'Medium', status: 'Active', updatedAt: '30 Aug 2025' },
  ];

  const investigationsList = cases.length > 0 ? cases.slice(0, 5).map((c) => ({
    id: c.id,
    caseNumber: c.case_number || `CR-2026-00${c.id}`,
    title: c.title,
    priority: c.security_level === 'TOP_SECRET' ? 'High' : 'Medium',
    status: c.status === 'CLOSED' ? 'Closed' : c.status === 'UNDER_REVIEW' ? 'Review' : 'Active',
    updatedAt: new Date(c.updated_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  })) : defaultInvestigations;

  const evidenceList = [
    { name: 'FIR_0045.pdf', type: 'FIR', caseId: 'CR-2026-0045', status: 'Verified', uploadedAt: '4 Sep 2025, 09:12', iconType: 'pdf' },
    { name: 'Forensic_Report.pdf', type: 'Forensic Report', caseId: 'CR-2026-0042', status: 'Verified', uploadedAt: '4 Sep 2025, 08:45', iconType: 'pdf' },
    { name: 'CCTV_12.mp4', type: 'Video', caseId: 'CR-2026-0045', status: 'Processing', uploadedAt: '4 Sep 2025, 08:20', iconType: 'video' },
    { name: 'Call_Records.csv', type: 'Call Records', caseId: 'CR-2026-0038', status: 'Verified', uploadedAt: '3 Sep 2025, 17:10', iconType: 'csv' },
    { name: 'Image_001.jpg', type: 'Image', caseId: 'CR-2026-0042', status: 'Verified', uploadedAt: '3 Sep 2025, 16:35', iconType: 'image' },
  ];

  const activityStream = [
    {
      id: 1,
      dotColor: 'bg-emerald-500',
      icon: Upload,
      title: 'Evidence verified',
      subtitle: 'FIR_0045.pdf (SHA-256 matched)',
      time: '4 Sep, 09:12'
    },
    {
      id: 2,
      dotColor: 'bg-rose-500',
      icon: FileText,
      title: 'Document uploaded',
      subtitle: 'CCTV_12.mp4',
      time: '4 Sep, 08:20'
    },
    {
      id: 3,
      dotColor: 'bg-purple-500',
      icon: FileText,
      title: 'Report accessed',
      subtitle: 'Forensic_Report.pdf by POL-104',
      time: '3 Sep, 18:45'
    },
    {
      id: 4,
      dotColor: 'bg-blue-500',
      icon: Users,
      title: 'Chain of custody updated',
      subtitle: 'CCTV_12.mp4',
      time: '3 Sep, 17:30'
    },
    {
      id: 5,
      dotColor: 'bg-amber-500',
      icon: Sparkles,
      title: 'Case updated',
      subtitle: 'CR-2026-0045',
      time: '3 Sep, 16:10'
    }
  ];

  const renderFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="w-7 h-7 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-[10px]">
            PDF
          </div>
        );
      case 'video':
        return (
          <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <FileVideo size={16} />
          </div>
        );
      case 'csv':
        return (
          <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet size={16} />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <FileImage size={16} />
          </div>
        );
    }
  };

  const activeCasesCount = cases.length > 0 ? cases.filter(c => c.status !== 'CLOSED').length : 12;
  const totalEvidenceCount = cases.length > 0 ? cases.reduce((acc, c) => acc + (parseInt(c.document_count) || 0), 0) : 1248;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <span>👋</span> Good Morning, {currentUser?.full_name?.split(' ')[0] || 'Investigator'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Your investigation workspace
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Thu, 4 Sep 2025
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              10:24 AM
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1b4d3e] hover:bg-[#143c30] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Create Case</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Cases */}
        <div 
          onClick={() => onViewChange && onViewChange('cases')}
          className="bg-[#f4faf6] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Folder size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {activeCasesCount}
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Active Cases
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
        </div>

        {/* Card 2: Total Evidence */}
        <div 
          onClick={() => onViewChange && onViewChange('evidence')}
          className="bg-[#f4f8fc] dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {totalEvidenceCount.toLocaleString()}
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Total Evidence
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
        </div>

        {/* Card 3: Needs Review */}
        <div 
          onClick={() => onViewChange && onViewChange('audit')}
          className="bg-[#fdf4f4] dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-rose-300 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                26
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Needs Review
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
        </div>

        {/* Card 4: Team Members */}
        <div 
          onClick={() => onViewChange && onViewChange('users')}
          className="bg-[#f8f5fc] dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                8
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Team Members
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Investigations Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Active Investigations
              </h2>
              <button 
                onClick={() => onViewChange && onViewChange('cases')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Updated</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {investigationsList.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => onSelectCase && onSelectCase(item.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-bold">
                        {item.caseNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-bold">
                        {item.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.priority === 'High' 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30' 
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                            : item.status === 'Review'
                            ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.updatedAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Evidence Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Recent Evidence
              </h2>
              <button 
                onClick={() => onViewChange && onViewChange('evidence')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Uploaded At</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {evidenceList.map((item, idx) => (
                    <tr 
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-bold flex items-center gap-3">
                        {renderFileIcon(item.iconType)}
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {item.type}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {item.caseId}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.uploadedAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* Case Overview Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Case Overview
              </h2>
              <button 
                onClick={() => onSelectCase && onSelectCase('CR-2026-0045')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View Details <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Case Highlight Container */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Folder size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      CR-2026-0045
                    </h3>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                      Theft Investigation
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Electronics theft case with CCTV evidence and witness statements.
              </p>

              {/* Sub-stat Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center text-blue-600 dark:text-blue-400 mb-1">
                    <FileText size={15} />
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">184</span>
                  <span className="text-[10px] text-slate-400 font-medium">Evidence</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                    <Cpu size={15} />
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">7</span>
                  <span className="text-[10px] text-slate-400 font-medium">Processing</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-center text-purple-600 dark:text-purple-400 mb-1">
                    <Users size={15} />
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">12</span>
                  <span className="text-[10px] text-slate-400 font-medium">Under Review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Tile 1: Upload Evidence */}
              <button 
                onClick={() => setShowUploadModal(true)}
                className="p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Upload size={16} />
                </div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Upload Evidence
                </span>
              </button>

              {/* Tile 2: Run Analysis */}
              <button 
                onClick={() => onViewChange && onViewChange('analysis')}
                className="p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border border-purple-100 dark:border-purple-900/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Sparkles size={16} />
                </div>
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                  Run Analysis
                </span>
              </button>

              {/* Tile 3: Generate Report */}
              <button 
                onClick={() => onViewChange && onViewChange('reports')}
                className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileText size={16} />
                </div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Generate Report
                </span>
              </button>

              {/* Tile 4: Share Case */}
              <button 
                onClick={() => alert('Share link copied to clipboard!')}
                className="p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Share2 size={16} />
                </div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  Share Case
                </span>
              </button>
            </div>
          </div>

          {/* Evidence Activity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Evidence Activity
              </h2>
              <button 
                onClick={() => onViewChange && onViewChange('timeline')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {activityStream.map((act) => {
                const ActIcon = act.icon;
                return (
                  <div key={act.id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="relative mt-1">
                        <span className={`block w-2 h-2 rounded-full ${act.dotColor}`} />
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <ActIcon size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {act.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap pt-0.5">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Status Footer Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 px-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200">System Status</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold ml-1">
            All Systems Operational
          </span>
        </div>

        <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database size={15} className="text-slate-400" />
            <span>Storage: <strong className="text-emerald-600 dark:text-emerald-400">Operational</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu size={15} className="text-slate-400" />
            <span>Processing: <strong className="text-emerald-600 dark:text-emerald-400">Operational</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-slate-400" />
            <span>AI Services: <strong className="text-emerald-600 dark:text-emerald-400">Operational</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-slate-400" />
            <span>Integrity: <strong className="text-emerald-600 dark:text-emerald-400">Verified</strong></span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Last Checked: <span className="font-medium text-slate-600 dark:text-slate-400">4 Sep 2025, 10:24</span>
        </div>
      </div>

      {/* Modal: Create Case */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" /> Open New Investigation
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case / FIR Number</label>
                <input 
                  required
                  placeholder="e.g. CR-2026-0046"
                  value={newCase.caseNumber}
                  onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Title</label>
                <input 
                  required
                  placeholder="Short descriptive case title"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Case Summary</label>
                <textarea 
                  rows={3}
                  placeholder="Provide background details..."
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select 
                    value={newCase.priority}
                    onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Security Level</label>
                  <select 
                    value={newCase.securityLevel}
                    onChange={(e) => setNewCase({ ...newCase, securityLevel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="RESTRICTED">Restricted</option>
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="TOP_SECRET">Top Secret</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1b4d3e] hover:bg-[#143c30] text-white font-bold shadow-xs"
                >
                  Open Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Evidence */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload size={18} className="text-emerald-600" /> Upload Digital Evidence
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40">
              <Upload size={32} className="text-emerald-600 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">Drag & Drop evidence files here</p>
              <p className="text-slate-400 mt-1">Supports PDF, MP4, CSV, PNG, JPG files</p>
              <input type="file" className="hidden" id="evidence-upload-input" />
              <label 
                htmlFor="evidence-upload-input"
                className="mt-4 px-4 py-2 rounded-xl bg-[#1b4d3e] text-white font-bold cursor-pointer hover:bg-[#143c30] transition-colors"
              >
                Browse Files
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">BSA Sec 63 SHA-256 Hash Active</span>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
