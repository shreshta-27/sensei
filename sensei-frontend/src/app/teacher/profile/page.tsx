'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, BookOpen, Edit3, Shield, Award, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import PageTransition from '@/components/teacher/PageTransition';

export default function TeacherProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('Passionate educator dedicated to adaptive, AI-powered learning experiences.');

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
    { label: 'Role', value: 'Faculty', icon: Shield, color: '#10B981' },
    { label: 'Department', value: formData.department || 'N/A', icon: Building2, color: '#8B5CF6' },
    { label: 'Joined', value: '2024', icon: Calendar, color: '#FF6B35' },
    { label: 'Subjects', value: '5', icon: BookOpen, color: '#14B8A6' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-faculty-heading text-2xl md:text-3xl font-bold text-faculty-text">My Profile</h1>
          <p className="font-faculty text-sm text-faculty-text-secondary mt-1">Manage your faculty information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {}
          <div className="faculty-card p-6 md:p-8 flex flex-col items-center text-center space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-3xl md:text-4xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--f-ember), var(--f-ember-light))', boxShadow: '0 0 40px rgba(255,107,53,0.2)' }}
            >
              {initials}
            </motion.div>

            <div>
              <h2 className="font-faculty-heading text-xl md:text-2xl font-bold text-faculty-text">{formData.name || 'Faculty Member'}</h2>
              <p className="font-faculty text-sm text-faculty-text-secondary mt-1">{user?.email}</p>
            </div>

            <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--f-ember)', border: '1px solid rgba(255,107,53,0.3)' }}>
              Faculty
            </div>

            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={loading}
              className="faculty-btn-ghost flex items-center justify-center gap-2 px-6 py-2 text-sm w-full"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : editing ? <Check size={14} /> : <Edit3 size={14} />}
              {loading ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {}
          <div className="lg:col-span-2 space-y-4">
            {}
            <div className="grid grid-cols-2 gap-3">
              {profileStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="faculty-card p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: s.color + '15' }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-faculty text-[10px] uppercase tracking-wider text-faculty-text-secondary">{s.label}</p>
                    <p className="font-faculty-data text-sm font-semibold text-faculty-text truncate">{s.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {}
            <div className="faculty-card p-5 space-y-4">
              <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">Contact Information</h3>
              {[
                { icon: Mail, label: 'Email', value: user?.email || '', key: 'email', disabled: true },
                { icon: User, label: 'Full Name', value: formData.name, key: 'name' },
                { icon: Building2, label: 'Department', value: formData.department, key: 'department' },
              ].map(({ icon: Icon, label, value, key, disabled }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-faculty-bg/80 border border-faculty-border/50">
                    <Icon size={16} className="text-faculty-text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-faculty text-[10px] uppercase tracking-wider text-faculty-text-secondary">{label}</p>
                    {editing && !disabled ? (
                      <input
                        value={value}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="faculty-input w-full text-sm py-1.5 px-2 mt-1"
                        placeholder={label}
                      />
                    ) : (
                      <p className="font-faculty text-sm text-faculty-text">{value || 'not set'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {}
            <div className="faculty-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-faculty-heading text-sm font-semibold text-faculty-text">Bio</h3>
                <Award size={18} className="text-faculty-ember" />
              </div>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="faculty-input w-full resize-none"
                />
              ) : (
                <p className="font-faculty text-sm text-faculty-text-secondary leading-relaxed">{formData.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
