import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";
import { openRegistry } from "../../server/store.mjs";
import { createWorkbenchServer } from "../../server/http.mjs";
import { blankReview } from "../../src/review.mjs";
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

const fixtureNote =
  "Fixture observations for queue verification, not evidence of production usage.";
function prepare(store: ReturnType<typeof openRegistry>) {
  const passed = blankReview().map((c) => ({
    ...c,
    outcome: "passed",
    notes: fixtureNote,
  }));
  store.saveReview(
    "button",
    passed.map((c) =>
      c.id === "keyboard" ? { ...c, outcome: "needs-work" } : c,
    ),
    1,
    true,
  );
  const old = store.saveReview("text-input", passed, 1, true).record;
  store.save(
    "text-input",
    {
      ...toDraft(old),
      summary:
        "Changed queue fixture specification requires renewed observations.",
    },
    old.revision,
  );
}
const list = (page: Page) => page.locator(".queue-list");
const queueReady = (page: Page) =>
  expect(page.locator(".queue-counts")).toBeVisible();
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: queue filters, keyboard pages, URL reload and family navigation retain identical state`, async ({
    page,
    registry,
  }) => {
    prepare(registry.store);
    await page.goto(`${registry.base}/${family}/?view=queue`);
    await queueReady(page);
    await expect(list(page).locator("> li").first()).toHaveAttribute(
      "data-queue-id",
      "text-input",
    );
    await expect(list(page).locator("> li").first()).toContainText(
      "0 passed · 0 need work · 6 not reviewed",
    );
    await expect(list(page).locator("> li").first()).toContainText(
      "Previous saved results: 6 passed",
    );
    await page
      .getByLabel("Review position", { exact: true })
      .selectOption("current");
    await page
      .getByLabel("Current area outcome", { exact: true })
      .selectOption("needs-work");
    await page
      .getByLabel("Review area", { exact: true })
      .selectOption("keyboard");
    await expect(list(page).locator("> li")).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Review Button", exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Review area", { exact: true })
      .selectOption("assistive");
    await expect(
      page.getByText(/No reviews match these filters/),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear queue filters", exact: true })
      .click();
    await page.getByLabel("Queue order", { exact: true }).selectOption("name");
    const next = page.getByRole("button", { name: "Next page", exact: true });
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("status").filter({ hasText: "11–20 of" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/rq-page=2/);
    await page.reload();
    await queueReady(page);
    await expect(
      page.getByRole("navigation", { name: "Review queue pages" }),
    ).toContainText("Page 2 of");
    const other = family === "martlet" ? "Krigsvold" : "Martlet";
    await page.getByRole("link", { name: other, exact: true }).click();
    await queueReady(page);
    await expect(page).toHaveURL(/rq-page=2/);
    await expect(page.getByLabel("Queue order", { exact: true })).toHaveValue(
      "name",
    );
    await page
      .getByLabel("Search review queue", { exact: true })
      .fill("not-a-real-contract");
    await expect(
      page.getByText(/No reviews match these filters/),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/rq-page=/);
    await expect(
      page.getByRole("button", { name: "Next page", exact: true }),
    ).toBeDisabled();
    expect(registry.store.history("button")).toHaveLength(2);
  });
  test(`${family}: queue opens a freshly fetched review and returns to renewed results without promotion`, async ({
    page,
    registry,
  }) => {
    prepare(registry.store);
    await page.goto(
      `${registry.base}/${family}/?view=queue&rq-position=renewal&record=text-input`,
    );
    await queueReady(page);
    const stale = registry.store.get("text-input");
    registry.store.save(
      stale.id,
      {
        ...toDraft(stale),
        summary: "Newer contract saved after the displayed queue snapshot.",
      },
      stale.revision,
    );
    await page
      .getByRole("link", { name: "Review TextInput", exact: true })
      .click();
    await expect(
      page.getByRole("group", { name: "Real consumer", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".review-context")).toContainText(
      "Newer contract saved after",
    );
    const text = page.getByLabel("Real consumer observations", { exact: true });
    await text.fill(fixtureNote + " Added in this browser.");
    await page.getByRole("link", { name: "Review queue", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(text).toHaveValue(fixtureNote + " Added in this browser.");
    await page
      .getByRole("checkbox", {
        name: "I reviewed these observations against the displayed specification and implementation inventory.",
        exact: true,
      })
      .check();
    await page
      .getByRole("button", { name: "Save readiness review", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Readiness review saved" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Review queue", exact: true }).click();
    await queueReady(page);
    await expect(
      page.getByLabel("Review position", { exact: true }),
    ).toHaveValue("renewal");
    await expect(
      page.getByText(/No reviews match these filters/),
    ).toBeVisible();
    expect(registry.store.getReview("text-input").current).toBe(true);
    expect(registry.store.get("text-input").maturity).toBe("experimental");
    expect(registry.store.get("text-input").revision).toBe(5);
  });
  test(`${family}: queue retry and refresh failures retain the snapshot; late loads cannot navigate or alter another view`, async ({
    page,
    registry,
  }) => {
    await page.route("**/api/reviews/queue", (route) => route.abort());
    await page.goto(`${registry.base}/${family}/?view=queue`);
    await expect(page.getByRole("alert")).toBeFocused();
    await page.unroute("**/api/reviews/queue");
    await page
      .getByRole("button", { name: "Retry loading queue", exact: true })
      .click();
    await queueReady(page);
    const first = (await list(page).textContent())!;
    await page.route("**/api/reviews/queue", (route) => route.abort());
    await page
      .getByRole("button", { name: "Refresh review queue", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("snapshot is retained");
    await expect(list(page)).toHaveText(first);
    await page.unroute("**/api/reviews/queue");
    prepare(registry.store);
    await page
      .getByRole("button", { name: "Retry loading queue", exact: true })
      .click();
    await expect(page.locator(".queue-counts")).toContainText("1 need renewal");
    let release!: () => void;
    const gate = new Promise<void>((done) => (release = done));
    await page.route("**/api/reviews/queue", async (route) => {
      await gate;
      await route.fulfill({ json: { entries: [] } }).catch(() => {});
    });
    await page
      .getByRole("button", { name: "Refresh review queue", exact: true })
      .click();
    await page.getByRole("link", { name: "Reading room", exact: true }).click();
    release();
    await expect(page).toHaveURL(/view=reading/);
    await expect(page.getByRole("article")).toBeVisible();
    await expect(page.locator(".review-queue")).toHaveCount(0);
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440])
      test(`${family}: queue ${mode} at ${width}px reflows, exposes area gaps and passes axe and text-spacing checks`, async ({
        page,
        registry,
      }) => {
        prepare(registry.store);
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${registry.base}/${family}/?view=queue`);
        await queueReady(page);
        if (mode === "dark")
          await page
            .getByRole("button", { name: "Use dark mode", exact: true })
            .click();
        await page
          .getByText("Current area outcomes for TextInput", { exact: true })
          .click();
        await expect(
          list(page).locator("> li").first().locator("dd"),
        ).toHaveText(Array(6).fill("Not reviewed"));
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
            "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-block-end:2em!important}";
          document.head.append(style);
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(
          page.getByRole("link", { name: "Review TextInput", exact: true }),
        ).toBeVisible();
      });
}
test("queue content matches with family-specific typography and row composition; empty and invalid page recovery stays bounded", async ({
  page,
  registry,
}) => {
  prepare(registry.store);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const snapshots = [];
  for (const family of ["martlet", "krigsvold"]) {
    await page.goto(`${registry.base}/${family}/?view=queue&rq-page=99999999`);
    await queueReady(page);
    await expect(
      page.getByRole("navigation", { name: "Review queue pages" }),
    ).toContainText("Page 4 of 4");
    await expect(page).toHaveURL(/rq-page=4/);
    snapshots.push(
      await page
        .locator(".queue-list")
        .evaluate((el) => ({
          text: el.textContent,
          font: getComputedStyle(el.querySelector("h3")!).fontFamily,
          columns: getComputedStyle(
            el.firstElementChild!,
          ).gridTemplateColumns.split(" ").length,
        })),
    );
  }
  expect(snapshots[0].text).toBe(snapshots[1].text);
  expect(snapshots[0].font).not.toBe(snapshots[1].font);
  expect(snapshots.map((s) => s.columns)).toEqual([2, 3]);
  await page.route("**/api/reviews/queue", (route) =>
    route.fulfill({
      json: {
        schemaVersion: 1,
        policyVersion: 1,
        generatedAt: "2026-10-22T09:00:00Z",
        entries: [],
        counts: {
          total: 0,
          current: 0,
          renewal: 0,
          notRecorded: 0,
          allPassed: 0,
        },
      },
    }),
  );
  await page
    .getByRole("button", { name: "Refresh review queue", exact: true })
    .click();
  await expect(
    page.getByText(/No components are available for review/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous page", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Next page", exact: true }),
  ).toBeDisabled();
});
