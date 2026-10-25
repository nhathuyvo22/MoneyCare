/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6339DB',
          light: '#EEE8FF',
          dark: '#A78BFA',
        },
        success: { DEFAULT: '#16A085', dark: '#4DD4A4' },
        danger:  { DEFAULT: '#DC4444', dark: '#FF7C8A' },
        warning: { DEFAULT: '#E89B3B', dark: '#FFC66D' },
        bg:      { DEFAULT: '#F5F6FC', dark: '#101525' },
        surface: { DEFAULT: '#FFFFFF', dark: '#1B2337' },
        elevated:{ DEFAULT: '#F5F6FC', dark: '#242E45' },
        border:  { DEFAULT: '#E5E7EF', dark: '#303950' },
        text: {
          primary:   { DEFAULT: '#19213A', dark: '#F4F5FC' },
          secondary: { DEFAULT: '#737D96', dark: '#A3AEC7' },
        },
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(99,57,219,0.06)',
        sm:   '0 1px 3px rgba(0,0,0,0.08)',
        md:   '0 4px 16px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
