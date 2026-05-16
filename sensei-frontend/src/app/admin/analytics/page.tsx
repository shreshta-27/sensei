'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X, GraduationCap, Mail, ArrowRight, BarChart3, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const DEPT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

interface OverviewItem { department: string; students: number; avgCgpa: number; }
interface StudentItem  { _id: string; name: string; email: string; studentId: string; }

export default function AdminAnalyticsPage() {
  const [overview, setOverview]           = useState<OverviewItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedDept, setSelectedDept]   = useState<string | null>(null);
  const [deptStudents, setDeptStudents]   = useState<StudentItem[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  useEffect(() => {
    api.get('/api/admin/analytics/overview')
      .then(({ data }) => setOverview(data.overview || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = async (deptName: string) => {
    setSelectedDept(deptName);
    setFetchingStudents(true);
    try {
      const { data } = await api.get(`/api/admin/users?department=${deptName}&role=student&limit=100`);
      setDeptStudents(data.users || []);
    } catch {
      toast.error('Failed to fetch students');
    } finally {
      setFetchingStudents(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={24} style={{ color: 'var(--adm-accent)' }} />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
            University Analytics
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Cross-department performance insights</p>
      </motion.div>

      {/* Dept Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overview.map((dept, i) => (
          <motion.div
            key={dept.department}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            onClick={() => handleCardClick(dept.department)}
            className="adm-card p-5 cursor-pointer group"
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }}>
                {dept.department.charAt(0)}
              </div>
              <h3 className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{dept.department}</h3>
              <TrendingUp size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--adm-accent)' }} />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--adm-text-muted)' }}>Students</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{dept.students}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--adm-text-muted)' }}>Avg CGPA</p>
                <p className="text-2xl font-bold" style={{ color: DEPT_COLORS[i % DEPT_COLORS.length], fontFamily: 'Space Grotesk, sans-serif' }}>{dept.avgCgpa}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--adm-accent)' }}>
              View Students <ArrowRight size={11} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Student Modal */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(4px)' }}
              onClick={() => setSelectedDept(null)} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl overflow-hidden relative z-10"
              style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 24px 60px rgba(124,58,237,0.2)' }}>
              <div className="p-6 flex justify-between items-center flex-shrink-0" style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{selectedDept}</h2>
                  <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>Department Registry</p>
                </div>
                <button onClick={() => setSelectedDept(null)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto adm-scrollbar p-5 space-y-2">
                {fetchingStudents ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
                  </div>
                ) : deptStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Info size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--adm-text)' }} />
                    <p style={{ color: 'var(--adm-text-muted)' }}>No students found.</p>
                  </div>
                ) : deptStudents.map((s, i) => (
                  <motion.div key={s._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link href={`/admin/users/${s._id}`}
                      className="adm-card p-4 flex items-center justify-between group cursor-pointer block"
                      style={{ textDecoration: 'none' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' }}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--adm-text)' }}>{s.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--adm-text-muted)' }}><GraduationCap size={9} /> {s.studentId}</span>
                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--adm-text-muted)' }}><Mail size={9} /> {s.email}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--adm-accent)' }} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CGPA Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="adm-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--adm-text)' }}>CGPA Comparison by Department</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={overview} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.07)" vertical={false} />
            <XAxis dataKey="department" stroke="var(--adm-text-muted)" style={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
            <YAxis stroke="var(--adm-text-muted)" style={{ fontSize: 11 }} domain={[0, 10]} />
            <Tooltip
              contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }}
              cursor={{ fill: 'rgba(124,58,237,0.05)' }}
            />
            <Bar dataKey="avgCgpa" radius={[8, 8, 0, 0]}>
              {overview.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
