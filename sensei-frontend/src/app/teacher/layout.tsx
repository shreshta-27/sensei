'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Activity, Upload,
  AlertTriangle, BarChart3, HelpCircle, Sparkles, User,
  LogOut, Settings, Calendar, BookOpen, BrainCircuit,
  Zap, BarChart3 as BarChart3Icon, MessageSquare, GraduationCap, Moon
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const TeacherAIChatbot = dynamic(() => import('@/components/TeacherAIChatbot'), { ssr: false });
import NewTopNav from '@/components/teacher/NewTopNav';
import BottomNav from '@/components/teacher/BottomNav';

const navItems = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/classes', icon: Users, label: 'My Classes' },
  { href: '/teacher/students', icon: Users, label: 'Students' },
  { href: '/teacher/ai-insights', icon: BrainCircuit, label: 'AI Insights' },
  { href: '/teacher/interventions', icon: AlertTriangle, label: 'Interventions' },
  { href: '/teacher/grading', icon: FileText, label: 'Assessments' },
  { href: '/teacher/reports', icon: BarChart3Icon, label: 'Reports' },
  { href: '/teacher/upload', icon: Upload, label: 'Resources' },
  { href: '/teacher/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/teacher/profile', icon: Settings, label: 'Settings' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [teachingMode, setTeachingMode] = useState(true);

  useEffect(() => {
    if (!user || (user as any).role !== 'teacher') router.push('/login');
  }, [user, router]);

  if (!user || (user as any).role !== 'teacher') return null;

  document.body.className = teachingMode
    ? 'font-ui bg-[var(--bg-page)] text-[var(--text-primary)]'
    : 'font-ui bg-[var(--f-bg)] text-[var(--f-text)]';

  return (
    <div className={teachingMode
      ? 'min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]'
      : 'min-h-screen bg-[var(--f-bg)] text-[var(--f-text)]'
    }>
      {/* Top nav — fixed, full width */}
      <NewTopNav />

      {/* Mobile-only bottom nav */}
      <BottomNav />

      {/* Page content — offset by top nav height */}
      <main className="pt-[var(--nav-height)] md:pb-0 pb-[calc(80px+env(safe-area-inset-bottom))]">
        <div className="mx-auto" style={{ maxWidth: '1400px', padding: '0 var(--page-padding)', paddingBottom: 'var(--page-padding)' }}>
          {children}
        </div>
      </main>

      <TeacherAIChatbot />
    </div>
  );
}
