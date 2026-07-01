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
        darkBg: '#090d16',
        darkCard: 'rgba(15, 23, 42, 0.45)',
        neonCyan: '#06b6d4',
        neonEmerald: '#10b981',
        neonRose: '#f43f5e',
        neonAmber: '#f59e0b',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(6, 182, 212, 0.4)',
        'neon-emerald': '0 0 10px rgba(16, 185, 129, 0.4)',
        'neon-rose': '0 0 10px rgba(244, 63, 94, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}
