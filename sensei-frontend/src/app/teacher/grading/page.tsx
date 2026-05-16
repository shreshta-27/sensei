'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, X, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/teacher/PageTransition';
import GlowCard from '@/components/teacher/GlowCard';
import EmptyState from '@/components/teacher/EmptyState';
import { TableSkeleton } from '@/components/teacher/LoadingSkeleton';
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

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-faculty-heading text-2xl font-bold text-faculty-text">AI Grading</h1>
            <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Create assignments and grade with AI</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="faculty-btn flex items-center gap-2">
            <Plus size={16} /> Create Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <EmptyState icon={FileText} title="No Assignments" description="Create your first assignment to get started with AI-powered grading." action={{ label: 'Create Assignment', onClick: () => setShowCreate(true) }} />
        ) : (
          <div className="space-y-3">
            {assignments.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="faculty-card p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text truncate">{a.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        a.status === 'graded' ? 'bg-faculty-success/10 text-faculty-success' :
                        a.status === 'submitted' ? 'bg-faculty-warning/10 text-faculty-warning' :
                        'bg-faculty-text-secondary/10 text-faculty-text-secondary'
                      }`}>
                        {a.status || 'open'}
                      </span>
                    </div>
                    <p className="font-faculty text-xs text-faculty-text-secondary line-clamp-1">{a.brief}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-faculty text-xs text-faculty-text-secondary flex items-center gap-1">
                        <Clock size={11} /> Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="font-faculty text-xs text-faculty-text-secondary">
                        {a.submissions?.length || 0} submissions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => gradeAssignment(a._id)}
                      disabled={grading === a._id}
                      className="faculty-btn text-xs px-3 py-2 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {grading === a._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Grade AI
                    </button>
                    <button onClick={() => viewResults(a)} className="faculty-btn-ghost text-xs px-3 py-2">
                      Results
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-faculty-surface border border-faculty-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-faculty-heading text-lg font-bold text-faculty-text">Create Assignment</h2>
                  <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Title</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="faculty-input w-full" placeholder="Assignment title" />
                  </div>
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Brief / Description</label>
                    <textarea value={form.brief} onChange={e => setForm(p => ({ ...p, brief: e.target.value }))} className="faculty-input w-full h-24 resize-none" placeholder="Describe the assignment..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Subject</label>
                      <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="faculty-input w-full" placeholder="Subject" />
                    </div>
                    <div>
                      <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Due Date</label>
                      <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="faculty-input w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Class ID</label>
                    <input value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} className="faculty-input w-full" placeholder="Class ID" />
                  </div>
                  <button onClick={createAssignment} disabled={creating} className="faculty-btn w-full flex items-center justify-center gap-2">
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {creating ? 'Creating...' : 'Create Assignment'}
                  </button>
                </div>
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
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedAssignment(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[80vh] overflow-y-auto faculty-scrollbar bg-faculty-surface border border-faculty-border rounded-2xl"
              >
                <div className="sticky top-0 bg-faculty-surface border-b border-faculty-border p-4 flex items-center justify-between z-10">
                  <h2 className="font-faculty-heading text-lg font-bold text-faculty-text">Results: {selectedAssignment.title}</h2>
                  <button onClick={() => setSelectedAssignment(null)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {(!selectedAssignment.submissions || selectedAssignment.submissions.length === 0) ? (
                    <p className="font-faculty text-sm text-faculty-text-secondary text-center py-8">No submissions yet.</p>
                  ) : (
                    selectedAssignment.submissions.map((sub, i) => (
                      <div key={i} className="p-3 rounded-lg bg-faculty-bg/50 border border-faculty-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-faculty text-sm text-faculty-text">
                            {typeof sub.studentId === 'object' ? sub.studentId.name : `Student ${i + 1}`}
                          </span>
                          <span className="font-faculty-data text-sm font-bold" style={{ color: sub.aiScore >= 70 ? 'var(--f-success)' : sub.aiScore >= 50 ? 'var(--f-warning)' : 'var(--f-danger)' }}>
                            {sub.aiScore || sub.grade || 0}%
                          </span>
                        </div>
                        {sub.feedback && <p className="font-faculty text-xs text-faculty-text-secondary">{sub.feedback}</p>}
                        {sub.flags && sub.flags.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {sub.flags.map((f, fi) => (
                              <span key={fi} className="px-1.5 py-0.5 rounded text-[9px] bg-faculty-danger/10 text-faculty-danger flex items-center gap-1">
                                <AlertCircle size={9} /> {f.type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
