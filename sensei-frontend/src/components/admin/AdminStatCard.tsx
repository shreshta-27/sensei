'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  accentColor: string;
  trend?: string;
  trendUp?: boolean;
  trendLabel?: string;
  suffix?: string;
  delay?: number;
  isPercentage?: boolean;
  href?: string;
}

function useCountUp(end: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * end));
        if (progress < 1) frameRef.current = requestAnimationFrame(step);
      };
      frameRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, delay]);

  return count;
}

export default function AdminStatCard({
  label,
  value,
  icon,
  bgColor,
  accentColor,
  trend,
  trendUp,
  trendLabel = 'vs last month',
  suffix = '',
  delay = 0,
  isPercentage = false,
  href,
}: AdminStatCardProps) {
  const router = useRouter();
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const count = useCountUp(numericValue, 1200, delay);

  const displayValue = isPercentage
    ? `${count}%`
    : typeof value === 'string' && isNaN(numericValue)
    ? value
    : count.toLocaleString() + suffix;

  const handleClick = () => {
    if (href) router.push(href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 group ${href ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        background: bgColor,
        border: `1.5px solid ${accentColor}22`,
        boxShadow: `0 2px 12px ${accentColor}18`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      whileHover={{ y: -3, boxShadow: `0 8px 24px ${accentColor}28` }}
      onClick={handleClick}
    >
      {/* Decorative circle */}
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20"
        style={{ background: accentColor }}
      />

      {/* Icon + Arrow */}
      <div className="flex items-center justify-between relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}20` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        {href && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 -translate-x-1"
            style={{ background: `${accentColor}15` }}
          >
            <ArrowRight size={14} style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative z-10">
        <p
          className="text-3xl font-bold leading-none mb-1 adm-count-fade"
          style={{ color: accentColor, fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {displayValue}
        </p>
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: accentColor, opacity: 0.7 }}
        >
          {label}
        </p>
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 relative z-10">
          {trendUp ? (
            <TrendingUp size={12} style={{ color: '#22C55E' }} />
          ) : (
            <TrendingDown size={12} style={{ color: '#EF4444' }} />
          )}
          <span
            className="text-[11px] font-semibold"
            style={{ color: trendUp ? '#16A34A' : '#DC2626' }}
          >
            {trend}
          </span>
          <span className="text-[10px]" style={{ color: accentColor, opacity: 0.6 }}>
            {trendLabel}
          </span>
        </div>
      )}

      {/* Clickable shimmer effect */}
      {href && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${accentColor}08 50%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}
