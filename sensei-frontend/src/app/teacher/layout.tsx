'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/teacher/Sidebar';
import MobileNav from '@/components/teacher/MobileNav';

const TeacherAIChatbot = dynamic(() => import('@/components/TeacherAIChatbot'), { ssr: false });
import FacultyTopNav from '@/components/teacher/FacultyTopNav';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || user.role !== 'teacher') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'teacher') return null;

  return (
    <div className="faculty-desk-bg min-h-screen text-[#2D3436] overflow-x-hidden">
      <Sidebar />
      <MobileNav />

      <main className="md:ml-[260px] relative z-10 flex flex-col min-h-screen">
        <FacultyTopNav />
        <div className="flex-1 px-4 md:px-8 pb-8">
          {children}
        </div>
      </main>

      <TeacherAIChatbot />
    </div>
  );
}
