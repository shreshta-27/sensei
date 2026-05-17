'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, BarChart3, Users, TrendingUp,
  ArrowLeft, ChevronDown, ChevronUp, Eye, X,
  PieChart, Activity, GraduationCap, AlertTriangle,
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const REPORTS = [
  {
    id: 'monthly',
    title: 'Monthly University Overview',
    desc: 'Student performance, risks, and faculty stats',
    icon: <BarChart3 size={22} />,
    color: '#7C3AED',
    bg: 'rgba(237,233,254,0.7)',
    endpoint: '/api/admin/reports/monthly',
  },
  {
    id: 'risk',
    title: 'Student Risk Analysis',
    desc: 'Dropout predictions and intervention outcomes',
    icon: <Users size={22} />,
    color: '#EF4444',
    bg: 'rgba(255,228,232,0.7)',
    endpoint: '/api/admin/reports/risk',
  },
  {
    id: 'faculty',
    title: 'Faculty Performance Report',
    desc: 'AI-ranked effectiveness and engagement scores',
    icon: <TrendingUp size={22} />,
    color: '#10B981',
    bg: 'rgba(209,250,229,0.7)',
    endpoint: '/api/admin/reports/faculty',
  },
  {
    id: 'naac',
    title: 'NAAC Accreditation Report',
    desc: 'Comprehensive compliance and quality metrics',
    icon: <FileText size={22} />,
    color: '#F59E0B',
    bg: 'rgba(254,249,195,0.7)',
    endpoint: '/api/admin/reports/naac',
  },
];

// Mock preview data for each report type
const PREVIEW_DATA: Record<string, { metrics: { label: string; value: string; icon: any; color: string }[]; summary: string }> = {
  monthly: {
    summary: 'This report covers overall university performance for the current month including student metrics, faculty effectiveness, and infrastructure usage.',
    metrics: [
      { label: 'Total Students', value: '9,842', icon: Users, color: '#7C3AED' },
      { label: 'Avg CGPA', value: '7.2', icon: BarChart3, color: '#3B82F6' },
      { label: 'Pass Rate', value: '92%', icon: TrendingUp, color: '#22C55E' },
      { label: 'At-Risk', value: '12%', icon: AlertTriangle, color: '#EF4444' },
    ],
  },
  risk: {
    summary: 'Comprehensive analysis of student dropout probabilities with AI-driven risk tiers and recommended interventions.',
    metrics: [
      { label: 'Critical Risk', value: '47', icon: AlertTriangle, color: '#EF4444' },
      { label: 'High Risk', value: '123', icon: Activity, color: '#F59E0B' },
      { label: 'Medium Risk', value: '289', icon: PieChart, color: '#3B82F6' },
      { label: 'Interventions Sent', value: '156', icon: Users, color: '#22C55E' },
    ],
  },
  faculty: {
    summary: 'AI-evaluated faculty performance rankings based on teaching effectiveness, student outcomes, and engagement metrics.',
    metrics: [
      { label: 'Total Faculty', value: '512', icon: GraduationCap, color: '#7C3AED' },
      { label: 'Avg Score', value: '84', icon: BarChart3, color: '#F59E0B' },
      { label: 'Top Performers', value: '48', icon: TrendingUp, color: '#22C55E' },
      { label: 'Needs Review', value: '12', icon: AlertTriangle, color: '#EF4444' },
    ],
  },
  naac: {
    summary: 'Compliance and quality metrics for NAAC accreditation including academic, infrastructure, and governance benchmarks.',
    metrics: [
      { label: 'Overall Score', value: '3.42/4', icon: BarChart3, color: '#F59E0B' },
      { label: 'Criteria Met', value: '28/35', icon: TrendingUp, color: '#22C55E' },
      { label: 'Pending Items', value: '7', icon: AlertTriangle, color: '#EF4444' },
      { label: 'Compliance', value: '87%', icon: PieChart, color: '#7C3AED' },
    ],
  },
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(({ data }) => setDashboardData(data))
      .catch(() => {});
  }, []);

  const handleDownload = async (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading(`Generating ${title}…`);
    await new Promise((r) => setTimeout(r, 1500));
    toast.dismiss();
    toast.success(`${title} downloaded!`);
  };

  const toggleExpand = (id: string) => {
    setExpandedReport(expandedReport === id ? null : id);
  };

  // Override preview data with real dashboard data if available
  const getPreviewData = (id: string) => {
    const base = PREVIEW_DATA[id];
    if (!dashboardData || !base) return base;

    if (id === 'monthly') {
      const u = dashboardData.university || {};
      const p = dashboardData.performance || {};
      return {
        ...base,
        metrics: [
          { label: 'Total Students', value: (u.totalStudents || 9842).toLocaleString(), icon: Users, color: '#7C3AED' },
          { label: 'Avg CGPA', value: String(p.avgCgpa || 7.2), icon: BarChart3, color: '#3B82F6' },
          { label: 'Pass Rate', value: `${p.passRate || 92}%`, icon: TrendingUp, color: '#22C55E' },
          { label: 'At-Risk', value: `${p.atRiskPercentage || 12}%`, icon: AlertTriangle, color: '#EF4444' },
        ],
      };
    }
    return base;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push('/admin')}
          className="adm-back-btn mb-4"
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <FileText size={24} style={{ color: 'var(--adm-accent)' }} />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Executive Reports
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Click to preview reports, then download as PDF</p>
      </motion.div>

      <div className="space-y-3">
        {REPORTS.map((r, i) => {
          const isExpanded = expandedReport === r.id;
          const preview = getPreviewData(r.id);

          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09 }}
              layout
            >
              {/* Report Card */}
              <div
                className="adm-card overflow-hidden"
                style={{ transition: 'box-shadow 0.22s ease' }}
              >
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => toggleExpand(r.id)}
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: `${r.color}15`, color: r.color }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Preview */}
                <AnimatePresence>
                  {isExpanded && preview && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-5 pb-5 pt-2"
                        style={{ borderTop: `1px solid ${r.color}15` }}
                      >
                        {/* Summary */}
                        <div className="p-4 rounded-xl mb-4" style={{ background: `${r.color}08`, border: `1px solid ${r.color}12` }}>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--adm-text-sub)' }}>{preview.summary}</p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {preview.metrics.map((m, j) => (
                            <div
                              key={j}
                              className="p-3 rounded-xl text-center"
                              style={{ background: `${m.color}10`, border: `1px solid ${m.color}18` }}
                            >
                              <div className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${m.color}15` }}>
                                <m.icon size={14} style={{ color: m.color }} />
                              </div>
                              <p className="text-lg font-bold" style={{ color: m.color, fontFamily: 'Space Grotesk, sans-serif' }}>{m.value}</p>
                              <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: m.color, opacity: 0.7 }}>{m.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Download Button */}
                        <button
                          onClick={(e) => handleDownload(r.title, e)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                          style={{
                            background: `linear-gradient(135deg, ${r.color}, ${r.color}CC)`,
                            boxShadow: `0 4px 12px ${r.color}44`,
                          }}
                        >
                          <Download size={16} /> Download Full Report (PDF)
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
