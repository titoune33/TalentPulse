/**
 * Captures real screenshots of the running product.
 *
 * The landing page shows these images instead of invented mockups: what a
 * visitor sees on the marketing page is exactly what the app renders.
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs            # expects the app on :3000
 *   BASE_URL=http://localhost:3100 node scripts/...
 *
 * Prerequisites: backend on :8000 (seeded) and the frontend served on BASE_URL.
 */

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/product");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@talentpulse.app";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo1234";

/** Device pixel ratio 2 → crisp on retina, still reasonable in weight. */
const SCALE = 2;

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();

  /* ---------- Wide shots (desktop app) ---------- */
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: SCALE,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    reducedMotion: "reduce",
  });
  const page = await desktop.newPage();

  // --- Login ---
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("vous@entreprise.com").fill(DEMO_EMAIL);
  await page.getByPlaceholder("••••••••").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/dashboard$/);
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1200); // let Chart.js finish its entry animation

  // --- Dashboard (hero shot) ---
  await page.screenshot({ path: `${OUT}/dashboard.png` });
  console.log("✓ dashboard.png");

  // --- Analytics ---
  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await page.waitForURL(/\/analytics$/);
  await page.waitForSelector("canvas");
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/analytique.png` });
  console.log("✓ analytique.png");

  // --- Talents ---
  await page.getByRole("link", { name: "Talents", exact: true }).click();
  await page.waitForURL(/\/talents$/);
  await page.waitForSelector("table tbody tr");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/talents.png` });
  console.log("✓ talents.png");

  // --- Reports ---
  await page.getByRole("link", { name: "Rapports", exact: true }).click();
  await page.waitForURL(/\/reports$/);
  await page.getByRole("button", { name: "Générer le rapport" }).click();
  await page.waitForSelector("#print-area");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/rapport.png` });
  console.log("✓ rapport.png");

  // --- Retention plan drawer (captured as its own element) ---
  await page.getByRole("link", { name: "Tableau bord", exact: true }).click();
  await page.waitForURL(/\/dashboard$/);
  await page.getByRole("button", { name: /Ouvrir le plan d'action/ }).click();
  const drawer = page.getByRole("dialog", { name: "Plan de rétention" });
  await drawer.waitFor();
  await page.waitForTimeout(500);

  // The blurred top bar composites above the drawer in headless screenshots,
  // leaking the account menu into the shot. Hide the chrome for this one frame.
  await page.evaluate(() => {
    document.querySelectorAll("header, aside").forEach((el) => {
      el.setAttribute("data-capture-hidden", "true");
      el.style.visibility = "hidden";
    });
  });
  await page.waitForTimeout(150);
  await drawer.screenshot({ path: `${OUT}/plan-retention.png` });
  await page.evaluate(() => {
    document.querySelectorAll("[data-capture-hidden]").forEach((el) => {
      el.removeAttribute("data-capture-hidden");
      el.style.visibility = "";
    });
  });
  console.log("✓ plan-retention.png");

  await desktop.close();

  /* ---------- Narrow shot (mobile proof) ---------- */
  const mobile = await browser.newContext({
    viewport: { width: 414, height: 896 },
    deviceScaleFactor: SCALE,
    isMobile: true,
    hasTouch: true,
    locale: "fr-FR",
    reducedMotion: "reduce",
  });
  const mpage = await mobile.newPage();
  await mpage.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
  await mpage.getByPlaceholder("vous@entreprise.com").fill(DEMO_EMAIL);
  await mpage.getByPlaceholder("••••••••").fill(DEMO_PASSWORD);
  await mpage.getByRole("button", { name: "Se connecter" }).click();
  await mpage.waitForURL(/\/dashboard$/);
  await mpage.waitForSelector("canvas");
  await mpage.waitForTimeout(1200);
  await mpage.screenshot({ path: `${OUT}/dashboard-mobile.png` });
  console.log("✓ dashboard-mobile.png");
  await mobile.close();

  /* ---------- Landing page (for the video + OG image) ---------- */
  const landing = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: SCALE,
    locale: "fr-FR",
    reducedMotion: "reduce",
  });
  const lpage = await landing.newPage();
  await lpage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await lpage.waitForTimeout(800);
  await lpage.screenshot({ path: `${OUT}/landing-hero.png` });
  console.log("✓ landing-hero.png");

  // Open Graph card: 1200×630, the size every social platform expects.
  await lpage.setViewportSize({ width: 1200, height: 630 });
  await lpage.waitForTimeout(500);
  await lpage.screenshot({ path: resolve(ROOT, "public/og.png") });
  console.log("✓ og.png");
  await landing.close();

  await browser.close();
  console.log(`\nScreenshots written to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
