'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, ShieldAlert, Send, Brain, Users, TrendingDown, Clock, Search, Filter, Mail, MessageSquare, ChevronRight, Activity } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function DropoutWarningPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/api/dropout/queue');
      setQueue(data.queue || []);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async () => {
    setIsProcessing(true);
    toast.loading('Analyzing cross-modal risk signals...');
    try {
      await api.post('/api/dropout/predict');
      toast.dismiss();
      toast.success('Risk fusion analysis complete!');
      fetchQueue();
    } catch (err) {
      toast.dismiss();
      toast.error('Prediction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIntervene = async (id: string) => {
    try {
      await api.post(`/api/dropout/intervene/${id}`);
      toast.success('Intervention sent!');
      fetchQueue();
      setSelectedStudent(null);
    } catch (err) {
      toast.error('Intervention failed');
    }
  };

  return (
    <div className="space-y-8 pb-20 cosmos-container text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="cosmos-title text-4xl">Dropout Early Warning System</h1>
          <p className="cosmos-text opacity-70">RAG-enhanced cross-modal risk fusion (89% Accuracy)</p>
        </div>
        <button 
            onClick={runPrediction} 
            disabled={isProcessing}
            className="cosmos-btn-primary flex items-center gap-2"
        >
          {isProcessing ? <Activity className="animate-spin" /> : <Brain />} RUN GLOBAL RISK ANALYSIS
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-display flex items-center gap-2">
                  <Clock size={18} /> Prioritized Queue
              </h2>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded border border-red-500/30 uppercase">High Risk</span>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {queue.map((item) => (
                <div 
                    key={item._id}
                    onClick={() => setSelectedStudent(item)}
                    className={`cosmos-card p-4 cursor-pointer transition-all border border-white/5 hover:border-cyan-500/50 ${selectedStudent?._id === item._id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-white/5'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-cyan-400">{item.studentId?.name}</p>
                            <p className="text-xs opacity-60">{item.studentId?.department}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-display text-red-500">{item.riskScore}%</p>
                            <p className="text-[8px] uppercase opacity-50">Risk Score</p>
                        </div>
                    </div>
                </div>
            ))}
            {queue.length === 0 && !loading && (
                <div className="text-center py-20 opacity-30">
                    <ShieldAlert size={48} className="mx-auto mb-4" />
                    <p>Queue is empty. Great work!</p>
                </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
              <div className="cosmos-card p-6 bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                            {selectedStudent.studentId?.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-display text-white">{selectedStudent.studentId?.name}</h2>
                            <p className="text-cyan-400 font-mono text-sm">{selectedStudent.studentId?.studentId}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-display text-red-500">{selectedStudent.riskScore}%</p>
                            <p className="text-[10px] uppercase opacity-50">Risk Level</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-display text-green-400">{selectedStudent.confidence}%</p>
                            <p className="text-[10px] uppercase opacity-50">Confidence</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-display text-cyan-400">Risk Driver Breakdown</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedStudent.riskDrivers || []}>
                                    <PolarGrid stroke="#ffffff33" />
                                    <PolarAngleAxis dataKey="driver" tick={{ fill: '#ffffff99', fontSize: 10 }} />
                                    <Radar name="Risk" dataKey="weight" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-display text-cyan-400">Primary Triggers</h3>
                        <div className="space-y-2">
                            {selectedStudent.riskDrivers?.map((d: any, i: number) => (
                                <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm">{d.driver}</span>
                                        <span className="text-red-400 text-xs font-mono">{(d.weight * 100).toFixed(0)}%</span>
                                    </div>
                                    <p className="text-xs opacity-60 leading-relaxed">{d.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

              {}
              <div className="cosmos-card p-6 bg-cyan-500/5 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-4 text-cyan-400 font-display text-xl">
                    <MessageSquare size={24} /> RAG-Retrieved Intervention
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/10 mb-6 italic text-gray-300">
                    "{selectedStudent.intervention?.message}"
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-cyan-400/60 uppercase font-mono">
                        <Activity size={14} /> Recommendation: Personal Meeting
                    </div>
                    <button 
                        onClick={() => handleIntervene(selectedStudent._id)}
                        className="cosmos-btn-primary px-8 py-3 flex items-center gap-2"
                    >
                        <Send size={18} /> SEND INTERVENTION
                    </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[600px] cosmos-card flex flex-col items-center justify-center opacity-30 border-dashed border-2 border-white/10">
                <ShieldAlert size={80} className="mb-4" />
                <p className="text-2xl font-display">Select a student from the queue</p>
                <p className="max-w-md text-center mt-2">Analysis prioritizes students based on sentiment from help tickets, attendance velocity, and behavioral patterns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
