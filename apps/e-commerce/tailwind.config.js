/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sabai: {
          dark: '#1a1a2e',
          surface: '#16213e',
          card: '#1f2b47',
          gold: '#d4af37',
          'gold-light': '#e8c547',
          text: '#ffffff',
          muted: '#8892b0',
          error: '#e74c3c',
        },
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
