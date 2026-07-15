/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0B0F19",
          card: "rgba(17, 24, 39, 0.7)",
          border: "rgba(31, 41, 55, 0.8)",
          glow: "#06B6D4",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.25)',
        'glow-rose': '0 0 15px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
