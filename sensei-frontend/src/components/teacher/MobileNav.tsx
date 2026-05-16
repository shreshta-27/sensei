'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, BarChart3, MoreHorizontal,
  Activity, Upload, AlertTriangle, HelpCircle, Sparkles, User, LogOut, X, BrainCircuit, Calendar
} from 'lucide-react';

const primaryNav = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Home' },
  { href: '/teacher/classes', icon: Users, label: 'Classes' },
  { href: '/teacher/grading', icon: FileText, label: 'Assess' },
  { href: '/teacher/interventions', icon: AlertTriangle, label: 'Alerts' },
];

const moreNav = [
  { href: '/teacher/ai-insights', icon: BrainCircuit, label: 'AI Insights' },
  { href: '/teacher/upload', icon: Upload, label: 'Resources' },
  { href: '/teacher/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/teacher/reports', icon: BarChart3, label: 'Reports' },
  { href: '/teacher/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  const [showMore, setShowMore] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-12 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-800">Faculty Tools</h3>
                <button onClick={() => setShowMore(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {moreNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center gap-2 transition-all ${
                        active ? 'text-purple-600 scale-105' : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        active ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-100'
                      }`}>
                         <item.icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-2 text-red-400"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <LogOut size={24} />
                  </div>
                  <span className="text-[11px] font-bold">Logout</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-6 right-6 z-[90] md:hidden">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[28px] p-2 flex items-center justify-between shadow-2xl shadow-purple-200/50">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all relative ${
                  active ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute inset-0 bg-purple-50 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={active ? 'scale-110' : ''} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
              showMore ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <div className={showMore ? 'bg-purple-50 rounded-2xl' : ''}>
               <MoreHorizontal size={20} />
            </div>
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
