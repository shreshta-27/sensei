'use client';

import { useEffect, useState } from 'react';
import { Activity, Database, Server } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminSystemPage() {
  const [status, setStatus] = useState<any>(null);
  useEffect(() => { api.get('/api/admin/system').then(({ data }) => setStatus(data)).catch(() => {}); }, []);
  if (!status) return <div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>⚙️ System Status</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
          <Database className="mb-2" style={{ color: status.db === 'connected' ? '#4CAF50' : '#F44336' }} />
          <p className="text-xs" style={{ color: 'var(--a-muted)' }}>Database</p>
          <p className="text-xl font-bold capitalize" style={{ color: 'var(--a-text)' }}>{status.db}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
          <Activity className="mb-2 text-blue-500" />
          <p className="text-xs" style={{ color: 'var(--a-muted)' }}>Uptime</p>
          <p className="text-xl font-bold" style={{ color: 'var(--a-text)' }}>{Math.floor(status.uptime / 60)} mins</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
          <Server className="mb-2 text-yellow-500" />
          <p className="text-xs" style={{ color: 'var(--a-muted)' }}>Memory (Heap Used)</p>
          <p className="text-xl font-bold" style={{ color: 'var(--a-text)' }}>{Math.round(status.memory?.heapUsed / 1024 / 1024 || 0)} MB</p>
        </div>
      </div>
    </div>
  );
}
