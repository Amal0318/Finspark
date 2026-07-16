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
          bg: "#0A0E1A",
          card: "rgba(15, 23, 42, 0.8)",
          border: "rgba(51, 65, 85, 0.5)",
          glow: "#3b82f6",
          emerald: "#10b981",
          rose: "#ef4444",
          amber: "#f59e0b"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'glow-emerald': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'glow-rose': '0 4px 12px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
