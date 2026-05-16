'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, BarChart3, MoreHorizontal,
  Activity, Upload, AlertTriangle, HelpCircle, Sparkles, User, LogOut, X
} from 'lucide-react';

const primaryNav = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Home' },
  { href: '/teacher/classes', icon: Users, label: 'Classes' },
  { href: '/teacher/grading', icon: FileText, label: 'Grading' },
  { href: '/teacher/polls', icon: BarChart3, label: 'Polls' },
];

const moreNav = [
  { href: '/teacher/behavior-analyzer', icon: Activity, label: 'Behavior' },
  { href: '/teacher/upload', icon: Upload, label: 'Upload Data' },
  { href: '/teacher/interventions', icon: AlertTriangle, label: 'Interventions' },
  { href: '/teacher/help-queue', icon: HelpCircle, label: 'Help Queue' },
  { href: '/teacher/ai-content', icon: Sparkles, label: 'AI Content' },
  { href: '/teacher/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [hoverState, setHoverState] = useState<{ label: string; x: number; y: number } | null>(null);

  return (
    <>
      {}
      <AnimatePresence>
        {hoverState && (
          <motion.div 
            key="viewport-tooltip-teacher"
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[100] flex items-center gap-2 bg-faculty-surface-hover/90 backdrop-blur-md text-faculty-text px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap border border-faculty-border shadow-lg"
            style={{ 
              left: hoverState.x, 
              bottom: hoverState.y, 
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-xs font-semibold">{hoverState.label}</span>
            {}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-faculty-surface-hover rotate-45 border-r border-b border-faculty-border" />
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-faculty-surface border-t border-faculty-border rounded-t-2xl p-4 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-faculty-heading text-lg font-semibold text-faculty-text">More</h3>
                <button onClick={() => setShowMore(false)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {moreNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                        active ? 'bg-faculty-ember/10 text-faculty-ember' : 'text-faculty-text-secondary hover:bg-faculty-surface-hover'
                      }`}
                    >
                      <item.icon size={22} />
                      <span className="font-faculty text-xs">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => { logout(); router.push('/login'); setShowMore(false); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-faculty-danger hover:bg-faculty-danger/10 transition-all"
                >
                  <LogOut size={22} />
                  <span className="font-faculty text-xs">Logout</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="faculty-glass border-t border-faculty-border px-2 py-2 flex items-center justify-around">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${
                  active ? 'text-faculty-ember' : 'text-faculty-text-secondary'
                }`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverState({ label: item.label, x: rect.left + rect.width / 2, y: window.innerHeight - rect.top + 8 });
                }}
                onMouseLeave={() => setHoverState(null)}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-tab"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-faculty-ember"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} />
                <span className="font-faculty text-[10px]">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              showMore ? 'text-faculty-ember' : 'text-faculty-text-secondary'
            }`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverState({ label: 'More', x: rect.left + rect.width / 2, y: window.innerHeight - rect.top + 8 });
            }}
            onMouseLeave={() => setHoverState(null)}
          >
            <MoreHorizontal size={20} />
            <span className="font-faculty text-[10px]">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
