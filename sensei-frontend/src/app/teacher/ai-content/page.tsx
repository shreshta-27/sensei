'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, FileText, Brain, BookOpen, ClipboardList, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/axios';
import PageTransition from '@/components/teacher/PageTransition';
import GlowCard from '@/components/teacher/GlowCard';

const contentTypes = [
  { id: 'notes', label: 'Lecture Notes', icon: FileText, desc: 'Structured notes for a topic', color: '#FF6B35' },
  { id: 'quiz', label: 'Quiz / MCQs', icon: Brain, desc: 'Multiple choice questions', color: '#8B5CF6' },
  { id: 'summary', label: 'Summary', icon: BookOpen, desc: 'Concise topic overview', color: '#14B8A6' },
  { id: 'assignment', label: 'Assignment', icon: ClipboardList, desc: 'Homework task template', color: '#F59E0B' },
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
    <PageTransition>
      <div className="space-y-6">
        {}
        <div>
          <h1 className="font-faculty-heading text-2xl md:text-3xl font-bold text-faculty-text">
            <Sparkles size={28} className="inline mr-2 text-faculty-ember" />
            AI Content Generator
          </h1>
          <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Generate teaching materials instantly with Gemini AI</p>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {contentTypes.map(({ id, label, icon: Icon, desc, color }) => (
            <motion.button
              key={id}
              onClick={() => setContentType(id)}
              whileTap={{ scale: 0.97 }}
              className={`faculty-card p-4 text-left group transition-all ${contentType === id ? 'border-opacity-100' : ''}`}
              style={{
                borderColor: contentType === id ? color : undefined,
                background: contentType === id ? color + '08' : undefined,
              }}
            >
              <Icon
                size={22}
                className="mb-2 transition-transform group-hover:scale-110"
                style={{ color: contentType === id ? color : 'var(--f-text-secondary)' }}
              />
              <p className="font-faculty-heading text-xs sm:text-sm font-semibold" style={{ color: contentType === id ? color : 'var(--f-text)' }}>{label}</p>
              <p className="font-faculty text-[10px] sm:text-xs text-faculty-text-secondary mt-0.5 hidden sm:block">{desc}</p>
            </motion.button>
          ))}
        </div>

        {}
        <GlowCard className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <selectedType.icon size={18} style={{ color: selectedType.color }} />
            <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">{selectedType.label}</h3>
          </div>

          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder={`Enter topic for ${selectedType.label.toLowerCase()} (e.g., Binary Trees, Newton's Laws...)`}
            className="faculty-input w-full"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="faculty-btn w-full flex items-center justify-center gap-3 py-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            {loading ? 'Generating...' : `Generate ${selectedType.label}`}
          </button>
        </GlowCard>

        {}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="faculty-card overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-faculty-border">
                <div className="flex items-center gap-2">
                  <selectedType.icon size={18} style={{ color: selectedType.color }} />
                  <p className="font-faculty-heading text-sm font-semibold" style={{ color: selectedType.color }}>Generated {selectedType.label}</p>
                </div>
                <button
                  onClick={copyResult}
                  className="faculty-btn-ghost flex items-center gap-2 px-3 py-1.5 text-xs"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div
                className="p-5 md:p-6 prose prose-invert prose-sm max-w-none overflow-auto faculty-scrollbar"
                style={{ maxHeight: '60vh' }}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="font-faculty-heading text-xl font-bold text-faculty-text mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="font-faculty-heading text-lg font-semibold text-faculty-text mb-2 mt-5">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-faculty-heading text-base font-semibold text-faculty-text mb-2 mt-4">{children}</h3>,
                    p: ({ children }) => <p className="font-faculty text-sm text-faculty-text-secondary leading-relaxed mb-3">{children}</p>,
                    li: ({ children }) => <li className="font-faculty text-sm text-faculty-text-secondary mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="px-1.5 py-0.5 rounded text-xs bg-faculty-bg/80 text-faculty-ember font-mono">
                        {children}
                      </code>
                    ),
                    strong: ({ children }) => <strong className="text-faculty-ember font-semibold">{children}</strong>,
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        {!result && (
          <GlowCard className="p-5" glowColor="purple">
            <p className="font-faculty-heading text-sm font-semibold text-faculty-text-secondary mb-3">💡 Tips for better results</p>
            <ul className="space-y-2">
              {[
                'Be specific: "Binary Search Trees in C++" > "Data Structures"',
                'Mention difficulty level: "Introductory", "Advanced"',
                'Add context: "for 2nd year engineering students"',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 font-faculty text-xs text-faculty-text-secondary">
                  <span className="text-faculty-ember">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </GlowCard>
        )}
      </div>
    </PageTransition>
  );
}
