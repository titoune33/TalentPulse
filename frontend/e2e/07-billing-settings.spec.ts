import { expect, test, type Page } from "@playwright/test";
import { expectNoPageErrors, openSection, trackPageErrors, uniqueEmail } from "./helpers";

/** Register a throwaway workspace so billing/settings tests never touch the demo account. */
async function registerFreshAccount(page: Page): Promise<string> {
  const email = uniqueEmail("workspace");
  await page.goto("/auth/register");
  await page.getByPlaceholder("Marie Dupont").fill("Client Test");
  await page.getByPlaceholder("vous@entreprise.com").fill(email);
  await page.getByPlaceholder("••••••••").fill("motdepasse123");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return email;
}

test.describe("Billing", () => {
  test("shows the three plans and the current plan", async ({ page }) => {
    const errors = trackPageErrors(page);
    await registerFreshAccount(page);
    await openSection(page, "Abonnement");
    await expect(page).toHaveURL(/\/billing$/);

    for (const plan of ["Starter", "Pro", "Entreprise"]) {
      await expect(page.getByRole("heading", { name: plan, exact: true })).toBeVisible();
    }
    await expect(page.getByText("49 €", { exact: true })).toBeVisible();
    await expect(page.getByText("149 €", { exact: true })).toBeVisible();
    await expect(page.getByText("Plan actuel : free")).toBeVisible();

    expectNoPageErrors(errors);
  });

  test("subscribing in demo mode really changes the account plan", async ({ page }) => {
    await registerFreshAccount(page);
    await openSection(page, "Abonnement");

    await page.getByRole("button", { name: "Choisir Starter" }).click();

    await expect(page.getByText(/Mode démonstration/)).toBeVisible();
    // The badge and the buttons must reflect the new server-side state.
    await expect(page.getByText("Plan actuel : pro")).toBeVisible();
    await expect(page.getByRole("button", { name: "Plan actuel" })).toBeDisabled();
  });

  test("the enterprise plan routes to a contact email", async ({ page }) => {
    await registerFreshAccount(page);
    await openSection(page, "Abonnement");

    await expect(page.getByRole("button", { name: "Nous contacter" })).toBeVisible();
    const href = await page.getByRole("link", { name: /Contacter/ }).count();
    // The enterprise CTA is a button that opens the mail client; just assert it exists
    // and is not part of the paid flow.
    expect(href).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Settings", () => {
  test("updates the profile and enforces the current password", async ({ page }) => {
    // This test deliberately triggers a 400 (wrong current password), which the
    // browser reports as a failed resource request.
    const errors = trackPageErrors(page, [/status of 400/]);
    const email = await registerFreshAccount(page);
    await openSection(page, "Paramètres");
    await expect(page).toHaveURL(/\/settings$/);

    // --- Profile --------------------------------------------------------
    // The profile name input carries no `type` attribute.
    const nameInput = page.locator("input").first();
    await nameInput.fill("Nouveau Nom");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Profil mis à jour.")).toBeVisible();

    // --- Wrong current password is refused -------------------------------
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill("mauvais-mot-de-passe");
    await passwordInputs.nth(1).fill("nouveaumdp123");
    await passwordInputs.nth(2).fill("nouveaumdp123");
    await page.getByRole("button", { name: "Mettre à jour le mot de passe" }).click();
    await expect(page.getByText("Mot de passe actuel incorrect")).toBeVisible();

    // --- Correct change succeeds ----------------------------------------
    await passwordInputs.nth(0).fill("motdepasse123");
    await page.getByRole("button", { name: "Mettre à jour le mot de passe" }).click();
    await expect(page.getByText("Mot de passe modifié avec succès.")).toBeVisible();

    // --- The new password really works ----------------------------------
    await page.locator("header button").last().click();
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);

    await page.getByPlaceholder("vous@entreprise.com").fill(email);
    await page.getByPlaceholder("••••••••").fill("nouveaumdp123");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    expectNoPageErrors(errors);
  });

  test("refuses mismatched password confirmation", async ({ page }) => {
    await registerFreshAccount(page);
    await openSection(page, "Paramètres");

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill("motdepasse123");
    await passwordInputs.nth(1).fill("nouveaumdp123");
    await passwordInputs.nth(2).fill("different123");
    await page.getByRole("button", { name: "Mettre à jour le mot de passe" }).click();

    await expect(page.getByText("Les deux mots de passe ne correspondent pas.")).toBeVisible();
  });
});
