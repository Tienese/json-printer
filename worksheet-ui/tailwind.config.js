/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-gray': '#525659',
        'sidebar-bg': '#f8f9fa',
        'primary-blue': '#4a90d9',
        'selected-bg': '#e8f1fb',
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans JP"', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in',
      }
    },
  },
  plugins: [],
}