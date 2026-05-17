'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import StickyCard from '@/components/faculty/StickyCard';
import KPICard from '@/components/faculty/KPICard';
import ComicButton from '@/components/faculty/ComicButton';
import RiskBadge from '@/components/faculty/RiskBadge';
import {
  RadarChart, PolarGrid, Radar, ResponsiveContainer,
  LineChart, Line, BarChart, Bar,
} from 'recharts';
import {
  Sparkles, TrendingUp, TrendingDown, Users, AlertTriangle,
  BookOpen, Clock, ArrowRight, Eye, Activity, BrainCircuit,
  Zap, MessageSquare, UserX
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA TYPES
   ───────────────────────────────────────────── */
interface InsightItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  avatar?: string;
  risk: 'high' | 'medium' | 'low';
  actionLabel: string;
}

interface Recommendation {
  id: string;
  text: string;
}

interface DepartmentMetric {
  name: string;
  mine: number;
  deptAvg: number;
}

interface CoachingReport {
  hasData: boolean;
  trend: 'improving' | 'stable' | 'declining';
  bullets: string[];
}

/* ─────────────────────────────────────────────
   MOCK DATA
   ───────────────────────────────────────────── */
const fourWeekHistory = [
  { week: 'W1', score: 78 },
  { week: 'W2', score: 80 },
  { week: 'W3', score: 83 },
  { week: 'W4', score: 87 },
];

const radarData = [
  { metric: 'Engagement', value: 80, fullMark: 100 },
  { metric: 'Pacing', value: 75, fullMark: 100 },
  { metric: 'Clarity', value: 88, fullMark: 100 },
  { metric: 'Feedback', value: 82, fullMark: 100 },
  { metric: 'Assessment', value: 70, fullMark: 100 },
  { metric: 'Attendance', value: 65, fullMark: 100 },
];

const departmentData: DepartmentMetric[] = [
  { name: 'Engagement', mine: 88, deptAvg: 78 },
  { name: 'Assessment', mine: 82, deptAvg: 75 },
  { name: 'Feedback', mine: 91, deptAvg: 80 },
  { name: 'Pacing', mine: 76, deptAvg: 72 },
  { name: 'Attendance', mine: 68, deptAvg: 74 },
  { name: 'Clarity', mine: 85, deptAvg: 79 },
];

const insights: InsightItem[] = [
  {
    id: '1',
    icon: <Users size={16} />,
    title: 'RKAH — Performance declining in DS Algo. Suggested: 1:1 Mentorship',
    avatar: '👤',
    risk: 'medium',
    actionLabel: 'Take Action →',
  },
  {
    id: '2',
    icon: <AlertTriangle size={16} />,
    title: 'Burnout signs in 3 students — irregular submission patterns detected',
    risk: 'high',
    actionLabel: 'View Students →',
  },
  {
    id: '3',
    icon: <UserX size={16} />,
    title: 'Attendance dropping in 8 students — average below 65%',
    risk: 'medium',
    actionLabel: 'Review →',
  },
  {
    id: '4',
    icon: <BookOpen size={16} />,
    title: '"Binary Trees" is weak topic — 40% of class scored below passing grade',
    risk: 'low',
    actionLabel: 'Take Action →',
  },
  {
    id: '5',
    icon: <Clock size={16} />,
    title: 'Late submission rate up 12% this week across both sections',
    risk: 'low',
    actionLabel: 'Review →',
  },
  {
    id: '6',
    icon: <MessageSquare size={16} />,
    title: 'OOP concepts still unclear for 5 students based on quiz results',
    risk: 'medium',
    actionLabel: 'Take Action →',
  },
];

const recommendations: Recommendation[] = [
  { id: 'r1', text: 'Remedial session on Binary Trees' },
  { id: 'r2', text: 'Attendance awareness campaign' },
  { id: 'r3', text: 'Concept review: OOP basics' },
];

const coachingReport: CoachingReport = {
  hasData: true,
  trend: 'improving',
  bullets: [
    'Maintain current engagement strategies with high-performing students.',
    'Introduce peer tutoring for DS Algo to raise class average.',
    'Schedule a 30-min catch-up session for the 3 flagged students.',
  ],
};

const insightColors: Record<string, 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange'> = {
  '1': 'pink', '2': 'orange', '3': 'blue', '4': 'yellow', '5': 'purple', '6': 'green',
};

/* ─────────────────────────────────────────────
   COMPONENTS
   ───────────────────────────────────────────── */
function CircularGauge({ value }: { value: number }) {
  const radius = 46;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} stroke="var(--border-card)" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={radius}
          stroke="var(--accent-green)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[38px] leading-none text-[var(--accent-green)]">{value}%</span>
        <span className="font-ui text-[10px] text-[var(--text-muted)] uppercase tracking-wide mt-1">Effectiveness</span>
      </div>
    </div>
  );
}

