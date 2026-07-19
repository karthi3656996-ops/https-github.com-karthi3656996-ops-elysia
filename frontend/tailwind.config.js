/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans:    ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // New Elysia theme palette
        primary:   { DEFAULT: '#FF7A18', light: '#FF9A50', dark: '#E06510' },
        secondary: { DEFAULT: '#FF4D9D', light: '#FF7ABB', dark: '#E0358A' },
        accent:    { DEFAULT: '#7B2FF7', light: '#A855F7', dark: '#6020D0' },
        // Dark backgrounds
        dark: {
          950: '#0F0818',
          900: '#1A102C',
          800: '#241638',
          700: '#2E1C45',
        },
      },
      backgroundImage: {
        'gradient-primary':  'linear-gradient(135deg, #FF7A18, #FF4D9D)',
        'gradient-sunset':   'linear-gradient(135deg, #FF7A18, #FF4D9D, #7B2FF7)',
        'gradient-aurora':   'linear-gradient(135deg, #FF4D9D, #7B2FF7)',
        'gradient-fire':     'linear-gradient(135deg, #FF7A18, #7B2FF7)',
      },
      animation: {
        'float':       'float 4s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 6s ease-in-out infinite alternate',
        'aurora':      'aurora 12s ease-in-out infinite alternate',
        'node-pulse':  'node-pulse 3s ease-in-out infinite',
        'fade-in-up':  'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        'glow-pulse': {
          '0%':   { opacity: '0.4', transform: 'scale(1)' },
          '100%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'node-pulse': {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' },
        },
      },
      borderRadius: {
        card: '20px',
        xl2: '18px',
      },
      boxShadow: {
        'orange-glow': '0 0 30px rgba(255, 122, 24, 0.4)',
        'pink-glow':   '0 0 30px rgba(255, 77, 157, 0.4)',
        'purple-glow': '0 0 30px rgba(123, 47, 247, 0.4)',
      },
    },
  },
  plugins: [],
}
