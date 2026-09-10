import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the exported static frontend against a real backend.
 *
 * Prerequisites:
 *   - `npm run build` (the tests serve `frontend/out/`, the real artifact)
 *   - a Python environment for the backend (override with E2E_BACKEND_CMD)
 *
 * Run with: npm run test:e2e
 */

const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT || 3000);
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// The backend's CORS_ORIGIN must include the frontend origin below.
const BACKEND_CMD =
  process.env.E2E_BACKEND_CMD ||
  "cd ../backend && .venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: BACKEND_CMD,
      url: `${BACKEND_URL}/api/health`,
      reuseExistingServer: true,
      timeout: 90_000,
    },
    {
      command: `node e2e/static-server.mjs`,
      url: `http://localhost:${FRONTEND_PORT}/`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: { PORT: String(FRONTEND_PORT) },
    },
  ],
});
