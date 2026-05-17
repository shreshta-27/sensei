'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plus, BookOpen, FileText, BarChart3, ArrowRight, Download, Edit, ChevronRight, Wand2, CheckCircle, Copy, FileJson, ScrollText, Sparkles
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import NotebookInput from '@/components/faculty/NotebookInput';

type TabKey = 'quiz' | 'study' | 'rubric';

export default function AIContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('quiz');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<any>(null);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'quiz',   label: 'Quiz Builder',   icon: <FileJson size={16} /> },
    { key: 'study',  label: 'Study Material', icon: <ScrollText size={16} /> },
    { key: 'rubric', label: 'Rubric Creator', icon: <Wand2 size={16} /> },
  ];

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post('/api/teacher/content-ai/generate', { type: activeTab });
      toast.success('Content generated!');
      setOutput({
        quiz: {
          title: 'Binary Trees Quiz',
          questions: [
            { q: 'What is the time complexity of BST search?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 1 },
            { q: 'Which traversal visits root first?',       options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'], answer: 1 },
            { q: 'A complete binary tree has how many leaves?', options: ['⌊n/2⌋', '⌈n/2⌉', '(n-1)/2', 'All of these'], answer: 1 },
          ],
        },
        study: {
          title: 'Binary Trees — Study Notes',
          sections: ['Tree Definitions & Properties', 'Traversal Methods (In/Pre/Post/Level)', 'BST Invariants & Operations', 'Balanced Trees: AVL Overview'],
        },
        rubric: {
          title: 'Project Rubric: Fullstack Assignment',
          criteria: ['Code Quality (30%)', 'Functionality (30%)', 'UI/UX (20%)', 'Documentation (20%)'],
        },
      }[activeTab]);
    } catch { toast.error('Generation failed'); } finally { setGenerating(false); }
  };

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl text-[var(--text-primary)] flex items-center gap-3">
          <Sparkles size={32} className="text-[var(--accent-purple)]" /> AI Content Generator
        </h1>
        <p className="font-handwrite text-xl text-[var(--text-muted)]">Powered by Gemini AI — build quizzes, notes, and rubrics in seconds</p>
      </motion.div>

      {/* Sticky-tab row */}
      <div className="flex gap-3 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setOutput(null); }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui font-bold border-2 transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] shadow-[2px_2px_0_var(--accent-purple)]'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)] shadow-[2px_2px_0_#D6D0C8] hover:-translate-y-0.5'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'quiz' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="yellow" pinned className="!p-6 space-y-4">
            <h3 className="font-display text-2xl">📝 Create AI Quiz</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Topic </label>
                <input placeholder="e.g. Binary Trees"
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Class </label>
                <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
                  <option value="">Select class…</option>
                  <option>Fullstack - Sec B</option>
                  <option>DBMS - Sec A</option>
                </select>
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Grade Level </label>
                <div className="flex gap-2">
                  {['1st Year', '2nd', '3rd', '4th'].map(y => (
                    <button key={y} className="px-3 py-1.5 rounded-xl font-ui text-[11px] font-bold border-2 bg-white text-[var(--text-secondary)] border-[var(--border-card)]">{y}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Difficulty </label>
                <div className="flex gap-2">
                  {['Easy','Mixed','Hard'].map(d => (
                    <button key={d} className="px-3 py-1.5 rounded-xl font-ui text-[11px] font-bold border-2 bg-white text-[var(--text-secondary)] border-[var(--border-card)]">{d}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-2"> Question Count </label>
              <div className="flex items-center gap-3">
                <span className="font-ui text-xs font-bold">←</span>
                <input type="range" min={3} max={25} defaultValue={10} className="flex-1 accent-[var(--accent-purple)]" />
                <span className="font-display text-lg min-w-[2rem]">10</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-ui text-sm text-[var(--text-secondary)]">Types:</span>
              {['MCQ','T/F','Scenario'].map(t => (
                <label key={t} className="flex items-center gap-1.5 font-ui text-xs">
                  <input type="checkbox" defaultChecked className="accent-[var(--accent-purple)]" /> {t}
                </label>
              ))}
              <label className="flex items-center gap-1.5 font-ui text-xs ml-2">
                <input type="checkbox" /> Assign to class
              </label>
            </div>

            <ComicButton variant="primary" onClick={generate} loading={generating} className="gap-2">
              <Wand2 size={18} /> Generate Quiz
            </ComicButton>
          </StickyCard>

          {/* Output */}
          <AnimatePresence>
            {output && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <h3 className="font-display text-2xl">Preview: {output.title}</h3>
                {output.questions?.map((q: any, qi: number) => (
                  <StickyCard key={qi} color={['yellow','blue','green','pink','purple','orange'][qi % 6] as any} className="!p-5">
                    <p className="font-ui text-[var(--text-primary)]"><span className="font-display mr-2">{qi + 1}.</span> {q.q}</p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((o: string, oi: number) => (
                        <div key={o} className={`flex items-center gap-2 p-2 rounded-xl border ${oi === q.answer ? 'bg-green-50 border-green-300' : 'bg-gray-50/60 border-[var(--border-card)]'}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-ui text-xs font-bold border ${oi === q.answer ? 'bg-green-500 text-white border-green-500' : 'border-[var(--border-card)]'}`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="font-ui text-sm">{o}</span>
                          {oi === q.answer && <CheckCircle size={16} className="ml-auto text-green-600" />}
                        </div>
                      ))}
                    </div>
                  </StickyCard>
                ))}
                <div className="flex gap-3">
                  <ComicButton variant="primary" icon={<CheckCircle size={16} />}>Assign to Class</ComicButton>
                  <ComicButton variant="secondary" icon={<Download size={16} />}>Download PDF</ComicButton>
                  <ComicButton variant="ghost" icon={<Edit size={14} />}>Edit</ComicButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {activeTab === 'study' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="blue" pinned className="!p-6 space-y-4">
            <h3 className="font-display text-2xl">📚 Create Study Material</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Topic </label>
                <input placeholder="e.g. Object-Oriented Programming Fundamentals"
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div><label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Class </label>
                <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none"><option>Fullstack - Sec B</option></select>
              </div>
              <div><label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Format </label>
                <div className="flex gap-2">
                  {['Notes','Summary','Worksheet','Flashcards'].map(f => <button key={f} className="px-3 py-1.5 rounded-xl font-ui text-[11px] font-bold border-2 bg-white text-[var(--text-secondary)] border-[var(--border-card)]">{f}</button>)}
                </div>
              </div>
            </div>
            <ComicButton variant="primary" onClick={generate} loading={generating} icon={<Wand2 size={18} />}>Generate Content</ComicButton>
          </StickyCard>
          {output && (
            <StickyCard color="blue"><h3 className="font-display text-xl mb-4">📖 {output.title}</h3>
              <ul className="space-y-2 mb-4">
                {output.sections?.map((s: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 font-body text-base text-[var(--text-secondary)]">
                    <ChevronRight size={16} className="text-[var(--accent-purple)]" /> {s}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <ComicButton variant="secondary" icon={<Copy size={16} />}>Copy</ComicButton>
                <ComicButton variant="secondary" icon={<Download size={16} />}>Download PDF</ComicButton>
              </div>
            </StickyCard>
          )}
        </motion.div>
      )}

      {activeTab === 'rubric' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <StickyCard color="green" pinned className="!p-6 space-y-4">
            <h3 className="font-display text-2xl">📋 Rubric Creator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Assignment Topic </label>
                <input placeholder="e.g. Fullstack Web App Final Project"
                  className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Max Score </label>
                <input type="number" defaultValue={100} className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
              </div>
              <div>
                <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1"> Class </label>
                <select className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none"><option>Fullstack - Sec B</option></select>
              </div>
            </div>
            <ComicButton variant="primary" onClick={generate} loading={generating} icon={<Wand2 size={18} />}>Generate Rubric</ComicButton>
          </StickyCard>
          {output && (
            <StickyCard color="green">
              <h3 className="font-display text-xl mb-4">{output.title}</h3>
              <div className="space-y-3">
                {output.criteria?.map((c: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-[var(--border-card)]">
                    <span className="font-display text-lg text-[var(--accent-purple)]">{i + 1}</span>
                    <span className="font-ui text-sm font-bold text-[var(--text-primary)] flex-1">{c}</span>
                    <Badge4 label="AI Suggested" />
                  </div>
                ))}
              </div>
            </StickyCard>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Badge4({ label, color }: { label: string; color?: string }) {
  return (
    <span className={`font-ui text-[10px] font-bold px-2 py-0.5 rounded-full ${color ?? 'bg-green-50 text-green-600'}`}>
      {label}
    </span>
  );
}
