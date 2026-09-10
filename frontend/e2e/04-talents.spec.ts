import { expect, test } from "@playwright/test";
import { expectNoPageErrors, login, openSection, trackPageErrors, uniqueEmail } from "./helpers";

test.describe("Talent management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openSection(page, "Talents");
    await expect(page).toHaveURL(/\/talents$/);
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("lists the roster and filters it locally", async ({ page }) => {
    const errors = trackPageErrors(page);
    const search = page.getByPlaceholder(/Rechercher un nom, un poste, un email/);

    const rows = page.locator("table tbody tr");
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThanOrEqual(14);

    await search.fill("Camille");
    await expect(rows).toHaveCount(1);
    await expect(page.getByText("Camille Rousseau")).toBeVisible();

    await search.fill("");
    await expect(rows).toHaveCount(initialCount);

    expectNoPageErrors(errors);
  });

  test("filters by department", async ({ page }) => {
    await page.locator("select").first().selectOption("Marketing");

    const rows = page.locator("table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first().getByText("Marketing")).toBeVisible();
  });

  test("runs the full create → predict → edit → delete journey", async ({ page }) => {
    const errors = trackPageErrors(page);
    const email = uniqueEmail("crud");

    // --- Create ---------------------------------------------------------
    await page.getByRole("button", { name: "Ajouter un talent" }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByPlaceholder("Marie", { exact: true }).fill("Zoé");
    await createDialog.getByPlaceholder("Dupont", { exact: true }).fill("Nouvelle");
    await createDialog.getByPlaceholder("marie.dupont@entreprise.com", { exact: true }).fill(email);
    await createDialog.getByPlaceholder("Développeuse Full-Stack", { exact: true }).fill("Ingénieure QA");
    await createDialog.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("Talent ajouté avec succès.")).toBeVisible();

    const search = page.getByPlaceholder(/Rechercher un nom, un poste, un email/);
    await search.fill("Zoé");
    await expect(page.getByText("Zoé Nouvelle")).toBeVisible();
    const row = page.locator("table tbody tr").first();

    // --- Predict --------------------------------------------------------
    await row.getByTitle("Lancer une prédiction").click();
    await expect(page.getByText(/Prédiction lancée pour Zoé Nouvelle/)).toBeVisible();

    // --- Update ---------------------------------------------------------
    await row.getByTitle("Modifier").click();
    const editDialog = page.getByRole("dialog");
    await editDialog.getByPlaceholder("Développeuse Full-Stack", { exact: true }).fill("Lead QA");
    await editDialog.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Talent mis à jour avec succès.")).toBeVisible();
    await expect(page.getByText("Lead QA")).toBeVisible();

    // --- Delete ---------------------------------------------------------
    await row.getByTitle("Supprimer").click();
    await page.getByRole("dialog").getByRole("button", { name: "Supprimer" }).click();
    await expect(page.getByText("Talent supprimé.")).toBeVisible();
    await expect(page.getByText("Zoé Nouvelle")).toHaveCount(0);

    expectNoPageErrors(errors);
  });

  test("opens the retention plan from a table row", async ({ page }) => {
    await page.locator("table tbody tr").first().getByTitle("Ouvrir le Copilot de Rétention IA").click();

    const drawer = page.getByRole("dialog", { name: "Plan de rétention" });
    await expect(drawer.getByText("Recommandations stratégiques")).toBeVisible();
    await expect(drawer.getByText("Simulateur de Contre-Mesure")).toBeVisible();
    await expect(drawer.getByText("Guide d'entretien 1-to-1 recommandé")).toBeVisible();
  });
});
