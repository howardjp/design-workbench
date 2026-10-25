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
if (
  views.some(
    (view) =>
      ![
        "inventory",
        "overview",
        "reading",
        "import",
        "review",
        "queue",
      ].includes(view),
  )
)
  throw new Error(
    "Choose inventory, overview, reading, import, review, or queue.",
  );
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
      if (view === "queue") {
        await expect(page.locator(".queue-counts")).toBeVisible();
        await page.setViewportSize({ width: 1440, height: 1800 });
        await page.screenshot({
          path: resolve(root, `docs/qa/${family}-${view}.jpg`),
          type: "jpeg",
          quality: 82,
        });
      } else if (view === "review") {
        await page.setViewportSize({ width: 1440, height: 1600 });
        await expect(
          page.getByRole("group", { name: "Real consumer", exact: true }),
        ).toBeVisible();
        await page
          .getByText("Specification and implementation context", {
            exact: true,
          })
          .click();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: resolve(root, `docs/qa/${family}-${view}.jpg`),
          type: "jpeg",
          quality: 82,
        });
      } else if (view === "import") {
        await page.setViewportSize({ width: 1440, height: 2400 });
        const source = JSON.stringify({
          schemaVersion: 1,
          exportedAt: "2026-10-22T06:00:00.000Z",
          components: [
            {
              ...store.get("button"),
              summary:
                "Expose a clearly labelled action with explicit emphasis and keyboard-operable pending, success, and recovery states.",
              evidence:
                "Source assertion for review: native activation and disabled behavior were checked; manual screen-reader review remains open.",
            },
          ],
        });
        await page
          .getByLabel("Registry JSON export", { exact: true })
          .setInputFiles({
            name: "component-review.json",
            mimeType: "application/json",
            buffer: Buffer.from(source),
          });
        await page
          .getByRole("button", { name: "Preview import", exact: true })
          .click();
        await expect(
          page.getByRole("region", { name: "Import review", exact: true }),
        ).toBeVisible();
        await page.locator(".registry-import").screenshot({
          path: resolve(root, `docs/qa/${family}-${view}.jpg`),
          type: "jpeg",
          quality: 82,
        });
      } else if (view === "reading") {
        await expect(
          page.getByRole("article", { name: "Button", exact: true }),
        ).toBeVisible();
        await page.locator("article").screenshot({
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
