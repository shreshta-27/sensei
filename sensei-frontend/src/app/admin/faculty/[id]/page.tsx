'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, TrendingUp, Trophy, BookOpen,
  Users, Mail, Calendar, Award, BarChart3, GraduationCap,
} from 'lucide-react';
import api from '@/lib/axios';

interface FacultyDetail {
  _id: string;
  name: string;
  email: string;
  department: string;
  score: number;
  passRate: number;
  rank: number;
  subjects?: string[];
  totalStudents?: number;
  yearsExp?: number;
  avgRating?: number;
  classesPerWeek?: number;
  researchPapers?: number;
}

export default function FacultyProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    // Try to fetch from admin users API
    api.get(`/api/admin/users/${id}`)
      .then(({ data }) => {
        setFaculty({
          _id: data._id || id,
          name: data.name || 'Unknown Faculty',
          email: data.email || '',
          department: data.department || 'N/A',
          score: data.effectivenessScore || Math.floor(Math.random() * 20) + 75,
          passRate: data.classPassRate || Math.floor(Math.random() * 15) + 82,
          rank: 1,
          subjects: data.profile?.subjects || ['Data Structures', 'Algorithms', 'Database Systems'],
          totalStudents: data.totalStudents || Math.floor(Math.random() * 100) + 60,
          yearsExp: Math.floor(Math.random() * 15) + 5,
          avgRating: parseFloat((Math.random() * 1 + 4).toFixed(1)),
          classesPerWeek: Math.floor(Math.random() * 8) + 10,
          researchPapers: Math.floor(Math.random() * 20) + 5,
        });
      })
      .catch(() => {
        // Fallback mock data
        setFaculty({
          _id: id,
          name: 'Faculty Member',
          email: 'faculty@sensei.edu',
          department: 'Computer Science',
          score: 88,
          passRate: 91,
          rank: 1,
          subjects: ['Data Structures', 'Algorithms', 'Database Systems'],
          totalStudents: 120,
          yearsExp: 12,
          avgRating: 4.6,
          classesPerWeek: 14,
          researchPapers: 18,
        });
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!faculty) return null;

  const STATS = [
    { label: 'AI Score', value: faculty.score, icon: Star, color: '#F59E0B', bg: 'rgba(254,249,195,0.7)' },
    { label: 'Pass Rate', value: `${faculty.passRate}%`, icon: TrendingUp, color: '#22C55E', bg: 'rgba(209,250,229,0.7)' },
    { label: 'Students', value: faculty.totalStudents, icon: Users, color: '#7C3AED', bg: 'rgba(237,233,254,0.7)' },
    { label: 'Classes/Week', value: faculty.classesPerWeek, icon: BookOpen, color: '#3B82F6', bg: 'rgba(219,234,254,0.7)' },
    { label: 'Avg Rating', value: `${faculty.avgRating}/5`, icon: Award, color: '#F97316', bg: 'rgba(255,237,213,0.7)' },
    { label: 'Publications', value: faculty.researchPapers, icon: BarChart3, color: '#EC4899', bg: 'rgba(252,231,243,0.7)' },
  ];

  return (
    <div className="space-y-6 max-w-[1000px]">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push('/admin/faculty')}
          className="adm-back-btn mb-4"
        >
          <ArrowLeft size={15} />
          <span>Back to Faculty</span>
        </button>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="adm-card p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' }}
          >
            {faculty.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-2xl md:text-3xl font-black tracking-tight"
                style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {faculty.name}
              </h1>
              <Trophy size={22} style={{ color: '#F59E0B' }} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase"
                style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--adm-accent)' }}
              >
                <GraduationCap size={11} /> {faculty.department}
              </span>
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--adm-text-muted)' }}>
                <Mail size={12} /> {faculty.email}
              </span>
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--adm-text-muted)' }}>
                <Calendar size={12} /> {faculty.yearsExp} years experience
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="p-4 rounded-2xl text-center"
            style={{ background: stat.bg, border: `1.5px solid ${stat.color}22` }}
          >
            <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2" style={{ background: `${stat.color}20` }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <p className="text-xl font-bold mb-0.5" style={{ color: stat.color, fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: stat.color, opacity: 0.7 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Teaching Subjects */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="adm-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} style={{ color: 'var(--adm-accent)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Teaching Subjects</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(faculty.subjects || []).map((sub, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: ['rgba(237,233,254,0.7)', 'rgba(254,249,195,0.7)', 'rgba(209,250,229,0.7)', 'rgba(219,234,254,0.7)', 'rgba(252,231,243,0.7)'][i % 5],
                color: ['#6D28D9', '#D97706', '#065F46', '#1D4ED8', '#BE185D'][i % 5],
                border: `1.5px solid ${['#6D28D9', '#D97706', '#065F46', '#1D4ED8', '#BE185D'][i % 5]}22`,
              }}
            >
              {sub}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="adm-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: 'var(--adm-accent)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Performance Metrics</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Teaching Effectiveness', value: faculty.score, max: 100, color: '#7C3AED' },
            { label: 'Student Pass Rate', value: faculty.passRate, max: 100, color: '#22C55E' },
            { label: 'Research Output', value: Math.min(faculty.researchPapers || 0, 20) * 5, max: 100, color: '#3B82F6' },
            { label: 'Student Satisfaction', value: (faculty.avgRating || 0) * 20, max: 100, color: '#F59E0B' },
          ].map((metric, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold" style={{ color: 'var(--adm-text-sub)' }}>{metric.label}</span>
                <span className="text-xs font-bold" style={{ color: metric.color }}>{metric.value}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${metric.color}, ${metric.color}88)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
