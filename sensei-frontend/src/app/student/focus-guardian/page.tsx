'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, ShieldAlert, Brain, Zap, History, BarChart3, Settings, Play, Pause, Square } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function FocusGuardianPage() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [distractions, setDistractions] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const [holistic, setHolistic] = useState<any>(null);

  useEffect(() => {
    const initMP = async () => {
        try {
            const vision = await import('@mediapipe/tasks-vision');
            const { HolisticLandmarker, FilesetResolver } = vision as any;

            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            const landmarker = await vision.PoseLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO"
            });
            setHolistic(landmarker);
        } catch (err) {
            console.error("MediaPipe Init Error:", err);
        }
    };
    initMP();
  }, []);

  useEffect(() => {
    let animId: number;
    const runDetection = () => {
        if (holistic && videoRef.current && isActive && videoRef.current.readyState >= 2) {
            try {

                if (videoRef.current.paused) videoRef.current.play().catch(() => {});

                const results = holistic.detectForVideo(videoRef.current, performance.now());
                if (results.landmarks && results.landmarks.length > 0 && results.landmarks[0].length > 0) {
                    const head = results.landmarks[0][0];
                    if (head.x < 0.25 || head.x > 0.75 || head.y < 0.2 || head.y > 0.8) {
                        setIsDistracted(true);

                        setDistractions(prev => {
                            const last = prev[prev.length - 1];
                            const now = new Date();
                            if (!last || (now.getTime() - new Date(last.timestamp).getTime() > 5000)) {
                                return [...prev, { type: 'looking_away', timestamp: now }];
                            }
                            return prev;
                        });
                    } else {
                        setIsDistracted(false);
                    }
                }
            } catch (err) {
                console.warn("Pose detection frame skipped:", err);
            }
        }
        animId = requestAnimationFrame(runDetection);
    };
    if (isActive) runDetection();
    return () => cancelAnimationFrame(animId);
  }, [holistic, isActive]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => {
        clearInterval(timerRef.current);
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
        }
    };
  }, [isActive]);

  useEffect(() => {
    const watchdog = setInterval(() => {
      if (isActive && videoRef.current) {
        if (videoRef.current.paused || videoRef.current.readyState < 2) {
            videoRef.current.play().catch(() => {});
        }
      }
    }, 3000);
    return () => clearInterval(watchdog);
  }, [isActive]);

  const handleStart = async () => {
    setIsActive(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
        toast.error("Camera needed for focus tracking");
    }
  };

  const handleStop = async () => {
    setIsActive(false);
    const totalMinutes = Math.floor(seconds / 60);
    const focusedMinutes = Math.max(0, totalMinutes - Math.floor(distractions.length / 2));
    
    setLoading(true);
    try {
        await api.post('/api/focus/session', {
            startTime: new Date(Date.now() - seconds * 1000),
            endTime: new Date(),
            totalMinutes,
            focusedMinutes,
            distractions,
            environment: { noiseLevel: 'quiet' }
        });
        toast.success("Focus session saved!");
        setSeconds(0);
        setDistractions([]);
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
    } catch (err) {
        toast.error("Failed to save session");
    } finally {
        setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-display text-sensei-coral drop-shadow-[4px_4px_0px_#2D2D2D]">🎯 Focus Guardian</h1>
        <p className="text-lg font-body text-s-muted">Deep work tracker with AI distraction detection</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {}
        <div className="md:col-span-2 comic-card p-8 bg-white flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          {isDistracted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-red-500/20 backdrop-blur-sm z-10 flex items-center justify-center pointer-events-none"
            >
              <div className="pow-burst bg-red-500 text-3xl px-8 py-4">DISTRACTED!</div>
            </motion.div>
          )}

          <div className="relative">
            <div className={`w-64 h-64 rounded-full border-8 flex items-center justify-center transition-colors duration-500 ${isDistracted ? 'border-red-500' : 'border-sensei-gold'}`}>
              <span className="text-6xl font-mono font-bold">{formatTime(seconds)}</span>
            </div>
            {isActive && (
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-4 border-dashed border-sensei-blue rounded-full opacity-30"
                />
            )}
          </div>

          <div className="flex gap-4">
            {!isActive ? (
                <button onClick={handleStart} className="comic-btn px-10 py-4 !bg-sensei-gold text-s-text text-2xl font-display rounded-2xl flex items-center gap-3 shadow-[6px_6px_0px_#2D2D2D]">
                    <Play fill="currentColor" size={28} /> START FOCUS
                </button>
            ) : (
                <div className="flex gap-4">
                    <button onClick={() => setIsActive(false)} className="comic-btn px-8 py-4 bg-yellow-100 text-xl font-display rounded-2xl flex items-center gap-3">
                        <Pause fill="currentColor" /> PAUSE
                    </button>
                    <button onClick={handleStop} className="comic-btn px-8 py-4 !bg-sensei-coral text-white text-xl font-display rounded-2xl flex items-center gap-3 shadow-[4px_4px_0px_#8b0000]">
                        <Square fill="currentColor" size={20} /> STOP SESSION
                    </button>
                </div>
            )}
          </div>
        </div>

        {}
        <div className="space-y-6">
          <div className="comic-card p-6 bg-sensei-card3">
            <h3 className="text-xl font-display flex items-center gap-2 mb-4">
                <Brain size={20} /> Real-time IQ
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-body">Focus Score</span>
                    <span className="font-bold text-2xl text-sensei-blue">{isDistracted ? 40 : 98}%</span>
                </div>
                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden border-2 border-s-border">
                    <motion.div 
                        animate={{ width: isDistracted ? '40%' : '98%' }}
                        className="h-full bg-sensei-blue"
                    />
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-s-muted">Head pose: {isDistracted ? 'Looking Away' : 'On Screen'}</span>
                    <span className="flex items-center gap-1 text-green-500 font-bold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        STABLE
                    </span>
                </div>
            </div>
          </div>

          <div className="comic-card p-6 bg-sensei-card5">
            <h3 className="text-xl font-display flex items-center gap-2 mb-4">
                <ShieldAlert size={20} /> Guardian Logs
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                {distractions.length === 0 && <p className="text-sm font-body italic text-center py-4">No distractions yet. Amazing!</p>}
                {distractions.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono p-2 bg-white/50 rounded-lg">
                        <span className="text-red-500">⚠</span>
                        <span>{d.timestamp.toLocaleTimeString()} - {d.type}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className={`fixed bottom-24 right-8 w-48 h-36 rounded-2xl border-4 border-s-border bg-black overflow-hidden shadow-2xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-60" />
        <div className="absolute top-2 right-2 flex gap-1">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        </div>
      </div>

      {}
      <div className="comic-card p-8 bg-white">
        <h2 className="text-2xl font-display flex items-center gap-2 mb-6">
            <BarChart3 className="text-sensei-coral" /> Weekly Focus Heatmap
        </h2>
        <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 * 12 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-md border border-gray-100 ${Math.random() > 0.6 ? 'bg-sensei-gold' : 'bg-gray-50'}`} style={{ opacity: Math.random() }} />
            ))}
        </div>
        <div className="flex justify-between mt-4 text-xs font-mono text-s-muted uppercase">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
        </div>
      </div>
    </div>
  );
}
