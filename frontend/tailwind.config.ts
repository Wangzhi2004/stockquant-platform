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
          primary: '#f5f5f7',
          secondary: '#ffffff',
          tertiary: '#f0f0f2',
          elevated: '#ffffff',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.72)',
          'bg-hover': 'rgba(255, 255, 255, 0.88)',
          'bg-active': 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(255, 255, 255, 0.5)',
          'border-highlight': 'rgba(255, 255, 255, 0.8)',
        },
        up: {
          DEFAULT: '#00c805',
          glow: 'rgba(0, 200, 5, 0.2)',
          subtle: 'rgba(0, 200, 5, 0.12)',
        },
        down: {
          DEFAULT: '#ff5000',
          glow: 'rgba(255, 80, 0, 0.2)',
          subtle: 'rgba(255, 80, 0, 0.12)',
        },
        accent: {
          DEFAULT: '#0071e3',
          glow: 'rgba(0, 113, 227, 0.2)',
          subtle: 'rgba(0, 113, 227, 0.12)',
        },
        warning: {
          DEFAULT: '#ff9500',
          glow: 'rgba(255, 149, 0, 0.2)',
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
        'glass': '0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'glow-up': '0 0 20px rgba(0, 200, 5, 0.15), 0 0 40px rgba(0, 200, 5, 0.05)',
        'glow-down': '0 0 20px rgba(255, 80, 0, 0.15), 0 0 40px rgba(255, 80, 0, 0.05)',
        'glow-accent': '0 0 20px rgba(0, 113, 227, 0.15), 0 0 40px rgba(0, 113, 227, 0.05)',
      },
      animation: {
        'card-enter': 'card-enter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'ambient-flow': 'ambient-flow 15s ease infinite',
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
      },
    },
  },
  plugins: [],
} satisfies Config
