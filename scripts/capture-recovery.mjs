import { chromium, expect } from "@playwright/test";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import { toDraft } from "../src/contract.mjs";
import { resolve } from "node:path";
// Same controlled concurrent-edit fixture in a separate temporary store per family.
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? {
        executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        args: ["--no-sandbox"],
      }
    : {},
);
try {
  for (const family of ["martlet", "krigsvold"]) {
    const store = openRegistry(":memory:");
    const server = createWorkbenchServer({ store, dist: resolve("dist") });
    await new Promise((done) => server.listen(0, "127.0.0.1", done));
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2800 },
    });
    try {
      await page.goto(
        `http://127.0.0.1:${server.address().port}/${family}/?record=button`,
      );
      await page
        .getByRole("button", { name: "Edit specification", exact: true })
        .click();
      await page
        .getByLabel("Summary", { exact: true })
        .fill(
          "A retained draft specifies deliberate keyboard activation and clear pending, error, and recovery behavior.",
        );
      await page.getByRole("checkbox", { name: "Vue", exact: true }).check();
      const original = store.get("button");
      store.save(
        "button",
        {
          ...toDraft(original),
          summary:
            "Another window saved a different action description while this draft stayed open.",
          evidence:
            "Comparison fixture only. This text is not evidence of real production use or manual accessibility verification.",
        },
        original.revision,
      );
      await page
        .getByRole("button", { name: "Save specification", exact: true })
        .click();
      await expect(page.getByRole("alert")).toContainText(
        "changed in another window",
      );
      await page
        .getByRole("button", {
          name: "Compare with latest saved record",
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("group", { name: "Summary", exact: true }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page
        .locator(".editor")
        .screenshot({
          path: resolve(`docs/qa/${family}-recovery.jpg`),
          type: "jpeg",
          quality: 82,
        });
    } finally {
      await page.close();
      await new Promise((done) => {
        server.close(done);
        server.closeAllConnections();
      });
      store.close();
    }
  }
} finally {
  await browser.close();
}
console.log(
  "Captured the same concurrent-edit fixture in both families using temporary stores.",
);
