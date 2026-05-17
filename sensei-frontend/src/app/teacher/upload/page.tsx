'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Upload, FileText, X, CheckCircle, AlertTriangle, Zap,
  BrainCircuit, Sparkles, Send, Clock, ChevronRight
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import { useSocket } from '@/hooks/useSocket';

type PipeStage = {
  label: string;
  emoji: string;
  status: 'waiting' | 'running' | 'done';
  pct: number;
  count?: string;
};

const stages: PipeStage[] = [
  { label: 'Column Normaliser',   emoji: '📋', status: 'waiting', pct: 0   },
  { label: 'Performance Analyser',emoji: '📊', status: 'waiting', pct: 0   },
  { label: 'Risk Detector',       emoji: '⚠️', status: 'waiting', pct: 0   },
  { label: 'AI Insight Generator',emoji: '🤖', status: 'waiting', pct: 0   },
  { label: 'Auto Interventions',  emoji: '📧', status: 'waiting', pct: 0   },
  { label: 'Leaderboard Update',  emoji: '🏆', status: 'waiting', pct: 0   },
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile]       = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState('');
  const [pipe, setPipe]       = useState<PipeStage[]>(JSON.parse(JSON.stringify(stages)));
  const [done, setDone]       = useState(false);
  const [classId, setClassId] = useState('');
  const [dataType, setDataType] = useState<'marks'|'attendance'|'both'>('marks');
  const [classes, setClasses] = useState<any[]>([]);
  const { on, emit } = useSocket('/teacher');

  const latestStep = pipe.findIndex(s => s.status !== 'done');

  useEffect(() => {
    api.get('/api/teacher/classes')
      .then(r => setClasses((r.data as any).classes || r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!uploadId) return;
    const off1 = on('pipeline:progress', (d: any) => {
      if (d.uploadId !== uploadId) return;
      setPipe(prev => prev.map((s, i) =>
        i === d.step ? { ...s, status: d.status as any, pct: d.progress, count: d.count } : s
      ));
    });
    const off2 = on('pipeline:done', (d: any) => {
      if (d.uploadId !== uploadId) return;
      setDone(true);
      toast.success('✅ Analysis complete!');
    });
    return () => { off1(); off2(); };
  }, [uploadId, on]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };
  const handleDrag  = (e: React.DragEvent) => e.preventDefault();
  const handleFile  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) setFile(f); };

  const handleUpload = async () => {
    if (!file || !classId) { toast.error('Select a class and file first'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('csv', file);
    fd.append('classId', classId);
    fd.append('dataType', dataType);
    try {
      const { data } = await api.post('/api/teacher/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadId(data.uploadId);
      setPipe(JSON.parse(JSON.stringify(stages)));
      emit('pipeline:start', { uploadId: data.uploadId });
      toast.success('Upload started!');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-[var(--text-primary)]">Upload Marks</h1>
        <p className="font-handwrite text-xl text-[var(--text-muted)]">Bulk import student records with AI-powered analysis</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 font-ui text-xs font-bold text-[var(--text-muted)]">
        {['1. Upload', '2. AI Analysis', '3. Results'].map((s, i) => (
          <span key={s} className={`px-3 py-1.5 rounded-full border-2 ${!done && i === 2 ? 'text-[var(--text-muted)]' : done && i <= 2 ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : i === 0 || done ? 'bg-white text-[var(--accent-purple)] border-[var(--accent-purple)]' : 'bg-gray-100 border-gray-200'}`}>
            {s}
          </span>
        ))}
        <span className="ml-auto font-display text-base text-[var(--text-secondary)]">{done ? 'Complete' : 'In Progress'}</span>
      </div>

      {/* Step 1 — Upload */}
      <StickyCard color="yellow" className="!p-8 text-center border-dashed-4"
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <Upload size={52} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
            <h3 className="font-display text-2xl text-[var(--text-primary)] mb-1">Drop your CSV here 📎</h3>
            <p className="font-ui text-sm text-[var(--text-secondary)] mb-4">Accepts .csv, .xlsx · Max 5MB</p>
            <label className="cursor-pointer inline-block">
              <span className="font-ui text-sm font-bold text-[var(--accent-purple)] underline">Browse Files</span>
              <input type="file" accept=".csv,.xlsx" onChange={handleFile} className="hidden" />
            </label>
          </>
        ) : (
          <div className="flex items-center gap-4 justify-center">
            <FileText size={32} className="text-[var(--accent-purple)]" />
            <div className="text-left">
              <p className="font-ui text-sm font-bold text-[var(--text-primary)]">{file.name}</p>
              <p className="font-ui text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="w-8 h-8 rounded-full bg-white border border-[var(--border-card)] flex items-center justify-center font-ui text-xs text-red-400">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Class selector */}
        <div className="mt-5 flex flex-wrap gap-3 items-center justify-center">
          <select value={classId} onChange={e => setClassId(e.target.value)} className="bg-white border-2 border-[var(--border-doodle)] rounded-xl px-4 py-2 font-ui text-sm outline-none min-w-[200px]">
            <option value="">Select Class…</option>
            {classes.map((cls: any) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
          {(['marks','attendance','both'] as const).map(d => (
            <button key={d} onClick={() => setDataType(d)}
              className={`px-3 py-1.5 rounded-xl font-ui text-xs font-bold border-2 uppercase ${dataType === d ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'}`}>
              {d}
            </button>
          ))}
        </div>

        {file && classId && (
          <div className="mt-5">
            <ComicButton variant="primary" onClick={handleUpload} loading={uploading} icon={<Zap size={16} />}>
              Start Analysis → Analyze {file.name}
            </ComicButton>
          </div>
        )}
      </StickyCard>

      {/* Step 2 — Live Pipeline */}
      {uploading || pipe.some(s => s.status !== 'waiting') ? (
        <StickyCard color="yellow" className="!p-6 space-y-3">
          <h3 className="font-display text-xl mb-3 flex items-center gap-2">
            <BrainCircuit size={18} /> Live Pipeline
          </h3>
          {pipe.map((st, i) => (
            <motion.div key={st.label}
              animate={st.status === 'done' ? { scale: [1, 1.02, 1] } : {}}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                st.status === 'done'     ? 'bg-[var(--sticky-green)] border-green-400' :
                st.status === 'running'  ? 'bg-white border-amber-400 animate-pulse' :
                'bg-gray-50 border-[var(--border-card)] opacity-60'
              }`}
            >
              <span className="text-xl">{st.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-xs font-bold">{st.label}</p>
                {st.count && <p className="font-ui text-[11px] text-[var(--text-muted)]">{st.count}</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" animate={{ width: `${st.pct}%` }}
                    style={{ background: st.status === 'done' ? 'var(--accent-green)' : st.status === 'running' ? 'var(--accent-gold)' : '#E5E0D8' }} />
                </div>
                {st.status === 'done' && <CheckCircle size={16} className="text-green-600" />}
                {st.status === 'running' && (
                  <motion.div className="w-4 h-4 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </motion.div>
          ))}
        </StickyCard>
      ) : null}

      {/* Step 3 — Results */}
      {done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <StickyCard color="green" pinned>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={26} className="text-green-700" />
              <div>
                <p className="font-display text-2xl text-green-800">All Done!</p>
                <p className="font-handwrite text-lg text-green-700">145 students processed successfully</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[{ label: 'Critical', value: 3, color: 'text-red-600' as const, bg: 'bg-red-50' },
                { label: 'High', value: 12, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Medium', value: 24, color: 'text-yellow-700', bg: 'bg-yellow-50' },
                { label: 'Low', value: 106, color: 'text-green-700', bg: 'bg-green-50' },
              ].map(s => (
                <div key={s.label} className={`text-center rounded-xl p-3 ${s.bg}`}>
                  <p className={`font-display text-2xl ${s.color}`}>{s.value}</p>
                  <p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="font-ui text-xs text-green-700 font-bold mb-4">
              <Zap size={12} className="inline text-yellow-500" /> 3 students auto-flagged — interventions sent
            </p>
            <div className="flex gap-3 flex-wrap">
              <ComicButton variant="primary" onClick={() => router.push('/teacher/students?filter=at_risk')}>View At-Risk Students</ComicButton>
              <ComicButton variant="secondary">Download Report</ComicButton>
              <ComicButton variant="ghost" onClick={() => router.push('/teacher')}>Back to Dashboard</ComicButton>
            </div>
          </StickyCard>
        </motion.div>
      )}
    </div>
  );
}
