import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Activity, Search, Shield, Lock, Bot, ClipboardList } from 'lucide-react';
import { getCaseDetails, getCaseDocuments, getCaseAuditTrail, getComplaints } from '../services/api';
import DocumentUploader from './DocumentUploader';
import DocumentTable from './DocumentTable';
import AuditTrailView from './AuditTrailView';
import SmartSearch from './SmartSearch';
import CaseAssistant from './CaseAssistant';

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

          {activeTab === 'audit' && (
            <AuditTrailView logs={auditLogs} caseNumber={caseDetails.case_number} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
