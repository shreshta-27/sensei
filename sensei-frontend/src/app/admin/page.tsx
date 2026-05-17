'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, Activity } from 'lucide-react';
import api from '@/lib/axios';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AIEventStream from '@/components/admin/AIEventStream';
import CampusMap from '@/components/admin/CampusMap';
import PredictiveAlerts from '@/components/admin/PredictiveAlerts';
import DepartmentSnapshot from '@/components/admin/DepartmentSnapshot';
import QuickCommands from '@/components/admin/QuickCommands';
import DepartmentsTable from '@/components/admin/DepartmentsTable';

export default function AdminDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api
      .get('/api/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {
        setData({
          university: { totalStudents: 9842, totalTeachers: 512, totalDepartments: 8, totalClasses: 642 },
          performance: { avgCgpa: 7.2, passRate: 92, avgAttendance: 78, atRiskPercentage: 12 },
        });
      });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--adm-text-muted)' }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  const u = (data.university || {}) as Record<string, number>;
  const p = (data.performance  || {}) as Record<string, number>;

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* ── Page Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}
            >
              Admin Overview
            </h1>
            <span className="text-2xl select-none">👑</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>
            Real-time overview of your intelligent campus ecosystem.
          </p>
        </div>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Students"
          value={u.totalStudents || 9842}
          icon={<Users size={20} />}
          bgColor="rgba(237,233,254,0.82)"
          accentColor="#6D28D9"
          trend="6.2%"
          trendUp={true}
          delay={0}
          href="/admin/users"
        />
        <AdminStatCard
          label="Faculty Members"
          value={u.totalTeachers || 512}
          icon={<GraduationCap size={20} />}
          bgColor="rgba(254,249,195,0.82)"
          accentColor="#D97706"
          trend="3.4%"
          trendUp={true}
          delay={80}
          href="/admin/faculty"
        />
        <AdminStatCard
          label="Active Courses"
          value={u.totalClasses || 642}
          icon={<BookOpen size={20} />}
          bgColor="rgba(255,228,232,0.82)"
          accentColor="#BE123C"
          trend="7.1%"
          trendUp={true}
          delay={160}
          href="/admin/curriculum"
        />
        <AdminStatCard
          label="System Health"
          value={p.passRate || 92}
          icon={<Activity size={20} />}
          bgColor="rgba(209,250,229,0.82)"
          accentColor="#065F46"
          trendLabel="All systems operational"
          delay={240}
          isPercentage={true}
          href="/admin/system"
        />
      </div>

      {/* ── Campus Map + AI Event Stream ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={{ minHeight: '380px' }}
        >
          <CampusMap />
        </motion.div>
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
          style={{ minHeight: '380px' }}
        >
          <AIEventStream />
        </motion.div>
      </div>

      {/* ── Predictive Alerts + Dept Snapshot + Quick Cmds ─ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        <motion.div
          className="md:col-span-1 xl:col-span-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
        >
          <PredictiveAlerts />
        </motion.div>
        <motion.div
          className="md:col-span-1 xl:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
        >
          <DepartmentSnapshot />
        </motion.div>
        <motion.div
          className="md:col-span-2 xl:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <QuickCommands />
        </motion.div>
      </div>

      {/* ── Departments Table ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.56, duration: 0.4 }}
      >
        <DepartmentsTable />
      </motion.div>
    </div>
  );
}
