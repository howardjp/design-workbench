import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Martlet from "@martlet/react";
import * as Krigsvold from "@krigsvold/react";
for (const [family, UI] of [
  ["martlet", Martlet],
  ["krigsvold", Krigsvold],
]) {
  test(`${family} reusable exports retain native form semantics and attributes`, () => {
    const button = renderToStaticMarkup(
      h(
        UI.Button,
        { "aria-label": "Save record", disabled: true, variant: "secondary" },
        "Save",
      ),
    );
    assert.match(button, /type="button"/);
    assert.match(button, /disabled=""/);
    assert.match(button, /aria-label="Save record"/);
    assert.match(button, new RegExp(`${family}-button--secondary`));
    const input = renderToStaticMarkup(
      h(UI.TextInput, {
        name: "email",
        type: "email",
        required: true,
        autoComplete: "email",
        "data-consumer": "native",
      }),
    );
    assert.match(input, /type="email"/);
    assert.match(input, /required=""/);
    assert.match(input, /autoComplete="email"/);
    assert.match(input, /data-consumer="native"/);
  });
  test(`${family} fields associate labels, hints and errors with their control`, () => {
    const field = renderToStaticMarkup(
      h(
        UI.Field,
        {
          label: "Name",
          hint: "Use the exported name.",
          error: "Name is required.",
        },
        (props) => h(UI.TextInput, { ...props, name: "name" }),
      ),
    );
    const id = field.match(/<label for="([^"]+)"/)[1];
    assert.ok(field.includes(`id="${id}"`));
    assert.ok(field.includes(`aria-describedby="${id}-hint ${id}-error"`));
    assert.match(field, /aria-invalid="true"/);
  });
  test(`${family} notices use appropriate live regions and tables keep captions`, () => {
    assert.match(
      renderToStaticMarkup(h(UI.Notice, { kind: "success" }, "Saved")),
      /role="status"/,
    );
    assert.match(
      renderToStaticMarkup(h(UI.Notice, { kind: "error" }, "Failed")),
      /role="alert"/,
    );
    const table = renderToStaticMarkup(
      h(
        UI.DataTable,
        { caption: "Records" },
        h("tbody", null, h("tr", null, h("td", null, "Button"))),
      ),
    );
    assert.match(table, /<caption>Records<\/caption>/);
    assert.match(table, /role="region"/);
    assert.match(table, /tabindex="0"/);
  });
}
for (const [family, UI] of [
  ["martlet", Martlet],
  ["krigsvold", Krigsvold],
]) {
  test(`${family} checkbox, fieldset, and disclosure retain native behavior contracts`, () => {
    const checkbox = renderToStaticMarkup(
      h(UI.Checkbox, {
        label: "React",
        name: "targets",
        checked: true,
        readOnly: true,
        disabled: true,
      }),
    );
    assert.match(checkbox, /type="checkbox"/);
    assert.match(checkbox, /checked=""/);
    assert.match(checkbox, /disabled=""/);
    assert.match(checkbox, />React<\/label>/);
    const group = renderToStaticMarkup(
      h(
        UI.Fieldset,
        {
          legend: "Targets",
          hint: "Choose supported intent.",
          error: "Choose at least one.",
          disabled: true,
        },
        h(UI.Checkbox, { label: "React" }),
      ),
    );
    assert.match(group, /<legend>Targets<\/legend>/);
    assert.match(group, /aria-invalid="true"/);
    assert.match(group, /aria-describedby="[^"]+-hint [^"]+-error"/);
    assert.match(group, /disabled=""/);
    const disclosure = renderToStaticMarkup(
      h(UI.Disclosure, { summary: "History", open: true }, "Revision 1"),
    );
    assert.match(disclosure, /<details[^>]*open=""/);
    assert.match(disclosure, /<summary>History<\/summary>Revision 1/);
  });
}
for (const [family, UI] of [
  ["martlet", Martlet],
  ["krigsvold", Krigsvold],
]) {
  test(`${family} error summaries name failures and link to explicit field IDs`, () => {
    const html = renderToStaticMarkup(
      h(
        UI.ErrorSummary,
        {
          title: "Check this specification",
          errors: [
            { message: "Enter a summary.", targetId: "spec-summary" },
            { message: "The server is unavailable." },
          ],
        },
        h(UI.Button, null, "Retry"),
      ),
    );
    assert.match(html, /role="alert"/);
    assert.match(html, /tabindex="-1"/);
    assert.match(html, /aria-labelledby="[^"]+"/);
    assert.match(html, /href="#spec-summary"/);
    assert.match(html, /The server is unavailable\./);
    assert.match(html, />Retry<\/button>/);
    const field = renderToStaticMarkup(
      h(
        UI.Field,
        { id: "spec-summary", label: "Summary", error: "Enter a summary." },
        (props) => h(UI.TextInput, props),
      ),
    );
    assert.match(field, /for="spec-summary"/);
    assert.match(field, /id="spec-summary"/);
    assert.match(field, /aria-describedby="spec-summary-error"/);
  });
}
for (const [family, UI] of [
  ["martlet", Martlet],
  ["krigsvold", Krigsvold],
]) {
  test(`${family} article keeps its accessible title, metadata, content, context, footer, and native attributes`, () => {
    const markup = renderToStaticMarkup(
      h(
        UI.Article,
        {
          title: "A working contract",
          titleLevel: 2,
          id: "contract",
          "data-consumer": "article",
          summary: "Read the saved specification.",
          metadata: h("time", { dateTime: "2026-10-21" }, "October 21"),
          contents: h(UI.TableOfContents, {
            items: [{ id: "purpose", label: "Purpose" }],
          }),
          aside: h("p", null, "Context remains available."),
          footer: "Experimental source under MIT.",
        },
        h(
          "section",
          null,
          h("h3", { id: "purpose", tabIndex: -1 }, "Purpose"),
          h("p", null, "The actual contract."),
        ),
      ),
    );
    const titleId = markup.match(/<article[^>]*aria-labelledby="([^"]+)"/)[1];
    assert.ok(markup.includes(`<h2 id="${titleId}">A working contract</h2>`));
    assert.match(markup, /id="contract"/);
    assert.match(markup, /data-consumer="article"/);
    assert.match(markup, /<time dateTime="2026-10-21">October 21<\/time>/);
    assert.match(markup, /<aside[^>]*aria-label="Article context"/);
    assert.match(markup, /The actual contract\./);
    assert.match(markup, /Experimental source under MIT\./);
    const standalone = renderToStaticMarkup(
      h(UI.Article, { title: "Standalone" }, "Body"),
    );
    assert.match(standalone, /<h1[^>]*>Standalone<\/h1>/);
    assert.doesNotMatch(standalone, /<aside/);
  });
  test(`${family} table of contents uses named native navigation and encoded fragment targets`, () => {
    const markup = renderToStaticMarkup(
      h(UI.TableOfContents, {
        label: "Specification sections",
        "data-consumer": "contents",
        items: [
          { id: "purpose", label: "Purpose" },
          { id: "a section", label: "A section" },
        ],
      }),
    );
    assert.match(markup, /<nav[^>]*aria-label="Specification sections"/);
    assert.match(markup, /data-consumer="contents"/);
    assert.match(markup, /<ol>/);
    assert.match(markup, /href="#purpose"/);
    assert.match(markup, /href="#a%20section"/);
    assert.doesNotMatch(markup, /role="(menu|tablist)"/);
  });
}
for (const [family, UI] of [
  ["martlet", Martlet],
  ["krigsvold", Krigsvold],
]) {
  test(`${family} file input retains native chooser, hint, invalid, disabled, and multiple contracts`, () => {
    const markup = renderToStaticMarkup(
      h(
        UI.Field,
        {
          id: "registry-file",
          label: "Registry export",
          hint: "JSON only",
          error: "Choose a valid file.",
        },
        (props) =>
          h(UI.FileInput, {
            ...props,
            accept: ".json,application/json",
            name: "registry-file",
            multiple: true,
            disabled: true,
          }),
      ),
    );
    assert.match(markup, /type="file"/);
    assert.match(markup, /accept=".json,application\/json"/);
    assert.match(markup, /name="registry-file"/);
    assert.match(markup, /multiple=""/);
    assert.match(markup, /disabled=""/);
    assert.match(markup, /aria-invalid="true"/);
    assert.match(
      markup,
      /aria-describedby="registry-file-hint registry-file-error"/,
    );
    assert.doesNotMatch(markup, /value="/);
  });
}

for (const family of ["martlet", "krigsvold"])
  test(`${family} radio options retain labels, group names, native state and fieldset descriptions`, async () => {
    const UI = await import(`../packages/${family}-react/dist/index.js`);
    const html = renderToStaticMarkup(
      h(
        UI.Fieldset,
        { legend: "Outcome", hint: "Choose one result", disabled: true },
        h(UI.Radio, {
          id: "passed",
          label: "Passed",
          name: "outcome",
          value: "passed",
          checked: true,
          readOnly: true,
          "aria-describedby": "observation",
        }),
        h(UI.Radio, {
          id: "needs-work",
          label: "Needs work",
          name: "outcome",
          value: "needs-work",
          checked: false,
          readOnly: true,
        }),
      ),
    );
    assert.match(html, /<legend>Outcome<\/legend>/);
    assert.match(html, /for="passed"/);
    assert.match(html, /type="radio"/);
    assert.match(html, /name="outcome"/);
    assert.match(html, /aria-describedby="observation"/);
    assert.match(html, /disabled=""/);
    assert.match(html, /checked=""/);
  });
