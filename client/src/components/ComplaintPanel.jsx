import { useState, useEffect } from 'react';
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, User, FileText, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComplaints, createComplaint as createComplaintApi, reviewComplaint as reviewComplaintApi } from '../services/api';

export default function ComplaintPanel({ caseId, currentUser }) {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    complainantName: '',
    fatherName: '',
    contact: '',
    address: '',
    complaintText: ''
  });
  const [reviewingComplaint, setReviewingComplaint] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'FIR_FILED',
    remarks: '',
    rejectionReason: ''
  });

  const loadComplaints = async () => {
    try {
      const res = await getComplaints(caseId);
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [caseId]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComplaintApi(caseId, formData);
      setFormData({ complainantName: '', fatherName: '', contact: '', address: '', complaintText: '' });
      setShowForm(false);
      loadComplaints();
    } catch (err) {
      alert('Error creating complaint: ' + err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewComplaintApi(reviewingComplaint.id, reviewForm);
      setReviewingComplaint(null);
      setReviewForm({ status: 'FIR_FILED', remarks: '', rejectionReason: '' });
      loadComplaints();
    } catch (err) {
      alert('Error reviewing complaint: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <ClipboardList className="text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Complaint Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Victim Complaint to FIR Pipeline</p>
          </div>
        </div>
        {currentUser?.role === 'INVESTIGATING_OFFICER' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <Plus size={18} /> File New Complaint
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-6 rounded-2xl border border-border shadow-sm bg-card mb-6">
              <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">New Complaint Details</h3>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Complainant Name *</label>
                    <input 
                      required type="text" 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.complainantName} onChange={e => setFormData({...formData, complainantName: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Father's Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                    <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Complaint Text *</label>
                  <textarea 
                    required rows="4" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={formData.complaintText} onChange={e => setFormData({...formData, complaintText: e.target.value})} 
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button type="submit" className="btn-primary px-6 py-2 rounded-lg font-semibold">Submit Complaint</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {complaints.length === 0 ? (
          <div className="card p-12 text-center text-slate-500 dark:text-slate-400 rounded-2xl border border-dashed border-border">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No complaints recorded yet.</p>
          </div>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="card p-5 rounded-2xl border border-border shadow-sm bg-card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{c.complainantName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  {c.status === 'PENDING' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">PENDING</span>}
                  {c.status === 'FIR_FILED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">FIR FILED</span>}
                  {c.status === 'REJECTED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">REJECTED</span>}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.complaintText}</p>
              </div>
              {c.remarks && (
                <div className="mb-4 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">IO Remarks:</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2">{c.remarks}</span>
                </div>
              )}
              {c.rejectionReason && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                  <span className="font-semibold">Rejection Reason:</span> {c.rejectionReason}
                </div>
              )}
              {currentUser?.role === 'INVESTIGATING_OFFICER' && c.status === 'PENDING' && (
                <button 
                  onClick={() => setReviewingComplaint(c)}
                  className="btn-outline px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border-slate-300 dark:border-slate-700"
                >
                  <MessageSquare size={16} /> Review Complaint
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {reviewingComplaint && (
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
              className="card bg-card w-full max-w-md p-6 shadow-2xl rounded-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Review Complaint</h2>
                <button onClick={() => setReviewingComplaint(null)} className="text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" name="status" value="FIR_FILED" 
                      checked={reviewForm.status === 'FIR_FILED'} 
                      onChange={e => setReviewForm({...reviewForm, status: e.target.value})} 
                    />
                    <span className="font-semibold text-green-600 dark:text-green-400">Accept (File FIR)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" name="status" value="REJECTED" 
                      checked={reviewForm.status === 'REJECTED'} 
                      onChange={e => setReviewForm({...reviewForm, status: e.target.value})} 
                    />
                    <span className="font-semibold text-red-600 dark:text-red-400">Reject</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Remarks *</label>
                  <textarea 
                    required rows="3" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={reviewForm.remarks} onChange={e => setReviewForm({...reviewForm, remarks: e.target.value})} 
                  />
                </div>
                {reviewForm.status === 'REJECTED' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-red-600 dark:text-red-400">Rejection Reason *</label>
                    <textarea 
                      required rows="3" 
                      className="w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-700/50 bg-red-50 dark:bg-red-900/10 outline-none focus:ring-2 focus:ring-red-500" 
                      value={reviewForm.rejectionReason} onChange={e => setReviewForm({...reviewForm, rejectionReason: e.target.value})} 
                    />
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button type="submit" className="btn-primary px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
                    <CheckCircle size={18} /> Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
