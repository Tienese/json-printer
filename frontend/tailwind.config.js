/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',  // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // ===== LIGHT MODE (existing) =====
        'app-gray': '#525659',
        'sidebar-bg': '#f8f9fa',
        'primary-blue': '#4a90d9',
        'selected-bg': '#e8f1fb',
        'focus-bg': '#eef',
        'correct': '#2e7d32',
        'muted': '#666',

        // ===== DARK MODE (CodeRabbit-inspired) =====
        // Warm dark backgrounds
        'dark-bg': '#0e0b0b',           // Main background - warm dark
        'dark-surface': '#141111',       // Cards, sidebar - slightly lighter
        'dark-elevated': '#1a1614',      // Elevated surfaces, hovers

        // Text colors - warm off-whites
        'dark-text': '#e6e1de',          // Primary text
        'dark-text-secondary': '#a6a19e', // Body/muted text
        'dark-text-muted': '#6e6a67',    // Very muted

        // Accent - CodeRabbit coral/orange
        'dark-accent': '#ff570a',        // Primary accent (links, buttons)
        'dark-accent-hover': '#ff7033',  // Lighter hover state
        'dark-accent-muted': 'rgba(255, 87, 10, 0.1)', // Subtle highlight

        // Borders & UI
        'dark-border': 'rgba(230, 225, 222, 0.1)', // Subtle borders
        'dark-border-strong': '#3f3f46', // Stronger borders

        // Semantic dark
        'dark-correct': '#4ade80',       // Green for correct answers
        'dark-error': '#f87171',         // Red for errors
        'dark-warning': '#fbbf24',       // Yellow for warnings
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans JP"', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in',
      },
      // Dark mode specific styling
      backgroundColor: {
        'dark-active': 'rgba(255, 87, 10, 0.1)',
      }
    },
  },
  plugins: [],
}
