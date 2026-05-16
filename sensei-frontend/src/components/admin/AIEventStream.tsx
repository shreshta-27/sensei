'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Wifi } from 'lucide-react';
import Link from 'next/link';

type Severity = 'high' | 'medium' | 'info' | 'low';

interface AIEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  severity: Severity;
}

const INITIAL_EVENTS: AIEvent[] = [
  { id: '1', time: '10:40 AM', title: 'High dropout risk detected',    description: 'B.Tech CSE 2nd Year – 7 students',  severity: 'high'   },
  { id: '2', time: '10:32 AM', title: 'Faculty workload warning',       description: '3 faculty overloaded',             severity: 'medium' },
  { id: '3', time: '10:15 AM', title: 'Wellness intervention triggered',description: 'Student ID: 23CS0AC5118',          severity: 'info'   },
  { id: '4', time: '09:58 AM', title: 'Help ticket escalated',          description: 'Network issue – Lab 3',            severity: 'medium' },
  { id: '5', time: '09:41 AM', title: 'Attendance anomaly detected',    description: 'BCA 1st Year – Section B',         severity: 'low'    },
];

const LIVE_EVENTS: Omit<AIEvent, 'id'>[] = [
  { time: '', title: 'AI pattern shift detected',     description: 'Engagement drop – 3rd year students', severity: 'medium' },
  { time: '', title: 'CGPA threshold breached',       description: 'Dept: Information Technology',        severity: 'high'   },
  { time: '', title: 'Counselor session scheduled',   description: 'Auto-assigned for 12 students',       severity: 'info'   },
];

const severityMeta: Record<Severity, { dot: string; badge: string; label: string }> = {
  high:   { dot: '#EF4444', badge: 'adm-badge-high',   label: 'High'   },
  medium: { dot: '#F59E0B', badge: 'adm-badge-medium', label: 'Medium' },
  info:   { dot: '#6366F1', badge: 'adm-badge-info',   label: 'Info'   },
  low:    { dot: '#22C55E', badge: 'adm-badge-low',     label: 'Low'    },
};

export default function AIEventStream() {
  const [events, setEvents] = useState<AIEvent[]>(INITIAL_EVENTS);
  const liveIdx = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = LIVE_EVENTS[liveIdx.current % LIVE_EVENTS.length];
      liveIdx.current++;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setEvents((prev) => [
        { ...next, id: String(Date.now()), time: timeStr },
        ...prev.slice(0, 7),
      ]);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="adm-card h-full flex flex-col"
      style={{ minHeight: '360px' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <div className="flex items-center gap-2">
          <div className="adm-pulse-dot" />
          <h3 className="adm-section-title">AI Event Stream</h3>
        </div>
        <Link
          href="/admin/interventions"
          className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
          style={{ color: 'var(--adm-accent)' }}
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto adm-scrollbar px-3 py-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {events.map((ev) => {
            const meta = severityMeta[ev.severity];
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 p-3 rounded-xl group transition-colors cursor-default"
                style={{ '--hover-bg': 'var(--adm-bg)' } as React.CSSProperties}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Dot */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: meta.dot }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-xs font-semibold leading-tight truncate"
                      style={{ color: 'var(--adm-text)', fontFamily: 'Inter, sans-serif' }}
                    >
                      {ev.title}
                    </p>
                    <span className={`adm-badge ${meta.badge} flex-shrink-0`}>
                      {meta.label}
                    </span>
                  </div>
                  <p
                    className="text-[11px] mt-0.5 truncate"
                    style={{ color: 'var(--adm-text-muted)' }}
                  >
                    {ev.description}
                  </p>
                </div>

                {/* Time */}
                <p
                  className="text-[10px] font-mono flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--adm-text-muted)' }}
                >
                  {ev.time}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
