'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function AdminBulkImportPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]           = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Select a CSV file first');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);
      await api.post('/api/admin/bulk/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Users imported successfully!');
      setDone(true);
      setFile(null);
    } catch {
      toast.error('Import failed – check CSV format');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Upload size={24} style={{ color: 'var(--adm-accent)' }} />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Bulk Import
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Upload a CSV file to register multiple users at once.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="adm-card p-5 mb-2" style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}>
          <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>CSV Format Requirements</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--adm-text-sub)' }}>
            Your CSV file must include the following headers in the first row. The system will map columns based on exact header names.
          </p>
          <div className="flex flex-wrap gap-2">
            {['name', 'email', 'password', 'role (student/teacher/admin)', 'department (optional)'].map(col => (
              <span key={col} className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--adm-surface)', color: 'var(--adm-accent)', border: '1px solid rgba(124,58,237,0.1)' }}>
                {col}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="adm-card p-10 text-center"
        style={{ border: `2px dashed rgba(124,58,237,0.25)` }}
      >
        {done ? (
          <div className="space-y-3">
            <CheckCircle size={56} className="mx-auto" style={{ color: '#22C55E' }} />
            <p className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Import Successful!</p>
            <button onClick={() => setDone(false)} className="text-sm font-semibold" style={{ color: 'var(--adm-accent)' }}>Import another file</button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--adm-accent)' }}>
              <FileSpreadsheet size={32} />
            </div>
            <p className="text-base font-bold mb-2" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {file ? file.name : 'Drop your CSV file here'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--adm-text-muted)' }}>or click to browse</p>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="admin-csv" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label
                htmlFor="admin-csv"
                className="px-6 py-3 rounded-xl font-bold text-sm cursor-pointer inline-block transition-all"
                style={{ background: 'var(--adm-accent-light)', color: 'var(--adm-accent)', border: '1.5px solid rgba(124,58,237,0.2)' }}
              >
                {file ? 'Change File' : 'Choose CSV File'}
              </label>
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
                >
                  {uploading ? 'Importing…' : 'Start Import'}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
