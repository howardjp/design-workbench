import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultPreferences,
  preferencesKey,
  readPreferences,
  writePreferences,
} from "../src/preferences.mjs";
test("workspace preferences round-trip only supported values; corrupt/future data uses visible safe defaults", () => {
  let stored = null;
  const db = {
    getItem: () => stored,
    setItem: (key, value) => {
      assert.equal(key, preferencesKey);
      stored = value;
    },
  };
  assert.deepEqual(readPreferences(db).value, defaultPreferences);
  writePreferences(db, {
    ...defaultPreferences,
    defaultView: "queue",
    pageSize: 25,
    protectDrafts: false,
    extra: "ignored",
  });
  assert.deepEqual(readPreferences(db), {
    value: {
      ...defaultPreferences,
      defaultView: "queue",
      pageSize: 25,
      protectDrafts: false,
    },
    issue: "",
  });
  for (const text of [
    "{",
    '{"schemaVersion":2}',
    JSON.stringify({ ...defaultPreferences, pageSize: 9000 }),
    JSON.stringify({ ...defaultPreferences, protectDrafts: "yes" }),
  ]) {
    stored = text;
    assert.deepEqual(readPreferences(db).value, defaultPreferences);
    assert.ok(readPreferences(db).issue);
  }
  assert.throws(
    () =>
      writePreferences(
        {
          setItem() {
            throw new Error("denied");
          },
        },
        defaultPreferences,
      ),
    /denied/,
  );
});
