import { expect, type Page } from "@playwright/test";

export const DEMO_EMAIL = "demo@talentpulse.app";
export const DEMO_PASSWORD = "demo1234";

/** Browser noise that is not produced by the application. */
const IGNORED_CONSOLE = [/favicon/i, /Download the React DevTools/i];

/**
 * Fail a test if the page logs an error or throws.
 *
 * This is the cheapest guard against the class of bug we care about most:
 * a page that renders but whose data layer silently exploded.
 */
export function trackPageErrors(page: Page, ignored: RegExp[] = []): string[] {
  const errors: string[] = [];
  const skip = (text: string) =>
    IGNORED_CONSOLE.some((pattern) => pattern.test(text)) ||
    ignored.some((pattern) => pattern.test(text));

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (skip(text)) return;
    errors.push(text);
  });
  page.on("pageerror", (error) => {
    if (skip(error.message)) return;
    errors.push(error.message);
  });
  return errors;
}

export async function expectNoPageErrors(errors: string[]) {
  expect(errors, `Erreurs navigateur inattendues :\n${errors.join("\n")}`).toEqual([]);
}

/** Log in through the real form (not by injecting localStorage). */
export async function login(page: Page, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.goto("/auth/login");
  await page.getByPlaceholder("vous@entreprise.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** Log in with the one-click demo button. */
export async function demoLogin(page: Page) {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Explorer la démo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** Navigate using the sidebar. */
export async function openSection(page: Page, label: string) {
  await page.getByRole("link", { name: label, exact: true }).click();
}

/** A unique email so repeated runs never collide. */
export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@talentpulse-qa.com`;
}
