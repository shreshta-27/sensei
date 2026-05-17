'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Activity, Upload,
  AlertTriangle, BarChart3, HelpCircle, Sparkles, User,
  LogOut, Settings, Calendar, BookOpen, BrainCircuit, MessageCircle
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/classes', icon: Users, label: 'My Classes' },
  { href: '/teacher/students', icon: Users, label: 'Students' },
  { href: '/teacher/ai-insights', icon: BrainCircuit, label: 'AI Insights' },
  { href: '/teacher/interventions', icon: AlertTriangle, label: 'Interventions' },
  { href: '/teacher/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/teacher/grading', icon: FileText, label: 'Assessments' },
  { href: '/teacher/reports', icon: BarChart3, label: 'Reports' },
  { href: '/teacher/upload', icon: Upload, label: 'Resources' },
  { href: '/teacher/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/teacher/profile', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <motion.aside
      animate={{ width: expanded ? 260 : 80 }}
      className="fixed left-0 top-0 h-screen z-50 hidden md:flex flex-col bg-white border-r border-[#E0E0E0] shadow-sm"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <BrainCircuit className="text-white" size={24} />
        </div>
        {expanded && (
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-[#1A1A1A]">SENSEI</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold -mt-1">AI CAMPUS OS</span>
          </div>
        )}
      </div>

      <div className="px-4 mb-8">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-white shadow-sm overflow-hidden">
             {user?.avatar ? (
               <Image src={user.avatar} alt="avatar" width={40} height={40} />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold">
                 {user?.name?.charAt(0) || 'P'}
               </div>
             )}
          </div>
          {expanded && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-gray-800 truncate">Dr. Priya Sharma</span>
              <span className="text-[11px] text-gray-500 font-medium">Computer Science</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`faculty-sidebar-item ${active ? 'active shadow-lg shadow-purple-200' : ''}`}
            >
              <item.icon size={20} />
              {expanded && <span className="text-[14px] font-semibold">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 relative overflow-hidden group cursor-pointer hover:bg-purple-100 transition-colors">
          <div className="relative z-10 flex flex-col items-center text-center">
            <BrainCircuit className="text-purple-600 mb-2" size={32} />
            {expanded && (
              <>
                <span className="text-xs font-bold text-purple-800 mb-1">Teaching Assistant</span>
                <span className="text-[10px] text-purple-600 font-medium mb-3">Online</span>
                <button className="w-full py-2 bg-white text-purple-600 rounded-xl text-[11px] font-bold shadow-sm hover:shadow-md transition-all">
                   Ask Sensei AI →
                </button>
              </>
            )}
          </div>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-200/50 rounded-full blur-2xl group-hover:bg-purple-300/50 transition-all" />
        </div>
      </div>
    </motion.aside>
  );
}
