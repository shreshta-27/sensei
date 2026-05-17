'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Plus, X, Send, Clock, Users, CheckCircle,
  ChevronRight, Sparkles, MessageCircle, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';

export default function PollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ question: '', classId: '', options: 'Option A, Option B, Option C', expiry: '' });
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    api.get('/api/teacher/polls')
      .then(r => setPolls(r.data.polls || r.data || []))
      .catch(() => setPolls(mockPolls));
  }, []);

  const create = async () => {
    if (!form.question || !form.options.trim()) { toast.error('Fill all fields'); return; }
    try {
      const payloadClassId = form.classId && form.classId.length === 24 ? form.classId : undefined;
      await api.post('/api/teacher/polls', { ...form, classId: payloadClassId, options: form.options.split(',').map(s => s.trim()).filter(Boolean) });
      toast.success('Poll launched!');
      setShowCreate(false);
      setForm({ question: '', classId: '', options: 'Option A, Option B, Option C', expiry: '' });
    } catch { toast.error('Failed to create poll'); }
  };

  const activePolls   = polls.filter(p => p.active !== false);
  const closedPolls   = polls.filter(p => p.active === false);

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)]">Polls & Surveys</h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">Create live polls and see real-time student responses</p>
        </div>
        <ComicButton variant="primary" icon={<Plus size={16} />} onClick={() => { setShowCreate(!showCreate); setFormOpen(!formOpen); }}>
          Create Poll
        </ComicButton>
      </motion.div>

      {/* Create Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <StickyCard color="yellow" className="!p-6 space-y-4" pinned>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">New Poll</h2>
                <button onClick={() => { setShowCreate(false); setFormOpen(false); }} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-ui text-sm text-red-400"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Class</label>
                  <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none"
                    value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
                    <option value="">Select class…</option>
                    <option value="c1">Fullstack - Sec B</option>
                    <option value="c2">DBMS - Sec A</option>
                    <option value="c3">DS Algorithms</option>
                  </select>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Expiry</label>
                  <input type="datetime-local" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Question</label>
                <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder="What do you want to poll?"
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Options (comma separated)</label>
                <textarea value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
                  placeholder="Option A, Option B, Option C"
                  className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:border-[var(--accent-purple)] h-16 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowCreate(false); setFormOpen(false); }}
                  className="flex-1 py-3 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] hover:bg-white/50">
                  Cancel
                </button>
                <button onClick={create}
                  className="flex-1 py-3 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5">
                  <Send size={15} className="inline mr-1" /> Launch Poll
                </button>
              </div>
            </StickyCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE POLLS ── */}
      <section>
        <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" /> Active Polls
        </h2>
        <div className="space-y-5">
          {activePolls.length === 0 && (
            <StickyCard color="yellow" className="text-center py-12">
              <MessageCircle size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="font-handwrite text-2xl text-[var(--text-muted)]">No active polls yet</p>
              <button onClick={() => { setShowCreate(true); setFormOpen(true); }}
                className="mt-3 font-ui text-sm font-bold text-[var(--accent-purple)] underline">Create your first poll</button>
            </StickyCard>
          )}
          {activePolls.map((poll, i) => {
            const totalResponses = (poll.results ?? (poll.options ?? []).reduce((s: number, o: any) => s + (o.count ?? 0), 0));
            return (
              <motion.div key={poll._id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                 <StickyCard color={(['yellow','blue','purple','green','pink','orange'] as const)[i % 6]} className="!p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                        {(poll.class as string) ?? 'General'} · {poll._id?.slice(0, 8)}
                      </p>
                      <p className="font-display text-xl text-[var(--text-primary)] mt-0.5">{poll.question}</p>
                    </div>
                    <span className="font-ui text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full animate-pulse">Live</span>
                  </div>

                  {/* Doughnut result */}
                  <div className="flex items-center gap-6">
                    <MiniDonut data={poll.options} total={totalResponses} />
                    <div className="flex-1 space-y-2">
                      {(poll.options ?? []).map((opt: any, oi: number) => (
                        <div key={opt.text ?? oi} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-0.5">
                              <span className="font-ui text-xs text-[var(--text-secondary)]">{opt.text}</span>
                              <span className="font-ui text-xs font-bold">{opt.count} votes</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-bar-fill" style={{ width: `${((opt.count || 0) / (totalResponses || 1)) * 100}%`, background: ['#7C3AED','#3B82F6','#22C55E','#F59E0B','#EF4444'][oi % 5] }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border-card)]">
                    <span className="font-ui text-xs text-[var(--text-muted)]">{(poll.responseCount ?? totalResponses)} responses · {(poll.participation ?? 72)}% participation</span>
                    <span className="ml-auto font-ui text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">{(poll.sentiment ?? 'Neutral')}</span>
                    <ComicButton variant="danger" size="sm" onClick={() => {}} className="!shadow-none">Close</ComicButton>
                  </div>
                </StickyCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── PAST POLLS ── */}
      {closedPolls.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-4">Past Polls</h2>
          <div className="space-y-3">
            {closedPolls.map((poll, i) => (
              <motion.div key={poll._id ?? i}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-white border-2 border-[var(--border-card)] rounded-xl shadow-[var(--shadow-card)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{poll.question}</p>
                  <p className="font-ui text-[11px] text-[var(--text-muted)]">{(poll.responseCount ?? 0)} responses · Closed {poll.closedAt ?? poll.date ?? 'recently'}</p>
                </div>
                <ComicButton variant="ghost" size="sm" icon={<BarChart3 size={14} />}>Results</ComicButton>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---- Inline MiniDonut (light fallback without extra dependency) ---- */
function MiniDonut({ data, total }: { data: any[]; total: number }) {
  const r = 48, cx = 54, cy = 54;
  const circ = r * 2 * Math.PI;
  const colors = ['#7C3AED','#3B82F6','#22C55E','#F59E0B','#EF4444'];
  let offset = 0;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-card)" strokeWidth="16" />
      {(data ?? []).map((opt, i) => {
        const pct = ((opt.count ?? 0) / (total || 1)) * circ;
        const start = offset;
        offset += pct;
        return <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={colors[i % colors.length]} strokeWidth="16"
          strokeDasharray={`${pct} ${circ}`} strokeDashoffset={-start}
          transform="rotate(-90 54 54)" />;
      })}
      <text x="50%" y="48%" textAnchor="middle" dy="0.35em" fontSize="22" fontFamily="Bangers, cursive" fill="var(--text-primary)">{total}</text>
      <text x="50%" y="62%" textAnchor="middle" fontSize="10" fontFamily="Nunito, sans-serif" fill="var(--text-muted)">Responses</text>
    </svg>
  );
}

const mockPolls = [
  { _id: 'p1', question: 'How do you prefer learning new algorithms?', class: 'DS Algorithms', active: true, sentiment: 'Positive', responseCount: 28, participation: 80,
    options: [
      { text: 'Visual Diagrams',  count: 16 },
      { text: 'Practice Problems', count: 8  },
      { text: 'Lecture Slides',   count: 4  },
    ],
  },
  { _id: 'p2', question: 'What time works best for remedial class?', class: 'Fullstack Sec B', active: true, sentiment: 'Neutral', responseCount: 34, participation: 72,
    options: [
      { text: 'CS Club Thu',   count: 10 },
      { text: 'Friday Afternoon', count: 14 },
      { text: 'Saturday Morning', count: 10 },
    ],
  },
  { _id: 'p3', question: 'Rate today\'s quiz difficulty', class: 'DBMS - Sec A', active: false, sentiment: 'Negative', responseCount: 31, participation: 82,
    options: [
      { text: 'Too Hard',    count: 18 },
      { text: 'Just Right',  count: 9  },
      { text: 'Too Easy',    count: 4  },
    ],
  },
];
