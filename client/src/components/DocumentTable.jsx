import { useState } from 'react';
import { Download, ShieldCheck, ShieldAlert, FileText, Loader2, Copy, X, Maximize2, ChevronDown, FileSignature, Search, SlidersHorizontal } from 'lucide-react';
import jsPDF from 'jspdf';
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
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (err) {
      console.error("Failed to load viewer:", err);
      alert("Error loading document.");
    } finally {
      setLoadingDoc(null);
    }
  };

  const closeViewer = () => {
    setSelectedDoc(null);
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

  const handleGenerateBSA = (doc) => {
    const docDate = new Date(doc.uploaded_at).toLocaleString('en-IN');
    
    const docPdf = new jsPDF();
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(16);
    docPdf.text('CERTIFICATE UNDER SECTION 63', 105, 20, { align: 'center' });
    docPdf.setFontSize(12);
    docPdf.text('OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023', 105, 28, { align: 'center' });
    
    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(10);
    docPdf.text('This is to certify that the digital evidence detailed below has been produced by a computer', 20, 45);
    docPdf.text('during the period over which the computer was used regularly to store or process information', 20, 52);
    docPdf.text('for the purposes of any activities regularly carried on by the designated authority.', 20, 59);

    docPdf.setFont('helvetica', 'bold');
    docPdf.text('EVIDENCE DETAILS:', 20, 75);
    
    docPdf.setFont('helvetica', 'normal');
    const details = [
      `Case Number: ${doc.case_number || 'N/A'}`,
      `Document Name: ${doc.filename}`,
      `Document ID: ${doc.id}`,
      `File Size: ${(doc.file_size / 1024).toFixed(2)} KB`,
      `MIME Type: ${doc.mime_type}`,
      `Upload Timestamp: ${docDate}`
    ];
    
    details.forEach((line, i) => docPdf.text(line, 25, 85 + (i * 7)));

    docPdf.setFont('helvetica', 'bold');
    docPdf.text('CRYPTOGRAPHIC CHAIN OF CUSTODY:', 20, 135);
    docPdf.setFont('helvetica', 'normal');
    docPdf.text(`SHA-256 Hash Algorithm Applied at Source`, 25, 145);
    
    // Break hash into 2 lines if long
    const hash = doc.sha256_hash;
    docPdf.setFont('courier', 'normal');
    docPdf.text(`${hash.substring(0, 32)}`, 25, 155);
    docPdf.text(`${hash.substring(32)}`, 25, 162);
    
    docPdf.setFont('helvetica', 'normal');
    docPdf.text('DECLARATION:', 20, 185);
    docPdf.text('I hereby declare that to the best of my knowledge and belief, the computer output was', 20, 195);
    docPdf.text('produced during the regular course of activities, and the computer was operating properly', 20, 202);
    docPdf.text('so as not to affect the accuracy of the electronic record.', 20, 209);
    
    docPdf.setFont('helvetica', 'bold');
    docPdf.text('AUTHORIZED SIGNATORY:', 20, 240);
    docPdf.setFont('helvetica', 'normal');
    docPdf.text(`Name: ${doc.uploaded_by_name}`, 20, 250);
    docPdf.text(`Badge / ID: ${doc.uploaded_by_badge}`, 20, 257);
    docPdf.text(`Department: ${doc.uploaded_by_department}`, 20, 264);
    
    docPdf.text('_____________________________', 140, 257);
    docPdf.text('(Signature / Digital Seal)', 145, 264);

    docPdf.save(`Sec_63_BSA_${doc.filename}.pdf`);
  };

  return (
    <div className="space-y-4">
      {Object.entries(FOLDER_CONFIG).map(([category, config]) => {
        const rawDocs = groupedDocs[category] || [];
        const docs = rawDocs.filter(d => 
          !searchTerm || d.filename.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Hide folders entirely for IOs if it's not their folder, since they can't access them anyway
        const userRole = localStorage.getItem('sih_active_role');
        const isPolice = userRole === 'INVESTIGATING_OFFICER' || localStorage.getItem('sih_active_user')?.includes('pol');
        
        if (isPolice && category !== 'INVESTIGATION') {
           return null;
        }

        const expanded = expandedFolders[category];
        
        return (
          <div key={category} className="bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Top Category Toolbar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div 
                onClick={() => toggleFolder(category)}
                className="flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-lg bg-[#edf7f2] dark:bg-emerald-950/40 flex items-center justify-center text-[#1b4d3e] dark:text-emerald-400">
                  <Search size={16} />
                </div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{config.label}</span>
                <span className="text-[11px] w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center">
                  {docs.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Search in this folder..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 sm:w-64 bg-slate-50 dark:bg-slate-800/80 text-xs rounded-xl pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
                  />
                </div>
                <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <SlidersHorizontal size={15} />
                </button>
              </div>
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
                    <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                      <thead>
                        <tr className="bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-3.5 w-10 text-center">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 accent-[#1b4d3e]" />
                          </th>
                          <th className="p-3.5">DOCUMENT</th>
                          <th className="p-3.5">TYPE / STATUS</th>
                          <th className="p-3.5">SIZE</th>
                          <th className="p-3.5">INTEGRITY / HASH</th>
                          <th className="p-3.5 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {docs.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-16 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <FileText size={42} className="stroke-[1.25] text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                  No documents uploaded in this category folder.
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  Upload files to get started.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : docs.map(doc => {
                          const isVerifying = verifying[doc.id];
                          const result = verifyResult[doc.id];
                          
                          return (
                            <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5 text-center">
                                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 accent-[#1b4d3e]" />
                              </td>
                              <td className="p-3.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {doc.filename}
                                </span>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  By {doc.uploaded_by_name} ({doc.uploaded_by_badge})
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {doc.document_type || 'UNKNOWN'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    doc.status === 'processed' 
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3.5 text-slate-600 dark:text-slate-400">
                                {(doc.file_size / 1024).toFixed(1)} KB
                              </td>
                              <td className="p-3.5">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 font-mono bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded w-max text-[11px] border border-slate-200 dark:border-slate-700">
                                    <span className="w-24 truncate text-slate-600 dark:text-slate-400" title={doc.sha256_hash}>{doc.sha256_hash}</span>
                                    <button onClick={() => handleCopy(doc.sha256_hash)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" title="Copy full hash"><Copy size={11} /></button>
                                  </div>
                                  {result ? (
                                    <span className={`flex items-center gap-1 text-[11px] font-bold ${result.status === 'VERIFIED_AUTHENTIC' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                      {result.status === 'VERIFIED_AUTHENTIC' ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                                      {result.status}
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={() => handleVerify(doc.id)}
                                      disabled={isVerifying}
                                      className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 w-max"
                                    >
                                      {isVerifying ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                                      Verify Hash
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 text-right space-x-1.5">
                                <button 
                                  onClick={() => handleGenerateBSA(doc)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-[11px]"
                                >
                                  <FileSignature size={13} /> BSA Sec 63
                                </button>
                                <button 
                                  onClick={() => openDocumentViewer(doc)}
                                  disabled={loadingDoc === doc.id}
                                  className="px-3 py-1 rounded-lg bg-[#1b4d3e] hover:bg-[#143c30] text-white font-bold inline-flex items-center gap-1 text-[11px] disabled:opacity-50 transition-colors"
                                >
                                  {loadingDoc === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Maximize2 size={13} />} 
                                  View
                                </button>
                                {!doc.is_redacted && (
                                  <button 
                                    onClick={() => setRedactingDoc(doc)}
                                    className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <ShieldAlert size={13} /> Redact
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
        {selectedDoc && (
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
                {/* Left side: Document Text Viewer */}
                <div className="border-r border-border bg-gray-50 dark:bg-slate-950 flex flex-col h-full relative overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-border text-xs text-slate-500 font-mono">
                    <FileText size={12} />
                    <span>{selectedDoc.filename}</span>
                    <span className="ml-auto text-slate-400">{selectedDoc.document_type}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    {selectedDoc.extracted_text ? (
                      <div className="max-w-2xl mx-auto">
                        {/* Document header */}
                        <div className="text-center mb-8 pb-6 border-b-2 border-slate-200 dark:border-slate-700">
                          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                            <FileText size={10} />
                            {selectedDoc.document_type || 'Document'}
                          </div>
                          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedDoc.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}</h2>
                        </div>
                        {/* Document body — render each line */}
                        <div className="font-mono text-sm leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                          {selectedDoc.extracted_text}
                        </div>
                        {/* Footer watermark */}
                        <div className="mt-10 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 text-center">
                          <p className="text-[10px] text-slate-400 tracking-widest uppercase">SIH26190 — Secure Nyay Vault · Extracted via AI OCR · Case: {selectedDoc.case_id}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <FileText size={48} className="mb-4 opacity-30" />
                        <p className="text-sm font-medium">No text content extracted</p>
                        <p className="text-xs mt-1">AI processing may still be pending</p>
                      </div>
                    )}
                  </div>
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

                  <div className="mt-2">
                    <h3 className="text-sm font-bold mb-3 border-b border-border pb-2 text-slate-700 dark:text-slate-300">Raw OCR / Extracted Text</h3>
                    <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-border shadow-inner">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-words text-slate-600 dark:text-slate-400 leading-relaxed">
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
