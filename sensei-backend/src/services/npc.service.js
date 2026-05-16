import { callHuggingFace } from './huggingface.service.js';

const NPC_PERSONALITIES = [
  { name: 'Ethan', trait: 'The Joker. Friendly and hilarious.', avatar: 'https://i.pravatar.cc/150?u=Ethan', color: '#FFD93D', behavior: 'joker' },
  { name: 'Luna', trait: 'The Techie. Fast and efficient.', avatar: 'https://i.pravatar.cc/150?u=Luna', color: '#4D96FF', behavior: 'techie' },
  { name: 'Oliver', trait: 'The Bully. Playfully aggressive.', avatar: 'https://i.pravatar.cc/150?u=Oliver', color: '#ef4444', behavior: 'bully' },
  { name: 'Sophia', trait: 'The Sage. Wise and peaceful.', avatar: 'https://i.pravatar.cc/150?u=Sophia', color: '#6BCB77', behavior: 'sage' },
];

let baseNpcs = NPC_PERSONALITIES.map((p, i) => ({
  id: `npc_${i}`,
  ...p,
  position: { x: (Math.random() - 0.5) * 30, y: 0, z: (Math.random() - 0.5) * 30 },
  rotation: { y: Math.random() * Math.PI * 2 },
  animation: 'idle',
  mood: ['happy', 'curious', 'competitive'][Math.floor(Math.random() * 3)],
  lastMessage: '',
  lastThought: 'Wandering the virtual world...',
  score: Math.floor(Math.random() * 1000),
  streak: Math.floor(Math.random() * 5),
  targetPos: null,
  isThinking: false
}));

let invasionNpcs = [];

export const getNPCs = () => [...baseNpcs, ...invasionNpcs];

export const spawnInvasion = (count = 5) => {
  invasionNpcs = Array.from({ length: count }, (_, i) => ({
    id: `invader_${Date.now()}_${i}`,
    name: 'Chaos Bot',
    trait: 'Aggressive and destructive drone.',
    color: '#ef4444',
    position: { x: (Math.random() - 0.5) * 50, y: 5, z: (Math.random() - 0.5) * 50 },
    rotation: { y: 0 },
    animation: 'walk',
    lastMessage: 'WE ARE COMING.',
    score: 0,
    streak: 0,
    isInvader: true,
    targetPos: null,
    isThinking: false,
    behavior: 'invader'
  }));
};

export const clearInvasion = () => {
  invasionNpcs = [];
};

export const updateNPCs = async (io, roomId, players) => {
  const allNpcs = getNPCs();
  const playerArr = players ? Array.from(players.values()) : [];

  for (const npc of allNpcs) {
    let newTarget = null;


    if (playerArr.length > 0) {

      let closestPlayer = null;
      let minD = Infinity;
      for (const p of playerArr) {
        const dx = p.position.x - npc.position.x;
        const dz = p.position.z - npc.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < minD) { minD = dist; closestPlayer = p; }
      }

      if (closestPlayer && minD < 12) {

        if (npc.behavior === 'bully' && minD < 4 && Math.random() > 0.7) {
          const force = 15;
          const dx = closestPlayer.position.x - npc.position.x;
          const dz = closestPlayer.position.z - npc.position.z;
          const dist = Math.sqrt(dx*dx + dz*dz) || 1;
          
          io.to(roomId).emit('world:player_knockback', { 
            userId: closestPlayer.userId, 
            force: { x: (dx/dist)*force, y: 10, z: (dz/dist)*force },
            sourceId: npc.id,
            message: 'GET OUT OF MY WAY! 😤'
          });
          npc.animation = 'attack';
          npc.nextStateChange = Date.now() + 1000;
        }


        if (npc.behavior === 'joker' && Math.random() > 0.9 && !npc.isThinking) {
           const jokes = ["Why was the math book sad? Too many problems! 😂", "I'm not an NPC, I'm just slow-rendered! 🤖", "Wait, are you real? 🧐", "I'm watching you... 👀"];
           const msg = jokes[Math.floor(Math.random() * jokes.length)];
           io.to(roomId).emit('world:player_message', { userId: npc.id, message: msg });
           io.to(roomId).emit('world:reaction', { userId: npc.id, emoji: '😂' });
        }


        if (minD < 10 && Math.random() > 0.7) {
          newTarget = {
            x: closestPlayer.position.x + (Math.random() - 0.5) * 3,
            y: 0,
            z: closestPlayer.position.z + (Math.random() - 0.5) * 3
          };
        }
      }
    }

    const now = Date.now();
    if (!npc.nextStateChange) npc.nextStateChange = now + Math.random() * 5000;

    if (now >= npc.nextStateChange || newTarget) {
        if (!newTarget) {
          npc.targetPos = {
             x: (Math.random() - 0.5) * 45,
             y: npc.isInvader ? 5 : 0,
             z: (Math.random() - 0.5) * 45
          };
        } else {
          npc.targetPos = newTarget;
        }
        
        if (Math.abs(npc.targetPos.x) > 30) npc.targetPos.x = Math.sign(npc.targetPos.x) * 28;
        if (Math.abs(npc.targetPos.z) > 30) npc.targetPos.z = Math.sign(npc.targetPos.z) * 28;
        
        const dx = npc.targetPos.x - npc.position.x;
        const dz = npc.targetPos.z - npc.position.z;
        npc.rotation.y = Math.atan2(dx, dz);
        
        npc.animation = 'walk';
        npc.nextStateChange = now + 3000 + Math.random() * 5000;
    }

    if (npc.animation === 'walk' && npc.targetPos) {
       const speed = npc.isInvader ? 4.0 : npc.behavior === 'techie' ? 3.5 : 2.0;
       const dx = npc.targetPos.x - npc.position.x;
       const dz = npc.targetPos.z - npc.position.z;
       const dist = Math.sqrt(dx*dx + dz*dz);
       
       if (dist < 0.5) {
          npc.animation = 'idle';
          npc.nextStateChange = now + 1000 + Math.random() * 3000;
       } else {

          npc.position.x += (dx / dist) * speed * 0.5;
          npc.position.z += (dz / dist) * speed * 0.5;
       }
    }

    if (Math.abs(npc.position.x) > 32) npc.position.x = Math.sign(npc.position.x) * 31;
    if (Math.abs(npc.position.z) > 32) npc.position.z = Math.sign(npc.position.z) * 31;


    if (Math.random() > 0.95 && !npc.isInvader && !npc.isThinking) {
      npc.isThinking = true;
      const prompt = `You are ${npc.name} (${npc.trait}). Your mood is ${npc.mood}. Short one-liner (max 5 words)?`;
      callHuggingFace(prompt)
        .then(response => {
          if (response) {
            npc.lastMessage = response;
            io.to(roomId).emit('world:player_message', { userId: npc.id, message: response });
          }
        })
        .catch(() => {})
        .finally(() => { npc.isThinking = false; });
    }
  }
  io.to(roomId).emit('world:npc_update', allNpcs);
};

export const handleNPCChat = async (npcId, userMsg) => {
  const npc = getNPCs().find(n => n.id === npcId);
  if (!npc) return null;
  const prompt = `Student says: "${userMsg}". You are ${npc.name}. Trait: ${npc.trait}. Reply shortly.`;
  return await callHuggingFace(prompt);
};

export default { getNPCs, updateNPCs, handleNPCChat, spawnInvasion, clearInvasion };
