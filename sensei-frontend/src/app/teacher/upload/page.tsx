'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, FileText, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import StickyNote from '@/components/teacher/StickyNote';
import PaperSheet from '@/components/teacher/PaperSheet';

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
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">Bulk Data Import</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Upload student records via CSV for instant processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {}
         <div className="lg:col-span-4 space-y-8">
            <PaperSheet title="IMPORT CONFIG">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TARGET CLASS</label>
                    <select 
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none font-bold text-gray-700 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a Class...</option>
                      {classList.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText size={12} /> FORMAT REQUIREMENTS
                     </p>
                     <p className="text-xs font-bold text-blue-900/60 leading-relaxed">
                        Ensure your CSV contains: studentId, subject, ut1, midSem, ut2, endSem, attended, totalClasses.
                     </p>
                  </div>
               </div>
            </PaperSheet>

            <StickyNote color="blue" className="!p-8">
               <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Internal Memo</h4>
               <p className="text-white/80 text-sm font-bold leading-relaxed">
                  "Uploading bulk data automatically triggers the AI behavioral analysis pipeline for the selected class."
               </p>
            </StickyNote>
         </div>

         {}
         <div className="lg:col-span-8 space-y-8">
            <PaperSheet title="UPLOAD DESK" className="!p-0 overflow-hidden">
               <div
                 className={`p-12 text-center transition-all cursor-pointer border-b-2 border-dashed border-gray-100 ${
                   dragging ? 'bg-purple-50' : 'bg-white'
                 }`}
                 onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                 onDragLeave={() => setDragging(false)}
                 onDrop={(e) => {
                   e.preventDefault();
                   setDragging(false);
                   handleFile(e.dataTransfer.files?.[0] || null);
                 }}
                 onClick={() => inputRef.current?.click()}
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
                     <motion.div key="file" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
                        <div className="w-20 h-20 bg-green-50 rounded-[32px] flex items-center justify-center text-green-500 mx-auto border-2 border-green-100 shadow-sm">
                           <FileText size={40} />
                        </div>
                        <div>
                           <p className="text-xl font-black text-gray-800">{file.name}</p>
                           <p className="text-sm font-bold text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB · READY FOR PROCESSING</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-500"
                        >
                           REMOVE FILE
                        </button>
                     </motion.div>
                   ) : (
                     <motion.div key="empty" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4 py-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mx-auto border-2 border-gray-100 border-dashed">
                           <Upload size={40} />
                        </div>
                        <div>
                           <p className="text-2xl font-black text-gray-300">Drop Records Here</p>
                           <p className="handwriting text-xl text-gray-400 mt-2">or click to browse your local files</p>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <div className="p-8 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 rounded-full ${file ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {file ? 'FILE VALIDATED' : 'WAITING FOR INPUT'}
                     </span>
                  </div>
                  <button 
                    onClick={handleUpload}
                    disabled={uploading || !file || !classId}
                    className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center gap-3"
                  >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    {uploading ? 'PROCESSING...' : 'PROCESS RECORDS'}
                  </button>
               </div>
            </PaperSheet>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                   <PaperSheet title="PROCESSING REPORT">
                      <div className="grid grid-cols-2 gap-8">
                         <div className="p-8 bg-green-50 rounded-[32px] border border-green-100 text-center">
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">SUCCESSFUL</span>
                            <p className="text-5xl font-black text-green-700 mt-2">{(result.processed as number) || 0}</p>
                         </div>
                         <div className="p-8 bg-red-50 rounded-[32px] border border-red-100 text-center">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">ERRORS</span>
                            <p className="text-5xl font-black text-red-700 mt-2">{(result.errors as number) || 0}</p>
                         </div>
                      </div>
                   </PaperSheet>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
