'use client';

import { FileText, Download } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>📄 Executive Reports</h1>
      <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>Download comprehensive university reports</p>
      
      <div className="p-6 rounded-xl border flex justify-between items-center" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
        <div className="flex items-center gap-3">
          <FileText size={24} style={{ color: 'var(--a-accent)' }} />
          <div>
            <h3 className="font-bold" style={{ color: 'var(--a-text)', fontFamily: 'var(--font-display)' }}>Monthly University Overview</h3>
            <p className="text-xs" style={{ color: 'var(--a-muted)' }}>PDF • Student performance, risks, and faculty stats</p>
          </div>
        </div>
        <button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"><Download size={16} /></button>
      </div>
    </div>
  );
}
