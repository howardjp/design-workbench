import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const family of ["martlet", "krigsvold"]) {
  test(`${family}: browse, filter, edit, validate, save, reload, and create`, async ({
    page,
  }) => {
    await page.goto(`/${family}/?record=button`);
    await expect(
      page.getByRole("heading", { level: 2, name: "Button", exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Search components", { exact: true })
      .fill("no-such-component");
    await expect(
      page.getByRole("heading", { name: "No components match" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("button", { name: "Inspect Button", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page.getByLabel("Summary", { exact: true }).fill("Too short");
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByRole("alert")).toContainText("Summary must contain");
    const summary = `The ${family} acceptance test edits a real shared registry specification.`;
    await page.getByLabel("Summary", { exact: true }).fill(summary);
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Button saved." }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByText(summary, { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Add component", exact: true })
      .click();
    await page
      .getByLabel("Component name", { exact: true })
      .fill(`Acceptance ${family}`);
    await page
      .getByLabel("Summary", { exact: true })
      .fill("A new component contract managed through the working registry.");
    await page
      .getByLabel("Acceptance criteria", { exact: true })
      .fill(
        "The new record must save, reload, and appear in both family views.",
      );
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: `Acceptance ${family}`,
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: `Acceptance ${family}`,
        exact: true,
      }),
    ).toBeVisible();
  });
  test(`${family}: failed saves and conflicts preserve the draft`, async ({
    page,
    request,
  }) => {
    await page.goto(`/${family}/?record=field`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    const draft = `The ${family} draft must survive network failure and concurrent editing.`;
    await page.getByLabel("Summary", { exact: true }).fill(draft);
    await page.route("**/api/components/field", (route) =>
      route.request().method() === "PUT" ? route.abort() : route.continue(),
    );
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Your draft is still here",
    );
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      draft,
    );
    await page.unroute("**/api/components/field");
    const before = await (await request.get("/api/components/field")).json();
    const concurrent =
      "A different window saved this field specification while the editor stayed open.";
    expect(
      (
        await request.put("/api/components/field", {
          data: {
            record: { ...before, summary: concurrent },
            revision: before.revision,
          },
        })
      ).ok(),
    ).toBeTruthy();
    await page
      .getByRole("button", { name: "Save specification", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "changed in another window",
    );
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      draft,
    );
    await page
      .getByRole("button", { name: "Reload saved record", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(page.getByText(concurrent, { exact: true })).toBeVisible();
  });
  test(`${family}: modal keyboard dismissal and unsaved navigation`, async ({
    page,
  }) => {
    await page.goto(`/${family}/?record=button`);
    await page
      .getByRole("button", { name: "Edit specification", exact: true })
      .click();
    await page
      .getByLabel("Summary", { exact: true })
      .fill(
        "An unsaved component specification that should stay in the editor.",
      );
    await page
      .getByRole("button", { name: "Inspect Card", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Keep editing", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.getByLabel("Summary", { exact: true })).toHaveValue(
      "An unsaved component specification that should stay in the editor.",
    );
    await page
      .getByRole("button", { name: "Inspect Card", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Discard changes", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Card", exact: true }),
    ).toBeVisible();
  });
  for (const width of [320, 1440])
    for (const mode of ["light", "dark"]) {
      test(`${family}: ${width}px ${mode} accessibility and reflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`/${family}/?record=button`);
        if (mode === "dark")
          await page
            .getByRole("button", { name: "Use dark mode", exact: true })
            .click();
        await page
          .getByRole("button", { name: "Edit specification", exact: true })
          .click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBeTruthy();
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(result.violations).toEqual([]);
        await page.emulateMedia({ reducedMotion: "reduce" });
        expect(
          await page
            .getByRole("button", { name: "Save specification", exact: true })
            .evaluate(
              (element) => getComputedStyle(element).transitionDuration,
            ),
        ).toBe("0s");
      });
    }
}
