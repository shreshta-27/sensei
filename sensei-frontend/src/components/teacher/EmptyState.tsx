'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-faculty-surface flex items-center justify-center mb-4 border border-faculty-border">
        <Icon size={28} className="text-faculty-text-secondary" />
      </div>
      <h3 className="font-faculty-heading text-lg font-semibold text-faculty-text mb-2">{title}</h3>
      <p className="font-faculty text-sm text-faculty-text-secondary max-w-sm">{description}</p>
      {action && (
        <button onClick={action.onClick} className="faculty-btn mt-6">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
