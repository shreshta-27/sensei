'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon, Clock, MapPin, Users, BookOpen,
  ChevronLeft, ChevronRight, Plus, AlertTriangle, Sparkles,
  GraduationCap, ArrowRight
} from 'lucide-react';
import api from '@/lib/axios';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import RiskBadge from '@/components/faculty/RiskBadge';

type ScheduledEvent = {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  className?: string;
  subject?: string;
  location?: string;
  attendees?: number;
  urgency?: 'high' | 'medium' | 'low';
  note?: string;
};

const eventTypeColors: Record<string, { emoji: string; color: 'yellow' | 'blue' | 'green' | 'purple' | 'pink' | 'orange' }> = {
  'Assessment': { emoji: '📝', color: 'orange' },
  'Class':       { emoji: '🎓', color: 'blue' },
  'Meeting':     { emoji: '👥', color: 'green' },
  'Workshop':    { emoji: '🔧', color: 'purple' },
  'Remedial':    { emoji: '💡', color: 'pink' },
  'Deadline':    { emoji: '⏰', color: 'yellow' },
};

export default function CalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.get('/api/teacher/calendar')
      .then(r => setEvents(r.data.events || r.data || []))
      .catch(() => setEvents(mockEvents))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const goPrev = () => setViewMonth(new Date(year, month - 1, 1));
  const goNext = () => setViewMonth(new Date(year, month + 1, 1));

  // Build quick stats from events
  const upcoming = events.filter(e => new Date(e.date) >= today);
  const urgent = events.filter(e => e.urgency === 'high' && new Date(e.date) >= today);
  const thisWeek = events.filter(e => {
    const diff = (new Date(e.date).getTime() - today.getTime()) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Loading calendar…</div>;

  /* ── Calendar grid ── */
  const cells: (ScheduledEvent | null)[][] = [];
  let week: (ScheduledEvent | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    week.push(...(dayEvents.length ? dayEvents : [null]));
    if (week.length === 7) { cells.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); cells.push(week); }

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)]">Calendar</h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">
            Classes, assessments, and events · {upcoming.length} upcoming
          </p>
        </div>
        <ComicButton variant="primary" icon={<Plus size={16} />} onClick={() => {}}>New Event</ComicButton>
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StickyCard color="green"><p className="font-display text-3xl text-[var(--text-primary)]">{upcoming.length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Upcoming</p></StickyCard>
        <StickyCard color="yellow"><p className="font-display text-3xl text-[var(--text-primary)]">{thisWeek.length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">This Week</p></StickyCard>
        <StickyCard color="pink"><p className="font-display text-3xl text-[var(--text-primary)]">{urgent.length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Urgent</p></StickyCard>
        <StickyCard color="blue"><p className="font-display text-3xl text-[var(--text-primary)]">{events.length}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total</p></StickyCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Month Grid ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <StickyCard color="yellow" pinned className="!p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-[var(--text-primary)]">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={goPrev} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-ui text-sm font-bold text-[var(--text-secondary)] border border-[var(--border-card)] shadow-[1px_1px_0_var(--border-card)]"><ChevronLeft size={16} /></button>
                <button onClick={goNext} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-ui text-sm font-bold text-[var(--text-secondary)] border border-[var(--border-card)] shadow-[1px_1px_0_var(--border-card)]"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((week, wi) => week.map((cell, ci) => {
                const dateNum = wi * 7 + ci - firstDay + 1;
                const isToday = cell ? new Date(cell.date).toDateString() === today.toDateString() : dateNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                if (!cell) return (
                  <div key={`w${wi}d${ci}`} className="h-16 md:h-20 rounded-lg" />
                );
                const et = eventTypeColors[cell.type] || { emoji: '📌', color: 'blue' as const };
                return (
                  <div key={cell._id} className={`h-16 md:h-20 rounded-lg p-1 border transition-all ${isToday ? 'border-[var(--accent-purple)] bg-[#F5F0FF]' : 'border-transparent bg-white/40 hover:bg-white/70'}`}>
                    <span className="font-ui text-[10px] font-bold text-[var(--text-muted)]">{dateNum}</span>
                    <div className="space-y-0.5 mt-0.5 overflow-hidden">
                      {[cell].slice(0, 2).map(e => {
                        const ec = eventTypeColors[e.type] || { emoji: '📌', color: 'blue' as const };
                        return (
                          <div key={e._id} className={`text-[9px] font-ui font-bold rounded px-0.5 truncate ${e.urgency === 'high' ? 'bg-red-100 text-red-700' : `bg-[var(--sticky-${ec.color})] text-[var(--text-secondary)]`}`}>
                            {ec.emoji} {e.title.slice(0, 16)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }))}
            </div>
          </StickyCard>
        </motion.div>

        {/* ── Upcoming Events List ── */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(eventTypeColors)].map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full font-ui text-[10px] font-bold border-2 transition-all ${
                  filter === t ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'
                }`}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 20)
              .map((e, i) => {
                const ec = eventTypeColors[e.type] || { emoji: '📌', color: 'blue' as const };
                return (
                  <motion.div key={e._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <StickyCard color={ec.color} className="!p-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0 w-10">
                          <span className="font-display text-lg leading-none text-[var(--text-primary)]">{new Date(e.date).getDate()}</span>
                          <span className="font-ui text-[9px] font-bold text-[var(--text-muted)] uppercase leading-none">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-ui text-lg">{ec.emoji}</span>
                            <span className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{e.title}</span>
                            {e.urgency === 'high' && <RiskBadge level="high" label="Urgent" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 font-ui text-[11px] text-[var(--text-muted)]"><Clock size={10} />{e.time}</span>
                            {e.className && <span className="flex items-center gap-1 font-ui text-[11px] text-[var(--text-muted)]"><BookOpen size={10} />{e.className}</span>}
                            {e.location && <span className="flex items-center gap-1 font-ui text-[11px] text-[var(--text-muted)]"><MapPin size={10} />{e.location}</span>}
                          </div>
                          {e.note && <p className="font-body text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{e.note}</p>}
                        </div>
                      </div>
                    </StickyCard>
                  </motion.div>
                );
              })}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon size={36} className="mx-auto text-[var(--text-muted)] opacity-30 mb-2" />
                <p className="font-handwrite text-lg text-[var(--text-muted)]">No events in this category</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── All Classes Quick View ── */}
      <section>
        <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
          <GraduationCap size={22} className="text-[var(--accent-purple)]" /> Class Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classSchedule.map((cls, i) => (
            <motion.div key={cls.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StickyCard color={['yellow','blue','green','purple','pink','orange'][i % 6] as any} className="!p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg text-[var(--text-primary)]">{cls.name}</h3>
                  <span className="font-ui text-xs font-bold px-2.5 py-1 rounded-full bg-white/70 text-[var(--text-secondary)]">{cls.section}</span>
                </div>
                <div className="space-y-1.5">
                  {cls.slots.map((s, si) => (
                    <div key={si} className="flex items-center justify-between font-ui text-xs text-[var(--text-secondary)]">
                      <span className="font-bold">{s.day}</span>
                      <span>{s.time}</span>
                      <span className="text-[var(--text-muted)]">{s.room}</span>
                    </div>
                  ))}
                </div>
                <hr className="border-t border-[var(--border-card)] my-2" />
                <div className="flex items-center gap-3 font-ui text-[10px] text-[var(--text-muted)]">
                  <span><Users size={11} className="inline mr-1" />{cls.students} students</span>
                  <span><BookOpen size={11} className="inline mr-1" />Sem {cls.sem}</span>
                </div>
              </StickyCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Mock Data ── */
const mockEvents: ScheduledEvent[] = [
  { _id: 'e1', title: 'Internal Assessment — FS Sec B', type: 'Assessment', date: `${new Date().getFullYear()}-05-18`, time: '09:00 AM', className: 'Fullstack - Sec B', subject: 'HTTP, REST APIs', location: 'Lab-3', attendees: 42, urgency: 'high' },
  { _id: 'e2', title: 'Parent Meeting',   type: 'Meeting',     date: `${new Date().getFullYear()}-05-20`, time: '02:00 PM', className: '3 flagged students', location: 'Conf Room A', attendees: 6, urgency: 'medium' },
  { _id: 'e3', title: 'Remedial Class',   type: 'Remedial',    date: `${new Date().getFullYear()}-05-22`, time: '11:00 AM', className: 'DBMS – Sec A', subject: 'Joins & Normalization', location: 'Room-205', attendees: 12, urgency: 'medium' },
  { _id: 'e4', title: 'Binary Trees Workshop', type: 'Workshop', date: `${new Date().getFullYear()}-05-24`, time: '10:00 AM', className: 'DS Algorithms', subject: 'Tree Traversals', location: 'Lab-1', attendees: 38, urgency: 'high' },
  { _id: 'e5', title: 'Quiz Deadline — OS', type: 'Deadline',  date: `${new Date().getFullYear()}-05-26`, time: '11:59 PM', className: 'Operating Systems', subject: 'Memory Management', attendees: 34 },
  { _id: 'e6', title: 'Parent Meeting',   type: 'Meeting',     date: `${new Date().getFullYear()}-05-28`, time: '03:30 PM', className: 'DBMS - Sec B', location: 'Conf Room B', attendees: 8, urgency: 'low' },
  { _id: 'e7', title: 'Mid-Sem Review',   type: 'Class',       date: `${new Date().getFullYear()}-06-02`, time: '09:00 AM', className: 'Networks', location: 'Room-301', attendees: 30 },
  { _id: 'e8', title: 'Diagnostic Quiz',  type: 'Assessment',  date: `${new Date().getFullYear()}-06-05`, time: '10:00 AM', className: 'ML Basics', subject: 'Supervised Learning', location: 'Lab-2', attendees: 25, urgency: 'high' },
];

const classSchedule = [
  { name: 'Fullstack - Sec B', section: 'Sec B', sem: 3, students: 42,
    slots: [
      { day: 'Monday',    time: '09:00 AM', room: 'Lab-3' },
      { day: 'Wednesday', time: '09:00 AM', room: 'Lab-3' },
      { day: 'Friday',    time: '11:00 AM', room: 'Lab-3' },
    ]
  },
  { name: 'DBMS - Sec A', section: 'Sec A', sem: 4, students: 38,
    slots: [
      { day: 'Tuesday',   time: '10:00 AM', room: 'Room-205' },
      { day: 'Thursday',  time: '10:00 AM', room: 'Room-205' },
    ]
  },
  { name: 'DS Algorithms', section: 'Single', sem: 3, students: 34,
    slots: [
      { day: 'Monday',    time: '11:00 AM', room: 'Lab-1' },
      { day: 'Wednesday', time: '02:00 PM', room: 'Lab-1' },
      { day: 'Friday',    time: '11:00 AM', room: 'Lab-1' },
    ]
  },
  { name: 'Operating Systems', section: 'Sec A', sem: 4, students: 30,
    slots: [
      { day: 'Tuesday',   time: '02:00 PM', room: 'Room-301' },
      { day: 'Thursday',  time: '02:00 PM', room: 'Room-301' },
    ]
  },
  { name: 'Computer Networks', section: 'Sec B', sem: 3, students: 36,
    slots: [
      { day: 'Monday',    time: '02:00 PM', room: 'Room-102' },
      { day: 'Wednesday', time: '10:00 AM', room: 'Room-102' },
    ]
  },
  { name: 'ML Basics', section: 'Single', sem: 4, students: 28,
    slots: [
      { day: 'Friday',    time: '09:00 AM', room: 'Lab-5' },
    ]
  },
];
