'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import CountUp from 'react-countup';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function StatsCard({ label, value, icon: Icon, color, delay = 0 }: StatsCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';
  const isNumeric = !isNaN(numericValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="faculty-card p-4 group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div
          className="w-2 h-2 rounded-full animate-glow-pulse"
          style={{ background: color }}
        />
      </div>
      <p className="font-faculty-data text-2xl font-semibold text-faculty-text mb-1">
        {isNumeric ? (
          <CountUp end={numericValue} duration={1.5} delay={delay} suffix={suffix} />
        ) : (
          value
        )}
      </p>
      <p className="font-faculty text-xs text-faculty-text-secondary uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
}
