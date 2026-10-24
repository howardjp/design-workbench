import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";
import { createOlderRegistry, missing } from "../helpers/older-registry.mjs";
import { createWorkbenchServer } from "../../server/http.mjs";
const test = base.extend<{
  registry: ReturnType<typeof createOlderRegistry> & { base: string };
}>({
  registry: async ({}, use) => {
    const registry = createOlderRegistry();
    const server = createWorkbenchServer({
      store: registry.store,
      dist: resolve("dist"),
    });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    try {
      await use({
        ...registry,
        base: `http://127.0.0.1:${(server.address() as { port: number }).port}`,
      });
    } finally {
      await new Promise<void>((done) => {
        // Assertions are finished; pending browser responses must not hold teardown open.
        server.close(() => done());
        server.closeAllConnections();
      });
      registry.close();
    }
  },
});
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: preview, review by keyboard, apply, inspect history, and reload`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=updates`);
    await expect(
      page.getByText(
        `${missing.length} new components · 1 implementation update`,
        {
          exact: false,
        },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "My Button", exact: true }),
    ).toBeVisible();
    await page
      .getByText("Review initial specification for ErrorSummary", {
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Explain validation or operation failures", {
        exact: false,
      }),
    ).toBeVisible();
    const apply = page.getByRole("button", {
      name: `Apply ${missing.length + 1} component updates`,
      exact: true,
    });
    await expect(apply).toBeDisabled();
    const reviewed = page.getByRole("checkbox", {
      name: "I have reviewed these inventory changes.",
    });
    await reviewed.focus();
    await page.keyboard.press("Space");
    await expect(apply).toBeEnabled();
    // Refresh requires a new review even when the underlying snapshot is identical.
    await page
      .getByRole("button", { name: "Refresh preview", exact: true })
      .click();
    await expect(reviewed).not.toBeChecked();
    await expect(apply).toBeDisabled();
    await reviewed.focus();
    await page.keyboard.press("Space");
    await page.route("**/api/inventory/apply", async (route) => {
      await new Promise((done) => setTimeout(done, 200));
      await route.continue();
    });
    await apply.click();
    await expect(
      page.getByRole("button", { name: "Applying updates…" }),
    ).toBeDisabled();
    await page.getByRole("link", { name: "Inventory", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Inventory updates", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: `${missing.length + 1} component updates saved` }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: `${missing.length + 1} component updates saved` })
        .locator(".."),
    ).toBeFocused();
    expect(registry.store.get("button").summary).toBe(
      registry.previous.summary,
    );
    await page.reload();
    await expect(
      page.getByRole("status").filter({ hasText: "already reflected" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Inventory", exact: true }).click();
    await page
      .getByLabel("Search components", { exact: true })
      .fill("ErrorSummary");
    await page
      .getByRole("button", { name: "Inspect ErrorSummary", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "ErrorSummary", exact: true }),
    ).toBeVisible();
    await page.goto(`${registry.base}/${family}/?record=button`);
    await expect(page.locator(".spec-summary")).toHaveText(
      registry.previous.summary,
    );
    await page.getByText("Revision history", { exact: true }).click();
    await expect(
      page.getByText("Revision 3 (current)", { exact: true }),
    ).toBeVisible();
    expect(registry.store.history("button")).toHaveLength(3);
    await page.locator('[data-revision="2"] > summary').click();
    await expect(
      page.getByRole("heading", {
        name: "Implementation inventory changed",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-revision="2"]')
        .getByText(
          "Using this revision as a draft keeps the current implementation inventory.",
          { exact: true },
        ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Use revision 2 as draft", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(page.locator(".record-state")).toContainText("Revision 4");
    expect(
      registry.store
        .get("button")
        .implementations.filter((item) => item.platform === "React")
        .every((item) => item.version === "0.1.0"),
    ).toBe(true);
  });
  test(`${family}: stale previews and uncertain apply results require fresh review`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=updates`);
    await page.getByRole("checkbox").check();
    const custom = registry.store.get(registry.custom.id);
    registry.store.save(
      custom.id,
      {
        ...custom,
        summary:
          "Another window changed this record while the inventory preview was open.",
      },
      custom.revision,
    );
    await page
      .getByRole("button", {
        name: `Apply ${missing.length + 1} component updates`,
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "changed after this preview",
    );
    await expect(page.getByRole("alert")).toBeFocused();
    await expect(page.getByRole("checkbox")).not.toBeChecked();
    expect(registry.store.list()).toHaveLength(27);
    await page
      .getByRole("button", { name: "Refresh preview", exact: true })
      .click();
    await page.getByRole("checkbox").check();
    // The server commits, but the response is lost. Never replay a mutation blindly.
    await page.route("**/api/inventory/apply", async (route) => {
      await route.fetch();
      await route.abort();
    });
    await page
      .getByRole("button", {
        name: `Apply ${missing.length + 1} component updates`,
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "result could not be confirmed",
    );
    await expect(
      page.getByRole("button", {
        name: `Apply ${missing.length + 1} component updates`,
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Refresh preview", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "already reflected" }),
    ).toBeVisible();
    expect(registry.store.get("button").revision).toBe(3);
    expect(registry.store.history("button")).toHaveLength(3);
  });
  test(`${family}: loading failures retry and name conflicts block application`, async ({
    page,
    registry,
  }) => {
    let fail = true;
    await page.route("**/api/inventory/preview", (route) =>
      fail ? route.abort() : route.continue(),
    );
    await page.goto(`${registry.base}/${family}/?view=updates`);
    await expect(page.getByRole("alert")).toContainText("could not be loaded");
    fail = false;
    const local = registry.store.get(registry.custom.id);
    registry.store.save(
      local.id,
      { ...local, name: "Checkbox" },
      local.revision,
    );
    await page
      .getByRole("button", { name: "Retry preview", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Resolve name conflicts",
    );
    await expect(page.getByRole("checkbox")).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: `Apply ${missing.length} component updates`,
        exact: true,
      }),
    ).toBeDisabled();
    expect(registry.store.list()).toHaveLength(27);
    const saved = registry.store.get(local.id);
    registry.store.save(
      saved.id,
      { ...saved, name: "Local checkbox" },
      saved.revision,
    );
    await page
      .getByRole("button", { name: "Refresh preview", exact: true })
      .click();
    await expect(page.getByRole("alert")).not.toBeVisible();
    await expect(page.getByRole("checkbox")).toBeEnabled();
  });
  test(`${family}: linked error summary focuses fields and invalid groups`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?record=text-input`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page.getByLabel("Summary", { exact: true }).fill("Short");
    await page.getByRole("checkbox", { name: "React", exact: true }).uncheck();
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    const summary = page.getByRole("alert");
    await expect(summary).toBeFocused();
    const link = summary.getByRole("link", {
      name: "Summary must contain",
      exact: false,
    });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Summary", { exact: true })).toBeFocused();
    await summary
      .getByRole("link", {
        name: "Choose at least one target platform.",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("group", { name: "Target platforms", exact: true }),
    ).toBeFocused();
    expect(registry.store.get("text-input").revision).toBe(1);
  });
  test(`${family}: unsaved editor navigation to updates preserves the draft`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?record=button`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page
      .getByLabel("Summary", { exact: true })
      .fill(
        "An unsaved draft must survive entering the inventory-update workflow.",
      );
    await page
      .getByRole("link", { name: "Inventory updates", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      "An unsaved draft must survive entering the inventory-update workflow.",
    );
    await page
      .getByRole("link", { name: "Inventory updates", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(page.getByRole("main")).toBeFocused();
    await expect(
      page.getByRole("button", {
        name: `Apply ${missing.length + 1} component updates`,
        exact: true,
      }),
    ).toBeVisible();
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440]) {
      test(`${family}: inventory preview ${mode} at ${width}px reflows and passes axe`, async ({
        page,
        registry,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${registry.base}/${family}/?view=updates`);
        await expect(
          page.getByRole("button", {
            name: `Apply ${missing.length + 1} component updates`,
            exact: true,
          }),
        ).toBeVisible();
        if (mode === "dark")
          await page.getByRole("button", { name: "Use dark mode" }).click();
        await page
          .getByText("Review initial specification for ErrorSummary", {
            exact: true,
          })
          .click();
        await expect(
          page.getByText("Explain validation or operation failures", {
            exact: false,
          }),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(results.violations).toEqual([]);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
          const style = document.createElement("style");
          style.textContent =
            "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-block-end: 2em !important; }";
          document.head.append(style);
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(
          page.getByRole("button", {
            name: `Apply ${missing.length + 1} component updates`,
            exact: true,
          }),
        ).toBeVisible();
      });
    }
}
