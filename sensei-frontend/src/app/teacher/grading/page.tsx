'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Brain, Clock, Users, X, 
  ChevronRight, Sparkles, AlertCircle, CheckCircle2 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PaperSheet from '@/components/teacher/PaperSheet';
import type { Assignment } from '@/types';

export default function GradingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [grading, setGrading] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ title: '', brief: '', subject: '', classId: '', dueDate: '' });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    api.get('/api/assignment/list')
      .then(({ data }) => setAssignments(data.assignments || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const createAssignment = async () => {
    if (!form.title || !form.brief) { toast.error('Title and brief are required'); return; }
    setCreating(true);
    try {
      await api.post('/api/assignment/create', form);
      toast.success('Assignment created!');
      setShowCreate(false);
      setForm({ title: '', brief: '', subject: '', classId: '', dueDate: '' });
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const gradeAssignment = async (id: string) => {
    setGrading(id);
    try {
      await api.post(`/api/assignment/${id}/grade`);
      toast.success('AI grading complete!');
      fetchAssignments();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Grading failed');
    } finally {
      setGrading(null);
    }
  };

  const viewResults = async (assignment: Assignment) => {
    try {
      const { data } = await api.get(`/api/assignment/${assignment._id}/results`);
      setSelectedAssignment({ ...assignment, submissions: data.submissions || data || [] });
    } catch {
      toast.error('Failed to load results');
    }
  };

  if (loading && assignments.length === 0) return <div className="p-8 text-center handwriting text-2xl">Reviewing assignment records...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">AI Assessments</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Create assignments and leverage AI for rapid grading</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={20} /> New Assignment
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 gap-6">
        {assignments.length === 0 ? (
          <PaperSheet className="text-center py-20">
             <FileText size={64} className="mx-auto text-gray-200 mb-4" />
             <h2 className="text-2xl font-bold text-gray-800">No active assignments</h2>
             <p className="text-gray-500 mb-8 max-w-sm mx-auto">Upload your first assignment to begin AI-assisted grading and feedback.</p>
             <button onClick={() => setShowCreate(true)} className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-all">
                Create First Assignment
             </button>
          </PaperSheet>
        ) : (
          assignments.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PaperSheet className="hover:border-purple-300 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                         <FileText size={20} />
                       </div>
                       <div>
                         <h3 className="text-xl font-bold text-gray-800">{a.title}</h3>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{a.subject || 'GENERAL'}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              a.status === 'graded' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {a.status || 'DRAFT'}
                            </span>
                         </div>
                       </div>
                    </div>
                    <p className="handwriting text-gray-500 text-lg mb-4 line-clamp-2">{a.brief}</p>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                          <Clock size={14} />
                          <span>DUE: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'NO DEADLINE'}</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                          <Users size={14} />
                          <span>{a.submissions?.length || 0} SUBMISSIONS</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => gradeAssignment(a._id)}
                      disabled={grading === a._id}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-100 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {grading === a._id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      AI Grade All
                    </button>
                    <button 
                      onClick={() => viewResults(a)}
                      className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              </PaperSheet>
            </motion.div>
          ))
        )}
      </div>

      {}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <PaperSheet title="NEW ASSIGNMENT">
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assignment Title</label>
                     <input 
                       value={form.title}
                       onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                       placeholder="e.g. Final Project: Web Architecture" 
                       className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-xl transition-all"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brief / Instructions</label>
                     <textarea 
                       value={form.brief}
                       onChange={e => setForm(p => ({ ...p, brief: e.target.value }))}
                       placeholder="Detail the expectations for this assessment..." 
                       className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-lg h-32 resize-none transition-all"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                        <input 
                          value={form.subject}
                          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                          placeholder="e.g. Computer Science" 
                          className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2 px-4 focus:border-b-purple-500 outline-none handwriting text-lg transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                        <input 
                          type="date"
                          value={form.dueDate}
                          onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                          className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2 px-4 focus:border-b-purple-500 outline-none font-bold text-gray-600 transition-all"
                        />
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setShowCreate(false)}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={createAssignment}
                        disabled={creating}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {creating ? 'Creating...' : 'Distribute Assignment'}
                      </button>
                   </div>
                </div>
              </PaperSheet>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              <PaperSheet title={`RESULTS: ${selectedAssignment.title.toUpperCase()}`} className="flex flex-col h-full !p-0">
                 <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100">
                    <div>
                       <h2 className="text-2xl font-bold text-gray-800">{selectedAssignment.title}</h2>
                       <p className="handwriting text-gray-500 text-lg">Detailed feedback and scoring</p>
                    </div>
                    <button onClick={() => setSelectedAssignment(null)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {(!selectedAssignment.submissions || selectedAssignment.submissions.length === 0) ? (
                      <div className="py-20 text-center text-gray-400 italic">No submissions found for this assignment.</div>
                    ) : (
                      selectedAssignment.submissions.map((sub, i) => (
                        <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:border-purple-200 transition-all">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-purple-600 font-bold">
                                    {typeof sub.studentId === 'object' ? sub.studentId.name?.charAt(0) : 'S'}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-800">
                                       {typeof sub.studentId === 'object' ? sub.studentId.name : `Student ${i + 1}`}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold">SUBMITTED ON: {new Date().toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">AI SCORE</span>
                                 <span className={`text-2xl font-black ${
                                   sub.aiScore >= 80 ? 'text-green-500' : sub.aiScore >= 50 ? 'text-orange-500' : 'text-red-500'
                                 }`}>
                                    {sub.aiScore || sub.grade || 0}%
                                 </span>
                              </div>
                           </div>
                           
                           {sub.feedback && (
                             <div className="bg-white p-4 rounded-xl border border-dashed border-gray-200 mb-4">
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-2">AI FEEDBACK</span>
                                <p className="handwriting text-gray-600 text-lg">{sub.feedback}</p>
                             </div>
                           )}

                           {sub.flags && sub.flags.length > 0 && (
                             <div className="flex flex-wrap gap-2">
                                {sub.flags.map((flag, fi) => (
                                  <span key={fi} className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold border border-red-100 flex items-center gap-1.5">
                                     <AlertCircle size={12} />
                                     {flag.type.toUpperCase()}
                                  </span>
                                ))}
                             </div>
                           )}
                        </div>
                      ))
                    )}
                 </div>
                 
                 <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button className="px-8 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-100">
                       Release All Grades
                    </button>
                 </div>
              </PaperSheet>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
