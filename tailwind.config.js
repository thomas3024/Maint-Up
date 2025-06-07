/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: '#E8F4FD',
          'blue-dark': '#B8E0FC',
          green: '#E8F5E8',
          'green-dark': '#B8E6B8',
          coral: '#FFE8E8',
          'coral-dark': '#FFCCCB',
          purple: '#F0E8FF',
          'purple-dark': '#E0CCFF',
          yellow: '#FFF8E1',
          'yellow-dark': '#FFECB3',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};