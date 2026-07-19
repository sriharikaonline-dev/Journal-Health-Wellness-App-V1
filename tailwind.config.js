/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#effdfb',
          100: '#d9faf4',
          200: '#b5f3ea',
          300: '#7ee7d9',
          400: '#3dd0c1',
          500: '#16b3a6',
          600: '#0c8f86',
          700: '#0f726c',
          800: '#105a56',
          900: '#104b48',
          950: '#022c2a',
        },
        hotpink: {
          50: '#fef1f7',
          100: '#fde7f0',
          200: '#fdd0e3',
          300: '#fca8cd',
          400: '#ff74ad',
          500: '#fb3d8a',
          600: '#e91e6e',
          700: '#c4145a',
          800: '#a2144c',
          900: '#871443',
          950: '#4d0520',
        },
        sunny: {
          50: '#fefce8',
          100: '#fff9c3',
          200: '#fff05a',
          300: '#ffe426',
          400: '#ffcf0a',
          500: '#f5b400',
          600: '#d28d00',
          700: '#a56500',
          800: '#874e03',
          900: '#744107',
          950: '#422300',
        },
        navy: {
          50: '#eef2f9',
          100: '#d9e1f0',
          200: '#b6c5e3',
          300: '#8aa2d1',
          400: '#5c7cba',
          500: '#3c5e9d',
          600: '#2c4781',
          700: '#263c6a',
          800: '#1f2f54',
          900: '#1a2746',
          950: '#101634',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(16, 23, 70, 0.18)',
        glow: '0 0 0 6px rgba(22, 179, 166, 0.15)',
        'glow-pink': '0 0 0 6px rgba(251, 61, 138, 0.15)',
        'glow-yellow': '0 0 0 6px rgba(245, 180, 0, 0.18)',
        'glow-navy': '0 0 0 6px rgba(31, 47, 84, 0.12)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 15% 20%, rgba(22,179,166,0.18) 0, transparent 45%), radial-gradient(circle at 85% 15%, rgba(251,61,138,0.16) 0, transparent 40%), radial-gradient(circle at 70% 80%, rgba(245,180,0,0.14) 0, transparent 45%)',
        'bubble-fade':
          'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 100%)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-3deg)' },
        },
        'pop-in': {
          '0%': { opacity: 0, transform: 'scale(0.92) translateY(8px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'float-slower': 'float-slower 9s ease-in-out infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-up': 'fade-up 0.6s ease-out both',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        shake: 'shake 0.45s ease-in-out both',
      },
    },
  },
  plugins: [],
};
