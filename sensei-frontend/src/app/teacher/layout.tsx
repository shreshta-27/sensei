'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/teacher/Sidebar';
import MobileNav from '@/components/teacher/MobileNav';

const ThreeBackground = dynamic(() => import('@/components/teacher/ThreeBackground'), { ssr: false });
const TeacherAIChatbot = dynamic(() => import('@/components/TeacherAIChatbot'), { ssr: false });

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || user.role !== 'teacher') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'teacher') return null;

  return (
    <div className="faculty-grid-bg min-h-screen font-faculty text-faculty-text faculty-scrollbar">
      <ThreeBackground />
      <Sidebar />
      <MobileNav />

      {}
      <main className="md:ml-[72px] pb-20 md:pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      <TeacherAIChatbot />
    </div>
  );
}
