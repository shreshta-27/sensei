'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, Mail, GraduationCap, MapPin, Calendar, 
  Shield, Activity, TrendingUp, ArrowLeft, 
  Edit3, Trash2, CheckCircle, AlertCircle 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface UserData {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    studentId?: string;
    isActive: boolean;
    createdAt: string;
  };
  semester?: number;
  insight?: {
    cgpa: number;
    riskLevel: string;
    dropoutScore: number;
    summary: string;
    behaviorFlags: string[];
  };
}

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/admin/users/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-400">User not found</div>;

  const { user, insight } = data;
  const isStudent = user.role === 'student';

  const riskColor = insight?.riskLevel === 'critical' ? 'text-red-500' : 
                    insight?.riskLevel === 'high' ? 'text-orange-500' : 
                    insight?.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold tracking-widest text-xs uppercase">Back to Control</span>
      </button>

      <div className="relative">
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl border overflow-hidden relative"
          style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
          
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User size={120} style={{ color: 'var(--a-primary)' }} />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-[0_0_30px_rgba(108,92,231,0.4)] border border-purple-400/30 rotate-3">
              {user.name.charAt(0)}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>{user.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {user.isActive ? 'Active System' : 'System Offline'}
                  </span>
                </div>
                <p className="text-purple-400 font-mono text-sm tracking-widest uppercase">{user.role} • {user.department}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-purple-500/10">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-500" />
                  <span className="text-gray-300 text-sm">{user.email}</span>
                </div>
                {isStudent && (
                  <div className="flex items-center gap-3">
                    <GraduationCap size={18} className="text-gray-500" />
                    <span className="text-gray-300 text-sm">ID: {user.studentId}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-500" />
                  <span className="text-gray-300 text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {isStudent && (
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-gray-500" />
                    <span className="text-gray-300 text-sm">Semester {data.semester || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {}
        {isStudent && insight && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border text-center" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Performance</p>
              <h3 className="text-4xl font-bold" style={{ color: 'var(--a-gold)', fontFamily: 'var(--font-display)' }}>{insight.cgpa}</h3>
              <p className="text-[10px] text-gray-400 mt-2">Current CGPA</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl border text-center" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Risk Assessment</p>
              <h3 className={`text-4xl font-bold uppercase ${riskColor}`} style={{ fontFamily: 'var(--font-display)' }}>{insight.riskLevel}</h3>
              <p className="text-[10px] text-gray-400 mt-2">Dropout Probability: {insight.dropoutScore}%</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border flex flex-col justify-center" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 text-center">AI Summary</p>
              <p className="text-xs text-gray-300 italic line-clamp-3 text-center">"{insight.summary}"</p>
            </motion.div>
          </div>
        )}

        {}
        {isStudent && insight?.behaviorFlags && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-8 p-6 rounded-2xl border bg-black/20" style={{ borderColor: 'var(--a-border)' }}>
            <h4 className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-4 flex items-center gap-2">
              <Shield size={14} /> AI Behavior Flags
            </h4>
            <div className="flex flex-wrap gap-2">
              {insight.behaviorFlags.map(flag => (
                <span key={flag} className="px-3 py-1 bg-purple-900/30 border border-purple-500/20 rounded-full text-[10px] text-purple-300 font-mono uppercase tracking-widest">
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {}
        <div className="flex justify-end gap-4 mt-8">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-900/20 transition-all text-xs font-bold uppercase tracking-widest">
            <Edit3 size={16} /> Edit Profile
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-all text-xs font-bold uppercase tracking-widest">
            <Trash2 size={16} /> Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}
