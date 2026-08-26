import { useState } from 'react';
import { Download, ShieldCheck, ShieldAlert, FileText, Loader2, Copy, X } from 'lucide-react';
import { verifyDocument, getDownloadUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentTable({ documents, onRefresh }) {
  const [verifying, setVerifying] = useState({});
  const [verifyResult, setVerifyResult] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);

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
    <div className="card overflow-x-auto rounded-2xl border border-border shadow-sm bg-card">
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
          {documents.map(doc => {
            const isVerifying = verifying[doc.id];
            const result = verifyResult[doc.id];
            
            return (
              <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <a href={`#doc-${doc.id}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {doc.filename}
                  </a>
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
                    onClick={async () => {
                      const res = await fetch(`/api/documents/${doc.id}`, { headers: { 'x-user-id': localStorage.getItem('sih_active_user') || 'usr-pol-042' }});
                      const fullDoc = await res.json();
                      setSelectedDoc(fullDoc.document);
                    }}
                    className="btn-outline text-xs px-3 py-1.5 rounded-lg border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-semibold inline-flex items-center gap-1"
                  >
                    <FileText size={14} /> AI Intel
                  </button>
                  <a 
                    href={getDownloadUrl(doc.id)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-primary text-xs px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1 shadow-sm"
                    onClick={(e) => {
                      setTimeout(onRefresh, 1000);
                    }}
                  >
                    <Download size={14} /> View
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card bg-card w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-border"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-blue-500" /> AI Intelligence Report
                </h2>
                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Classification</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedDoc.document_type}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-border">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">AI Confidence</p>
                    <p className="text-lg font-bold">{((selectedDoc.classification_confidence || 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Extracted Metadata</h3>
                  {selectedDoc.metadata && Object.keys(selectedDoc.metadata).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(selectedDoc.metadata).map(([k, v]) => (
                        <div key={k} className="border border-border p-3 rounded-lg bg-white dark:bg-slate-900">
                          <p className="text-xs text-slate-500 font-semibold mb-1 uppercase truncate">{k}</p>
                          <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{v}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted italic">No specific metadata extracted.</p>}
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Raw Extracted Text</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-border max-h-64 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap word-break text-slate-700 dark:text-slate-300">
                      {selectedDoc.extracted_text || 'No text extracted.'}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
