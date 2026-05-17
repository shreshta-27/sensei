'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Plus, Filter, AlertTriangle, Clock, X, Search, ChevronRight,
  ArrowRight, Sparkles, MoreHorizontal, Send
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
  const [form, setForm] = useState<{ student: string; type: string; urgency: 'medium' | 'high' | 'low'; message: string }>({ student: '', type: 'academic', urgency: 'medium', message: '' });

  useEffect(() => {
    api.get('/api/teacher/interventions')
      .then(r => setItems(r.data.interventions || r.data || []))
      .catch(() => setItems(mockData))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    if (!form.message) { toast.error('Write a message'); return; }
    try {
      await api.post('/api/teacher/interventions', form);
      toast.success('Intervention sent!');
      setShowModal(false);
      setForm({ student: '', type: 'academic', urgency: 'medium', message: '' });
    } catch { toast.error('Failed to create'); }
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Loading interventions…</div>;

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
        <ComicButton variant="primary" onClick={() => setShowModal(true)} icon={<Plus size={16} />}>
          + Create
        </ComicButton>
      </motion.div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: items.filter(i => i.status === 'sent').length ?? 12,  color: 'blue'   },
          { label: 'Successful', value: items.filter(i => i.status === 'resolved').length ?? 8, color: 'green'  },
          { label: 'Pending',    value: items.filter(i => i.status === 'in_progress').length ?? 5, color: 'yellow' },
          { label: 'Critical',   value: items.filter(i => i.urgency === 'high').length ?? 3,    color: 'pink'   },
        ].map((s, i) => (
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
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" placeholder="Search student…" className="pl-8 pr-3 py-1.5 rounded-full bg-white border-2 border-[var(--border-card)] font-ui text-xs outline-none focus:border-[var(--accent-purple)] w-[140px]" />
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
              <div className="rounded-2xl p-3 min-h-[240px] border-3 border-[var(--border-doodle)] shadow-[var(--shadow-sticky)]"
                style={{ background: colorMap[col.color] }}
              >
                <AnimatePresence>
                  {colItems.map((item, i) => (
                    <motion.div key={item._id} initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <StickyCard color={col.color} className="!p-4 !my-3 cursor-pointer"
                        onClick={() => router.push(item.student?.name ? `/teacher/students` : '#')}>
                        <div className="flex items-start gap-2 mb-1.5">
                          <TeacherAvatar name={item.student?.name ?? 'Unknown'} size={30} />
                          <div className="flex-1 min-w-0">
                            <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate block">{item.student?.name ?? 'Class-level'}</span>
                            <RiskBadge level={item.urgency} label={item.urgency} />
                          </div>
                        </div>
                        <p className="font-ui text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{item.type}</p>
                        <p className="font-body text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{item.message}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock size={11} className="text-[var(--text-muted)]" />
                          <span className="font-ui text-[10px] text-[var(--text-muted)]">{item.date}</span>
                        </div>
                      </StickyCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colItems.length === 0 && (
                  <div className="p-6 text-center font-handwrite text-lg text-[var(--text-muted)] opacity-60">
                    🎉 No cards here yet
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ scale: 0.92, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg sticky-card bg-[var(--sticky-yellow)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">New Intervention</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-ui text-sm">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Student Name</label>
                  <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none"
                    value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))}>
                    <option value="">Select student…</option>
                    {['Rahul Verma', 'Sneha Iyer', 'Arjun Nair'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(['academic','attendance','behavioral','wellness'] as const).map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`px-3 py-1.5 rounded-xl font-ui text-xs font-bold border-2 capitalize ${form.type === t ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Urgency</label>
                  <div className="flex gap-2">
                    {(['medium','high','low'] as const).map(u => (
                      <button key={u} onClick={() => setForm(f => ({ ...f, urgency: u }))}
                        className={`px-3 py-1.5 rounded-xl font-ui text-xs font-bold border-2 uppercase ${form.urgency === u ? `bg-${u === 'high' ? 'red' : u === 'medium' ? 'amber' : 'green'}-500 text-white border-${u === 'high' ? 'red' : u === 'medium' ? 'amber' : 'green'}-500` : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your proposed support plan…"
                    className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)] resize-none h-24"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] hover:bg-white/50 transition-all">
                    Cancel
                  </button>
                  <button onClick={create}
                    className="flex-1 py-3 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <Send size={15} /> Send Intervention
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

const mockData: Intervention[] = [
  { _id: 'i1', student: { name: 'Rahul Verma' },   type: 'Academic',   urgency: 'high',    status: 'sent',        message: '1:1 mentorship for DS Algo — triggered by 34% drop in quiz scores.',       date: '2 days ago' },
  { _id: 'i2', student: { name: 'Sneha Iyer' },     type: 'Attendance', urgency: 'medium',  status: 'in_progress', message: 'Wellness check scheduled — attendance below threshold for 3 weeks.',    date: '5 days ago' },
  { _id: 'i3', student: { name: 'Arjun Nair' },     type: 'Behavioral', urgency: 'high',    status: 'resolved',    message: 'Parent communication completed. Student picked up to 73% attendance.',    date: '1 week ago' },
  { _id: 'i4', student: { name: 'Priya Menon' },    type: 'Academic',   urgency: 'medium',  status: 'sent',        message: 'Extra practice session assigned. ML basics score below passing grade.',     date: '3 days ago' },
  { _id: 'i5', student: { name: 'Dev Patel' },      type: 'Wellness',   urgency: 'low',     status: 'in_progress', message: 'Study group assigned. Peer pairing with high-performing student.',           date: '1 day ago' },
];
