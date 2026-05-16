'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { io as socketIo, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { gameAudio } from '@/components/world/GameAudio';

const WorldScene = dynamic(() => import('@/components/world/WorldScene'), { ssr: false });
const MobileControls = dynamic(() => import('@/components/world/MobileControls'), { ssr: false });
const VoiceChat = dynamic(() => import('@/components/world/VoiceChat'), { ssr: false });

interface Player {
  userId: string;
  username: string;
  avatar: string;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  animation: string;
  socketId?: string;
}

interface ChatMsg {
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  streak: number;
  avatar: string;
}

interface QuizData {
  questionId: string;
  question: string;
  options: string[];
  timeLimit: number;
  subject: string;
}

export default function WorldRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const roomId = params.roomId as string;

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [roomMeta, setRoomMeta] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState(5);
  const [myScore, setMyScore] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);


  const [joystickMove, setJoystickMove] = useState<{x: number, y: number} | null>(null);
  const [jumpTrigger, setJumpTrigger] = useState(0);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isDeafened, setIsDeafened] = useState(true);
  const [talkingUsers, setTalkingUsers] = useState<Set<string>>(new Set());
  const [reactions, setReactions] = useState<Record<string, string>>({});
  
  const [activeEvent, setActiveEvent] = useState<{type: string, message: string} | null>(null);
  const [playerMessages, setPlayerMessages] = useState<Record<string, string>>({});
  const [showCombo, setShowCombo] = useState<number | null>(null);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [chaosEvent, setChaosEvent] = useState<any>(null);
  const [crowdState, setCrowdState] = useState<any>({ density: 'low', playerCount: 0 });
  const [knockbackTrigger, setKnockbackTrigger] = useState<any>(null);


  useEffect(() => {
    const resumeAudio = async () => {
      if (!isDeafened) {
        await gameAudio.init();
        gameAudio.startAmbient();
      } else {
        gameAudio.stopAmbient();
      }
    };
    resumeAudio();
  }, [isDeafened]);

  const playSound = (type: 'correct' | 'wrong' | 'click' | 'msg') => {
    if (isDeafened) return;
    if (type === 'correct') gameAudio.playCorrect();
    else if (type === 'wrong') gameAudio.playWrong();
    else if (type === 'click') gameAudio.playClick();
    else if (type === 'msg') gameAudio.playMessage();
  };

  useEffect(() => {
    if (!user) { router.push('/login'); return; }


    const worldSocket = socketIo(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/world`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    worldSocket.on('connect', () => {
      setConnected(true);
      setLoading(false);
      worldSocket.emit('world:join', {
        roomId,
        userId: user._id,
        username: user.name,
        avatar: '#4D96FF',
      });
    });

    worldSocket.on('world:room_state', (data: any) => {
      setPlayers(data.players);
      setNpcs(data.npcs || []);
      setLeaderboard(data.leaderboard);
      setRoomMeta(data.roomMeta);
      const me = data.leaderboard.find((l: any) => l.userId === user._id);
      if (me) setMyScore(me.score);
    });

    worldSocket.on('world:npc_update', (updatedNpcs: any[]) => {
      setNpcs(updatedNpcs);
    });

    worldSocket.on('world:player_joined', (p: Player) => {
      setPlayers(prev => [...prev.filter(x => x.userId !== p.userId), p]);
    });

    worldSocket.on('world:player_left', ({ userId }: any) => {
      setPlayers(prev => prev.filter(p => p.userId !== userId));
    });

    worldSocket.on('world:player_moved', ({ userId, position, rotation, animation }: any) => {
      setPlayers(prev => prev.map(p => p.userId === userId ? { ...p, position, rotation, animation } : p));
    });

    worldSocket.on('world:leaderboard_update', (lb: LeaderboardEntry[]) => {
      setLeaderboard(lb);
    });

    worldSocket.on('world:score_update', ({ userId, xpEarned, newTotal, isCorrect }: any) => {
      if (userId === user._id) setMyScore(newTotal);
    });

    worldSocket.on('world:quiz_start', (data: QuizData) => {
      setQuiz(data);
      setQuizResult(null);
      setQuizTimeLeft(5);
      if (!isDeafened) gameAudio.playQuizStart();
      

      let timeLeft = 5;
      const interval = setInterval(() => {
        timeLeft -= 1;
        setQuizTimeLeft(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);

          setTimeout(() => {
            setQuiz(prev => {

              return prev?.questionId === data.questionId ? null : prev;
            });
            setQuizResult(null);
          }, 1500);
        }
      }, 1000);
    });

    worldSocket.on('world:quiz_result', (result: any) => {
      setQuizResult(result);
      if (result.isCorrect) {
        playSound('correct');
        const streak = (leaderboard.find(l => l.userId === user._id)?.streak || 0) + 1;
        if (streak >= 2) {
          setShowCombo(streak);
          setTimeout(() => setShowCombo(null), 2000);
        }
      } else {
        playSound('wrong');
      }
      setTimeout(() => { setQuiz(null); setQuizResult(null); }, 3000);
    });

    worldSocket.on('world:chat_message', (msg: ChatMsg) => {
      setChatMessages(prev => [...prev.slice(-50), msg]);
      playSound('msg');
      
      if (msg.userId === user._id) {
        setPlayerMessages(prev => ({ ...prev, [user._id]: msg.message }));
        setTimeout(() => {
          setPlayerMessages(prev => {
            const next = { ...prev };
            delete next[user._id];
            return next;
          });
        }, 4000);
      }
    });

    worldSocket.on('world:player_message', ({ userId, message }: any) => {
      setPlayerMessages(prev => ({ ...prev, [userId]: message }));
      setTimeout(() => {
        setPlayerMessages(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }, 4000);
    });

    worldSocket.on('world:reaction', ({ userId, emoji }: any) => {
      setReactions(prev => ({ ...prev, [userId]: emoji }));
      
      if (!isDeafened) {
         if (emoji === '👏') gameAudio.playCheer();
         if (emoji === '😮' || emoji === '💀') gameAudio.playShock();
      }

      setTimeout(() => {
        setReactions(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }, 2000);
    });

    worldSocket.on('world:talking_state', ({ userId, talking }: any) => {
      setTalkingUsers(prev => {
        const next = new Set(prev);
        if (talking) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    worldSocket.on('world:event_start', (evt: any) => {
      setActiveEvent(evt);
      if (!isDeafened) gameAudio.playShock();
    });

    worldSocket.on('world:event_end', () => {
      setActiveEvent(null);
    });

    worldSocket.on('world:npc_update', (npcData: any[]) => {
      setNpcs(npcData);
    });

    worldSocket.on('world:chaos_event', (evt: any) => {
      setChaosEvent(evt);
      setActiveEvent({ type: evt.type, message: `⚠️ CHAOS ALERT: ${evt.type.toUpperCase()}` });
    });

    worldSocket.on('world:chaos_end', () => {
      setChaosEvent(null);
      setActiveEvent(null);
    });

    worldSocket.on('world:crowd_state', (state: any) => {
      setCrowdState(state);
    });
    
    worldSocket.on('world:player_knockback', (data: any) => {
      if (data.userId === user?._id) {
        setKnockbackTrigger({ ...data.force, id: Date.now() });
        if (data.message) {
          setPlayerMessages(prev => ({ ...prev, [data.sourceId]: data.message }));
          setTimeout(() => setPlayerMessages(prev => {
            const next = { ...prev };
            delete next[data.sourceId];
            return next;
          }), 3000);
        }
      }
    });

    worldSocket.on('world:error', ({ message }: any) => {
      alert(message);
      router.push('/student/world');
    });

    socketRef.current = worldSocket;

    return () => {
      gameAudio.destroy();
      worldSocket.emit('world:leave', { roomId, userId: user._id });
      worldSocket.disconnect();
    };
  }, [roomId, user, router]);

  const sendMove = useCallback((position: any, rotation: any, animation: string) => {
    socketRef.current?.emit('world:move', { roomId, userId: user?._id, position, rotation, animation });
  }, [roomId, user]);

  const answerQuiz = useCallback((answer: string) => {
    if (!quiz) return;
    playSound('click');
    socketRef.current?.emit('world:quiz_answer', {
      roomId, userId: user?._id, questionId: quiz.questionId, answer, timeMs: Date.now(),
    });
  }, [quiz, roomId, user, isDeafened]);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    socketRef.current?.emit('world:chat', { roomId, userId: user?._id, username: user?.name, message: chatInput });
    setChatInput('');
  }, [chatInput, roomId, user]);

  const sendReaction = useCallback((emoji: string) => {
    socketRef.current?.emit('world:reaction', { roomId, userId: user?._id, emoji });
    
    if (user) {
      setReactions(prev => ({ ...prev, [user._id]: emoji }));
      setTimeout(() => {
        setReactions(prev => {
          const next = { ...prev };
          delete next[user._id];
          return next;
        });
      }, 2000);
    }
  }, [roomId, user]);

  const handleTalkingChange = useCallback((userId: string, isTalking: boolean) => {
    setTalkingUsers(prev => {
      const next = new Set(prev);
      const id = userId === 'me' && user ? user._id : userId;
      if (isTalking) next.add(id);
      else next.delete(id);
      return next;
    });
  }, [user]);

  const exitRoom = () => {
    if (confirm('Leave the room? Your XP will be saved.')) {
      gameAudio.destroy();
      router.push('/student/world');
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ width: 80, height: 80, border: '4px solid rgba(77,150,255,0.3)', borderTopColor: '#4D96FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ color: '#4D96FF', fontFamily: 'Fredoka, sans-serif', fontSize: '2rem', letterSpacing: '0.1em' }}>Loading World...</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Fredoka, sans-serif' }}>Preparing Study Island</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#87CEEB', overflow: 'hidden' }}>
      
      {}
      <WorldScene
        players={players}
        npcs={npcs}
        myUserId={user?._id || ''}
        onMove={sendMove}
        joystickMove={joystickMove}
        jumpTrigger={jumpTrigger}
        talkingUsers={talkingUsers}
        reactions={reactions}
        playerMessages={playerMessages}
        weatherOverride={activeEvent ? 'storm' : undefined}
        leaderboard={leaderboard}
        chaosEvent={chaosEvent}
        crowdState={crowdState}
        hideUI={!!quiz}
        knockbackTrigger={knockbackTrigger}
      />

      <MobileControls 
        onMove={setJoystickMove}
        onJump={() => setJumpTrigger(Date.now())}
      />

      {connected && (
        <VoiceChat
          socket={socketRef.current}
          roomId={roomId}
          isMicOn={isMicOn}
          isDeafened={isDeafened}
          myPosition={players.find(p => p.userId === user?._id)?.position || { x: 0, y: 0, z: 0 }}
          remotePositions={Object.fromEntries(players.map(p => [p.socketId || p.userId, p.position]))}
          onTalkingChange={handleTalkingChange}
          initialPlayers={players}
          myUserId={user?._id || ''}
        />
      )}

      {}
      {isDeafened && (
        <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 100, pointerEvents: 'none', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          Audio is Muted.<br/>Click the 🔊 icon top-right to enable sound.
        </div>
      )}

      {}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', pointerEvents: 'none', zIndex: 10 }}
      >
        {}
        <div style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: '0.75rem 1.25rem', color: 'white', fontFamily: 'Fredoka, sans-serif', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4D96FF, #6BCB77)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏝️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}>{roomMeta?.name || 'World Room'}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>{players.length} Players Online • <span style={{ color: '#FFD93D' }}>⭐ {myScore} XP</span></div>
          </div>
        </div>

        {}
        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: '0.5rem', display: 'flex', gap: '0.25rem', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <button onClick={() => setIsMicOn(!isMicOn)}
              title={isMicOn ? "Turn Mic Off" : "Turn Mic On"}
              style={{ background: isMicOn ? '#4ade80' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 16, width: 40, height: 40, color: isMicOn ? '#000' : '#fff', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s' }}
            >{isMicOn ? '🎤' : '🔇'}</button>
            <button onClick={() => setIsDeafened(!isDeafened)}
              title={isDeafened ? "Turn Audio On" : "Turn Audio Off"}
              style={{ background: isDeafened ? '#ef4444' : '#4D96FF', border: 'none', borderRadius: 16, width: 40, height: 40, color: '#fff', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s' }}
            >{isDeafened ? '🔇' : '🔊'}</button>
            <button onClick={() => setShowLeaderboard(!showLeaderboard)}
              title="Toggle Leaderboard"
              style={{ background: showLeaderboard ? '#FFD93D' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 16, width: 40, height: 40, color: showLeaderboard ? '#000' : '#fff', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s' }}
            >🏆</button>
            <button onClick={() => setShowChat(!showChat)}
              title="Toggle Chat"
              style={{ background: showChat ? '#6BCB77' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 16, width: 40, height: 40, color: '#fff', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s' }}
            >💬</button>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', margin: '0.25rem' }} />
            <button onClick={exitRoom}
              title="Exit World"
              style={{ background: '#ef4444', border: 'none', borderRadius: 16, width: 40, height: 40, color: 'white', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 900, transition: 'all 0.2s' }}
            >🚪</button>
          </div>
        </div>
      </motion.div>


      {}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            style={{ position: 'absolute', top: 80, right: 16, width: 250, maxHeight: '50vh', overflowY: 'auto', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '1rem', color: 'white', fontFamily: 'Fredoka, sans-serif', zIndex: 20, border: '2px solid #FFD93D' }}
          >
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', textAlign: 'center' }}>🏆 Leaderboard</h3>
          {leaderboard.map((entry, i) => (
            <div key={entry.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', background: entry.userId === user?._id ? 'rgba(255,217,61,0.15)' : 'transparent', borderRadius: 8, paddingLeft: 8 }}>
              <span style={{ fontWeight: 700, width: 24, textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: entry.avatar || '#4D96FF', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.username}{entry.userId === user?._id ? ' (You)' : ''}
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#FFD93D' }}>{entry.score}</span>
              {entry.streak >= 3 && <span style={{ fontSize: '0.7rem' }}>🔥{entry.streak}</span>}
            </div>
          ))}
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            style={{ position: 'absolute', bottom: 80, left: 16, width: 'calc(100vw - 32px)', maxWidth: 320, maxHeight: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 20, border: '2px solid rgba(255,255,255,0.1)' }}
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: 240 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.8rem', color: msg.userId === 'system' ? '#FFD93D' : 'white', fontStyle: msg.userId === 'system' ? 'italic' : 'normal', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 8 }}>
                  {msg.userId !== 'system' && <strong style={{ color: '#4D96FF' }}>{msg.username}: </strong>}
                  {msg.message}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '0.5rem 0.75rem', color: 'white', fontFamily: 'Fredoka, sans-serif', fontSize: '0.85rem', outline: 'none' }}
              />
              <button onClick={sendChat} style={{ background: '#4D96FF', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', color: 'white', cursor: 'pointer', fontWeight: 700 }}>↗</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {quiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
          >
            <motion.div 
              initial={{ scale: 0.5, y: -50 }}
              animate={quizResult && !quizResult.isCorrect ? { x: [-10, 10, -10, 10, 0] } : { scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={quizResult && !quizResult.isCorrect ? { duration: 0.4 } : { type: 'spring', bounce: 0.6 }}
              style={{ background: '#fff', borderRadius: 32, padding: '2.5rem', maxWidth: 480, width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '6px solid #2D2A26', fontFamily: 'Fredoka, sans-serif', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: '#eee' }}>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(quizTimeLeft / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', background: quizTimeLeft <= 1 ? '#ef4444' : '#4D96FF' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#2D2A26', color: '#FFD93D', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {quiz.subject}
                </div>
                <div style={{ background: quizTimeLeft <= 1 ? '#ef4444' : '#FFD93D', color: quizTimeLeft <= 1 ? '#fff' : '#2D2A26', padding: '6px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, transition: 'all 0.2s' }}>
                  {quizTimeLeft}s
                </div>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.3, color: '#1a1a1a' }}>{quiz.question}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {quiz.options.map((opt, i) => {
                  const colors = ['#FFE066', '#4D96FF', '#6BCB77', '#FF6B9D'];
                  const isCorrect = quizResult?.correctAnswer === opt;
                  const isSelected = quizResult?.selectedAnswer === opt;
                  let bg = colors[i % 4];
                  if (quizResult) {
                    bg = isCorrect ? '#4ade80' : isSelected ? '#ef4444' : '#f3f4f6';
                  }
                  return (
                    <motion.button 
                      key={opt} 
                      onClick={() => !quizResult && answerQuiz(opt)}
                      disabled={!!quizResult}
                      whileHover={!quizResult ? { scale: 1.05, y: -4 } : {}}
                      whileTap={!quizResult ? { scale: 0.95 } : {}}
                      style={{ padding: '1.25rem 1rem', borderRadius: 20, border: '3px solid #2D2A26', background: bg, fontWeight: 800, fontSize: '1.1rem', cursor: quizResult ? 'default' : 'pointer', transition: 'all 0.2s', color: quizResult && !isCorrect && !isSelected ? '#9ca3af' : '#2D2A26', boxShadow: !quizResult ? '0 6px 0 #2D2A26' : 'none', position: 'relative' }}
                    >
                      {opt}
                      {quizResult && isCorrect && <span style={{ marginLeft: '0.5rem' }}>✅</span>}
                      {quizResult && isSelected && !isCorrect && <span style={{ marginLeft: '0.5rem' }}>❌</span>}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {quizResult && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ marginTop: '2rem', fontWeight: 800, fontSize: '1.2rem', color: quizResult.isCorrect ? '#16a34a' : '#dc2626', background: quizResult.isCorrect ? '#dcfce7' : '#fee2e2', padding: '12px 24px', borderRadius: 16, display: 'inline-block', border: '3px solid currentColor' }}
                  >
                    {quizResult.isCorrect ? `BOOM! +${quizResult.xpEarned} XP` : `OOF! It was: ${quizResult.correctAnswer}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: [1, 1.5, 1.2], opacity: 1, y: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}
          >
            <div style={{ background: 'linear-gradient(135deg, #FFD93D, #FF6B9D)', padding: '1rem 2rem', borderRadius: 20, border: '4px solid white', boxShadow: '0 0 30px rgba(255,217,61,0.8)', color: 'white', fontFamily: 'Fredoka', fontSize: '3rem', fontWeight: 900, textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
              {showCombo}x COMBO! 🔥
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {activeEvent && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: -100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.6 }}
            style={{ position: 'absolute', top: '15%', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}
          >
            <div style={{ background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.9), transparent)', padding: '2rem 4rem', textAlign: 'center', width: '100%' }}>
              <motion.h1 
                animate={{ scale: [1, 1.05, 1], textShadow: ['0 0 10px #f87171', '0 0 30px #f87171', '0 0 10px #f87171'] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2.5rem', color: '#FFF', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                {activeEvent.message}
              </motion.h1>
              <p style={{ color: '#FFD93D', fontFamily: 'Fredoka, sans-serif', fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0 0 0' }}>
                {activeEvent.type} EVENT ACTIVE!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', pointerEvents: 'auto', zIndex: 10, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {['😂', '❤️', '😮', '👏', '🤔', '👋'].map(emoji => (
          <button 
            key={emoji} 
            onClick={() => sendReaction(emoji)}
            style={{ 
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.1)', 
              borderRadius: '50%', width: 44, height: 44, fontSize: '1.25rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)', transition: 'transform 0.1s'
            }}
            onPointerDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {emoji}
          </button>
        ))}
      </motion.div>

      {}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'Fredoka, sans-serif', fontSize: '0.75rem', zIndex: 10, display: 'none', '@media (minWidth: 768px)': { display: 'block' } } as any}
      >
        WASD Move · Shift Run · Space Jump
      </motion.div>
    </div>
  );
}
