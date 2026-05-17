'use client';
import React from 'react';
import { motion } from 'framer-motion';

type StickyColor = 'yellow' | 'blue' | 'green' | 'purple' | 'pink' | 'orange';

interface StickyCardProps {
  children: React.ReactNode;
  color?: StickyColor;
  rotation?: number;
  pinned?: boolean;
  className?: string;
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  delay?: number;
}

const colorMap: Record<StickyColor, string> = {
  yellow: 'var(--sticky-yellow)',
  blue: 'var(--sticky-blue)',
  green: 'var(--sticky-green)',
  purple: 'var(--sticky-purple)',
  pink: 'var(--sticky-pink)',
  orange: 'var(--sticky-orange)',
};

export default function StickyCard({ children, color = 'yellow', rotation = -0.5, pinned = false, className = '', onClick, onDragOver, onDrop, delay = 0 }: StickyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotate: rotation - 2 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ delay }}
      whileHover={{ y: -3, rotate: 0, boxShadow: 'var(--shadow-card-hover)' }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ background: colorMap[color] }}
      className={`
        relative rounded-[var(--card-radius)]
        border-2 border-[var(--border-doodle)]
        box-shadow-[var(--shadow-sticky)]
        p-5 cursor-default select-none
        transition-all duration-200
        ${pinned ? 'pinned' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Tape decoration */}
      {!pinned && (
        <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-12 h-[18px] bg-white/65 rounded-sm border border-[rgba(0,0,0,0.08)] shadow-sm z-10" />
      )}
      {/* Pin decoration when pinned */}
      {pinned && (
        <span className="absolute -top-[4px] right-[12px] text-[18px] z-10">📌</span>
      )}
      {children}
    </motion.div>
  );
}
