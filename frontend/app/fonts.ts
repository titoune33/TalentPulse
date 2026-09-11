import localFont from "next/font/local";

/**
 * Type system — self-hosted on purpose.
 *
 * `next/font/google` fetches at build time, which would make an offline build
 * (or a buyer's firewall) fail. These files ship with the repo instead, so the
 * build is deterministic and no visitor ever hits a third-party CDN.
 *
 * - `sans`    Inter          → UI, body copy, everything functional
 * - `display` Instrument Serif → editorial accents only (hero, statements)
 * - `mono`    IBM Plex Mono   → figures, KPIs, table numbers
 */

export const sans = localFont({
  src: [{ path: "./fonts/inter-latin.woff2", style: "normal" }],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: false,
});

export const display = localFont({
  src: [
    { path: "./fonts/instrument-serif-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
});

export const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
});

export const fontClassName = `${sans.variable} ${display.variable} ${mono.variable}`;
