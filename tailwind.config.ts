import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-body)', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      colors: {
        navy: {
          DEFAULT: '#080d1a',
          light:   '#0d1526',
          mid:     '#111e35',
        },
        gold: {
          DEFAULT: '#4aab78',
          light:   '#6dbf96',
          dim:     '#2a7050',
        },
        brand: {
          50:  '#f0faf5',
          100: '#d6f0e3',
          200: '#aadfc6',
          300: '#74c8a3',
          400: '#4aab78',
          500: '#2d8f5e',
          600: '#1f7048',
          700: '#175436',
          800: '#0f3a25',
          900: '#082417',
          950: '#04120c',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        shimmer:      'shimmer 1.6s linear infinite',
        'pulse-ring': 'pulse-ring 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
