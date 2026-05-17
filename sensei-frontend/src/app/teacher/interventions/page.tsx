'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Plus, AlertTriangle, Clock, X, Search, Check, Play, RefreshCw, Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';

type Intervention = {
  _id: string;
  student: { name: string; risk?: string };
  type: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'sent' | 'in_progress' | 'resolved';
  message: string;
  date: string;
};

const columns: { key: Intervention['status']; label: string; color: 'pink' | 'yellow' | 'green' }[] = [
  { key: 'sent',        label: 'SENT',        color: 'pink'   },
  { key: 'in_progress', label: 'IN PROGRESS', color: 'yellow' },
  { key: 'resolved',    label: 'RESOLVED',    color: 'green'  },
];

const colorMap: Record<'pink'|'yellow'|'green', string> = {
  pink:   'var(--sticky-pink)',
  yellow: 'var(--sticky-yellow)',
  green:  'var(--sticky-green)',
};

export default function InterventionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Intervention['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState<{ student: string; type: string; urgency: 'medium' | 'high' | 'low'; message: string }>({ student: '', type: 'academic', urgency: 'medium', message: '' });
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchInterventions();
  }, []);

  const fetchStudents = async () => {
    try {
      const r = await api.get('/api/teacher/students');
      setStudentsList(r.data.students || r.data || []);
    } catch {
      toast.error('Failed to load students directory');
    }
  };

  const fetchInterventions = async () => {
    try {
      const r = await api.get('/api/teacher/interventions');
      const raw = r.data.interventions || r.data || [];
      const mapped = raw.map((item: any) => ({
        _id: item._id,
        student: item.studentId ? { name: item.studentId.name || 'Unknown', risk: item.urgency } : item.student || { name: 'Class-level' },
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'recently',
        type: item.triggerType || item.type || 'academic',
        urgency: item.urgency || 'medium',
        status: item.status || 'sent',
        message: item.message || '',
      }));
      setItems(mapped.length > 0 ? mapped : mockData);
    } catch {
      setItems(mockData);
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!form.student) { toast.error('Please select a student'); return; }
    if (!form.message) { toast.error('Please write a message'); return; }
    
    try {
      await api.post('/api/teacher/interventions', {
        studentId: form.student,
        message: form.message,
        triggerType: 'manual',
        urgency: form.urgency
      });
      toast.success('Intervention sent!');
      setShowModal(false);
      setForm({ student: '', type: 'academic', urgency: 'medium', message: '' });
      fetchInterventions();
    } catch {
      toast.error('Failed to create intervention');
    }
  };

  const updateInterventionStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/teacher/interventions/${id}/status`, { status: newStatus });
      toast.success(`Workflow updated to ${newStatus.toUpperCase()}`);
      fetchInterventions();
    } catch {
      // Fallback local support if route not fully ready
      setItems(prev => prev.map(item => item._id === id ? { ...item, status: newStatus as any } : item));
      toast.success(`Status updated locally`);
    }
  };

  const filtered = items.filter(i => {
    const statusMatch = filter === 'all' || i.status === filter;
    const nameMatch = (i.student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      i.message.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && nameMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="font-handwrite text-3xl text-[var(--text-muted)] animate-pulse">Synchronizing workflows…</div>
      </div>
    );
  }

  return (
    <div className="page-mobile-pad space-y-6">
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)]">Interventions</h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">Track and manage student support plans</p>
        </div>
        <div className="flex items-center gap-2">
          <ComicButton variant="ghost" onClick={fetchInterventions} icon={<RefreshCw size={14} />}>
            Sync
          </ComicButton>
          <ComicButton variant="primary" onClick={() => setShowModal(true)} icon={<Plus size={16} />}>
            + Create
          </ComicButton>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: items.length,  color: 'blue'   },
          { label: 'Successful', value: items.filter(i => i.status === 'resolved').length, color: 'green'  },
          { label: 'In Progress',    value: items.filter(i => i.status === 'in_progress').length, color: 'yellow' },
          { label: 'High Urgency',   value: items.filter(i => i.urgency === 'high').length,    color: 'pink'   },
        ].map((s) => (
          <StickyCard key={s.label} color={s.color as any} className="!p-4">
            <p className="font-display text-3xl text-[var(--text-primary)]">{s.value}</p>
            <p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
          </StickyCard>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...columns.map(c => c.key)] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-ui text-xs font-bold border-2 transition-all ${
              filter === f
                ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)] hover:border-[var(--accent-purple)]'
            }`}>
            {f === 'all' ? 'All' : columns.find(c => c.key === f)?.label ?? f}
          </button>
        ))}
        <div className="relative ml-auto w-full md:w-auto mt-2 md:mt-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-full bg-white border-2 border-[var(--border-card)] font-ui text-xs outline-none focus:border-[var(--accent-purple)] w-full md:w-[200px]"
          />
        </div>
      </div>

      {/* ── KANBAN BOARD ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[300px]">
        {columns.map(col => {
          const colItems = filtered.filter(i => i.status === col.key);
          return (
            <div key={col.key}>
              <h3 className="font-display text-lg text-[var(--text-primary)] mb-3 px-1">
                {col.label} ({colItems.length})
              </h3>
              <div className="rounded-2xl p-3 min-h-[280px] border-3 border-[var(--border-doodle)] shadow-[var(--shadow-sticky)]"
                style={{ background: colorMap[col.color] }}
              >
                <AnimatePresence>
                  {colItems.map((item, i) => (
                    <motion.div key={item._id} initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <StickyCard color={col.color} className="!p-4 !my-3 relative group">
                        <div className="flex items-start gap-2 mb-1.5">
                          <TeacherAvatar name={item.student?.name ?? 'Unknown'} size={32} />
                          <div className="flex-1 min-w-0">
                            <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate block">{item.student?.name ?? 'Class-level'}</span>
                            <RiskBadge level={item.urgency} />
                          </div>
                        </div>
                        <p className="font-ui text-[10px] font-black text-purple-700 uppercase tracking-widest mt-1.5">{item.type}</p>
                        <p className="font-body text-xs text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-3">{item.message}</p>
                        
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-[var(--text-muted)]" />
                            <span className="font-ui text-[10px] text-[var(--text-muted)]">{item.date}</span>
                          </div>

                          {/* Dynamic Action triggers inside card */}
                          <div className="flex items-center gap-1.5">
                            {item.status === 'sent' && (
                              <button
                                onClick={() => updateInterventionStatus(item._id, 'in_progress')}
                                className="px-2 py-1 rounded bg-[var(--accent-purple)] text-white font-ui text-[9px] font-bold border border-black shadow-[1px_1px_0_#000] hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center gap-1"
                              >
                                <Play size={8} /> Start Action
                              </button>
                            )}
                            {item.status === 'in_progress' && (
                              <button
                                onClick={() => updateInterventionStatus(item._id, 'resolved')}
                                className="px-2 py-1 rounded bg-[var(--sticky-green)] text-[var(--text-primary)] font-ui text-[9px] font-bold border border-black shadow-[1px_1px_0_#000] hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center gap-1"
                              >
                                <Check size={8} /> Resolve
                              </button>
                            )}
                            {item.status === 'resolved' && (
                              <span className="font-ui text-[9px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 uppercase">
                                Resolved 🌟
                              </span>
                            )}
                          </div>
                        </div>
                      </StickyCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colItems.length === 0 && (
                  <div className="p-12 text-center font-handwrite text-lg text-[var(--text-muted)] opacity-60">
                    🎉 No active support plans in this list
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Dialog Content */}
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#FAF6EE] border-4 border-black rounded-[var(--btn-radius)] p-7 shadow-[8px_8px_0_#000] z-10"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-black bg-white hover:bg-[var(--sticky-yellow)] transition-colors"
              >
                <X size={16} />
              </button>

              <h2 className="font-display text-2xl mb-4 text-[var(--text-primary)]">✨ Create Intervention</h2>

              <div className="space-y-4 font-ui">
                <div>
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Student Target</label>
                  <select className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 font-ui text-sm outline-none"
                    value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))}>
                    <option value="">Select student target…</option>
                    {studentsList.map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.department || s.dept || 'CS'})</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Support Domain</label>
                  <div className="flex flex-wrap gap-2">
                    {(['academic','attendance','behavioral','wellness'] as const).map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`px-3 py-1.5 rounded-xl font-ui text-xs font-bold border-2 capitalize transition-all ${
                          form.type === t
                            ? 'bg-[var(--accent-purple)] text-white border-black shadow-[1px_1px_0_#000]'
                            : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Urgency Priority</label>
                  <div className="flex gap-2">
                    {(['low','medium','high'] as const).map(u => {
                      const colorMap = {
                        low: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                        medium: 'bg-amber-50 text-amber-700 border-amber-300',
                        high: 'bg-red-50 text-red-700 border-red-300'
                      };
                      const activeColorMap = {
                        low: 'bg-emerald-600 text-white border-black',
                        medium: 'bg-amber-500 text-white border-black',
                        high: 'bg-red-600 text-white border-black'
                      };
                      return (
                        <button key={u} onClick={() => setForm(f => ({ ...f, urgency: u }))}
                          className={`px-3 py-1.5 rounded-xl font-ui text-xs font-bold border-2 uppercase transition-all ${
                            form.urgency === u
                              ? `${activeColorMap[u]} shadow-[1px_1px_0_#000]`
                              : `${colorMap[u]}`
                          }`}>
                          {u}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Proposed Support Plan Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your proposed adaptive support plan or action item..."
                    className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 font-body text-sm outline-none focus:border-[var(--accent-purple)] resize-none h-24"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] border-2 border-transparent hover:border-black transition-all">
                    Cancel
                  </button>
                  <button onClick={create}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                    Send Support Plan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const mockData: Intervention[] = [
  { _id: 'i1', student: { name: 'Rahul Verma' },   type: 'Academic',   urgency: 'high',    status: 'sent',        message: '1:1 mentorship for DS Algo — triggered by 34% drop in quiz scores.',       date: '2 days ago' },
  { _id: 'i2', student: { name: 'Sneha Iyer' },     type: 'Attendance', urgency: 'medium',  status: 'in_progress', message: 'Wellness check scheduled — attendance below threshold for 3 weeks.',    date: '5 days ago' },
  { _id: 'i3', student: { name: 'Arjun Nair' },     type: 'Behavioral', urgency: 'high',    status: 'resolved',    message: 'Parent communication completed. Student picked up to 73% attendance.',    date: '1 week ago' },
];
