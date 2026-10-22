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

const localText =
  "An unfinished specification retained across browser reload and explicit recovery.";
const save = (page: Page) =>
  page.getByRole("button", { name: "Save specification", exact: true });
const drafts = (page: Page) =>
  page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) =>
        key.startsWith("design-workbench:specification-draft:v1:"),
      )
      .map((key) => JSON.parse(localStorage.getItem(key)!)),
  );
async function edit(page: Page, url: string) {
  await page.goto(url);
  await page
    .getByRole("button", { name: "Edit specification", exact: true })
    .click();
  await page.getByLabel("Summary", { exact: true }).fill(localText);
  await expect(
    page.getByText("Draft protected in this browser.", { exact: false }),
  ).toBeVisible();
}
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: incomplete draft survives reload, requires explicit restore, then saves and clears its copy`, async ({
    page,
    registry,
  }) => {
    await edit(page, `${registry.base}/${family}/?record=button`);
    await page.getByLabel("Component name", { exact: true }).fill("");
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Recover unfinished specifications",
        exact: true,
      }),
    ).toBeVisible();
    await expect(save(page)).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Restore draft Unnamed component",
        exact: true,
      })
      .click();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      localText,
    );
    await expect(
      page.getByLabel("Component name", { exact: true }),
    ).toHaveValue("");
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText("Name must contain");
    expect(registry.store.history("button")).toHaveLength(1);
    await page.getByLabel("Component name", { exact: true }).fill("Button");
    await save(page).click();
    await expect(
      page.getByText("Button saved. Revision 2", { exact: false }),
    ).toBeVisible();
    expect(await drafts(page)).toHaveLength(0);
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Recover unfinished specifications",
        exact: true,
      }),
    ).toHaveCount(0);
    expect(registry.store.get("button").summary).toBe(localText);
  });
  test(`${family}: restored older base requires comparison, retains draft after read failure, and never writes implicitly`, async ({
    page,
    registry,
  }) => {
    await edit(page, `${registry.base}/${family}/?record=button`);
    const previous = registry.store.get("button");
    registry.store.save(
      "button",
      {
        ...toDraft(previous),
        summary:
          "A concurrent saved specification that must not be overwritten by restoring a draft.",
      },
      previous.revision,
    );
    await page.reload();
    await page.route("**/api/components/button", (route) => route.abort());
    await page
      .getByRole("button", { name: "Restore draft Button", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "browser draft is retained",
    );
    expect(await drafts(page)).toHaveLength(1);
    await page.unroute("**/api/components/button");
    await page
      .getByRole("button", { name: "Restore draft Button", exact: true })
      .click();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      localText,
    );
    await expect(save(page)).toBeDisabled();
    await page
      .getByRole("button", {
        name: "Compare with latest saved record",
        exact: true,
      })
      .click();
    await page
      .getByRole("group", { name: "Summary", exact: true })
      .getByRole("radio", { name: "Use my draft", exact: true })
      .check();
    await page
      .getByRole("button", {
        name: "Use choices as editing draft",
        exact: true,
      })
      .click();
    expect(registry.store.history("button")).toHaveLength(2);
    await save(page).click();
    await expect(
      page.getByText("Button saved. Revision 3", { exact: false }),
    ).toBeVisible();
    expect(await drafts(page)).toHaveLength(0);
  });
  test(`${family}: separate tabs keep independent copies and explicit discard removes only its chosen copy`, async ({
    page,
    context,
    registry,
  }) => {
    await edit(page, `${registry.base}/${family}/?record=button`);
    const other = await context.newPage();
    await edit(other, `${registry.base}/${family}/?record=text-input`);
    await other
      .getByLabel("Summary", { exact: true })
      .fill(
        "A different tab has its own independent retained specification draft.",
      );
    expect(await drafts(page)).toHaveLength(2);
    await page.reload();
    await page
      .getByRole("button", { name: "Discard draft Button", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Restore draft TextInput",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Restore draft Button", exact: true }),
    ).toHaveCount(0);
    expect(await drafts(page)).toHaveLength(1);
    expect(registry.store.history("button")).toHaveLength(1);
    await other.close();
  });
  test(`${family}: storage denial is visible and ordinary server saving still works`, async ({
    page,
    registry,
  }) => {
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key.startsWith("design-workbench:specification-draft:"))
          throw new DOMException("Quota", "QuotaExceededError");
        return original.call(this, key, value);
      };
    });
    await page.goto(`${registry.base}/${family}/?record=button`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page.getByLabel("Summary", { exact: true }).fill(localText);
    await expect(
      page.getByText("This draft could not be protected in browser storage.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Draft protected in this browser.", { exact: false }),
    ).toHaveCount(0);
    await save(page).click();
    await expect(
      page.getByText("Button saved. Revision 2", { exact: false }),
    ).toBeVisible();
  });
  test(`${family}: lost new-record response is checked without replaying creation, including after reload`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/`);
    await page
      .getByRole("button", { name: "Add component", exact: true })
      .click();
    await page
      .getByLabel("Component name", { exact: true })
      .fill("NewRetained");
    await page.getByLabel("Summary", { exact: true }).fill(localText);
    await page
      .getByLabel("Acceptance criteria", { exact: true })
      .fill(
        "A lost response must not create a second saved record or history entry.",
      );
    let posts = 0;
    await page.route("**/api/components", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      posts++;
      expect((await drafts(page)).some((copy) => copy.uncertain)).toBe(true);
      await route.fetch();
      await route.abort();
    });
    await save(page).click();
    await expect(
      page.getByRole("button", { name: "Check saved inventory", exact: true }),
    ).toBeVisible();
    await expect(save(page)).toBeDisabled();
    await page.reload();
    await page
      .getByRole("button", { name: "Restore draft NewRetained", exact: true })
      .click();
    await expect(save(page)).toBeDisabled();
    await page
      .getByRole("button", { name: "Check saved inventory", exact: true })
      .click();
    await expect(
      page.getByText("Your draft matches saved component NewRetained", {
        exact: false,
      }),
    ).toBeVisible();
    expect(posts).toBe(1);
    expect(registry.store.history("newretained")).toHaveLength(1);
    expect(await drafts(page)).toHaveLength(0);
  });
  test(`${family}: unsuccessful creation can be checked and retried; a different saved match needs deliberate comparison`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/`);
    await page
      .getByRole("button", { name: "Add component", exact: true })
      .click();
    await page.getByLabel("Component name", { exact: true }).fill("NewRetry");
    await page.getByLabel("Summary", { exact: true }).fill(localText);
    await page
      .getByLabel("Acceptance criteria", { exact: true })
      .fill(
        "An unsuccessful creation must be checked before trying to save again.",
      );
    await page.route("**/api/components", (route) =>
      route.request().method() === "POST" ? route.abort() : route.continue(),
    );
    await save(page).click();
    await page
      .getByRole("button", { name: "Check saved inventory", exact: true })
      .click();
    await expect(save(page)).toBeEnabled();
    await page.unroute("**/api/components");
    await save(page).click();
    await expect(
      page.getByText("NewRetry saved. Revision 1", { exact: false }),
    ).toBeVisible();
    expect(registry.store.history("newretry")).toHaveLength(1);
    await page
      .getByRole("button", { name: "Add component", exact: true })
      .click();
    await page.getByLabel("Component name", { exact: true }).fill("Button");
    await page.getByLabel("Summary", { exact: true }).fill(localText);
    await page
      .getByLabel("Acceptance criteria", { exact: true })
      .fill(
        "A name collision requires deliberate comparison before changing the existing contract.",
      );
    await page.route("**/api/components", (route) =>
      route.request().method() === "POST" ? route.abort() : route.continue(),
    );
    await save(page).click();
    await page
      .getByRole("button", { name: "Check saved inventory", exact: true })
      .click();
    await expect(save(page)).toBeDisabled();
    await page
      .getByRole("button", {
        name: "Compare as an edit of Button",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Compare retained draft",
        exact: true,
      }),
    ).toBeVisible();
    expect(registry.store.history("button")).toHaveLength(1);
  });
  test(`${family}: leaving a pending restore cancels it and retains the offered copy`, async ({
    page,
    registry,
  }) => {
    await edit(page, `${registry.base}/${family}/?record=button`);
    await page.reload();
    let release!: () => void;
    const gate = new Promise<void>((done) => {
      release = done;
    });
    await page.route("**/api/components/button", async (route) => {
      await gate;
      await route.continue().catch(() => {});
    });
    await page
      .getByRole("button", { name: "Restore draft Button", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Cancel restoring draft", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Workspace sections" })
      .getByRole("link", { name: "Overview", exact: true })
      .click();
    release();
    await expect(
      page.getByRole("heading", { name: "System overview", exact: true }),
    ).toBeVisible();
    await expect(save(page)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Restore draft Button", exact: true }),
    ).toBeVisible();
    expect(await drafts(page)).toHaveLength(1);
    expect(registry.store.history("button")).toHaveLength(1);
  });
  test(`${family}: recovery offer reflows with large text and forced colors; draft survives a fresh browser context`, async ({
    page,
    browser,
    registry,
  }) => {
    await edit(page, `${registry.base}/${family}/?record=button`);
    const state = await page.context().storageState();
    const context = await browser.newContext({
      storageState: state,
      viewport: { width: 320, height: 800 },
      forcedColors: "active",
    });
    const restored = await context.newPage();
    await restored.goto(`${registry.base}/${family}/`);
    await restored
      .getByRole("button", { name: "Restore draft Button", exact: true })
      .focus();
    await expect(
      restored.getByRole("button", {
        name: "Restore draft Button",
        exact: true,
      }),
    ).toBeFocused();
    await restored.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
      for (const element of document.querySelectorAll<HTMLElement>("*")) {
        element.style.lineHeight = "1.5";
        element.style.letterSpacing = ".12em";
        element.style.wordSpacing = ".16em";
      }
    });
    expect(
      await restored.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page: restored }).analyze();
    expect(results.violations).toEqual([]);
    await context.close();
  });
}
