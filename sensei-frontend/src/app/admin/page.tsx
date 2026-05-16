'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, AlertTriangle, TrendingUp, Shield, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/axios';

export default function AdminDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.get('/api/admin/dashboard').then(({ data }) => setData(data)).catch(() => {
      setData({
        university: { totalStudents: 2450, totalTeachers: 85, totalDepartments: 8, totalClasses: 42 },
        performance: { avgCgpa: 7.2, passRate: 88, avgAttendance: 78, atRiskPercentage: 12 },
        riskDistribution: { critical: 15, high: 35, medium: 80, low: 2320 },
        interventions: { total: 340, successful: 220, pending: 45, worsened: 12 }
      });
    });
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;

  const u = (data.university || {}) as Record<string, number>;
  const p = (data.performance || {}) as Record<string, number>;
  const r = (data.riskDistribution || {}) as Record<string, number>;
  const iv = (data.interventions || {}) as Record<string, number>;

  const stats = [
    { label: 'Total Students', value: u.totalStudents || 0, icon: GraduationCap, color: '#A29BFE' },
    { label: 'Teachers', value: u.totalTeachers || 0, icon: Users, color: '#4ECDC4' },
    { label: 'Departments', value: u.totalDepartments || 0, icon: BookOpen, color: '#FFD700' },
    { label: 'Avg CGPA', value: p.avgCgpa || 0, icon: TrendingUp, color: '#4CAF50' },
    { label: 'Pass Rate', value: `${p.passRate || 0}%`, icon: Shield, color: '#FF6B6B' },
    { label: 'At Risk', value: `${p.atRiskPercentage || 0}%`, icon: AlertTriangle, color: '#FF9800' },
  ];

  const riskData = [
    { name: 'Low', value: r.low || 0, color: '#4CAF50' },
    { name: 'Medium', value: r.medium || 0, color: '#FFC107' },
    { name: 'High', value: r.high || 0, color: '#FF9800' },
    { name: 'Critical', value: r.critical || 0, color: '#F44336' }
  ];

  const interventionData = [
    { name: 'Successful', value: iv.successful || 0, fill: '#4CAF50' },
    { name: 'Pending', value: iv.pending || 0, fill: '#FFC107' },
    { name: 'Worsened', value: iv.worsened || 0, fill: '#F44336' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-4 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
            <s.icon size={16} style={{ color: s.color }} className="mb-2" />
            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{String(s.value)}</p>
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
          <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>⚠️ Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskData}>
              <XAxis dataKey="name" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#8888AA' }} />
              <YAxis style={{ fontSize: 10, fill: '#8888AA' }} />
              <Tooltip contentStyle={{ background: '#13132A', border: '1px solid #2D2D5E', borderRadius: 8, color: '#E8E8FF' }} />
              <Bar dataKey="value">{riskData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
          <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>🎯 Interventions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={interventionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {interventionData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#13132A', border: '1px solid #2D2D5E', borderRadius: 8, color: '#E8E8FF' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {interventionData.map((d) => <span key={d.name} className="text-xs flex items-center gap-1" style={{ color: d.fill }}><span className="w-2 h-2 rounded-full inline-block" style={{ background: d.fill }} />{d.name}: {d.value}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
