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
const confirmation = (page: Page) =>
  page.getByRole("checkbox", {
    name: "I reviewed these observations against the displayed specification and implementation inventory.",
    exact: true,
  });
const save = (page: Page) =>
  page.getByRole("button", { name: "Save readiness review", exact: true });
const ready = (page: Page) =>
  expect(
    page.getByRole("group", { name: "Real consumer", exact: true }),
  ).toBeVisible();
const note =
  "Fixture observation: the real consumer task and its keyboard recovery results require further manual verification.";
const checks = () =>
  blankReview().map((check) => ({ ...check, outcome: "passed", notes: note }));
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: native radio keyboard, linked validation, confirmation, save, reload, and review history`, async ({
    page,
    registry,
  }) => {
    const before = registry.store.get("button");
    await page.goto(`${registry.base}/${family}/?view=review&record=button`);
    await ready(page);
    const group = page.getByRole("group", {
        name: "Real consumer",
        exact: true,
      }),
      unreviewed = group.getByRole("radio", {
        name: "Not reviewed",
        exact: true,
      });
    await unreviewed.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      group.getByRole("radio", { name: "Needs work", exact: true }),
    ).toBeChecked();
    await page.keyboard.press("ArrowRight");
    await expect(
      group.getByRole("radio", { name: "Passed", exact: true }),
    ).toBeChecked();
    await save(page).click();
    await expect(page.getByRole("alert")).toBeFocused();
    await page.getByRole("link", { name: /Real consumer: record 20/ }).click();
    await expect(group).toBeFocused();
    await page
      .getByLabel("Real consumer observations", { exact: true })
      .fill(note);
    await confirmation(page).check();
    let release!: () => void;
    const gate = new Promise<void>((done) => (release = done));
    await page.route("**/api/components/button/review", async (route) => {
      if (route.request().method() === "PUT") await gate;
      await route.continue();
    });
    await save(page).click();
    await expect(
      page.getByRole("button", { name: "Saving review…", exact: true }),
    ).toBeDisabled();
    await expect(unreviewed).toBeDisabled();
    await page.getByRole("link", { name: "Reading room", exact: true }).click();
    await expect(page).toHaveURL(/view=review/);
    release();
    await expect(
      page.getByRole("status").filter({ hasText: "Readiness review saved" }),
    ).toBeVisible();
    const record = registry.store.get("button");
    expect(record.revision).toBe(2);
    expect(record.maturity).toBe(before.maturity);
    expect(record.implementations).toEqual(before.implementations);
    expect(registry.store.getReview("button").current).toBe(true);
    await page.reload();
    await ready(page);
    await expect(
      page.getByLabel("Real consumer observations", { exact: true }),
    ).toHaveValue(note);
    await expect(
      group.getByRole("radio", { name: "Passed", exact: true }),
    ).toBeChecked();
    await page.getByRole("link", { name: "Inventory", exact: true }).click();
    await page.getByText("Revision history", { exact: true }).click();
    await page.locator('[data-revision="2"] > summary').click();
    await expect(
      page.getByRole("complementary", {
        name: "Readiness review observations",
        exact: true,
      }),
    ).toContainText(note);
  });
  test(`${family}: stale writes preserve drafts and changed specifications require renewed outcomes`, async ({
    page,
    registry,
  }) => {
    const prior = registry.store.saveReview("button", checks(), 1, true).record;
    await page.goto(`${registry.base}/${family}/?view=review&record=button`);
    await ready(page);
    const text = page.getByLabel("Real consumer observations", { exact: true });
    await text.fill(note + " Additional unsaved observations.");
    await confirmation(page).check();
    registry.store.save(
      "button",
      {
        ...toDraft(prior),
        summary:
          "A concurrent contract change requires renewed review of every outcome.",
      },
      prior.revision,
    );
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText(
      "changed in another window",
    );
    await expect(text).toHaveValue(note + " Additional unsaved observations.");
    await expect(save(page)).toBeDisabled();
    await page
      .getByRole("button", { name: "Refresh saved review", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(text).toHaveValue(note + " Additional unsaved observations.");
    await page
      .getByRole("button", { name: "Refresh saved review", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(
      page.getByText(
        "Specification or inventory changed; the saved review needs renewal.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page
        .getByRole("group", { name: "Real consumer", exact: true })
        .getByRole("radio", { name: "Not reviewed", exact: true }),
    ).toBeChecked();
    await page
      .getByText("Previous saved observations", { exact: true })
      .click();
    await expect(page.locator(".review-prior")).toContainText(
      "consumer: passed",
    );
    await expect(text).toHaveValue(note);
    expect(registry.store.getReview("button").current).toBe(false);
    await confirmation(page).check();
    await save(page).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Readiness review saved" }),
    ).toBeVisible();
    expect(registry.store.getReview("button").summary.unreviewed).toBe(6);
    expect(registry.store.get("button").maturity).toBe(prior.maturity);
  });
  test(`${family}: uncertain committed response requires refresh without duplicate review history`, async ({
    page,
    registry,
  }) => {
    await page.goto(`${registry.base}/${family}/?view=review&record=button`);
    await ready(page);
    await page
      .getByLabel("Real consumer observations", { exact: true })
      .fill(note);
    await page
      .getByRole("group", { name: "Real consumer", exact: true })
      .getByRole("radio", { name: "Needs work", exact: true })
      .check();
    await confirmation(page).check();
    await page.route("**/api/components/button/review", async (route) => {
      if (route.request().method() === "PUT") {
        const response = await route.fetch();
        expect(response.ok()).toBe(true);
        await route.abort();
      } else await route.continue();
    });
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText(
      "could not be confirmed",
    );
    await expect(
      page.getByLabel("Real consumer observations", { exact: true }),
    ).toHaveValue(note);
    await expect(save(page)).toBeDisabled();
    expect(registry.store.get("button").revision).toBe(2);
    await page
      .getByRole("button", { name: "Refresh saved review", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Loaded Button at revision 2" }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Real consumer observations", { exact: true }),
    ).toHaveValue(note);
    expect(registry.store.history("button")).toHaveLength(2);
  });
  test(`${family}: loading and refresh failures recover while unsaved navigation preserves observations`, async ({
    page,
    registry,
  }) => {
    await page.route("**/api/components/button/review", (route) =>
      route.abort(),
    );
    await page.goto(`${registry.base}/${family}/?view=review&record=button`);
    await expect(page.getByRole("alert")).toContainText("could not be loaded");
    await page.unroute("**/api/components/button/review");
    await page
      .getByRole("button", { name: "Retry loading review", exact: true })
      .click();
    await ready(page);
    const text = page.getByLabel("Real consumer observations", { exact: true });
    await text.fill(note);
    await page.getByRole("link", { name: "Reading room", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(text).toHaveValue(note);
    await page.route("**/api/components/button/review", (route) =>
      route.abort(),
    );
    await page
      .getByRole("button", { name: "Refresh saved review", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("could not be loaded");
    await expect(text).toHaveValue(note);
    await expect(page.locator(".review-context")).toContainText("Button");
    expect(registry.store.get("button").revision).toBe(1);
  });
  test(`${family}: empty registry and all recorded passes remain honest about availability and maturity`, async ({
    page,
    registry,
  }) => {
    await page.route("**/api/components", (route) =>
      route.fulfill({ json: [] }),
    );
    await page.goto(`${registry.base}/${family}/?view=review`);
    await expect(page.getByRole("status")).toContainText(
      "No component is available",
    );
    await expect(
      page.getByLabel("Component to review", { exact: true }),
    ).toBeDisabled();
    await page.unroute("**/api/components");
    const record = registry.store.save(null, {
      ...newDraft(),
      name: "Review without implementation",
      summary:
        "This contract has six recorded fixture passes but no actual implementation.",
      acceptanceCriteria:
        "A review must never fabricate implementation availability or lifecycle promotion.",
    });
    registry.store.saveReview(record.id, checks(), record.revision, true);
    await page.goto(
      `${registry.base}/${family}/?view=review&record=${record.id}`,
    );
    await ready(page);
    await expect(
      page.getByText("No implementation is recorded.", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".review-progress")).toContainText("6 passed");
    await expect(page.locator(".review-progress")).toContainText(
      "separate stability and release decision",
    );
    expect(registry.store.get(record.id).maturity).toBe("proposed");
    expect(registry.store.get(record.id).implementations).toEqual([]);
  });
  test(`${family}: changing selection cancels a late load and retains native picker focus`, async ({
    page,
    registry,
  }) => {
    let release!: () => void;
    const gate = new Promise<void>((done) => (release = done));
    const original = registry.store.getReview("button");
    await page.route("**/api/components/button/review", async (route) => {
      await gate;
      await route.fulfill({ json: original }).catch(() => {});
    });
    await page.goto(`${registry.base}/${family}/?view=review&record=button`);
    await expect(page.getByRole("status")).toContainText(
      "Loading the saved specification",
    );
    const picker = page.getByLabel("Component to review", { exact: true });
    await picker.focus();
    await picker.selectOption("text-input");
    await ready(page);
    await expect(picker).toBeFocused();
    release();
    await expect(page.locator(".review-context h3")).toHaveText("TextInput");
    await expect(page).toHaveURL(/record=text-input/);
    expect(registry.store.get("button").revision).toBe(1);
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440])
      test(`${family}: review ${mode} at ${width}px reflows and passes axe with enlarged text`, async ({
        page,
        registry,
      }) => {
        registry.store.saveReview(
          "button",
          checks().map((item) => ({ ...item, notes: note.repeat(8) })),
          1,
          true,
        );
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(
          `${registry.base}/${family}/?view=review&record=button`,
        );
        await ready(page);
        if (mode === "dark")
          await page
            .getByRole("button", { name: "Use dark mode", exact: true })
            .click();
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
        await expect(save(page)).toBeVisible();
        expect(registry.store.get("button").revision).toBe(2);
      });
}

test("readiness content and radio contracts match while family typography and shell composition remain distinct", async ({
  page,
  registry,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const snapshots = [];
  for (const family of ["martlet", "krigsvold"]) {
    await page.goto(`${registry.base}/${family}/?view=review&record=button`);
    await ready(page);
    snapshots.push(
      await page.evaluate((family) => {
        const region = document.querySelector(".readiness-review")!,
          heading = region.querySelector("h2")!,
          header = document.querySelector(`.${family}-app-header`)!;
        const box = header.getBoundingClientRect();
        return {
          text: region.textContent?.replace(/\s+/g, " ").trim(),
          font: getComputedStyle(heading).fontFamily,
          wide: box.width > box.height,
          radios: Array.from(region.querySelectorAll("input[type=radio]")).map(
            (input) => ({
              name: (input as HTMLInputElement).name,
              value: (input as HTMLInputElement).value,
              checked: (input as HTMLInputElement).checked,
            }),
          ),
        };
      }, family),
    );
  }
  expect(snapshots[0].text).toBe(snapshots[1].text);
  expect(snapshots[0].radios).toEqual(snapshots[1].radios);
  expect(snapshots[0].font).not.toBe(snapshots[1].font);
  expect(snapshots[0].wide).toBe(true);
  expect(snapshots[1].wide).toBe(false);
});
