/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f4f6f4',
          100: '#e9ede9',
          200: '#c7d2c7',
          300: '#a5b7a5',
          400: '#618161',
          500: '#2d4a34', // Brand Primary
          600: '#29432f',
          700: '#223827',
          800: '#1b2d1f',
          900: '#162519',
        },
        cream: {
          50: '#fdfdfc',
          100: '#f7f5f0', // Brand Background
          200: '#eceae4',
          300: '#e1dfd8',
          400: '#c5c2b6',
        },
        institutional: {
          amber: '#b8741a',
          red: '#a0402a',
          green: '#5a7a4a',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
