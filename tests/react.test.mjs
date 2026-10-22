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
