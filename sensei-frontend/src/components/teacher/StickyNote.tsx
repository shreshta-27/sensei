import React from 'react';
import { motion } from 'framer-motion';

interface StickyNoteProps {
  children: React.ReactNode;
  color?: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  rotation?: number;
  className?: string;
  delay?: number;
}

const colorMap = {
  yellow: 'bg-[#FFF9C4]',
  pink: 'bg-[#FCE4EC]',
  blue: 'bg-[#E1F5FE]',
  green: 'bg-[#E8F5E9]',
  orange: 'bg-[#FFF3E0]',
  purple: 'bg-[#F3E5F5]',
};

const StickyNote: React.FC<StickyNoteProps> = ({ 
  children, 
  color = 'yellow', 
  rotation = 0, 
  className = '',
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: rotation - 5 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      className={`sticky-note ${colorMap[color]} ${className}`}
    >
      <div className="w-full h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

export default StickyNote;
