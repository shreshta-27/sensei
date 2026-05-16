'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface DeptItem {
  code: string;
  name: string;
  performance: number;
  wellness: number;
  color: string;
}

const DEPTS: DeptItem[] = [
  { code: 'CSE',  name: 'Computer Science',     performance: 88, wellness: 84, color: '#3B82F6' },
  { code: 'ECE',  name: 'Electronics & Comm',   performance: 74, wellness: 76, color: '#F59E0B' },
  { code: 'MECH', name: 'Mechanical Engg',      performance: 79, wellness: 81, color: '#10B981' },
  { code: 'BBA',  name: 'Business Admin',       performance: 89, wellness: 89, color: '#8B5CF6' },
];

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--adm-border-solid)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[11px] font-bold w-8 text-right flex-shrink-0" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export default function DepartmentSnapshot() {
  return (
    <div className="adm-card h-full flex flex-col">
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <h3 className="adm-section-title">Department Snapshot</h3>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
          style={{ color: 'var(--adm-accent)' }}
        >
          View All <ChevronRight size={12} />
        </Link>
      </div>

      <div className="flex-1 p-4 space-y-1">
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-3 px-2 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--adm-text-muted)' }}>Dept</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-center" style={{ color: 'var(--adm-text-muted)' }}>Perf.</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-center" style={{ color: 'var(--adm-text-muted)' }}>Wellness</p>
        </div>

        {DEPTS.map((d, i) => (
          <motion.div
            key={d.code}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
            className="grid grid-cols-3 gap-3 p-2 rounded-xl items-center transition-colors"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            {/* Dept name */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
                style={{ background: d.color }}
              >
                {d.code.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--adm-text)' }}>{d.code}</p>
                <p className="text-[9px] truncate" style={{ color: 'var(--adm-text-muted)' }}>{d.name}</p>
              </div>
            </div>

            {/* Performance */}
            <div>
              <MiniBar value={d.performance} color={d.color} />
            </div>

            {/* Wellness */}
            <div>
              <MiniBar value={d.wellness} color={d.wellness >= 85 ? '#22C55E' : d.wellness >= 75 ? '#F59E0B' : '#EF4444'} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
