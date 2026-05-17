'use client';
import React from 'react';

interface NotebookInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function NotebookInput({ label, error, className = '', ...props }: NotebookInputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1 ml-1">{label}</label>
      )}
      <input
        className={`
          w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0
          px-2 py-2 font-body text-[15px] outline-none
          focus:border-b-[var(--accent-purple)] transition-colors duration-200
          placeholder:text-[var(--text-muted)]/50
          ${error ? 'border-b-red-400' : ''}
          ${className}
        `}
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 26px, var(--border-card) 26px, var(--border-card) 27px)',
          lineHeight: '28px',
        }}
        {...props}
      />
      {error && <p className="mt-1 font-ui text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
