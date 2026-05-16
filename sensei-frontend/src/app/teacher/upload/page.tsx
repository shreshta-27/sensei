'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, FileText, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import PageTransition from '@/components/teacher/PageTransition';
import GlowCard from '@/components/teacher/GlowCard';

export default function TeacherUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [dragging, setDragging] = useState(false);
  const [classId, setClassId] = useState('');
  const [classList, setClassList] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/api/teacher/classes')
      .then(({ data }) => setClassList(data.classes || data || []))
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) return toast.error('Only CSV files are accepted');
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Select a CSV file first');
    if (!classId) return toast.error('Select a class first');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);
      formData.append('classId', classId);
      const { data } = await api.post('/api/teacher/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success('CSV processing pipeline started!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {}
        <div>
          <h1 className="font-faculty-heading text-2xl md:text-3xl font-bold text-faculty-text">Upload Student Data</h1>
          <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Import marks and attendance via CSV</p>
        </div>

        {}
        <GlowCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">Target Class</h3>
            <p className="font-faculty text-[10px] text-faculty-text-secondary mt-0.5">Select which class this data belongs to</p>
          </div>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="faculty-input text-xs min-w-[200px]"
          >
            <option value="">Select a Class</option>
            {classList.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.semester} sem)</option>
            ))}
          </select>
        </GlowCard>

        {}
        <div
          className={`relative rounded-xl border-2 border-dashed p-10 md:p-16 text-center transition-all cursor-pointer ${
            dragging ? 'border-[var(--f-ember)]' : file ? 'border-emerald-500/40' : 'border-faculty-border'
          }`}
          style={{
            background: dragging ? 'rgba(255,107,53,0.04)' : file ? 'rgba(16,185,129,0.04)' : 'var(--f-surface)',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <FileText size={32} className="text-emerald-400" />
                </div>
                <p className="font-faculty-heading text-base font-semibold text-emerald-400">{file.name}</p>
                <p className="font-faculty-data text-xs text-faculty-text-secondary">
                  {(file.size / 1024).toFixed(1)} KB · CSV
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full faculty-card text-faculty-text-secondary hover:text-faculty-text transition-all"
                >
                  <X size={12} /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-faculty-bg/80 flex items-center justify-center border border-faculty-border/50">
                  <Upload size={32} className="text-faculty-text-secondary" />
                </div>
                <p className="font-faculty-heading text-lg font-semibold text-faculty-text">Drop your CSV here</p>
                <p className="font-faculty text-sm text-faculty-text-secondary">or click to browse files</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {}
        {file && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="faculty-btn w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploading ? 'Processing...' : 'Upload & Process'}
            </button>
          </motion.div>
        )}

        {}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="faculty-card p-6 border-emerald-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                <h3 className="font-faculty-heading text-base font-semibold text-emerald-400">Processing Complete</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="faculty-card p-4 text-center border-emerald-500/20">
                  <p className="font-faculty-data text-3xl font-bold text-emerald-400">{(result.processed as number) || 0}</p>
                  <p className="font-faculty text-[10px] uppercase tracking-wider text-faculty-text-secondary mt-1">Rows Processed</p>
                </div>
                <div className="faculty-card p-4 text-center border-red-500/20">
                  <p className="font-faculty-data text-3xl font-bold text-red-400">{(result.errors as number) || 0}</p>
                  <p className="font-faculty text-[10px] uppercase tracking-wider text-faculty-text-secondary mt-1">Errors</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <GlowCard className="p-5">
          <p className="font-faculty-heading text-sm font-semibold text-faculty-text mb-3">📋 Required CSV Format</p>
          <code className="block text-xs p-3 rounded-lg whitespace-nowrap overflow-x-auto bg-faculty-bg/80 text-faculty-text-secondary font-mono border border-faculty-border/50">
            studentId, subject, ut1, midSem, ut2, endSem, attended, totalClasses
          </code>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ['studentId', 'Unique student ID from the system'],
              ['subject', 'Subject name or code'],
              ['ut1 / ut2', 'Unit test 1 & 2 marks'],
              ['midSem / endSem', 'Mid & end semester marks'],
              ['attended', 'Classes attended count'],
              ['totalClasses', 'Total classes held'],
            ].map(([field, desc]) => (
              <div key={field} className="flex gap-2 font-faculty text-xs">
                <span className="font-faculty-data text-faculty-ember shrink-0">{field}</span>
                <span className="text-faculty-text-secondary">— {desc}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>
    </PageTransition>
  );
}
