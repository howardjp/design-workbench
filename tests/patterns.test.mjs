import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  reducer as r,
  dirty,
  matches,
  createNoteId,
} from "../docs-app/src/patterns/model.ts";
const request = (s, move) => r(s, { type: "request", move });
test("new-note identities are unique without requiring secure-context browser APIs", () => {
  assert.equal(new Set(Array.from({ length: 100 }, createNoteId)).size, 100);
});
test("notebook preserves scoped query and selected record through reading, editing, save and return", () => {
  let s = request(initialState(), { type: "folder", folder: "Projects" });
  s = r(s, { type: "query", value: "recovery" });
  assert.equal(matches(s).length, 1);
  s = request(s, { type: "open", id: "n5" });
  s = r(s, { type: "edit" });
  s = r(s, {
    type: "change",
    key: "body",
    value: "Keep the recovery path and a draft.",
  });
  s = r(s, { type: "save" });
  assert.equal(s.phase, "saving");
  assert.equal(
    request(s, { type: "folder", folder: "Personal" }),
    s,
    "pending save locks context changes",
  );
  s = r(s, { type: "saved" });
  assert.equal(s.draft, null);
  assert.equal(s.selected, "n5");
  s = request(s, { type: "back" });
  assert.equal(s.folder, "Projects");
  assert.equal(s.query, "recovery");
  assert.equal(matches(s).length, 1);
});
test("invalid and failed saves retain the draft and retry commits exactly once", () => {
  let s = request(initialState(), { type: "new", id: "new-note" });
  s = r(s, { type: "save" });
  assert.equal(s.phase, "idle");
  assert.match(s.error, /title/);
  assert.equal(s.notes.length, 6);
  s = r(s, { type: "change", key: "title", value: "  Test note  " });
  s = r(s, { type: "save" });
  s = r(s, { type: "failed" });
  assert.equal(s.phase, "failed");
  assert.equal(s.draft.title, "  Test note  ");
  assert.equal(s.notes.length, 6);
  s = r(s, { type: "save" });
  s = r(s, { type: "saved" });
  s = r(s, { type: "saved" });
  assert.equal(s.notes.length, 7);
  assert.equal(s.notes[0].title, "Test note");
  assert.equal(dirty(s), false);
});
test("changed-draft navigation requires a decision, keep retains edits, discard applies the intended transition", () => {
  let s = request(initialState(), { type: "open", id: "n1" });
  s = r(s, { type: "edit" });
  s = r(s, { type: "change", key: "body", value: "Unsaved work" });
  s = request(s, { type: "folder", folder: "Personal" });
  assert.equal(s.folder, "All notes");
  assert.equal(s.draft.body, "Unsaved work");
  assert.ok(s.pending);
  s = r(s, { type: "keep" });
  assert.equal(s.pending, null);
  assert.equal(s.draft.body, "Unsaved work");
  s = request(s, { type: "folder", folder: "Personal" });
  s = r(s, { type: "discard" });
  assert.equal(s.folder, "Personal");
  assert.equal(s.draft, null);
  assert.notEqual(s.notes[0].body, "Unsaved work");
});
test("removal is reversible and no-match recovery does not alter saved notes", () => {
  let s = request(initialState(), { type: "open", id: "n1" });
  s = request(s, { type: "trash" });
  assert.equal(s.notes.length, 5);
  assert.equal(s.removed.id, "n1");
  s = r(s, { type: "query", value: "not a matching phrase" });
  assert.equal(matches(s).length, 0);
  assert.equal(s.notes.length, 5);
  s = r(s, { type: "undo" });
  assert.equal(s.notes.length, 6);
  assert.equal(s.selected, "n1");
  assert.equal(s.query, "");
  assert.equal(s.removed, null);
});
