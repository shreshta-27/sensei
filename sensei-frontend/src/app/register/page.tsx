'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, GraduationCap, BookOpen, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';

const Starfield = dynamic(() => import('@/components/landing/Starfield'), { ssr: false });
const FloatingObjects = dynamic(() => import('@/components/landing/FloatingObjects'), { ssr: false });

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: '#FFD93D' },
  { id: 'teacher', label: 'Faculty', icon: BookOpen, color: '#4ADE80' },
  { id: 'admin', label: 'Admin', icon: Shield, color: '#00F5FF' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password, role: selectedRole });
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 relative overflow-hidden selection:bg-[#FFD700] selection:text-black font-admin-body">
      {}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Starfield count={1500} />
          <FloatingObjects />
        </Canvas>
        
        {}
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#FFD700] blur-[150px] opacity-10 mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[#FF4500] blur-[140px] opacity-10 mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="p-6 md:p-10 w-full max-w-[480px] relative z-10 m-4 rounded-2xl"
        style={{
          background: 'rgba(255, 215, 0, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 215, 0, 0.20)',
          boxShadow: '0 0 80px rgba(255, 215, 0, 0.08), 0 32px 64px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div className="text-center mb-6 md:mb-8">
          <Link href="/">
            <h1 className="text-4xl md:text-5xl mb-1 cursor-pointer hover:scale-105 transition-transform inline-block tracking-widest font-hero" 
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFF176 50%, #FF8C00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
              SENSEI
            </h1>
          </Link>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#FFD700] font-admin-data">
            Initiate New Identity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 md:mb-8">
          {roles.map((r) => (
            <motion.button
              key={r.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(r.id)}
              className={`relative p-3 rounded-xl border transition-all text-center overflow-hidden flex flex-col items-center justify-center gap-2 ${
                selectedRole === r.id
                  ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'border-white/10 bg-black/20 hover:border-white/30'
              }`}
              style={{ borderColor: selectedRole === r.id ? r.color : 'rgba(255,255,255,0.1)' }}
            >
              {selectedRole === r.id && (
                <motion.div
                  layoutId="role-glow-reg"
                  className="absolute inset-0 rounded-xl blur-md opacity-20"
                  style={{ background: r.color }}
                />
              )}
              <r.icon size={24} color={selectedRole === r.id ? r.color : '#8B9BB4'} className="relative z-10 transition-colors" />
              <span className="text-[10px] uppercase tracking-widest font-bold relative z-10" 
                    style={{ color: selectedRole === r.id ? '#FFF' : '#8B9BB4' }}>
                {r.label}
              </span>
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#FFD700]/70 mb-2 font-bold font-admin-label">Full Name</label>
            <div className="relative">
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all font-admin-data text-sm pl-10 placeholder-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 215, 0, 0.15)',
                  boxShadow: 'inset 0 0 10px rgba(255,215,0,0.02)'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.15)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(255,215,0,0.02)'; }}
                placeholder="Arjun Sharma"
              />
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700]/50" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#FFD700]/70 mb-2 font-bold font-admin-label">Email Address</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all font-admin-data text-sm placeholder-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 215, 0, 0.15)',
                boxShadow: 'inset 0 0 10px rgba(255,215,0,0.02)'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.15)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(255,215,0,0.02)'; }}
              placeholder="user@sensei.edu"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#FFD700]/70 mb-2 font-bold font-admin-label">Passcode</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all font-admin-data text-sm pr-12 placeholder-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 215, 0, 0.15)',
                  boxShadow: 'inset 0 0 10px rgba(255,215,0,0.02)'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.15)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(255,215,0,0.02)'; }}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFD700]/50 hover:text-[#FFD700] transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-4 bg-[#FFD700] hover:bg-[#FF4500] text-[#050508] hover:text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-transparent font-admin-label`}
            style={{ letterSpacing: '0.1em' }}
          >
            {loading ? (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            ) : (
              <>
                <span className="text-sm tracking-[0.2em] uppercase">Establish Link</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
          
          <div className="text-center mt-6">
            <Link href="/login" className="text-xs font-admin-label tracking-widest uppercase text-[#A09080] hover:text-[#FFD700] transition-colors border-b border-transparent hover:border-[#FFD700] pb-1">
              Already have an identity? Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
