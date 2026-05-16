'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  onClick?: () => void;
}

export default function GlowCard({ children, className = '', glowColor = 'ember', delay = 0, onClick }: GlowCardProps) {
  const glowClass = glowColor === 'purple' ? 'hover:faculty-glow-purple' :
    glowColor === 'teal' ? 'hover:faculty-glow-teal' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className={`faculty-card p-5 ${onClick ? 'cursor-pointer' : ''} ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
