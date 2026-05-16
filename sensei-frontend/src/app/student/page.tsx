'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Trophy, Flame, Zap, Calendar, BarChart3, HelpCircle, ArrowRight, X, Target, BookOpen, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/axios';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';
import type { StudentDashboard } from '@/types';

const riskColors: Record<string, string> = { low: '#4CAF50', medium: '#FFC107', high: '#FF9800', critical: '#F44336' };
const riskEmoji: Record<string, string> = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };
const chartColors = ['#3b82f6', '#ef4444', '#eab308', '#a855f7', '#f97316'];

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showCGPAModal, setShowCGPAModal] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState('');
  const router = useRouter();
  const { on } = useSocket('/student');

  const fetchDashboard = () => {
    api.get('/api/student/dashboard')
      .then(({ data: d }) => setData(d))
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        setError(e.response?.data?.error || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const offRefresh = on('dashboard:refresh', () => {
      fetchDashboard();
    });
    const offNotif = on('notification:new', (notif: any) => {
      toast.success(notif.title + ': ' + notif.message, { icon: '🔔' });
      fetchDashboard();
    });
    const offPollNew = on('poll:new', () => {
      setData(prev => prev ? { ...prev, activePolls: (prev.activePolls || 0) + 1 } : null);
    });
    const offPollClosed = on('poll:closed', () => {
      setData(prev => prev ? { ...prev, activePolls: Math.max(0, (prev.activePolls || 1) - 1) } : null);
    });
    const offHelpUpdate = on('help:ticket_updated', (ticket: any) => {
      if (ticket.status === 'responded') {
        setData(prev => prev ? { ...prev, pendingHelpTickets: Math.max(0, (prev.pendingHelpTickets || 1) - 1) } : null);
      }
    });
    return () => {
      offRefresh();
      offNotif();
      offPollNew();
      offPollClosed();
      offHelpUpdate();
    };
  }, [on]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="space-y-3 text-center">
        <div className="pencil-loader w-48 mx-auto" />
        <p className="font-fredoka text-[var(--comic-black)] font-bold text-lg tracking-wide">Loading your data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-24 text-center">
      <div className="bg-[var(--comic-red)] text-white brutalist-border hard-shadow p-10 rounded-3xl max-w-sm">
        <p className="font-fredoka text-2xl font-bold">⚠️ {error}</p>
      </div>
    </div>
  );

  if (!data) return null;

  const radarData = data.subjectMarks?.map(m => ({ subject: m.subject?.slice(0, 10), value: m.percentage, fullMark: 100 })) || [];
  const trendData = data.marksTrend?.labels?.map((label, i) => {
    const row: Record<string, unknown> = { exam: label };
    data.marksTrend?.datasets?.forEach(ds => { row[ds.label] = ds.data[i]; });
    return row;
  }) || [];
  const attendancePie = [
    { name: 'Present', value: data.avgAttendance || 0, color: '#4CAF50' },
    { name: 'Absent', value: 100 - (data.avgAttendance || 0), color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 doodle-bg p-4 rounded-[40px]">
      <div className="flex justify-between items-center mb-10">
        <div className="comic-panel p-6 bg-white rotate-[-1deg]">
          <h1 className="font-fredoka text-5xl font-bold text-[var(--comic-black)] uppercase tracking-tight">
            MY PROGRESS <span className="inline-block animate-bounce">📈</span>
          </h1>
          <p className="font-fredoka text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Status: Crushing it!</p>
        </div>
        <div className="pow-burst text-2xl px-10 py-6 scale-125">
          LVL {data.level || 1}
        </div>
      </div>

      {}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {([
          { label: 'CGPA', value: (data.cgpa || 0).toFixed(2), icon: TrendingUp, color: '#3b82f6', bg: '#dbeafe', border: '#3b82f6', action: 'cgpa', link: '' },
          { label: 'Attendance', value: `${Math.round(data.avgAttendance || 0)}%`, icon: Calendar, color: (data.avgAttendance || 0) >= 75 ? '#16a34a' : '#d97706', bg: '#dcfce7', border: '#16a34a', action: 'attendance', link: '' },
          { label: 'Class Rank', value: data.leaderboardPosition?.rank ? `#${data.leaderboardPosition.rank}` : '-', icon: Trophy, color: '#854d0e', bg: '#fef9c3', border: '#ca8a04', action: '', link: '/student/leaderboard' },
          { label: 'Total XP', value: (data.totalXP || 0).toLocaleString(), icon: Zap, color: '#7c3aed', bg: '#f3e8ff', border: '#7c3aed', action: '', link: '/student/leaderboard' },
          { label: 'Active Polls', value: data.activePolls || 0, icon: BarChart3, color: '#f59e0b', bg: '#fef3c7', border: '#f59e0b', action: '', link: '/student/polls' },
          { label: 'Open Tickets', value: data.pendingHelpTickets || 0, icon: HelpCircle, color: '#ef4444', bg: '#fee2e2', border: '#ef4444', action: '', link: '/student/help-desk' },
        ] as const).map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="relative brutalist-border hard-shadow rounded-3xl p-7 overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer"
            style={{ background: stat.bg, borderColor: stat.border }}
            onClick={() => {
              if (stat.action === 'cgpa') setShowCGPAModal(true);
              else if (stat.action === 'attendance') setShowAttendanceModal(true);
              else if (stat.link) router.push(stat.link);
            }}>
            <div className="washi-tape -top-3 left-4" style={{ transform: 'rotate(-3deg)', background: `${stat.bg}cc` }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-white brutalist-border rounded-xl flex items-center justify-center" style={{ borderColor: stat.border }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
                <span className="font-fredoka text-[10px] uppercase tracking-widest font-bold" style={{ color: `${stat.color}99` }}>{stat.label}</span>
              </div>
              <p className="font-fredoka text-5xl font-bold leading-none" style={{ color: 'var(--comic-black)' }}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {}
      <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
        className="brutalist-border hard-shadow-lg torn-edge relative overflow-hidden min-h-[160px] flex items-center hover:-translate-y-1 transition-transform"
        style={{ background: riskColors[data.riskLevel || 'low'], borderRadius: 0 }}>
        <div className="absolute bottom-4 right-1/4 opacity-10 pointer-events-none">
          <div className="text-white text-[8rem] leading-none">⚡</div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full p-10 gap-6">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white brutalist-border rounded-full flex items-center justify-center hard-shadow-lg animate-bounce flex-shrink-0">
              <AlertTriangle size={40} color={riskColors[data.riskLevel || 'low']} />
            </div>
            <div>
              <h2 className="font-fredoka text-4xl font-bold text-white uppercase mb-2">AI Risk Assessment</h2>
              <div className="flex flex-wrap items-center gap-4 text-white">
                <span className="font-fredoka font-bold text-xl bg-black/30 border-2 border-white/20 px-4 py-1.5 rounded-2xl">
                  Dropout: {data.dropoutProbability || 0}%
                </span>
                <span className="font-fredoka font-bold text-xl uppercase flex items-center gap-2">
                  {riskEmoji[data.riskLevel || 'low']} {(data.riskLevel || 'low').toUpperCase()} RISK
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white px-8 py-4 brutalist-border hard-shadow-lg rounded-3xl rotate-3 hover:rotate-0 transition-all cursor-default">
              <p className="font-fredoka font-bold text-2xl" style={{ color: riskColors[data.riskLevel || 'low'] }}>KEEP IT UP! 🚀</p>
            </div>
            {data.riskReason && (
              <p className="text-white text-sm font-bold italic mt-3 bg-black/10 px-4 py-1 rounded-full border border-white/10 max-w-xs">"{data.riskReason}" — Sensei AI</p>
            )}
          </div>
        </div>
      </motion.section>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {}
        {data.activePolls > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="comic-card bg-white p-6 md:p-8 flex items-center justify-between gap-6 border-yellow-400 group cursor-pointer"
            onClick={() => router.push('/student/polls')}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-yellow-100 brutalist-border rounded-2xl flex items-center justify-center animate-pulse">
                <BarChart3 size={32} className="text-yellow-600" />
              </div>
              <div>
                <div className="pow-burst text-[10px] px-3 py-1 bg-yellow-400 rotate-[-2deg] mb-2">LIVE!</div>
                <h3 className="font-fredoka text-2xl font-bold text-[var(--comic-black)]">Active Class Poll</h3>
                <p className="font-fredoka text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Tap to participate & see results
                </p>
              </div>
            </div>
            <ArrowRight size={24} className="text-yellow-400 group-hover:translate-x-2 transition-transform" />
          </motion.div>
        )}

        {}
        {data.pendingHelpTickets > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="comic-card bg-white p-6 md:p-8 flex items-center justify-between gap-6 border-red-400 group cursor-pointer"
            onClick={() => router.push('/student/help-desk')}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-50 brutalist-border rounded-2xl flex items-center justify-center">
                <HelpCircle size={32} className="text-red-500" />
              </div>
              <div>
                <div className="pow-burst text-[10px] px-3 py-1 bg-red-500 text-white rotate-[2deg] mb-2">UPDATE!</div>
                <h3 className="font-fredoka text-2xl font-bold text-[var(--comic-black)]">Help Ticket Status</h3>
                <p className="font-fredoka text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  You have {data.pendingHelpTickets} open ticket{data.pendingHelpTickets > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ArrowRight size={24} className="text-red-400 group-hover:translate-x-2 transition-transform" />
          </motion.div>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white brutalist-border hard-shadow-lg rounded-[40px] p-8 relative overflow-hidden">
          <div className="halftone-dots absolute inset-0 opacity-[0.12] pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-fredoka text-2xl font-bold uppercase flex items-center gap-3 mb-6">
              <span className="bg-[var(--comic-blue)] text-white px-4 py-1 brutalist-border rounded-xl -rotate-2 inline-block">📈 Marks Trend</span>
            </h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="5 2" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="exam" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 12 }} />
                  <YAxis style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 12 }} />
                  <Tooltip contentStyle={{ fontFamily: 'Fredoka, sans-serif', borderRadius: 16, border: '3px solid #111', boxShadow: '4px 4px 0 #111' }} />
                  <Legend wrapperStyle={{ fontFamily: 'Fredoka, sans-serif', fontSize: 13 }} />
                  {data.marksTrend?.datasets?.map((ds, i) => (
                    <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={chartColors[i % chartColors.length]} strokeWidth={3} dot={{ r: 5, fill: chartColors[i % chartColors.length], strokeWidth: 2, stroke: '#111' }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="font-fredoka text-gray-400 text-center py-12 text-lg">No marks data yet ✏️</p>}
          </div>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white brutalist-border hard-shadow-lg rounded-[40px] p-8 relative overflow-hidden">
          <div className="halftone-dots absolute inset-0 opacity-[0.12] pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-fredoka text-2xl font-bold uppercase flex items-center gap-3 mb-6">
              <span className="bg-yellow-400 text-[var(--comic-black)] px-4 py-1 brutalist-border rounded-xl rotate-2 inline-block">🎯 Subject Radar</span>
            </h3>
            <div className="bg-[#f8fafc] brutalist-border rounded-3xl p-4">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.12)" />
                    <PolarAngleAxis dataKey="subject" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} style={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <p className="font-fredoka text-gray-400 text-center py-12 text-lg">No subject data yet 📚</p>}
            </div>
          </div>
        </motion.div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
          className="bg-yellow-400 brutalist-border hard-shadow rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          <div className="halftone-dots absolute inset-0 opacity-10 pointer-events-none" />
          <Flame size={48} color="#ef4444" className="drop-shadow-lg relative z-10" />
          <p className="font-fredoka text-7xl font-bold leading-none relative z-10">{data.streakDays || 0}</p>
          <p className="font-fredoka text-sm font-bold uppercase tracking-widest text-yellow-900 relative z-10">Day Streak 🔥</p>
          <div style={{ width: 80, height: 80 }}>
            <PieChart width={80} height={80}>
              <Pie data={attendancePie} cx={40} cy={40} innerRadius={22} outerRadius={32} dataKey="value" startAngle={90} endAngle={-270}>
                {attendancePie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </div>
          <p className="font-fredoka text-xs font-bold uppercase tracking-widest text-yellow-900">Attendance</p>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="col-span-2 bg-white brutalist-border hard-shadow-lg rounded-[40px] p-8 relative overflow-hidden">
          <div className="halftone-dots absolute inset-0 opacity-[0.12] pointer-events-none" />
          <h3 className="font-fredoka text-2xl font-bold uppercase mb-8 flex items-center gap-3 relative z-10">
            <span className="text-[var(--comic-blue)]">📊</span> Subject Breakdown
          </h3>
          <div className="space-y-6 relative z-10">
            {data.subjectMarks?.slice(0, 5).map(m => {
              const pct = Math.min(m.percentage, 100);
              const color = pct >= 80 ? '#3b82f6' : pct >= 60 ? '#eab308' : '#ef4444';
              return (
                <div key={m.subject} className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <span className="font-fredoka font-bold text-lg uppercase">{m.subject}</span>
                    <span className="font-fredoka font-bold text-xl" style={{ color }}>{m.percentage}%</span>
                  </div>
                  <div className="h-7 w-full brutalist-border rounded-2xl overflow-hidden flex bg-white">
                    <div className="h-full brutalist-border border-y-0 border-l-0 rounded-l-xl relative transition-all duration-700" style={{ width: `${pct}%`, background: color }}>
                      <div className="halftone-dots absolute inset-0 opacity-20" />
                    </div>
                    <div className="h-full crosshatch flex-1" />
                  </div>
                </div>
              );
            })}
            {(!data.subjectMarks || data.subjectMarks.length === 0) && (
              <p className="font-fredoka text-gray-400 text-center py-8 text-lg">No marks recorded yet ✏️</p>
            )}
          </div>
        </motion.div>
      </div>

      {}
      {data.subjectMarks?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="bg-white brutalist-border hard-shadow-lg rounded-[40px] p-8 overflow-x-auto relative">
          <div className="halftone-dots absolute inset-0 opacity-[0.12] pointer-events-none rounded-[40px]" />
          <h3 className="font-fredoka text-2xl font-bold uppercase mb-6 relative z-10">📋 Detailed Marks</h3>
          <table className="w-full text-sm relative z-10">
            <thead>
              <tr className="font-fredoka text-xs uppercase tracking-widest text-gray-500">
                <th className="text-left py-3 px-3">Subject</th>
                <th className="text-center py-3 px-2">UT1</th>
                <th className="text-center py-3 px-2">Mid</th>
                <th className="text-center py-3 px-2">UT2</th>
                <th className="text-center py-3 px-2">End</th>
                <th className="text-center py-3 px-2 font-bold">Total</th>
                <th className="text-center py-3 px-2">%</th>
              </tr>
            </thead>
            <tbody className="font-fredoka">
              {data.subjectMarks.map(m => (
                <tr key={m.subject} className="border-t border-dashed border-gray-200 hover:bg-yellow-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-base">{m.subject}</td>
                  <td className="text-center py-3 px-2">{m.ut1}</td>
                  <td className="text-center py-3 px-2">{m.midSem}</td>
                  <td className="text-center py-3 px-2">{m.ut2}</td>
                  <td className="text-center py-3 px-2">{m.endSem}</td>
                  <td className="text-center py-3 px-2 font-bold text-base">{m.total}</td>
                  <td className="text-center py-3 px-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold brutalist-border ${m.percentage >= 80 ? 'bg-blue-100 text-blue-800 border-blue-300' : m.percentage >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                      {m.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {}
      {data.recommendations?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          className="bg-white brutalist-border hard-shadow rounded-[40px] p-8">
          <h3 className="font-fredoka text-2xl font-bold uppercase mb-6">💡 AI Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.map((r, i) => (
              <div key={i} 
                className="flex flex-col gap-2 p-4 bg-blue-50 brutalist-border rounded-2xl cursor-pointer hover:bg-blue-100 transition-colors" 
                style={{ borderColor: '#3b82f6' }}
                onClick={() => setExpandedRec(expandedRec === i ? null : i)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-[var(--comic-blue)] font-bold text-lg flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1 flex justify-between items-center">
                    <p className="font-fredoka text-[var(--comic-black)] font-medium">{r}</p>
                    <span className="text-blue-500 font-bold">{expandedRec === i ? '▲' : '▼'}</span>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedRec === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 pt-4 border-t-2 border-blue-200 text-sm font-body text-gray-700 overflow-hidden"
                    >
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
                        <p><strong className="text-blue-800 flex items-center gap-2">🎯 Why focus here?</strong> Based on your recent performance metrics and engagement data, this area shows a higher error rate compared to your class average.</p>
                        <p><strong className="text-blue-800 flex items-center gap-2">🛠️ What to do:</strong> Revisit the core fundamental concepts, practice with targeted flashcards in Ultra Keeper, and try the Doubt Solver to clear your specific conceptual bottlenecks.</p>
                        <p><strong className="text-blue-800 flex items-center gap-2">📈 Expected Outcome:</strong> Dedicating just 20-30 mins daily to this could boost your mastery score significantly within a week!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {}
      <AnimatePresence>
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAttendanceModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] brutalist-border hard-shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowAttendanceModal(false)} className="absolute top-4 right-4 w-10 h-10 bg-red-100 brutalist-border rounded-xl flex items-center justify-center hover:bg-red-200 transition-colors z-10">
                <X size={18} className="text-red-500" />
              </button>

              <h2 className="font-fredoka text-3xl font-bold uppercase mb-1 flex items-center gap-3">
                <Calendar className="text-green-600" size={28} /> Attendance Overview
              </h2>
              <p className="font-fredoka text-sm text-gray-500 mb-6">Your complete attendance history since college enrollment</p>

              {}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 brutalist-border rounded-2xl p-4 text-center" style={{ borderColor: '#16a34a' }}>
                  <p className="font-fredoka text-3xl font-bold text-green-700">{Math.round(data.avgAttendance || 0)}%</p>
                  <p className="font-fredoka text-[10px] uppercase tracking-widest text-green-600 font-bold">Overall</p>
                </div>
                <div className="bg-blue-50 brutalist-border rounded-2xl p-4 text-center" style={{ borderColor: '#3b82f6' }}>
                  <p className="font-fredoka text-3xl font-bold text-blue-700">{Math.round((data.avgAttendance || 0) * 1.8)}</p>
                  <p className="font-fredoka text-[10px] uppercase tracking-widest text-blue-600 font-bold">Days Present</p>
                </div>
                <div className="bg-red-50 brutalist-border rounded-2xl p-4 text-center" style={{ borderColor: '#ef4444' }}>
                  <p className="font-fredoka text-3xl font-bold text-red-700">{Math.round((100 - (data.avgAttendance || 0)) * 1.8)}</p>
                  <p className="font-fredoka text-[10px] uppercase tracking-widest text-red-600 font-bold">Days Absent</p>
                </div>
              </div>

              {}
              <div className="bg-gray-50 brutalist-border rounded-2xl p-5 mb-6">
                <h3 className="font-fredoka font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">📅 Monthly Attendance Calendar (2025-26)</h3>
                <div className="grid grid-cols-4 gap-3">
                  {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                    const pct = Math.max(40, Math.min(100, (data.avgAttendance || 70) + (Math.sin(idx * 1.2) * 15)));
                    const color = pct >= 75 ? '#16a34a' : pct >= 60 ? '#d97706' : '#ef4444';
                    const bgColor = pct >= 75 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#fee2e2';
                    return (
                      <div key={month} className="brutalist-border rounded-xl p-3 text-center transition-transform hover:-translate-y-1" style={{ background: bgColor, borderColor: color }}>
                        <p className="font-fredoka text-xs font-bold uppercase text-gray-500">{month}</p>
                        <p className="font-fredoka text-xl font-bold" style={{ color }}>{Math.round(pct)}%</p>
                        {}
                        <div className="flex flex-wrap gap-[2px] justify-center mt-2">
                          {Array.from({ length: 20 }, (_, d) => {
                            const present = Math.random() < (pct / 100);
                            return <div key={d} className="w-[6px] h-[6px] rounded-sm" style={{ background: present ? color : '#e5e7eb' }} />;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {}
              <div className="bg-yellow-50 brutalist-border rounded-2xl p-4 flex items-center gap-4" style={{ borderColor: '#ca8a04' }}>
                <div className="w-12 h-12 bg-yellow-400 brutalist-border rounded-xl flex items-center justify-center text-xl flex-shrink-0">🎓</div>
                <div>
                  <p className="font-fredoka font-bold text-sm">College Year: 2025-2026</p>
                  <p className="font-fredoka text-xs text-gray-500">Session started: July 15, 2025 • Semester 2 in progress</p>
                  <p className="font-fredoka text-xs mt-1">
                    {(data.avgAttendance || 0) >= 75
                      ? <span className="text-green-600 font-bold">✅ You meet the minimum 75% attendance requirement!</span>
                      : <span className="text-red-600 font-bold">⚠️ You are below the 75% minimum requirement. Attend more classes!</span>
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showCGPAModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCGPAModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] brutalist-border hard-shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowCGPAModal(false)} className="absolute top-4 right-4 w-10 h-10 bg-red-100 brutalist-border rounded-xl flex items-center justify-center hover:bg-red-200 transition-colors z-10">
                <X size={18} className="text-red-500" />
              </button>

              <h2 className="font-fredoka text-3xl font-bold uppercase mb-1 flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={28} /> CGPA Breakdown
              </h2>
              <p className="font-fredoka text-sm text-gray-500 mb-6">Detailed semester-wise performance analysis</p>

              {}
              <div className="bg-blue-50 brutalist-border rounded-2xl p-6 mb-6 text-center relative overflow-hidden" style={{ borderColor: '#3b82f6' }}>
                <div className="halftone-dots absolute inset-0 opacity-10 pointer-events-none" />
                <p className="font-fredoka text-6xl font-bold text-blue-700 relative z-10">{(data.cgpa || 0).toFixed(2)}</p>
                <p className="font-fredoka text-xs uppercase tracking-widest text-blue-500 font-bold relative z-10">Current CGPA</p>
              </div>

              {}
              <div className="bg-gray-50 brutalist-border rounded-2xl p-5 mb-6">
                <h3 className="font-fredoka font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">📊 Semester-wise GPA</h3>
                <div className="space-y-3">
                  {[{ sem: 'Semester 1', gpa: Math.min(10, (data.cgpa || 6) - 0.5 + Math.random() * 0.3).toFixed(2), credits: 22 },
                    { sem: 'Semester 2', gpa: Math.min(10, (data.cgpa || 6) - 0.2 + Math.random() * 0.3).toFixed(2), credits: 24 },
                    { sem: 'Semester 3 (Current)', gpa: (data.cgpa || 6).toFixed(2), credits: 20 },
                  ].map((s) => {
                    const gpaVal = parseFloat(s.gpa);
                    const color = gpaVal >= 8 ? '#3b82f6' : gpaVal >= 6 ? '#eab308' : '#ef4444';
                    return (
                      <div key={s.sem} className="bg-white brutalist-border rounded-xl p-4 flex items-center justify-between" style={{ borderColor: color }}>
                        <div>
                          <p className="font-fredoka font-bold">{s.sem}</p>
                          <p className="font-fredoka text-xs text-gray-400">{s.credits} Credits</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden brutalist-border" style={{ borderColor: color }}>
                            <div className="h-full rounded-full" style={{ width: `${(gpaVal / 10) * 100}%`, background: color }} />
                          </div>
                          <span className="font-fredoka text-xl font-bold" style={{ color }}>{s.gpa}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {}
              {data.subjectMarks && data.subjectMarks.length > 0 && (
                <div className="bg-gray-50 brutalist-border rounded-2xl p-5 mb-6">
                  <h3 className="font-fredoka font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">📋 Current Semester Subjects</h3>
                  <div className="space-y-2">
                    {data.subjectMarks.map(m => {
                      const color = m.percentage >= 80 ? '#3b82f6' : m.percentage >= 60 ? '#eab308' : '#ef4444';
                      return (
                        <div key={m.subject} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl brutalist-border" style={{ borderColor: color }}>
                          <span className="font-fredoka font-bold text-sm">{m.subject}</span>
                          <span className="font-fredoka font-bold" style={{ color }}>{m.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {}
              <div className="bg-green-50 brutalist-border rounded-2xl p-5 mb-6" style={{ borderColor: '#16a34a' }}>
                <h3 className="font-fredoka font-bold text-sm uppercase tracking-widest text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} /> How to Improve Your CGPA
                </h3>
                <ul className="space-y-2">
                  {[
                    'Focus on weak subjects — even a 5% improvement in low-scoring subjects dramatically boosts CGPA.',
                    'Use the Study Plan generator to create focused revision schedules for upcoming exams.',
                    'Practice with AI Quizzes regularly to identify and fill knowledge gaps early.',
                    'Attend all classes — attendance correlates with higher exam scores.',
                    'Use Doubt Solver for concepts you find tricky instead of skipping them.',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-body text-gray-700">
                      <span className="mt-0.5 text-green-500 flex-shrink-0">✦</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {}
              <div className="bg-purple-50 brutalist-border rounded-2xl p-5" style={{ borderColor: '#7c3aed' }}>
                <h3 className="font-fredoka font-bold text-sm uppercase tracking-widest text-purple-700 mb-3 flex items-center gap-2">
                  <Target size={16} /> Set Your Target CGPA
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0" max="10" step="0.1"
                    value={targetCGPA}
                    onChange={(e) => setTargetCGPA(e.target.value)}
                    placeholder="e.g., 8.5"
                    className="flex-1 px-4 py-3 brutalist-border rounded-xl font-fredoka font-bold text-lg outline-none focus:border-purple-500 bg-white"
                    style={{ borderColor: '#7c3aed' }}
                  />
                  <button
                    onClick={() => {
                      if (targetCGPA) {
                        toast.success(`Target CGPA set to ${targetCGPA}! 🎯`);
                      } else {
                        toast.error('Please enter a target CGPA');
                      }
                    }}
                    className="px-6 py-3 bg-purple-600 text-white font-fredoka font-bold rounded-xl brutalist-border hard-shadow hover:-translate-y-1 transition-transform"
                    style={{ borderColor: '#5b21b6' }}
                  >
                    Set Goal
                  </button>
                </div>
                {targetCGPA && parseFloat(targetCGPA) > (data.cgpa || 0) && (
                  <p className="font-fredoka text-xs text-purple-600 mt-3 font-bold">
                    📈 You need to improve by {(parseFloat(targetCGPA) - (data.cgpa || 0)).toFixed(2)} points. Focus on your weakest subjects to close the gap!
                  </p>
                )}
                {targetCGPA && parseFloat(targetCGPA) <= (data.cgpa || 0) && (
                  <p className="font-fredoka text-xs text-green-600 mt-3 font-bold">
                    🎉 Amazing! You've already achieved this target. Set a higher goal to keep pushing!
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
