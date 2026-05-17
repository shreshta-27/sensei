'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, MessageCircle, Sparkles, Send, Clock, User,
  AlertTriangle, X, Send as SendIcon, MoreHorizontal
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import { useSocket } from '@/hooks/useSocket';

type Ticket = {
  _id: string;
  student: { name: string; department?: string };
  subject: string;
  concept?: string;
  message: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
};

export default function HelpQueuePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [replying, setReplying]   = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { on } = useSocket('/teacher');

  useEffect(() => {
    api.get('/api/help-ticket')
      .then(r => {
        const formatted = (r.data.tickets || r.data || []).map((t: any) => ({
          ...t,
          student: t.studentId || t.student,
          status: t.status === 'responded' ? 'in_progress' : t.status,
        }));
        setTickets(formatted);
      })
      .catch(() => setTickets(mockTickets))
      .finally(() => setLoading(false));

    const off = on('help:new_ticket', (...args: unknown[]) => {
      const t = args[0] as Ticket;
      setTickets(prev => [t, ...prev]);
      toast.success(`New ticket from ${t.student?.name ?? 'Unknown'}!`, { icon: '🙋' });
    });
    return () => { off(); };
  }, [on]);

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const respond = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await api.patch(`/api/help-ticket/${id}/respond`, { response: replyText });
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status: 'in_progress' as const } : t));
      toast.success('Reply sent!');
      setReplying(null);
      setReplyText('');
    } catch { toast.error('Failed to send reply'); }
  };

  const cols = [
    { key: 'pending',      label: 'PENDING',       color: 'orange' as const },
    { key: 'in_progress',  label: 'IN PROGRESS',   color: 'yellow' as const },
    { key: 'resolved',     label: 'RESOLVED',       color: 'green'  as const },
  ];

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Opening help queue…</div>;

  return (
    <div className="page-mobile-pad space-y-6">
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600">
            <HelpCircle size={24} />
          </div>
          <div>
            <h1 className="font-display text-4xl text-[var(--text-primary)]">Help Queue</h1>
            <p className="font-handwrite text-xl text-[var(--text-muted)]">
              Student questions · {tickets.filter(t => t.status === 'pending').length} pending
            </p>
          </div>
          {tickets.filter(t => t.status === 'pending').length > 0 && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex w-3 h-3 rounded-full bg-red-500"
            />
          )}
        </div>
      </motion.div>

      {/* ── FILTER CHIPS ── */}
      <div className="flex gap-2">
        {(['all', 'pending', 'in_progress', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full font-ui text-xs font-bold border-2 transition-all ${
              filter === f ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'
            }`}>
            {f === 'in_progress' ? 'IN PROGRESS' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── KANBAN ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cols.map(({ key, label, color }) => {
          const colItems = filtered.filter(t => t.status === key);
          return (
            <div key={key}>
              <h3 className="font-display text-lg text-[var(--text-primary)] mb-3 px-1">
                {label} ({colItems.length})
              </h3>
              <div className="rounded-2xl p-3 min-h-[260px] border-3 border-[var(--border-doodle)] shadow-[var(--shadow-sticky)] space-y-3"
                style={{ background: `var(--${color === 'orange' ? 'sticky-orange' : color === 'yellow' ? 'sticky-yellow' : 'sticky-green'})` }}
              >
                <AnimatePresence>
                  {colItems.map((t, i) => (
                    <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <StickyCard color={color} className="!p-4">
                        {/* Student header */}
                        <div className="flex items-center gap-2 mb-2">
                          <TeacherAvatar name={t.student?.name ?? '?'} size={30} />
                          <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate flex-1">
                            {t.student?.name ?? 'Unknown'}
                          </span>
                          <span className="font-ui text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 text-[var(--text-muted)]">
                            {t.subject?.slice(0, 12)}
                          </span>
                          <RiskBadge level={t.urgency} />
                        </div>

                        {/* Message */}
                        <p className="font-body text-sm text-[var(--text-secondary)] mb-2 line-clamp-3">
                          {t.message}
                        </p>

                        {/* Concept tag */}
                        {t.concept && (
                          <span className="inline-block font-ui text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 mb-2">
                            {t.concept}
                          </span>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <Clock size={11} className="text-[var(--text-muted)]" />
                          <span className="font-ui text-[10px] text-[var(--text-muted)]">{t.createdAt}</span>
                        </div>

                        {/* Actions */}
                        {key === 'pending' && (
                          <ComicButton variant="primary" size="sm" icon={<Send size={13} />}
                            onClick={() => { setReplying(t._id); setReplyText(''); }}
                            className="w-full justify-center"
                          >
                            Reply
                          </ComicButton>
                        )}

                        {/* Inline reply textarea */}
                        <AnimatePresence>
                          {replying === t._id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="mt-2 overflow-hidden"
                            >
                              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                placeholder="Type your response…"
                                className="w-full bg-white/90 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 font-body text-sm outline-none focus:border-[var(--accent-purple)] resize-none h-16 px-2"
                              />
                              <div className="flex gap-2 mt-2 justify-end">
                                <button onClick={() => setReplying(null)}
                                  className="font-ui text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1">
                                  Cancel
                                </button>
                                <button onClick={() => respond(t._id)}
                                  className="font-ui text-xs font-bold text-white bg-[var(--accent-purple)] px-3 py-1 rounded-xl hover:-translate-y-0.5 transition-all">
                                  <Send size={12} className="inline mr-1" /> Send
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </StickyCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colItems.length === 0 && (
                  <div className="p-6 text-center font-handwrite text-lg text-[var(--text-muted)] opacity-60">
                    {key === 'pending'    ? '🎉 All caught up!' :
                     key === 'in_progress'? 'Nothing in progress' :
                                           'Nothing resolved yet'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mockTickets: Ticket[] = [
  { _id: 't1', student: { name: 'Arjun Nair',  department: 'ECE' }, subject: 'Math',    concept: 'Floating Point', urgency: 'high',    status: 'pending',      message: 'I don\'t understand floating point calculation from yesterday\'s lecture. Can someone help?',  createdAt: '2 hours ago' },
  { _id: 't2', student: { name: 'Devika S.',    department: 'CSE' }, subject: 'DS',      concept: 'Trees',        urgency: 'medium',  status: 'in_progress', message: 'Binary tree traversal is confusing. Especially when to use BFS vs DFS.',                              createdAt: '4 hours ago' },
  { _id: 't3', student: { name: 'Kiran Mehta',  department: 'CS'  }, subject: 'DBMS',    concept: 'Joins',        urgency: 'low',     status: 'resolved',    message: 'How do LEFT and RIGHT outer joins differ?',                                                       createdAt: '1 day ago' },
];
