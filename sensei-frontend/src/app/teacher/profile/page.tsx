'use client';

import { useState } from 'react';
import { 
  User, Mail, Building2, BookOpen, Edit3, Shield, Award, Calendar, 
  ArrowRight, Check, Loader2 
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import StickyNote from '@/components/teacher/StickyNote';
import PaperSheet from '@/components/teacher/PaperSheet';

export default function TeacherProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    bio: 'Passionate educator dedicated to adaptive, AI-powered learning experiences.'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/teacher/profile', formData);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'T';

  const profileStats = [
    { label: 'ROLE', value: 'FACULTY', icon: Shield, color: '#9333EA' },
    { label: 'DEPARTMENT', value: formData.department || 'GENERAL', icon: Building2, color: '#3B82F6' },
    { label: 'JOINED', value: '2024', icon: Calendar, color: '#F59E0B' },
    { label: 'COURSES', value: '5 ACTIVE', icon: BookOpen, color: '#10B981' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">Faculty Profile</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Manage your professional credentials</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={loading}
          className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : editing ? <Check size={18} /> : <Edit3 size={18} />}
          {loading ? 'Saving...' : editing ? 'Save Profile' : 'Edit Credentials'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1 space-y-8">
           <PaperSheet className="text-center p-12">
              <div className="relative inline-block mb-6">
                 <div className="w-32 h-32 rounded-[40px] bg-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-purple-200">
                    {initials}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-4 border-white rounded-full flex items-center justify-center shadow-lg text-purple-600">
                    <Shield size={18} />
                 </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800">{formData.name}</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{user?.email}</p>
              
              <div className="mt-8 pt-8 border-t border-dashed border-gray-100 flex flex-col gap-3">
                 <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-2">
                    <span className="uppercase tracking-widest">OFFICE STATUS</span>
                    <span className="text-green-500">AVAILABLE</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-2">
                    <span className="uppercase tracking-widest">VERIFIED</span>
                    <span className="text-purple-600">IDENTITY CONFIRMED</span>
                 </div>
              </div>
           </PaperSheet>

           <div className="grid grid-cols-2 gap-4">
              {profileStats.map((stat, i) => (
                <StickyNote key={i} color={stat.color} className="!p-4 h-32 flex flex-col justify-between">
                   <div className="text-white/80"><stat.icon size={20} /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                   </div>
                </StickyNote>
              ))}
           </div>
        </div>

        {}
        <div className="lg:col-span-2 space-y-8">
           <PaperSheet title="PROFESSIONAL INFORMATION">
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { icon: User, label: 'Full Display Name', value: formData.name, key: 'name' },
                      { icon: Building2, label: 'Primary Department', value: formData.department, key: 'department' },
                      { icon: Mail, label: 'Institutional Email', value: user?.email || '', disabled: true },
                      { icon: BookOpen, label: 'Total Enrolled Students', value: '1,248', disabled: true },
                    ].map((field, idx) => (
                      <div key={idx} className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                         {editing && !field.disabled ? (
                           <input 
                             value={field.value}
                             onChange={(e) => setFormData({ ...formData, [field.key as string]: e.target.value })}
                             className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2.5 px-4 focus:border-b-purple-500 outline-none font-bold text-gray-700 transition-all"
                           />
                         ) : (
                           <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-transparent">
                              <field.icon size={16} className="text-purple-400" />
                              <span className="font-bold text-gray-600">{field.value || 'NOT SPECIFIED'}</span>
                           </div>
                         )}
                      </div>
                    ))}
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Bio & Notes</label>
                       <Edit3 size={14} className="text-gray-300" />
                    </div>
                    {editing ? (
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 p-4 focus:border-b-purple-500 outline-none handwriting text-xl h-48 resize-none transition-all"
                        placeholder="Tell students about yourself..."
                      />
                    ) : (
                      <div className="bg-[#FFFDF6] p-8 rounded-[32px] border border-orange-100 shadow-inner relative overflow-hidden">
                         <div className="absolute top-0 bottom-0 left-8 w-px bg-red-100" />
                         <div className="space-y-2 relative">
                            {formData.bio.split('\n').map((line, li) => (
                              <p key={li} className="handwriting text-2xl text-gray-700 leading-relaxed min-h-[1.5em]">{line}</p>
                            ))}
                            {!formData.bio && <p className="handwriting text-2xl text-gray-400 italic">No biographical notes found on record.</p>}
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </PaperSheet>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PaperSheet className="!bg-purple-600 !border-none !p-6 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all">
                 <div>
                    <h4 className="text-white font-bold mb-1">Security Settings</h4>
                    <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest">Update your password</p>
                 </div>
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                    <ArrowRight size={20} />
                 </div>
              </PaperSheet>
              
              <PaperSheet className="!bg-gray-900 !border-none !p-6 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all">
                 <div>
                    <h4 className="text-white font-bold mb-1">Faculty Badge</h4>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">View achievements</p>
                 </div>
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                    <Award size={20} />
                 </div>
              </PaperSheet>
           </div>
        </div>
      </div>
    </div>
  );
}
