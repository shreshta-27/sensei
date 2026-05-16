'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { X, GraduationCap, Mail, Info, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface OverviewItem { department: string; students: number; avgCgpa: number; }
interface StudentItem { _id: string; name: string; email: string; studentId: string; }

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<OverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptStudents, setDeptStudents] = useState<StudentItem[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  useEffect(() => {
    api.get('/api/admin/analytics/overview').then(({ data }) => setOverview(data.overview || [])).catch(() => {}).finally(() => setLoading(false));
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;

  return (
    <div className="space-y-6 max-w-5xl relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>📊 University Analytics</h1>
          <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>Cross-department performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.map((dept, i) => (
          <motion.div key={dept.department} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => handleCardClick(dept.department)}
            className="p-4 rounded-xl border group hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,155,254,0.15)] transition-all cursor-pointer relative overflow-hidden" 
            style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>{dept.department}</h3>
              <TrendingUp size={16} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-tighter" style={{ color: 'var(--a-muted)' }}>Students</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--a-text)', fontFamily: 'var(--font-body)' }}>{dept.students}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-tighter" style={{ color: 'var(--a-muted)' }}>Avg CGPA</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--a-gold)', fontFamily: 'var(--font-display)' }}>{dept.avgCgpa}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest group-hover:text-purple-300 transition-colors">
              Quick View <ArrowRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>

      {}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDept(null)} />
            
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl border overflow-hidden relative z-10"
              style={{ background: 'var(--a-bg2)', borderColor: 'var(--a-border)' }}>
              
              <div className="p-6 border-b flex justify-between items-center bg-black/20" style={{ borderColor: 'var(--a-border)' }}>
                <div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>{selectedDept} Students</h2>
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--a-muted)' }}>Department Registry</p>
                </div>
                <button onClick={() => setSelectedDept(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={24} style={{ color: 'var(--a-muted)' }} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 hide-scrollbar">
                {fetchingStudents ? (
                  <div className="flex items-center justify-center h-full"><div className="pencil-loader w-32" /></div>
                ) : deptStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Info size={48} className="mx-auto mb-4 opacity-20" />
                    <p style={{ color: 'var(--a-muted)' }}>No students found in this department.</p>
                  </div>
                ) : (
                  deptStudents.map((s, i) => (
                    <motion.div key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/admin/users/${s._id}`} 
                        className="p-4 rounded-xl border flex items-center justify-between group hover:bg-purple-900/10 hover:border-purple-500/30 transition-all cursor-pointer"
                        style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--a-text)', fontFamily: 'var(--font-body)' }}>{s.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] flex items-center gap-1 font-mono" style={{ color: 'var(--a-muted)' }}><GraduationCap size={10} /> {s.studentId}</span>
                              <span className="text-[10px] flex items-center gap-1 font-mono" style={{ color: 'var(--a-muted)' }}><Mail size={10} /> {s.email}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-5 rounded-xl border mt-6" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
        <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>📈 CGPA Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overview}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
            <XAxis dataKey="department" stroke="var(--a-muted)" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            <YAxis stroke="var(--a-muted)" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} domain={[0, 10]} />
            <Tooltip contentStyle={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)', borderRadius: '8px' }} />
            <Bar dataKey="avgCgpa" fill="var(--a-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
