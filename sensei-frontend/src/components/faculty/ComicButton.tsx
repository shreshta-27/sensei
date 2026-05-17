'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface ComicButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

const variantStyles: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
  primary: { bg: 'var(--accent-purple)', text: '#fff', border: 'var(--accent-purple)', shadow: '3px 3px 0 var(--accent-purple)' },
  secondary: { bg: '#fff', text: 'var(--accent-purple)', border: 'var(--accent-purple)', shadow: '3px 3px 0 var(--accent-purple)' },
  ghost: { bg: 'transparent', text: 'var(--text-secondary)', border: 'var(--border-card)', shadow: '2px 2px 0 #D6D0C8' },
  danger: { bg: 'var(--accent-red)', text: '#fff', border: 'var(--accent-red)', shadow: '3px 3px 0 #DC2626' },
};

const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2 text-sm', lg: 'px-7 py-3 text-base' };

export default function ComicButton({ children, variant = 'primary', size = 'md', icon, onClick, className = '', disabled, loading, type = 'button' }: ComicButtonProps) {
  const vs = variantStyles[variant];
  return (
    <motion.button
      whileHover={{ y: -2, rotate: -1 }}
      whileTap={{ scale: 0.96, y: 1, rotate: 0 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius)]
        font-ui font-bold border-2 border-[var(--border-doodle)]
        ${sizeClasses[size]}
        transition-all duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{ background: vs.bg, color: vs.text, borderColor: vs.border, boxShadow: vs.shadow }}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
