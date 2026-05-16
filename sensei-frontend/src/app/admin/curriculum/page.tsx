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
      if (data.flags?.length === 0) toast.success('No critical curriculum issues found');
    } catch { toast.error('Failed to analyze curriculum'); }
    finally { setLoading(false); }
  };

  useEffect(() => { analyse(); }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>📚 Curriculum AI Analysis</h1>
          <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>Detect subjects with abnormal failure rates</p>
        </div>
        <button onClick={analyse} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Run Analysis
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="pencil-loader w-48" /></div> : flags.length === 0 ? (
        <div className="text-center py-12 border rounded-xl" style={{ borderColor: 'var(--a-border)', background: 'var(--a-card)' }}>
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--a-text)' }}>Curriculum is healthy. No bottlenecks detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((f, i) => (
            <motion.div key={f.subject} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border flex items-center justify-between" style={{ background: 'var(--a-card)', borderColor: f.severity === 'critical' ? '#F44336' : '#FF9800' }}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className={f.severity === 'critical' ? 'text-red-500' : 'text-orange-500'} />
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--a-text)', fontFamily: 'var(--font-display)' }}>{f.subject}</h3>
                  <p className="text-xs" style={{ color: 'var(--a-muted)' }}>High failure rate detected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: f.severity === 'critical' ? '#F44336' : '#FF9800', fontFamily: 'var(--font-display)' }}>{f.failureRate}%</p>
                <p className="text-xs" style={{ color: 'var(--a-muted)' }}>Failure Rate</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
