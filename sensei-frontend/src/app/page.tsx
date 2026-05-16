'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  Brain,
  BookOpen,
  Users,
  GraduationCap,
  Target,
  TrendingUp,
  Zap,
  ChevronRight,
  BarChart3,
  Shield,
  Menu,
  X,
  Play,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';


const PURPLE = '#7B4FE9';
const PURPLE_DARK = '#5B35C4';
const NAVY = '#1A1A2E';
const CREAM = '#F5EFE8';


function AnimatedCounter({
  target,
  suffix = '',
  isStatic = false,
}: {
  target: number;
  suffix?: string;
  isStatic?: boolean;
}) {
  const [count, setCount] = useState(isStatic ? target : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (isStatic) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const frames = 120;
          const inc = target / frames;
          let cur = 0;
          const t = setInterval(() => {
            cur += inc;
            if (cur >= target) {
              setCount(target);
              clearInterval(t);
            } else {
              setCount(Math.floor(cur));
            }
          }, 16);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, isStatic]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}


function StickyNote({
  color,
  rotate = 0,
  children,
  style,
}: {
  color: string;
  rotate?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 14,
        padding: '1.25rem',
        position: 'relative',
        transform: `rotate(${rotate}deg)`,
        border: '1.5px solid rgba(0,0,0,0.07)',
        boxShadow: '3px 4px 0px rgba(0,0,0,0.09)',
        ...style,
      }}
    >
      {}
      <div
        style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 42,
          height: 14,
          background: 'rgba(210,200,180,0.65)',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.07)',
        }}
      />
      {children}
    </div>
  );
}


function FloatingLabel({
  label,
  color,
  posStyle,
  delay = 0,
  rotate = 0,
}: {
  label: string;
  color: string;
  posStyle: React.CSSProperties;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={posStyle}
      initial={{ opacity: 0, scale: 0.7, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 2.8 + delay * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay * 0.4,
        }}
      >
        <StickyNote color={color} rotate={rotate} style={{ minWidth: 76, textAlign: 'center', padding: '0.6rem 0.875rem' }}>
          <p
            style={{
              fontWeight: 800,
              fontSize: '0.58rem',
              color: NAVY,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: "'Raleway', sans-serif",
              margin: 0,
            }}
          >
            {label}
          </p>
        </StickyNote>
      </motion.div>
    </motion.div>
  );
}


function DoodleStar({ style }: { style?: React.CSSProperties }) {
  return (
    <motion.span
      animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        fontSize: '1.1rem',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      ✦
    </motion.span>
  );
}


