'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AdminAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingVoiceSendRef = useRef(false);
  const isSpeakingRef = useRef(false);

  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hello Admin. I am your Executive AI Assistant. How can I help you manage the campus today?', timestamp: new Date().toISOString() }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chatbot/admin/chat', { message: msg.content });
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);

      if (isSpeakingRef.current) {
        playTTS(data.reply);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong while connecting to the assistant. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        pendingVoiceSendRef.current = true;
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    } else {
      setSttSupported(false);
    }
  }, []);

  useEffect(() => {
    if (pendingVoiceSendRef.current && input.trim() && !loading) {
      pendingVoiceSendRef.current = false;
      sendMessage(input);
    }
  }, [input, loading, sendMessage]);

  const toggleListening = () => {
    if (!sttSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('STT start error:', e);
        setIsListening(false);
      }
    }
  };

  const playBrowserTTS = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~|>\-\[\]()!]/g, '').replace(/\n+/g, '. ').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setPlayingAudio(true);
    utterance.onend = () => setPlayingAudio(false);
    utterance.onerror = () => setPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const playTTS = async (text: string) => {
    if (!isSpeakingRef.current) return;
    try {
      setPlayingAudio(true);
      const { data } = await api.post('/api/tts/generate', { text: text.slice(0, 500) }, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(data);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (err) {
      console.warn('ElevenLabs TTS failed, using browser TTS fallback');
      playBrowserTTS(text);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    await sendMessage(input);
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" />
      
      {}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 md:bottom-6 left-6 md:left-8 z-50 p-4 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'hidden' : 'flex'}`}
        style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', color: 'white' }}
      >
        <Bot size={28} />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-6 left-6 md:left-8 z-50 w-[calc(100vw-6rem)] md:w-[400px] h-[600px] max-h-[75vh] md:max-h-[80vh] border rounded-2xl shadow-2xl flex flex-col overflow-hidden flex-shrink-0"
            style={{ background: 'var(--adm-surface)', borderColor: 'rgba(124,58,237,0.15)', fontFamily: 'Inter, sans-serif' }}
          >
            {}
            <div className="p-4 border-b flex items-center justify-between" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', color: 'white' }}>
                  <Bot size={18} />
                </div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Admin Assistant</h3>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--adm-text-muted)' }}>
                <button onClick={() => setIsSpeaking(!isSpeaking)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors" title="Toggle AI Voice">
                  {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ background: 'var(--adm-bg)' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm border shadow-sm ${m.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                       style={{
                         background: m.role === 'user' ? 'linear-gradient(135deg, var(--adm-accent), #A78BFA)' : 'var(--adm-surface)',
                         color: m.role === 'user' ? 'white' : 'var(--adm-text)',
                         borderColor: m.role === 'user' ? 'transparent' : 'rgba(124,58,237,0.15)'
                       }}>
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:text-[var(--adm-text)] prose-headings:text-[var(--adm-text)]">
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
                  <div className="p-4 rounded-2xl rounded-tl-sm flex gap-1.5 border shadow-sm" style={{ background: 'var(--adm-surface)', borderColor: 'rgba(124,58,237,0.1)' }}>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--adm-text-muted)' }} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--adm-text-muted)' }} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--adm-text-muted)' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-4 border-t" style={{ background: 'var(--adm-surface)', borderColor: 'rgba(124,58,237,0.1)' }}>
              {playingAudio && <p className="text-xs font-semibold mb-2 animate-pulse flex items-center gap-2" style={{ color: 'var(--adm-accent)' }}><Volume2 size={12}/> Assistant is speaking...</p>}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-colors flex-shrink-0 ${isListening ? 'animate-pulse' : ''}`}
                  style={{
                    background: isListening ? '#FEF2F2' : 'rgba(124,58,237,0.06)',
                    color: isListening ? '#EF4444' : 'var(--adm-text-sub)',
                    border: `1px solid ${isListening ? '#FCA5A5' : 'transparent'}`
                  }}
                  title="Voice Input (STT)"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask for system insights, stats..."
                  className="flex-1 px-4 py-3 rounded-xl outline-none transition-colors text-sm"
                  style={{
                    background: 'var(--adm-bg)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    color: 'var(--adm-text)',
                  }}
                />
                <button 
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="p-3 rounded-xl disabled:opacity-50 transition-colors flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', color: 'white' }}
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
