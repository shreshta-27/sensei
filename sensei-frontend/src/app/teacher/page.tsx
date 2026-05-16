'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, AlertTriangle, HelpCircle, Star, BookOpen,
  TrendingUp, BarChart3, Lightbulb, ArrowRight, Zap, Sparkles
} from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';
import PageTransition from '@/components/teacher/PageTransition';
import StatsCard from '@/components/teacher/StatsCard';
import GlowCard from '@/components/teacher/GlowCard';
import { PageSkeleton } from '@/components/teacher/LoadingSkeleton';

const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });

export default function TeacherDashboard() {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { on } = useSocket('/teacher');

  useEffect(() => {
    fetchDashboard();

    const offHelp = on('help:new_ticket', () => {
      setData(prev => prev ? { ...prev, pendingHelpTickets: (prev.pendingHelpTickets || 0) + 1 } : null);
      toast.success('New help ticket received!', { icon: '🙋' });
    });

    const offPollNew = on('poll:new', () => {
      setData(prev => prev ? { ...prev, pollActivity: { ...prev.pollActivity, active: (prev.pollActivity?.active || 0) + 1 } } : null);
    });

    const offPollClosed = on('poll:closed', () => {
      setData(prev => prev ? { ...prev, pollActivity: { ...prev.pollActivity, active: Math.max(0, (prev.pollActivity?.active || 1) - 1) } } : null);
    });

    return () => { offHelp(); offPollNew(); offPollClosed(); };
  }, [on]);

  const fetchDashboard = () => {
    api.get('/api/teacher/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  if (loading) return <PageSkeleton />;

  if (error) return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-64">
        <p className="font-faculty-heading text-lg text-faculty-danger">⚠️ {error}</p>
        <button onClick={fetchDashboard} className="faculty-btn mt-4">Retry</button>
      </div>
    </PageTransition>
  );

  if (!data) return null;

  const riskPie = [
    { name: 'Safe', value: ((data.totalStudents as number) || 0) - ((data.atRiskCount as number) || 0) - ((data.criticalCount as number) || 0), color: '#10B981' },
    { name: 'At Risk', value: (data.atRiskCount as number) || 0, color: '#F59E0B' },
    { name: 'Critical', value: (data.criticalCount as number) || 0, color: '#EF4444' },
  ];

  const stats = [
    { label: 'My Students', value: data.totalStudents || 0, icon: Users, color: '#10B981' },
    { label: 'At Risk', value: data.atRiskCount || 0, icon: AlertTriangle, color: '#F59E0B' },
    { label: 'Help Tickets', value: data.pendingHelpTickets || 0, icon: HelpCircle, color: '#EF4444' },
    { label: 'Effectiveness', value: `${data.effectivenessScore || 0}%`, icon: Star, color: '#FF6B35' },
    { label: 'Subjects', value: ((data.subjects as string[]) || []).length, icon: BookOpen, color: '#8B5CF6' },
    { label: 'Pass Rate', value: `${data.classPassRate || 0}%`, icon: TrendingUp, color: '#14B8A6' },
    { label: 'Active Polls', value: (data.pollActivity as any)?.active || 0, icon: BarChart3, color: '#FF9F1C' },
    { label: 'Critical', value: data.criticalCount || 0, icon: Zap, color: '#EF4444' },
  ];

  const recommendations: string[] = (data.teachingRecommendations as string[]) || [
    'Focus on at-risk students with personalized sessions.',
    'Use AI quiz feature for adaptive assessments.',
    'Schedule interventions for low-attendance students.',
  ];

  const quickActions = [
    { label: 'Live Polls', href: '/teacher/polls', icon: BarChart3, color: '#FF9F1C' },
    { label: 'Interventions', href: '/teacher/interventions', icon: AlertTriangle, color: '#EF4444' },
    { label: 'Help Queue', href: '/teacher/help-queue', icon: HelpCircle, color: '#14B8A6' },
    { label: 'AI Content', href: '/teacher/ai-content', icon: Sparkles, color: '#8B5CF6' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="font-faculty-heading text-2xl md:text-3xl font-bold text-faculty-text">
              Faculty Dashboard
            </h1>
            <p className="font-faculty text-sm text-faculty-text-secondary mt-1">
              Welcome back — here&apos;s your class overview & AI insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-faculty-success animate-glow-pulse" />
            <span className="font-faculty text-xs text-faculty-text-secondary">Live</span>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, i) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              delay={i * 0.05}
            />
          ))}
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {}
          <GlowCard className="lg:col-span-1" delay={0.2}>
            <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text mb-4">Student Risk Overview</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPie.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--f-surface)',
                      border: '1px solid var(--f-border)',
                      borderRadius: '8px',
                      color: 'var(--f-text)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              {riskPie.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="font-faculty text-xs text-faculty-text-secondary">{item.name}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          {}
          <GlowCard className="lg:col-span-2" glowColor="purple" delay={0.3}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-faculty-ember-light" />
              <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">AI Recommendations</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-faculty-bg/50 border border-faculty-border/50"
                >
                  <span className="font-faculty-data text-xs text-faculty-ember font-bold mt-0.5">0{i + 1}</span>
                  <p className="font-faculty text-sm text-faculty-text-secondary">{rec}</p>
                </motion.div>
              ))}
            </div>
          </GlowCard>
        </div>

        {}
        <div>
          <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                onClick={() => router.push(action.href)}
                className="faculty-card p-4 flex flex-col items-center gap-2 group hover:border-opacity-50 text-center"
                style={{ '--hover-color': action.color } as any}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${action.color}15` }}
                >
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <span className="font-faculty text-xs text-faculty-text-secondary group-hover:text-faculty-text transition-colors">{action.label}</span>
                <ArrowRight size={12} className="text-faculty-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>

        {}
        {data.recentInterventions && (data.recentInterventions as any[]).length > 0 && (
          <GlowCard delay={0.6}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">Recent Interventions</h3>
              <button onClick={() => router.push('/teacher/interventions')} className="font-faculty text-xs text-faculty-ember hover:underline">
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {(data.recentInterventions as any[]).slice(0, 4).map((iv: any, i: number) => (
                <div key={iv._id || i} className="flex items-center gap-3 p-3 rounded-lg bg-faculty-bg/50 border border-faculty-border/50">
                  <div className={`w-2 h-2 rounded-full ${
                    iv.urgency === 'critical' ? 'bg-faculty-danger' :
                    iv.urgency === 'high' ? 'bg-faculty-warning' : 'bg-faculty-teal'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-faculty text-sm text-faculty-text truncate">{iv.message}</p>
                    <p className="font-faculty text-xs text-faculty-text-secondary">
                      {typeof iv.studentId === 'object' ? iv.studentId.name : 'Student'} • {iv.status}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    iv.status === 'resolved' ? 'bg-faculty-success/10 text-faculty-success' :
                    iv.status === 'in-progress' ? 'bg-faculty-warning/10 text-faculty-warning' :
                    'bg-faculty-text-secondary/10 text-faculty-text-secondary'
                  }`}>
                    {iv.status}
                  </span>
                </div>
              ))}
            </div>
          </GlowCard>
        )}
      </div>
    </PageTransition>
  );
}
