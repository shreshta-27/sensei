'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Activity, AlertTriangle, BookOpen, Database, FileText, LayoutDashboard, LogOut, Settings, ShieldAlert, Users, Menu, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherAIChatbot = dynamic(() => import('@/components/TeacherAIChatbot'), { ssr: false });

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/dropout-warning', label: 'Dropout Warning', icon: ShieldAlert },
  { href: '/admin/resource-optimizer', label: 'Resources', icon: Zap },
  { href: '/admin/curriculum', label: 'Curriculum', icon: BookOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: Activity },
  { href: '/admin/interventions', label: 'Interventions', icon: AlertTriangle },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/bulk-import', label: 'Bulk Import', icon: Database },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/system', label: 'System', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoverState, setHoverState] = useState<{ label: string; x: number; y: number } | null>(null);

  useEffect(() => { if (!user || user.role !== 'admin') router.push('/login'); }, [user, router]);
  

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-[#0D0D1A]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

      {}
      <AnimatePresence>
        {hoverState && (
          <motion.div 
            key="viewport-tooltip-admin"
            initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[100] flex items-center gap-2 bg-purple-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap border border-purple-500/50 shadow-[0_0_15px_rgba(168,155,254,0.3)]"
            style={{ 
              left: hoverState.x, 
              top: hoverState.y, 
              transform: 'translateY(-50%)',
            }}
          >
            <span className="text-xs font-bold tracking-widest uppercase">{hoverState.label}</span>
            {}
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-purple-900/90 rotate-45 border-r border-t border-purple-500/50" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {}
      <main className="flex-1 w-full lg:pr-[18rem] relative z-10 transition-all duration-300">
        <header className="sticky top-0 z-40 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center bg-[#0D0D1A]/90 backdrop-blur-md border-b border-purple-500/20 lg:border-none lg:bg-gradient-to-b lg:from-[#0D0D1A] lg:to-transparent">
          <div className="flex items-center gap-3 md:gap-4">
            <h2 className="text-xl md:text-3xl tracking-widest relative" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>
              MISSION CONTROL <span className="animate-pulse">🚀</span>
            </h2>
            <div className="hidden sm:block px-3 py-1 bg-purple-900/50 border border-purple-500/50 rounded text-purple-300 text-xs font-mono tracking-widest shadow-[0_0_10px_rgba(168,155,254,0.3)]">
              ADMINISTRATOR
            </div>
          </div>
          
          {}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-purple-900/30 border border-purple-500/50 text-purple-300 hover:bg-purple-800/50 transition-colors shadow-[0_0_15px_rgba(108,92,231,0.3)]"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
        <TeacherAIChatbot />
      </main>

      {}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {}
      <aside className={`fixed top-0 lg:top-6 right-0 lg:right-6 bottom-0 lg:bottom-6 w-72 lg:w-64 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex-1 lg:rounded-3xl border-l lg:border border-purple-500/30 bg-[#13132A]/90 lg:bg-[#13132A]/60 backdrop-blur-xl shadow-[0_0_30px_rgba(108,92,231,0.2)] flex flex-col overflow-hidden relative h-full">
          {}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent h-full animate-[scan_4s_linear_infinite] pointer-events-none" />
          
          <div className="p-6 border-b border-purple-500/20 text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(108,92,231,0.6)] border border-purple-400/50 rotate-3 group-hover:rotate-0 transition-transform">
              {user.name?.charAt(0)}
            </div>
            <p className="text-xl font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(108,92,231,0.8)]" style={{ fontFamily: 'var(--font-nav-display)' }}>SENSEI</p>
            <p className="text-[10px] uppercase tracking-widest text-purple-400" style={{ fontFamily: 'var(--font-mono)' }}>System Active</p>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto space-y-2 px-4 relative z-10 hide-scrollbar">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 relative group ${active ? 'bg-purple-600/30 text-purple-200 font-bold border border-purple-500/50 shadow-[0_0_15px_rgba(168,155,254,0.3)]' : 'hover:bg-purple-900/40 text-gray-400 hover:text-purple-300 border border-transparent'}`} 
                  style={{ fontFamily: 'var(--font-nav-body)' }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverState({ label: n.label, x: rect.left - 12, y: rect.top + rect.height / 2 });
                  }}
                  onMouseLeave={() => setHoverState(null)}
                >
                  <n.icon size={18} className={`transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_5px_rgba(168,155,254,0.8)]' : 'group-hover:scale-110'}`} />
                  <span className="tracking-widest uppercase text-xs">{n.label}</span>
                  {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-purple-500/20 relative z-10 bg-black/20">
            <button 
              onClick={() => { logout(); router.push('/login'); }} 
              onMouseEnter={(e: any) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverState({ label: 'Abort System', x: rect.left - 12, y: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setHoverState(null)}
              className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white text-xs uppercase tracking-widest font-bold transition-all duration-300 border border-red-500/30 hover:border-red-500 hover:shadow-[0_0_20px_rgba(244,67,54,0.4)] group"
            >
              <LogOut size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              <span>Abort System</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
