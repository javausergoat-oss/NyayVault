import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Sparkles, Download, Loader2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generateCaseSummary } from '../services/api';

export default function CaseSummary({ caseId, caseDetails }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateCaseSummary(caseId);
      setSummary(res.summary);
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.text('Executive Case Summary', 14, 22);
    
    // Meta info
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Case No: ${caseDetails.case_number}`, 14, 32);
    doc.text(`Title: ${caseDetails.title}`, 14, 38);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 44);
    
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(14, 48, 196, 48);

    // AI Content (Basic parsing of markdown for jsPDF)
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // Slate-900
    
    const lines = doc.splitTextToSize(summary.replace(/\*\*/g, ''), 180);
    let y = 56;
    
    for (let i = 0; i < lines.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines[i], 14, y);
      y += 7;
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('Generated securely by SIH Evidence Vault AI', 14, 290);
    
    doc.save(`${caseDetails.case_number}_AI_Summary.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-4 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 rounded-2xl mb-6 inline-flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI Executive Summary</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Instantly synthesize all evidence, complaints, and reports into a single, cohesive timeline and summary. Perfect for Judges reviewing a case before trial.
          </p>

          {!summary && !loading && (
            <button
              onClick={handleGenerate}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <FileBarChart size={22} />
              Generate Report Now
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-semibold animate-pulse">Reading case files & synthesizing evidence...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-2 text-rose-500 bg-rose-500/10 px-6 py-4 rounded-xl border border-rose-500/20">
              <AlertCircle size={20} />
              <p className="font-semibold">{error}</p>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileBarChart className="text-indigo-500" />
              Generated Case Brief
            </h3>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              <Download size={16} /> Export PDF
            </button>
          </div>
          <div className="p-8 prose prose-slate dark:prose-invert max-w-none">
            {summary.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
