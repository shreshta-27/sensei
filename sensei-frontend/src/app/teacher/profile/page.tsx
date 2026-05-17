'use client';

import { useState } from 'react';
import { 
  User, Mail, Building2, BookOpen, Edit3, Shield, Award, Calendar, 
  ArrowRight, Check, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import StickyCard from '@/components/faculty/StickyCard';

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
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'T';

  const colorMap: Record<string, 'yellow' | 'blue' | 'green' | 'purple' | 'pink' | 'orange'> = {
    '#9333EA': 'purple',
    '#3B82F6': 'blue',
    '#F59E0B': 'orange',
    '#10B981': 'green',
  };

  const profileStats = [
    { label: 'ROLE',       value: 'FACULTY', icon: Shield,    color: '#9333EA' },
    { label: 'DEPARTMENT', value: formData.department || 'GENERAL', icon: Building2, color: '#3B82F6' },
    { label: 'JOINED',     value: '2024',       icon: Calendar,  color: '#F59E0B' },
    { label: 'COURSES',    value: '5 ACTIVE',   icon: BookOpen,  color: '#10B981' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>Faculty Profile</h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">Manage your professional credentials</p>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : editing ? <Check size={18} /> : <Edit3 size={18} />}
          {loading ? 'Saving…' : editing ? 'Save Profile' : 'Edit Credentials'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <StickyCard color="purple" pinned className="text-center !p-8">
            <div className="relative inline-block mb-5">
              <div className="w-28 h-28 rounded-2xl bg-[var(--accent-purple)] flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-[var(--accent-purple)]/20">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--sticky-green)] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <Shield size={18} className="text-green-700" />
              </div>
            </div>
            <h2 className="font-display text-xl text-[var(--text-primary)]">{formData.name}</h2>
            <p className="font-ui text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">{user?.email}</p>
            <div className="mt-6 pt-5 border-t border-[var(--border-card)] flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] px-1">
                <span className="uppercase tracking-widest">OFFICE STATUS</span>
                <span className="text-green-600 font-bold">AVAILABLE</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] px-1">
                <span className="uppercase tracking-widest">VERIFIED</span>
                <span className="text-[var(--accent-purple)] font-bold">ID CONFIRMED</span>
              </div>
            </div>
          </StickyCard>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {profileStats.map((stat, i) => (
              <StickyCard key={stat.label} color={colorMap[stat.color]} className="!p-4 !flex flex-col justify-between" rotation={-0.5 + i * 0.3}>
                <stat.icon size={20} className="text-[var(--text-primary)]/60" />
                <div>
                  <p className="font-ui text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{stat.label}</p>
                  <p className="font-display text-sm text-[var(--text-primary)]">{stat.value}</p>
                </div>
              </StickyCard>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Info */}
          <StickyCard color="yellow" pinned className="!p-6">
            <h3 className="font-display text-lg mb-5 border-b border-[var(--border-card)] pb-2">PROFESSIONAL INFORMATION</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: User,        label: 'Full Display Name',     value: formData.name,          key: 'name' },
                  { icon: Building2,   label: 'Primary Department',    value: formData.department,    key: 'department' },
                  { icon: Mail,        label: 'Institutional Email',   value: user?.email || '',      key: '_email', disabled: true },
                  { icon: BookOpen,    label: 'Total Enrolled Students', value: '1,248',             key: '_students', disabled: true },
                ].map((field, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">{field.label}</label>
                    {editing && !field.disabled ? (
                      <input
                        value={field.value}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full bg-white/70 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui font-bold text-sm outline-none focus:border-[var(--accent-purple)]"
                      />
                    ) : (
                      <div className="flex items-center gap-3 bg-white/50 p-2.5 rounded-xl border border-[var(--border-card)]">
                        <field.icon size={15} className="text-[var(--accent-purple)]" />
                        <span className="font-ui font-bold text-sm text-[var(--text-primary)]">{field.value || 'NOT SPECIFIED'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Professional Bio</label>
                  <Edit3 size={13} className="text-[var(--text-muted)]" />
                </div>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/70 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:border-[var(--accent-purple)] h-28 resize-none"
                    placeholder="Tell students about yourself..."
                  />
                ) : (
                  <div className="bg-[var(--sticky-yellow)]/50 p-5 rounded-xl border-2 border-[var(--border-doodle)]">
                    <p className="font-body text-base text-[var(--text-secondary)] leading-relaxed">
                      {formData.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </StickyCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StickyCard color="blue" className="!p-5 cursor-pointer hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base text-[var(--text-primary)]">Security Settings</h4>
                  <p className="font-ui text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Update your password</p>
                </div>
                <ArrowRight size={18} className="text-[var(--accent-blue)]" />
              </div>
            </StickyCard>
            <StickyCard color="green" className="!p-5 cursor-pointer hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base text-[var(--text-primary)]">Faculty Badge</h4>
                  <p className="font-ui text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">View achievements</p>
                </div>
                <Award size={18} className="text-green-600" />
              </div>
            </StickyCard>
          </div>
        </div>
      </div>
    </div>
  );
}
