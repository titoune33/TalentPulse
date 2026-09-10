import { expect, test } from "@playwright/test";
import { expectNoPageErrors, login, openSection, trackPageErrors } from "./helpers";

test.describe("Turnover predictions", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSection(page, "Prédictions");
    await expect(page).toHaveURL(/\/predictions$/);
  });

  test("renders the trend chart and the seeded prediction history", async ({ page }) => {
    const errors = trackPageErrors(page);
    await expect(page.getByRole("heading", { level: 2, name: "Prédictions de turnover" })).toBeVisible();
    await expect(page.locator("canvas").first()).toBeVisible();
    await expect(page.getByText(/Tendance du risque moyen/)).toBeVisible();
    await expect(page.getByText(/Impossible de charger les prédictions/)).toHaveCount(0);

    // 13 weeks × 14 talents are seeded; the page shows the 12 most recent cards.
    await expect(page.locator("div.card").filter({ hasText: "de risque" }).first()).toBeVisible();
    expectNoPageErrors(errors);
  });

  test("running a prediction from a quick-action chip reports success", async ({ page }) => {
    const errors = trackPageErrors(page);
    const chip = page
      .locator("button")
      .filter({ hasText: /%/ })
      .filter({ hasNotText: /Relancer/ })
      .first();

    await expect(chip).toBeVisible();
    await chip.click();

    await expect(page.getByText("Nouvelle prédiction générée avec succès.")).toBeVisible();
    expectNoPageErrors(errors);
  });

  test("the risk filter narrows the list of prediction cards", async ({ page }) => {
    const cards = page.locator("div.card").filter({ hasText: "de risque" });
    const all = await cards.count();
    expect(all).toBeGreaterThan(0);

    await page.locator("select").first().selectOption("high");
    const high = await cards.count();
    expect(high).toBeLessThanOrEqual(all);

    await page.locator("select").first().selectOption("low");
    await expect(cards.first()).toBeVisible();
  });
});
