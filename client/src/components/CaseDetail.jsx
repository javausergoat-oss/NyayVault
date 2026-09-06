import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Lock, 
  Bot, 
  Clock, 
  FileBarChart, 
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Database,
  Folder,
  MoreVertical
} from 'lucide-react';
import { getCaseDetails, getCaseDocuments, getCaseAuditTrail, updateCaseStatus } from '../services/api';
import DocumentUploader from './DocumentUploader';
import DocumentTable from './DocumentTable';
import AuditTrailView from './AuditTrailView';
import SmartSearch from './SmartSearch';
import CaseAssistant from './CaseAssistant';
import CaseTimeline from './CaseTimeline';
import CaseSummary from './CaseSummary';
import ContradictionPanel from './ContradictionPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseDetailSkeleton } from './ui/Skeleton';

export default function CaseDetail({ caseId, onBack, currentUser }) {
  const [caseDetails, setCaseDetails] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('evidence'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sub-segment states for unified hubs
  const [intelSubTab, setIntelSubTab] = useState('search'); // 'search' | 'chat' | 'contradictions'
  const [timelineSubTab, setTimelineSubTab] = useState('timeline'); // 'timeline' | 'audit'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [caseRes, docsRes, auditRes] = await Promise.all([
        getCaseDetails(caseId),
        getCaseDocuments(caseId),
        getCaseAuditTrail(caseId)
      ]);
      setCaseDetails(caseRes.case);
      setDocuments(docsRes.documents || []);
      setAuditLogs(auditRes.auditLogs || []);
    } catch (err) {
      console.error('Failed to load case data:', err);
      setError(err.message || 'Unable to retrieve case file.');
    } finally {
      setLoading(false);
    }
  };

  const WORKFLOW_STAGES = ['INVESTIGATION', 'CHARGE_SHEET', 'TRIAL', 'JUDGMENT', 'CLOSED'];
  
  const handleAdvanceStatus = async () => {
    if (!caseDetails) return;
    const currentIdx = WORKFLOW_STAGES.indexOf(caseDetails.status || 'INVESTIGATION');
    if (currentIdx >= WORKFLOW_STAGES.length - 1) return;
    
    const nextStatus = WORKFLOW_STAGES[currentIdx + 1];
    
    if (nextStatus === 'CHARGE_SHEET' && currentUser?.role !== 'INVESTIGATING_OFFICER') {
      alert('Only the Investigating Officer can file the Charge Sheet.');
      return;
    }
    if (['TRIAL', 'JUDGMENT', 'CLOSED'].includes(nextStatus) && !['JUDICIAL_OFFICER', 'LAWYER_PROSECUTION'].includes(currentUser?.role)) {
      alert('Only Judicial Officers or Prosecution can advance beyond the Charge Sheet phase.');
      return;
    }

    try {
      await updateCaseStatus(caseId, nextStatus);
      await loadData();
    } catch (err) {
      alert('Failed to advance case status: ' + err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  if (loading && !caseDetails) return <CaseDetailSkeleton />;

  if (error && !caseDetails) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Case File Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            The requested case identifier <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">{caseId}</code> could not be located. It may have been archived, moved, or access may be restricted.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Cases</span>
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!caseDetails) return <CaseDetailSkeleton />;

  const mainTabs = [
    { id: 'evidence', label: 'Evidence Vault', icon: FileText },
    { id: 'intel', label: 'Intelligence & Search', icon: Database },
    { id: 'timeline', label: 'Timeline & Chain of Custody', icon: Clock },
    { id: 'summary', label: 'Executive Brief', icon: FileBarChart },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-4"
    >
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <button 
          onClick={onBack}
          className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          Cases
        </button>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">{caseDetails.case_number}</span>
      </div>

      {/* Header Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            title="Back to Cases"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="w-12 h-12 rounded-xl bg-[#0e1d3e] text-white flex items-center justify-center shadow-sm shrink-0">
            <Folder size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {caseDetails.case_number}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#fee2e2] text-[#dc2626] dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                {caseDetails.security_level || 'RESTRICTED'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-0.5">
              {caseDetails.title || 'STATE VS HARDIK'}
            </p>
          </div>
        </div>

        {/* Right Metadata Grid & Action Menu */}
        <div className="flex items-center gap-6 sm:gap-10 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block mb-0.5">Case ID</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{caseDetails.case_id || caseDetails.id || 'CR-2026-0001'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block mb-0.5">Created By</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{caseDetails.created_by_badge || 'POL-1'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold block mb-0.5">Created On</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {caseDetails.created_at ? new Date(caseDetails.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Aug 2025'}
            </span>
          </div>

          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>


      {/* Streamlined 4 Main Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto pt-1">
        {mainTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TabIcon size={16} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {/* Tab 1: Evidence Vault */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {currentUser && (
                <DocumentUploader caseId={caseId} onUploadComplete={loadData} />
              )}
              <DocumentTable documents={documents} onRefresh={loadData} />
            </div>
          )}

          {/* Tab 2: Intelligence & Search (Unified Hub) */}
          {activeTab === 'intel' && (
            <div className="space-y-5">
              {/* Sub-segment selector */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-max border border-slate-200 dark:border-slate-700/60 text-xs">
                <button
                  onClick={() => setIntelSubTab('search')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    intelSubTab === 'search' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Search size={14} /> Semantic Search
                </button>
                <button
                  onClick={() => setIntelSubTab('chat')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    intelSubTab === 'chat' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Bot size={14} /> Q&A Assistant
                </button>
                <button
                  onClick={() => setIntelSubTab('contradictions')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    intelSubTab === 'contradictions' ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle size={14} /> Contradiction Scan
                </button>
              </div>

              {intelSubTab === 'search' && <SmartSearch caseId={caseId} />}
              {intelSubTab === 'chat' && <CaseAssistant caseId={caseId} />}
              {intelSubTab === 'contradictions' && <ContradictionPanel caseId={caseId} />}
            </div>
          )}

          {/* Tab 3: Timeline & Chain of Custody (Unified Hub) */}
          {activeTab === 'timeline' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-max border border-slate-200 dark:border-slate-700/60 text-xs">
                <button
                  onClick={() => setTimelineSubTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    timelineSubTab === 'timeline' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Clock size={14} /> Case Milestones
                </button>
                <button
                  onClick={() => setTimelineSubTab('audit')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    timelineSubTab === 'audit' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck size={14} /> Audit Trail
                </button>
              </div>

              {timelineSubTab === 'timeline' && <CaseTimeline documents={documents} />}
              {timelineSubTab === 'audit' && <AuditTrailView logs={auditLogs} caseNumber={caseDetails.case_number} />}
            </div>
          )}

          {/* Tab 4: Executive Brief */}
          {activeTab === 'summary' && (
            <CaseSummary caseId={caseId} caseDetails={caseDetails} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
