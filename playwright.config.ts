import { defineConfig } from "@playwright/test";
const browserName = process.env.WORKBENCH_BROWSER ?? "chromium";
if (!["chromium", "firefox", "webkit"].includes(browserName))
  throw new Error("Choose chromium, firefox, or webkit for WORKBENCH_BROWSER.");
const port = process.env.WORKBENCH_TEST_PORT ?? "4188";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error("WORKBENCH_TEST_PORT must be 1024–65535.");
export default defineConfig({
  testDir: "tests/browser",
  outputDir: `test-results/${browserName}-${port}`,
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    browserName: browserName as "chromium" | "firefox" | "webkit",
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    launchOptions:
      browserName === "chromium" && process.env.PLAYWRIGHT_EXECUTABLE_PATH
        ? {
            executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
            args: ["--no-sandbox"],
          }
        : {},
  },
  webServer: {
    command: "node server/start.mjs",
    url: `http://127.0.0.1:${port}/api/components`,
    reuseExistingServer: false,
    env: { PORT: port, REGISTRY_DB: ":memory:" },
    timeout: 20000,
  },
});
