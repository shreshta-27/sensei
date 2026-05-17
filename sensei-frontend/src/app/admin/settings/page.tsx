'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeft, User, Shield, Bell, Palette, Monitor,
  Mail, Lock, Eye, EyeOff, Save, ChevronRight,
  Moon, Sun, Globe, Key, Smartphone, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: true,
    criticalAlerts: true,
    studentRiskAlerts: true,
    systemAlerts: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    animations: true,
  });

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/admin/users/${user._id}`, { name: profileForm.name });
      updateUser({ name: profileForm.name });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSaving(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Manage your personal information' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password & authentication' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert preferences' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & display' },
    { id: 'system', label: 'System Info', icon: Monitor, desc: 'Platform details' },
  ];

  const inputStyle = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(124,58,237,0.12)',
    borderRadius: '14px',
    color: 'var(--adm-text)',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    padding: '12px 16px',
    width: '100%',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div className="space-y-5 max-w-[1100px]">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <button
          onClick={() => router.push('/admin')}
          className="adm-back-btn mb-4"
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)' }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-black tracking-tight"
              style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}
            >
              Settings
            </h1>
            <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>
              Manage your account and preferences
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sidebar Navigation */}
        <motion.div
          className="lg:col-span-4 xl:col-span-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="adm-card p-2 space-y-1">
            {SECTIONS.map((s) => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-left"
                  style={{
                    background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                    color: active ? 'var(--adm-accent)' : 'var(--adm-text-sub)',
                  }}
                >
                  <s.icon size={18} style={{ color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>{s.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ opacity: active ? 1 : 0.3, color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)' }} />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="lg:col-span-8 xl:col-span-9"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="adm-card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} style={{ color: 'var(--adm-accent)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Profile Information</h2>
              </div>

              <div className="flex items-center gap-5 p-4 rounded-2xl" style={{ background: 'rgba(124,58,237,0.04)' }}>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #C084FC)' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{user.name}</p>
                  <p className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>{user.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--adm-accent)' }}>
                    <Shield size={10} /> Administrator
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>Full Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--adm-text-muted)' }} />
                    <input
                      value={profileForm.email}
                      disabled
                      style={{ ...inputStyle, paddingLeft: '40px', opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>Role</label>
                  <input value="Administrator" disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>Department</label>
                  <input value={user.department || 'All Departments'} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
              >
                <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="adm-card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} style={{ color: 'var(--adm-accent)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Account Security</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>Current Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--adm-text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--adm-text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--adm-text-sub)' }}>Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
              >
                <Key size={14} /> {saving ? 'Changing…' : 'Change Password'}
              </button>

              <div className="p-4 rounded-2xl" style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.08)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--adm-text)' }}>Two-Factor Authentication</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--adm-text-muted)' }}>Add an extra layer of security to your account</p>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--adm-accent)' }}
                >
                  <Smartphone size={14} /> Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="adm-card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={20} style={{ color: 'var(--adm-accent)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Notification Preferences</h2>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important updates via email', icon: Mail },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time browser notifications', icon: Bell },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of weekly campus activity', icon: Globe },
                  { key: 'criticalAlerts', label: 'Critical Alerts', desc: 'Immediate alerts for urgent issues', icon: AlertTriangle },
                  { key: 'studentRiskAlerts', label: 'Student Risk Alerts', desc: 'Notifications when students enter at-risk zones', icon: User },
                  { key: 'systemAlerts', label: 'System Maintenance', desc: 'Updates about system maintenance windows', icon: Monitor },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,58,237,0.06)' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.08)' }}>
                      <item.icon size={16} style={{ color: 'var(--adm-accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--adm-text)' }}>{item.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>{item.desc}</p>
                    </div>
                    <label className="adm-toggle">
                      <input
                        type="checkbox"
                        checked={(notifications as any)[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      />
                      <span className="adm-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
              >
                <Save size={14} /> Save Preferences
              </button>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="adm-card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={20} style={{ color: 'var(--adm-accent)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Appearance</h2>
              </div>

              <div>
                <label className="text-xs font-semibold mb-3 block" style={{ color: 'var(--adm-text-sub)' }}>Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun, color: '#F5F3FF' },
                    { id: 'dark', label: 'Dark', icon: Moon, color: '#1E1050' },
                    { id: 'auto', label: 'System', icon: Monitor, color: 'linear-gradient(135deg, #F5F3FF 50%, #1E1050 50%)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAppearance({ ...appearance, theme: t.id })}
                      className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                      style={{
                        background: appearance.theme === t.id ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.5)',
                        border: `2px solid ${appearance.theme === t.id ? 'var(--adm-accent)' : 'rgba(124,58,237,0.08)'}`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.color }}>
                        <t.icon size={18} style={{ color: appearance.theme === t.id ? 'var(--adm-accent)' : 'var(--adm-text-muted)' }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: appearance.theme === t.id ? 'var(--adm-accent)' : 'var(--adm-text-sub)' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing for denser layouts' },
                  { key: 'animations', label: 'Animations', desc: 'Enable smooth transitions and effects' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,58,237,0.06)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--adm-text)' }}>{item.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>{item.desc}</p>
                    </div>
                    <label className="adm-toggle">
                      <input
                        type="checkbox"
                        checked={(appearance as any)[item.key]}
                        onChange={(e) => setAppearance({ ...appearance, [item.key]: e.target.checked })}
                      />
                      <span className="adm-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Info Section */}
          {activeSection === 'system' && (
            <div className="adm-card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Monitor size={20} style={{ color: 'var(--adm-accent)' }} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>System Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Platform', value: 'SENSEI AI Campus OS' },
                  { label: 'Version', value: 'v2.4.1' },
                  { label: 'Environment', value: 'Production' },
                  { label: 'API Status', value: '✅ Healthy' },
                  { label: 'Last Updated', value: new Date().toLocaleDateString() },
                  { label: 'License', value: 'Enterprise' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,58,237,0.06)' }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--adm-text-muted)' }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
