import React from 'react';
import { motion } from 'framer-motion';

interface PaperSheetProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  delay?: number;
}

const PaperSheet: React.FC<PaperSheetProps> = ({ 
  children, 
  title, 
  className = '',
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`paper-sheet ${className}`}
    >
      {title && (
        <h3 className="handwriting text-2xl font-bold mb-6 text-[#2D3436] border-b-2 border-dashed border-gray-200 pb-2">
          {title}
        </h3>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default PaperSheet;
