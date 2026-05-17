'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, GraduationCap, Users, BookOpen, Plus, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import KPICard from '@/components/faculty/KPICard';
import RiskBadge from '@/components/faculty/RiskBadge';

const colorWheel = ['yellow', 'blue', 'green', 'purple', 'pink', 'orange'] as const;

interface ClassItem {
  _id: string;
  name: string;
  semester: number;
  department: string;
  studentIds?: string[];
  subjects?: string[];
  subject?: string;
  studentCount?: number;
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', semester: '', subjects: '' });
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/teacher/classes')
      .then(r => setClasses((r.data as any).classes || (r.data as any) || []))
      .catch(() => setClasses(mockClasses()))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.department.trim() || !form.semester.trim()) {
      toast.error('Name, Department and Semester are required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/api/teacher/classes', {
        name: form.name.trim(),
        department: form.department.trim(),
        semester: parseInt(form.semester, 10),
        subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      toast.success('Class created!');
      setShowCreate(false);
      setForm({ name: '', department: '', semester: '', subjects: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Class ID copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = classes.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Assembling class files…</div>;
  }

  return (
    <div className="page-mobile-pad space-y-6">
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)]">My Classes</h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">{classes.length} Active Classes this semester</p>
        </div>
        <ComicButton variant="primary" onClick={() => setShowCreate(true)} icon={<Plus size={18} />}>
          Create Class
        </ComicButton>
      </motion.div>

      {/* ── FILTER BAR ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        {['All', 'High Risk', 'Low Engagement', 'Need Attention'].map(f => (
          <button key={f} className={`px-4 py-1.5 rounded-full font-ui text-xs font-bold border-2 transition-all ${
            f === 'All'
              ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]'
              : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--accent-purple)]'
          }`}>
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" placeholder="Search classes…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-full bg-white border-2 border-[var(--border-card)] font-ui text-xs outline-none focus:border-[var(--accent-purple)] w-[180px]" />
        </div>
      </motion.div>

      {/* ── CARDS GRID ── */}
      <motion.div initial="initial" animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {filtered.map((cls, i) => {
          const engagement = 70 + Math.floor(Math.random() * 22);
          const atRiskHigh = Math.floor(Math.random() * 5);
          const atRiskMed = Math.floor(Math.random() * 10);
          const col = colorWheel[i % colorWheel.length];
          return (
            <motion.div key={cls._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
            >
              <StickyCard color={col} onClick={() => router.push(`/teacher/classes/${cls._id}`)} className="!p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg text-[var(--text-primary)] leading-tight">{cls.name}</h3>
                    <p className="font-ui text-xs text-[var(--text-secondary)] mt-0.5">{(cls as any).subject || cls.department} · {cls.studentIds?.length ?? cls.studentCount ?? 0} Students</p>
                  </div>
                  <span className="text-2xl">📚</span>
                </div>

                {/* Engagement bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase">Engagement</span>
                    <span className="font-ui text-[10px] font-bold text-[var(--text-primary)]">{engagement}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{
                      width: `${engagement}%`,
                      background: engagement > 80 ? 'var(--accent-green)' : engagement > 60 ? 'var(--accent-gold)' : 'var(--accent-red)'
                    }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="font-ui text-[10px] font-semibold text-[var(--text-muted)]">At Risk:</span>
                  {atRiskHigh > 0 && <RiskBadge level="high" label={`${atRiskHigh} High`} />}
                  {atRiskMed > 0 && <RiskBadge level="medium" label={`${atRiskMed} Med`} />}
                  {atRiskHigh === 0 && atRiskMed === 0 && <span className="font-ui text-[10px] font-semibold text-green-600">None</span>}
                </div>

                {/* Class ID chip */}
                <div className="flex items-center gap-1.5 mb-3 bg-white/70 px-2.5 py-1 rounded-lg border border-[var(--border-card)] w-fit cursor-pointer"
                  onClick={() => copyId(cls._id)} title="Click to copy class ID">
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">{cls._id.slice(0, 8)}…</span>
                  {copiedId === cls._id ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-[var(--text-muted)]" />}
                </div>

                {/* Action row */}
                <div className="flex gap-2 pt-3 border-t-2 border-dashed border-[var(--border-card)]">
                  <button onClick={(e) => { e.stopPropagation(); router.push(`/teacher/classes/${cls._id}`); }}
                    className="flex-1 py-1.5 bg-white rounded-lg font-ui text-[11px] font-bold text-[var(--accent-purple)] border border-[var(--border-card)] hover:bg-[var(--accent-purple)]/5">
                    View Class
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); }}
                    className="flex-1 py-1.5 bg-white rounded-lg font-ui text-[11px] font-bold border border-[var(--border-card)] hover:bg-purple-50 text-[var(--text-secondary)]">
                    Upload Marks
                  </button>
                </div>
              </StickyCard>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3">
            <StickyCard color="yellow" className="text-center py-12">
              <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-handwrite text-2xl text-[var(--text-muted)]">No classes match your search</p>
              <button onClick={() => setShowCreate(true)} className="mt-4 font-ui text-sm font-bold text-[var(--accent-purple)] underline">
                Create your first class
              </button>
            </StickyCard>
          </div>
        )}
      </motion.div>

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ scale: 0.92, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.92, rotate: 2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg sticky-card bg-[var(--sticky-yellow)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">New Class</h2>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-ui text-sm">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Class Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Fullstack Web Dev - Sec B"
                    className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Department</label>
                    <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Semester</label>
                    <input type="number" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                      placeholder="e.g. 5"
                      className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                  </div>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Subjects (comma separated)</label>
                  <input value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] hover:bg-white/50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleCreate} disabled={creating}
                    className="flex-1 py-3 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    {creating ? 'Creating…' : 'Create Class'}
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

function mockClasses(): ClassItem[] {
  return [
    { _id: 'c1', name: 'Fullstack Development - Sec B', department: 'Computer Science', semester: 5, subject: 'CS', studentCount: 42, studentIds: Array.from({ length: 42 }, (_, i) => `s${i + 1}`) },
    { _id: 'c2', name: 'DBMS - Sec A', department: 'Database', semester: 4, subject: 'DBMS', studentCount: 38, studentIds: Array.from({ length: 38 }, (_, i) => `s${i + 1}`) },
    { _id: 'c3', name: 'DS Algorithms', department: 'Computer Science', semester: 3, subject: 'CS', studentCount: 35, studentIds: Array.from({ length: 35 }, (_, i) => `s${i + 1}`) },
    { _id: 'c4', name: 'Computer Networks', department: 'ECE', semester: 4, subject: 'ECE', studentCount: 31, studentIds: Array.from({ length: 31 }, (_, i) => `s${i + 1}`) },
    { _id: 'c5', name: 'Operating Systems', department: 'CSE', semester: 4, subject: 'CSE', studentCount: 29, studentIds: Array.from({ length: 29 }, (_, i) => `s${i + 1}`) },
    { _id: 'c6', name: 'ML Basics', department: 'AI/ML', semester: 2, subject: 'AI', studentCount: 24, studentIds: Array.from({ length: 24 }, (_, i) => `s${i + 1}`) },
  ];
}
