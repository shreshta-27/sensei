'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Trophy } from 'lucide-react';
import api from '@/lib/axios';

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#CD7C2A'];
const RANK_LABELS = ['🥇', '🥈', '🥉'];

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/faculty-effectiveness')
      .then(({ data }) => setFaculty(data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={24} style={{ color: '#F59E0B' }} />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Faculty Effectiveness
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>AI-driven teacher performance rankings</p>
      </motion.div>

      {faculty.length === 0 ? (
        <div className="adm-card p-12 text-center">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--adm-accent)' }} />
          <p style={{ color: 'var(--adm-text-muted)' }}>No faculty data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faculty.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="adm-card p-5 flex items-center gap-4"
              whileHover={{ y: -2 }}
            >
              {/* Rank */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm"
                style={{
                  background: i < 3 ? `${RANK_COLORS[i]}18` : 'rgba(124,58,237,0.08)',
                  border: `2px solid ${i < 3 ? RANK_COLORS[i] + '44' : 'rgba(124,58,237,0.12)'}`,
                }}
              >
                {i < 3 ? RANK_LABELS[i] : <span className="text-base font-black" style={{ color: 'var(--adm-text-muted)' }}>{i + 1}</span>}
              </div>

              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow"
                style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' }}
              >
                {(f.name || 'F').charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{f.name}</h3>
                <p className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>{f.dept}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-5 text-center flex-shrink-0">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Star size={13} style={{ color: '#F59E0B' }} />
                    <p className="text-xl font-bold" style={{ color: '#D97706', fontFamily: 'Space Grotesk, sans-serif' }}>{f.score}</p>
                  </div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--adm-text-muted)' }}>AI Score</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <TrendingUp size={13} style={{ color: '#22C55E' }} />
                    <p className="text-xl font-bold" style={{ color: '#16A34A', fontFamily: 'Space Grotesk, sans-serif' }}>{f.passRate}%</p>
                  </div>
                  <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--adm-text-muted)' }}>Pass Rate</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
