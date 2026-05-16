'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, BookOpen, Shield, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';


const ROLES = [
  { id: 'student', label: 'STUDENT', Icon: GraduationCap, color: '#00f3ff' },
  { id: 'teacher', label: 'FACULTY',  Icon: BookOpen,      color: '#4ADE80' },
  { id: 'admin',   label: 'ADMIN',    Icon: Shield,        color: '#FFD700' },
] as const;

type RoleId = typeof ROLES[number]['id'];


const DEMOS = [
  { role: 'student' as RoleId, label: 'Student',  email: 'aarav.sharma.cse@sensei.edu', pass: 'student123' },
  { role: 'teacher' as RoleId, label: 'Faculty',  email: 'teacher.cse@sensei.edu',      pass: 'teacher123' },
  { role: 'admin'   as RoleId, label: 'Admin',    email: 'shivam77@gmail.com',           pass: '9082249120' },
];


const PLATFORM_STATS = [
  { value: '12,000+', label: 'Students Enrolled',   color: '#00f3ff' },
  { value: '850+',    label: 'Faculty Members',      color: '#4ADE80' },
  { value: '97%',     label: 'Satisfaction Rate',    color: '#FFD700' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<RoleId>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeRole = ROLES.find(r => r.id === selectedRole)!;
  const roleIndex  = ROLES.findIndex(r => r.id === selectedRole);

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });

      if (data.user.role !== selectedRole) {
        toast.error(`Account is registered as "${data.user.role}", not "${selectedRole}".`);
        setLoading(false);
        return;
      }

      login(data.user, data.accessToken);
      setIsTransitioning(true);

      
      setTimeout(() => setIsTransitioning(false), 8000);

      const routeMap: Record<string, string> = {
        student: '/student',
        teacher: '/teacher',
        admin:   '/admin',
      };
      router.push(routeMap[data.user.role] || '/student');

    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      if (!error.response) {
        toast.error('Network Error. Server might be starting — please try again.');
      } else {
        toast.error(error.response?.data?.error || 'Login failed');
      }
      setLoading(false);
    }
  };

  
  if (isTransitioning) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#03060c', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          <div style={{ position: 'absolute', inset: 0, border: '3px solid transparent', borderTopColor: activeRole.color, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 10, border: '3px solid transparent', borderTopColor: '#FFD700', borderRadius: '50%', animation: 'spin 1.4s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: 20, border: '3px solid transparent', borderTopColor: '#9B51E0', borderRadius: '50%', animation: 'spin 2s linear infinite' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 className="font-cinzel" style={{ color: activeRole.color, fontSize: '1.25rem', letterSpacing: '0.2em', margin: 0 }}>ESTABLISHING UPLINK</h2>
          <p className="font-orbitron" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', letterSpacing: '0.1em', marginTop: '0.5rem' }}>Loading your dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  
  return (
    <div style={{ minHeight: '100vh', background: '#03060c', display: 'flex', fontFamily: "'Raleway', sans-serif", overflow: 'hidden', position: 'relative' }}>

      {}
      {[12,28,48,68,85,94].map((left, i) => (
        <div key={i} style={{ position: 'fixed', left: `${left}%`, bottom: '-10px', width: i % 2 === 0 ? 2 : 3, height: i % 2 === 0 ? 2 : 3, background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#00f3ff' : '#4ADE80', borderRadius: '50%', opacity: 0, pointerEvents: 'none', zIndex: 0, animation: `float-particle ${14 + i * 3}s ${i * 1.8}s linear infinite` }} />
      ))}
      <style>{`
        @keyframes float-particle {
          0%   { transform: translateY(100vh) scale(0); opacity: 0; }
          15%  { opacity: 0.5; }
          85%  { opacity: 0.4; }
          100% { transform: translateY(-120px) scale(1); opacity: 0; }
        }
      `}</style>

      {}
      <div className="hidden lg:flex" style={{ flex: '0 0 58%', position: 'relative', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem 4rem' }}>

        {}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg,#03060c 0%,#060c18 55%,#03060c 100%)' }} />
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, background: 'rgba(0,243,255,0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, background: 'rgba(255,215,0,0.05)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,215,0,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        {}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&w=1400&q=50&fit=crop"
            alt="" aria-hidden style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.07 }} />
        </div>

        {}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#FFD700,#FF7A00)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
              <BookOpen size={21} color="#000" strokeWidth={2.5} />
            </div>
            <span className="font-cinzel" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.15em', color: '#fff' }}>SENSEI</span>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className="font-cinzel" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.4em', color: '#FFD700', display: 'block', marginBottom: '1.25rem' }}>AI-POWERED UNIVERSITY PLATFORM</span>
            <h2 className="font-cinzel" style={{ fontSize: 'clamp(2.2rem,3.5vw,3.5rem)', fontWeight: 900, lineHeight: 1.06, marginBottom: '1.5rem', color: '#fff' }}>
              THE FUTURE OF<br />
              <span style={{ background: 'linear-gradient(135deg,#FFD700 30%,#FF7A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UNIVERSITY</span><br />
              EDUCATION IS HERE
            </h2>
            <p className="font-raleway" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 420, marginBottom: '3rem' }}>
              Join 12,000+ students and 850+ faculty members already learning and teaching smarter with AI.
            </p>
          </motion.div>

          {}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {PLATFORM_STATS.map(({ value, label, color }) => (
              <div key={label} style={{ background: `${color}0e`, border: `1px solid ${color}28`, borderRadius: 12, padding: '0.875rem 1.25rem', backdropFilter: 'blur(12px)' }}>
                <p className="font-cinzel" style={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1, marginBottom: '0.2rem' }}>{value}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.05em' }}>{label}</p>
              </div>
            ))}
          </motion.div>

          {}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }}
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '1.5rem 1.75rem', maxWidth: 480 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: '0.875rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#FFD700" color="#FFD700" />)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1rem' }}>
              &ldquo;Sensei&apos;s AI tutor completely transformed how I study. The adaptive quizzes know exactly where I struggle.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="https://i.pravatar.cc/40?u=priya-login" alt="Priya Sharma"
                style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(255,215,0,0.22)', objectFit: 'cover' }} />
              <div>
                <p className="font-cinzel" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>Priya Sharma</p>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Student, 12th Grade</p>
              </div>
            </div>
          </motion.div>
        </div>

        {}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" className="font-cinzel"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textDecoration: 'none', transition: 'color 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
            ← BACK TO HOME
          </Link>
        </div>
      </div>

      {}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 1, overflowY: 'auto' }}>

        {}
        <div className="lg:hidden" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'rgba(0,243,255,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ width: '100%', maxWidth: 480, position: 'relative' }}>

          {}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#FFD700,#FF7A00)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} color="#000" strokeWidth={2.5} />
                </div>
                <span className="font-cinzel" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.15em', color: '#fff' }}>SENSEI</span>
              </div>
            </Link>
          </div>

          {}
          <div style={{ marginBottom: '2.25rem' }}>
            <h1 className="font-cinzel" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>Welcome back</h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.38)' }}>Sign in to your Sensei workspace</p>
          </div>

          {}
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.5rem', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>

            {}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.01) 0px,rgba(255,255,255,0.01) 1px,transparent 1px,transparent 3px)', pointerEvents: 'none' }} />

            {}
            <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 4, display: 'flex', position: 'relative', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '2.5rem' }}>
              {}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                style={{ position: 'absolute', height: 'calc(100% - 8px)', width: `calc(${100/3}% - 3px)`, background: `${activeRole.color}18`, border: `1px solid ${activeRole.color}45`, borderRadius: 999, top: 4, left: `calc(${roleIndex * (100/3)}% + 2px)`, boxShadow: `0 0 14px ${activeRole.color}20`, zIndex: 1 }}
              />
              {ROLES.map(({ id, label, Icon, color }) => (
                <button key={id} type="button" onClick={() => setSelectedRole(id)}
                  style={{ flex: 1, padding: '0.65rem 0', textAlign: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 999, position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.3s' }}>
                  <Icon size={13} color={selectedRole === id ? color : 'rgba(255,255,255,0.32)'} />
                  <span className="font-orbitron" style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.08em', color: selectedRole === id ? color : 'rgba(255,255,255,0.32)', transition: 'color 0.3s' }}>{label}</span>
                </button>
              ))}
            </div>

            {}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {}
              <div>
                <label className="font-orbitron" style={{ display: 'block', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.6rem', fontWeight: 700 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@institution.edu"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.875rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s', fontFamily: "'Raleway', sans-serif" }}
                    onFocus={e => { e.currentTarget.style.borderColor = activeRole.color+'70'; e.currentTarget.style.boxShadow = `0 0 0 3px ${activeRole.color}12`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    autoComplete="email" />
                </div>
              </div>

              {}
              <div>
                <label className="font-orbitron" style={{ display: 'block', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '0.6rem', fontWeight: 700 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••••••"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.875rem 2.75rem 0.875rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s', fontFamily: "'Raleway', sans-serif", letterSpacing: showPassword ? '0' : '0.25em' }}
                    onFocus={e => { e.currentTarget.style.borderColor = activeRole.color+'70'; e.currentTarget.style.boxShadow = `0 0 0 3px ${activeRole.color}12`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.75rem' }}>
                <a href="#" className="font-orbitron" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = activeRole.color)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>
                  Forgot password?
                </a>
              </div>

              {}
              <motion.button type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                style={{ width: '100%', padding: '1rem 0', background: loading ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${activeRole.color === '#FFD700' ? '#FFD700,#FF7A00' : activeRole.color === '#4ADE80' ? '#4ADE80,#22C55E' : '#00f3ff,#0099cc'})`, color: loading ? 'rgba(255,255,255,0.4)' : activeRole.color === '#FFD700' ? '#000' : '#fff', fontWeight: 900, fontSize: '0.82rem', letterSpacing: '0.2em', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontFamily: "'Orbitron', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: loading ? 'none' : `0 8px 24px ${activeRole.color}30` }}>
                {loading ? (
                  <>
                    <span style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.5)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.2s 0s infinite' }} />
                    <span style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.5)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.2s 0.15s infinite' }} />
                    <span style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.5)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.2s 0.3s infinite' }} />
                  </>
                ) : (
                  <>SIGN IN <ChevronRight size={16} /></>
                )}
              </motion.button>
            </form>

            {}
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-orbitron"
                style={{ color: activeRole.color, textDecoration: 'none', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', transition: 'opacity 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                CREATE ACCOUNT
              </Link>
            </p>
          </div>

          {}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.08))' }} />
              <span className="font-orbitron" style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.25em' }}>DEMO QUICK ACCESS</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,rgba(255,255,255,0.08))' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {DEMOS.map(({ role, label, email: dEmail, pass }) => (
                <button key={role} type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setEmail(dEmail);
                    setPassword(pass);
                    toast.success(`${label} credentials loaded`, { icon: '🚀' });
                  }}
                  style={{ flex: 1, padding: '0.6rem 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.42)', fontSize: '0.6rem', fontFamily: "'Orbitron', sans-serif", fontWeight: 600, cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.25s' }}
                  onMouseEnter={e => { const el = e.currentTarget; const c = ROLES.find(r => r.id === role)!.color; el.style.background = c+'18'; el.style.borderColor = c+'45'; el.style.color = c; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = 'rgba(255,255,255,0.42)'; }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['🔒','SECURE'], ['⚡','2.4MS'], ['✅','STABLE']].map(([icon, text]) => (
              <span key={text} className="font-orbitron" style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.3em' }}>{icon} {text}</span>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.45); }
          50%       { opacity: 0.8; box-shadow: 0 0 0 6px rgba(74,222,128,0); }
        }
      `}</style>
    </div>
  );
}