const TrendIcon: Record<string, React.ReactNode> = {
  improving: <TrendingUp size={16} className="text-[var(--accent-green)]" />,
  stable: <Activity size={16} className="text-[var(--accent-gold)]" />,
  declining: <TrendingDown size={16} className="text-[var(--accent-red)]" />,
};

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */
export default function AIInsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        // Attempt real API — fall back to mock on error
        await api.get('/teacher/ai-insights');
      } catch {
        // silently fall back to mock
      }
      if (!cancelled) setLoading(false);
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-page)] font-ui text-[var(--text-primary)] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-72 bg-[var(--border-card)] rounded-lg" />
            <div className="h-8 w-96 bg-[var(--border-card)] rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-[var(--border-card)] rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-page)] font-ui text-[var(--text-primary)] min-h-screen py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col items-center text-center gap-1 pt-2 pb-4">
          <motion.h1
            className="font-display text-[40px] leading-none tracking-wide flex items-center gap-3"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            AI Insight Board
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            >
              ✦
            </motion.span>
          </motion.h1>
          <motion.p
            className="font-ui text-sm text-[var(--text-secondary)] flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={13} className="text-[var(--accent-gold)]" />
            Powered by Gemini AI · Updated just now
          </motion.p>
        </div>

        {/* ── TEACHING EFFECTIVENESS ── */}
        <section>
          <StickyCard color="yellow" pinned className="scroll-mt-24">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Gauge + tip */}
              <div className="flex flex-col items-center gap-5 min-w-[180px]">
                <CircularGauge value={87} />
                <motion.p
                  className="font-ui text-center text-[var(--text-secondary)] text-sm leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your effectiveness this week: <strong className="text-[var(--accent-green)]">87%</strong>
                </motion.p>
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <StickyCard color="green" className="!shadow-none">
                    <p className="font-ui text-xs text-[var(--text-secondary)] flex items-center gap-2">
                      <BrainCircuit size={14} className="text-[var(--accent-green)]" />
                      AI coaching tip:{' '}
                      <span className="text-[var(--text-primary)] font-semibold">
                        Focus on attendance — 3 students need 1:1 catch-up.
                      </span>
                    </p>
                  </StickyCard>
                </motion.div>
              </div>

              {/* 4-week trend line chart */}
              <div className="flex-1 w-full min-w-0">
                <h3 className="font-ui text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  ▲ 4-Week Trend
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={fourWeekHistory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--accent-green)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: 'var(--accent-green)', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                    <PolarGrid stroke="var(--border-card)" />
                    <Radar name="Score" dataKey="value" stroke="var(--accent-blue)" fill="var(--sticky-blue)" fillOpacity={0.55} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StickyCard>
        </section>

        {/* ── INSIGHTS GRID ── */}
        <section>
          <h2 className="font-display text-2xl tracking-wide mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            {/* inline sparkle */}
            <motion.span
              animate={{ y: [0, -6, 0], rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="inline-block mr-2"
            >
              ✦
            </motion.span>
            Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {insights.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16, rotate: (i % 2 === 0 ? -1.5 : 1.2) }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1 : 1 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                whileHover={{ y: -4, rotate: 0 }}
              >
                <StickyCard color={insightColors[item.id]} className="!shadow-none h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 text-[var(--text-secondary)]">
                      {item.avatar ? (
                        <span className="text-lg">{item.avatar}</span>
                      ) : (
                        item.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-xs text-[var(--text-primary)] leading-relaxed mb-2">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <RiskBadge level={item.risk} />
                        <ComicButton
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push('/teacher/interventions')}
                          className="!shadow-none !border-0 text-[var(--accent-purple)] text-xs px-2 py-1"
                        >
                          {item.actionLabel}
                        </ComicButton>
                      </div>
                    </div>
                  </div>
                </StickyCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── RECOMMENDATIONS ── */}
        <section>
          <h2 className="font-display text-2xl tracking-wide mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Based on class performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <StickyCard color="green" className="!shadow-none">
                  <div className="flex flex-col gap-3">
                    <p className="font-ui text-sm font-semibold text-[var(--text-primary)]">
                      {rec.text}
                    </p>
                    <ComicButton
                      size="sm"
                      variant="primary"
                      icon={<ArrowRight size={14} />}
                      onClick={() => router.push('/teacher/ai-content')}
                    >
                      Generate Resources →
                    </ComicButton>
                  </div>
                </StickyCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── DEPARTMENT COMPARISON ── */}
        <section>
          <StickyCard color="blue" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[var(--accent-blue)]" />
              <h3 className="font-display text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                Department Comparison
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" />
                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontFamily: 'var(--font-ui)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} stroke="var(--text-muted)" tick={{ fontFamily: 'var(--font-ui)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mine" name="My Classes" fill="#14B8A6" radius={[0, 6, 6, 0]} barSize={14} />
                <Bar dataKey="deptAvg" name="Dept Avg" fill="#9CA3AF" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </StickyCard>
        </section>

        {/* ── WEEKLY COACHING REPORT ── */}
        {coachingReport.hasData && (
          <section>
            <StickyCard color="orange" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  📈
                </motion.span>
                <h3 className="font-display text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                  Weekly Coaching Report
                </h3>
                <div className="flex items-center gap-1 text-[var(--accent-green)] text-xs font-semibold">
                  {TrendIcon[coachingReport.trend]}
                  <span>Trend: ↗ Improving</span>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {coachingReport.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 font-ui text-sm text-[var(--text-primary)]"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="text-[var(--accent-gold)] mt-0.5">✦</span>
                    {bullet}
                  </motion.li>
                ))}
              </ul>
              <ComicButton
                variant="secondary"
                size="sm"
                icon={<Eye size={14} />}
                onClick={() => router.push('/teacher/profile?tab=coaching')}
              >
                View Full Report
              </ComicButton>
            </StickyCard>
          </section>
        )}

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CUSTOM TOOLTIP
   ───────────────────────────────────────────── */
import { CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 border-2 border-[var(--border-doodle)] rounded-lg shadow-sm px-3 py-2 text-xs font-ui">
      <p className="font-semibold text-[var(--text-primary)]">{label}</p>
      {payload.map((p: any, idx: number) => (
        <p key={idx} style={{ color: p.color }} className="mt-0.5">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}
