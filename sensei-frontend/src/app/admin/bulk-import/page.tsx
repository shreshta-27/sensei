'use client';

import { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function AdminBulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Select a CSV file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);
      await api.post('/api/admin/bulk/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Users imported successfully!');
      setFile(null);
    } catch { toast.error('Import failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>📤 Bulk Import Users</h1>
      <p className="text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>Upload a CSV file to register multiple users at once.</p>

      <div className="p-8 rounded-xl border-2 border-dashed text-center" style={{ background: 'var(--a-card)', borderColor: 'var(--a-accent)' }}>
        <Upload size={48} className="mx-auto mb-4" style={{ color: 'var(--a-accent)' }} />
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="admin-csv" />
        <label htmlFor="admin-csv" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold cursor-pointer inline-block hover:bg-purple-700 transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
          {file ? file.name : 'Choose CSV File'}
        </label>
        {file && (
          <div className="mt-4">
            <button onClick={handleUpload} disabled={uploading} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
              {uploading ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
