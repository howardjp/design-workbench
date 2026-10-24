import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";
import { openRegistry } from "../../server/store.mjs";
import { createWorkbenchServer } from "../../server/http.mjs";
import { toDraft, newDraft } from "../../src/contract.mjs";
const test = base.extend<{
  registry: { store: ReturnType<typeof openRegistry>; base: string };
}>({
  registry: async ({}, use) => {
    const store = openRegistry(":memory:"),
      server = createWorkbenchServer({ store, dist: resolve("dist") });
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    try {
      await use({
        store,
        base: `http://127.0.0.1:${(server.address() as { port: number }).port}`,
      });
    } finally {
      await new Promise<void>((done) => {
        server.close(() => done());
        server.closeAllConnections();
      });
      store.close();
    }
  },
});

const workspace = (page: Page) =>
  page.getByRole("navigation", { name: "Workspace sections", exact: true });
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: tabs activate manually, settings save/reload and explicit routes override the default`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=settings`);
    const first = page.getByRole("tab", { name: "Workspace", exact: true });
    const recovery = page.getByRole("tab", {
      name: "Draft recovery",
      exact: true,
    });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(recovery).toBeFocused();
    await expect(first).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(recovery).toHaveAttribute("aria-selected", "true");
    const toggle = page.getByRole("switch", {
      name: "Protect specification drafts in this browser",
      exact: true,
    });
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).not.toBeChecked();
    await recovery.focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    await page
      .getByLabel("Default workspace section", { exact: true })
      .selectOption("queue");
    await page
      .getByLabel("Default inventory page size", { exact: true })
      .selectOption("25");
    await workspace(page)
      .getByRole("link", { name: "Overview", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", {
        name: "Discard unsaved changes?",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Keep editing", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save workspace settings", exact: true })
      .click();
    await expect(
      page.getByText("Workspace settings saved in this browser.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.goto(`${registry.base}/${family}/`);
    await expect(
      page.getByRole("heading", { name: "Review queue", exact: true }).first(),
    ).toBeVisible();
    await page.goto(`${registry.base}/${family}/?view=inventory&record=button`);
    await expect(
      page.getByLabel("Components per page", { exact: true }),
    ).toHaveValue("25");
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page
      .getByLabel("Summary", { exact: true })
      .fill(
        "A draft deliberately left without browser protection after choosing that preference.",
      );
    await expect(
      page.getByText("Browser draft protection is off.", { exact: false }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          Object.keys(localStorage).filter((key) =>
            key.startsWith("design-workbench:specification-draft:"),
          ).length,
      ),
    ).toBe(0);
    expect(registry.store.history("button")).toHaveLength(1);
  });
  test(`${family}: failed preference saves retain changes and confirmed clearing affects recovery copies only`, async ({
    page,
    registry,
  }) => {
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (
          key === "design-workbench:preferences:v1" &&
          !(window as any).allowPreferenceWrite
        )
          throw new Error("storage denied");
        return original.call(this, key, value);
      };
    });
    await page.goto(`${registry.base}/${family}/?record=button`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page
      .getByLabel("Summary", { exact: true })
      .fill(
        "A retained draft used to exercise the explicit recovery-copy clearing workflow.",
      );
    await page.reload();
    await workspace(page)
      .getByRole("link", { name: "Settings", exact: true })
      .click();
    await page
      .getByLabel("Default inventory page size", { exact: true })
      .selectOption("50");
    await page
      .getByRole("button", { name: "Save workspace settings", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Settings could not be saved",
    );
    await expect(
      page.getByLabel("Default inventory page size", { exact: true }),
    ).toHaveValue("50");
    await page.evaluate(() => {
      (window as any).allowPreferenceWrite = true;
    });
    await page
      .getByRole("button", { name: "Save workspace settings", exact: true })
      .click();
    await expect(
      page.getByText("Workspace settings saved in this browser.", {
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("tab", { name: "Draft recovery", exact: true })
      .click();
    const clear = page.getByRole("button", {
      name: "Clear browser recovery copies",
      exact: true,
    });
    await clear.click();
    await page
      .getByRole("button", { name: "Keep recovery copies", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Restore draft Button", exact: true }),
    ).toBeVisible();
    await clear.click();
    await page
      .getByRole("button", { name: "Clear all recovery copies", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Restore draft Button", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Browser specification recovery copies cleared.", {
        exact: false,
      }),
    ).toBeVisible();
    expect(registry.store.history("button")).toHaveLength(1);
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440]) {
      test(`${family}: settings ${mode} at ${width}px preserves switch, tabs, focus and readable layout`, async ({
        page,
        registry,
      }) => {
        await page.addInitScript(
          (mode) => localStorage.setItem("workbench-mode", mode),
          mode,
        );
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${registry.base}/${family}/?view=settings`);
        await page
          .getByRole("tab", { name: "Draft recovery", exact: true })
          .click();
        await page
          .getByRole("switch", {
            name: "Protect specification drafts in this browser",
            exact: true,
          })
          .focus();
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        let overflow = await page.evaluate(() => ({
          fits: document.documentElement.scrollWidth <= innerWidth + 1,
          elements: [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map((e) => ({tag:e.tagName, class:e.className, text:e.textContent?.slice(0,80), width:e.getBoundingClientRect().width})),
        }));
        expect(overflow.fits, JSON.stringify(overflow.elements)).toBe(true);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
          for (const element of document.querySelectorAll<HTMLElement>("*")) {
            element.style.lineHeight = "1.5";
            element.style.letterSpacing = ".12em";
            element.style.wordSpacing = ".16em";
          }
        });
        overflow = await page.evaluate(() => ({
          fits: document.documentElement.scrollWidth <= innerWidth + 1,
          elements: [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map((e) => ({tag:e.tagName, class:e.className, text:e.textContent?.slice(0,80), width:e.getBoundingClientRect().width})),
        }));
        expect(overflow.fits, JSON.stringify(overflow.elements)).toBe(true);
        await page.emulateMedia({ forcedColors: "active" });
        await expect(
          page.getByRole("switch", {
            name: "Protect specification drafts in this browser",
            exact: true,
          }),
        ).toBeVisible();
      });
    }
}
