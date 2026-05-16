'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, AlertTriangle, TrendingUp, Zap, 
  ArrowRight, Calendar, FileText, Activity, BarChart3 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import { PageSkeleton } from '@/components/teacher/LoadingSkeleton';
import StickyNote from '@/components/teacher/StickyNote';
import PaperSheet from '@/components/teacher/PaperSheet';

export default function TeacherDashboard() {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { on } = useSocket('/teacher');

  useEffect(() => {
    fetchDashboard();

    const offHelp = on('help:new_ticket', () => {
      setData(prev => prev ? { ...prev, pendingHelpTickets: (prev.pendingHelpTickets || 0) + 1 } : null);
      toast.success('New help ticket received!', { icon: '🙋' });
    });

    return () => { offHelp(); };
  }, [on]);

  const fetchDashboard = () => {
    api.get('/api/teacher/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  if (loading) return <PageSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <PaperSheet className="max-w-md text-center">
         <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
         <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
         <p className="text-gray-600 mb-6">{error}</p>
         <button onClick={fetchDashboard} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold">Retry</button>
      </PaperSheet>
    </div>
  );

  if (!data) return null;

  const stats = [
    { label: 'MY CLASSES', value: (data.subjects as string[])?.length || 6, icon: BookOpen, color: 'blue' as const },
    { label: 'STUDENTS', value: data.totalStudents || 128, icon: Users, color: 'yellow' as const },
    { label: 'AT RISK STUDENTS', value: data.atRiskCount || 18, icon: AlertTriangle, color: 'pink' as const },
    { label: 'CLASS ENGAGEMENT', value: `${data.engagement || 76}%`, icon: TrendingUp, color: 'green' as const },
    { label: 'INTERVENTIONS', value: data.pendingHelpTickets || 23, icon: Zap, color: 'purple' as const },
  ];

  const studentsToWatch = [
    { name: 'Rahul Verma', status: 'Performance declining in DS Algo', risk: 'High', color: 'red' },
    { name: 'Sneha Iyer', status: 'Low attendance this week', risk: 'Medium', color: 'orange' },
    { name: 'Arjun Nair', status: 'Missed 3 assignments', risk: 'High', color: 'red' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {}
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-black text-[#1A1A1A] flex items-center gap-3">
          Faculty Command Desk
          <span className="text-2xl">✨</span>
        </h1>
        <p className="handwriting text-xl text-gray-500 font-medium">
          Your AI copilot for smarter teaching and impactful interventions.
        </p>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <StickyNote key={stat.label} color={stat.color} rotation={i % 2 === 0 ? -1 : 1} delay={i * 0.1}>
            <span className="text-[10px] font-black tracking-widest text-gray-600 mb-1">{stat.label}</span>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-black text-[#1A1A1A]">{stat.value}</span>
              <stat.icon size={24} className="text-gray-400 mb-1" />
            </div>
            {stat.label === 'CLASS ENGAGEMENT' && (
               <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-600">
                 <TrendingUp size={12} />
                 <span>↑ 6% vs last month</span>
               </div>
            )}
          </StickyNote>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {}
        <div className="lg:col-span-8 space-y-8">
          <PaperSheet title="CLASSROOM PULSE" className="min-h-[400px]">
            <p className="handwriting text-gray-500 -mt-4 mb-8">Live pulse of engagement in your classes</p>
            <div className="h-[300px] w-full bg-gray-50/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-100">
               <span className="text-gray-400 font-medium italic">Engagement Radar Chart Placeholder</span>
            </div>
            <button className="mt-8 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200 transition-all">
              View Detailed Heatmap <ArrowRight size={16} />
            </button>
          </PaperSheet>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PaperSheet title="STUDENTS TO WATCH">
              <div className="space-y-6">
                {studentsToWatch.map((student, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                       <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                         {student.name.charAt(0)}
                       </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">{student.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          student.risk === 'High' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                        }`}>
                          {student.risk}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{student.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PaperSheet>

            <PaperSheet title="QUICK ACTIONS" className="bg-[#FFF9C4]/30 border-[#FFF9C4]">
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { label: 'Schedule Remedial Class', icon: Calendar, color: 'text-red-500' },
                   { label: 'Share Revision Notes', icon: FileText, color: 'text-orange-500' },
                   { label: 'Contact Parents', icon: Users, color: 'text-blue-500' },
                   { label: 'Wellness Check', icon: Activity, color: 'text-pink-500' },
                   { label: 'Create Poll / Quiz', icon: BarChart3, color: 'text-purple-500' },
                 ].map((action, i) => (
                   <button key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all group">
                     <action.icon size={18} className={`${action.color} group-hover:scale-110 transition-transform`} />
                     <span className="text-sm font-bold text-gray-700">{action.label}</span>
                   </button>
                 ))}
               </div>
            </PaperSheet>
          </div>
        </div>

        {}
        <div className="lg:col-span-4 space-y-8">
          <PaperSheet title="AI INTERVENTION FEED">
             <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
               {[
                 { time: '10:10 AM', event: 'Attendance drop detected', detail: '8 students in Fullstack - Sec B', risk: 'High', color: 'bg-red-500' },
                 { time: '09:15 AM', event: 'Performance decline in DS Algo', detail: '3 students need support', risk: 'Medium', color: 'bg-orange-500' },
                 { time: '08:45 AM', event: 'Wellness anomaly detected', detail: '2 students need attention', risk: 'High', color: 'bg-red-500' },
               ].map((item, i) => (
                 <div key={i} className="relative pl-8 group">
                   <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full ${item.color} border-4 border-white shadow-sm z-10`} />
                   <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-bold text-gray-400">{item.time}</span>
                     <span className="text-sm font-bold text-gray-800">{item.event}</span>
                     <span className="text-xs text-gray-500">{item.detail}</span>
                     <span className={`text-[9px] font-black uppercase mt-1 ${item.risk === 'High' ? 'text-red-500' : 'text-orange-500'}`}>{item.risk}</span>
                   </div>
                 </div>
               ))}
             </div>
          </PaperSheet>

          <PaperSheet title="UPCOMING EVENTS">
            <div className="space-y-6">
               {[
                 { date: 'May 18', event: 'Internal Assessment', subject: 'Fullstack - Section B' },
                 { date: 'May 20', event: 'Parent Meeting', subject: '3 students' },
                 { date: 'May 22', event: 'Remedial Class', subject: 'DBMS - Section A' },
               ].map((event, i) => (
                 <div key={i} className="flex gap-4">
                   <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{event.date.split(' ')[0]}</span>
                      <span className="text-sm font-black text-gray-800 -mt-1">{event.date.split(' ')[1]}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{event.event}</span>
                      <span className="text-xs text-gray-500">{event.subject}</span>
                   </div>
                 </div>
               ))}
            </div>
          </PaperSheet>
        </div>
      </div>
    </div>
  );
}
