'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart3, Zap, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/teacher', label: 'Home', Icon: Home },
  { href: '/teacher/classes', label: 'Classes', Icon: Users },
  { href: '/teacher/ai-insights', label: 'Insights', Icon: BarChart3 },
  { href: '/teacher/interventions', label: 'Actions', Icon: Zap },
  { href: '/teacher/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 bg-[var(--bg-sidebar-bot)] flex items-center justify-around"
      style={{
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000,
        fontFamily: 'var(--font-ui)',
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href === '/teacher' && pathname === '/teacher');
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 py-2 px-3 relative"
          >
            <div className="relative">
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.5}
                color={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                fill={active ? '#FFFFFF' : 'none'}
              />
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400" />
              )}
            </div>
            <span
              className="text-[10px] font-ui font-semibold"
              style={{ color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
