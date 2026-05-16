'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Home, Brain, BookOpen, MessageCircle, FileText, AlertTriangle,
  Trophy, HelpCircle, Hand, User, Bell, LogOut, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, ArrowLeft
} from 'lucide-react';

const AIChatbot = dynamic(() => import('@/components/AIChatbot'), { ssr: false });
const NotificationPanel = dynamic(() => import('@/components/NotificationPanel'), { ssr: false });

const navItems = [
  { href: '/student', label: 'Dashboard', emoji: '🏠' },
  { href: '/student/ai-avatar', label: '3D Mentor', emoji: '🤖' },
  { href: '/student/virtual-beyond', label: 'Virtual Beyond', emoji: '🌌' },
  { href: '/student/ultra-study', label: 'Ultra Study', emoji: '🧠' },
  { href: '/student/overcome', label: 'Overcome', emoji: '📈' },
  { href: '/student/focus-guardian', label: 'Focus Guard', emoji: '🎯' },
  { href: '/student/career-simulator', label: 'Career Sim', emoji: '🚀' },
  { href: '/student/sign-language', label: 'Gesture Lab', emoji: '🤚' },
  { href: '/student/social', label: 'Social Hub', emoji: '🤝' },
  { href: '/student/profile', label: 'Profile', emoji: '👤' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [hoverState, setHoverState] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current && scrollRef.current.scrollLeft > 20) {
      setShowScrollHint(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login');
    }
  }, [user, router]);

  const isWorldRoom = pathname.startsWith('/student/world/');
  const isInterviewSession = /^\/student\/interview\/iv_/.test(pathname);
  const isStudentRoot = pathname === '/student';

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={`flex flex-col min-h-screen relative ${isInterviewSession ? '' : 'pb-36 md:pb-44'} w-full overflow-x-hidden`} style={{ background: isInterviewSession ? '#0d1b2a' : 'var(--comic-yellow)' }}>
      {}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px, 30px 30px', backgroundPosition: '0 0, 15px 15px' }} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto relative z-10">
        {}
        {!isWorldRoom && !isInterviewSession && (
          <header className="sticky top-0 z-40 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between bg-white/95 backdrop-blur-sm max-w-full"
            style={{ borderBottom: '4px solid var(--comic-black)', boxShadow: '0 6px 0 var(--comic-black)' }}>
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              {}
              <div className="relative flex-shrink-0 pt-2 hidden sm:block">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white brutalist-border rounded-2xl md:rounded-3xl overflow-hidden hard-shadow-lg -rotate-[6deg] hover:rotate-0 transition-transform cursor-pointer">
                  <img src={`https://i.pravatar.cc/100?u=${encodeURIComponent(user.name || 'user')}`} alt={user.name} className="w-full h-full object-cover" />
                </div>
                {}
                <div className="absolute -top-12 left-16 hidden lg:block z-20" style={{ background: 'white', border: '3px solid var(--comic-black)', borderRadius: 16, padding: '6px 14px', boxShadow: '4px 4px 0 var(--comic-black)', whiteSpace: 'nowrap', animation: 'float-slow 4s ease-in-out infinite' }}>
                  <p className="font-fredoka font-bold text-sm" style={{ color: 'var(--comic-black)' }}>Hey {user.name?.split(' ')[0]}, ready to level up? 💥</p>
                  <div style={{ position: 'absolute', bottom: -14, left: 20, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '14px solid var(--comic-black)' }} />
                  <div style={{ position: 'absolute', bottom: -10, left: 23, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '11px solid white', zIndex: 1 }} />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="font-fredoka text-2xl md:text-4xl font-bold tracking-tight truncate" style={{ color: 'var(--comic-black)' }}>
                  DASHBOARD
                </h2>
                <div className="flex items-center gap-2 md:gap-4 mt-1 flex-wrap">
                  <span className="font-fredoka font-bold text-[10px] md:text-xs bg-white px-2 md:px-4 py-1 brutalist-border rounded-lg md:rounded-xl -rotate-1 hard-shadow" style={{ color: 'var(--comic-black)', whiteSpace: 'nowrap' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                  </span>
                  <span className="font-fredoka font-bold text-[10px] md:text-xs text-gray-500 italic uppercase tracking-wide hidden sm:inline truncate">
                    TIME TO CRUSH IT!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
              <NotificationPanel />
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 brutalist-border rounded-xl flex items-center justify-center text-lg md:text-xl font-black hard-shadow" style={{ fontFamily: "'Fredoka', sans-serif", color: 'var(--comic-black)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
        )}

        {}
        {!isWorldRoom && !isInterviewSession && !isStudentRoot && (
          <div className="px-4 md:px-8 pt-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white brutalist-border rounded-xl hard-shadow font-fredoka font-bold text-sm uppercase tracking-wide hover:-translate-y-1 transition-transform"
              style={{ color: 'var(--comic-black)' }}
            >
              <ArrowLeft size={16} strokeWidth={3} />
              Go Back
            </button>
          </div>
        )}

        <div className={isWorldRoom || isInterviewSession ? "p-0 h-screen" : "p-4 md:p-8"}>{children}</div>
      </main>



      {}
      {!isWorldRoom && !isInterviewSession && (
        <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] md:w-auto max-w-full">
          <AnimatePresence>
            {showScrollHint && !hoverState && (
              <motion.div 
                key="scroll-hint"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap brutalist-border"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span>SWIPE FOR MORE</span>
                <ArrowRight size={10} className="animate-swipe-hint" />
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            className="relative group mx-auto w-fit max-w-full"
            onMouseEnter={() => setHoverState(true)}
            onMouseLeave={() => setHoverState(false)}
          >
            {}
            <div className="absolute inset-x-0 bottom-0 h-[64px] md:h-[72px] bg-white/90 backdrop-blur-xl brutalist-border rounded-[2rem] pointer-events-none" style={{ boxShadow: '8px 8px 0 var(--comic-black)' }} />

            <nav 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-16 pb-2 px-2 snap-x relative z-10 w-full"
            >
              {}
              <button 
                onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                className="absolute left-0 bottom-0 h-[64px] md:h-[72px] z-30 w-10 flex items-center justify-center bg-gradient-to-r from-white via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-l-[2rem]"
              >
                <ChevronLeft size={20} className="text-black" />
              </button>
              <button 
                onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                className="absolute right-0 bottom-0 h-[64px] md:h-[72px] z-30 w-10 flex items-center justify-center bg-gradient-to-l from-white via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-r-[2rem]"
              >
                <ChevronRight size={20} className="text-black" />
              </button>

              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/student' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex items-center justify-center snap-center shrink-0 group/item"
                  >
                    {}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap brutalist-border opacity-0 group-hover/item:opacity-100 group-hover/item:-translate-y-1 transition-all duration-200 z-50" style={{ fontFamily: 'var(--font-display)', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
                      <span className="text-yellow-400 text-sm">{item.emoji}</span>
                      <span className="uppercase text-[10px] tracking-widest font-bold">{item.label}</span>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rotate-45 border-r-2 border-b-2 border-white/20" />
                    </div>

                    <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-xl md:text-2xl border-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-yellow-400 border-black -translate-y-2 md:-translate-y-4 shadow-[4px_4px_0px_#000] scale-110' : 'bg-white/50 border-transparent hover:bg-yellow-100 hover:border-black hover:-translate-y-2 hover:shadow-[2px_2px_0px_#000]'}`}>
                      {item.emoji}
                    </div>
                  </Link>
                );
              })}
              
              <div className="w-1 h-8 md:h-10 bg-black/10 mx-1 md:mx-2 rounded-full shrink-0 self-end mb-2 md:mb-3" /> {}

              <button
                onClick={handleLogout}
                className="relative flex items-center justify-center snap-center shrink-0 group/item"
              >
                {}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap brutalist-border opacity-0 group-hover/item:opacity-100 group-hover/item:-translate-y-1 transition-all duration-200 z-50" style={{ fontFamily: 'var(--font-display)', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
                  <span className="text-yellow-400 text-sm">🚪</span>
                  <span className="uppercase text-[10px] tracking-widest font-bold">Log Out</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rotate-45 border-r-2 border-b-2 border-white/20" />
                </div>

                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-xl md:text-2xl bg-white/50 border-2 border-transparent rounded-2xl transition-all duration-300 hover:bg-red-500 hover:border-black hover:-translate-y-2 hover:shadow-[2px_2px_0px_#000] text-black hover:text-white">
                  <LogOut size={20} strokeWidth={3} className="md:w-6 md:h-6" />
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {!isWorldRoom && !isInterviewSession && <AIChatbot />}
    </div>
  );
}
