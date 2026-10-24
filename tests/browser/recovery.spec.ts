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

const localText =
  "A retained local specification with deliberate changes that must survive comparison and conflict recovery.";
const savedText =
  "A newer specification saved by another editing window while the retained local draft remains open.";
const observations =
  "Fixture observations for recovery checks only; no production verification is claimed.";
const save = (page: Page) =>
  page.getByRole("button", { name: "Save specification", exact: true });
const group = (page: Page, name: string) =>
  page.getByRole("group", { name, exact: true });
const choose = (
  page: Page,
  name: string,
  source: "draft" | "saved",
  revision = 2,
) =>
  group(page, name)
    .getByRole("radio", {
      name:
        source === "draft" ? "Use my draft" : `Use saved revision ${revision}`,
      exact: true,
    })
    .check();
const apply = (page: Page) =>
  page.getByRole("button", {
    name: "Use choices as editing draft",
    exact: true,
  });
async function edit(page: Page, base: string, family: string) {
  await page.goto(`${base}/${family}/?record=button`);
  await page
    .getByRole("button", { name: "Edit specification", exact: true })
    .click();
  await page.getByLabel("Summary", { exact: true }).fill(localText);
}
async function conflict(page: Page) {
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "changed in another window",
  );
  await expect(save(page)).toBeDisabled();
  await page
    .getByRole("button", {
      name: "Compare with latest saved record",
      exact: true,
    })
    .click();
  await expect(group(page, "Summary")).toBeVisible();
}
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: explicit field choices retain local work and latest metadata, then save persistently through the normal revision gate`, async ({
    page,
    registry,
  }) => {
    registry.store.saveReview("button", blankReview(), 1, true);
    await edit(page, registry.base, family);
    await page.getByRole("checkbox", { name: "Vue", exact: true }).check();
    const before = registry.store.get("button");
    const newer = registry.store.save(
      "button",
      {
        ...toDraft(before),
        summary: savedText,
        evidence: observations,
        targets: ["React", "Svelte"],
      },
      before.revision,
    );
    await conflict(page);
    await expect(
      page.getByRole("heading", {
        name: "Compare retained draft",
        exact: true,
      }),
    ).toBeFocused();
    expect(registry.store.history("button")).toHaveLength(3);
    await expect(group(page, "Summary").locator("dd")).toHaveText([
      before.summary,
      localText,
      savedText,
    ]);
    await expect(page.locator(".conflict-recovery input:checked")).toHaveCount(
      0,
    );
    await apply(page).click();
    await expect(page.getByRole("alert")).toBeFocused();
    await page
      .getByRole("link", {
        name: "Summary: choose your draft or the saved value.",
        exact: true,
      })
      .click();
    await expect(group(page, "Summary")).toBeFocused();
    const local = group(page, "Summary").getByRole("radio", {
      name: "Use my draft",
      exact: true,
    });
    await local.focus();
    await page.keyboard.press("Space");
    await choose(page, "Target platforms", "saved", 3);
    await choose(page, "Usage and verification evidence", "saved", 3);
    await apply(page).click();
    await expect(page.locator(".editor")).toBeFocused();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      localText,
    );
    await expect(
      page.getByRole("checkbox", { name: "Svelte", exact: true }),
    ).toBeChecked();
    expect(registry.store.get("button").revision).toBe(3);
    await save(page).click();
    await expect(page.locator(".spec-summary")).toHaveText(localText);
    const record = registry.store.get("button");
    expect(record.revision).toBe(4);
    expect(record.evidence).toBe(observations);
    expect(record.review).toEqual(newer.review);
    expect(record.implementations).toEqual(newer.implementations);
    expect(record.maturity).toBe(before.maturity);
    await page.reload();
    await expect(page.locator(".spec-summary")).toHaveText(localText);
    expect(registry.store.history("button")).toHaveLength(4);
  });
  test(`${family}: failed comparison refresh retains choices, newer snapshots reset them, and another save can conflict again`, async ({
    page,
    registry,
  }) => {
    await edit(page, registry.base, family);
    const first = registry.store.get("button");
    registry.store.save(
      "button",
      { ...toDraft(first), summary: savedText },
      first.revision,
    );
    await conflict(page);
    await choose(page, "Summary", "draft");
    await page.getByRole("link", { name: "Reading room", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      group(page, "Summary").getByRole("radio", {
        name: "Use my draft",
        exact: true,
      }),
    ).toBeChecked();
    await page.route("**/api/components/button", (route) => route.abort());
    await page
      .getByRole("button", {
        name: "Refresh comparison and clear choices",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "choices are still here",
    );
    await expect(
      group(page, "Summary").getByRole("radio", {
        name: "Use my draft",
        exact: true,
      }),
    ).toBeChecked();
    await expect(apply(page)).toBeDisabled();
    await page.unroute("**/api/components/button");
    const second = registry.store.get("button");
    registry.store.save(
      "button",
      { ...toDraft(second), evidence: observations },
      second.revision,
    );
    await page
      .getByRole("button", { name: "Retry comparison", exact: true })
      .click();
    await expect(page.locator(".recovery-position")).toContainText(
      "saved revision 3",
    );
    await expect(page.locator(".conflict-recovery input:checked")).toHaveCount(
      0,
    );
    await choose(page, "Summary", "draft");
    await choose(page, "Usage and verification evidence", "saved", 3);
    await apply(page).click();
    const third = registry.store.get("button");
    registry.store.save(
      "button",
      {
        ...toDraft(third),
        summary: savedText + " A further concurrent change.",
      },
      third.revision,
    );
    await conflict(page);
    await expect(page.locator(".recovery-position")).toContainText(
      "saved revision 4",
    );
    await expect(group(page, "Summary").locator("dd")).toContainText([
      savedText,
      localText,
      savedText + " A further concurrent change.",
    ]);
    await choose(page, "Summary", "draft");
    await page
      .getByRole("button", {
        name: "Discard choices and return to my draft",
        exact: true,
      })
      .click();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      localText,
    );
    await expect(save(page)).toBeDisabled();
    expect(registry.store.get("button").revision).toBe(4);
  });
  test(`${family}: a lost committed response matches normalized saved content without replaying a save`, async ({
    page,
    registry,
  }) => {
    await edit(page, registry.base, family);
    await page
      .getByLabel("Summary", { exact: true })
      .fill("  " + localText + "  ");
    await page.route("**/api/components/button", async (route) => {
      if (route.request().method() === "PUT") {
        expect((await route.fetch()).ok()).toBe(true);
        await route.abort();
      } else await route.continue();
    });
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText(
      "could not be confirmed",
    );
    await expect(save(page)).toBeDisabled();
    expect(registry.store.get("button").revision).toBe(2);
    await page
      .getByRole("button", {
        name: "Compare with latest saved record",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        "Your draft matches the latest saved contract. Return to that saved revision without writing another revision.",
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Return to matching saved record",
        exact: true,
      })
      .click();
    await expect(page.locator(".spec-summary")).toHaveText(localText);
    await expect(
      page.getByRole("status").filter({ hasText: "No new save was made" }),
    ).toBeVisible();
    expect(registry.store.history("button")).toHaveLength(2);
    await page.reload();
    await expect(page.locator(".spec-summary")).toHaveText(localText);
  });
  test(`${family}: initial comparison failures retry, wrong identities are refused, and navigation cancels late reads while retaining the original draft`, async ({
    page,
    registry,
  }) => {
    await edit(page, registry.base, family);
    const before = registry.store.get("button");
    registry.store.save(
      "button",
      { ...toDraft(before), summary: savedText },
      before.revision,
    );
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText(
      "changed in another window",
    );
    await page.route("**/api/components/button", (route) =>
      route.fulfill({ json: registry.store.get("field") }),
    );
    await page
      .getByRole("button", {
        name: "Compare with latest saved record",
        exact: true,
      })
      .click();
    await expect(page.getByRole("alert")).toContainText("different identity");
    await expect(apply(page)).toHaveCount(0);
    await page.unroute("**/api/components/button");
    await page
      .getByRole("button", { name: "Retry comparison", exact: true })
      .click();
    await expect(group(page, "Summary")).toBeVisible();
    await page
      .getByRole("button", {
        name: "Discard choices and return to my draft",
        exact: true,
      })
      .click();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      localText,
    );
    let release!: () => void;
    const gate = new Promise<void>((done) => (release = done));
    const old = registry.store.get("button");
    await page.route("**/api/components/button", async (route) => {
      await gate;
      await route.fulfill({ json: old }).catch(() => {});
    });
    await page
      .getByRole("button", {
        name: "Compare with latest saved record",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Loading latest specification…",
        exact: true,
      }),
    ).toBeDisabled();
    await page.getByRole("link", { name: "Overview", exact: true }).click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    release();
    await expect(page).toHaveURL(/view=overview/);
    await expect(
      page.getByRole("heading", { name: "System overview", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".conflict-recovery")).toHaveCount(0);
    expect(registry.store.get("button").revision).toBe(2);
  });
  test(`${family}: explicitly combined choices remain subject to normal stability validation and do not write on comparison`, async ({
    page,
    registry,
  }) => {
    await edit(page, registry.base, family);
    await page
      .getByLabel("Maturity stage", { exact: true })
      .selectOption("stable");
    await page
      .getByLabel("Usage and verification evidence", { exact: true })
      .fill(observations);
    const before = registry.store.get("button");
    registry.store.save(
      "button",
      { ...toDraft(before), summary: savedText },
      before.revision,
    );
    await conflict(page);
    await choose(page, "Summary", "draft");
    await choose(page, "Maturity stage", "draft");
    await choose(page, "Usage and verification evidence", "saved");
    await apply(page).click();
    expect(registry.store.get("button").maturity).toBe("experimental");
    expect(registry.store.get("button").revision).toBe(2);
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText(
      "Stable components need recorded",
    );
    expect(registry.store.get("button").revision).toBe(2);
    await page
      .getByRole("link", { name: /Stable components need recorded/ })
      .click();
    await expect(
      page.getByLabel("Usage and verification evidence", { exact: true }),
    ).toBeFocused();
    await page
      .getByLabel("Usage and verification evidence", { exact: true })
      .fill(observations);
    await save(page).click();
    await expect(page.locator(".spec-summary")).toHaveText(localText);
    expect(registry.store.get("button").revision).toBe(3);
  });
  for (const mode of ["light", "dark"])
    for (const width of [320, 1440])
      test(`${family}: long recovery ${mode} at ${width}px reflows and passes axe and enlarged text checks`, async ({
        page,
        registry,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await edit(page, registry.base, family);
        await page
          .getByLabel("Summary", { exact: true })
          .fill(localText.repeat(5));
        await page
          .getByLabel("Martlet notes", { exact: true })
          .fill(observations.repeat(35));
        await page
          .getByLabel("Krigsvold notes", { exact: true })
          .fill(observations.repeat(35));
        const before = registry.store.get("button");
        registry.store.save(
          "button",
          {
            ...toDraft(before),
            summary: savedText,
            martletNotes: savedText.repeat(25),
            krigsvoldNotes: savedText.repeat(25),
          },
          before.revision,
        );
        if (mode === "dark")
          await page
            .getByRole("button", { name: "Use dark mode", exact: true })
            .click();
        await conflict(page);
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
            "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-block-end:2em!important}";
          document.head.append(style);
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(apply(page)).toBeVisible();
        expect(registry.store.get("button").revision).toBe(2);
      });
}
test("recovery content and native choice contracts match while definition compositions and typography differ", async ({
  page,
  registry,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const snapshots = [];
  await page.route("**/api/components/button", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({
          status: 409,
          json: {
            message:
              "This record changed in another window. Fixture conflict for composition review.",
          },
        })
      : route.continue(),
  );
  for (const family of ["martlet", "krigsvold"]) {
    await edit(page, registry.base, family);
    await conflict(page);
    snapshots.push(
      await page
        .locator(".conflict-recovery")
        .evaluate((el) => ({
          text: el.textContent,
          font: getComputedStyle(el.querySelector("h3")!).fontFamily,
          columns: getComputedStyle(
            el.querySelector(".recovery-values")!,
          ).gridTemplateColumns.split(" ").length,
          inputs: Array.from(el.querySelectorAll("input")).map((i) => ({
            type: i.type,
            name: i.name,
            value: i.value,
            checked: i.checked,
          })),
        })),
    );
  }
  expect(snapshots[0].text).toBe(snapshots[1].text);
  expect(snapshots[0].inputs).toEqual(snapshots[1].inputs);
  expect(snapshots[0].font).not.toBe(snapshots[1].font);
  expect(snapshots.map((s) => s.columns)).toEqual([3, 1]);
});
