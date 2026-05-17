'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, GraduationCap, BarChart3, Users,
  Brain, AlertTriangle, FileText, Zap, BookOpen,
  Database, Settings, LogOut, X, Menu, ChevronLeft, User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAIChatbot = dynamic(() => import('@/components/AdminAIChatbot'), { ssr: false });

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
  //  Sidebar width constant (icon rail only)
  // ─────────────────────────────────────────────────────
  const RAIL_W = 64;

  return (
    <div className="adm-page min-h-screen">

      {/* ══════════════════════════════════════════════
          DESKTOP  –  RIGHT-SIDE Floating Icon Rail
          Pure icon rail with CSS tooltips on hover.
         ══════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex fixed right-3 top-3 bottom-3 z-50 flex-col overflow-visible adm-glass-panel"
        style={{
          width: `${RAIL_W}px`,
          borderRadius: '22px',
        }}
      >
        {/* ── Brand Logo ── */}
        <div
          className="flex items-center justify-center pt-5 pb-2 flex-shrink-0"
        >
          <span
            className="text-[10px] font-black tracking-widest"
            style={{
              color: 'var(--adm-text)',
              fontFamily: 'Space Grotesk, sans-serif',
              transform: 'rotate(-90deg)',
              marginBottom: '16px',
              marginTop: '16px'
            }}
          >
            SENSEI
          </span>
        </div>

        {/* ── User Profile ── */}
        <div
          className="flex items-center justify-center py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}
        >
          <Link href="/admin/settings" className="adm-nav-tooltip-wrap">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm text-sm transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:ring-offset-2 adm-nav-avatar ${pathname === '/admin/settings' ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)' }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="adm-nav-tooltip">{user.name || 'Profile'}</span>
          </Link>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-visible py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="adm-nav-tooltip-wrap flex items-center justify-center rounded-xl relative"
                style={{
                  padding: '9px 0',
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
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-l-full"
                    style={{ background: 'var(--adm-accent)' }}
                  />
                )}
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center adm-nav-icon"
                  style={{ background: active ? 'rgba(124,58,237,0.15)' : 'transparent' }}
                >
                  <n.icon
                    size={17}
                    style={{ color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)' }}
                  />
                </div>
                {/* Tooltip (CSS-only, left side) */}
                <span className="adm-nav-tooltip">{n.label}</span>
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
            className="adm-nav-tooltip-wrap flex items-center justify-center rounded-xl w-full group"
            style={{ padding: '9px 0', transition: 'background 150ms ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <LogOut size={17} style={{ color: '#EF4444' }} />
            </div>
            <span className="adm-nav-tooltip adm-nav-tooltip-danger">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
         ══════════════════════════════════════════════ */}
      <main
        className="min-h-screen flex flex-col"
        style={{ paddingRight: 0 }}
      >
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
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div
          className="flex-1 p-4 md:p-6 lg:p-7 adm-pb-mobile"
          style={{ marginRight: 0 }}
        >
          <div className="lg:mr-[84px]">
            {children}
          </div>
        </div>

        <AdminAIChatbot />
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
          MOBILE – Full Drawer (slides from RIGHT)
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-50 flex flex-col lg:hidden adm-glass-panel"
              style={{ width: '264px', borderRadius: '20px 0 0 20px', borderRight: 'none' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}
              >
                <button onClick={() => setDrawerOpen(false)} style={{ color: 'var(--adm-text-muted)' }}>
                  <X size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
                  >
                    S
                  </div>
                  <span className="font-bold text-sm" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>SENSEI Admin</span>
                </div>
              </div>

              {/* User */}
              <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(124,58,237,0.06)' }}
                  onClick={() => setDrawerOpen(false)}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{user.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>View Profile & Settings</p>
                  </div>
                </Link>
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
                      {active && <ChevronLeft size={13} className="ml-auto" style={{ color: 'var(--adm-accent)' }} />}
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
