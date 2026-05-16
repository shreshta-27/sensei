'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, Calendar, Shield, Activity, ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface UserData {
  user: { _id: string; name: string; email: string; role: string; department: string; studentId?: string; isActive: boolean; createdAt: string; };
  semester?: number;
  insight?: { cgpa: number; riskLevel: string; dropoutScore: number; summary: string; behaviorFlags: string[]; };
}

const RISK_COLORS: Record<string, string> = {
  critical: '#EF4444', high: '#F59E0B', medium: '#FBBF24', low: '#22C55E',
};

export default function UserProfilePage() {
  const { id } = useParams();
  const router  = useRouter();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/admin/users/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!data) return <div className="text-center py-20" style={{ color: 'var(--adm-text-muted)' }}>User not found</div>;

  const { user, insight } = data;
  const isStudent = user.role === 'student';
  const riskColor = RISK_COLORS[insight?.riskLevel || 'low'] || '#22C55E';

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold transition-colors group"
        style={{ color: 'var(--adm-accent)' }}
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="adm-card p-7 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 -translate-y-16 translate-x-16" style={{ background: 'var(--adm-accent)' }} />

        <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--adm-accent) 0%, #A78BFA 100%)' }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{user.name}</h1>
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: user.isActive ? '#16A34A' : '#DC2626',
                    background: user.isActive ? 'rgba(209,250,229,0.8)' : 'rgba(255,228,232,0.8)',
                  }}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--adm-accent)' }}>
                {user.role.toUpperCase()} • {user.department}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4" style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
              {[
                { icon: <Mail size={15} />, text: user.email },
                { icon: <GraduationCap size={15} />, text: isStudent ? `ID: ${user.studentId}` : user.role },
                { icon: <Calendar size={15} />, text: `Joined ${new Date(user.createdAt).toLocaleDateString()}` },
                { icon: <Activity size={15} />, text: isStudent ? `Semester ${data.semester || 'N/A'}` : user.department },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span style={{ color: 'var(--adm-text-muted)' }}>{item.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--adm-text-sub)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Student Insight Cards */}
      {isStudent && insight && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Current CGPA', value: insight.cgpa, color: '#D97706', bg: 'rgba(254,249,195,0.8)', suffix: '' },
            { label: 'Risk Level',   value: insight.riskLevel?.toUpperCase(), color: riskColor, bg: `${riskColor}18`, suffix: '' },
            { label: 'Dropout Score', value: `${insight.dropoutScore}%`, color: '#EF4444', bg: 'rgba(255,228,232,0.8)', suffix: '' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }}
              className="adm-card p-6 text-center"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--adm-text-muted)' }}>{card.label}</p>
              <p className="text-4xl font-black" style={{ color: card.color, fontFamily: 'Space Grotesk, sans-serif' }}>{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {isStudent && insight?.summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="adm-card p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--adm-text-muted)' }}>AI Summary</p>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--adm-text-sub)' }}>"{insight.summary}"</p>
        </motion.div>
      )}

      {/* Behavior Flags */}
      {isStudent && insight && (insight.behaviorFlags?.length ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="adm-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} style={{ color: 'var(--adm-accent)' }} />
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--adm-text-muted)' }}>AI Behavior Flags</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(insight.behaviorFlags ?? []).map(flag => (
              <span key={flag} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}>
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <Edit3 size={15} /> Edit Profile
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Trash2 size={15} /> Deactivate
        </button>
      </div>
    </div>
  );
}
