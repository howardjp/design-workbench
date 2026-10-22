import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import { inventorySnapshot, previewInventory } from "../server/inventory.mjs";
import { toDraft } from "../src/contract.mjs";
const entries = JSON.parse(
  readFileSync(new URL("../server/seed.json", import.meta.url), "utf8"),
);
import { createOlderRegistry, missing } from "./helpers/older-registry.mjs";
function olderRegistry(t, options) {
  const fixture = createOlderRegistry(options);
  t.after(fixture.close);
  return fixture;
}

test("bundled inventory validates contracts, duplicate identity and availability before use", () => {
  const snapshot = inventorySnapshot(entries);
  assert.match(snapshot.version, /^[a-f0-9]{64}$/);
  assert.equal(
    snapshot.version,
    inventorySnapshot([...entries].reverse()).version,
  );
  for (const value of [
    null,
    {},
    [...entries, entries[0]],
    [{ ...entries[0], id: "../escape" }],
    [{ ...entries[0], evidence: "Invented adoption" }],
    [
      {
        ...entries[0],
        implementations: [
          {
            family: "martlet",
            platform: "React",
            package: "@martlet/react",
            version: "0.1.0",
            state: "production",
          },
        ],
      },
    ],
  ])
    assert.throws(() => inventorySnapshot(value));
  const changed = structuredClone(entries);
  changed[0].implementations[0].version = "0.1.1";
  assert.notEqual(snapshot.version, inventorySnapshot(changed).version);
});
test("preview is read-only and updates an older registry without replacing edited contracts", (t) => {
  const { store, path, previous, custom } = olderRegistry(t);
  const before = store.list();
  const history = store.history("button");
  const preview = store.previewInventory();
  assert.deepEqual(store.list(), before);
  assert.deepEqual(store.history("button"), history);
  assert.equal(preview.changes.filter((item) => item.kind === "add").length, 4);
  assert.equal(
    preview.changes.filter((item) => item.kind === "implementations").length,
    1,
  );
  assert.equal(preview.conflicts.length, 0);
  assert.equal(preview.retained.length, 1);
  assert.equal(
    preview.retained[0].implementations[0].package,
    "@martlet/local",
  );
  const result = store.applyInventory(preview.token);
  assert.equal(result.applied, 5);
  const updated = store.get("button");
  assert.deepEqual(toDraft(updated), toDraft(previous));
  assert.equal(updated.revision, previous.revision + 1);
  assert.equal(
    updated.implementations.find((item) => item.platform === "Vue").package,
    "@martlet/local",
  );
  assert.ok(
    updated.implementations
      .filter((item) => item.platform === "React")
      .every((item) => item.version === "0.1.0"),
  );
  assert.deepEqual(store.get(custom.id), custom);
  assert.deepEqual(store.history("button").slice(1), history);
  for (const id of missing) {
    assert.equal(store.get(id).revision, 1);
    assert.equal(store.get(id).maturity, "experimental");
    assert.equal(store.get(id).evidence, "");
    assert.equal(store.history(id).length, 1);
  }
  assert.equal(result.preview.changes.length, 0);
  const reopened = openRegistry(path);
  try {
    assert.deepEqual(reopened.list(), result.components);
    assert.equal(reopened.history("button").length, 3);
  } finally {
    reopened.close();
  }
  assert.throws(
    () => store.applyInventory(preview.token),
    (error) => error.status === 409,
  );
  const noOp = store.applyInventory(result.preview.token);
  assert.equal(noOp.applied, 0);
  assert.deepEqual(noOp.components, result.components);
});
test("any concurrent save invalidates preview and prevents partial updates", (t) => {
  const { store, custom } = olderRegistry(t);
  const preview = store.previewInventory();
  store.save(
    custom.id,
    {
      ...toDraft(custom),
      summary:
        "A concurrent editor saved this unrelated component after preview.",
    },
    custom.revision,
  );
  const before = store.list();
  assert.throws(
    () => store.applyInventory(preview.token),
    (error) => error.status === 409,
  );
  assert.deepEqual(store.list(), before);
  assert.equal(store.history("button").length, 2);
  assert.throws(
    () => store.get("checkbox"),
    (error) => error.status === 404,
  );
  assert.equal(store.applyInventory(store.previewInventory().token).applied, 5);
});
test("name conflicts block the entire update until explicitly resolved", (t) => {
  const { store, custom } = olderRegistry(t, { collision: true });
  const preview = store.previewInventory();
  assert.equal(preview.conflicts.length, 1);
  assert.equal(preview.conflicts[0].name, "Checkbox");
  const before = store.list();
  assert.throws(
    () => store.applyInventory(preview.token),
    (error) => error.status === 409,
  );
  assert.deepEqual(store.list(), before);
  const saved = store.get(custom.id);
  store.save(
    saved.id,
    { ...toDraft(saved), name: "My checkbox contract" },
    saved.revision,
  );
  assert.equal(store.previewInventory().conflicts.length, 0);
  assert.equal(store.applyInventory(store.previewInventory().token).applied, 5);
});
test("database failure rolls back additions, implementation changes, and history together", (t) => {
  const { store, path } = olderRegistry(t);
  const db = new DatabaseSync(path);
  // Force a failure after earlier rows in the update have already been written.
  db.exec(
    "CREATE TRIGGER fail_inventory BEFORE INSERT ON components WHEN NEW.id='fieldset' BEGIN SELECT RAISE(ABORT, 'Simulated storage failure'); END;",
  );
  db.close();
  const before = store.list();
  const history = store.history("button");
  const preview = store.previewInventory();
  assert.throws(
    () => store.applyInventory(preview.token),
    /Simulated storage failure/,
  );
  assert.deepEqual(store.list(), before);
  assert.deepEqual(store.history("button"), history);
  assert.equal(store.previewInventory().token, preview.token);
});
test("preview version and token change when bundled source changes", () => {
  const current = entries.map((entry) => ({
    ...entry,
    revision: 1,
    updatedAt: "2026-10-21T22:00:00Z",
  }));
  const first = previewInventory(current, inventorySnapshot(entries));
  const changed = structuredClone(entries);
  changed[0].summary += " Updated contract.";
  const next = previewInventory(current, inventorySnapshot(changed));
  assert.notEqual(first.inventoryVersion, next.inventoryVersion);
  assert.notEqual(first.token, next.token);
  assert.equal(
    next.changes.length,
    0,
    "bundled specification edits do not overwrite saved specifications",
  );
});
test("inventory HTTP endpoints require a current token and retain request boundaries", async (t) => {
  const { store } = olderRegistry(t);
  const server = createWorkbenchServer({ store, dist: tmpdir() });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const preview = await (await fetch(base + "/api/inventory/preview")).json();
  const apply = (data, headers = {}) =>
    fetch(base + "/api/inventory/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    });
  assert.equal((await apply({})).status, 400);
  assert.equal((await apply({ token: "0".repeat(64) })).status, 409);
  assert.equal(
    (await apply({ token: preview.token }, { Origin: "https://example.com" }))
      .status,
    403,
  );
  const response = await apply({
    token: preview.token,
    changes: [{ id: "fake", kind: "add" }],
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).applied, 5);
  assert.throws(
    () => store.get("fake"),
    (error) => error.status === 404,
  );
  assert.equal((await apply({ token: preview.token })).status, 409);
});
