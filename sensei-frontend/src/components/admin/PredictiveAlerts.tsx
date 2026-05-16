'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Users, BookOpen } from 'lucide-react';

interface Alert {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  trend: string;
  trendUp: boolean;
  color: string;
  bg: string;
}

const ALERTS: Alert[] = [
  {
    icon: <Users size={18} />,
    label: 'Dropout Risk',
    value: 178,
    unit: 'Students',
    trend: '↑ 12%',
    trendUp: true,
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    icon: <BookOpen size={18} />,
    label: 'Attendance Decline',
    value: 23,
    unit: 'Sections',
    trend: '↑ 5%',
    trendUp: true,
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    icon: <AlertTriangle size={18} />,
    label: 'Faculty Burnout',
    value: 14,
    unit: '%',
    trend: '↓ 3%',
    trendUp: false,
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
];

export default function PredictiveAlerts() {
  return (
    <div className="adm-card h-full flex flex-col">
      <div
        className="px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <h3 className="adm-section-title">Predictive Alerts</h3>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {ALERTS.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.35 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: a.bg, border: `1px solid ${a.color}22` }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}20`, color: a.color }}
            >
              {a.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: a.color }}>
                {a.label}
              </p>
              <p className="text-xl font-bold leading-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
                {typeof a.value === 'number' ? a.value.toLocaleString() : a.value}
                <span className="text-xs font-normal ml-1" style={{ color: 'var(--adm-text-muted)' }}>{a.unit}</span>
              </p>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {a.trendUp ? (
                <TrendingUp size={12} style={{ color: '#EF4444' }} />
              ) : (
                <TrendingDown size={12} style={{ color: '#22C55E' }} />
              )}
              <span
                className="text-[11px] font-bold"
                style={{ color: a.trendUp ? '#DC2626' : '#16A34A' }}
              >
                {a.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
