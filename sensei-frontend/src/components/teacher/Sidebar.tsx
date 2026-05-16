'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Activity, Upload,
  AlertTriangle, BarChart3, HelpCircle, Sparkles, User,
  LogOut, ChevronRight, Flame
} from 'lucide-react';

const navItems = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/classes', icon: Users, label: 'Classes' },
  { href: '/teacher/grading', icon: FileText, label: 'AI Grading' },
  { href: '/teacher/behavior-analyzer', icon: Activity, label: 'Behavior' },
  { href: '/teacher/upload', icon: Upload, label: 'Upload Data' },
  { href: '/teacher/interventions', icon: AlertTriangle, label: 'Interventions' },
  { href: '/teacher/polls', icon: BarChart3, label: 'Live Polls' },
  { href: '/teacher/help-queue', icon: HelpCircle, label: 'Help Queue' },
  { href: '/teacher/ai-content', icon: Sparkles, label: 'AI Content' },
  { href: '/teacher/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hoverState, setHoverState] = useState<{ label: string; x: number; y: number } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-50 hidden md:flex flex-col faculty-glass"
      style={{ borderRight: '1px solid var(--f-border)' }}
    >
      {}
      <AnimatePresence>
        {hoverState && !expanded && (
          <motion.div 
            key="viewport-tooltip-sidebar"
            initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[100] flex items-center gap-2 bg-faculty-surface-hover/90 backdrop-blur-md text-faculty-text px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap border border-faculty-border shadow-lg"
            style={{ 
              left: hoverState.x, 
              top: hoverState.y, 
              transform: 'translateY(-50%)',
            }}
          >
            <span className="text-xs font-semibold">{hoverState.label}</span>
            {}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-faculty-surface-hover rotate-45 border-l border-b border-faculty-border" />
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-faculty-border shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-faculty-ember to-faculty-ember-light flex items-center justify-center shrink-0">
          <Flame size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-faculty-heading text-lg font-bold text-faculty-text whitespace-nowrap"
            >
              SENSEI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto faculty-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                active
                  ? 'bg-gradient-to-r from-faculty-ember/15 to-transparent text-faculty-ember'
                  : 'text-faculty-text-secondary hover:text-faculty-text hover:bg-faculty-surface-hover'
              }`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverState({ label: item.label, x: rect.right + 12, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setHoverState(null)}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-faculty-ember"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={20} className={`shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="font-faculty text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && expanded && (
                <ChevronRight size={14} className="ml-auto text-faculty-ember" />
              )}
            </Link>
          );
        })}
      </nav>

      {}
      <div className="border-t border-faculty-border p-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-faculty-ember to-faculty-ember-light flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="font-faculty text-sm text-faculty-text truncate">{user?.name || 'Faculty'}</p>
                <p className="font-faculty text-xs text-faculty-text-secondary">Faculty</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {expanded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                onMouseEnter={(e: any) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverState({ label: 'Logout', x: rect.right + 12, y: rect.top + rect.height / 2 });
                }}
                onMouseLeave={() => setHoverState(null)}
                className="p-1.5 rounded-lg hover:bg-faculty-danger/10 text-faculty-text-secondary hover:text-faculty-danger transition-colors"
              >
                <LogOut size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
