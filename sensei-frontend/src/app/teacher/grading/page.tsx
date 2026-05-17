'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Sparkles, Brain, Clock, Users, CheckCircle2,
  AlertCircle, Loader2, GraduationCap, Send, BarChart3, BookOpen,
  Download, Eye
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Submission {
  student: string;
  submitted: string;
  aiScore: number;
  status: string;
  feedback?: string;
  flags?: { type: string }[];
}

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  status: 'draft' | 'active' | 'graded';
  submissions: number;
  total: number;
  createdAt: string;
  dueDate: string;
}

export default function GradingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', brief: '' });
  const [view, setView] = useState<'list' | 'results'>('list');

  useEffect(() => { fetch(); }, []);

  const fetch = () => {
    setLoading(true);
    api.get('/api/teacher/assessments')
      .then(r => setAssignments(r.data.assignments || r.data || []))
      .catch(() => setAssignments(mockAssignments()))
      .finally(() => setLoading(false));
  };

  const createAssignment = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      await api.post('/api/teacher/assessments', form);
      toast.success('Assignment created!');
      setShowCreate(false);
      setForm({ title: '', subject: '', dueDate: '', brief: '' });
      fetch();
    } catch { toast.error('Failed to create'); } finally { setCreating(false); }
  };

  const autoGrade = async (id: string) => {
    setGradingId(id);
    try {
      await api.post(`/api/teacher/assessments/${id}/grade`);
      toast.success('Grading complete!');
      fetch();
    } catch { toast.error('Grading failed'); } finally { setGradingId(null); }
  };

  const resultsMock: Submission[] = [
    { student: 'Rahul Verma',  submitted: '2024-11-20',  aiScore: 87, feedback: 'Clear understanding of concepts. Minor error in edge cases.', status: 'graded' },
    { student: 'Sneha Iyer',   submitted: '2024-11-20',  aiScore: 73,  feedback: 'Good approach but needs more practice on loops.', status: 'graded' },
    { student: 'Arjun Nair',   submitted: '2024-11-19',  aiScore: 54,  feedback: 'Several logic errors. Recommend revision.', status: 'graded', flags: [{ type: 'Logic Error' }] },
    { student: 'Priya Menon',  submitted: '2024-11-20',  aiScore: 91,  feedback: 'Excellent work!', status: 'graded' },
    { student: 'Dev Patel',    submitted: '2024-11-18',  aiScore: 0,   status: 'pending' },
  ];

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Reviewing assessments…</div>;

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)]">Assessments</h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">Create and manage teacher-created with AI-assisted grading</p>
        </div>
        <ComicButton variant="primary" icon={<Plus size={18} />} onClick={() => setShowCreate(true)}>New Assessment</ComicButton>
      </motion.div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {['list','results'].map(t => (
          <button key={t} onClick={() => setView(t as any)}
            className={`px-4 py-1.5 rounded-xl font-ui text-xs font-bold border-2 ${view === t ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'}`}>
            {t === 'list' ? 'My Assessments' : 'Results'}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        /* ── ASSIGNMENT CARDS ── */
        <div className="space-y-4">
          {assignments.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StickyCard color={['yellow','blue','green','purple','pink','orange'][i % 6] as any} className="!p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left: meta */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg text-[var(--text-primary)]">{a.title}</h3>
                      <span className="font-ui text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase">{a.subject}</span>
                      <span className={`font-ui text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${a.status === 'graded' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="font-body text-sm text-[var(--text-secondary)]">{(a as any).brief ?? 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-ui text-xs text-[var(--text-muted)]"><Clock size={11} className="inline mr-1" /> Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                      <span className="font-ui text-xs text-[var(--text-muted)]"><Users size={11} className="inline mr-1" /> {a.submissions || 0}/{a.total || 0} submitted</span>
                    </div>
                  </div>
                  {/* Right: actions */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => autoGrade(a._id)} disabled={gradingId === a._id}
                      className="px-5 py-2 rounded-xl bg-[var(--accent-purple)] text-white font-ui text-xs font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      {gradingId === a._id ? <Loader2 size={14} className="inline animate-spin" /> : <Sparkles size={14} className="inline mr-1" />}
                      Grade All
                    </button>
                    <button onClick={() => { setSelected(a); setView('results'); }}
                      className="px-4 py-2 rounded-xl bg-white border-2 border-[var(--border-card)] font-ui text-xs font-bold text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/5">
                      View Results
                    </button>
                  </div>
                </div>
              </StickyCard>
            </motion.div>
          ))}
          {assignments.length === 0 && (
            <StickyCard color="blue" className="text-center py-12">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-handwrite text-2xl text-[var(--text-muted)]">No assessments yet</p>
              <button onClick={() => setShowCreate(true)} className="mt-3 font-ui text-sm font-bold text-[var(--accent-purple)] underline">Create your first assessment</button>
            </StickyCard>
          )}
        </div>
      ) : (
        /* ── RESULTS VIEW ── */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {selected && (
            <div className="flex items-center gap-3">
              <button onClick={() => setView('list')} className="font-ui text-sm font-bold text-[var(--accent-purple)] hover:underline">← All Assessments</button>
              <span className="font-display text-2xl">Results: {selected.title}</span>
            </div>
          )}
          <StickyCard color="yellow" pinned className="!p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl">Score Distribution</h3>
                <p className="font-ui text-xs text-[var(--text-muted)]">Class of {resultsMock.length} students</p>
              </div>
              <ComicButton variant="secondary" size="sm" icon={<Download size={14} />}>Export CSV</ComicButton>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultsMock.filter(s => s.aiScore > 0).map(s => ({ name: s.student.slice(0, 8), score: s.aiScore }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'Nunito' }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StickyCard>

          <StickyCard color="blue" className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border-card)] flex items-center justify-between">
              <h3 className="font-display text-lg">Submissions</h3>
              <span className="font-ui text-xs font-bold text-[var(--text-muted)]">{resultsMock.length} students</span>
            </div>
            <div className="divide-y divide-[var(--border-card)]">
              {resultsMock.map((s, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/50 transition-colors">
                  <TeacherAvatar name={s.student} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{s.student}</span>
                      {s.flags?.map((f, fi) => <span key={fi} className="font-ui text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 flex items-center gap-1"><AlertCircle size={10} />{f.type}</span>)}
                    </div>
                    <p className="font-ui text-[11px] text-[var(--text-muted)]">Submitted {s.submitted}</p>
                    {s.feedback && <p className="font-body text-sm text-[var(--text-secondary)] mt-1">{s.feedback}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {s.aiScore > 0 ? (
                      <div>
                        <span className={`font-display text-2xl ${s.aiScore >= 80 ? 'text-green-600' : s.aiScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{s.aiScore}</span>
                        <span className="font-ui text-xs text-[var(--text-muted)]">%</span>
                      </div>
                    ) : (<span className="font-ui text-xs text-[var(--text-muted)]">Not graded</span>)}
                  </div>
                </div>
              ))}
            </div>
          </StickyCard>
        </motion.div>
      )}

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.92, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg sticky-card bg-[var(--sticky-yellow)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">New Assessment</h2>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-ui text-sm">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Unit 3 — Binary Trees Quiz"
                    className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
                      <option value="">Select…</option>
                      <option>Computer Science</option><option>Mathematics</option><option>Physics</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Instructions</label>
                  <textarea value={form.brief} onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
                    placeholder="Describe what students should submit…"
                    className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-sm outline-none focus:border-[var(--accent-purple)] h-20 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] hover:bg-white/50">
                    Cancel
                  </button>
                  <button onClick={createAssignment} disabled={creating}
                    className="flex-1 py-3 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5 disabled:opacity-50">
                    {creating ? 'Creating…' : 'Create Assessment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function mockAssignments(): Assignment[] {
  return [
    { _id: 'ap1', title: 'Binary Tree Traversal', subject: 'DS Algo', status: 'active', submissions: 34, total: 42, dueDate: '2024-12-01', createdAt: '2024-11-15' },
    { _id: 'ap2', title: 'SQL Normalisation',   subject: 'DBMS',   status: 'active', submissions: 22, total: 38, dueDate: '2024-11-28', createdAt: '2024-11-10' },
    { _id: 'ap3', title: 'React Hooks Quiz',   subject: 'Fullstack', status: 'graded', submissions: 40, total: 42, dueDate: '2024-11-20', createdAt: '2024-11-01' },
  ];
}
