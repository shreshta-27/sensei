'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Sparkles, MessageCircle, AlertTriangle, ArrowLeft, MoreHorizontal, Check, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';

type Student = {
  _id: string;
  id?: string;
  name: string;
  department: string;
  cgpa: number;
  attendance: number;
  riskLevel: string;
  email?: string;
};

type ChatMessage = {
  id: string;
  sender: 'teacher' | 'student';
  text: string;
  time: string;
};

const QUICK_REPLIES = [
  "Keep up the great work! 🌟",
  "Please submit your pending assignments by tonight.",
  "Let's schedule a brief 1:1 meeting to clear your doubts.",
  "Focus more on Data Structures this week. You can do it!",
];

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/api/teacher/students');
      const raw = data.students || data || [];
      const mapped: Student[] = raw.map((s: any) => ({
        _id: s._id || s.id || '',
        name: s.name || 'Unknown',
        department: s.department || s.dept || 'General',
        cgpa: s.cgpa || 0,
        attendance: s.attendance || 0,
        riskLevel: s.riskLevel || 'low',
        email: s.email,
      }));
      setStudents(mapped);

      // Select default target student
      if (mapped.length > 0) {
        const found = mapped.find(s => s._id === targetStudentId);
        setSelectedStudent(found || mapped[0]);
      }
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchInterventionsForStudent(selectedStudent._id);
    }
  }, [selectedStudent]);

  const fetchInterventionsForStudent = async (studentId: string) => {
    try {
      const { data } = await api.get('/api/teacher/interventions');
      const list = data.interventions || data || [];
      
      // Filter interventions specifically for this student
      const forStudent = list.filter((item: any) => 
        (item.studentId?._id || item.studentId || '') === studentId
      );

      // Build message bubbles
      const messages: ChatMessage[] = forStudent.map((item: any) => ({
        id: item._id,
        sender: 'teacher', // Interventions are created by teachers
        text: item.message,
        time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently',
      }));

      // Add default mock welcome message if none exist
      if (messages.length === 0 && selectedStudent) {
        messages.push({
          id: 'welcome',
          sender: 'student',
          text: `Hello Professor, I would love to get feedback on my latest academic performance.`,
          time: '09:00 AM',
        });
      }

      setChatHistory(prev => ({
        ...prev,
        [studentId]: messages
      }));
    } catch {
      // Fallback local messaging
      if (selectedStudent && !chatHistory[studentId]) {
        setChatHistory(prev => ({
          ...prev,
          [studentId]: [
            {
              id: 'welcome',
              sender: 'student',
              text: `Hello Professor, I would love to get feedback on my latest academic performance.`,
              time: '09:00 AM',
            }
          ]
        }));
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, selectedStudent]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedStudent) return;

    setSending(true);
    setInputText('');
    
    // Optimistic UI update
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'teacher',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedStudent._id]: [...(prev[selectedStudent._id] || []), newMsg]
    }));

    try {
      // Call actual backend intervention endpoint
      await api.post('/api/teacher/interventions', {
        studentId: selectedStudent._id,
        message: text
      });
      toast.success(`Message sent to ${selectedStudent.name}!`);
    } catch (err: any) {
      toast.error('Failed to register intervention on backend');
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = selectedStudent ? chatHistory[selectedStudent._id] || [] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="font-handwrite text-3xl text-[var(--text-muted)] animate-pulse">Opening messenger…</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* ── LEFT PANEL: STUDENTS DIRECTORY ── */}
      <div className="w-full md:w-80 flex flex-col bg-white border-4 border-black rounded-[var(--btn-radius)] shadow-[4px_4px_0_#000] overflow-hidden">
        <div className="p-4 border-b-4 border-black bg-[var(--sticky-yellow)]">
          <h2 className="font-display text-xl mb-3 flex items-center gap-2">
            <MessageCircle size={20} /> Supporting Chats
          </h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border-2 border-black font-ui text-xs outline-none focus:border-[var(--accent-purple)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y-2 divide-black p-2 space-y-1">
          {filteredStudents.map(s => {
            const isActive = selectedStudent?._id === s._id;
            return (
              <button
                key={s._id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left font-ui ${
                  isActive
                    ? 'bg-[var(--accent-purple)] text-white border-2 border-black shadow-[2px_2px_0_#000]'
                    : 'hover:bg-[var(--sticky-yellow)]/30 border-2 border-transparent'
                }`}
              >
                <TeacherAvatar name={s.name} size={38} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate">{s.name}</span>
                    <span className="text-[10px] opacity-75">CGPA {s.cgpa.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] uppercase font-bold truncate opacity-85`}>
                      {s.department}
                    </span>
                    <RiskBadge level={s.riskLevel === 'improving' ? 'low' : s.riskLevel as any} />
                  </div>
                </div>
              </button>
            );
          })}
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 font-handwrite text-base text-[var(--text-muted)]">
              No students found
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: ACTIVE CHAT SCREEN ── */}
      <div className="flex-1 flex flex-col bg-[#FAF6EE] border-4 border-black rounded-[var(--btn-radius)] shadow-[6px_6px_0_#000] overflow-hidden">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b-4 border-black bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TeacherAvatar name={selectedStudent.name} size={42} />
                <div>
                  <h3 className="font-ui font-bold text-[var(--text-primary)]">{selectedStudent.name}</h3>
                  <p className="font-ui text-xs text-[var(--text-secondary)]">
                    {selectedStudent.department} · Attendance {selectedStudent.attendance}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={selectedStudent.riskLevel === 'improving' ? 'low' : selectedStudent.riskLevel as any} />
                <ComicButton
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchInterventionsForStudent(selectedStudent._id)}
                  icon={<RefreshCw size={14} />}
                >
                  Sync
                </ComicButton>
              </div>
            </div>

            {/* Chat Bubble Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFAF2] pattern-doodle">
              {activeMessages.map(msg => {
                const isTeacher = msg.sender === 'teacher';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3.5 rounded-[var(--btn-radius)] border-2 border-black font-ui text-sm shadow-[2px_2px_0_#000] ${
                        isTeacher
                          ? 'bg-[var(--accent-purple)] text-white'
                          : 'bg-white text-[var(--text-primary)]'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[9px]">
                        <span>{msg.time}</span>
                        {isTeacher && <Check size={10} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggested Replies */}
            <div className="p-3 bg-white border-t-2 border-black flex flex-wrap gap-2 items-center">
              <span className="font-ui text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mr-1 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> AI Suggestions:
              </span>
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr}
                  onClick={() => handleSend(qr)}
                  className="px-3 py-1 rounded-xl border-2 border-black bg-[var(--sticky-yellow)] hover:bg-[var(--accent-purple)] hover:text-white transition-all text-xs font-bold font-ui shadow-[1px_1px_0_#000]"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 border-t-4 border-black bg-white flex items-center gap-3"
            >
              <input
                type="text"
                placeholder={`Type a supporting message or intervention to ${selectedStudent.name}...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-black rounded-xl font-ui text-sm outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
              />
              <ComicButton
                variant="primary"
                type="submit"
                disabled={sending || !inputText.trim()}
                icon={<Send size={16} />}
              >
                Send
              </ComicButton>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle size={48} className="text-[var(--text-muted)] mb-3 opacity-40 animate-bounce" />
            <h3 className="font-display text-xl mb-1 text-[var(--text-primary)]">Start Supporting</h3>
            <p className="font-body text-sm text-[var(--text-secondary)]">
              Select a student from the directory sidebar to send dynamic support messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <div className="font-handwrite text-3xl text-[var(--text-muted)] animate-pulse">Opening messenger…</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
