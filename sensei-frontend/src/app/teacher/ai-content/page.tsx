'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, FileText, Brain, BookOpen, ClipboardList, 
  Loader2, Copy, Check 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyNote from '@/components/teacher/StickyNote';
import PaperSheet from '@/components/teacher/PaperSheet';

const contentTypes = [
  { id: 'notes', label: 'Lecture Notes', icon: FileText, desc: 'Structured notes', color: '#9333EA' },
  { id: 'quiz', label: 'Quiz / MCQs', icon: Brain, desc: 'Assessments', color: '#3B82F6' },
  { id: 'summary', label: 'Summary', icon: BookOpen, desc: 'Topic overview', color: '#10B981' },
  { id: 'assignment', label: 'Assignment', icon: ClipboardList, desc: 'Homework tasks', color: '#F59E0B' },
];

export default function ContentAIPage() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return toast.error('Enter a topic first');
    setLoading(true);
    setResult('');
    try {
      const { data } = await api.post('/api/teacher/content-ai/generate', { topic, type: contentType });
      setResult(data.content || data.notes || JSON.stringify(data, null, 2));
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedType = contentTypes.find((t) => t.id === contentType)!;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">AI Content Creator</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Draft teaching materials in seconds with Gemini</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {contentTypes.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setContentType(id)}
            className={`p-6 rounded-[28px] text-left transition-all relative border-2 ${
              contentType === id 
                ? 'bg-white border-purple-600 shadow-xl shadow-purple-100 scale-[1.02]' 
                : 'bg-white border-gray-50 hover:border-purple-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              contentType === id ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-400'
            }`}>
               <Icon size={24} />
            </div>
            <p className={`text-sm font-black uppercase tracking-widest ${
              contentType === id ? 'text-gray-800' : 'text-gray-400'
            }`}>{label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {}
         <div className="lg:col-span-5 space-y-8">
            <PaperSheet title="GENERATION PARAMETERS">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TOPIC OR SUBJECT</label>
                    <input 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generate()}
                      placeholder="e.g. Quantum Entanglement for beginners" 
                      className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-xl transition-all"
                    />
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                     <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles size={12} /> AI ASSISTANCE ACTIVE
                     </p>
                     <p className="text-xs font-bold text-purple-900/60 leading-relaxed">
                        Specify details like grade level, difficulty, or specific sub-topics for highly tailored results.
                     </p>
                  </div>

                  <button 
                    onClick={generate}
                    disabled={loading}
                    className="w-full py-4 bg-purple-600 text-white rounded-[20px] font-bold shadow-lg shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />}
                    {loading ? 'GENERATING DRAFT...' : 'GENERATE CONTENT'}
                  </button>
               </div>
            </PaperSheet>

            {!result && (
               <StickyNote color="#9333EA" className="!p-8 min-h-[200px]">
                  <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Pro-Tips for Faculty</h4>
                  <ul className="space-y-3">
                     {[
                       'Use "advanced" for higher-ed materials',
                       'Mention "Python" or "Java" for code samples',
                       'Ask for "creative examples" for younger students'
                     ].map((tip, i) => (
                       <li key={i} className="flex gap-3 text-white/80 text-sm font-bold">
                          <span className="text-white">•</span>
                          {tip}
                       </li>
                     ))}
                  </ul>
               </StickyNote>
            )}
         </div>

         {}
         <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
               {result ? (
                 <motion.div
                   key="result"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                 >
                    <PaperSheet title={selectedType.label.toUpperCase()} className="!p-0 overflow-hidden">
                       <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-purple-600 shadow-sm">
                                <selectedType.icon size={16} />
                             </div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GEMINI AI OUTPUT</span>
                          </div>
                          <button 
                            onClick={copyResult}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                          >
                             {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                             {copied ? 'COPIED' : 'COPY ALL'}
                          </button>
                       </div>
                       
                       <div className="p-8 max-h-[70vh] overflow-y-auto">
                          <div className="prose prose-purple max-w-none prose-sm">
                             <ReactMarkdown
                               components={{
                                 h1: ({ children }) => <h1 className="font-serif text-3xl font-black text-gray-800 mb-6">{children}</h1>,
                                 h2: ({ children }) => <h2 className="font-serif text-2xl font-bold text-gray-800 mb-4 mt-8">{children}</h2>,
                                 h3: ({ children }) => <h3 className="font-serif text-xl font-bold text-gray-800 mb-3 mt-6">{children}</h3>,
                                 p: ({ children }) => <p className="text-gray-600 leading-relaxed mb-4 text-base font-medium">{children}</p>,
                                 li: ({ children }) => <li className="text-gray-600 mb-2 font-medium">{children}</li>,
                                 code: ({ children }) => (
                                   <code className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold text-xs">
                                      {children}
                                   </code>
                                 ),
                                 strong: ({ children }) => <strong className="text-gray-900 font-black">{children}</strong>,
                                 blockquote: ({ children }) => (
                                   <blockquote className="border-l-4 border-purple-200 pl-6 italic text-gray-500 my-8">
                                      {children}
                                   </blockquote>
                                 ),
                               }}
                             >
                               {result}
                             </ReactMarkdown>
                          </div>
                       </div>
                    </PaperSheet>
                 </motion.div>
               ) : (
                 <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-100 rounded-[40px] bg-white"
                 >
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                       <Brain size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300">Ready to Draft</h3>
                    <p className="text-gray-400 max-w-xs mt-2 text-sm font-medium">Enter a topic on the left to begin generating professional teaching materials.</p>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
