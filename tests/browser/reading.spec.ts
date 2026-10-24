import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";
import { openRegistry } from "../../server/store.mjs";
import { createWorkbenchServer } from "../../server/http.mjs";
import { toDraft, newDraft } from "../../src/contract.mjs";
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
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: read, jump by keyboard, reload a section link, edit, save, and read persisted content`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?record=button`);
    await page
      .getByRole("button", { name: "Read specification", exact: true })
      .click();
    await expect(page.getByRole("main")).toBeFocused();
    const article = page.getByRole("article", { name: "Button", exact: true });
    await expect(article).toBeVisible();
    await expect(article.getByRole("table")).toHaveCount(1);
    await expect(article.getByRole("row")).toHaveCount(5);
    await expect(
      article.getByText("No usage or verification evidence recorded.", {
        exact: true,
      }),
    ).toBeVisible();
    const jump = page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: "Behavioral contract", exact: true });
    await jump.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#reading-contract")).toBeFocused();
    await expect(page).toHaveURL(/view=reading.*#reading-contract/);
    await page.reload();
    await expect(page.locator("#reading-contract")).toBeFocused();
    await page
      .getByRole("button", { name: "Edit this specification", exact: true })
      .click();
    await expect(page.locator(".editor")).toBeFocused();
    const saved = `A ${family} specification edited from the reading room and persisted in the registry.`;
    await page.getByLabel("Summary", { exact: true }).fill(saved);
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Button saved." }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Read specification", exact: true })
      .click();
    await expect(page.getByRole("article")).toContainText(saved);
    await page.reload();
    await expect(page.getByRole("article")).toContainText(saved);
    expect(registry.store.get("button").revision).toBe(2);
    expect(registry.store.history("button")).toHaveLength(2);
  });
  test(`${family}: reading refresh preserves old content on failure and editing rejects concurrent writes`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=reading&record=button`);
    const before = registry.store.get("button");
    await expect(page.getByRole("article")).toContainText(before.summary);
    const next = registry.store.save(
      before.id,
      {
        ...toDraft(before),
        summary:
          "A concurrent saved specification loaded only after an explicit refresh.",
      },
      before.revision,
    );
    await page.route("**/api/components/button", (route) =>
      route.request().method() === "GET" ? route.abort() : route.continue(),
    );
    await page
      .getByRole("button", { name: "Refresh specification", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "previously loaded revision is still available",
    );
    await expect(page.getByRole("alert")).toBeFocused();
    await expect(page.getByRole("article")).toContainText(before.summary);
    await page.unroute("**/api/components/button");
    await page
      .getByRole("button", { name: "Retry specification", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "loaded saved revision 2" }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toContainText(next.summary);
    await page
      .getByRole("button", { name: "Edit this specification", exact: true })
      .click();
    const later = registry.store.save(
      next.id,
      {
        ...toDraft(next),
        summary:
          "Another window saved a newer revision while this editor remained open.",
      },
      next.revision,
    );
    const draft =
      "The current editor draft must survive the conflict after opening from the reading room.";
    await page.getByLabel("Summary", { exact: true }).fill(draft);
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "changed in another window",
    );
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      draft,
    );
    await page.getByRole("link", { name: "Reading room", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      draft,
    );
    expect(registry.store.get("button").summary).toBe(later.summary);
    expect(registry.store.history("button")).toHaveLength(3);
  });
  test(`${family}: reading selection retains keyboard focus and handles a contract with no implementations`, async ({
    page,
    registry,
  }) => {
    const custom = registry.store.save(null, {
      ...newDraft(),
      name: "Unimplemented contract",
      summary:
        "A real contract with intended reach and no implementation or evidence claims.",
      acceptanceCriteria:
        "The consumer must distinguish intended reach from actual availability.",
    });
    await page.goto(`${registry.base}/${family}/?view=reading&record=button`);
    const picker = page.getByLabel("Read a component", { exact: true });
    await picker.focus();
    await picker.selectOption(custom.id);
    await expect(picker).toBeFocused();
    await expect(
      page.getByRole("article", { name: custom.name, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("No implementation is recorded for this component.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("No Martlet decisions recorded.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("No Krigsvold decisions recorded.", { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/record=unimplemented-contract/);
    expect(registry.store.get(custom.id).revision).toBe(1);
  });
  test(`${family}: reading room explains an empty registry and disables unavailable actions`, async ({
    page,
    registry,
  }) => {
    await page.route("**/api/components", (route) =>
      route.fulfill({ json: [] }),
    );
    await page.goto(`${registry.base}/${family}/?view=reading`);
    await expect(page.getByRole("status")).toContainText(
      "Choose a component to read",
    );
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Print specification", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "Edit this specification",
        exact: true,
      }),
    ).toBeDisabled();
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440]) {
      test(`${family}: substantial article ${mode} at ${width}px reflows, passes axe, and retains print content`, async ({
        page,
        registry,
      }) => {
        const before = registry.store.get("button");
        const record = registry.store.save(
          before.id,
          {
            ...toDraft(before),
            name: "A component with a deliberately long title for responsive reading",
            summary: "Read the saved component contract carefully. ".repeat(10),
            acceptanceCriteria:
              "Keyboard access, text spacing, long content, native controls, and recovery must remain usable.\n".repeat(
                18,
              ),
            martletNotes:
              "Use editorial grouping and a comfortable reading measure. ".repeat(
                20,
              ),
            krigsvoldNotes:
              "Use alignment, restrained surfaces, and precise hierarchy. ".repeat(
                20,
              ),
          },
          before.revision,
        );
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(
          `${registry.base}/${family}/?view=reading&record=button`,
        );
        await expect(page.getByRole("article")).toBeVisible();
        if (mode === "dark")
          await page
            .getByRole("button", { name: "Use dark mode", exact: true })
            .click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const accessibility = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(accessibility.violations).toEqual([]);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
          const style = document.createElement("style");
          style.textContent =
            "* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } p { margin-block-end:2em !important; }";
          document.head.append(style);
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(
          page.getByRole("navigation", { name: "On this page" }),
        ).toBeVisible();
        if (width === 1440) {
          await page.emulateMedia({ media: "print" });
          await expect(page.locator(".reading-controls")).not.toBeVisible();
          await expect(page.locator(`.${family}-contents`)).not.toBeVisible();
          await expect(page.locator(`.${family}-app-header`)).not.toBeVisible();
          await expect(page.locator(`.${family}-article-layout`)).toHaveCSS(
            "display",
            "block",
          );
          await expect(page.getByRole("article")).toContainText(
            record.martletNotes,
          );
          await expect(page.getByRole("article")).toContainText(
            record.krigsvoldNotes,
          );
        }
        expect(registry.store.get("button").revision).toBe(record.revision);
      });
    }
}
test("both article families preserve saved content and place contents before reading in the available frame", async ({
  page,
  registry,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const snapshots = [];
  for (const family of ["martlet", "krigsvold"]) {
    await page.goto(`${registry.base}/${family}/?view=reading&record=button`);
    await expect(page.getByRole("article")).toBeVisible();
    snapshots.push(
      await page.evaluate((family) => {
        const article = document.querySelector("article")!;
        const context = document.querySelector(`.${family}-article-context`)!;
        const prose = document.querySelector(`.${family}-prose`)!;
        return {
          text: article.textContent?.replace(/\s+/g, " ").trim(),
          contextX: context.getBoundingClientRect().x,
          proseX: prose.getBoundingClientRect().x,
          contextY: context.getBoundingClientRect().y,
          proseY: prose.getBoundingClientRect().y,
          font: getComputedStyle(prose).fontFamily,
        };
      }, family),
    );
  }
  expect(snapshots[0].text).toBe(snapshots[1].text);
  expect(snapshots[0].contextX).toBeLessThan(snapshots[0].proseX);
  expect(snapshots[1].contextX).toBeLessThanOrEqual(snapshots[1].proseX);
  expect(snapshots[1].contextY).toBeLessThanOrEqual(snapshots[1].proseY);
  expect(snapshots[0].font).not.toBe(snapshots[1].font);
});

