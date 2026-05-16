'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Plus, X, Loader2, Radio, Lock, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import PageTransition from '@/components/teacher/PageTransition';
import GlowCard from '@/components/teacher/GlowCard';
import EmptyState from '@/components/teacher/EmptyState';
import { TableSkeleton } from '@/components/teacher/LoadingSkeleton';
import type { Poll } from '@/types';

const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const BarChartComponent = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const { on } = useSocket('/teacher');


  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [classId, setClassId] = useState('');
  const [classList, setClassList] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetchPolls();
    api.get('/api/teacher/classes').then(({ data }) => setClassList(data.classes || data || [])).catch(() => { });
    const offResponse = on('poll:response', () => { fetchPolls(); });
    return () => { offResponse(); };
  }, [on]);

  const fetchPolls = () => {
    api.get('/api/teacher/polls')
      .then(({ data }) => setPolls(data.polls || data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  const createPoll = async () => {
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Question and at least 2 options required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/api/teacher/polls', { question, options: validOptions, classId: classId || undefined });
      toast.success('Poll created!');
      setShowCreate(false);
      setQuestion('');
      setOptions(['', '']);
      setClassId('');
      fetchPolls();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const closePoll = async (pollId: string) => {
    try {
      await api.patch(`/api/teacher/polls/${pollId}/close`);
      toast.success('Poll closed');
      fetchPolls();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to close poll');
    }
  };

  const viewResults = async (poll: Poll) => {
    setSelectedPoll(poll);
    try {
      const { data } = await api.get(`/api/teacher/polls/${poll._id}/results`);
      setResults(data.responses || data.results || data.options || []);
    } catch {
      setResults(poll.results || []);
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-faculty-heading text-2xl font-bold text-faculty-text">Live Polls</h1>
            <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Create and manage real-time class polls</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="faculty-btn flex items-center gap-2">
            <Plus size={16} /> Create Poll
          </button>
        </div>

        {polls.length === 0 ? (
          <EmptyState icon={BarChart3} title="No Polls Yet" description="Create your first poll to engage students in real-time." action={{ label: 'Create Poll', onClick: () => setShowCreate(true) }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.map((poll, i) => (
              <motion.div
                key={poll._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="faculty-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {poll.isOpen ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-faculty-success/10 text-faculty-success">
                        <Radio size={10} className="animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-faculty-text-secondary/10 text-faculty-text-secondary">
                        <Lock size={10} /> CLOSED
                      </span>
                    )}
                  </div>
                  <span className="font-faculty text-[10px] text-faculty-text-secondary">
                    {poll.responses?.length || 0} responses
                  </span>
                </div>
                <h3 className="font-faculty text-sm text-faculty-text mb-3">{poll.question}</h3>
                <div className="space-y-1.5 mb-4">
                  {poll.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-faculty-bg/50 border border-faculty-border/50">
                      <span className="font-faculty-data text-[10px] text-faculty-ember">{String.fromCharCode(65 + oi)}</span>
                      <span className="font-faculty text-xs text-faculty-text-secondary">{opt}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewResults(poll)} className="faculty-btn-ghost text-xs px-3 py-1.5 flex-1">
                    View Results
                  </button>
                  {poll.isOpen && (
                    <button onClick={() => closePoll(poll._id)} className="p-2 rounded-lg hover:bg-faculty-danger/10 text-faculty-text-secondary hover:text-faculty-danger transition-colors">
                      <Lock size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-faculty-surface border border-faculty-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-faculty-heading text-lg font-bold text-faculty-text">Create Poll</h2>
                  <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Question</label>
                    <input value={question} onChange={e => setQuestion(e.target.value)} className="faculty-input w-full" placeholder="What do you want to ask?" />
                  </div>
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Options</label>
                    <div className="space-y-2">
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-faculty-data text-xs text-faculty-ember w-5">{String.fromCharCode(65 + i)}</span>
                          <input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} className="faculty-input flex-1" placeholder={`Option ${i + 1}`} />
                          {options.length > 2 && (
                            <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="p-1.5 text-faculty-text-secondary hover:text-faculty-danger"><Trash2 size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                    {options.length < 6 && (
                      <button onClick={() => setOptions([...options, ''])} className="font-faculty text-xs text-faculty-ember hover:underline mt-2">+ Add Option</button>
                    )}
                  </div>
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Target Class (optional)</label>
                    <select value={classId} onChange={e => setClassId(e.target.value)} className="faculty-input w-full text-sm">
                      <option value="">All Students (Global)</option>
                      {classList.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={createPoll} disabled={creating} className="faculty-btn w-full flex items-center justify-center gap-2">
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {creating ? 'Creating...' : 'Create Poll'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <AnimatePresence>
          {selectedPoll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setSelectedPoll(null); setResults(null); }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg bg-faculty-surface border border-faculty-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-faculty-heading text-lg font-bold text-faculty-text">Poll Results</h2>
                  <button onClick={() => { setSelectedPoll(null); setResults(null); }} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary"><X size={18} /></button>
                </div>
                <p className="font-faculty text-sm text-faculty-text mb-4">{selectedPoll.question}</p>
                {results && results.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChartComponent data={results.map(r => ({ name: r.option || r.name, count: r.count || r.value || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--f-border)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--f-text-secondary)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'var(--f-text-secondary)', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: 'var(--f-surface)', border: '1px solid var(--f-border)', borderRadius: '8px', color: 'var(--f-text)', fontSize: '12px' }} />
                        <Bar dataKey="count" fill="var(--f-ember)" radius={[4, 4, 0, 0]} />
                      </BarChartComponent>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="font-faculty text-sm text-faculty-text-secondary text-center py-8">No responses yet.</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
