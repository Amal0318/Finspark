/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          cyan: "#06B6D4",
          sky: "#38BDF8",
          indigo: "#6366F1",
          // Backgrounds
          bg: "#0B1220",
          secondary: "#111827",
          sidebar: "#0F172A",
          card: "#1F2937",
          modal: "#1E293B",
          hover: "#273549",
          selected: "#334155",
          // Text Colors
          textPrimary: "#F9FAFB",
          textSecondary: "#CBD5E1",
          textMuted: "#94A3B8",
          textDisabled: "#64748B",
          // Borders
          borderPrimary: "#374151",
          borderSecondary: "#475569",
          divider: "#334155",
          // Statuses
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#3B82F6",
          orange: "#F97316",
          red: "#DC2626"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.25)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.35)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
