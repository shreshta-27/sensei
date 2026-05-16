'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, CheckCircle2, Clock, MessageSquare, 
  RefreshCw, Users 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import StickyNote from '@/components/teacher/StickyNote';
import PaperSheet from '@/components/teacher/PaperSheet';

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
      setTickets(prev => prev.some(t => t._id === newTicket._id) ? prev : [newTicket, ...prev]);
      toast.success('New help ticket received!', { icon: '🙋' });
    });
    return () => { cleanupNew(); };
  }, [on]);

  const handleRespond = async (id: string) => {
    if (!response.trim()) return toast.error('Enter a response');
    setSending(true);
    try {
      const { data } = await api.patch(`/api/help-ticket/${id}/respond`, { response });
      toast.success('Response sent!');
      setTickets((prev) => prev.map((t) => t._id === id ? data : t));
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
      setTickets((prev) => prev.map((t) => t._id === id ? data : t));
    } catch {
      toast.error('Failed to resolve ticket');
    }
  };

  if (loading && tickets.length === 0) return <div className="p-8 text-center handwriting text-2xl">Consulting student queue...</div>;

  const filtered = tickets.filter((t) =>
    filter === 'all' ? true : filter === 'pending' ? t.status === 'pending' : t.status === filter
  );

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    responded: tickets.filter(t => t.status === 'responded').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">Help Queue</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Real-time student support & intervention</p>
        </div>
        <button
          onClick={() => fetchTickets(true)}
          disabled={refreshing}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Sync Queue'}
        </button>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL', value: stats.total, color: 'blue' as const },
          { label: 'PENDING', value: stats.pending, color: 'yellow' as const },
          { label: 'RESPONDED', value: stats.responded, color: 'green' as const },
          { label: 'RESOLVED', value: stats.resolved, color: 'purple' as const },
        ].map((stat, i) => (
          <StickyNote key={stat.label} color={stat.color} rotation={i % 2 === 0 ? -1 : 1}>
             <span className="text-[10px] font-black tracking-widest text-gray-600 uppercase">{stat.label}</span>
             <span className="text-4xl font-black text-[#1A1A1A] mt-auto">{stat.value}</span>
          </StickyNote>
        ))}
      </div>

      {}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {(['all', 'pending', 'responded', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <PaperSheet className="text-center py-20">
             <HelpCircle size={64} className="mx-auto text-gray-200 mb-4" />
             <h2 className="text-2xl font-bold text-gray-800">Clear Desk Policy!</h2>
             <p className="text-gray-500">No student queries in this category currently.</p>
          </PaperSheet>
        ) : (
          filtered.map((t, i) => {
            const urgencyColor = t.urgency === 'high' ? 'text-red-500' : t.urgency === 'medium' ? 'text-orange-500' : 'text-green-500';
            
            return (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PaperSheet className="relative overflow-hidden group hover:border-purple-200 transition-all">
                   <div className="flex flex-col md:flex-row gap-6">
                      {}
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold shadow-sm">
                                  {t.studentId?.name.charAt(0)}
                               </div>
                               <div>
                                  <h3 className="text-lg font-bold text-gray-800">{t.studentId?.name}</h3>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {t.studentId?.studentId}</p>
                               </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current ${urgencyColor} bg-opacity-5`}>
                               {t.urgency || 'MEDIUM'} URGENCY
                            </div>
                         </div>
                         
                         <div className="bg-[#FFFDF6] p-6 rounded-2xl border border-orange-100 relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-red-100" />
                            <p className="handwriting text-xl text-gray-700 pl-4">"{t.message}"</p>
                         </div>

                         {t.response && (
                           <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">YOUR RESPONSE</p>
                              <p className="text-sm font-bold text-purple-800">{t.response}</p>
                           </div>
                         )}
                      </div>

                      {}
                      <div className="md:w-64 shrink-0 flex flex-col gap-3 justify-center">
                         <div className="text-right mb-auto">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RECEIVED</p>
                            <p className="text-xs font-bold text-gray-600">{new Date(t.createdAt).toLocaleString()}</p>
                         </div>
                         
                         <div className="space-y-2">
                            {t.status !== 'resolved' && (
                              <button 
                                onClick={() => setSelected(selected === t._id ? null : t._id)}
                                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                              >
                                 <MessageSquare size={16} /> {t.response ? 'Update' : 'Respond'}
                              </button>
                            )}
                            {t.status === 'responded' && (
                              <button 
                                onClick={() => handleResolve(t._id)}
                                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                              >
                                 <CheckCircle2 size={16} /> Resolve
                              </button>
                            )}
                            {t.status === 'resolved' && (
                               <div className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-100">
                                  <CheckCircle2 size={16} /> RESOLVED
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {}
                   <AnimatePresence>
                      {selected === t._id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                           <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                              <textarea 
                                value={response}
                                onChange={e => setResponse(e.target.value)}
                                placeholder="Type your response to the student..."
                                className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 focus:border-b-purple-500 outline-none handwriting text-xl h-32 resize-none transition-all"
                              />
                              <div className="flex gap-3 mt-4">
                                 <button onClick={() => setSelected(null)} className="flex-1 py-3 bg-white text-gray-500 font-bold border border-gray-100 rounded-xl">Cancel</button>
                                 <button 
                                   onClick={() => handleRespond(t._id)}
                                   disabled={sending}
                                   className="flex-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 disabled:opacity-50"
                                 >
                                    {sending ? 'Sending...' : 'Send Response'}
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </PaperSheet>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
