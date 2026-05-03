/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0f1117',
          800: '#161b22',
          700: '#1c2230',
          600: '#21293a',
          500: '#2a3447',
        },
        priority: {
          high: '#f97316',
          medium: '#a855f7',
          low: '#3b82f6',
          done: '#22c55e',
          overdue: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
