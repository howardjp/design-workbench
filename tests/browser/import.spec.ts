import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";
import { openRegistry } from "../../server/store.mjs";
import { createWorkbenchServer } from "../../server/http.mjs";
import { toDraft } from "../../src/contract.mjs";
const test = base.extend<{
  registry: { store: ReturnType<typeof openRegistry>; base: string };
}>({
  registry: async ({}, use) => {
    const store = openRegistry(":memory:");
    const server = createWorkbenchServer({ store, dist: resolve("dist") });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    try {
      await use({
        store,
        base: `http://127.0.0.1:${(server.address() as { port: number }).port}`,
      });
    } finally {
      await new Promise<void>((done) => {
        // Assertions are finished; pending browser responses must not hold teardown open.
        server.close(() => done());
        server.closeAllConnections();
      });
      store.close();
    }
  },
});
function documentFor(store: ReturnType<typeof openRegistry>, long = false) {
  const button = store.get("button");
  return {
    schemaVersion: 1,
    exportedAt: "2026-10-22T06:00:00.000Z",
    components: [
      {
        ...button,
        summary: long
          ? "Specification details remain readable at narrow widths and enlarged text. ".repeat(
              7,
            )
          : "An imported specification with a reviewed keyboard and recovery contract.",
        maturity: "stable",
        evidence:
          "An asserted observation from the source; further human verification remains necessary.",
        implementations: [],
      },
      {
        ...button,
        id: "imported-control",
        name: "Imported control",
        maturity: "stable",
        evidence: "A source assertion, not automatic promotion.",
        revision: 8,
      },
    ],
  };
}
const file = (source: unknown, name = "reviewed-registry.json") => ({
  name,
  mimeType: "application/json",
  buffer: Buffer.from(
    typeof source === "string" ? source : JSON.stringify(source),
  ),
});
async function select(page: Page, source: unknown, name?: string) {
  await page
    .getByLabel("Registry JSON export", { exact: true })
    .setInputFiles(file(source, name));
  await expect(
    page.getByRole("button", { name: "Preview import", exact: true }),
  ).toBeEnabled();
}
async function preview(page: Page) {
  await page
    .getByRole("button", { name: "Preview import", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Import review", exact: true }),
  ).toBeVisible();
}
const reviewCheckbox = (page: Page) =>
  page.getByRole("checkbox", {
    name: "I have reviewed these specification changes and the import policy.",
    exact: true,
  });
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: keyboard file chooser, review, atomic apply, reload, and provenance`, async ({
    page,
    registry,
  }) => {
    const original = registry.store.get("button");
    // Begin with an actual exported envelope; modify it as an external specification author would.
    const response = await page.request.get(`${registry.base}/api/export`);
    const exported = await response.json();
    exported.components = documentFor(registry.store).components;
    await page.goto(`${registry.base}/${family}/?view=import`);
    const picker = page.getByLabel("Registry JSON export", { exact: true });
    await picker.focus();
    await expect(picker).toBeFocused();
    const choosing = page.waitForEvent("filechooser");
    await picker.press("Space");
    await (await choosing).setFiles(file(exported));
    await expect(
      page.getByRole("button", { name: "Preview import", exact: true }),
    ).toBeEnabled();
    await preview(page);
    await expect(
      page.getByRole("region", { name: "Import review", exact: true }),
    ).toBeFocused();
    await expect(
      page.getByText(original.summary, { exact: true }).first(),
    ).toBeVisible();
    expect(registry.store.get("button").revision).toBe(1);
    const apply = page.getByRole("button", {
      name: "Import 2 component contracts",
      exact: true,
    });
    await expect(apply).toBeDisabled();
    await reviewCheckbox(page).focus();
    await page.keyboard.press("Space");
    await expect(apply).toBeEnabled();
    await apply.click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "2 component contracts imported" }),
    ).toBeVisible();
    await expect(
      page.getByText("No specification changes remain for this file.", {
        exact: true,
      }),
    ).toBeVisible();
    const saved = registry.store.get("button");
    expect(saved.maturity).toBe(original.maturity);
    expect(saved.implementations).toEqual(original.implementations);
    expect(saved.revision).toBe(2);
    expect(registry.store.get("imported-control").maturity).toBe("proposed");
    expect(registry.store.get("imported-control").implementations).toEqual([]);
    await page.reload();
    await expect(picker).toHaveValue("");
    await page.goto(`${registry.base}/${family}/?record=button`);
    await expect(page.locator(".spec-summary")).toHaveText(saved.summary);
    await page.getByText("Revision history", { exact: true }).click();
    await page.locator('[data-revision="2"] > summary').click();
    const provenance = page.getByRole("complementary", {
      name: "Import provenance",
      exact: true,
    });
    await expect(provenance).toContainText("reviewed-registry.json");
    await expect(provenance).toContainText(
      registry.store.history("button")[0].snapshot.change.documentHash,
    );
  });
  test(`${family}: stale preview blocks every write and a new review permits recovery`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=import`);
    await select(page, documentFor(registry.store));
    await preview(page);
    await reviewCheckbox(page).check();
    const other = registry.store.get("text-input");
    registry.store.save(
      other.id,
      {
        ...toDraft(other),
        summary:
          "An unrelated concurrent edit invalidates the entire import preview.",
      },
      other.revision,
    );
    await page
      .getByRole("button", {
        name: "Import 2 component contracts",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText("changed");
    await expect(page.getByRole("alert")).toBeFocused();
    await expect(reviewCheckbox(page)).toBeDisabled();
    expect(registry.store.get("button").revision).toBe(1);
    expect(
      registry.store
        .list()
        .some((record: { id: string }) => record.id === "imported-control"),
    ).toBe(false);
    await preview(page);
    await expect(reviewCheckbox(page)).not.toBeChecked();
    await reviewCheckbox(page).check();
    await page
      .getByRole("button", {
        name: "Import 2 component contracts",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "2 component contracts imported" }),
    ).toBeVisible();
    expect(registry.store.get("text-input").revision).toBe(2);
  });
  test(`${family}: lost response after commit recovers by preview without duplicate history`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=import`);
    await select(page, documentFor(registry.store));
    await preview(page);
    await reviewCheckbox(page).check();
    await page.route("**/api/import/apply", async (route) => {
      const response = await route.fetch();
      expect(response.ok()).toBe(true);
      await route.abort();
    });
    await page
      .getByRole("button", {
        name: "Import 2 component contracts",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "could not be confirmed",
    );
    expect(registry.store.get("button").revision).toBe(2);
    await expect(
      page.getByRole("button", {
        name: "Import 2 component contracts",
        exact: true,
      }),
    ).toBeDisabled();
    await preview(page);
    await expect(
      page.getByText("No specification changes remain for this file.", {
        exact: true,
      }),
    ).toBeVisible();
    expect(registry.store.history("button")).toHaveLength(2);
    expect(registry.store.history("imported-control")).toHaveLength(1);
  });
  test(`${family}: invalid files, linked errors, transport retry, and clear selection`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=import`);
    const picker = page.getByLabel("Registry JSON export", { exact: true });
    await select(page, "{");
    await page
      .getByRole("button", { name: "Preview import", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("not valid JSON");
    await expect(picker).toHaveAttribute("aria-invalid", "true");
    await page
      .getByRole("link", {
        name: "Correct the selected export, then preview it again.",
        exact: true,
      })
      .click();
    await expect(picker).toBeFocused();
    await picker.setInputFiles({
      name: "not-utf8.json",
      mimeType: "application/json",
      buffer: Buffer.from([0xff, 0xfe]),
    });
    await expect(page.getByRole("alert")).toContainText(
      "could not be read as UTF-8",
    );
    await expect(
      page.getByRole("button", { name: "Preview import", exact: true }),
    ).toBeDisabled();
    await picker.setInputFiles(file(" ".repeat(1024 * 1024 + 1)));
    await expect(page.getByRole("alert")).toContainText("no larger than 1 MiB");
    await select(page, documentFor(registry.store));
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(picker).not.toHaveAttribute("aria-invalid", "true");
    await page.route("**/api/import/preview", (route) => route.abort());
    await page
      .getByRole("button", { name: "Preview import", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "selected file is still here",
    );
    await expect(picker).not.toHaveAttribute("aria-invalid", "true");
    await page.unroute("**/api/import/preview");
    await preview(page);
    await page
      .getByRole("button", { name: "Clear selected file", exact: true })
      .click();
    await expect(picker).toHaveValue("");
    await expect(picker).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Import review", exact: true }),
    ).toHaveCount(0);
    expect(registry.store.get("button").revision).toBe(1);
  });
  test(`${family}: source revision and namespace conflicts block new contracts too`, async ({
    page,
    registry,
  }) => {
    const source = documentFor(registry.store);
    const button = registry.store.get("button");
    registry.store.save(
      button.id,
      {
        ...toDraft(button),
        summary:
          "A newer saved contract cannot be overwritten from an older export.",
      },
      button.revision,
    );
    source.components[1].name = registry.store.get("text-input").name;
    await page.goto(`${registry.base}/${family}/?view=import`);
    await select(page, source);
    await preview(page);
    await expect(page.getByRole("alert")).toContainText(
      "file has revision 1; the registry has revision 2",
    );
    await expect(page.getByRole("alert")).toContainText(
      "final name is also used",
    );
    await expect(reviewCheckbox(page)).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "Import 2 component contracts",
        exact: true,
      }),
    ).toBeDisabled();
    expect(registry.store.list()).toHaveLength(36);
  });
  test(`${family}: import navigation respects unsaved drafts`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?record=button`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    const summary = page.getByLabel("Summary", { exact: true });
    await summary.fill(
      "An unsaved draft must survive canceled navigation to import.",
    );
    await page
      .getByRole("link", { name: "Import specifications", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(summary).toHaveValue(
      "An unsaved draft must survive canceled navigation to import.",
    );
    expect(registry.store.get("button").revision).toBe(1);
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440]) {
      test(`${family}: import ${mode} at ${width}px reflows and passes axe with enlarged text`, async ({
        page,
        registry,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${registry.base}/${family}/?view=import`);
        if (mode === "dark")
          await page
            .getByRole("button", { name: "Use dark mode", exact: true })
            .click();
        await select(
          page,
          documentFor(registry.store, true),
          "a-deliberately-long-source-file-label-for-responsive-import-review-and-source-provenance.json",
        );
        await preview(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
          const style = document.createElement("style");
          style.textContent =
            "* {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important;} p {margin-block-end:2em !important;}";
          document.head.append(style);
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(reviewCheckbox(page)).toBeVisible();
        expect(registry.store.get("button").revision).toBe(1);
      });
    }
}
