'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Download, FileText, Clock, Users, BookOpen,
  AlertTriangle, Activity, GraduationCap, ChevronRight, Calendar
} from 'lucide-react';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const reportTypes = [
  { title: 'Class Performance',    desc: 'Comprehensive summary of class grades and trends',  emoji: '📊', color: 'yellow' as const },
  { title: 'At-Risk Students',     desc: 'List of students needing intervention this term',    emoji: '⚠️',  color: 'pink'   as const },
  { title: 'Intervention Effectiveness', desc: 'Success rate of interventions this term',    emoji: '⚡',  color: 'green'  as const },
  { title: 'Attendance Summary',   desc: 'Monthly attendance report by class and student',    emoji: '📅', color: 'blue'   as const },
  { title: 'Subject Analysis',     desc: 'Per-subject breakdown with student averages',        emoji: '📚', color: 'purple' as const },
  { title: 'NAAC Documentation',   desc: 'Standardised accreditation and audit report',       emoji: '📋', color: 'orange' as const },
];

const recentReports = [
  { name: 'Class Performance — Nov 2024', date: 'Generated: Nov 20', type: 'Class Performance' },
  { name: 'At-Risk Students — Q3 2024',   date: 'Generated: Nov 12', type: 'At-Risk Students'  },
  { name: 'Intervention Summary — Q3',   date: 'Generated: Nov 5',  type: 'Intervention Effective' },
];

export default function ReportsPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    // Simulate report generation - connect to real API: POST /api/teacher/reports/generate
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGenerating(null);
    toast.success(`${type} report ready! (mock)`);
  };

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-[var(--text-primary)]">Reports</h1>
        <p className="font-handwrite text-xl text-[var(--text-muted)]">Generate and download class and student performance reports</p>
      </motion.div>

      {/* {/* Sample preview chart — at-risk distribution */}
      <StickyCard color="pink" className="!p-6">
        <h3 className="font-display text-xl mb-4">At-Risk Distribution</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[
                { name: 'Low Risk',       value: 106,    color: '#22C55E' },
                { name: 'Medium Risk',    value: 24,     color: '#F59E0B' },
                { name: 'High Risk',      value: 12,     color: '#F97316' },
                { name: 'Critical',       value: 3,      color: '#EF4444' },
              ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {[0,1,2,3].map(i => <Cell key={i} fill={['#22C55E','#F59E0B','#F97316','#EF4444'][i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </StickyCard>

      {/* Report cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportTypes.map((rt, i) => (
          <motion.div key={rt.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StickyCard color={rt.color} className="!p-5 h-full flex flex-col">
              <div className="text-3xl mb-2">{rt.emoji}</div>
              <h3 className="font-display text-lg text-[var(--text-primary)]">{rt.title}</h3>
              <p className="font-ui text-xs text-[var(--text-secondary)] mt-1 flex-1">{rt.desc}</p>
              <div className="mt-4">
                <ComicButton variant="secondary" size="sm"
                  loading={generating === rt.title}
                  onClick={() => handleGenerate(rt.title)}
                  className="w-full"
                >
                  <Download size={14} /> Generate PDF
                </ComicButton>
              </div>
            </StickyCard>
          </motion.div>
        ))}
      </div>

      {/* Recent reports list */}
      <div>
        <h2 className="font-display text-2xl mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {recentReports.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 bg-white border-2 border-[var(--border-card)] rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{r.name}</p>
                <p className="font-ui text-[11px] text-[var(--text-muted)]">{r.date}</p>
              </div>
              <button className="font-ui text-xs font-bold text-[var(--accent-purple)] border-2 border-[var(--accent-purple)] px-3 py-1.5 rounded-xl hover:bg-[var(--accent-purple)]/5 flex items-center gap-1">
                <Download size={12} /> PDF
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
