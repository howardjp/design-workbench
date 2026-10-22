import { chromium, expect } from "@playwright/test";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
const root = fileURLToPath(new URL("../", import.meta.url));
mkdirSync(resolve(root, "docs/qa"), { recursive: true });
const store = openRegistry(":memory:");
const server = createWorkbenchServer({ store, dist: resolve(root, "dist") });
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? {
        executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        args: ["--no-sandbox"],
      }
    : {},
);
const requestedViews = process.argv.slice(2);
const views = requestedViews.length
  ? requestedViews
  : ["inventory", "overview", "reading"];
if (views.some((view) => !["inventory", "overview", "reading"].includes(view)))
  throw new Error("Choose inventory, overview, or reading.");
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  for (const family of ["martlet", "krigsvold"])
    for (const view of views) {
      await page.goto(
        `http://127.0.0.1:${server.address().port}/${family}/?view=${view}&record=button`,
      );
      await expect(
        page.getByRole("button", { name: "Add component", exact: true }),
      ).toBeEnabled();
      await page.evaluate(() => document.fonts.ready);
      if (view === "reading") {
        await expect(
          page.getByRole("article", { name: "Button", exact: true }),
        ).toBeVisible();
        await page
          .locator("article")
          .screenshot({
            path: resolve(root, `docs/qa/${family}-${view}.jpg`),
            type: "jpeg",
            quality: 82,
          });
      } else
        await page.screenshot({
          path: resolve(root, `docs/qa/${family}-${view}.jpg`),
          type: "jpeg",
          quality: 82,
        });
    }
  console.log("Captured independent family views from a temporary registry.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  store.close();
}
