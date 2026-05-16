'use client';

import { useEffect, useRef, useState } from 'react';
import nipplejs from 'nipplejs';

interface MobileControlsProps {
  onMove: (data: { x: number; y: number } | null) => void;
  onJump: () => void;
}

export default function MobileControls({ onMove, onJump }: MobileControlsProps) {
  const joystickZoneRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {

    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      setIsTouchDevice(true);
    }
  }, []);

  useEffect(() => {
    if (!isTouchDevice || !joystickZoneRef.current) return;

    const manager = nipplejs.create({
      zone: joystickZoneRef.current,
      mode: 'dynamic',
      color: 'rgba(255, 255, 255, 0.7)',
      size: 120,
    });

    (manager as any).on('move', (evt: any, data: any) => {
      if (data.vector) {
        onMove({ x: data.vector.x, y: data.vector.y });
      }
    });

    (manager as any).on('end', () => {
      onMove(null);
    });

    return () => manager.destroy();
  }, [isTouchDevice, onMove]);

  if (!isTouchDevice) return null;

  return (
    <>
      <div 
        ref={joystickZoneRef} 
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '50vw', 
          height: '50vh', 
          zIndex: 50,
          pointerEvents: 'auto'
        }} 
      />
      
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          onJump();
        }}
        style={{
          position: 'absolute',
          bottom: '50px',
          right: '50px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '3px solid rgba(255, 255, 255, 0.6)',
          color: 'white',
          fontFamily: 'Fredoka, sans-serif',
          fontWeight: 'bold',
          fontSize: '18px',
          zIndex: 50,
          pointerEvents: 'auto',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          touchAction: 'none',
          backdropFilter: 'blur(5px)'
        }}
      >
        JUMP
      </button>
    </>
  );
}
