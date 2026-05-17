'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, GraduationCap, CheckCircle, AlertTriangle, TrendingUp,
  Zap, Send, X, ChevronRight, BookOpen, Clock, Star, FileText, Upload, MessageCircle
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import StickyCard from '@/components/faculty/StickyCard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Radar, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

type TabKey = 'overview' | 'students' | 'analytics' | 'upload' | 'interventions';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview',      label: 'Overview' },
  { key: 'students',      label: 'Students' },
  { key: 'analytics',     label: 'Analytics' },
  { key: 'upload',        label: 'Upload' },
  { key: 'interventions', label: 'Interventions' },
];

export default function ClassDetailPage() {
  const { classId } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showPipe, setShowPipe] = useState(false);

  useEffect(() => {
    api.get(`/api/teacher/classes/${classId}`)
      .then(r => setData(r.data))
      .catch(() => setData(mockClassData()));
  }, [classId]);

  const c = data ?? mockClassData();

  /* ── radar/trend mock data ── */
  const radarData = [
    { subject: 'Participation',   value: c.engagement ?? 82 },
    { subject: 'Attention',       value: 76 },
    { subject: 'Attendance',      value: c.attendance ?? 91 },
    { subject: 'Understanding',   value: 79 },
    { subject: 'Completion',      value: 85 },
    { subject: 'Collaboration',   value: 71 },
  ];
  const trendData = [
    { w: 'W1', v: 72 }, { w: 'W2', v: 74 }, { w: 'W3', v: 70 },
    { w: 'W4', v: 78 }, { w: 'W5', v: 82 }, { w: 'W6', v: 76 },
  ];
  const subjData = [
    { name: 'DS Algo',    score: 73 }, { name: 'DBMS',    score: 81 },
    { name: 'Networks',   score: 85 }, { name: 'OS',      score: 78 },
    { name: 'ML Basics',  score: 88 }, { name: 'Fullstack',score: 82 },
  ];
  const students = Array.from({ length: 6 }, (_, i) => ({
    name:   `Student ${i + 1}`,
    id:     `${c.department?.slice(0, 2) ?? 'CS'}3${String(i + 1).padStart(2, '0')}`,
    cgpa:   (7 + i * 0.12).toFixed(1),
    attend: 80 + i * 2,
    risk:   (i < 2 ? 'high' : i < 4 ? 'medium' : (i === 5 ? 'low' : 'low')) as any,
  }));

  return (
    <div className="page-mobile-pad space-y-6">
      {/* ── PAGE HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button onClick={() => router.push('/teacher/classes')}
          className="w-9 h-9 rounded-xl bg-white border-2 border-[var(--border-card)] shadow-[var(--shadow-card)] flex items-center justify-center font-ui text-sm text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors">
          ‹
        </button>
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">{c.name}</h1>
          <p className="font-handwrite text-lg text-[var(--text-muted)]">{c.department} · {c.studentCount} students · Semester {c.semester}</p>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl font-ui text-sm font-bold border-2 whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] shadow-[2px_2px_0_var(--accent-purple)]'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)] shadow-[2px_2px_0_#D6D0C8] hover:-translate-y-0.5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* 4 KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg CGPA',  value: c.avgCGPA ?? 7.4,  icon: GraduationCap, color: 'yellow' as const },
                { label: 'Pass Rate', value: `${c.passRate ?? 86}%`, icon: CheckCircle, color: 'green'   as const },
                { label: 'Attendance', value: `${c.attendance ?? 91}%`, icon: TrendingUp, color: 'blue' as const },
                { label: 'At Risk',  value: c.atRisk ?? 0,  icon: AlertTriangle, color: 'pink' as const, urgent: (c.atRisk ?? 0) > 5 },
              ].map((k, i) => (
                <StickyCard key={k.label} color={k.color} rotation={-0.5 + i * 0.2} className="!p-4">
                  <k.icon size={20} className="text-[var(--text-muted)] mb-2" />
                  <p className="font-display text-3xl text-[var(--text-primary)]">{k.value}</p>
                  <p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{k.label}</p>
                  {k.urgent && <RiskBadge level="high" label={`${c.highRisk ?? 3} High`} />}
                </StickyCard>
              ))}
            </div>

            {/* Top 5 / Needs Attention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StickyCard color="green"><h3 className="font-display text-lg mb-3">Top 5 Students</h3>
                <div className="space-y-2">{[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                    <span className="font-display text-xl text-green-700">{i}</span>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-ui text-xs font-bold text-green-700">{String.fromCharCode(64 + i)}</div>
                    <span className="font-ui text-sm font-bold text-[var(--text-primary)]">Student {String.fromCharCode(64 + i)}</span>
                    <span className="ml-auto font-display text-sm text-green-700">{(9.2 - i * 0.1).toFixed(1)}</span>
                  </div>
                ))}</div>
              </StickyCard>
              <StickyCard color="pink"><h3 className="font-display text-lg mb-3">Needs Attention</h3>
                <div className="space-y-2">{[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                    <span className="font-display text-xl text-red-500">{i}</span>
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center font-ui text-xs font-bold text-red-400">{String.fromCharCode(75 + i)}</div>
                    <span className="font-ui text-sm font-bold text-[var(--text-primary)]">At Risk Student {i}</span>
                    <RiskBadge level="medium" />
                  </div>
                ))}</div>
              </StickyCard>
            </div>

            {/* Subject heatmap */}
            <StickyCard color="blue" className="overflow-x-auto">
              <h3 className="font-display text-xl mb-4">Subject Performance Heatmap</h3>
              <table className="w-full font-ui text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] text-xs uppercase tracking-wider">
                    <th className="text-left py-2 px-3">Student</th>
                    {subjData.map(s => <th key={s.name} className="text-center py-2 px-2 min-w-[60px]">{s.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, ri) => (
                    <tr key={ri} className="border-t border-[var(--border-card)]">
                      <td className="py-2 px-3 font-bold text-[var(--text-primary)]">S{ri + 1}</td>
                      {subjData.map((sc, ci) => {
                        const score = 40 + Math.floor(Math.random() * 55);
                        const bg = score >= 75 ? 'bg-green-100 text-green-700' : score >= 55 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-500';
                        return <td key={ci} className="py-2 px-2">
                          <span className={`inline-block w-full text-center py-1 rounded-lg font-bold ${bg}`}>{score}</span>
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </StickyCard>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Search students…"
                className="flex-1 bg-white border-2 border-[var(--border-card)] rounded-xl px-4 py-2.5 font-ui text-sm outline-none focus:border-[var(--accent-purple)]" />
              {['All', 'High Risk', 'Low Attendance'].map(f => (
                <button key={f} className={`px-4 py-2 rounded-xl font-ui text-xs font-bold border-2 ${f === 'All' ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {students.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white border-2 border-[var(--border-card)] rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all">
                  <TeacherAvatar name={s.name} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{s.name}</span>
                      <span className="font-ui text-[11px] text-[var(--text-muted)]">{s.id}</span>
                      <RiskBadge level={s.risk} />
                    </div>
                    <p className="font-ui text-xs text-[var(--text-muted)]">CGPA: {s.cgpa} · Att: {s.attend}%</p>
                  </div>
                  <button onClick={() => router.push(`/teacher/students/${s.id}`)}
                    className="px-4 py-1.5 font-ui text-xs font-bold text-[var(--accent-purple)] border-2 border-[var(--accent-purple)] rounded-xl hover:bg-[var(--accent-purple)]/5">
                    Profile
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <StickyCard color="yellow">
              <h3 className="font-display text-xl mb-4">Class Performance Radar</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="var(--border-card)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontFamily: 'Nunito', fill: '#57534E' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </StickyCard>
            <StickyCard color="blue">
              <h3 className="font-display text-xl mb-4">Engagement Trend (6 Weeks)</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="w" tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: 'Nunito' }} domain={[60, 90]} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" />
                    <Tooltip />
                    <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </StickyCard>
            <StickyCard color="green">
              <h3 className="font-display text-xl mb-4">Subject Performance</h3>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="var(--accent-purple)" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </StickyCard>
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StickyCard color="yellow" className="text-center py-14">
              <Upload size={52} className="mx-auto mb-4 text-[var(--accent-purple)]" />
              <h3 className="font-display text-2xl mb-2">Drop your CSV here 📎</h3>
              <p className="font-ui text-sm text-[var(--text-secondary)] mb-4">Accepts .csv, .xlsx · Max 5MB</p>
              <ComicButton variant="primary" icon={<FileText size={16} />}>Browse Files</ComicButton>
              {showPipe ? (
                <div className="mt-6 text-left space-y-3">
                  {pipeline.map((st, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${st.done ? 'bg-[var(--sticky-green)] border-green-400 text-green-800' : st.running ? 'bg-white border-amber-400 animate-pulse' : 'bg-gray-50 border-gray-200 text-[var(--text-muted)]'}`}>
                      <span className="text-xl">{st.emoji}</span>
                      <div className="flex-1">
                        <p className="font-ui text-xs font-bold">{st.label}</p>
                        {st.running && <p className="font-ui text-[11px]">{st.count ?? ''}</p>}
                      </div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${st.pct}%`, background: st.done ? 'var(--accent-green)' : st.running ? 'var(--accent-gold)' : '#ccc' }} />
                      </div>
                      {st.done && <CheckCircle size={16} className="text-green-600" />}
                    </div>
                  ))}
                </div>
              ) : null}
            </StickyCard>
          </motion.div>
        )}

        {activeTab === 'interventions' && (
          <motion.div key="interventions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Class Interventions</h3>
              <ComicButton variant="primary" size="sm" icon={<Zap size={14} />}>New Intervention</ComicButton>
            </div>
            {[
              { student: 'Rahul Verma', type: 'Academic',   urgency: 'High', desc: 'Performance drop in DS Algo', date: '2 days ago' },
              { student: 'Sneha Iyer',  type: 'Attendance', urgency: 'Medium', desc: 'Below 75% attendance',      date: '5 days ago' },
            ].map((iv, i) => (
              <StickyCard key={i} color={i === 0 ? 'pink' : 'yellow'} className="!p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-ui text-sm font-bold text-[var(--text-primary)]">{iv.student}</span>
                      <RiskBadge level={iv.urgency.toLowerCase() as any} label={iv.urgency} />
                    </div>
                    <p className="font-ui text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">{iv.type}</p>
                    <p className="font-body text-xs text-[var(--text-muted)] mt-0.5">{iv.desc}</p>
                    <p className="font-ui text-[11px] text-[var(--text-muted)] mt-1">{iv.date}</p>
                  </div>
                  <button className="font-ui text-xs font-bold text-[var(--accent-purple)]">Update →</button>
                </div>
              </StickyCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function mockClassData() {
  return {
    name: 'Fullstack Development - Section B',
    department: 'Computer Science',
    semester: 5,
    studentCount: 42,
    avgCGPA: 7.4,
    passRate: 86,
    attendance: 91,
    atRisk: 12,
    highRisk: 3,
    engagement: 82,
  };
}

const pipeline = [
  { label: 'Column Normaliser',    emoji: '📋', pct: 100, done: true,  count: '145 students loaded' },
  { label: 'Performance Analyser', emoji: '📊', pct: 0,   done: false, running: false },
  { label: 'Risk Detector',        emoji: '⚠️', pct: 0,   done: false, running: false },
  { label: 'AI Insight Generator', emoji: '🤖', pct: 0,   done: false, running: false },
  { label: 'Auto Interventions',   emoji: '📧', pct: 0,   done: false, running: false },
];
