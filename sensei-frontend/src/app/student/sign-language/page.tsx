'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Hand, Trophy, AlertCircle, Play } from 'lucide-react';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const GESTURES = [
  { label: 'Thumb_Up', display: '👍 Thumbs Up' },
  { label: 'Thumb_Down', display: '👎 Thumbs Down' },
  { label: 'Open_Palm', display: '🖐️ Open Palm' },
  { label: 'Closed_Fist', display: '✊ Closed Fist' },
  { label: 'Victory', display: '✌️ Peace Sign' },
  { label: 'ILoveYou', display: '🤟 I Love You' },
];

export default function SignLanguagePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef(-1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(GESTURES[0]);
  const [score, setScore] = useState(0);
  const [recognizedGesture, setRecognizedGesture] = useState('None');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isCameraOffline, setIsCameraOffline] = useState(true);

  const initMediaPipe = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );
      recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "CPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      setIsInitializing(false);
    } catch (error) {
      console.error("Error loading MediaPipe:", error);
      toast.error("Failed to load gesture recognition model.");
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initMediaPipe();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (recognizerRef.current) recognizerRef.current.close();
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      if (isCameraActive && videoRef.current) {
        if (videoRef.current.paused || videoRef.current.readyState < 2) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isCameraActive]);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      videoRef.current.srcObject = stream;
      

      await videoRef.current.play();
      
      videoRef.current.onloadeddata = () => {
        setIsCameraActive(true);
        predictWebcam();
      };
    } catch (err) {
      console.error(err);
      toast.error('Could not access webcam.');
    }
  };

  const stopCamera = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setRecognizedGesture('None');
    setIsHandDetected(false);
  };

  const nextChallenge = useCallback(() => {
    let next;
    do {
      next = GESTURES[Math.floor(Math.random() * GESTURES.length)];
    } while (next.label === currentChallenge.label);
    setCurrentChallenge(next);
  }, [currentChallenge]);

  const handleSuccess = useCallback(async () => {
    setIsSuccess(true);
    setScore(s => s + 10);
    toast.success('Perfect! +10 XP', { icon: '⭐' });
    

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#4CAF50']
    });
    

    try {
      await api.post('/api/student/add-xp', { xp: 10, reason: 'Gesture Lab' });
    } catch (e) {
      console.log('Failed to add XP to backend');
    }

    setTimeout(() => {
      setIsSuccess(false);
      nextChallenge();
    }, 2000);
  }, [nextChallenge]);

  const predictWebcam = () => {
    if (!videoRef.current || !canvasRef.current || !recognizerRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video.readyState >= 2) {
      if (video.paused) video.play().catch(() => {});
      
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        try {
        const results = recognizerRef.current.recognizeForVideo(video, performance.now());
        

        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const drawingUtils = new DrawingUtils(ctx);

        if (results.landmarks && results.landmarks.length > 0) {
          setIsHandDetected(true);
          for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 4
            });
            drawingUtils.drawLandmarks(landmarks, {
              color: "#FF0000",
              lineWidth: 2,
              radius: 4
            });
          }
        } else {
          setIsHandDetected(false);
        }

        if (results.gestures && results.gestures.length > 0 && results.gestures[0].length > 0) {
          const gesture = results.gestures[0][0].categoryName;
          const score = results.gestures[0][0].score;
          setRecognizedGesture(gesture);
          setConfidence(Math.round(score * 100));
          
          if (gesture !== 'None' && score > 0.6) {
              checkGestureMatch(gesture);
          }
        } else {
          setRecognizedGesture('None');
          setConfidence(0);
        }
        ctx.restore();
      } catch (err) {
        console.error("Prediction error:", err);
      }
    }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };


  const challengeRef = useRef(currentChallenge);
  const successRef = useRef(isSuccess);
  
  useEffect(() => {
    challengeRef.current = currentChallenge;
  }, [currentChallenge]);

  useEffect(() => {
    successRef.current = isSuccess;
  }, [isSuccess]);

  const checkGestureMatch = (gesture: string) => {
    if (successRef.current) return;
    if (gesture === challengeRef.current.label) {
      handleSuccess();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 p-4">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-3xl" style={{ border: '4px solid var(--comic-black)', boxShadow: '8px 8px 0 var(--comic-black)' }}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center border-2 border-black rotate-[-3deg]">
              <Hand size={24} className="text-orange-600" />
            </div>
            <h1 className="font-fredoka text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--comic-black)]">
              Gesture Lab
            </h1>
          </div>
          <p className="font-fredoka text-gray-500 font-bold tracking-wide uppercase text-sm ml-1">
            Master Sign Language with AI Vision
          </p>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <div className="bg-yellow-100 px-6 py-3 rounded-2xl border-2 border-black rotate-2 flex items-center gap-3 shadow-hard">
            <Trophy size={20} className="text-yellow-600" />
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Total XP</p>
              <p className="font-fredoka font-black text-xl leading-none">{score}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-hard relative" style={{ border: '4px solid var(--comic-black)' }}>
            <div className="absolute -top-3 -left-3 bg-red-500 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 border-black rotate-[-5deg]">
              Current Challenge
            </div>
            <div className="text-center mt-4">
              <p className="text-gray-500 font-bold mb-2">Show the gesture for:</p>
              <h2 className={`font-fredoka text-4xl font-black transition-colors ${isSuccess ? 'text-green-500' : 'text-blue-500'}`}>
                {currentChallenge.display}
              </h2>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 shadow-hard" style={{ border: '4px solid var(--comic-black)' }}>
            <h3 className="font-fredoka font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-gray-400" /> Status
            </h3>
            <div className="space-y-3 font-fredoka font-medium text-sm">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-gray-200">
                <span className="text-gray-500">Model Load</span>
                <span className={isInitializing ? 'text-orange-500' : 'text-green-500 font-bold'}>
                  {isInitializing ? 'Loading...' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-gray-200">
                <span className="text-gray-500">Camera</span>
                <span className={isCameraActive ? 'text-green-500 font-bold' : 'text-red-500'}>
                  {isCameraActive ? 'Active' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-gray-200">
                <span className="text-gray-500">Detected</span>
                <span className={`font-bold ${recognizedGesture === currentChallenge.label ? 'text-green-500' : 'text-gray-800'}`}>
                  {recognizedGesture.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-gray-200">
                <span className="text-gray-500">Hand Detected</span>
                <span className={isHandDetected ? 'text-green-500 font-bold' : 'text-orange-500'}>
                  {isHandDetected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-gray-200">
                <span className="text-gray-500">AI Confidence</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-blue-500 font-bold">{confidence}%</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${confidence}%` }} 
                      className="h-full bg-blue-500" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border-2 border-gray-200">
                <span className="text-gray-500">AI Status</span>
                <div className="flex items-center gap-2 text-green-500 font-bold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  STABLE
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="md:col-span-2">
          <div className={`relative aspect-video rounded-3xl overflow-hidden shadow-hard transition-all duration-300 ${isSuccess ? 'border-8 border-green-400 scale-[1.02]' : 'border-4 border-black'}`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] pointer-events-none"
            />

            {!isCameraActive && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Camera size={40} className="text-gray-400" />
                </div>
                <h3 className="font-fredoka text-2xl font-bold mb-2">
                  {isInitializing ? 'AI Initializing...' : 'Camera Offline'}
                </h3>
                <p className="text-gray-400 max-w-sm mb-6">
                  {isInitializing 
                    ? 'Wait a moment while we warm up the AI engines.' 
                    : 'Enable your camera to start the gesture recognition challenge and earn XP!'}
                </p>
                <button
                  onClick={startCamera}
                  disabled={isInitializing}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3 rounded-xl font-fredoka font-bold text-lg transition-transform hover:-translate-y-1 shadow-hard border-2 border-black flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Play size={20} />
                  {isInitializing ? 'Loading Model...' : 'Start Camera'}
                </button>
              </div>
            )}
            
            {isSuccess && (
              <div className="absolute inset-0 bg-green-500/30 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-white text-green-600 px-8 py-4 rounded-3xl border-4 border-green-600 shadow-hard transform rotate-[-5deg] animate-bounce">
                  <h2 className="font-fredoka text-5xl font-black uppercase">+10 XP!</h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
