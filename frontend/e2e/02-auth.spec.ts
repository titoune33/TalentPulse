import { expect, test } from "@playwright/test";
import { DEMO_EMAIL, expectNoPageErrors, login, trackPageErrors, uniqueEmail } from "./helpers";

test.describe("Authentication", () => {
  test("rejects a wrong password with a French message", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByPlaceholder("vous@entreprise.com").fill(DEMO_EMAIL);
    await page.getByPlaceholder("••••••••").fill("mauvais-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText(/Email ou mot de passe incorrect/)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test("the one-click demo button opens a populated dashboard", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/auth/login");
    await page.getByRole("button", { name: "Explorer la démo" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Tableau de Bord Exécutif" })).toBeVisible();
    await expect(page.getByText("Talents surveillés")).toBeVisible();
    expectNoPageErrors(errors);
  });

  test("a brand new signup lands on a working dashboard", async ({ page }) => {
    // This is the money path: a prospect signing up must see a product, not
    // an empty shell or a 403.
    const errors = trackPageErrors(page);
    const email = uniqueEmail("signup");

    await page.goto("/auth/register");
    await page.getByPlaceholder("Marie Dupont").fill("Prospect Test");
    await page.getByPlaceholder("vous@entreprise.com").fill(email);
    await page.getByPlaceholder("••••••••").fill("motdepasse123");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Tableau de Bord Exécutif" })).toBeVisible();
    // The account is the workspace owner, so it can already read the roster.
    await expect(page.getByText("Talents surveillés")).toBeVisible();
    await expect(page.getByText(/Impossible de charger les données/)).toHaveCount(0);
    expectNoPageErrors(errors);
  });

  test("an unreachable backend surfaces a readable error, not a crash", async ({ page }) => {
    await page.route(/\/api\/talents\//, (route) => route.abort());
    await login(page);

    await expect(page.getByText(/Impossible de charger les talents/)).toBeVisible();
  });

  test("logout clears the session and protects the app routes", async ({ page }) => {
    await login(page);

    // The logout action lives in the account menu of the top bar.
    await page.locator("header button").last().click();
    await page.getByRole("button", { name: "Se déconnecter" }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
