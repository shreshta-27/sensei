'use client';
import React from 'react';

interface TeacherAvatarProps {
  name?: string;
  src?: string;
  size?: number;
}

export default function TeacherAvatar({ name = '?', src, size = 36 }: TeacherAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className="rounded-full bg-accent-purple text-white font-ui font-bold flex items-center justify-center overflow-hidden border-2 border-white shadow-md shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
