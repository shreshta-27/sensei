'use client';
import React from 'react';

type RiskLevel = 'high' | 'medium' | 'low';

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

const map: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  high:   { bg: 'var(--risk-high-bg)', text: 'var(--risk-high-text)', label: 'High' },
  medium: { bg: 'var(--risk-med-bg)',  text: 'var(--risk-med-text)',  label: 'Medium' },
  low:    { bg: 'var(--risk-low-bg)',  text: 'var(--risk-low-text)',  label: 'Low' },
};

export default function RiskBadge({ level, label: propLabel }: RiskBadgeProps) {
  const { bg, text, label } = map[level];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full font-ui text-[11px] font-bold border border-current/15"
      style={{ background: bg, color: text }}
    >
      {propLabel || label}
    </span>
  );
}
