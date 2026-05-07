import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#05070a',
          secondary: '#0a0e17',
          tertiary: '#0f1420',
          elevated: '#141a2a',
        },
        glass: {
          bg: 'rgba(15, 20, 35, 0.6)',
          'bg-hover': 'rgba(20, 26, 45, 0.75)',
          'bg-active': 'rgba(25, 32, 55, 0.85)',
          border: 'rgba(255, 255, 255, 0.06)',
          'border-highlight': 'rgba(255, 255, 255, 0.12)',
        },
        up: {
          DEFAULT: '#00e5a0',
          glow: 'rgba(0, 229, 160, 0.2)',
          subtle: 'rgba(0, 229, 160, 0.12)',
        },
        down: {
          DEFAULT: '#ff4567',
          glow: 'rgba(255, 69, 103, 0.2)',
          subtle: 'rgba(255, 69, 103, 0.12)',
        },
        accent: {
          DEFAULT: '#5b8def',
          glow: 'rgba(91, 141, 239, 0.2)',
          subtle: 'rgba(91, 141, 239, 0.12)',
        },
        warning: {
          DEFAULT: '#ffb347',
          glow: 'rgba(255, 179, 71, 0.2)',
        },
        text: {
          primary: '#e8eaed',
          secondary: '#8b8fa3',
          tertiary: '#5a5e72',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['SF Pro Display', '-apple-system', 'Helvetica Neue', 'sans-serif'],
        body: ['SF Pro Text', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        glass: '20px',
        'glass-sm': '12px',
        'glass-lg': '24px',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glow-up': '0 0 20px rgba(0, 229, 160, 0.15), 0 0 40px rgba(0, 229, 160, 0.05)',
        'glow-down': '0 0 20px rgba(255, 69, 103, 0.15), 0 0 40px rgba(255, 69, 103, 0.05)',
        'glow-accent': '0 0 20px rgba(91, 141, 239, 0.15), 0 0 40px rgba(91, 141, 239, 0.05)',
      },
      animation: {
        'card-enter': 'card-enter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ambient-flow': 'ambient-flow 15s ease infinite',
        'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'spin-slow': 'spin 1.5s linear infinite',
        'toast-enter': 'toast-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'toast-exit': 'toast-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'status-pulse': 'status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'card-enter': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 15px currentColor, 0 0 30px currentColor' },
        },
        'ambient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'toast-enter': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-exit': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'status-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
