'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, BarChart3, MoreHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  short: string;
  emoji: string;
  color: string;
  totalStudents: number;
  faculty: number;
  courses: number;
  performance: number;
  wellness: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
}

const DEPARTMENTS: Department[] = [
  { id: 'cse',  name: 'Computer Science Engineering', short: 'CSE',  emoji: '💻', color: '#3B82F6', totalStudents: 1842, faculty: 98,  courses: 156, performance: 88, wellness: 84, engagement: 92, trend: 'up'     },
  { id: 'ece',  name: 'Electronics & Communication',  short: 'ECE',  emoji: '⚡', color: '#F59E0B', totalStudents: 1376, faculty: 76,  courses: 112, performance: 74, wellness: 76, engagement: 78, trend: 'down'   },
  { id: 'mech', name: 'Mechanical Engineering',       short: 'MECH', emoji: '⚙️', color: '#10B981', totalStudents: 1289, faculty: 64,  courses: 98,  performance: 79, wellness: 81, engagement: 80, trend: 'stable' },
  { id: 'bba',  name: 'Business Administration',      short: 'BBA',  emoji: '📊', color: '#8B5CF6', totalStudents: 1102, faculty: 58,  courses: 80,  performance: 85, wellness: 89, engagement: 90, trend: 'up'     },
  { id: 'it',   name: 'Information Technology',       short: 'IT',   emoji: '🌐', color: '#F43F5E', totalStudents: 923,  faculty: 52,  courses: 72,  performance: 82, wellness: 83, engagement: 85, trend: 'up'     },
];

function PerformanceBadge({ value }: { value: number }) {
  const color = value >= 85 ? '#16A34A' : value >= 75 ? '#D97706' : '#DC2626';
  const bg    = value >= 85 ? '#F0FDF4' : value >= 75 ? '#FFFBEB' : '#FEF2F2';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold" style={{ color, background: bg }}>
      {value}%
    </span>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')     return <TrendingUp size={14} className="text-green-500" />;
  if (trend === 'down')   return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-gray-400" />;
}

// Mini sparkline SVG
function Sparkline({ trend, color }: { trend: 'up' | 'down' | 'stable'; color: string }) {
  const points =
    trend === 'up'     ? '0,20 10,15 20,12 30,8 40,5'   :
    trend === 'down'   ? '0,5 10,8 20,12 30,15 40,20'   :
                         '0,12 10,10 20,13 30,11 40,12';
  return (
    <svg width={44} height={24} viewBox="0 0 44 24" fill="none">
      <polyline points={points} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DepartmentsTable() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="adm-card">
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <h3 className="adm-section-title">Departments</h3>
        <Link
          href="/admin/analytics"
          className="text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--adm-accent)', background: 'var(--adm-accent-light)' }}
        >
          View All Analytics →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid var(--adm-border-solid)` }}>
              {['Department', 'Total Students', 'Faculty', 'Courses', 'Performance', 'Wellness', 'Engagement', 'Trend', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: 'var(--adm-text-muted)', background: 'var(--adm-surface-raised)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((dept, i) => (
              <motion.tr
                key={dept.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.2 }}
                className="border-b group transition-colors"
                style={{ borderColor: 'var(--adm-border-solid)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Department */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${dept.color}18` }}
                    >
                      {dept.emoji}
                    </div>
                    <div>
                      <p className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--adm-text)', fontFamily: 'Inter, sans-serif' }}>
                        {dept.name}
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: dept.color }}>{dept.short}</p>
                    </div>
                  </div>
                </td>

                {/* Total Students */}
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--adm-text)' }}>
                    {dept.totalStudents.toLocaleString()}
                  </span>
                </td>

                {/* Faculty */}
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: 'var(--adm-text-sub)' }}>{dept.faculty}</span>
                </td>

                {/* Courses */}
                <td className="px-4 py-3">
                  <span className="text-sm" style={{ color: 'var(--adm-text-sub)' }}>{dept.courses}</span>
                </td>

                {/* Performance */}
                <td className="px-4 py-3">
                  <PerformanceBadge value={dept.performance} />
                </td>

                {/* Wellness */}
                <td className="px-4 py-3">
                  <PerformanceBadge value={dept.wellness} />
                </td>

                {/* Engagement */}
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold" style={{ color: 'var(--adm-text-sub)' }}>{dept.engagement}%</span>
                </td>

                {/* Trend Sparkline */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Sparkline trend={dept.trend} color={dept.trend === 'up' ? '#22C55E' : dept.trend === 'down' ? '#EF4444' : '#9CA3AF'} />
                    <TrendIcon trend={dept.trend} />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/analytics`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      title="View"
                      style={{ color: 'var(--adm-text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-accent-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--adm-accent)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--adm-text-muted)'; }}
                    >
                      <Eye size={14} />
                    </Link>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      title="Analytics"
                      style={{ color: 'var(--adm-text-muted)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-accent-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--adm-accent)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--adm-text-muted)'; }}
                      onClick={() => toast(`📊 Analytics for ${dept.name}`)}
                    >
                      <BarChart3 size={14} />
                    </button>
                    <div className="relative">
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--adm-text-muted)' }}
                        onClick={() => setOpenMenu(openMenu === dept.id ? null : dept.id)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {openMenu === dept.id && (
                        <div
                          className="absolute right-0 top-8 z-20 w-40 rounded-xl shadow-lg py-1"
                          style={{ background: 'var(--adm-surface)', border: '1px solid var(--adm-border-solid)' }}
                        >
                          {['Export Data', 'Send Report', 'Archive Dept'].map((item) => (
                            <button
                              key={item}
                              className="w-full text-left px-3 py-2 text-xs transition-colors"
                              style={{ color: 'var(--adm-text-sub)' }}
                              onClick={() => { toast(item); setOpenMenu(null); }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
