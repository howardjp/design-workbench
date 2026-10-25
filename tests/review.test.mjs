import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import { reviewBasis } from "../server/review.mjs";
import { blankReview } from "../src/review.mjs";
import { toDraft } from "../src/contract.mjs";
import { createOlderRegistry } from "./helpers/older-registry.mjs";
const passed = () =>
  blankReview().map((item) => ({
    ...item,
    outcome: "passed",
    notes: `Fixture observation for ${item.id}: this is a test assertion, not evidence of real production use.`,
  }));
function registry(t) {
  const store = openRegistry(":memory:");
  t.after(() => store.close());
  return store;
}
function location(t) {
  const dir = mkdtempSync(join(tmpdir(), "review-registry-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return join(dir, "registry.sqlite");
}
test("structured review saves a current basis and history without changing maturity or implementation claims", (t) => {
  const store = registry(t),
    before = store.get("button");
  assert.equal(store.getReview("button").current, false);
  const result = store.saveReview("button", passed(), before.revision, true);
  assert.equal(result.current, true);
  assert.equal(result.record.revision, 2);
  assert.equal(result.record.review.basedOnRevision, 1);
  assert.equal(result.summary.passed, 6);
  assert.deepEqual(toDraft(result.record), toDraft(before));
  assert.deepEqual(result.record.implementations, before.implementations);
  assert.equal(
    store.history("button")[0].snapshot.change.kind,
    "readiness-review",
  );
  assert.equal(
    store.saveReview("button", passed(), 2, true).record.revision,
    2,
  );
  assert.equal(store.history("button").length, 2);
});
test("review validation, confirmation, identity and stale revisions fail without writes", (t) => {
  const store = registry(t),
    before = store.list();
  for (const checks of [
    null,
    [],
    [...passed(), passed()[0]],
    passed().map((item, i) => (i === 0 ? { ...item, id: "unknown" } : item)),
    passed().map((item, i) =>
      i === 0 ? { ...item, outcome: "certified" } : item,
    ),
    passed().map((item, i) => (i === 0 ? { ...item, notes: "tiny" } : item)),
    passed().map((item, i) =>
      i === 0 ? { ...item, notes: "x".repeat(2001) } : item,
    ),
  ])
    assert.throws(
      () => store.saveReview("button", checks, 1, true),
      (error) => error.status === 422,
    );
  assert.throws(
    () => store.saveReview("button", passed(), 1, false),
    (error) => error.status === 422 && !!error.fields.confirmation,
  );
  assert.throws(
    () => store.saveReview("button", passed(), 0, true),
    (error) => error.status === 400,
  );
  assert.throws(
    () => store.saveReview("missing-component", passed(), 1, true),
    (error) => error.status === 404,
  );
  assert.throws(
    () => store.saveReview("button", passed(), 2, true),
    (error) => error.status === 409,
  );
  assert.deepEqual(store.list(), before);
  assert.equal(store.history("button").length, 1);
});
test("changed specifications retain old observations, require a new basis, and reject stale review saves", (t) => {
  const store = registry(t);
  const review = store.saveReview("button", passed(), 1, true);
  const before = review.record;
  const changed = store.save(
    before.id,
    {
      ...toDraft(before),
      summary:
        "A changed contract must not inherit current review status from earlier observations.",
    },
    before.revision,
  );
  assert.deepEqual(changed.review, before.review);
  assert.equal(store.getReview("button").current, false);
  assert.throws(
    () => store.saveReview("button", passed(), before.revision, true),
    (error) => error.status === 409,
  );
  const renewed = store.saveReview(
    "button",
    blankReview(),
    changed.revision,
    true,
  );
  assert.equal(renewed.current, true);
  assert.equal(renewed.summary.unreviewed, 6);
  assert.equal(renewed.record.maturity, before.maturity);
  assert.throws(
    () => store.saveReview("button", blankReview(), changed.revision, true),
    (error) => error.status === 409,
  );
});
test("basis comparison ignores ordering and revision metadata while tracking every editable field and availability", (t) => {
  const store = registry(t),
    before = store.get("button"),
    basis = reviewBasis(before);
  assert.equal(
    reviewBasis({
      ...before,
      revision: 99,
      updatedAt: "2100-01-01T00:00:00Z",
      targets: [...before.targets].reverse(),
      implementations: [...before.implementations].reverse(),
    }),
    basis,
  );
  assert.notEqual(reviewBasis({ ...before, id: "different-component" }), basis);
  for (const key of Object.keys(toDraft(before)).filter(
    (key) => key !== "targets",
  ))
    assert.notEqual(
      reviewBasis({ ...before, [key]: before[key] + " changed" }),
      basis,
      key,
    );
  assert.notEqual(reviewBasis({ ...before, targets: ["Native"] }), basis);
  assert.notEqual(
    reviewBasis({
      ...before,
      implementations: before.implementations.map((item, i) =>
        i === 0 ? { ...item, version: "99.0.0" } : item,
      ),
    }),
    basis,
  );
});
test("inventory and JSON import retain local observations but cannot import review claims", (t) => {
  const old = createOlderRegistry();
  t.after(() => old.close());
  const reviewed = old.store.saveReview(
    "button",
    passed(),
    old.store.get("button").revision,
    true,
  ).record;
  const preview = old.store.previewInventory();
  old.store.applyInventory(preview.token);
  assert.deepEqual(old.store.get("button").review, reviewed.review);
  assert.equal(old.store.getReview("button").current, false);
  const store = registry(t),
    review = store.saveReview("button", passed(), 1, true).record;
  const source = JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    components: [
      {
        ...review,
        summary:
          "A reviewed import changes specification text but retains the local observations.",
      },
      { ...review, id: "new-imported-review", name: "New imported review" },
    ],
  });
  const p = store.previewImport(source, "review.json");
  store.applyImport(source, "review.json", p.token);
  assert.deepEqual(store.get("button").review, review.review);
  assert.equal(store.getReview("button").current, false);
  assert.equal(store.get("new-imported-review").review, undefined);
});
test("schema 1 migration retains records and history, supports reopen, and refuses future schemas", (t) => {
  const path = location(t),
    scratch = registry(t),
    record = { ...scratch.get("button"), name: "A legacy edited Button" };
  let db = new DatabaseSync(path);
  db.exec(
    "CREATE TABLE components (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, document TEXT NOT NULL); CREATE TABLE history (id TEXT NOT NULL, revision INTEGER NOT NULL, at TEXT NOT NULL, snapshot TEXT NOT NULL, PRIMARY KEY(id,revision)); PRAGMA user_version=1;",
  );
  db.prepare("INSERT INTO components VALUES (?,?,?)").run(
    record.id,
    record.revision,
    JSON.stringify(record),
  );
  db.prepare("INSERT INTO history VALUES (?,?,?,?)").run(
    record.id,
    record.revision,
    record.updatedAt,
    JSON.stringify(record),
  );
  db.close();
  copyFileSync(path, path + ".backup");
  let store = openRegistry(path);
  assert.equal(store.list().length, 1);
  assert.deepEqual(store.get("button"), record);
  assert.deepEqual(store.history("button")[0].snapshot, record);
  const saved = store.saveReview("button", passed(), 1, true).record;
  store.close();
  store = openRegistry(path);
  assert.deepEqual(store.get("button"), saved);
  assert.equal(store.getReview("button").current, true);
  assert.equal(store.history("button").length, 2);
  store.close();
  db = new DatabaseSync(path);
  assert.equal(db.prepare("PRAGMA user_version").get().user_version, 2);
  db.exec("PRAGMA user_version=3");
  db.close();
  assert.throws(() => openRegistry(path), /newer/);
  const backup = new DatabaseSync(path + ".backup");
  assert.equal(backup.prepare("PRAGMA user_version").get().user_version, 1);
  backup.close();
});
test("review write and history roll back together on a storage failure", (t) => {
  const path = location(t),
    store = openRegistry(path);
  t.after(() => store.close());
  const before = store.get("button"),
    history = store.history("button");
  const db = new DatabaseSync(path);
  db.exec(
    "CREATE TRIGGER fail_review BEFORE INSERT ON history WHEN NEW.id='button' AND NEW.revision=2 BEGIN SELECT RAISE(ABORT,'injected review history failure'); END;",
  );
  db.close();
  assert.throws(
    () => store.saveReview("button", passed(), 1, true),
    /injected/,
  );
  assert.deepEqual(store.get("button"), before);
  assert.deepEqual(store.history("button"), history);
});
test("review HTTP API preserves origin/content limits, validation, revision conflict, and real read/write behavior", async (t) => {
  const store = registry(t),
    server = createWorkbenchServer({ store, dist: tmpdir() });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  t.after(
    () =>
      new Promise((done) => {
        server.close(done);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}/api/components/button/review`;
  const put = (body, headers = {}) =>
    fetch(base, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  assert.equal((await (await fetch(base)).json()).current, false);
  assert.equal(
    (
      await put(
        { checks: passed(), revision: 1, confirmed: true },
        { Origin: "https://example.com" },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await put(
        { checks: passed(), revision: 1, confirmed: true },
        { "Content-Type": "text/plain" },
      )
    ).status,
    415,
  );
  assert.equal(
    (await put({ checks: [], revision: 1, confirmed: true })).status,
    422,
  );
  assert.equal(
    (await put({ checks: passed(), revision: 0, confirmed: true })).status,
    400,
  );
  const saved = await (
    await put({ checks: passed(), revision: 1, confirmed: true })
  ).json();
  assert.equal(saved.current, true);
  assert.equal(saved.record.revision, 2);
  assert.equal(
    (await put({ checks: passed(), revision: 1, confirmed: true })).status,
    409,
  );
  assert.deepEqual(await (await fetch(base)).json(), saved);
});
