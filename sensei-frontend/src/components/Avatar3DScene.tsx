'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, useGLTF, useAnimations } from '@react-three/drei';
import { Suspense, useRef, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';

interface AvatarProps {
  mood: 'idle' | 'thinking' | 'talking' | 'happy' | 'waving';
}


function CustomAvatar({ mood }: AvatarProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/images/models/model.glb');
  const { actions, names, mixer } = useAnimations(animations || [], group);
  const prevMoodRef = useRef<string>('idle');


  useMemo(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);


  const getAnimationName = useCallback((currentMood: string): string | null => {
    if (!names || names.length === 0) return null;


    const moodAnimMap: Record<string, string[]> = {
      idle: ['Idle', 'idle', 'Standing', 'standing', 'Rest', 'rest'],
      thinking: ['ThumbsUp', 'Thinking', 'thinking', 'Look', 'look', 'Idle', 'idle'],
      talking: ['Talking', 'talking', 'Wave', 'wave', 'Gesture', 'gesture', 'Idle', 'idle'],
      happy: ['Dance', 'dance', 'Jump', 'jump', 'Happy', 'happy', 'Yes', 'yes'],
      waving: ['Wave', 'wave', 'WaveHand', 'Greeting', 'greeting', 'Hello', 'hello'],
    };

    const candidates = moodAnimMap[currentMood] || moodAnimMap.idle;


    for (const candidate of candidates) {
      const found = names.find(n => n.toLowerCase().includes(candidate.toLowerCase()));
      if (found) return found;
    }


    return names[0] || null;
  }, [names]);


  useEffect(() => {
    if (!actions || names.length === 0) return;

    const animName = getAnimationName(mood);
    if (!animName || !actions[animName]) return;

    const prevAnimName = getAnimationName(prevMoodRef.current);
    

    if (prevAnimName && actions[prevAnimName] && prevAnimName !== animName) {
      actions[prevAnimName].fadeOut(0.4);
    }

    actions[animName]
      .reset()
      .fadeIn(0.4)
      .play();

    prevMoodRef.current = mood;

    return () => {
      if (actions[animName]) {
        actions[animName].fadeOut(0.4);
      }
    };
  }, [mood, actions, names, getAnimationName]);


  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (group.current) {

      group.current.position.y = -1.5 + Math.sin(t * 1.2) * 0.015;

      switch (mood) {
        case 'thinking':
          group.current.rotation.y = Math.sin(t * 0.6) * 0.08;
          break;
        case 'talking':
          group.current.rotation.y = Math.sin(t * 1.5) * 0.04;
          break;
        case 'happy':
          group.current.rotation.y = Math.sin(t * 2) * 0.06;
          group.current.position.y = -1.5 + Math.abs(Math.sin(t * 2.5)) * 0.04;
          break;
        case 'waving':
          group.current.rotation.y = Math.sin(t * 1) * 0.1;
          break;
        default:
          group.current.rotation.y = Math.sin(t * 0.3) * 0.03;
          break;
      }
    }
  });

  return (
    <group ref={group} position={[0, -1.5, 0]} scale={0.45} rotation={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}


function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 50;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0.55, 0.36, 0.96],
      [1, 0.84, 0],
      [0, 0.9, 1],
      [1, 0.4, 0.6],
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}


function Platform() {
  return (
    <group position={[0, -1.55, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.08, 32]} />
        <meshStandardMaterial color="#8B5CF6" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.15, 1.2, 0.04, 32]} />
        <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}


export default function Avatar3DScene({ mood }: AvatarProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.8, 4.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        {}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.5}
          castShadow
          color="#fff5ee"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2, 3, -1]} intensity={0.3} color="#b3a0ff" />
        <pointLight position={[0, 2, 2]} intensity={0.6} color="#FFD700" />

        {}
        <Environment preset="city" />

        {}
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
          <CustomAvatar mood={mood} />
        </Float>

        {}
        <Platform />

        {}
        <FloatingParticles />

        {}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, -0.2, 0]}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Suspense>
    </Canvas>
  );
}


useGLTF.preload('/images/models/model.glb');
