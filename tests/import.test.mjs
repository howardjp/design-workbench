import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import { IMPORT_MAX_BYTES } from "../server/import.mjs";
import { toDraft } from "../src/contract.mjs";
const label = "reviewed-registry.json";
const exportText = (components) =>
  JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    components,
  });
function registry(t) {
  const store = openRegistry(":memory:");
  t.after(() => store.close());
  return store;
}
function changedSource(store) {
  const button = store.get("button");
  return exportText([
    {
      ...button,
      summary:
        "A reviewed specification imported from a real registry export document.",
      maturity: "stable",
      evidence:
        "The file claims a human review; importing cannot certify that claim.",
      implementations: [
        {
          family: "martlet",
          platform: "Native",
          package: "@martlet/fake",
          version: "99.0.0",
          state: "published",
        },
      ],
    },
    {
      ...button,
      id: "imported-control",
      name: "Imported control",
      revision: 8,
      maturity: "stable",
      evidence:
        "An imported evidence claim, retained as text without a promotion.",
    },
  ]);
}
test("an unchanged schema 1 export round trip is read-only and appends no history", (t) => {
  const store = registry(t);
  const source = exportText(store.list());
  const before = store.list();
  const history = store.history("button");
  const preview = store.previewImport(source, label);
  assert.equal(preview.changes.length, 0);
  assert.equal(preview.unchanged, before.length);
  assert.equal(store.applyImport(source, label, preview.token).applied, 0);
  assert.deepEqual(store.list(), before);
  assert.deepEqual(store.history("button"), history);
});
test("import appends revisions, preserves availability/lifecycle, and records provenance across restart", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "registry-import-"));
  const path = join(dir, "registry.sqlite");
  let store = openRegistry(path);
  t.after(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const before = store.get("button");
  const history = store.history("button");
  const source = changedSource(store);
  const preview = store.previewImport(source, label);
  assert.equal(preview.changes.length, 2);
  assert.equal(preview.conflicts.length, 0);
  assert.equal(preview.retainedMaturity.length, 2);
  const result = store.applyImport(source, label, preview.token);
  assert.equal(result.applied, 2);
  const saved = store.get("button");
  assert.equal(saved.revision, 2);
  assert.equal(saved.maturity, before.maturity);
  assert.deepEqual(saved.implementations, before.implementations);
  assert.equal(saved.change, undefined);
  const added = store.get("imported-control");
  assert.equal(added.revision, 1);
  assert.equal(added.maturity, "proposed");
  assert.deepEqual(added.implementations, []);
  const change = store.history("button")[0].snapshot.change;
  assert.deepEqual(change, {
    kind: "json-import",
    fileName: label,
    documentHash: preview.documentHash,
    exportedAt: preview.exportedAt,
  });
  assert.deepEqual(store.history("button").slice(1), history);
  store.close();
  store = openRegistry(path);
  assert.deepEqual(store.get("button"), saved);
  assert.deepEqual(store.history("button")[0].snapshot.change, change);
  const manual = store.save("button", toDraft(saved), saved.revision);
  assert.equal(store.history("button")[0].snapshot.change, undefined);
  assert.equal(manual.revision, 3);
  assert.deepEqual(store.history("button")[1].snapshot.change, change);
});
test("repeat import after success is a no-op while replaying the old token is rejected", (t) => {
  const store = registry(t);
  const source = changedSource(store);
  const preview = store.previewImport(source, label);
  const result = store.applyImport(source, label, preview.token);
  assert.throws(
    () => store.applyImport(source, label, preview.token),
    (error) => error.status === 409,
  );
  assert.equal(result.preview.changes.length, 0);
  const records = store.list();
  const history = store.history("button");
  assert.equal(
    store.applyImport(source, label, result.preview.token).applied,
    0,
  );
  assert.deepEqual(store.list(), records);
  assert.deepEqual(store.history("button"), history);
});
test("document validation rejects malformed/schema/identity/field/size violations without writes", (t) => {
  const store = registry(t);
  const before = store.list();
  const button = store.get("button");
  const sources = [
    "{",
    JSON.stringify({
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      components: [],
    }),
    exportText([button, button]),
    exportText([{ ...button, id: "../escape" }]),
    exportText([{ ...button, revision: 0 }]),
    exportText([{ ...button, summary: "Short" }]),
    exportText([{ ...button, updatedAt: "not a date" }]),
    exportText([{ ...button, targets: ["Unknown"] }]),
    exportText(
      Array.from({ length: 501 }, (_, i) => ({
        ...button,
        id: `entry-${i}`,
        name: `Entry ${i}`,
      })),
    ),
    " ".repeat(IMPORT_MAX_BYTES + 1),
  ];
  for (const source of sources)
    assert.throws(
      () => store.previewImport(source, label),
      (error) => error.status === 422,
    );
  assert.throws(
    () => store.previewImport(exportText([]), "../file.json"),
    (error) => error.status === 422,
  );
  assert.throws(
    () => store.applyImport(exportText([]), label, "missing"),
    (error) => error.status === 400,
  );
  assert.deepEqual(store.list(), before);
  assert.equal(store.history("button").length, 1);
});
test("source revision conflicts and final name conflicts block the entire batch", (t) => {
  const store = registry(t);
  const source = changedSource(store);
  const button = store.get("button");
  store.save(
    button.id,
    {
      ...toDraft(button),
      summary:
        "A newer specification is saved after the source export was made.",
    },
    button.revision,
  );
  let preview = store.previewImport(source, label);
  assert.ok(
    preview.conflicts.some((item) =>
      item.message.includes("file has revision 1"),
    ),
  );
  const before = store.list();
  assert.throws(
    () => store.applyImport(source, label, preview.token),
    (error) => error.status === 409,
  );
  assert.deepEqual(store.list(), before);
  const collision = exportText([
    { ...store.get("button"), id: "another-button", name: "Button" },
  ]);
  preview = store.previewImport(collision, label);
  assert.ok(
    preview.conflicts.some((item) => item.message.includes("final name")),
  );
  assert.throws(
    () => store.applyImport(collision, label, preview.token),
    (error) => error.status === 409,
  );
  assert.deepEqual(store.list(), before);
});
test("a current batch may swap names but cannot remove evidence required by a retained lifecycle", (t) => {
  const store = registry(t);
  let button = store.get("button");
  const field = store.get("field");
  const swapped = exportText([
    { ...button, name: field.name },
    { ...field, name: button.name },
  ]);
  const preview = store.previewImport(swapped, label);
  assert.equal(preview.conflicts.length, 0);
  assert.equal(store.applyImport(swapped, label, preview.token).applied, 2);
  button = store.get("button");
  button = store.save(
    button.id,
    {
      ...toDraft(button),
      maturity: "stable",
      evidence:
        "Human-reviewed evidence required to retain this lifecycle stage.",
    },
    button.revision,
  );
  const noEvidence = exportText([
    { ...button, maturity: "experimental", evidence: "" },
  ]);
  const blocked = store.previewImport(noEvidence, label);
  assert.ok(
    blocked.conflicts.some((item) =>
      item.message.includes("supporting fields"),
    ),
  );
  assert.throws(
    () => store.applyImport(noEvidence, label, blocked.token),
    (error) => error.status === 409,
  );
  assert.equal(store.get("button").evidence, button.evidence);
});
test("preview tokens bind the full registry, submitted text, and file label", (t) => {
  const store = registry(t);
  const source = changedSource(store);
  const preview = store.previewImport(source, label);
  const before = store.list();
  assert.throws(
    () => store.applyImport(source + "\n", label, preview.token),
    (error) => error.status === 409,
  );
  assert.throws(
    () => store.applyImport(source, "renamed.json", preview.token),
    (error) => error.status === 409,
  );
  assert.deepEqual(store.list(), before);
  const unrelated = store.get("field");
  store.save(
    unrelated.id,
    {
      ...toDraft(unrelated),
      summary:
        "An unrelated concurrent edit also invalidates the reviewed import token.",
    },
    unrelated.revision,
  );
  assert.throws(
    () => store.applyImport(source, label, preview.token),
    (error) => error.status === 409,
  );
  assert.throws(
    () => store.get("imported-control"),
    (error) => error.status === 404,
  );
});
test("a mid-batch storage failure rolls back records, provenance, and history", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "import-rollback-"));
  const path = join(dir, "registry.sqlite");
  const store = openRegistry(path);
  t.after(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const db = new DatabaseSync(path);
  db.exec(
    "CREATE TRIGGER fail_import BEFORE INSERT ON components WHEN NEW.id='imported-control' BEGIN SELECT RAISE(ABORT, 'Simulated import failure'); END;",
  );
  db.close();
  const before = store.list();
  const history = store.history("button");
  const source = changedSource(store);
  const preview = store.previewImport(source, label);
  assert.throws(
    () => store.applyImport(source, label, preview.token),
    /Simulated import failure/,
  );
  assert.deepEqual(store.list(), before);
  assert.deepEqual(store.history("button"), history);
  assert.equal(store.previewImport(source, label).token, preview.token);
});
test("import HTTP endpoints preserve body/origin boundaries and support an actual exported snapshot", async (t) => {
  const store = registry(t);
  const server = createWorkbenchServer({ store, dist: tmpdir() });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  t.after(() => new Promise((done) => server.close(done)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const source = await (await fetch(base + "/api/export")).text();
  const post = (path, data, headers = {}) =>
    fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
  const preview = await (
    await post("/api/import/preview", { source, fileName: label })
  ).json();
  assert.equal(preview.changes.length, 0);
  assert.equal(
    (
      await post("/api/import/apply", {
        source,
        fileName: label,
        token: preview.token,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await post(
        "/api/import/preview",
        { source, fileName: label },
        { Origin: "https://example.com" },
      )
    ).status,
    403,
  );
  assert.equal(
    (await post("/api/import/preview", { source: "{", fileName: label }))
      .status,
    422,
  );
  assert.equal(
    (
      await post("/api/import/preview", {
        source: " ".repeat(2 * IMPORT_MAX_BYTES + 4096),
        fileName: label,
      })
    ).status,
    413,
  );
  assert.equal((await post("/api/import/preview", null)).status, 400);
  assert.equal((await post("/api/import/apply", null)).status, 400);
  assert.equal(
    (
      await post(
        "/api/import/preview",
        { source, fileName: label },
        { "Content-Type": "text/plain" },
      )
    ).status,
    415,
  );
  // More than 64 KiB is valid for an import, while record writes retain their old limit.
  const padded = source + " ".repeat(70000);
  assert.equal(
    (await post("/api/import/preview", { source: padded, fileName: label }))
      .status,
    200,
  );
});
