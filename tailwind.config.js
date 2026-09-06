/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aureus: {
          black: "#0a0a0b",
          darker: "#0f0f11",
          dark: "#161618",
          card: "#1a1a1e",
          border: "#2a2a30",
          muted: "#6b6b76",
          soft: "#a1a1aa",
          gold: "#d4a84b",
          "gold-light": "#e8c872",
          "gold-dim": "#8a6d2f",
          danger: "#ef4444",
          success: "#22c55e",
          warn: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(212, 168, 75, 0.12)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
