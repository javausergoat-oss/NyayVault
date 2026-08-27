import { useState } from 'react';
import { Download, ShieldCheck, ShieldAlert, FileText, Loader2, Copy, X, Maximize2, ChevronDown } from 'lucide-react';
import { verifyDocument, getDownloadUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import RedactionModal from './RedactionModal';

export default function DocumentTable({ documents, onRefresh }) {
  const [verifying, setVerifying] = useState({});
  const [verifyResult, setVerifyResult] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(null);
  const [redactingDoc, setRedactingDoc] = useState(null);

  const [expandedFolders, setExpandedFolders] = useState({
    INVESTIGATION: true, JUDICIAL: true, PROSECUTION: true, DEFENSE: true, REGISTRAR: true, GENERAL: true
  });

  const FOLDER_CONFIG = {
    INVESTIGATION: { label: 'Investigation (IO/SHO)', icon: '🔍', color: 'blue' },
    JUDICIAL: { label: 'Judicial (Judge)', icon: '⚖️', color: 'amber' },
    PROSECUTION: { label: 'Prosecution (Victim\'s Lawyer)', icon: '🛡️', color: 'emerald' },
    DEFENSE: { label: 'Defense (Suspect\'s Lawyer)', icon: '⚔️', color: 'red' },
    REGISTRAR: { label: 'Registrar (Court Filings)', icon: '📝', color: 'purple' },
    GENERAL: { label: 'General', icon: '📁', color: 'slate' },
  };

  const groupedDocs = {};
  for (const doc of (documents || [])) {
    const cat = doc.document_category || 'GENERAL';
    if (!groupedDocs[cat]) groupedDocs[cat] = [];
    groupedDocs[cat].push(doc);
  }

  const toggleFolder = (cat) => {
    setExpandedFolders(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const openDocumentViewer = async (doc) => {
    setLoadingDoc(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { 
        headers: { 
          'x-user-id': localStorage.getItem('sih_active_user'),
          'Authorization': `Bearer ${localStorage.getItem('sih_token')}`
        }
      });
      const fullDoc = await res.json();
      setSelectedDoc(fullDoc.document);

      const fileRes = await fetch(getDownloadUrl(doc.id), {
        headers: { 
          'x-user-id': localStorage.getItem('sih_active_user'),
          'Authorization': `Bearer ${localStorage.getItem('sih_token')}`
        }
      });
      const blob = await fileRes.blob();
      setBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to load viewer:", err);
      alert("Error loading document.");
    } finally {
      setLoadingDoc(null);
    }
  };

  const closeViewer = () => {
    setSelectedDoc(null);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  };

  const handleVerify = async (docId) => {
    setVerifying(prev => ({ ...prev, [docId]: true }));
    try {
      const res = await verifyDocument(docId);
      setVerifyResult(prev => ({ ...prev, [docId]: res.verification }));
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setVerifying(prev => ({ ...prev, [docId]: false }));
      onRefresh();
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="card p-12 text-center text-slate-500 dark:text-slate-400 rounded-2xl border border-dashed border-border">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No evidence uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(FOLDER_CONFIG).map(([category, config]) => {
        const docs = groupedDocs[category];
        if (!docs || docs.length === 0) return null;
        
        const expanded = expandedFolders[category];
        
        return (
          <div key={category} className="card overflow-hidden rounded-2xl border border-border shadow-sm bg-card">
            <div 
              onClick={() => toggleFolder(category)}
              className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800/80 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{config.icon}</span>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{config.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">{docs.length}</span>
              </div>
              <ChevronDown className={`transition-transform ${expanded ? '' : '-rotate-90'}`} size={18} />
            </div>
            
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                          <th className="p-4 border-b border-border text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                          <th className="p-4 border-b border-border text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Status</th>
                          <th className="p-4 border-b border-border text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                          <th className="p-4 border-b border-border text-xs font-semibold text-slate-500 uppercase tracking-wider">Integrity / Hash</th>
                          <th className="p-4 border-b border-border text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {docs.map(doc => {
                          const isVerifying = verifying[doc.id];
                          const result = verifyResult[doc.id];
                          
                          return (
                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-4">
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {doc.filename}
                                </span>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">By {doc.uploaded_by_badge}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-2 items-start">
                                  <span className={`badge text-xs ${doc.document_type === 'UNKNOWN' ? 'badge-gray' : 'badge-blue'}`}>
                                    {doc.document_type || 'UNKNOWN'}
                                  </span>
                                  <span className={`badge text-[10px] ${doc.status === 'processed' ? 'badge-green' : doc.status === 'processing' ? 'badge-blue' : doc.status === 'needs_review' ? 'badge-red' : 'badge-gray'}`}>
                                    {doc.status}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {(doc.file_size / 1024).toFixed(1)} KB
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded w-max border border-border">
                                    <span className="w-24 truncate text-slate-600 dark:text-slate-400" title={doc.sha256_hash}>{doc.sha256_hash}</span>
                                    <button onClick={() => handleCopy(doc.sha256_hash)} className="hover:text-blue-500" title="Copy full hash"><Copy size={12} /></button>
                                  </div>
                                  {result ? (
                                    <span className={`flex items-center gap-1 text-xs font-bold ${result.status === 'VERIFIED_AUTHENTIC' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {result.status === 'VERIFIED_AUTHENTIC' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                      {result.status}
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={() => handleVerify(doc.id)}
                                      disabled={isVerifying}
                                      className="btn-outline text-xs py-1 px-2 rounded disabled:opacity-50 flex items-center gap-1 w-max border-slate-300 dark:border-slate-700"
                                    >
                                      {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                      Verify Integrity
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button 
                                  onClick={() => openDocumentViewer(doc)}
                                  disabled={loadingDoc === doc.id}
                                  className="btn-primary text-xs px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                  {loadingDoc === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Maximize2 size={14} />} 
                                  View & Intel
                                </button>
                                {!doc.is_redacted && (
                                  <button 
                                    onClick={() => setRedactingDoc(doc)}
                                    className="btn-outline text-xs px-3 py-2 rounded-lg font-semibold inline-flex items-center gap-2 shadow-sm border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/30"
                                  >
                                    <ShieldAlert size={14} /> Redact
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      
      <AnimatePresence>
        {selectedDoc && blobUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card bg-card w-full max-w-[95vw] h-[95vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-border"
            >
              <div className="flex justify-between items-center p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="text-blue-500" /> Integrated Document Viewer
                  </h2>
                  <span className="text-sm font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded">
                    {selectedDoc.filename}
                  </span>
                </div>
                <button onClick={closeViewer} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                {/* Left side: Document PDF Viewer */}
                <div className="border-r border-border bg-slate-200 dark:bg-slate-950 flex flex-col h-full relative">
                  <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm">
                    Original Source File
                  </div>
                  <iframe 
                    src={blobUrl}
                    className="w-full h-full border-none bg-white dark:bg-slate-800"
                    title={selectedDoc.filename}
                  />
                </div>

                {/* Right side: AI Intelligence */}
                <div className="p-6 overflow-y-auto flex flex-col h-full bg-slate-50 dark:bg-slate-900/20">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">AI Extraction & Metadata</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-border shadow-sm">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Classification</p>
                      <p className="text-base font-bold text-blue-600 dark:text-blue-400">{selectedDoc.document_type}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-border shadow-sm">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">AI Confidence</p>
                      <p className="text-base font-bold">{((selectedDoc.classification_confidence || 0) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-bold mb-3 border-b border-border pb-2 text-slate-700 dark:text-slate-300">Structured Data</h3>
                    {selectedDoc.metadata && Object.keys(selectedDoc.metadata).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedDoc.metadata).map(([k, v]) => (
                          <div key={k} className="border border-border p-3 rounded-lg bg-white dark:bg-slate-800/80 shadow-sm">
                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase truncate tracking-wider">{k}</p>
                            <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{v}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-500 italic">No specific metadata extracted.</p>}
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-sm font-bold mb-3 border-b border-border pb-2 text-slate-700 dark:text-slate-300">Raw OCR / Extracted Text</h3>
                    <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-border flex-1 overflow-y-auto shadow-inner">
                      <pre className="text-xs font-mono whitespace-pre-wrap word-break text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedDoc.extracted_text || 'No text extracted.'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {redactingDoc && (
          <RedactionModal 
            doc={redactingDoc} 
            onClose={() => setRedactingDoc(null)} 
            onComplete={() => {
              setRedactingDoc(null);
              onRefresh();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
