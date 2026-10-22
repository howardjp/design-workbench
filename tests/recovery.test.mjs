import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { openRegistry } from "../server/store.mjs";
import { recoveryFields, resolveRecovery } from "../src/recovery.mjs";
import {
  cleanDraft,
  draftKeys,
  toDraft,
  validateDraft,
} from "../src/contract.mjs";
import { blankReview } from "../src/review.mjs";
function fixture(t) {
  const store = openRegistry(":memory:");
  t.after(() => store.close());
  return store.get("button");
}
const note =
  "Fixture observation for recovery verification; this is not production evidence.";
test("three-way recovery requires explicit choices for one-sided and overlapping differences without merging text", (t) => {
  const base = fixture(t),
    draft = {
      ...toDraft(base),
      summary:
        "Local text remains a distinct choice, never a silently merged paragraph.",
      targets: [...base.targets].reverse(),
    };
  const latest = {
    ...base,
    revision: 2,
    evidence: note,
    summary:
      "A separately saved paragraph also remains available as one complete value.",
  };
  const fields = recoveryFields(base, draft, latest);
  assert.deepEqual(
    fields.map((f) => f.key),
    ["summary", "evidence"],
  );
  assert.deepEqual(
    fields.map((f) => [f.localChanged, f.savedChanged]),
    [
      [true, true],
      [false, true],
    ],
  );
  assert.throws(
    () => resolveRecovery(base, draft, latest, { summary: "draft" }),
    /every differing field/,
  );
  const result = resolveRecovery(base, draft, latest, {
    summary: "draft",
    evidence: "saved",
  });
  assert.equal(result.summary, draft.summary);
  assert.equal(result.evidence, note);
  assert.equal(latest.summary.includes("separately"), true);
  assert.deepEqual(draft.targets, [...base.targets].reverse());
});
test("every editable field is eligible, unknown or unsupported choices fail, and array choices are copied", (t) => {
  const base = fixture(t),
    draft = {
      ...toDraft(base),
      name: "Different component",
      summary: note,
      category: "Data",
      maturity: "deprecated",
      targets: ["Vue"],
      acceptanceCriteria: note,
      evidence: note,
      martletNotes: note,
      krigsvoldNotes: note,
      migration: note,
    };
  const latest = { ...base, revision: 2 };
  assert.deepEqual(
    recoveryFields(base, draft, latest).map((f) => f.key),
    draftKeys,
  );
  const choices = Object.fromEntries(draftKeys.map((key) => [key, "draft"]));
  assert.throws(
    () =>
      resolveRecovery(base, draft, latest, { ...choices, summary: "merge" }),
    /every differing field/,
  );
  assert.throws(
    () =>
      resolveRecovery(base, draft, latest, {
        ...choices,
        implementations: "draft",
      }),
    /every differing field/,
  );
  const result = resolveRecovery(base, draft, latest, choices);
  assert.deepEqual(result, draft);
  result.targets.push("Svelte");
  assert.deepEqual(draft.targets, ["Vue"]);
});
test("identity, older and noninteger revision responses cannot become an editing base", (t) => {
  const base = fixture(t),
    draft = toDraft(base);
  for (const latest of [
    { ...base, id: "another-record" },
    { ...base, revision: 0 },
    { ...base, revision: 1.5 },
    { ...base, revision: Infinity },
  ])
    assert.throws(
      () => recoveryFields(base, draft, latest),
      /different identity or an older revision/,
    );
});
test("canonical matching resolves an uncertain save without a write; combined field choices still require ordinary validation", (t) => {
  const base = fixture(t),
    draft = {
      ...toDraft(base),
      summary: "  " + base.summary + "  ",
      targets: [...base.targets].reverse(),
    };
  const latest = { ...base, revision: 2 };
  assert.deepEqual(recoveryFields(base, draft, latest), []);
  assert.deepEqual(resolveRecovery(base, draft, latest, {}), toDraft(latest));
  const stableDraft = { ...toDraft(base), maturity: "stable", evidence: note };
  const mixed = resolveRecovery(base, stableDraft, latest, {
    maturity: "draft",
    evidence: "saved",
  });
  assert.ok(validateDraft(mixed).evidence);
  assert.equal(mixed.maturity, "stable");
});
test("recovery only prepares drafts; explicit revision-safe save preserves latest metadata and persists with append-only history", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "recovery-check-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "registry.sqlite");
  let store = openRegistry(path);
  try {
    const base = store.get("button"),
      draft = { ...toDraft(base), summary: note };
    const latest = store.saveReview(
      "button",
      blankReview(),
      base.revision,
      true,
    ).record;
    const before = store.list(),
      history = store.history("button");
    const resolved = resolveRecovery(base, draft, latest, { summary: "draft" });
    assert.deepEqual(Object.keys(resolved), draftKeys);
    assert.deepEqual(store.list(), before);
    assert.deepEqual(store.history("button"), history);
    store.save(
      "button",
      { ...toDraft(latest), evidence: note },
      latest.revision,
    );
    assert.throws(
      () => store.save("button", resolved, latest.revision),
      (error) => error.status === 409,
    );
    const newest = store.get("button");
    const chosen = resolveRecovery(latest, resolved, newest, {
      summary: "draft",
      evidence: "saved",
    });
    const saved = store.save("button", chosen, newest.revision);
    assert.deepEqual(saved.implementations, newest.implementations);
    assert.deepEqual(saved.review, newest.review);
    assert.equal(saved.maturity, base.maturity);
    assert.equal(saved.revision, 4);
    store.close();
    store = null;
    store = openRegistry(path);
    assert.equal(store.get("button").summary, cleanDraft(draft).summary);
    assert.equal(store.history("button").length, 4);
    assert.equal(store.getReview("button").current, false);
  } finally {
    store?.close();
  }
});
