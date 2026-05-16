'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminInterventionsPage() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/interventions').then(({ data }) => setInterventions(data.interventions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>⚠️ Global Interventions</h1>
      <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>Monitor all faculty-student interventions</p>

      {interventions.length === 0 ? (
        <p className="text-center py-12 text-gray-500">No interventions recorded</p>
      ) : (
        <div className="space-y-3">
          {interventions.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.status === 'resolved' ? <CheckCircle2 size={16} className="text-green-500" /> : <Clock size={16} className="text-yellow-500" />}
                  <span className="text-xs font-bold uppercase" style={{ color: item.status === 'resolved' ? '#4CAF50' : '#FFC107' }}>{item.status}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--a-muted)' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--a-text)' }}>{item.message}</p>
              <div className="flex gap-4 text-xs" style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>Teacher: {item.teacherId?.name || 'Unknown'}</span>
                <span>Student: {item.studentId?.name || 'Unknown'} ({item.studentId?.studentId})</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
