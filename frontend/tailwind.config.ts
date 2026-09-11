import type { Config } from "tailwindcss";

/**
 * TalentPulse design tokens — "institutional light".
 *
 * Intent: a sober, print-inspired interface that a DRH can show to a COMEX
 * without blushing. Warm paper neutrals, one cobalt accent, deep semantic
 * colours, tight radii, diffuse shadows. No gradients, no glow, no purple.
 */

/* Single accent: institutional cobalt. Also exposed as `primary` so any
   not-yet-migrated markup keeps rendering during the redesign. */
const cobalt = {
  50: "#EEF2FE",
  100: "#DBE4FD",
  200: "#BCCDFA",
  300: "#8FA9F5",
  400: "#5C7FEE",
  500: "#2F5AE0",
  600: "#1A43C4",
  700: "#1536A0",
  800: "#142E80",
  900: "#152A66",
  950: "#0E1B3D",
};

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* --- Surfaces: warm paper, never pure blue-grey --- */
        paper: "#FAFAF8",
        surface: "#FFFFFF",
        sunken: "#F3F2ED",
        line: {
          DEFAULT: "#E6E4DD",
          strong: "#D5D2C8",
        },

        /* --- Text --- */
        ink: {
          DEFAULT: "#14161A",
          2: "#4B5058",
          3: "#82868E",
          4: "#A9ADB4",
        },

        accent: cobalt,
        primary: cobalt,

        /* --- Dark moments (footer, inverted CTA bands) --- */
        graphite: {
          700: "#2A2E35",
          800: "#1E2126",
          900: "#14161A",
          950: "#0C0E11",
        },

        /* --- Semantics: deep and serious, not fluorescent --- */
        danger: { 50: "#FDF3F2", 100: "#F9E2DF", 500: "#C0392B", 600: "#B3261E", 700: "#8F1D17" },
        warn: { 50: "#FDF7EC", 100: "#F7E8CE", 500: "#B4711B", 600: "#96590F", 700: "#7A470B" },
        ok: { 50: "#EFF8F3", 100: "#D6EDE2", 500: "#12805E", 600: "#0B6B4F", 700: "#085640" },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      fontSize: {
        micro: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.09em" }],
        small: ["0.8125rem", { lineHeight: "1.55" }],
        base: ["0.9375rem", { lineHeight: "1.65" }],
        lead: ["1.0625rem", { lineHeight: "1.6" }],
        title: ["1.125rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        h3: ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        h2: ["1.875rem", { lineHeight: "1.15", letterSpacing: "-0.022em" }],
        h1: ["2.5rem", { lineHeight: "1.08", letterSpacing: "-0.028em" }],
        display: ["3.5rem", { lineHeight: "1.02", letterSpacing: "-0.032em" }],
      },

      boxShadow: {
        hairline: "0 0 0 1px rgba(20, 22, 26, 0.06)",
        card: "0 1px 2px rgba(20,22,26,0.04), 0 1px 3px rgba(20,22,26,0.03)",
        lift: "0 8px 24px -10px rgba(20,22,26,0.14), 0 2px 6px -2px rgba(20,22,26,0.05)",
        float: "0 28px 64px -24px rgba(20,22,26,0.26), 0 10px 24px -14px rgba(20,22,26,0.12)",
        frame: "0 40px 90px -32px rgba(20,22,26,0.35), 0 12px 30px -18px rgba(20,22,26,0.18)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.6)",
      },

      borderRadius: {
        sm: "0.3125rem",
        DEFAULT: "0.4375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        fadeIn: "fadeIn 0.3s ease-out both",
        slideInRight: "slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
        scaleIn: "scaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
      },

      maxWidth: {
        prose: "68ch",
        shell: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
