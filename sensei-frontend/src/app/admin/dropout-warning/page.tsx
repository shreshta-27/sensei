'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldAlert, Send, Brain, Activity, MessageSquare, Clock } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function DropoutWarningPage() {
  const [queue, setQueue]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/api/dropout/queue');
      setQueue(data.queue || []);
    } catch { toast.error('Failed to load queue'); }
    finally { setLoading(false); }
  };

  const runPrediction = async () => {
    setIsProcessing(true);
    toast.loading('Analyzing cross-modal risk signals…');
    try {
      await api.post('/api/dropout/predict');
      toast.dismiss();
      toast.success('Risk fusion analysis complete!');
      fetchQueue();
    } catch {
      toast.dismiss();
      toast.error('Prediction failed');
    } finally { setIsProcessing(false); }
  };

  const handleIntervene = async (id: string) => {
    try {
      await api.post(`/api/dropout/intervene/${id}`);
      toast.success('Intervention sent!');
      fetchQueue();
      setSelected(null);
    } catch { toast.error('Intervention failed'); }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={24} style={{ color: '#EF4444' }} />
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Dropout Early Warning
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>RAG-enhanced cross-modal risk fusion (89% Accuracy)</p>
        </div>
        <button
          onClick={runPrediction}
          disabled={isProcessing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #EF4444, #F97316)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
        >
          {isProcessing ? <Activity size={16} className="animate-spin" /> : <Brain size={16} />}
          Run Global Risk Analysis
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Queue */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock size={15} style={{ color: 'var(--adm-text-muted)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Prioritized Queue</p>
            </div>
            <span className="adm-badge adm-badge-high">{queue.length} at risk</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: '#EF4444', borderTopColor: 'transparent' }} />
            </div>
          ) : queue.length === 0 ? (
            <div className="adm-card p-8 text-center">
              <ShieldAlert size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--adm-accent)' }} />
              <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Queue empty. Great work!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto adm-scrollbar pr-1">
              {queue.map((item) => (
                <motion.button
                  key={item._id}
                  onClick={() => setSelected(item)}
                  whileHover={{ x: 2 }}
                  className="adm-card p-4 w-full text-left cursor-pointer transition-all"
                  style={{
                    border: selected?._id === item._id ? '1.5px solid rgba(239,68,68,0.4)' : undefined,
                    background: selected?._id === item._id ? 'rgba(255,228,232,0.6)' : undefined,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{item.studentId?.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>{item.studentId?.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black" style={{ color: '#EF4444', fontFamily: 'Space Grotesk, sans-serif' }}>{item.riskScore}%</p>
                      <p className="text-[9px] uppercase font-semibold" style={{ color: 'var(--adm-text-muted)' }}>Risk</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Student card */}
              <div className="adm-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #EF4444, #F97316)' }}>
                      {selected.studentId?.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{selected.studentId?.name}</h2>
                      <p className="text-sm font-mono" style={{ color: 'var(--adm-accent)' }}>{selected.studentId?.studentId}</p>
                    </div>
                  </div>
                  <div className="flex gap-5 text-center">
                    <div>
                      <p className="text-2xl font-black" style={{ color: '#EF4444', fontFamily: 'Space Grotesk, sans-serif' }}>{selected.riskScore}%</p>
                      <p className="text-[9px] uppercase font-bold" style={{ color: 'var(--adm-text-muted)' }}>Risk Level</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black" style={{ color: '#22C55E', fontFamily: 'Space Grotesk, sans-serif' }}>{selected.confidence}%</p>
                      <p className="text-[9px] uppercase font-bold" style={{ color: 'var(--adm-text-muted)' }}>Confidence</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Radar */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--adm-text-muted)' }}>Risk Driver Breakdown</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={selected.riskDrivers || []}>
                          <PolarGrid stroke="rgba(124,58,237,0.15)" />
                          <PolarAngleAxis dataKey="driver" tick={{ fill: 'var(--adm-text-muted)', fontSize: 9 }} />
                          <Radar name="Risk" dataKey="weight" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Triggers */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--adm-text-muted)' }}>Primary Triggers</p>
                    <div className="space-y-2">
                      {selected.riskDrivers?.map((d: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold" style={{ color: 'var(--adm-text)' }}>{d.driver}</span>
                            <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>{(d.weight * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--adm-text-muted)' }}>{d.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Intervention */}
              <div className="adm-card p-6" style={{ border: '1.5px solid rgba(239,68,68,0.2)', background: 'rgba(255,228,232,0.3)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={18} style={{ color: '#EF4444' }} />
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>RAG-Retrieved Intervention</p>
                </div>
                <div className="p-4 rounded-xl italic text-sm leading-relaxed mb-4" style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--adm-text-sub)' }}>
                  "{selected.intervention?.message}"
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleIntervene(selected._id)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #F97316)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
                  >
                    <Send size={15} /> Send Intervention
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="adm-card h-full flex flex-col items-center justify-center text-center p-12" style={{ minHeight: '300px', border: '2px dashed rgba(124,58,237,0.2)' }}>
              <ShieldAlert size={56} className="mb-4 opacity-20" style={{ color: 'var(--adm-accent)' }} />
              <p className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Select a student from the queue</p>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--adm-text-muted)' }}>Analysis prioritizes students based on sentiment from help tickets, attendance, and behavioral patterns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
