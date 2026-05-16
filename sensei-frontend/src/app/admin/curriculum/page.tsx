'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Flag { subject: string; failureRate: number; severity: string; }

export default function AdminCurriculumPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(false);

  const analyse = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/admin/curriculum/analyse');
      setFlags(data.flags || []);
      if (data.flags?.length === 0) toast.success('No critical curriculum issues found 🎉');
    } catch {
      toast.error('Failed to analyze curriculum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { analyse(); }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={24} style={{ color: 'var(--adm-accent)' }} />
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Curriculum AI Analysis
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Detect subjects with abnormal failure rates</p>
        </div>
        <button
          onClick={analyse}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Re-Analyse
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : flags.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="adm-card p-12 text-center">
          <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#22C55E' }} />
          <p className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Curriculum is Healthy</p>
          <p className="text-sm mt-2" style={{ color: 'var(--adm-text-muted)' }}>No bottlenecks detected.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {flags.map((f, i) => {
            const isCritical = f.severity === 'critical';
            return (
              <motion.div
                key={f.subject}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="adm-card p-5 flex items-center justify-between"
                style={{ border: `1.5px solid ${isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}` }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isCritical ? 'rgba(255,228,232,0.8)' : 'rgba(254,249,195,0.8)' }}
                  >
                    <AlertTriangle size={20} style={{ color: isCritical ? '#EF4444' : '#F59E0B' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{f.subject}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>High failure rate detected</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: isCritical ? '#EF4444' : '#F59E0B', fontFamily: 'Space Grotesk, sans-serif' }}>{f.failureRate}%</p>
                  <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--adm-text-muted)' }}>Failure Rate</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
