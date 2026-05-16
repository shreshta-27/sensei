'use client';

import { motion } from 'framer-motion';
import { FileText, Download, BarChart3, Users, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const REPORTS = [
  {
    title: 'Monthly University Overview',
    desc: 'Student performance, risks, and faculty stats',
    icon: <BarChart3 size={22} />,
    color: '#7C3AED',
    bg: 'rgba(237,233,254,0.7)',
    endpoint: '/api/admin/reports/monthly',
  },
  {
    title: 'Student Risk Analysis',
    desc: 'Dropout predictions and intervention outcomes',
    icon: <Users size={22} />,
    color: '#EF4444',
    bg: 'rgba(255,228,232,0.7)',
    endpoint: '/api/admin/reports/risk',
  },
  {
    title: 'Faculty Performance Report',
    desc: 'AI-ranked effectiveness and engagement scores',
    icon: <TrendingUp size={22} />,
    color: '#10B981',
    bg: 'rgba(209,250,229,0.7)',
    endpoint: '/api/admin/reports/faculty',
  },
  {
    title: 'NAAC Accreditation Report',
    desc: 'Comprehensive compliance and quality metrics',
    icon: <FileText size={22} />,
    color: '#F59E0B',
    bg: 'rgba(254,249,195,0.7)',
    endpoint: '/api/admin/reports/naac',
  },
];

export default function AdminReportsPage() {
  const handleDownload = async (title: string) => {
    toast.loading(`Generating ${title}…`);
    await new Promise((r) => setTimeout(r, 1500));
    toast.dismiss();
    toast.success(`${title} ready!`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={24} style={{ color: 'var(--adm-accent)' }} />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Executive Reports
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Download comprehensive university reports</p>
      </motion.div>

      <div className="space-y-3">
        {REPORTS.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}
            className="adm-card p-5 flex items-center gap-4"
            whileHover={{ y: -2 }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: r.bg, color: r.color }}
            >
              {r.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{r.title}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>PDF  •  {r.desc}</p>
            </div>
            <button
              onClick={() => handleDownload(r.title)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0 shadow"
              style={{ background: r.color, boxShadow: `0 4px 12px ${r.color}44` }}
            >
              <Download size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
