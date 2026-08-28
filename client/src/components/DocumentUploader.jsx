import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
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
      // Upload files sequentially to reuse existing endpoint and show progress
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
    <div className="card p-8 bg-card border border-border shadow-lg rounded-2xl relative overflow-hidden group">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Batch Upload</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload multiple evidence files for AI extraction and secure hashing.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <ShieldCheck size={14} /> SHA-256 Active
        </div>
      </div>
      
      {files.length === 0 ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative z-10 border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner' 
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
          onClick={() => document.getElementById('file-upload').click()}
        >
          {dragActive && (
            <motion.div 
              layoutId="glow"
              className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-2xl"
            />
          )}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            <UploadCloud size={32} />
          </motion.div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
            Drag & drop multiple files here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            or click to browse from your device
          </p>
          <input 
            id="file-upload"
            type="file" 
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFiles(prev => [...prev, ...Array.from(e.target.files)]);
              }
              e.target.value = null; // reset so same file can be selected again
            }}
          />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border border-border rounded-xl bg-slate-50 dark:bg-slate-800/50 relative z-10 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-4 space-y-3">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <FileIcon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button 
                      onClick={() => removeFile(idx)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 rounded-full text-slate-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {uploading && idx < uploadProgress.current - 1 && (
                    <CheckCircle className="text-emerald-500" size={18} />
                  )}
                  {uploading && idx === uploadProgress.current - 1 && (
                    <Loader2 className="animate-spin text-blue-500" size={18} />
                  )}
                </div>
              ))}
            </div>

            {/* Upload More Button (if not uploading) */}
            {!uploading && (
              <div className="px-4 pb-4">
                <button 
                  onClick={() => document.getElementById('file-upload-more').click()}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  + Add more files
                </button>
                <input 
                  id="file-upload-more"
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
            )}
            
            <div className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-800 border-t border-border">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {uploading ? (
                  <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Loader2 size={16} className="animate-spin" />
                    Uploading {uploadProgress.current} of {uploadProgress.total} files...
                  </span>
                ) : (
                  <span>{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  className="btn-outline px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50" 
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Cancel All
                </button>
                <button 
                  className="btn-primary flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-70"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    'Processing...'
                  ) : (
                    <>
                      <UploadCloud size={16} /> Confirm Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
