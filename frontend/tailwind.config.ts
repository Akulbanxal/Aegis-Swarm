import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // High-end deep slate palette (Vercel/Linear inspired)
        'aegis': {
          base:     '#020617', // slate-950
          surface:  '#0f172a', // slate-900
          elevated: '#1e293b', // slate-800
          border:   '#334155', // slate-700
          cyan:     '#22d3ee', // cyan-400 (softer, luminous)
          amber:    '#f59e0b', // amber-500
          red:      '#ef4444', // red-500
          green:    '#10b981', // emerald-500
          purple:   '#a855f7', // purple-500
          text:     '#f8fafc', // slate-50
          muted:    '#94a3b8', // slate-400
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aegis-gradient': 'radial-gradient(circle at 50% -20%, rgba(34, 211, 238, 0.15), rgba(2, 6, 23, 1) 60%)',
        'glass-panel': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'pulse-cyan':    'pulse-cyan 3s ease-in-out infinite',
        'pulse-red':     'pulse-red 2s ease-in-out infinite',
        'fade-in-up':    'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow':     'spin 15s linear infinite',
        'spin-reverse':  'spin 20s linear infinite reverse',
        'float':         'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34, 211, 238, 0.1)' },
          '50%':       { boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)' },
          '50%':       { boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glow-cyan':   '0 0 30px -10px rgba(34, 211, 238, 0.5)',
        'glow-red':    '0 0 30px -10px rgba(239, 68, 68, 0.5)',
        'glow-amber':  '0 0 30px -10px rgba(245, 158, 11, 0.5)',
        'glass-inner': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      borderColor: {
        DEFAULT: '#1e293b',
      },
    },
  },
  plugins: [],
}

export default config
