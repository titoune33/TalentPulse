import { expect, test } from "@playwright/test";
import { expectNoPageErrors, trackPageErrors } from "./helpers";

test.describe("Landing page", () => {
  test("states the proposition and proves it with a real product shot", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: /Sachez qui va partir/i })).toBeVisible();

    // The hero must show the actual product, not a decorative abstract.
    const shot = page.getByRole("img", { name: /Tableau de bord exécutif de TalentPulse/i }).first();
    await expect(shot).toBeVisible();
    await expect(shot).toHaveJSProperty("naturalWidth", await shot.evaluate((el) => (el as HTMLImageElement).naturalWidth));
    expect(await shot.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(500);

    expectNoPageErrors(errors);
  });

  test("the ROI simulator reacts to its sliders", async ({ page }) => {
    await page.goto("/#simulateur");

    const savings = page.getByTestId("annual-savings");
    await expect(savings).toBeVisible();
    const before = await savings.textContent();

    // The headcount slider is the first range control on the page.
    await page.locator('input[type="range"]').first().fill("400");
    await expect(page.getByText("400 personnes")).toBeVisible();
    await expect(savings).not.toHaveText(before ?? "");

    expect(await savings.textContent()).toMatch(/\+\s?[\d\s\u202f\u00a0]+ €/);
  });

  test("shows the three plans, the toggle and the FAQ", async ({ page }) => {
    await page.goto("/#tarifs");

    for (const plan of ["Starter", "Pro", "Entreprise"]) {
      await expect(page.getByRole("heading", { name: plan, exact: true })).toBeVisible();
    }

    // Monthly prices are the default view.
    await expect(page.getByText("49 €", { exact: true })).toBeVisible();
    await expect(page.getByText("149 €", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Annuel" }).click();
    await expect(page.getByText("39 €", { exact: true })).toBeVisible();
    await expect(page.getByText("119 €", { exact: true })).toBeVisible();

    await expect(page.locator("#faq").getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(page.getByText(/Aucune donnée nominative ne quitte votre infrastructure/)).toBeVisible();
  });

  test("the primary call to action leads to the login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Explorer la démo/i }).first().click();

    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test("the product tour shows each feature with its own screenshot", async ({ page }) => {
    await page.goto("/#produit");

    for (const name of [
      /Tableau de bord exécutif de TalentPulse/i,
      /Plan de rétention d'un collaborateur/i,
      /Rapport exécutif TalentPulse/i,
    ]) {
      const img = page.getByRole("img", { name }).first();
      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible();
      expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(300);
    }
  });
});
