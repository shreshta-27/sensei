'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminInterventionsPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/interventions')
      .then(({ data }) => setInterventions(data.interventions || []))
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
          <AlertTriangle size={24} style={{ color: '#F59E0B' }} />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Global Interventions
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Monitor all faculty-student interventions</p>
      </motion.div>

      {interventions.length === 0 ? (
        <div className="adm-card p-12 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--adm-accent)' }} />
          <p style={{ color: 'var(--adm-text-muted)' }}>No interventions recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interventions.map((item, i) => {
            const resolved = item.status === 'resolved';
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="adm-card p-4"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {resolved
                      ? <CheckCircle2 size={15} style={{ color: '#22C55E' }} />
                      : <Clock size={15} style={{ color: '#F59E0B' }} />
                    }
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        color: resolved ? '#16A34A' : '#D97706',
                        background: resolved ? 'rgba(209,250,229,0.7)' : 'rgba(254,249,195,0.7)',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--adm-text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--adm-text)' }}>{item.message}</p>
                <div className="flex flex-wrap gap-4 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--adm-text-muted)' }}>
                  <span>Teacher: {item.teacherId?.name || 'Unknown'}</span>
                  <span>Student: {item.studentId?.name || 'Unknown'} ({item.studentId?.studentId})</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
