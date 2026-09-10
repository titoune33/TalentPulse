import { expect, test } from "@playwright/test";
import { expectNoPageErrors, login, openSection, trackPageErrors } from "./helpers";

test.describe("Analytics", () => {
  test("renders the 13-week trend and the per-department breakdown", async ({ page }) => {
    const errors = trackPageErrors(page);
    await login(page);
    await openSection(page, "Analytics");
    await expect(page).toHaveURL(/\/analytics$/);

    await expect(page.getByRole("heading", { level: 2, name: "Analytics" })).toBeVisible();
    await expect(page.getByText(/Évolution du risque moyen \(13 semaines\)/)).toBeVisible();
    await expect(page.getByText("Risque par département")).toBeVisible();
    await expect(page.getByText("Indicateurs clés de l'équipe")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(3);

    // Every department from the seeded roster appears in the table.
    for (const department of ["Ingénierie", "Produit", "Marketing", "Ventes", "Support", "RH"]) {
      await expect(page.locator("table tbody").getByText(department, { exact: true })).toBeVisible();
    }

    expectNoPageErrors(errors);
  });
});

test.describe("Executive reports", () => {
  test("generates the report and exports the register as CSV", async ({ page }) => {
    const errors = trackPageErrors(page);
    await login(page);
    await openSection(page, "Rapports");
    await expect(page).toHaveURL(/\/reports$/);

    await page.getByRole("button", { name: "Générer le rapport" }).click();

    await expect(page.getByText("TalentPulse · Rapport exécutif")).toBeVisible();
    await expect(page.getByText("Talents prioritaires", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Synthèse" })).toBeVisible();
    await expect(page.locator("#print-area")).toContainText("risque de départ supérieur à 70");

    // The CSV export must actually produce a downloadable file.
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Exporter tout en CSV/ }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^rapport-turnover-\d{4}-\d{2}-\d{2}\.csv$/);

    const stream = await download.createReadStream();
    const content = await new Promise<string>((resolve, reject) => {
      let data = "";
      stream.on("data", (chunk) => (data += chunk.toString("utf8")));
      stream.on("end", () => resolve(data));
      stream.on("error", reject);
    });
    // A BOM is prepended so Excel keeps the French accents intact.
    expect(content.startsWith("\uFEFF")).toBe(true);
    expect(content).toContain('"prenom";"nom";"email"');
    expect(content).toContain("risque_turnover_0_1");
    // One header row plus the whole roster.
    expect(content.trim().split("\n").length).toBeGreaterThanOrEqual(15);

    expectNoPageErrors(errors);
  });

  test("the executive summary export produces a text file", async ({ page }) => {
    await login(page);
    await openSection(page, "Rapports");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Télécharger \(\.txt\)/ }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^rapport-turnover-\d{4}-\d{2}-\d{2}\.txt$/);
  });
});
