import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bangers', 'cursive'],
        body: ['Patrick Hand', 'cursive'],
        mono: ['Courier Prime', 'monospace'],
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito Sans', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        raleway: ['Raleway', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        'hero': ['Cinzel Decorative', 'cursive'],
        'admin-body': ['Nunito', 'sans-serif'],
        'admin-label': ['Rajdhani', 'sans-serif'],
        'admin-data': ['Share Tech Mono', 'monospace'],

        'faculty': ['Inter', 'sans-serif'],
        'faculty-heading': ['Space Grotesk', 'sans-serif'],
        'faculty-data': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'sensei-gold': 'var(--s-primary)',
        'sensei-coral': 'var(--s-coral)',
        'sensei-mint': 'var(--s-mint)',
        'sensei-blue': 'var(--s-blue)',
        'sensei-purple': 'var(--s-purple)',
        'sensei-pink': 'var(--s-pink)',
        'sensei-cyan': 'var(--s-cyan)',

        'faculty-bg': 'var(--f-bg)',
        'faculty-surface': 'var(--f-surface)',
        'faculty-surface-hover': 'var(--f-surface-hover)',
        'faculty-border': 'var(--f-border)',
        'faculty-text': 'var(--f-text)',
        'faculty-text-secondary': 'var(--f-text-secondary)',
        'faculty-ember': 'var(--f-ember)',
        'faculty-ember-light': 'var(--f-ember-light)',
        'faculty-success': 'var(--f-success)',
        'faculty-warning': 'var(--f-warning)',
        'faculty-danger': 'var(--f-danger)',
        'faculty-teal': 'var(--f-teal)',
        'faculty-purple': 'var(--f-purple)',

        /* Admin Pastel Theme */
        'adm-bg': 'var(--adm-bg)',
        'adm-surface': 'var(--adm-surface)',
        'adm-border': 'var(--adm-border-solid)',
        'adm-text': 'var(--adm-text)',
        'adm-text-sub': 'var(--adm-text-sub)',
        'adm-text-muted': 'var(--adm-text-muted)',
        'adm-accent': 'var(--adm-accent)',
        'adm-accent-light': 'var(--adm-accent-light)',
        'adm-high': 'var(--adm-high)',
        'adm-medium': 'var(--adm-medium)',
        'adm-info': 'var(--adm-info)',
        'adm-low': 'var(--adm-low)',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float-gentle 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
