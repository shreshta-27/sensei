'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Users, AlertTriangle, TrendingUp, Zap,
  ArrowRight, Calendar, FileText, Activity, BarChart3,
  Clock, Star, Send, Bell, ChevronDown, Sparkles,
  MessageCircle, Target, Lightbulb, BrainCircuit, GraduationCap
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import KPICard from '@/components/faculty/KPICard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import StickyCard from '@/components/faculty/StickyCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { useAuthStore } from '@/stores/authStore';

/* ─── Types ─── */
type DashboardData = {
  totalClasses?: number;
  totalStudents?: number;
  atRiskCount?: number;
  avgEngagement?: number;
  engagementDelta?: number;
  activeInterventions?: number;
  pendingHelpTickets?: number;
  engagement?: number;
  subjects?: string[];
  teachingXP?: number;
  classEngagement?: Array<{ name: string; participation: number; attention: number; attendance: number; understanding: number; completion: number; collaboration: number }>;
  studentsToWatch?: Array<{ name: string; status: string; risk: string; id?: string }>;
  upcomingEvents?: Array<{ date: string; event: string; subject: string }>;
};

/* ─── Mock data used when API is not available ─── */
const mockDashboard: DashboardData = {
  totalClasses: 6,
  totalStudents: 128,
  atRiskCount: 18,
  avgEngagement: 76,
  engagementDelta: 8,
  activeInterventions: 23,
  pendingHelpTickets: 3,
  engagement: 76,
  subjects: ['Fullstack', 'DBMS', 'DS Algo', 'Networks', 'OS', 'ML Basics'],
  teachingXP: 110,
  classEngagement: [
    { name: 'FS-A',  participation: 82, attention: 74, attendance: 88, understanding: 79, completion: 85, collaboration: 71 },
    { name: 'FS-B',  participation: 76, attention: 68, attendance: 80, understanding: 70, completion: 78, collaboration: 65 },
    { name: 'DBMS-A', participation: 88, attention: 84, attendance: 91, understanding: 85, completion: 82, collaboration: 77 },
    { name: 'DSA',   participation: 71, attention: 65, attendance: 73, understanding: 68, completion: 70, collaboration: 60 },
    { name: 'Net',   participation: 85, attention: 78, attendance: 87, understanding: 80, completion: 83, collaboration: 75 },
  ],
  studentsToWatch: [
    { name: 'Rahul Verma', status: 'Performance declining in DS Algo', risk: 'High', id: 's1' },
    { name: 'Sneha Iyer',  status: 'Low attendance this week',       risk: 'Medium', id: 's2' },
    { name: 'Arjun Nair',  status: 'Missed 3 recent assignments',     risk: 'High', id: 's3' },
  ],
  upcomingEvents: [
    { date: 'May 18', event: 'Internal Assessment', subject: 'Fullstack - Sec B' },
    { date: 'May 20', event: 'Parent Meeting',      subject: '3 students' },
    { date: 'May 22', event: 'Remedial Class',       subject: 'DBMS - Section A' },
  ],
};

