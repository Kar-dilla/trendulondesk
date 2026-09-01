import type { Config } from "tailwindcss";

// Brand tokens taken directly from the Trendulon brand sheet
// (#0D0D0D, #2A2A2A, #F2F2F2, #FF6A00 / Poppins).
//
// Redesign note: this is a newsroom control desk, not a SaaS product.
// Corners are near-flat (2px, not rounded-2xl), there is no card shadow
// token, and hierarchy is built with rules/borders/type-weight rather than
// boxes. See app/page.tsx and src/dashboard/components for the result.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        trendulon: {
          black: "#0D0D0D",
          charcoal: "#2A2A2A",
          fog: "#F2F2F2",
          orange: "#FF6A00",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "2px",
      },
      fontSize: {
        "2xs": "0.6875rem",
      },
    },
  },
  plugins: [],
};

export default config;
