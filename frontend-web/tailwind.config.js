/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mediflow brand palette (from screenshots: deep navy + cyan blue)
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe2fe',
          300: '#93d0fd',
          400: '#60b4fa',
          500: '#3b93f6',
          600: '#2575eb',
          700: '#1e5fd8',
          800: '#1e4eaf',
          900: '#1f438a',
          950: '#0e2344',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e3',
          300: '#b1b9cb',
          400: '#8791ad',
          500: '#687294',
          600: '#525b7a',
          700: '#434a63',
          800: '#3a4054',
          900: '#1c2340',
          950: '#0f1425',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(15,20,37,0.12)',
        card: '0 4px 16px -4px rgba(15,20,37,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