/* ─── Sparkle decoration ─── */
function SparkleDecorations() {
  const sparkles = ['✦', '✦', '⚡', '✦', '✦', '∗'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-amber-400"
          style={{ top: `${10 + i * 18}%`, left: `${5 + i * 17}%`, fontSize: `${12 + i % 2 * 4}px` }}
          animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6], rotate: [0, 15, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        >
          {sparkles[i % sparkles.length]}
        </motion.span>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { on } = useSocket('/teacher');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpCount, setHelpCount] = useState(3);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ── fetch dashboard ── */
  useEffect(() => {
    const fetch = () => {
      api.get('/api/teacher/dashboard')
        .then(({ data: d }) => setData({ ...mockDashboard, ...d }))
        .catch(() => setData(mockDashboard))
        .finally(() => setLoading(false));
    };
    fetch();
  }, []);

  /* ── socket: new help ticket ── */
  useEffect(() => {
    const off = on('help:new_ticket', () => {
      setHelpCount(c => c + 1);
      toast.success('New help ticket received! 🙋', { icon: '🙋' });
    });
    return () => { off(); };
  }, [on]);

  /* ── click-outside for dropdowns ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── KPI cards ─── */
  const kpis = [
    { label: 'MY CLASSES',    value: data?.totalClasses    ?? 6,  icon: BookOpen,    color: 'yellow' as const, sub: 'Active Classes',    rotation: -1   },
    { label: 'STUDENTS',      value: data?.totalStudents   ?? 128, icon: Users,      color: 'blue'   as const, sub: 'Across all classes', rotation:  0.5 },
    { label: 'AT  RISK',      value: data?.atRiskCount     ?? 18,  icon: AlertTriangle, color: 'pink' as const, sub: 'Needs Attention', urgent: true },
    { label: 'ENGAGEMENT',    value: data?.avgEngagement   ?? 76,  icon: TrendingUp, color: 'green'  as const, sub: `↑ ${data?.engagementDelta ?? 8}% vs last month`, suffix: '%' },
    { label: 'INTERVENTIONS', value: data?.activeInterventions ?? 23, icon: Zap, color: 'purple' as const, sub: 'Active Plans', rotation: -0.5 },
  ];

  const teacherName = (user as any)?.name || 'Dr. Priya Sharma';
  const teacherXP  = data?.teachingXP ?? 110;
  const watchStudents = data?.studentsToWatch ?? mockDashboard.studentsToWatch!;
  const events         = data?.upcomingEvents    ?? mockDashboard.upcomingEvents!;

  /* ════════════════════════════════════════════════
  RENDER
  ════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="font-handwrite text-3xl text-[var(--text-muted)] animate-pulse">Loading your command desk…</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <SparkleDecorations />

      {/* ── PAGE HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-[var(--text-primary)] flex items-center gap-2">
            Faculty Command Desk
            <span className="text-3xl sm:text-4xl">✦</span>
          </h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)] mt-1">Your AI copilot for smarter teaching</p>
        </div>
        <div className="shrink-0">
          <ComicButton variant="secondary" size="sm">
            <Calendar size={14} /> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </ComicButton>
        </div>
      </motion.div>

      {/* ── KPI ROW ── */}
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
      >
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}>
            <KPICard label={k.label} value={k.value} color={k.color} sub={k.sub} rotation={-0.5 + (i * 0.3)} urgent={k.urgent} suffix={k.suffix} delay={i * 0.1} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* ┌─ CLASSROOM PULSE ─┐ */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-8"
        >
          <StickyCard color="yellow" pinned>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl text-[var(--text-primary)]">Classroom Pulse</h2>
                <p className="font-body text-xs text-[var(--text-secondary)] mt-0.5">Engagement radar across your classes</p>
              </div>
              <ComicButton variant="ghost" size="sm" onClick={() => router.push('/teacher/classes')}>
                View Heatmap <ArrowRight size={14} />
              </ComicButton>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data?.classEngagement || mockDashboard.classEngagement}>
                  <PolarGrid stroke="#E5E0D8" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Nunito, sans-serif', fill: '#57534E' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  {data?.classEngagement?.map((_, i) => (
                    <Radar key={i} name="Class" dataKey="participation" stroke={['#7C3AED','#3B82F6','#22C55E','#F59E0B','#EF4444'][i]}
                      fill={['#7C3AED','#3B82F6','#22C55E','#F59E0B','#EF4444'][i]} fillOpacity={0.2} strokeWidth={2.5} />
                  ))}
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {(data?.classEngagement || mockDashboard.classEngagement)!.map((c, i) => (
                <span key={c.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 font-ui text-[11px] font-semibold text-[var(--text-secondary)]">
                  <span className="w-2.5 h-2.5 rounded-full block" style={{ background: ['#7C3AED','#3B82F6','#22C55E','#F59E0B','#EF4444'][i] }} />
                  {c.name}
                </span>
              ))}
            </div>
          </StickyCard>

          {/* Students to Watch */}
          <div className="mt-6">
            <h2 className="font-display text-2xl text-[var(--text-primary)] mb-3">Students To Watch</h2>
            <div className="space-y-3">
              {watchStudents.map((s, i) => (
                <motion.div key={s.id || s.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => s.id && router.push(`/teacher/students/${s.id}`)}
                  className="flex items-center gap-3 p-3 bg-white border-2 border-[var(--border-card)] rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <TeacherAvatar name={s.name} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{s.name}</span>
                      <RiskBadge level={s.risk.toLowerCase() as any} />
                    </div>
                    <p className="font-body text-xs text-[var(--text-muted)] truncate">{s.status}</p>
                  </div>
                  <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <button onClick={() => router.push('/teacher/students?filter=at_risk')} className="font-ui text-xs font-bold text-[var(--accent-purple)] hover:underline">
                View All At-Risk Students →
              </button>
            </div>
          </div>
        </motion.div>

        {/* ┌─ RIGHT COLUMN ─┐ */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* ── AI Intervention Feed ── */}
          <StickyCard color="orange" pinned>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" /> AI Feed
              </h2>
              <span className="text-[9px] font-ui font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{helpCount} new</span>
            </div>
            <div className="space-y-5 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-card)]">
              {[
                { time: '10:10 AM', title: 'Attendance drop',   sub: '8 students — FS Section B',       urgency: 'high'   },
                { time: '09:15 AM', title: 'Perf. decline',     sub: '3 students in DS Algo need support', urgency: 'medium' },
                { time: '08:45 AM', title: 'Wellness anomaly',   sub: '2 students flagged',                 urgency: 'high'   },
              ].map((item, i) => (
                <div key={i} className="relative pl-10">
                  <span className={`absolute left-0 top-1 w-[30px] h-[30px] rounded-full border-4 border-white flex items-center justify-center text-xs font-bold shadow-sm z-10
                    ${item.urgency === 'high' ? 'bg-red-400 text-white' : 'bg-orange-300 text-white'}`}>
                    {item.urgency === 'high' ? '!' : '•'}
                  </span>
                  <span className="font-ui text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">{item.time}</span>
                  <span className="font-ui text-sm font-bold text-[var(--text-primary)]">{item.title}</span>
                  <span className="font-body text-xs text-[var(--text-secondary)]">{item.sub}</span>
                  <span className={`mt-1 inline-block text-[9px] font-ui font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.urgency === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>{item.urgency}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/teacher/interventions')} className="mt-5 w-full font-ui text-xs text-[var(--accent-purple)] font-bold hover:underline text-right">
              View All →
            </button>
          </StickyCard>

          {/* ── Quick Actions ── */}
          <StickyCard color="green">
            <h2 className="font-display text-xl text-[var(--text-primary)] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Schedule Class',    icon: Calendar,       page: '/teacher/classes' },
                { label: 'Share Notes',       icon: FileText,        page: '/teacher/upload'  },
                { label: 'Parent Contact',    icon: Users,           page: '/teacher/students'},
                { label: 'Wellness Check',    icon: Activity,        page: '/teacher/behavior-analyzer' },
                { label: 'Create Poll',       icon: BarChart3,       page: '/teacher/polls'   },
                { label: 'Message Class',     icon: MessageCircle,   page: '/teacher/interventions' },
              ].map((action, i) => (
                <button key={i} onClick={() => router.push(action.page)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/50 border border-[var(--border-card)] hover:bg-white hover:border-[var(--accent-purple)]/40 hover:-translate-y-0.5 transition-all group"
                >
                  <action.icon size={18} className="text-[var(--accent-purple)] group-hover:scale-110 transition-transform" />
                  <span className="font-ui text-[10px] font-bold text-[var(--text-secondary)] text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </StickyCard>

          {/* ── Upcoming Events ── */}
          <StickyCard color="purple">
            <h2 className="font-display text-xl text-[var(--text-primary)] mb-3">Upcoming</h2>
            <div className="space-y-3">
              {events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-white/70 border border-[var(--border-card)] shadow-sm">
                    <span className="font-ui text-[9px] font-black text-[var(--text-muted)] uppercase leading-none">{ev.date.split(' ')[0]}</span>
                    <span className="font-display text-base leading-none text-[var(--text-primary)] -mt-0.5">{ev.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-ui text-sm font-bold text-[var(--text-primary)] block truncate">{ev.event}</span>
                    <span className="font-body text-[11px] text-[var(--text-muted)]">{ev.subject}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/teacher/calendar')} className="mt-4 w-full font-ui text-xs font-bold text-[var(--accent-purple)] hover:underline text-center">
              <Calendar size={12} className="inline mr-1" /> Full Calendar
            </button>
          </StickyCard>
        </motion.div>
      </div>

      {/* ── TEACHING ASSISTANT FLOATING WIDGET ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="fixed bottom-6 left-6 z-50 hidden lg:block"
      >
        <button onClick={() => router.push('/teacher/help-queue')}
          className="w-[220px] bg-white border-2 border-[var(--border-card)] rounded-2xl shadow-[4px_4px_0_var(--border-card)] hover:-translate-y-1 hover:shadow-[6px_6px_0__var(--border-card)] transition-all p-4 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <BrainCircuit size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="font-ui text-sm font-bold text-[var(--text-primary)]">Teaching Assistant</p>
              <p className="font-ui text-[10px] text-green-600 font-bold">● Online</p>
            </div>
          </div>
          <p className="font-handwrite text-base text-[var(--text-secondary)] mt-2">Need help with your classes?</p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-ui font-bold text-[var(--accent-purple)] group-hover:underline">
            <Sparkles size={12} /> Ask Sensei AI →
          </div>
        </button>
      </motion.div>

    </div>
  );
}
