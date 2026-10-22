import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4188",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
          args: ["--no-sandbox"],
        }
      : {},
  },
  webServer: {
    command: "node server/start.mjs",
    url: "http://127.0.0.1:4188/api/components",
    reuseExistingServer: false,
    env: { PORT: "4188", REGISTRY_DB: ":memory:" },
    timeout: 20000,
  },
});
