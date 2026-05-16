'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/faculty-effectiveness').then(({ data }) => setFaculty(data.leaderboard || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>🏆 Faculty Effectiveness</h1>
      <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>AI-driven teacher performance rankings</p>

      {faculty.length === 0 ? (
        <p className="text-center py-12 text-gray-500">No faculty data available</p>
      ) : (
        <div className="space-y-3">
          {faculty.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border flex items-center justify-between" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--a-accent)', color: 'white', fontFamily: 'var(--font-display)' }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--a-text)', fontFamily: 'var(--font-display)' }}>{f.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--a-muted)' }}>{f.dept}</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-xl font-bold flex items-center justify-center gap-1" style={{ color: 'var(--a-gold)', fontFamily: 'var(--font-display)' }}><Star size={16} /> {f.score}</p>
                  <p className="text-xs" style={{ color: 'var(--a-muted)' }}>AI Score</p>
                </div>
                <div>
                  <p className="text-xl font-bold flex items-center justify-center gap-1" style={{ color: '#4CAF50', fontFamily: 'var(--font-display)' }}><TrendingUp size={16} /> {f.passRate}%</p>
                  <p className="text-xs" style={{ color: 'var(--a-muted)' }}>Pass Rate</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
