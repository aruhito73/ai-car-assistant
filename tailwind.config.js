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
        darkBg: '#09090b',
        darkCard: 'rgba(24, 24, 27, 0.65)',
        // Keeping the neon names for compatibility, but making them premium and sleek
        neonCyan: '#3b82f6', // Premium Blue
        neonEmerald: '#10b981', // Clean Emerald
        neonRose: '#ef4444', // Sharp Red
        neonAmber: '#f59e0b', // Clean Amber
        accent: '#ffffff',
      },
      boxShadow: {
        'neon-cyan': '0 4px 20px -2px rgba(59, 130, 246, 0.15)',
        'neon-emerald': '0 4px 20px -2px rgba(16, 185, 129, 0.15)',
        'neon-rose': '0 4px 20px -2px rgba(239, 68, 68, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'spring-soft': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        }
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
}
