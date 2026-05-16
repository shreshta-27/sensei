'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Brain, AlertTriangle, ArrowRight, Activity, Loader2 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PaperSheet from '@/components/teacher/PaperSheet';

const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false });
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then(m => m.PolarRadiusAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });

export default function BehavioralAnalyzerPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/teacher/classes')
      .then(({ data }) => {
        const cls = data.classes || data || [];
        setClasses(cls);
        if (cls.length > 0) setSelectedClass(cls[0]._id);
      })
      .catch(() => toast.error('Failed to load classes'));
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/behavior/analyze/${selectedClass}`);
      setData(data.fingerprint);
      toast.success('Behavioral analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const mockRadarData = [
    { subject: 'Attendance', A: 80, B: 40, fullMark: 100 },
    { subject: 'Quiz Velocity', A: 90, B: 30, fullMark: 100 },
    { subject: 'Wellness', A: 70, B: 50, fullMark: 100 },
    { subject: 'Help Frequency', A: 20, B: 85, fullMark: 100 },
    { subject: 'Study Duration', A: 85, B: 20, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">Behavioral Analyzer</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Fusing cross-modal signals for student support</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 focus:border-purple-200 outline-none appearance-none shadow-sm"
            disabled={classes.length === 0}
          >
            {classes.length === 0 ? (
              <option value="">No classes found</option>
            ) : (
              classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name.toUpperCase()}</option>
              ))
            )}
          </select>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center gap-2 hover:scale-105 transition-all whitespace-nowrap disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />}
            Cross-Signal Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <PaperSheet title="CLASSROOM FINGERPRINT">
           <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-purple-500 rounded-full" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AVG STUDENT</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-orange-400 rounded-full" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AT-RISK COHORT</span>
              </div>
           </div>
           
           <div className="h-80 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRadarData}>
                    <PolarGrid stroke="#F3F4F6" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Avg Student" dataKey="A" stroke="#9333EA" fill="#9333EA" fillOpacity={0.15} />
                    <Radar name="At-Risk" dataKey="B" stroke="#FB923C" fill="#FB923C" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                 </RadarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <p className="handwriting text-xl text-purple-700 leading-relaxed text-center italic">
                 "Critical Divergence: At-risk students show high help frequency (85%) but low study duration (20%) and quiz velocity."
              </p>
           </div>
        </PaperSheet>

        {}
        <div className="space-y-6">
           <PaperSheet title="PROACTIVE ALERTS" className="h-fit">
              <div className="space-y-4">
                 {(data?.alerts || [
                   { message: "High correlation between missed 8am sessions and quiz failures in 5 students.", severity: 'warning', matchedStudents: ['Amit K.', 'Saira B.'] },
                   { message: "Wellness stress spikes detected 14 days before mid-sem across 40% of cohort.", severity: 'info' }
                 ]).map((alert: any, i: number) => (
                   <div key={i} className={`p-4 rounded-2xl border transition-all ${
                     alert.severity === 'warning' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
                   }`}>
                      <div className="flex gap-4">
                         <div className={`mt-1 ${alert.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'}`}>
                            <AlertTriangle size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-800 leading-snug mb-2">{alert.message}</p>
                            {alert.matchedStudents && (
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">IMPACTED: {alert.matchedStudents.join(', ')}</p>
                            )}
                            <button className="flex items-center gap-1 text-[10px] font-black text-purple-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                               TAKE ACTION <ArrowRight size={12} />
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </PaperSheet>

           <PaperSheet title="DEEP CORRELATIONS">
              <div className="space-y-4">
                 {(data?.correlations || [
                   { pattern: "Help ticket frequency vs Wellness score", impactDescription: "Higher help requests correlate with lower wellness scores in top 10 students." },
                   { pattern: "Attendance Velocity vs Submission Delays", impactDescription: "Drops in attendance velocity predict submission delays by 4.2 days." }
                 ]).map((corr: any, i: number) => (
                   <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="flex gap-4">
                         <div className="mt-1 text-purple-600">
                            <Activity size={18} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{corr.pattern}</p>
                            <p className="text-sm font-bold text-gray-700">{corr.impactDescription}</p>
                         </div>
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
