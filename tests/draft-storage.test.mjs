import { test } from "node:test";
import assert from "node:assert/strict";
import {
  draftPrefix,
  parseDraft,
  readDrafts,
  writeDraft,
  removeDraft,
} from "../src/draft-storage.mjs";
import { newDraft } from "../src/contract.mjs";
const entry = (id = "draft-one") => ({
  schemaVersion: 1,
  id,
  savedAt: "2026-10-22T12:00:00Z",
  recordId: "button",
  baseRevision: 1,
  baseDraft: newDraft(),
  draft: { ...newDraft(), summary: "unfinished" },
  uncertain: false,
});
function storage() {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    key: (n) => [...map.keys()][n],
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  };
}
test("draft storage retains incomplete fields and distinct editing sessions without copying extra metadata", () => {
  const db = storage();
  writeDraft(db, {
    ...entry(),
    draft: {
      ...entry().draft,
      implementations: ["injected"],
      review: "injected",
    },
  });
  writeDraft(db, {
    ...entry("draft-two"),
    recordId: null,
    baseDraft: null,
    baseRevision: null,
    uncertain: true,
  });
  const result = readDrafts(db);
  assert.equal(result.drafts.length, 2);
  assert.equal(result.drafts[0].draft.summary, "unfinished");
  assert.equal(result.drafts[0].draft.implementations, undefined);
  assert.equal(result.drafts[0].draft.review, undefined);
  removeDraft(db, "draft-one");
  assert.equal(readDrafts(db).drafts[0].id, "draft-two");
});
test("malformed, oversized, wrong-key and future-schema drafts are isolated, never restored", () => {
  const db = storage();
  db.setItem(draftPrefix + "bad", "{");
  db.setItem("unrelated", "keep");
  writeDraft(db, entry());
  assert.equal(readDrafts(db).drafts.length, 1);
  assert.deepEqual(readDrafts(db).invalidKeys, [draftPrefix + "bad"]);
  for (const change of [
    { schemaVersion: 2 },
    { baseRevision: -1 },
    { draft: {} },
    { recordId: "../escape" },
    { uncertain: "false" },
    { savedAt: "bad" },
    { draft: { ...newDraft(), summary: "x".repeat(65536) } },
  ]) {
    assert.throws(() =>
      parseDraft(
        JSON.stringify({ ...entry(), ...change }),
        draftPrefix + "draft-one",
      ),
    );
  }
  assert.throws(() =>
    parseDraft(JSON.stringify(entry()), draftPrefix + "wrong"),
  );
  assert.equal(db.getItem("unrelated"), "keep");
});
test("storage failures propagate so the interface cannot claim a draft was protected", () => {
  const denied = {
    setItem() {
      throw new Error("quota");
    },
    removeItem() {
      throw new Error("denied");
    },
  };
  assert.throws(() => writeDraft(denied, entry()), /quota/);
  assert.throws(() => removeDraft(denied, "draft-one"), /denied/);
});
