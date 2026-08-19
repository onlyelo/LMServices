/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A0A0B',
          soft: '#111114',
          card: '#16161A',
          line: '#26262C',
        },
        gold: {
          DEFAULT: '#C9A24A',
          light: '#E3C77E',
          dark: '#8E6F2C',
        },
        cream: {
          DEFAULT: '#F4F1EA',
          dim: '#A9A69F',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.22em',
      },
      boxShadow: {
        lux: '0 24px 60px -20px rgba(0,0,0,0.75)',
        goldglow: '0 0 0 1px rgba(201,162,74,0.35), 0 20px 50px -24px rgba(201,162,74,0.45)',
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(90deg, transparent, #C9A24A, transparent)',
      },
    },
  },
  plugins: [],
}
