import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, ShieldCheck, CheckCircle, Folder } from 'lucide-react';
import { uploadDocument } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentUploader({ caseId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length });
        await uploadDocument(caseId, files[i]);
      }
      setFiles([]);
      onUploadComplete();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Secure Batch Evidence Upload</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload digital evidence files for cryptographic hashing and classification.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#edf7f2] dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-[#1b4d3e] dark:text-emerald-400 text-xs font-bold">
          <ShieldCheck size={15} /> SHA-256 Active
        </div>
      </div>
      
      {files.length === 0 ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
          }`}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#edf7f2] dark:bg-emerald-950/60 text-[#1b4d3e] dark:text-emerald-400 flex items-center justify-center mb-3">
              <UploadCloud size={28} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
              Drag & drop multiple files here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              or click to <span className="text-[#1b4d3e] dark:text-emerald-400 font-semibold underline">browse</span> files
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4">
              Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, MP4, MOV, WAV, CSV <span className="mx-1">|</span> Max file size: 2 GB (per file)
            </p>
          </div>

          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143c30] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('file-upload').click();
            }}
          >
            <Folder size={16} />
            Browse Files
          </button>

          <input 
            id="file-upload"
            type="file" 
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFiles(prev => [...prev, ...Array.from(e.target.files)]);
              }
              e.target.value = null;
            }}
          />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-3 space-y-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                      <FileIcon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                      <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button 
                      onClick={() => removeFile(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                  {uploading && idx < uploadProgress.current - 1 && (
                    <CheckCircle className="text-emerald-500" size={16} />
                  )}
                  {uploading && idx === uploadProgress.current - 1 && (
                    <Loader2 className="animate-spin text-emerald-500" size={16} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {uploading ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} files...` : `${files.length} file(s) queued`}
              </span>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold" 
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-1.5 rounded-lg bg-[#1b4d3e] hover:bg-[#143c30] text-white font-bold disabled:opacity-50"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Processing...' : 'Upload Evidence'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
