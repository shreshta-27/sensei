'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Plus, Filter, MessageSquare, AlertTriangle, 
  CheckCircle2, Clock, X, Search, MoreVertical 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PaperSheet from '@/components/teacher/PaperSheet';
import type { Intervention } from '@/types';

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-50 text-red-600 border-red-100',
  high: 'bg-orange-50 text-orange-600 border-orange-100',
  medium: 'bg-blue-50 text-blue-600 border-blue-100',
  low: 'bg-green-50 text-green-600 border-green-100',
};

const statusFilters = ['all', 'pending', 'in-progress', 'resolved'];

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ studentId: '', message: '', urgency: 'medium', tags: '' });

  useEffect(() => { fetchInterventions(); }, []);

  const fetchInterventions = () => {
    api.get('/api/teacher/interventions')
      .then(({ data }) => setInterventions(data.interventions || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const createIntervention = async () => {
    if (!form.message) { toast.error('Message is required'); return; }
    setCreating(true);
    try {
      await api.post('/api/teacher/interventions', {
        studentId: form.studentId || undefined,
        message: form.message,
        urgency: form.urgency,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast.success('Intervention created!');
      setShowCreate(false);
      setForm({ studentId: '', message: '', urgency: 'medium', tags: '' });
      fetchInterventions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const updateOutcome = async (id: string, outcome: string) => {
    try {
      await api.patch(`/api/teacher/interventions/${id}/outcome`, { outcome });
      toast.success('Outcome updated');
      fetchInterventions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const filtered = interventions.filter(iv => filter === 'all' || iv.status === filter);

  if (loading && interventions.length === 0) return <div className="p-8 text-center handwriting text-2xl">Accessing intervention logs...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">Smart Interventions</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Coordinate support and track student wellness</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Create Intervention
        </button>
      </div>

      {}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              filter === s
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100'
                : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200'
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 gap-6">
        {filtered.length === 0 ? (
          <PaperSheet className="text-center py-20">
             <AlertTriangle size={64} className="mx-auto text-gray-200 mb-4" />
             <h2 className="text-2xl font-bold text-gray-800">No interventions found</h2>
             <p className="text-gray-500">The classroom seems stable for now.</p>
          </PaperSheet>
        ) : (
          filtered.map((iv, i) => (
            <motion.div
              key={iv._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PaperSheet className="hover:border-purple-300 transition-all">
                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${urgencyColors[iv.urgency]}`}>
                             {iv.urgency}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            iv.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                             {iv.status}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                             CREATED: {new Date(iv.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                       </div>
                       
                       <h3 className="text-xl font-bold text-gray-800 mb-2">
                         {typeof iv.studentId === 'object' ? iv.studentId.name : 'Class Intervention'}
                       </h3>
                       <p className="handwriting text-gray-600 text-lg mb-4">{iv.message}</p>
                       
                       {iv.tags && iv.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                             {iv.tags.map((tag, ti) => (
                               <span key={ti} className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">#{tag.toUpperCase()}</span>
                             ))}
                          </div>
                       )}
                    </div>
                    
                    {iv.status !== 'resolved' && (
                      <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                        <button 
                          onClick={() => updateOutcome(iv._id, 'improved')}
                          className="w-full px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md shadow-green-100 hover:scale-105 transition-all"
                        >
                          Mark Improved
                        </button>
                        <button 
                          onClick={() => updateOutcome(iv._id, 'worsened')}
                          className="w-full px-6 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-all"
                        >
                          Flag Critical
                        </button>
                      </div>
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
              <PaperSheet title="NEW INTERVENTION">
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student ID (Optional)</label>
                     <input 
                       value={form.studentId}
                       onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                       placeholder="e.g. STU12345" 
                       className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-xl transition-all"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observation / Message</label>
                     <textarea 
                       value={form.message}
                       onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                       placeholder="Describe what you've observed..." 
                       className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-lg h-32 resize-none transition-all"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Urgency</label>
                        <select 
                          value={form.urgency} 
                          onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))}
                          className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2.5 px-4 focus:border-b-purple-500 outline-none font-bold text-gray-600 transition-all appearance-none"
                        >
                           <option value="low">LOW</option>
                           <option value="medium">MEDIUM</option>
                           <option value="high">HIGH</option>
                           <option value="critical">CRITICAL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tags</label>
                        <input 
                          value={form.tags}
                          onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                          placeholder="e.g. academic, behavior" 
                          className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2.5 px-4 focus:border-b-purple-500 outline-none handwriting text-lg transition-all"
                        />
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setShowCreate(false)}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={createIntervention}
                        disabled={creating}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {creating ? 'Recording...' : 'File Intervention'}
                      </button>
                   </div>
                </div>
              </PaperSheet>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
