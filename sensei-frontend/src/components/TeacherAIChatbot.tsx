'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function TeacherAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hello Professor. I am your Faculty AI Assistant. How can I assist you with your classes today?', timestamp: new Date().toISOString() }]);

    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const playTTS = async (text: string) => {
    if (!isSpeaking) return;
    try {
      setPlayingAudio(true);
      const { data } = await api.post('/api/tts/generate', { text }, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(data);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setPlayingAudio(false);
      }
    } catch (err) {
      console.error('TTS Error:', err);
      setPlayingAudio(false);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chatbot/teacher/chat', { message: msg.content });
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
      
      if (isSpeaking) {
        await playTTS(data.reply);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong while connecting to the assistant.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" />
      
      {}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 p-4 rounded-full shadow-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition-colors ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Bot size={28} />
      </motion.button>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-[400px] h-[600px] max-h-[75vh] md:max-h-[80vh] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden flex-shrink-0"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {}
            <div className="bg-teal-900/50 p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400">
                  <Bot size={18} />
                </div>
                <h3 className="font-semibold text-lg text-white">Faculty Assistant</h3>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button onClick={() => setIsSpeaking(!isSpeaking)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors" title="Toggle AI Voice">
                  {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a] custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                    {m.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
               <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-sm flex gap-1.5">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              {playingAudio && <p className="text-xs text-teal-400 font-medium mb-2 animate-pulse flex items-center gap-2"><Volume2 size={12}/> Assistant is speaking...</p>}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-colors flex-shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'}`}
                  title="Voice Input (STT)"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask for insights, lesson ideas..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-teal-500 transition-colors placeholder:text-slate-500 text-sm"
                />
                <button 
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors flex-shrink-0"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
