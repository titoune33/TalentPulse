import { expect, test } from "@playwright/test";
import { expectNoPageErrors, trackPageErrors } from "./helpers";

test.describe("Landing page", () => {
  test("renders the value proposition and the ROI simulator", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Ne subissez plus les démissions clés/i })
    ).toBeVisible();

    // The ROI simulator must react to its sliders.
    const savings = page.locator("text=/\\+[\\d\\s]+ € \\/ an/").first();
    await expect(savings).toBeVisible();
    const before = await savings.textContent();

    const headcount = page.locator('input[type="range"]').first();
    await headcount.fill("400");
    await expect(page.locator("text=/400 personnes/")).toBeVisible();
    await expect(savings).not.toHaveText(before ?? "");

    expectNoPageErrors(errors);
  });

  test("shows the three plans and the FAQ", async ({ page }) => {
    await page.goto("/#tarifs");

    for (const plan of ["Starter", "Pro", "Entreprise"]) {
      await expect(page.getByRole("heading", { name: plan, exact: true })).toBeVisible();
    }

    // Yearly is the default view; the monthly toggle must switch the prices.
    await expect(page.getByText("39 €", { exact: true })).toBeVisible();
    await expect(page.getByText("119 €", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Mensuel" }).click();
    await expect(page.getByText("49 €", { exact: true })).toBeVisible();
    await expect(page.getByText("149 €", { exact: true })).toBeVisible();

    await expect(page.locator("#faq").getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(page.getByText(/Aucune donnée nominative ne quitte votre infrastructure/)).toBeVisible();
  });

  test("the primary call to action leads to the login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Essayer la démo interactive/i }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
