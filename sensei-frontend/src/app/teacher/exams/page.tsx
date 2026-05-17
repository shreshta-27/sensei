'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FileText, Plus, Calendar, Clock, Users, CheckCircle, XCircle,
  AlertTriangle, Send, GraduationCap, Building2, BarChart3,
  X, Zap, Eye, Edit2, ChevronDown, Loader2, Filter, ArrowRight
} from 'lucide-react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import RiskBadge from '@/components/faculty/RiskBadge';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type TabKey = 'schedule' | 'results' | 'analytics';

type Exam = {
  _id: string;
  title: string;
  className?: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  totalMarks: number;
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed';
  submissions?: number;
  totalStudents?: number;
  avgScore?: number;
};

export default function ExamsPage() {
  const router = useRouter();
  const { classId: paramClassId } = useParams();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('schedule');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', classId: '', subject: '', date: '', time: '', duration: '2 hrs', maxMarks: '100' });
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const classId = (paramClassId as string) || form.classId;

  useEffect(() => {
    if (classId) {
      api.get(`/api/exams/class/${classId}`)
        .then(r => setExams(r.data.exams || r.data || []))
        .catch(() => setExams(mockExams))
        .finally(() => setLoading(false));
    } else {
      api.get('/api/teacher/exams')
        .then(r => setExams(r.data.exams || r.data || []))
        .catch(() => setExams(mockExams))
        .finally(() => setLoading(false));
    }
  }, [classId]);

  const scheduleExam = async () => {
    if (!form.title || !form.subject || !form.date || !form.time) { toast.error('Fill all required fields'); return; }
    try {
      await api.post('/api/teacher/exams/schedule', { ...form, classId });
      toast.success('Exam scheduled!');
      setShowModal(false);
      setForm({ title: '', classId: '', subject: '', date: '', time: '', duration: '2 hrs', maxMarks: '100' });
    } catch { toast.error('Failed to schedule'); }
  };

  const publishExam = async (id: string) => {
    try {
      await api.patch(`/api/teacher/exams/${id}/publish`);
      setExams(prev => prev.map(e => e._id === id ? { ...e, status: 'scheduled' } : e));
      toast.success('Exam published!');
    } catch { toast.error('Failed to publish'); }
  };

  const filteredExams = statusFilter === 'all' ? exams : exams.filter(e => e.status === statusFilter);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'schedule',  label: 'Schedule' },
    { key: 'results',   label: 'Results' },
    { key: 'analytics', label: 'Analytics' },
  ];

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Loading exams…</div>;

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={34} className="text-[var(--accent-purple)]" /> Exams & Assessments
          </h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">Schedule exams, publish, and review results</p>
        </div>
        <div className="flex gap-2">
          <select value={classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
            className="bg-white border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
            <option value="">All Classes</option>
            {mockClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ComicButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowModal(true)}>New Exam</ComicButton>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StickyCard color="blue"><p className="font-display text-3xl text-[var(--text-primary)]">{exams.length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Exams</p></StickyCard>
        <StickyCard color="yellow"><p className="font-display text-3xl text-[var(--text-primary)]">{exams.filter(e => e.status === 'scheduled' || e.status === 'ongoing').length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Scheduled</p></StickyCard>
        <StickyCard color="green"><p className="font-display text-3xl text-[var(--text-primary)]">{exams.filter(e => e.status === 'completed').length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Completed</p></StickyCard>
        <StickyCard color="pink"><p className="font-display text-3xl text-[var(--text-primary)]">{exams.filter(e => e.status === 'draft').length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Drafts</p></StickyCard>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-xl font-ui text-sm font-bold border-2 transition-all ${
              activeTab === t.key ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'
            }`}>{t.label}</button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          {['all','draft','scheduled','completed'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-2 py-1 rounded-full font-ui text-[10px] font-bold border transition-all ${statusFilter === f ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)]' : 'border-[var(--border-card)] text-[var(--text-muted)]'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Schedule Tab ── */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {filteredExams.map((exam, i) => {
            const statusCfg: Record<string, { bg: string; text: string; label: string }> = {
              draft:     { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Draft' },
              scheduled: { bg: 'bg-blue-50',   text: 'text-blue-700', label: 'Scheduled' },
              ongoing:   { bg: 'bg-amber-50',  text: 'text-amber-700', label: 'Ongoing' },
              completed: { bg: 'bg-green-50',  text: 'text-green-700', label: 'Completed' },
            };
            const sc = statusCfg[exam.status];
            return (
              <motion.div key={exam._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <StickyCard color={i % 2 === 0 ? 'yellow' : 'blue'} className="!p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg text-[var(--text-primary)]">{exam.title}</h3>
                        <span className={`font-ui text-[10px] font-bold px-2.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><Building2 size={12} />{exam.className || 'All Classes'}</span>
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><FileText size={12} />{exam.subject}</span>
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><Calendar size={12} />{exam.date}</span>
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><Clock size={12} />{exam.time} · {exam.duration}</span>
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><GraduationCap size={12} />{exam.totalMarks} marks</span>
                        {exam.submissions !== undefined && (
                          <span className="flex items-center gap-1 font-ui text-[11px] font-bold text-[var(--accent-purple)]"><Users size={11} />{exam.submissions}/{exam.totalStudents || 0}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {exam.status === 'draft' && (
                        <button onClick={() => publishExam(exam._id)}
                          className="px-4 py-2 rounded-xl font-ui text-xs font-bold bg-white border-2 border-[var(--border-card)] text-[var(--accent-purple)] hover:border-[var(--accent-purple)] transition">
                          Publish
                        </button>
                      )}
                      {exam.status === 'completed' && (
                        <button onClick={() => { setSelectedExam(exam); setActiveTab('results'); }}
                          className="px-4 py-2 rounded-xl font-ui text-xs font-bold bg-white border-2 border-[var(--border-card)] text-[var(--accent-purple)] hover:border-[var(--accent-purple)] transition">
                          <Eye size={13} className="inline mr-1" />Results
                        </button>
                      )}
                    </div>
                  </div>
                </StickyCard>
              </motion.div>
            );
          })}
          {filteredExams.length === 0 && (
            <StickyCard color="yellow" className="text-center py-12"><FileText size={36} className="mx-auto opacity-30 mb-2" /><p className="font-handwrite text-2xl text-[var(--text-muted)]">No exams found</p></StickyCard>
          )}
        </div>
      )}

      {/* ── Results Tab ── */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {exams.filter(e => e.status === 'completed').map((exam, i) => {
            const dist = mockScoreDistribution(exam._id);
            return (
              <motion.div key={exam._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <StickyCard color="green" pinned className="!p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-xl">{exam.title}</h3>
                      <p className="font-ui text-xs text-[var(--text-muted)]">{exam.className} · {exam.subject}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-[var(--accent-green)]">{exam.avgScore?.toFixed(1) || '—'}</span>
                      <span className="font-ui text-xs text-[var(--text-muted)]">avg / {exam.totalMarks}</span>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dist}>
                        <XAxis dataKey="range" tick={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', fill: '#A8A29E' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#A8A29E' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </StickyCard>
              </motion.div>
            );
          })}
          {exams.filter(e => e.status === 'completed').length === 0 && (
            <StickyCard color="green" className="text-center py-12"><CheckCircle size={36} className="mx-auto opacity-30 mb-2" /><p className="font-handwrite text-2xl text-[var(--text-muted)]">No completed exams yet</p></StickyCard>
          )}
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="purple" pinned className="!p-6">
            <h3 className="font-display text-xl mb-3">Class Performance Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreTrend}>
                  <XAxis dataKey="exam" tick={{ fontSize: 11, fontFamily: 'Nunito', fill: '#A8A29E' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#A8A29E' }} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StickyCard>
          <StickyCard color="blue" className="!p-5">
            <h3 className="font-display text-xl mb-3">Exam Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam, i) => (
                <div key={exam._id} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-[var(--border-card)]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${exam.status === 'completed' ? 'bg-green-50' : exam.status === 'ongoing' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    {exam.status === 'completed' ? '✅' : exam.status === 'ongoing' ? '⚡' : '📅'}
                  </div>
                  <div>
                    <p className="font-ui text-sm font-bold text-[var(--text-primary)]">{exam.title}</p>
                    <p className="font-ui text-[11px] text-[var(--text-muted)]">{exam.subject} · {exam.date} · Avg: {exam.avgScore?.toFixed(1) ?? '—'}</p>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <p className="text-center font-handwrite text-xl text-[var(--text-muted)] py-4">No exams scheduled</p>}
            </div>
          </StickyCard>
        </motion.div>
      )}

      {/* ── Schedule Exam Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ scale: 0.92, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg sticky-card bg-[var(--sticky-blue)]" >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">Schedule New Exam</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-ui text-sm text-red-400"><X size={14} /></button>
              </div>
              <div className="space-y-4 bg-white/60 p-5 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Exam Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mid-semester Test"
                      className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Class</label>
                    <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
                      <option value="">Select class…</option>
                      {mockClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Subject *</label>
                    <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. OS"
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Time *</label>
                    <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Duration</label>
                    <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
                      <option>1 hr</option><option>2 hrs</option><option>3 hrs</option><option>4 hrs</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Max Marks</label>
                    <input type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] hover:bg-white/50">Cancel</button>
                  <button onClick={() => { scheduleExam(); toast.success('Draft saved — publish when ready'); setShowModal(false); }} className="flex-1 py-3 rounded-xl bg-gray-100 text-[var(--text-secondary)] font-ui font-bold border-2 border-[var(--border-card)] hover:bg-gray-200">
                    <FileText size={15} className="inline mr-1" />Save Draft
                  </button>
                  <button onClick={scheduleExam} className="flex-1 py-3 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5">
                    <Zap size={15} className="inline mr-1" />Schedule
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

/* ── Mock Data ── */
const mockExams: Exam[] = [
  { _id: 'ex1', title: 'Internal Assessment — FS Sec B', className: 'Fullstack - Sec B', subject: 'HTTP & REST APIs', date: '2024-05-18', time: '09:00 AM', duration: '2 hrs', totalMarks: 50, status: 'scheduled', submissions: 38, totalStudents: 42 },
  { _id: 'ex2', title: 'Mid-sem — DBMS', className: 'DBMS - Sec A', subject: 'Joins, Normalisation', date: '2024-05-22', time: '10:00 AM', duration: '3 hrs', totalMarks: 100, status: 'scheduled', submissions: 30, totalStudents: 38 },
  { _id: 'ex3', title: 'Binary Trees Quiz', className: 'DS Algorithms', subject: 'Trees', date: '2024-05-14', time: '11:00 AM', duration: '1 hr', totalMarks: 20, status: 'completed', submissions: 34, totalStudents: 34, avgScore: 72.4 },
  { _id: 'ex4', title: 'OS Quiz p3', className: 'Operating Systems', subject: 'Memory Mgmt', date: '2024-05-10', time: '10:00 AM', duration: '1 hr', totalMarks: 20, status: 'completed', submissions: 27, totalStudents: 30, avgScore: 68.1 },
  { _id: 'ex5', title: 'ML Basics Unit Test', className: 'ML Basics', subject: 'Supervised Learning', date: '2024-05-26', time: '09:00 AM', duration: '2 hrs', totalMarks: 50, status: 'draft' },
];

const scoreTrend = [
  { exam: 'Quiz 1', avg: 74 }, { exam: 'Quiz 2', avg: 78 }, { exam: 'Quiz 3', avg: 72 }, { exam: 'Mid-Sem', avg: 81 }, { exam: 'Quiz 4', avg: 85 },
];

function mockScoreDistribution(_id: string) {
  const base = Math.random() * 30 + 50;
  return [
    { range: '0-20',  count: Math.floor(Math.random() * 4) },
    { range: '21-40', count: Math.floor(Math.random() * 6) },
    { range: '41-60', count: Math.floor(Math.random() * 8) + 3 },
    { range: '61-80', count: Math.floor(Math.random() * 10) + 5 },
    { range: '81-100',count: Math.floor(Math.random() * 8) + 2 },
  ];
}

const mockClasses = [
  { id: 'c1', name: 'Fullstack - Sec B' },
  { id: 'c2', name: 'DBMS - Sec A' },
  { id: 'c3', name: 'DS Algorithms' },
  { id: 'c4', name: 'Operating Systems' },
  { id: 'c5', name: 'Computer Networks' },
  { id: 'c6', name: 'ML Basics' },
];
