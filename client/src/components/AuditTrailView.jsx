import { Activity, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AuditTrailView({ logs, caseNumber = 'UNKNOWN-CASE' }) {
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Chain of Custody Audit Report', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Case Number: ${caseNumber}`, 14, 36);

      // Official Seal / Disclaimer
      doc.setFontSize(9);
      doc.setTextColor(185, 28, 28); // red-700
      doc.text('CONFIDENTIAL & COURT-ADMISSIBLE: This document contains a cryptographically secure audit trail.', 14, 46);

      // Table Data
      const tableColumn = ["Timestamp", "Action", "Officer / User", "IP Address", "Log ID"];
      const tableRows = [];

      logs.forEach(log => {
        const badge = log.badge_number || log.user_badge || 'SYSTEM';
        const role = log.user_role ? log.user_role.replace('_', ' ') : 'AUTOMATED';
        const rowData = [
          new Date(log.timestamp).toLocaleString(),
          log.action,
          `${badge} (${role})`,
          log.ip_address || 'Internal',
          log.id.split('-')[0]
        ];
        tableRows.push(rowData);
      });

      // Generate Table
      doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 52,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }, // slate-800
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] } // slate-50
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Page ${i} of ${pageCount} - SIH Evidence Vault System`,
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

      doc.save(`Audit_Report_${caseNumber}.pdf`);
    } catch (e) {
      console.error("PDF Generation Error:", e);
      alert("Failed to generate PDF: " + e.message);
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="card p-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-border rounded-2xl">
        <Activity size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No audit events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-8 rounded-2xl border border-border shadow-sm bg-card relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Activity className="text-emerald-500" /> Immutable Chain of Custody
        </h3>
        <button 
          onClick={generatePDF}
          className="btn-primary flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Download size={16} /> Export Official PDF
        </button>
      </div>
      
      <div className="flex flex-col gap-4 relative z-10">
        {logs.map((log, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={log.id} 
            className="flex items-start gap-4 p-4 border border-border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
              <Clock size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-bold text-slate-900 dark:text-slate-100">{log.action}</p>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Performed by <span className="font-semibold">{log.badge_number || log.user_badge || 'SYSTEM'} ({log.user_role ? log.user_role.replace('_', ' ') : 'AUTOMATED'})</span>
              </p>
              
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  IP: {log.ip_address}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  Log ID: {log.id.split('-')[0]}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
