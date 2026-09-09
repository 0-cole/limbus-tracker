/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/index.html',
  ],
  theme: {
    extend: {
      colors: {
        limbus: {
          bg: '#0a0a0a',
          surface: '#141414',
          card: '#1a1a1a',
          border: '#2a2a2a',
          accent: '#c9a84c',
          'accent-dim': '#8a7030',
          gold: '#fbbf24',
          muted: '#737373',
          text: '#e5e5e5',
        },
        sin: {
          wrath: '#dc2626',
          lust: '#ea580c',
          sloth: '#ca8a04',
          gluttony: '#16a34a',
          gloom: '#0ea5e9',
          pride: '#4f46e5',
          envy: '#9333ea',
        },
        keyword: {
          burn: '#ef4444',
          bleed: '#dc2626',
          tremor: '#d97706',
          rupture: '#22c55e',
          sinking: '#3b82f6',
          poise: '#06b6d4',
          charge: '#8b5cf6',
        },
        rarity: {
          o: '#9ca3af',
          oo: '#60a5fa',
          ooo: '#fbbf24',
        }
      },
      fontFamily: {
        limbus: ['Limbus', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bubble-in': 'bubble-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201, 168, 76, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bubble-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
