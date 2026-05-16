'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Hash, Calendar, Award, Zap, Flame } from 'lucide-react';
import api from '@/lib/axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/profile').then(({ data }) => setProfile(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;
  if (!profile) return null;

  const fields = [
    { icon: User, label: 'Name', value: profile.name as string },
    { icon: Mail, label: 'Email', value: profile.email as string },
    { icon: Hash, label: 'Student ID', value: profile.studentId as string },
    { icon: BookOpen, label: 'Department', value: profile.department as string },
    { icon: Calendar, label: 'Semester', value: `Semester ${profile.semester}` },
    { icon: Zap, label: 'XP', value: `${profile.xp} XP` },
    { icon: Award, label: 'Level', value: `Level ${profile.level}` },
    { icon: Flame, label: 'Streak', value: `${profile.streakDays} days` }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--s-text)' }}>👤 My Profile</h1>
      <div className="p-6 rounded-2xl border-2" style={{ background: 'var(--s-card)', borderColor: 'var(--s-border)' }}>
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-black" style={{ fontFamily: 'var(--font-display)' }}>
          {(profile.name as string)?.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-3">
          {fields.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
              <f.icon size={16} style={{ color: 'var(--s-muted)' }} />
              <span className="text-xs w-20" style={{ fontFamily: 'var(--font-mono)', color: 'var(--s-muted)' }}>{f.label}</span>
              <span className="text-sm font-bold flex-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--s-text)' }}>{f.value || '-'}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {((profile.badges as string[]) || []).map((b, i) => (
            <span key={i} className="px-3 py-1 bg-yellow-100 rounded-full text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>🏅 {b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