export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  
  const navLinks = ['Home', 'Features', 'Solutions', 'About Us', 'Pricing', 'Contact'];

  const stats = [
    { value: 10, suffix: 'K+', label: 'Students Impacted' },
    { value: 500, suffix: '+', label: 'Courses Analyzed' },
    { value: 95, suffix: '%', label: 'Early Risk Detection' },
    { value: 24, suffix: '/7', label: 'AI Monitoring', isStatic: true },
  ];

  const howSteps = [
    {
      color: '#E8D5FF',
      icon: BarChart3,
      iconColor: '#7B4FE9',
      title: 'Collect',
      desc: 'Real-time data from across campus systems.',
    },
    {
      color: '#FFF9C4',
      icon: Brain,
      iconColor: '#F57F17',
      title: 'Analyze',
      desc: 'AI agents detect patterns & predict outcomes.',
    },
    {
      color: '#FFCDD2',
      icon: Target,
      iconColor: '#C62828',
      title: 'Intervene',
      desc: 'Smart actions triggered at the right time.',
    },
    {
      color: '#C8E6C9',
      icon: TrendingUp,
      iconColor: '#2E7D32',
      title: 'Empower',
      desc: 'Better decisions. Healthier students. Smarter campuses.',
    },
  ];

  const platforms = [
    {
      icon: GraduationCap,
      iconColor: PURPLE,
      accentColor: '#E8D5FF',
      title: 'STUDENT DASHBOARD',
      tagline: 'Learn smarter. Stay ahead. ☆',
      stats: [
        { label: "Today's Progress", value: '78%' },
        { label: 'Upcoming Tasks', value: '3' },
        { label: 'Focus Score', value: '92%' },
      ],
    },
    {
      icon: BookOpen,
      iconColor: '#0097A7',
      accentColor: '#B2EBF2',
      title: 'FACULTY WORKSPACE',
      tagline: 'Teach better. Impact more. ♡',
      stats: [
        { label: 'Class Pulse', value: 'Active' },
        { label: 'At Risk Students', value: '18' },
        { label: 'Interventions', value: '5' },
      ],
    },
    {
      icon: Shield,
      iconColor: '#2E7D32',
      accentColor: '#C8E6C9',
      title: 'ADMIN COMMAND CENTER',
      tagline: 'Decide faster. Lead better. 👑',
      stats: [
        { label: 'Total Students', value: '9,842' },
        { label: 'System Health', value: '92%' },
        { label: 'Active Alerts', value: '23' },
      ],
    },
  ];

  const features = [
    {
      color: '#FFCDD2',
      icon: Zap,
      iconColor: '#C62828',
      title: 'Early Risk Detection',
      desc: 'AI predicts issues before they become problems.',
    },
    {
      color: '#FFF9C4',
      icon: Target,
      iconColor: '#F57F17',
      title: 'Smart Interventions',
      desc: 'Automated, personalized actions at the right time.',
    },
    {
      color: '#C8E6C9',
      icon: BarChart3,
      iconColor: '#2E7D32',
      title: 'Real-time Insights',
      desc: 'Live analytics for every decision you make.',
    },
    {
      color: '#BBDEFB',
      icon: Users,
      iconColor: '#1565C0',
      title: 'Student Success',
      desc: 'Better outcomes through data-driven care.',
    },
    {
      color: '#E8D5FF',
      icon: Shield,
      iconColor: '#6A1B9A',
      title: 'Unified Ecosystem',
      desc: 'All systems. One platform. Infinite impact.',
    },
  ];

  const roleCards = [
    {
      icon: GraduationCap,
      color: PURPLE,
      bg: '#F0E8FF',
      title: 'For Students',
      desc: 'An AI that adapts to how you think and grows with you.',
      features: [
        'Adaptive AI Assessments',
        'Focus Guardian',
        'Career Simulator',
        'Vision Summarizer',
        '24/7 AI Study Tutor',
        'Progress Analytics',
      ],
    },
    {
      icon: BookOpen,
      color: '#0097A7',
      bg: '#E0F7FA',
      title: 'For Faculty',
      desc: 'Intelligent tools that save time so you focus on students.',
      features: [
        'AI-Powered Grading',
        'Class Analytics',
        'Intervention Alerts',
        'Smart Assignment Builder',
        'Resource Planner',
        'Poll & Quiz Creator',
      ],
    },
    {
      icon: Shield,
      color: '#2E7D32',
      bg: '#E8F5E9',
      title: 'For Admins',
      desc: 'System-wide analytics and AI-powered risk insights.',
      features: [
        'University Dashboard',
        'Dropout Risk Prediction',
        'Performance Analytics',
        'Intervention Management',
        'Department Reports',
      ],
    },
  ];

  
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
  };
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  
  return (
    <div
      style={{
        background: CREAM,
        color: NAVY,
        overflowX: 'hidden',
        fontFamily: "'Raleway', sans-serif",
      }}
    >
      {}
      <motion.div
        style={{
          scaleX: progressScaleX,
          transformOrigin: '0%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg,${PURPLE},#00BCD4,#4CAF50)`,
          zIndex: 2000,
        }}
      />

      {}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          background: scrolled
            ? 'rgba(255,255,255,0.97)'
            : 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(18px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
          padding: scrolled ? '0.65rem 0' : '1.1rem 0',
          transition: 'all 0.35s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.07, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg,${PURPLE},${PURPLE_DARK})`,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(123,79,233,0.32)',
              }}
            >
              <Brain size={20} color="#fff" />
            </motion.div>
            <div>
              <p
                className="font-cinzel"
                style={{
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  letterSpacing: '0.1em',
                  color: NAVY,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                SENSEI
              </p>
              <p
                style={{
                  fontSize: '0.46rem',
                  letterSpacing: '0.24em',
                  color: PURPLE,
                  fontWeight: 700,
                  margin: 0,
                  marginTop: 2,
                }}
              >
                AI CAMPUS OS
              </p>
            </div>
          </Link>

          {}
          <div
            className="hidden lg:flex"
            style={{ alignItems: 'center', gap: '2.25rem' }}
          >
            {navLinks.map((link, i) => (
              <a
                key={link}
                href={`#section-${link.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? PURPLE : '#444',
                  textDecoration: i === 0 ? 'underline' : 'none',
                  textUnderlineOffset: 4,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = PURPLE)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    i === 0 ? PURPLE : '#444')
                }
              >
                {link}
              </a>
            ))}
          </div>

          {}
          <div className="hidden lg:flex">
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.35rem',
                background: `linear-gradient(135deg,${PURPLE},${PURPLE_DARK})`,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: 10,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(123,79,233,0.32)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 8px 24px rgba(123,79,233,0.48)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 4px 14px rgba(123,79,233,0.32)';
              }}
            >
              Request Demo <ArrowRight size={14} />
            </Link>
          </div>

          {}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: NAVY,
              padding: '0.25rem',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: '#fff',
                borderTop: '1px solid rgba(0,0,0,0.07)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href={`#section-${link.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: NAVY,
                      textDecoration: 'none',
                    }}
                  >
                    {link}
                  </a>
                ))}
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.85rem',
                    background: PURPLE,
                    color: '#fff',
                    textAlign: 'center',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  Request Demo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {}
      <section
        id="section-home"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 80,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(145deg,#F5EFE8 0%,#EDE0F8 45%,#F5EFE8 100%)',
        }}
      >
        {}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'radial-gradient(circle, rgba(123,79,233,0.07) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        {}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '-8%',
            width: 420,
            height: 420,
            background: 'rgba(123,79,233,0.07)',
            borderRadius: '50%',
            filter: 'blur(90px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '-8%',
            width: 360,
            height: 360,
            background: 'rgba(76,175,80,0.07)',
            borderRadius: '50%',
            filter: 'blur(90px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '5rem 1.5rem',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {}
              <motion.div variants={fadeUp} style={{ marginBottom: '1.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(123,79,233,0.1)',
                    border: '1px solid rgba(123,79,233,0.25)',
                    borderRadius: 999,
                    padding: '0.4rem 1rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    color: PURPLE,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      background: '#4CAF50',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                  AI-POWERED UNIVERSITY PLATFORM
                </span>
              </motion.div>

              {}
              <motion.h1
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: NAVY,
                  marginBottom: '1.25rem',
                  fontFamily: "'Raleway', sans-serif",
                }}
              >
                The{' '}
                <span
                  style={{
                    display: 'inline-block',
                    position: 'relative',
                    color: PURPLE,
                    fontStyle: 'italic',
                  }}
                >
                  AI
                  <motion.svg
                    viewBox="0 0 52 34"
                    style={{
                      position: 'absolute',
                      left: -10,
                      top: -8,
                      width: 'calc(100% + 20px)',
                      height: 'calc(100% + 18px)',
                      overflow: 'visible',
                    }}
                    fill="none"
                  >
                    <motion.ellipse
                      cx="26"
                      cy="17"
                      rx="24"
                      ry="15"
                      stroke={PURPLE}
                      strokeWidth="2.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.6 }}
                    />
                  </motion.svg>
                </span>{' '}
                Operating
                <br />
                System for
                <br />
                <span style={{ color: PURPLE }}>Modern Campuses</span>
              </motion.h1>

              {}
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  marginBottom: '0.875rem',
                  letterSpacing: '0.02em',
                }}
              >
                <span style={{ color: NAVY }}>Predict. </span>
                <span
                  style={{
                    color: PURPLE,
                    textDecoration: 'underline',
                    textUnderlineOffset: 4,
                  }}
                >
                  Intervene.{' '}
                </span>
                <span style={{ color: '#4CAF50' }}>Empower.</span>
              </motion.p>

              {}
              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: '0.95rem',
                  color: '#666',
                  lineHeight: 1.85,
                  maxWidth: 460,
                  marginBottom: '2.25rem',
                }}
              >
                Sensei unifies students, faculty, and administrators in one
                intelligent ecosystem to drive success &amp; excellence.
              </motion.p>

              {}
              <motion.div
                variants={fadeUp}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
              >
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.9rem 1.8rem',
                    background: `linear-gradient(135deg,${PURPLE},${PURPLE_DARK})`,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderRadius: 12,
                    textDecoration: 'none',
                    boxShadow: '0 6px 22px rgba(123,79,233,0.38)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-3px)';
                    el.style.boxShadow = '0 12px 34px rgba(123,79,233,0.52)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = '0 6px 22px rgba(123,79,233,0.38)';
                  }}
                >
                  Explore Platform <ArrowRight size={16} />
                </Link>

                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.9rem 1.6rem',
                    background: 'rgba(255,255,255,0.85)',
                    color: NAVY,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderRadius: 12,
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = '#fff';
                    el.style.borderColor = 'rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = 'rgba(255,255,255,0.85)';
                    el.style.borderColor = 'rgba(0,0,0,0.1)';
                  }}
                >
                  <Play size={15} fill="currentColor" /> Watch Demo
                </button>
              </motion.div>
            </motion.div>

            {}
            <div
              className="hidden lg:block"
              style={{ position: 'relative', height: 520 }}
            >
              {}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -52%)',
                }}
              >
                <div style={{ position: 'relative', width: 270, height: 270 }}>
                  {}
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      inset: -18,
                      background:
                        'radial-gradient(circle, rgba(123,79,233,0.12), transparent 70%)',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  />

                  {}
                  <motion.div
                    animate={{
                      scale: [1, 1.12, 1],
                      boxShadow: [
                        '0 0 32px rgba(123,79,233,0.65), 0 0 60px rgba(123,79,233,0.25)',
                        '0 0 55px rgba(123,79,233,0.9), 0 0 90px rgba(123,79,233,0.4)',
                        '0 0 32px rgba(123,79,233,0.65), 0 0 60px rgba(123,79,233,0.25)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      top: -36,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 74,
                      height: 74,
                      background: `radial-gradient(circle, ${PURPLE}, ${PURPLE_DARK})`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    <Brain size={34} color="#fff" />
                  </motion.div>

                  {}
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&w=400&q=80"
                    alt="University campus"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 24,
                      border: '3px solid rgba(255,255,255,0.92)',
                      boxShadow: '0 24px 60px rgba(123,79,233,0.18)',
                    }}
                  />
                  {}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 24,
                      background:
                        'linear-gradient(to bottom,rgba(123,79,233,0.12) 0%,transparent 50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </motion.div>

              {}
              <FloatingLabel
                label="STUDENTS"
                color="#E8D5FF"
                posStyle={{ top: '5%', left: '0%' }}
                rotate={-5}
                delay={0.2}
              />
              <FloatingLabel
                label="FACULTY"
                color="#FFF9C4"
                posStyle={{ top: '3%', right: '6%' }}
                rotate={6}
                delay={0.35}
              />
              <FloatingLabel
                label="AI POWERED"
                color="#C8E6C9"
                posStyle={{ top: '18%', right: '-3%' }}
                rotate={-3}
                delay={0.5}
              />
              <FloatingLabel
                label="ANALYTICS"
                color="#FFF9C4"
                posStyle={{ top: '46%', left: '-5%' }}
                rotate={4}
                delay={0.28}
              />
              <FloatingLabel
                label="WELLNESS"
                color="#FFCDD2"
                posStyle={{ bottom: '22%', left: '0%' }}
                rotate={-6}
                delay={0.44}
              />
              <FloatingLabel
                label="ADMIN"
                color="#C8E6C9"
                posStyle={{ bottom: '20%', right: '3%' }}
                rotate={5}
                delay={0.6}
              />
              <FloatingLabel
                label="INTERVENTIONS"
                color="#FFCDD2"
                posStyle={{ bottom: '5%', right: '14%' }}
                rotate={-4}
                delay={0.72}
              />

              {}
              <DoodleStar style={{ top: '12%', right: '30%', color: PURPLE, opacity: 0.5, fontSize: '1.3rem' }} />
              <DoodleStar style={{ bottom: '22%', left: '18%', color: '#4CAF50', opacity: 0.5, fontSize: '1rem' }} />
              <DoodleStar style={{ top: '38%', right: '2%', color: '#F57F17', opacity: 0.6, fontSize: '0.9rem' }} />
            </div>
          </div>
        </div>

        {}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 1440 64"
            fill="none"
            preserveAspectRatio="none"
            style={{ display: 'block', height: 64, width: '100%' }}
          >
            <path
              d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z"
              fill="#FFFCF4"
            />
          </svg>
        </div>
      </section>

      {}
      <section
        id="section-features"
        style={{
          background: '#FFFCF4',
          borderTop: '2px dashed rgba(0,0,0,0.07)',
          borderBottom: '2px dashed rgba(0,0,0,0.07)',
          padding: '2.75rem 1.5rem',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.5rem',
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        >
          ☆
        </span>
        <span
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.2rem',
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        >
          😊
        </span>

        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}
        >
          {stats.map(({ value, suffix, label, isStatic }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <p
                className="font-cinzel"
                style={{
                  fontSize: 'clamp(2rem,5vw,3rem)',
                  fontWeight: 900,
                  color: PURPLE,
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter
                  target={value}
                  suffix={suffix}
                  isStatic={isStatic}
                />
              </p>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#666',
                  marginTop: '0.4rem',
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {}
      <section
        style={{
          background: '#111111',
          padding: '5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.02,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="grid xl:grid-cols-[1fr_300px] gap-10 items-start">
            {}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '3rem',
                  letterSpacing: '0.07em',
                  fontFamily: "'Raleway', sans-serif",
                }}
              >
                HOW SENSEI WORKS
              </motion.h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
                  gap: '1.5rem',
                  position: 'relative',
                }}
              >
                {}
                <div
                  className="hidden lg:block"
                  style={{
                    position: 'absolute',
                    top: '5.5rem',
                    left: '12%',
                    right: '12%',
                    height: 1,
                    background: 'rgba(255,255,255,0.12)',
                    zIndex: 0,
                  }}
                />

                {howSteps.map(
                  ({ color, icon: Icon, iconColor, title, desc }, idx) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 32 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15, duration: 0.55 }}
                      style={{ position: 'relative', zIndex: 1 }}
                    >
                      <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.25 }}
                      >
                        <StickyNote
                          color={color}
                          rotate={idx % 2 === 0 ? -2 : 2}
                          style={{ padding: '1.4rem' }}
                        >
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              background: 'rgba(0,0,0,0.1)',
                              borderRadius: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '0.875rem',
                            }}
                          >
                            <Icon size={22} color={iconColor} />
                          </div>
                          <h3
                            style={{
                              fontWeight: 800,
                              fontSize: '1.05rem',
                              color: NAVY,
                              marginBottom: '0.45rem',
                            }}
                          >
                            {title}
                          </h3>
                          <p
                            style={{
                              fontSize: '0.78rem',
                              color: '#444',
                              lineHeight: 1.65,
                            }}
                          >
                            {desc}
                          </p>
                        </StickyNote>
                      </motion.div>
                      {idx < 3 && (
                        <div
                          className="hidden lg:flex"
                          style={{
                            position: 'absolute',
                            right: -18,
                            top: '5.2rem',
                            zIndex: 10,
                            alignItems: 'center',
                          }}
                        >
                          <ChevronRight
                            size={22}
                            color="rgba(255,255,255,0.32)"
                          />
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </div>

              {}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '1.75rem',
                }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    fontSize: '2rem',
                    color: 'rgba(255,255,255,0.22)',
                    display: 'inline-block',
                  }}
                >
                  ↻
                </motion.span>
              </motion.div>
            </div>

            {}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              style={{
                background: '#fff',
                borderRadius: 18,
                padding: '1.5rem',
                boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                alignSelf: 'start',
                marginTop: '5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    background: '#4CAF50',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'pulse-dot 2s infinite',
                  }}
                />
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    letterSpacing: '0.2em',
                    color: NAVY,
                    margin: 0,
                  }}
                >
                  LIVE AI INSIGHT
                </p>
              </div>

              <div
                style={{
                  paddingBottom: '0.875rem',
                  marginBottom: '0.875rem',
                  borderBottom: `2px solid ${PURPLE}`,
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: NAVY,
                    marginBottom: '0.25rem',
                  }}
                >
                  Dropout Risk Detected
                </p>
                <p style={{ fontSize: '0.78rem', color: '#555' }}>
                  3 Students
                </p>
                <p style={{ fontSize: '0.78rem', color: '#555' }}>
                  B.Tech CSE 2nd Year
                </p>
              </div>

              {}
              <svg
                viewBox="0 0 200 72"
                style={{ width: '100%', height: 54, marginBottom: '0.75rem' }}
              >
                <defs>
                  <linearGradient
                    id="chartGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgba(229,57,53,0.28)"
                    />
                    <stop
                      offset="100%"
                      stopColor="rgba(229,57,53,0)"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 62 L 40 48 L 80 54 L 120 26 L 160 38 L 200 16 L 200 72 L 0 72 Z"
                  fill="url(#chartGrad)"
                />
                <polyline
                  points="0,62 40,48 80,54 120,26 160,38 200,16"
                  fill="none"
                  stroke="#E53935"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: `1.5px solid ${NAVY}`,
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                  color: NAVY,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = NAVY;
                  el.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'transparent';
                  el.style.color = NAVY;
                }}
              >
                View Insight <ArrowRight size={12} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {}
      <section
        id="section-solutions"
        style={{ background: CREAM, padding: '5rem 1.5rem' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 900,
                color: NAVY,
                letterSpacing: '0.03em',
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              ONE PLATFORM.{' '}
              <span style={{ color: PURPLE }}>EVERYONE</span>{' '}
              EMPOWERED.
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {platforms.map(
              (
                { icon: Icon, iconColor, accentColor, title, tagline, stats: pStats },
                idx
              ) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  style={{
                    background: '#fff',
                    border: '1.5px solid rgba(0,0,0,0.06)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.07)',
                    transition: 'box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 20px 50px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      '0 6px 24px rgba(0,0,0,0.07)';
                  }}
                >
                  {}
                  <div
                    style={{
                      padding: '1.1rem 1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      borderBottom: `1.5px solid ${accentColor}`,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        background: accentColor,
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={17} color={iconColor} />
                    </div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '0.1em',
                        color: NAVY,
                        margin: 0,
                      }}
                    >
                      {title}
                    </p>
                  </div>

                  {}
                  <div
                    style={{
                      padding: '1.25rem',
                      background: `${accentColor}22`,
                    }}
                  >
                    <div
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: '0.875rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        minHeight: 140,
                      }}
                    >
                      {pStats.map(({ label, value: v }, si) => (
                        <div
                          key={label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.45rem 0',
                            borderBottom:
                              si < pStats.length - 1
                                ? '1px solid #F5F5F5'
                                : 'none',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '0.72rem',
                              color: '#888',
                              margin: 0,
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: 800,
                              color: iconColor,
                              margin: 0,
                            }}
                          >
                            {v}
                          </p>
                        </div>
                      ))}
                      {}
                      <div
                        style={{
                          marginTop: '0.75rem',
                          height: 6,
                          background: '#F0F0F0',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '72%' }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.2,
                            delay: idx * 0.2 + 0.4,
                          }}
                          style={{
                            height: '100%',
                            background: `linear-gradient(90deg,${iconColor},${accentColor})`,
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {}
                  <div
                    style={{
                      padding: '0.875rem 1.4rem',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#666',
                        fontWeight: 500,
                      }}
                    >
                      {tagline}
                    </p>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {}
      <section
        id="section-about-us"
        style={{
          background: '#FAF6FF',
          padding: '5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 300,
            background: 'rgba(123,79,233,0.04)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.4em',
                color: PURPLE,
                marginBottom: '0.875rem',
                textTransform: 'uppercase',
              }}
            >
              WHO IS SENSEI FOR?
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 900,
                color: NAVY,
                fontFamily: "'Raleway', sans-serif",
              }}
            >
              ONE PLATFORM.{' '}
              <span style={{ color: PURPLE }}>THREE EXPERIENCES.</span>
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {roleCards.map(
              ({ icon: Icon, color, bg, title, desc, features: roleFeatures }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  style={{
                    background: bg,
                    border: `1.5px solid ${color}28`,
                    borderRadius: 22,
                    padding: '2.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${color}55`;
                    el.style.boxShadow = `0 20px 50px ${color}18`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${color}28`;
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      right: -30,
                      width: 100,
                      height: 100,
                      background: `${color}10`,
                      borderRadius: '50%',
                      filter: 'blur(20px)',
                    }}
                  />
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      background: `${color}20`,
                      border: `1.5px solid ${color}35`,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={26} color={color} />
                  </div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      marginBottom: '0.65rem',
                      color: NAVY,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.87rem',
                      color: '#555',
                      lineHeight: 1.7,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {desc}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      marginBottom: '1.75rem',
                    }}
                  >
                    {roleFeatures.map((f) => (
                      <div
                        key={f}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          color={color}
                          strokeWidth={2.5}
                          style={{ flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: '0.83rem',
                            color: '#444',
                          }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 1.35rem',
                      background: `${color}18`,
                      border: `1.5px solid ${color}35`,
                      borderRadius: 10,
                      color,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textDecoration: 'none',
                      transition: 'all 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = `${color}30`;
                      el.style.borderColor = `${color}60`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = `${color}18`;
                      el.style.borderColor = `${color}35`;
                    }}
                  >
                    Get Started <ChevronRight size={13} />
                  </Link>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {}
      <section
        id="section-pricing"
        style={{
          background: CREAM,
          padding: '5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 18,
            color: PURPLE,
            fontSize: '2.2rem',
            opacity: 0.25,
            transform: 'rotate(-20deg)',
            pointerEvents: 'none',
          }}
        >
          →
        </div>
        <DoodleStar
          style={{
            bottom: 28,
            right: 32,
            color: '#4CAF50',
            opacity: 0.25,
            fontSize: '1.4rem',
          }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ marginBottom: '3rem' }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                fontWeight: 900,
                color: NAVY,
                letterSpacing: '0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  color: PURPLE,
                  fontSize: '1.4em',
                  lineHeight: 1,
                }}
              >
                →
              </span>
              SMART FEATURES. REAL IMPACT.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {features.map(
              ({ color, icon: Icon, iconColor, title, desc }, idx) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  whileHover={{ y: -8, rotate: 0 }}
                  style={{ transition: 'transform 0.3s' }}
                >
                  <StickyNote
                    color={color}
                    rotate={
                      idx === 0 ? -2 : idx === 1 ? 1.5 : idx === 2 ? 0 : idx === 3 ? -1.5 : 2
                    }
                    style={{ height: '100%', padding: '1.4rem' }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        background: 'rgba(0,0,0,0.08)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.875rem',
                      }}
                    >
                      <Icon size={22} color={iconColor} />
                    </div>
                    <h3
                      style={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        marginBottom: '0.5rem',
                        color: NAVY,
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.76rem',
                        color: '#555',
                        lineHeight: 1.65,
                      }}
                    >
                      {desc}
                    </p>
                  </StickyNote>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {}
      <section
        style={{
          background: '#FAF6FF',
          padding: '5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.4em',
                color: PURPLE,
                marginBottom: '0.875rem',
                textTransform: 'uppercase',
              }}
            >
              GUIDED BY TRUE INTELLIGENCE
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 900,
                color: NAVY,
                fontFamily: "'Raleway', sans-serif",
                marginBottom: '1rem',
              }}
            >
              Meet Your Personal{' '}
              <span style={{ color: PURPLE }}>AI Sensei</span>
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: '#666',
                maxWidth: 520,
                margin: '0 auto',
                lineHeight: 1.8,
              }}
            >
              Not just a chatbot — a dedicated academic mentor that adopts the
              persona of legendary educators, available 24/7 for every student.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                value: 2100000,
                suffix: '+',
                label: 'AI Sessions',
                sub: 'Logged this month',
                color: PURPLE,
              },
              {
                value: 23,
                suffix: '%',
                label: 'Avg Grade Lift',
                sub: 'After 30 days of usage',
                color: '#2E7D32',
              },
              {
                value: 97,
                suffix: '%',
                label: 'Satisfaction Rate',
                sub: 'Among enrolled students & faculty',
                color: '#F57F17',
              },
            ].map(({ value, suffix, label, sub, color }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.55 }}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '2rem',
                  textAlign: 'center',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                  border: `1.5px solid ${color}22`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                whileHover={{
                  y: -6,
                  boxShadow: `0 20px 50px ${color}18`,
                }}
              >
                <p
                  className="font-cinzel"
                  style={{
                    fontSize: 'clamp(2rem,4vw,2.8rem)',
                    fontWeight: 900,
                    color,
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  <AnimatedCounter target={value} suffix={suffix} />
                </p>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: NAVY,
                    marginBottom: '0.25rem',
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: '0.76rem', color: '#888' }}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section
        id="section-contact"
        style={{
          background:
            'linear-gradient(135deg,#150D2B 0%,#1E1140 50%,#150D2B 100%)',
          padding: '5.5rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {}
        {[
          { l: '12%', t: '18px', c: '#FFD700' },
          { l: '22%', t: '44px', c: '#7B4FE9' },
          { l: '80%', t: '28px', c: '#FFD700' },
          { l: '88%', t: '54px', c: '#4CAF50' },
          { l: '50%', t: '12px', c: '#fff' },
          { l: '35%', t: '80%', c: '#FFD700' },
          { l: '65%', t: '85%', c: '#7B4FE9' },
        ].map((s, i) => (
          <motion.span
            key={i}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
            style={{
              position: 'absolute',
              left: s.l,
              top: s.t,
              color: s.c,
              fontSize: '0.85rem',
              pointerEvents: 'none',
            }}
          >
            ★
          </motion.span>
        ))}

        {}
        <motion.div
          animate={{ rotate: [0, 5, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '12%',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        >
          <GraduationCap size={80} color="#fff" strokeWidth={1} />
        </motion.div>

        {}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '20%',
            fontSize: '2.5rem',
            color: '#FFD700',
            opacity: 0.32,
            transform: 'rotate(25deg)',
            pointerEvents: 'none',
          }}
        >
          📎
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px),1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: -30, rotate: -10 }}
              whileInView={{ opacity: 1, x: 0, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <StickyNote color="#FFF9C4" rotate={-6}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    color: NAVY,
                    lineHeight: 1.6,
                  }}
                >
                  The future
                  <br />
                  of education
                  <br />
                  is intelligent.
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '1.4rem' }}>😊</p>
              </StickyNote>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 4vw, 2.9rem)',
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1.35,
                  marginBottom: '0.875rem',
                  fontFamily: "'Raleway', sans-serif",
                }}
              >
                Ready to{' '}
                <em style={{ color: '#A78BFA', fontStyle: 'italic' }}>
                  transform
                </em>{' '}
                your campus
                <br />
                with the power of{' '}
                <span style={{ color: '#A78BFA' }}>AI</span>?
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.52)',
                  fontSize: '0.92rem',
                  marginBottom: '2rem',
                }}
              >
                Join the future of intelligent education.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.9rem 1.8rem',
                    background: `linear-gradient(135deg,${PURPLE},${PURPLE_DARK})`,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderRadius: 12,
                    textDecoration: 'none',
                    boxShadow: '0 6px 24px rgba(123,79,233,0.48)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-3px)';
                    el.style.boxShadow = '0 12px 36px rgba(123,79,233,0.65)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = '0 6px 24px rgba(123,79,233,0.48)';
                  }}
                >
                  Request Demo <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.9rem 1.75rem',
                    background: 'transparent',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderRadius: 12,
                    textDecoration: 'none',
                    border: '2px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(255,255,255,0.65)';
                    el.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(255,255,255,0.3)';
                    el.style.background = 'transparent';
                  }}
                >
                  Contact Sales <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 30, rotate: 8 }}
              whileInView={{ opacity: 1, x: 0, rotate: 5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div
                style={{
                  background: CREAM,
                  borderRadius: 8,
                  padding: '1.5rem 1.75rem',
                  transform: 'rotate(5deg)',
                  boxShadow: '0 10px 32px rgba(0,0,0,0.38)',
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: NAVY,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  Empower today.
                  <br />
                  Excel tomorrow.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {}
      <footer
        style={{
          background: '#0D0820',
          padding: '3.5rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '2.5rem',
              marginBottom: '2.5rem',
            }}
          >
            {}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  marginBottom: '0.875rem',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: PURPLE,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Brain size={15} color="#fff" />
                </div>
                <span
                  className="font-cinzel"
                  style={{
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    letterSpacing: '0.1em',
                    color: '#fff',
                  }}
                >
                  SENSEI
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.28)',
                  lineHeight: 1.72,
                  maxWidth: 200,
                }}
              >
                AI-powered adaptive learning for the next generation of
                universities.
              </p>
            </div>

            {}
            {[
              {
                heading: 'PLATFORM',
                links: ['Features', 'For Students', 'For Faculty', 'AI Sensei'],
              },
              {
                heading: 'INSTITUTION',
                links: ['Pricing', 'Case Studies', 'API Access', 'Security'],
              },
              {
                heading: 'COMPANY',
                links: ['About Us', 'Blog', 'Careers', 'Contact'],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    color: 'rgba(255,255,255,0.18)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {heading}
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.28)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = PURPLE)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')
                      }
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.875rem',
            }}
          >
            <p
              style={{
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.12)',
                letterSpacing: '0.1em',
              }}
            >
              © 2025 SENSEI ACADEMY. ALL RIGHTS RESERVED.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: '0.68rem',
                    color: 'rgba(255,255,255,0.18)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')
                  }
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
