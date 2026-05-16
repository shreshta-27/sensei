'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Brain, AlertTriangle, Users, Zap, Info, ArrowRight, Activity, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/teacher/PageTransition';
import GlowCard from '@/components/teacher/GlowCard';

const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false });
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then(m => m.PolarRadiusAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });

export default function BehavioralAnalyzerPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/teacher/classes')
      .then(({ data }) => {
        const cls = data.classes || data || [];
        setClasses(cls);
        if (cls.length > 0) setSelectedClass(cls[0]._id);
      })
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/behavior/analyze/${selectedClass}`);
      setData(data.fingerprint);
      toast.success('Behavioral analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const mockRadarData = [
    { subject: 'Attendance', A: 80, B: 40, fullMark: 100 },
    { subject: 'Quiz Velocity', A: 90, B: 30, fullMark: 100 },
    { subject: 'Wellness', A: 70, B: 50, fullMark: 100 },
    { subject: 'Help Frequency', A: 20, B: 85, fullMark: 100 },
    { subject: 'Study Duration', A: 85, B: 20, fullMark: 100 },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-faculty-heading text-xl sm:text-2xl md:text-3xl font-bold text-faculty-text">Behavioral Fingerprint Analyzer</h1>
            <p className="font-faculty text-xs sm:text-sm text-faculty-text-secondary mt-1">Fusing cross-modal signals for proactive student support</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="faculty-input text-sm w-full sm:w-auto"
              disabled={classes.length === 0}
            >
              {classes.length === 0 ? (
                <option value="">No classes found</option>
              ) : (
                classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))
              )}
            </select>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="faculty-btn flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              Run Cross-Signal Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {}
          <GlowCard className="p-5 md:p-6" glowColor="teal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="font-faculty-heading text-sm font-semibold text-faculty-text">Class Fingerprint</h2>
              <div className="flex gap-4 text-[10px] font-faculty-data uppercase">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" /> Avg Student
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-400 rounded-sm" /> At-Risk Group
                </div>
              </div>
            </div>
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                  <PolarGrid stroke="var(--f-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--f-text-secondary)', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Avg Student" dataKey="A" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
                  <Radar name="At-Risk" dataKey="B" stroke="#f87171" fill="#f87171" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ background: 'var(--f-surface)', border: '1px solid var(--f-border)', borderRadius: '8px', color: 'var(--f-text)', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="font-faculty text-xs text-faculty-text-secondary italic text-center mt-2">
              &ldquo;At-risk students show high help frequency but low study duration and quiz velocity.&rdquo;
            </p>
          </GlowCard>

          {}
          <div className="space-y-4">
            <GlowCard className="p-5" glowColor="purple">
              <h3 className="font-faculty-heading text-sm font-semibold text-faculty-ember flex items-center gap-2 mb-4">
                <Zap size={16} /> Proactive Alerts
              </h3>
              <div className="space-y-3">
                {(data?.alerts || [
                  { message: "High correlation between missed 8am sessions and quiz failures in 5 students.", severity: 'warning', matchedStudents: ['Amit K.', 'Saira B.'] },
                  { message: "Wellness stress spikes detected 14 days before mid-sem across 40% of cohort.", severity: 'info' }
                ]).map((alert: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-faculty-bg/40 border border-faculty-border/40 flex gap-3"
                  >
                    <div className={`shrink-0 mt-0.5 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-faculty text-sm text-faculty-text">{alert.message}</p>
                      {alert.matchedStudents && (
                        <p className="font-faculty text-xs text-faculty-text-secondary mt-1">Impacted: {alert.matchedStudents.join(', ')}</p>
                      )}
                      <button className="mt-2 font-faculty-data text-[10px] text-faculty-ember uppercase flex items-center gap-1 hover:underline">
                        Take Action <ArrowRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>

            <GlowCard className="p-5">
              <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text flex items-center gap-2 mb-4">
                <Users size={16} className="text-faculty-teal" /> Deep Correlations Found
              </h3>
              <div className="space-y-3">
                {(data?.correlations || [
                  { pattern: "Help ticket frequency vs Wellness score", impactDescription: "Higher help requests correlate with lower wellness scores in top 10 students." },
                  { pattern: "Attendance Velocity vs Submission Delays", impactDescription: "Drops in attendance velocity predict submission delays by 4.2 days." }
                ]).map((corr: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="p-3 rounded-lg bg-faculty-bg/40 border border-faculty-border/30 flex gap-3"
                  >
                    <div className="mt-0.5 text-emerald-400 shrink-0"><Info size={14} /></div>
                    <div className="min-w-0">
                      <p className="font-faculty-data text-[10px] text-faculty-text-secondary uppercase tracking-wider">{corr.pattern}</p>
                      <p className="font-faculty text-sm text-faculty-text mt-0.5">{corr.impactDescription}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
