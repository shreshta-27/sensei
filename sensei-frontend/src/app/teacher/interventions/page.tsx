'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, X, Loader2, Filter } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/teacher/PageTransition';
import EmptyState from '@/components/teacher/EmptyState';
import { TableSkeleton } from '@/components/teacher/LoadingSkeleton';
import type { Intervention } from '@/types';

const urgencyColors: Record<string, string> = {
  critical: 'bg-faculty-danger/10 text-faculty-danger border-faculty-danger/20',
  high: 'bg-faculty-warning/10 text-faculty-warning border-faculty-warning/20',
  medium: 'bg-faculty-ember/10 text-faculty-ember border-faculty-ember/20',
  low: 'bg-faculty-teal/10 text-faculty-teal border-faculty-teal/20',
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

  if (loading) return <TableSkeleton rows={5} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-faculty-heading text-2xl font-bold text-faculty-text">Interventions</h1>
            <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Track and manage student interventions</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="faculty-btn flex items-center gap-2">
            <Plus size={16} /> Create Intervention
          </button>
        </div>

        {}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <Filter size={14} className="text-faculty-text-secondary shrink-0" />
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                filter === s
                  ? 'bg-faculty-ember/15 text-faculty-ember border border-faculty-ember/30'
                  : 'text-faculty-text-secondary hover:text-faculty-text border border-faculty-border hover:border-faculty-text-secondary/30'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No Interventions" description="No interventions match the current filter." />
        ) : (
          <div className="space-y-3">
            {filtered.map((iv, i) => (
              <motion.div
                key={iv._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="faculty-card p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    iv.urgency === 'critical' ? 'bg-faculty-danger' :
                    iv.urgency === 'high' ? 'bg-faculty-warning' :
                    iv.urgency === 'medium' ? 'bg-faculty-ember' : 'bg-faculty-teal'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${urgencyColors[iv.urgency] || urgencyColors.medium}`}>
                        {iv.urgency}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        iv.status === 'resolved' ? 'bg-faculty-success/10 text-faculty-success' :
                        iv.status === 'in-progress' ? 'bg-faculty-warning/10 text-faculty-warning' :
                        'bg-faculty-text-secondary/10 text-faculty-text-secondary'
                      }`}>
                        {iv.status}
                      </span>
                    </div>
                    <p className="font-faculty text-sm text-faculty-text mb-1">{iv.message}</p>
                    <p className="font-faculty text-xs text-faculty-text-secondary">
                      Student: {typeof iv.studentId === 'object' ? iv.studentId.name : iv.studentId || 'Unknown'}
                      {iv.createdAt && ` • ${new Date(iv.createdAt).toLocaleDateString()}`}
                    </p>
                    {iv.tags && iv.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {iv.tags.map((tag, ti) => (
                          <span key={ti} className="px-2 py-0.5 rounded-md text-[10px] bg-faculty-purple/10 text-faculty-purple">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {iv.status !== 'resolved' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => updateOutcome(iv._id, 'improved')} className="faculty-btn-ghost text-xs px-3 py-1.5">Improved</button>
                      <button onClick={() => updateOutcome(iv._id, 'worsened')} className="text-xs px-3 py-1.5 rounded-lg border border-faculty-danger/30 text-faculty-danger hover:bg-faculty-danger/10 transition-colors">Worsened</button>
                    </div>
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
                  <h2 className="font-faculty-heading text-lg font-bold text-faculty-text">Create Intervention</h2>
                  <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Student ID</label>
                    <input value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} className="faculty-input w-full" placeholder="Student ID (optional)" />
                  </div>
                  <div>
                    <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Message</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="faculty-input w-full h-24 resize-none" placeholder="Describe the intervention..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Urgency</label>
                      <select value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))} className="faculty-input w-full">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Tags</label>
                      <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="faculty-input w-full" placeholder="comma,separated" />
                    </div>
                  </div>
                  <button onClick={createIntervention} disabled={creating} className="faculty-btn w-full flex items-center justify-center gap-2">
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {creating ? 'Creating...' : 'Create Intervention'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
