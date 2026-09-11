import { expect, test, type Page } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD, expectNoPageErrors, login, trackPageErrors } from "./helpers";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface TalentDto {
  id: number;
  first_name: string;
  last_name: string;
  satisfaction_score: number;
  engagement_score: number;
  turnover_risk: number;
}

/** Read the roster straight from the API so the UI can be cross-checked. */
async function fetchTalents(page: Page): Promise<TalentDto[]> {
  const tokenResponse = await page.request.post(`${API}/api/auth/token`, {
    form: { username: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  expect(tokenResponse.ok()).toBeTruthy();
  const { access_token } = await tokenResponse.json();

  const response = await page.request.get(`${API}/api/talents/`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe("Executive dashboard", () => {
  test("shows live KPIs, the risk split and the priority list", async ({ page }) => {
    const errors = trackPageErrors(page);
    await login(page);

    await expect(page.getByRole("heading", { name: "Tableau de Bord Exécutif" })).toBeVisible();
    await expect(page.getByText("Talents surveillés")).toBeVisible();
    await expect(page.getByText("Cas critiques (≥70%)")).toBeVisible();
    await expect(page.getByText("Score de risque moyen")).toBeVisible();

    // Chart.js paints a canvas once the data has actually loaded.
    await expect(page.locator("canvas").first()).toBeVisible();
    await expect(page.getByText("Top 5 des Talents Prioritaires à Retenir")).toBeVisible();
    await expect(page.getByText(/Impossible de charger les données/)).toHaveCount(0);

    expectNoPageErrors(errors);
  });

  test("the retention plan shows 0-10 scores, not raw 0-1 values", async ({ page }) => {
    // Regression guard: the drawer used to print the 0-1 API value as "/10",
    // so a 30 % satisfaction was displayed as "0.3 / 10".
    const talents = await fetchTalents(page);
    const worst = [...talents].sort((a, b) => b.turnover_risk - a.turnover_risk)[0];

    await login(page);
    await page
      .getByRole("button", { name: new RegExp(`Ouvrir le plan d'action \\(${worst.first_name}\\)`) })
      .click();

    const drawer = page.getByRole("dialog", { name: "Plan de rétention" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("heading", { name: `${worst.first_name} ${worst.last_name}` })).toBeVisible();

    // The satisfaction value also shows on the target slider, hence `.first()`.
    await expect(drawer.getByText(`${(worst.satisfaction_score * 10).toFixed(1)} / 10`).first()).toBeVisible();
    await expect(drawer.getByText(`${(worst.engagement_score * 10).toFixed(1)} / 10`).first()).toBeVisible();
  });

  test("the countermeasure simulator reacts to its sliders", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /Ouvrir le plan d'action/ }).click();

    const drawer = page.getByRole("dialog", { name: "Plan de rétention" });
    const simulated = drawer
      .getByText(/Risque estimé après action/)
      .locator("..")
      .locator("span")
      .last();
    const before = await simulated.textContent();

    // Push the salary lever to its maximum: the estimate must move.
    await drawer.locator('input[type="range"]').first().fill("20");
    await expect(drawer.getByText(/\+20%/)).toBeVisible();
    await expect(simulated).not.toHaveText(before ?? "");

    await drawer.getByRole("button", { name: "Fermer", exact: true }).click();
    await expect(drawer).toBeHidden();
  });
});
