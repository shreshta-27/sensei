'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Plus, Lock, Trash2, X, Loader2 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import PaperSheet from '@/components/teacher/PaperSheet';
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

  if (loading && polls.length === 0) return <div className="p-8 text-center handwriting text-2xl">Collecting poll data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">Live Polls</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Capture real-time classroom insights</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Create New Poll
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.length === 0 ? (
           <div className="col-span-full">
              <PaperSheet className="text-center py-20">
                 <BarChart3 size={64} className="mx-auto text-gray-200 mb-4" />
                 <h2 className="text-2xl font-bold text-gray-800">No active polls</h2>
                 <p className="text-gray-500">Engage your students by launching a quick poll.</p>
              </PaperSheet>
           </div>
        ) : (
          polls.map((poll, i) => (
            <motion.div
              key={poll._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <PaperSheet className="h-full flex flex-col justify-between hover:border-purple-300 transition-all">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      {poll.isOpen ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">LIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full">
                           <Lock size={12} className="text-gray-400" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CLOSED</span>
                        </div>
                      )}
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         {poll.responses?.length || 0} RESPONSES
                      </span>
                   </div>
                   
                   <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-2">{poll.question}</h3>
                   
                   <div className="space-y-2 mb-6">
                      {poll.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-purple-200 transition-all">
                           <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-purple-600">
                              {String.fromCharCode(65 + oi)}
                           </div>
                           <span className="text-xs font-bold text-gray-600">{opt}</span>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => viewResults(poll)}
                     className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                   >
                     Analyze Results
                   </button>
                   {poll.isOpen && (
                     <button 
                       onClick={() => closePoll(poll._id)}
                       className="w-11 h-11 flex items-center justify-center border border-red-100 text-red-400 rounded-xl hover:bg-red-50 transition-all"
                       title="Close Poll"
                     >
                       <Lock size={16} />
                     </button>
                   )}
                </div>
              </PaperSheet>
            </motion.div>
          ))
        )}
      </div>

      {}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <PaperSheet title="LAUNCH POLL">
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">The Question</label>
                      <input 
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        placeholder="e.g. Do you understand the concept of recursion?" 
                        className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-xl transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Response Options</label>
                       {options.map((opt, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                               {String.fromCharCode(65 + i)}
                            </div>
                            <input 
                              value={opt}
                              onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                              className="flex-1 bg-gray-50 border-b border-gray-200 py-2 px-1 focus:border-purple-400 outline-none handwriting text-lg transition-all"
                              placeholder={`Option ${i + 1}`}
                            />
                            {options.length > 2 && (
                               <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="p-2 text-gray-300 hover:text-red-400">
                                  <Trash2 size={16} />
                               </button>
                            )}
                         </div>
                       ))}
                       {options.length < 6 && (
                          <button 
                            onClick={() => setOptions([...options, ''])}
                            className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline mt-2 ml-1"
                          >
                             + Add Choice
                          </button>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Classroom (Optional)</label>
                       <select 
                         value={classId} 
                         onChange={e => setClassId(e.target.value)}
                         className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2.5 px-4 focus:border-b-purple-500 outline-none font-bold text-gray-600 transition-all appearance-none"
                       >
                          <option value="">GLOBAL (ALL CLASSES)</option>
                          {classList.map(c => (
                            <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>
                          ))}
                       </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                       <button onClick={() => setShowCreate(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                       <button 
                         onClick={createPoll}
                         disabled={creating}
                         className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-all disabled:opacity-50"
                       >
                         {creating ? 'Launching...' : 'Broadcast Poll'}
                       </button>
                    </div>
                 </div>
              </PaperSheet>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {selectedPoll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => { setSelectedPoll(null); setResults(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <PaperSheet title="POLL ANALYSIS">
                 <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800">{selectedPoll.question}</h3>
                    <p className="handwriting text-gray-500 text-lg">Statistical distribution of responses</p>
                 </div>
                 
                 {results && results.length > 0 ? (
                    <div className="h-64 mb-6">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChartComponent data={results.map(r => ({ name: r.option || r.name, count: r.count || r.value || 0 }))}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                             <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                             <Bar dataKey="count" fill="#9333EA" radius={[8, 8, 0, 0]} barSize={40} />
                          </BarChartComponent>
                       </ResponsiveContainer>
                    </div>
                 ) : (
                    <div className="py-20 text-center italic text-gray-400">Waiting for student input...</div>
                 )}
                 
                 <button 
                   onClick={() => { setSelectedPoll(null); setResults(null); }}
                   className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                 >
                    Close Analysis
                 </button>
              </PaperSheet>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
