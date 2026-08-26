import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, ShieldCheck } from 'lucide-react';
import { uploadDocument } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentUploader({ caseId, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(caseId, file);
      setFile(null);
      onUploadComplete();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-8 bg-card border border-border shadow-lg rounded-2xl relative overflow-hidden group">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Upload</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload digital evidence for AI extraction and secure hashing.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <ShieldCheck size={14} /> SHA-256 Active
        </div>
      </div>
      
      {!file ? (
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
            Drag & drop evidence here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            or click to browse from your device
          </p>
          <input 
            id="file-upload"
            type="file" 
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border border-border rounded-xl p-6 bg-slate-50 dark:bg-slate-800/50 relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileIcon size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                className="btn-outline px-6 py-2 rounded-xl font-medium disabled:opacity-50" 
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-md shadow-blue-500/20 disabled:opacity-70"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} /> Confirm Upload
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
