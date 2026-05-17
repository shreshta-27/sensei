'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';
import CountUp from 'react-countup';
import StickyCard from './StickyCard';

type StickyColor = 'yellow' | 'blue' | 'green' | 'purple' | 'pink' | 'orange';

interface KPICardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  color?: StickyColor;
  sub?: string;
  rotation?: number;
  suffix?: string;
  prefix?: string;
  urgent?: boolean;
  delay?: number;
}

export default function KPICard({ label, value, icon: Icon, color = 'yellow', sub, suffix = '', prefix = '', rotation = -0.5, urgent = false, delay = 0 }: KPICardProps) {
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g,'')) : value;
  const isNum = !isNaN(numVal) && isFinite(numVal);

  return (
    <StickyCard color={color} rotation={rotation} delay={delay}>
      <div className="flex items-start justify-between mb-2">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">
            <Icon size={20} className="text-[var(--text-secondary)]" />
          </div>
        )}
        {urgent && (
          <div className="w-3 h-3 rounded-full bg-red-500 animate-[pulse-pulse-dot_1.5s_ease-in-out_infinite]" />
        )}
      </div>
      {isNum ? (
        <CountUp end={numVal} duration={1.8} suffix={suffix} prefix={prefix} className="font-display text-[42px] leading-none" />
      ) : (
        <span className="font-display text-[42px] leading-none">{value}</span>
      )}
      <span className="block font-handwrite text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-1">{label}</span>
      {sub && <span className="block font-ui text-[11px] text-[var(--text-muted)] mt-1">{sub}</span>}
    </StickyCard>
  );
}
