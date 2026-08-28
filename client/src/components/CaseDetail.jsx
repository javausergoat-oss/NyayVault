import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Activity, Search, Shield, Lock, Bot, ClipboardList, Clock, FileBarChart, AlertTriangle } from 'lucide-react';
import { getCaseDetails, getCaseDocuments, getCaseAuditTrail, getComplaints, updateCaseStatus } from '../services/api';
import DocumentUploader from './DocumentUploader';
import DocumentTable from './DocumentTable';
import AuditTrailView from './AuditTrailView';
import SmartSearch from './SmartSearch';
import CaseAssistant from './CaseAssistant';
import CaseTimeline from './CaseTimeline';
import CaseSummary from './CaseSummary';
import ContradictionPanel from './ContradictionPanel';

import { motion, AnimatePresence } from 'framer-motion';

export default function CaseDetail({ caseId, onBack, currentUser }) {
  const [caseDetails, setCaseDetails] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('evidence'); 

  const loadData = async () => {
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
      alert('Failed to load case data: ' + err.message);
    }
  };

  const WORKFLOW_STAGES = ['INVESTIGATION', 'CHARGE_SHEET', 'TRIAL', 'JUDGMENT', 'CLOSED'];
  
  const handleAdvanceStatus = async () => {
    if (!caseDetails) return;
    const currentIdx = WORKFLOW_STAGES.indexOf(caseDetails.status || 'INVESTIGATION');
    if (currentIdx >= WORKFLOW_STAGES.length - 1) return;
    
    const nextStatus = WORKFLOW_STAGES[currentIdx + 1];
    
    // Basic role checks for UI feedback (backend also enforces this via role rules, but let's give immediate feedback)
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
      await loadData(); // Reload to get new status and audit logs
    } catch (err) {
      alert('Failed to advance case status: ' + err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  if (!caseDetails) return (
    <div className="flex justify-center p-20">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto mt-4"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-border text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {caseDetails.case_number}
              </h1>
              <span className={`badge text-xs flex items-center gap-1 ${caseDetails.security_level === 'TOP_SECRET' ? 'badge-red' : 'badge-gray'}`}>
                {caseDetails.security_level === 'TOP_SECRET' && <Lock size={12} />}
                {caseDetails.security_level}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">{caseDetails.title}</p>
          </div>
        </div>
        
        <div className="flex flex-col text-right">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Created By</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{caseDetails.created_by_badge}</span>
        </div>
      </div>

      {/* Case Status Workflow */}
      <div className="mb-8 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="flex items-center min-w-max">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const currentIdx = WORKFLOW_STAGES.indexOf(caseDetails.status || 'INVESTIGATION');
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={stage} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 
                        isCurrent ? 'bg-indigo-100 border-indigo-600 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 
                        'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500'
                      }`}>
                        {stage.replace('_', ' ')}
                      </span>
                    </div>
                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <div className={`w-12 md:w-20 h-1 mx-2 rounded-full ${
                        isCompleted ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={handleAdvanceStatus}
            disabled={caseDetails.status === 'CLOSED'}
            className="btn-primary py-2 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            Advance Stage <Activity size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-border overflow-x-auto w-max">
        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'evidence' 
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('evidence')}
        >
          <FileText size={16} /> Evidence Vault
        </button>

        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'search' 
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={16} /> Smart Search
        </button>
        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'chat' 
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          <Bot size={16} /> AI Assistant
        </button>
        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'timeline' 
              ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={16} /> Timeline
        </button>
        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'summary' 
              ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          <FileBarChart size={16} /> Summary
        </button>
        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'contradictions' 
              ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
          onClick={() => setActiveTab('contradictions')}
        >
          <AlertTriangle size={16} /> Contradictions
        </button>
        <button 
          className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${
            activeTab === 'audit' 
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('audit')}
        >
          <Activity size={16} /> Chain of Custody
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'evidence' && (
            <div className="flex flex-col gap-6">
              {currentUser && (
                <DocumentUploader caseId={caseId} onUploadComplete={loadData} />
              )}
              <DocumentTable documents={documents} onRefresh={loadData} />
            </div>
          )}

          {activeTab === 'search' && (
            <SmartSearch caseId={caseId} />
          )}



          {activeTab === 'chat' && (
            <CaseAssistant caseId={caseId} />
          )}

          {activeTab === 'timeline' && (
            <CaseTimeline documents={documents} />
          )}

          {activeTab === 'summary' && (
            <CaseSummary caseId={caseId} caseDetails={caseDetails} />
          )}

          {activeTab === 'contradictions' && (
            <ContradictionPanel caseId={caseId} />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView logs={auditLogs} caseNumber={caseDetails.case_number} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
