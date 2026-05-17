'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Bell, User, ChevronDown, Settings, LogOut, Sparkles, Activity } from 'lucide-react';

const NAV_LINKS = [
  'Home', 'My Classes', 'Students', 'AI Insights',
  'Interventions', 'Messages', 'Assessments', 'Reports', 'Upload', 'Help Queue', 'Polls',
];

const NOTIFICATIONS = [
  { type: '📣 New Assignment', title: 'Grade 10 Math HW due tomorrow' },
  { type: '⚠️ At-Risk Alert', title: '3 students need attention this week' },
  { type: '✅ Grading Done', title: 'Unit Test 3 auto-graded — 28 submissions' },
  { type: '💡 AI Suggestion', title: 'Reteach slide deck ready for Chapter 4' },
];

const PROFILE_ITEMS = [
  'My Profile',
  'Teaching Effectiveness',
  'Coaching Report',
  'Settings',
  'Logout',
];

export default function NewTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const xp = 1240;
  const initials = (user?.name || 'Faculty Member')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (link: string) => {
    const map: Record<string, string> = {
      Home: '/teacher',
      'My Classes': '/teacher/classes',
      Students: '/teacher/students',
      'AI Insights': '/teacher/ai-insights',
      Interventions: '/teacher/interventions',
      Messages: '/teacher/messages',
      Assessments: '/teacher/ai-content',
      Reports: '/teacher/reports',
      Upload: '/teacher/upload',
      'Help Queue': '/teacher/help-queue',
      Polls: '/teacher/polls',
    };
    const href = map[link];
    if (href === '/teacher') return pathname === '/teacher';
    return pathname.startsWith(href!);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-nav)] border-b border-[#E5E0D8] z-[1000]"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      <div className="h-full flex items-center px-4 gap-4">
        {/* ───── LEFT SECTION ───── */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <BookOpen className="w-8 h-8 text-purple-600" />
          <div className="flex flex-col leading-none">
            <span
              className="text-xl tracking-wide"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
              }}
            >
              SENSEI
            </span>
            <span
              className="text-[10px] uppercase tracking-wider -mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              AI Campus OS
            </span>
          </div>
        </div>

        {/* ───── CENTER SECTION ───── */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link}
                href={
                  link === 'Home'
                    ? '/teacher'
                    : link === 'My Classes'
                    ? '/teacher/classes'
                    : link === 'Students'
                    ? '/teacher/students'
                    : link === 'AI Insights'
                    ? '/teacher/ai-insights'
                    : link === 'Interventions'
                    ? '/teacher/interventions'
                    : link === 'Messages'
                    ? '/teacher/messages'
                    : link === 'Assessments'
                    ? '/teacher/grading'
                    : link === 'Reports'
                    ? '/teacher/reports'
                    : link === 'Upload'
                    ? '/teacher/upload'
                    : link === 'Help Queue'
                    ? '/teacher/help-queue'
                    : link === 'Polls'
                    ? '/teacher/polls'
                    : '/teacher/profile'
                }
                className={`px-3 py-1.5 rounded-lg font-ui text-sm font-semibold transition-all ${
                  active
                    ? 'text-[var(--accent-purple)] bg-[#F5F0FF]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--accent-purple)] hover:bg-[#F5F0FF]'
                }`}
              >
                {link}
              </Link>
            );
          })}
        </nav>

        {/* ───── RIGHT SECTION ───── */}
        <div className="flex items-center gap-3 min-w-[180px] justify-end">
          {/* XP Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-ui font-bold border border-amber-200">
            <Sparkles size={12} />
            {xp} XP
          </span>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F0FF] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
              <span className="absolute -top-2 -right-3 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-[#E5E0D8] p-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wider px-2 pb-2" style={{ color: 'var(--text-muted)' }}>
                    Notifications
                  </p>
                  {NOTIFICATIONS.map((n, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 rounded-xl font-ui text-sm text-[var(--text-secondary)] hover:bg-[#FFFEF5] hover:text-[var(--accent-purple)] cursor-pointer"
                    >
                      <span className="font-semibold">{n.type}</span> — {n.title}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="w-9 h-9 rounded-full bg-[var(--accent-purple)] text-white font-ui font-bold text-sm flex items-center justify-center overflow-hidden"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-xl border border-[#E5E0D8] p-2"
                >
                  <div className="px-3 py-2 border-b border-[#E5E0D8] mb-1">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {user?.name || 'Faculty Member'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user?.email || ''}
                    </p>
                  </div>
                  {PROFILE_ITEMS.map((item) => {
                    const isLogout = item === 'Logout';
                    const isCoaching = item === 'Coaching Report';
                    return (
                      <div
                        key={item}
                        onClick={() => {
                          if (isLogout) handleLogout();
                          else {
                            const href =
                              item === 'My Profile'
                                ? '/teacher/profile'
                                : item === 'Settings'
                                ? '/teacher/profile'
                                : '#';
                            if (href !== '#') router.push(href);
                            setProfileOpen(false);
                          }
                        }}
                        className="px-3 py-2.5 rounded-xl font-ui text-sm text-[var(--text-secondary)] hover:bg-[#FFFEF5] hover:text-[var(--accent-purple)] cursor-pointer flex items-center"
                      >
                        <span>{item}</span>
                        {isCoaching && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black text-red-500 bg-red-50">NEW</span>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
