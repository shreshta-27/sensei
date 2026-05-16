'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, Clock, MessageSquare, RefreshCw, Send, Users } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import PageTransition from '@/components/teacher/PageTransition';
import { TableSkeleton } from '@/components/teacher/LoadingSkeleton';

interface Ticket {
  _id: string;
  studentId: { name: string; studentId: string; email: string; avatar?: string };
  message: string;
  status: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  response?: string;
  createdAt: string;
  respondedAt?: string;
}

export default function TeacherHelpQueuePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'resolved'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { on } = useSocket('/teacher');

  const fetchTickets = async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      const { data } = await api.get('/api/help-ticket');
      setTickets(data.tickets || []);
    } catch {
      toast.error('Failed to load help queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchTickets(); 

    const cleanupNew = on('help:new_ticket', (newTicket: any) => {
      setTickets(prev => {
        if (prev.some(t => t._id === newTicket._id)) return prev;
        return [newTicket, ...prev];
      });
      toast.success('New help ticket received!', { icon: '🙋' });
    });

    return () => {
      cleanupNew();
    };
  }, [on]);

  const handleRespond = async (id: string) => {
    if (!response.trim()) return toast.error('Enter a response');
    setSending(true);
    try {
      const { data } = await api.patch(`/api/help-ticket/${id}/respond`, { response });
      toast.success('Response sent!');
      setTickets((prev) =>
        prev.map((t) => t._id === id ? data : t)
      );
      setResponse('');
      setSelected(null);
    } catch {
      toast.error('Failed to send response');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const { data } = await api.patch(`/api/help-ticket/${id}/resolve`);
      toast.success('Ticket resolved!');
      setTickets((prev) =>
        prev.map((t) => t._id === id ? data : t)
      );
    } catch {
      toast.error('Failed to resolve ticket');
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  const filtered = tickets.filter((t) =>
    filter === 'all' ? true : filter === 'pending' ? t.status === 'pending' : t.status === filter
  );

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    responded: tickets.filter(t => t.status === 'responded').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const statItems = [
    { label: 'Total', value: stats.total, color: 'var(--f-text)' },
    { label: 'Pending', value: stats.pending, color: '#F59E0B' },
    { label: 'Responded', value: stats.responded, color: '#14B8A6' },
    { label: 'Resolved', value: stats.resolved, color: '#10B981' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-faculty-heading text-2xl md:text-3xl font-bold text-faculty-text">Help Queue</h1>
            <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Support students with their academic and technical queries</p>
          </div>
          <button
            onClick={() => fetchTickets(true)}
            className="faculty-btn flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh Queue
          </button>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statItems.map(({ label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="faculty-card p-4 text-center">
              <p className="font-faculty-data text-2xl font-semibold" style={{ color }}>{value}</p>
              <p className="font-faculty text-[10px] uppercase tracking-wider text-faculty-text-secondary mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'responded', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[var(--f-ember)] to-[var(--f-ember-light)] text-white'
                  : 'faculty-card text-faculty-text-secondary hover:text-faculty-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="faculty-card p-12 text-center">
              <HelpCircle size={48} className="mx-auto mb-4 text-faculty-text-secondary/30" />
              <p className="font-faculty-heading text-lg text-faculty-text-secondary">Queue is empty</p>
            </div>
          ) : filtered.map((t, i) => {
            const isSelected = selected === t._id;
            const urgencyColor = t.urgency === 'high' ? '#EF4444' : t.urgency === 'medium' ? '#F59E0B' : '#14B8A6';
            
            return (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="faculty-card overflow-hidden"
                style={{ borderLeftWidth: '3px', borderLeftColor: urgencyColor }}
              >
                <div className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-faculty-bg/80 border border-faculty-border/50 flex items-center justify-center shrink-0">
                        {t.studentId?.avatar ? <img src={t.studentId.avatar} className="w-full h-full object-cover rounded-lg" /> : <Users size={18} className="text-faculty-text-secondary" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">{t.studentId?.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="font-faculty-data text-[10px] text-faculty-text-secondary">{t.studentId?.studentId}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ color: urgencyColor, background: urgencyColor + '15' }}>{t.urgency} urgency</span>
                          <span className="font-faculty text-[10px] px-1.5 py-0.5 rounded bg-faculty-bg/60 text-faculty-text-secondary uppercase">{t.category || 'Academic'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'responded' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {t.status === 'resolved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {t.status}
                      </span>
                      <p className="font-faculty-data text-[10px] text-faculty-text-secondary">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-faculty-bg/40 border border-faculty-border/30 text-sm text-faculty-text-secondary leading-relaxed font-faculty">
                    &ldquo;{t.message}&rdquo;
                  </div>

                  {t.response && (
                    <div className="mt-3 pl-3 border-l-2 border-faculty-border/40 space-y-1">
                      <p className="font-faculty text-[10px] text-faculty-text-secondary uppercase tracking-wider">Your Response:</p>
                      <p className="font-faculty text-sm text-faculty-text-secondary">{t.response}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    {t.status !== 'resolved' && (
                      <button
                        onClick={() => setSelected(isSelected ? null : t._id)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isSelected ? 'faculty-card text-faculty-text' : 'faculty-btn'}`}
                      >
                        <MessageSquare size={14} /> {isSelected ? 'Cancel' : t.response ? 'Update Response' : 'Reply Now'}
                      </button>
                    )}
                    {t.status === 'responded' && (
                      <button
                        onClick={() => handleResolve(t._id)}
                        className="px-6 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Resolve
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-3">
                          <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your response here..."
                            rows={3}
                            className="faculty-input w-full resize-none"
                          />
                          <button
                            onClick={() => handleRespond(t._id)}
                            disabled={sending || !response.trim()}
                            className="faculty-btn w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {sending ? 'Sending...' : <><Send size={14} /> Submit Response</>}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
