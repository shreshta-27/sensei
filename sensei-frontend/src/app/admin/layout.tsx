'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, GraduationCap, BarChart3, Users,
  Brain, AlertTriangle, FileText, Zap, BookOpen,
  Database, Settings, LogOut, X, Menu, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherAIChatbot = dynamic(() => import('@/components/TeacherAIChatbot'), { ssr: false });

const NAV_ITEMS = [
  { href: '/admin',                    label: 'Overview',      icon: LayoutDashboard },
  { href: '/admin/users',              label: 'Students',      icon: GraduationCap   },
  { href: '/admin/analytics',          label: 'Analytics',     icon: BarChart3       },
  { href: '/admin/faculty',            label: 'Faculty',       icon: Users           },
  { href: '/admin/dropout-warning',    label: 'AI Engine',     icon: Brain           },
  { href: '/admin/interventions',      label: 'Interventions', icon: AlertTriangle   },
  { href: '/admin/reports',            label: 'Reports',       icon: FileText        },
  { href: '/admin/resource-optimizer', label: 'Resources',     icon: Zap             },
  { href: '/admin/curriculum',         label: 'Curriculum',    icon: BookOpen        },
  { href: '/admin/bulk-import',        label: 'Bulk Import',   icon: Database        },
  { href: '/admin/system',             label: 'System Logs',   icon: Settings        },
];

const MOBILE_QUICK = [
  { href: '/admin',                 label: 'Home',     icon: LayoutDashboard },
  { href: '/admin/users',           label: 'Students', icon: GraduationCap   },
  { href: '/admin/analytics',       label: 'Analytics',icon: BarChart3       },
  { href: '/admin/dropout-warning', label: 'AI',       icon: Brain           },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { if (!user || user.role !== 'admin') router.push('/login'); }, [user, router]);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  if (!user) return null;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Signed out');
  };

  // ─────────────────────────────────────────────────────
  //  Sidebar width constants
  // ─────────────────────────────────────────────────────
  const NARROW_W  = 64;
  const EXPANDED_W = 232;

  return (
    <div className="adm-page min-h-screen">

      {/* ══════════════════════════════════════════════
          DESKTOP  –  Collapsible Icon Rail (different!)
          Starts narrow (icons only). Expands on hover.
          Overlays content – non-disruptive.
         ══════════════════════════════════════════════ */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="hidden lg:flex fixed left-3 top-3 bottom-3 z-50 flex-col overflow-hidden adm-glass-panel"
        style={{
          width: expanded ? `${EXPANDED_W}px` : `${NARROW_W}px`,
          borderRadius: '22px',
          transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Brand ── */}
        <div
          className="flex items-center gap-3 px-3 pt-5 pb-4 flex-shrink-0 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-base shadow-md"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)' }}
          >
            S
          </div>
          <div
            className="overflow-hidden whitespace-nowrap flex-shrink-0"
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 200ms ease, transform 200ms ease',
              transitionDelay: expanded ? '80ms' : '0ms',
            }}
          >
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>SENSEI</p>
            <p className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--adm-text-muted)' }}>AI Campus OS</p>
          </div>
        </div>

        {/* ── User ── */}
        <div
          className="flex items-center gap-3 px-3 py-3 flex-shrink-0 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm text-sm"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)' }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div
            className="overflow-hidden whitespace-nowrap flex-shrink-0"
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 200ms ease, transform 200ms ease',
              transitionDelay: expanded ? '80ms' : '0ms',
            }}
          >
            <p className="text-xs font-semibold truncate max-w-[140px]" style={{ color: 'var(--adm-text)', fontFamily: 'Inter, sans-serif' }}>{user.name}</p>
            <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>Administrator ⭐</p>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto adm-scrollbar py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 rounded-xl overflow-hidden group relative"
                style={{
                  padding: '9px 10px',
                  background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ background: 'var(--adm-accent)' }}
                  />
                )}
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: active ? 'rgba(124,58,237,0.15)' : 'transparent' }}
                >
                  <n.icon
                    size={17}
                    style={{ color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)' }}
                  />
                </div>
                {/* Label */}
                <span
                  className="text-xs font-medium whitespace-nowrap flex-shrink-0 select-none"
                  style={{
                    color: active ? 'var(--adm-accent)' : 'var(--adm-text-sub)',
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
                    transition: 'opacity 200ms ease, transform 200ms ease',
                    transitionDelay: expanded ? '90ms' : '0ms',
                  }}
                >
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Logout ── */}
        <div
          className="px-2 pb-4 pt-2 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl w-full overflow-hidden group"
            style={{ padding: '9px 10px', transition: 'background 150ms ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center">
              <LogOut size={17} style={{ color: '#EF4444' }} />
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap flex-shrink-0"
              style={{
                color: '#EF4444',
                opacity: expanded ? 1 : 0,
                transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
                transition: 'opacity 200ms ease, transform 200ms ease',
                transitionDelay: expanded ? '90ms' : '0ms',
              }}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
         ══════════════════════════════════════════════ */}
      <main
        className="min-h-screen flex flex-col"
        style={{ paddingLeft: 0 }}
      >
        {/* Desktop left offset — matches narrow sidebar */}
        <div className="hidden lg:block" style={{ paddingLeft: `${NARROW_W + 20}px` }}>
          {/* spacer handled via ml on content wrapper below */}
        </div>

        {/* Mobile top bar */}
        <header
          className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(124,58,237,0.1)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
            >
              S
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>SENSEI Admin</span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page content */}
        <div
          className="flex-1 p-4 md:p-6 lg:p-7 adm-pb-mobile"
          style={{ marginLeft: 0 }}
        >
          <div className="lg:ml-[84px]">
            {children}
          </div>
        </div>

        <TeacherAIChatbot />
      </main>

      {/* ══════════════════════════════════════════════
          MOBILE – Bottom Floating Dock
         ══════════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(124,58,237,0.18)',
          minWidth: 'auto',
        }}
      >
        {MOBILE_QUICK.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-150"
              style={{
                background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)',
              }}
            >
              <n.icon size={19} />
              <span className="text-[9px] font-semibold">{n.label}</span>
            </Link>
          );
        })}
        {/* Divider */}
        <div className="w-px h-8 mx-1" style={{ background: 'rgba(124,58,237,0.15)' }} />
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl"
          style={{ color: 'var(--adm-text-muted)' }}
        >
          <Menu size={19} />
          <span className="text-[9px] font-semibold">More</span>
        </button>
      </nav>

      {/* ══════════════════════════════════════════════
          MOBILE – Full Drawer
         ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 lg:hidden"
              style={{ backdropFilter: 'blur(4px)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden adm-glass-panel"
              style={{ width: '264px', borderRadius: '0 20px 20px 0', borderLeft: 'none' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
                  >
                    S
                  </div>
                  <span className="font-bold text-sm" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>SENSEI Admin</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} style={{ color: 'var(--adm-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* User */}
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)' }}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{user.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>Super Administrator</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto adm-scrollbar px-3 py-3 space-y-0.5">
                {NAV_ITEMS.map((n) => {
                  const active = isActive(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                      style={{
                        background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                        color: active ? 'var(--adm-accent)' : 'var(--adm-text-sub)',
                      }}
                    >
                      <n.icon size={16} style={{ color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)' }} />
                      {n.label}
                      {active && <ChevronRight size={13} className="ml-auto" style={{ color: 'var(--adm-accent)' }} />}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-3 pb-5 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all"
                  style={{ color: '#EF4444' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
