import { test } from "node:test";
import { request as httpRequest } from "node:http";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import {
  toDraft,
  validateDraft,
  filterRecords,
  newDraft,
} from "../src/contract.mjs";

test("real inventory separates published implementations from experimental maturity", () => {
  const store = openRegistry(":memory:");
  try {
    const button = store.get("button");
    assert.equal(button.maturity, "experimental");
    assert.equal(button.evidence, "");
    assert.equal(
      button.implementations.filter((item) => item.state === "published")
        .length,
      2,
    );
    assert.equal(
      button.implementations.filter((item) => item.state === "workspace")
        .length,
      2,
    );
    assert.deepEqual(validateDraft(button), {});
  } finally {
    store.close();
  }
});
test("saved changes and history survive closing and reopening the database", () => {
  const dir = mkdtempSync(join(tmpdir(), "registry-"));
  const path = join(dir, "registry.sqlite");
  let store = openRegistry(path);
  try {
    const before = store.get("button");
    const saved = store.save(
      "button",
      {
        ...toDraft(before),
        summary:
          "A revised real component contract that survives a complete database restart.",
      },
      before.revision,
    );
    assert.equal(saved.revision, 2);
    store.close();
    store = openRegistry(path);
    assert.equal(store.get("button").summary, saved.summary);
    assert.deepEqual(
      store.history("button").map((item) => item.revision),
      [2, 1],
    );
    assert.equal(store.history("button")[1].snapshot.summary, before.summary);
  } finally {
    store.close();
    rmSync(dir, { recursive: true });
  }
});
test("optimistic revisions reject stale writes without mutating the record or history", () => {
  const store = openRegistry(":memory:");
  try {
    const before = store.get("button");
    store.save(
      "button",
      {
        ...toDraft(before),
        summary:
          "The first window saves its carefully edited component specification.",
      },
      before.revision,
    );
    assert.throws(
      () => store.save("button", toDraft(before), before.revision),
      (error) => error.status === 409,
    );
    assert.equal(store.get("button").revision, 2);
    assert.equal(store.history("button").length, 2);
  } finally {
    store.close();
  }
});
test("invalid drafts, unsupported targets, and undocumented promotions cannot be saved", () => {
  const store = openRegistry(":memory:");
  try {
    const before = store.get("button");
    for (const changes of [
      { name: "" },
      { targets: [] },
      { targets: ["MadeUp"] },
      { maturity: "stable", evidence: "" },
      { maturity: "deprecated", migration: "" },
      { summary: "x".repeat(601) },
    ])
      assert.throws(
        () => store.save("button", { ...toDraft(before), ...changes }, 1),
        (error) => error.status === 422,
      );
    assert.equal(store.get("button").revision, 1);
  } finally {
    store.close();
  }
});
test("creation validates unique names, stable promotion evidence, and immutable availability", () => {
  const store = openRegistry(":memory:");
  try {
    const draft = {
      ...newDraft(),
      name: "Combobox",
      summary: "Choose or search for one value in a large collection.",
      acceptanceCriteria:
        "Keyboard navigation, filtering, empty results, and selection are specified.",
    };
    const saved = store.save(null, {
      ...draft,
      implementations: [{ state: "published" }],
    });
    assert.equal(saved.id, "combobox");
    assert.deepEqual(saved.implementations, []);
    assert.throws(
      () => store.save(null, draft),
      (error) => error.status === 422,
    );
    const promoted = store.save(
      saved.id,
      {
        ...draft,
        maturity: "stable",
        evidence:
          "Human-reviewed evidence: consumer, keyboard review, and regression results recorded.",
      },
      1,
    );
    assert.equal(promoted.maturity, "stable");
    assert.throws(
      () => store.save(null, { ...draft, name: "COMBOBOX" }),
      (error) => error.status === 422,
    );
  } finally {
    store.close();
  }
});
test("search and intersection filters work against real records", () => {
  const store = openRegistry(":memory:");
  try {
    const records = store.list();
    assert.equal(
      filterRecords(records, "  textinput  ", "experimental", "React")[0].id,
      "text-input",
    );
    assert.equal(filterRecords(records, "textinput", "", "Astro").length, 0);
    assert.equal(filterRecords(records, "no-such-component").length, 0);
  } finally {
    store.close();
  }
});
test("HTTP API saves, exports, rejects malformed requests and cross-origin mutation", async (t) => {
  const store = openRegistry(":memory:");
  const server = createWorkbenchServer({
    store,
    dist: join(tmpdir(), "no-assets"),
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  });
  const records = await (await fetch(base + "/api/components")).json();
  assert.ok(records.length > 20);
  const before = records.find((item) => item.id === "button");
  const payload = JSON.stringify({
    record: {
      ...toDraft(before),
      summary: "This specification was saved through the actual HTTP API.",
    },
    revision: 1,
  });
  const save = await fetch(base + "/api/components/button", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
  assert.equal(save.status, 200);
  assert.equal((await save.json()).revision, 2);
  assert.equal(
    (
      await fetch(base + "/api/components/button", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await fetch(base + "/api/components/button", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://example.com",
        },
        body: payload,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/components/button", {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: payload,
      })
    ).status,
    415,
  );
  assert.equal(
    (
      await fetch(base + "/api/components/button", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "{",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await fetch(base + "/api/components/button", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record: { ...toDraft(before), summary: "x".repeat(66000) },
          revision: 2,
        }),
      })
    ).status,
    413,
  );
  const hostStatus = await new Promise((resolve, reject) => {
    const req = httpRequest(
      base + "/api/components",
      { headers: { Host: "malicious.example" } },
      (res) => {
        res.resume();
        resolve(res.statusCode);
      },
    );
    req.on("error", reject);
    req.end();
  });
  assert.equal(hostStatus, 403);
  const exported = await (await fetch(base + "/api/export")).json();
  assert.equal(exported.schemaVersion, 1);
  assert.equal(
    exported.components.find((item) => item.id === "button").revision,
    2,
  );
  assert.equal((await fetch(base + "/api/components/missing")).status, 404);
});

test("sorting preserves input, honors lifecycle order and deterministic ties", async () => {
  const { sortRecords } = await import("../src/contract.mjs");
  const records = [
    { id: "z", name: "Zeta", maturity: "proposed", updatedAt: "2026-10-20" },
    { id: "a", name: "Alpha", maturity: "stable", updatedAt: "2026-10-21" },
    {
      id: "b",
      name: "Beta",
      maturity: "experimental",
      updatedAt: "2026-10-21",
    },
  ];
  assert.deepEqual(
    sortRecords(records, "name", "asc").map((x) => x.id),
    ["a", "b", "z"],
  );
  assert.deepEqual(
    sortRecords(records, "maturity", "asc").map((x) => x.id),
    ["z", "b", "a"],
  );
  assert.deepEqual(
    sortRecords(records, "updatedAt", "desc").map((x) => x.id),
    ["a", "b", "z"],
  );
  assert.deepEqual(
    records.map((x) => x.id),
    ["z", "a", "b"],
  );
  assert.throws(() => sortRecords(records, "unknown", "asc"));
});
test("readiness derives availability separately from targets and evidence", async () => {
  const { summarizeRegistry } = await import("../src/contract.mjs");
  const result = summarizeRegistry([
    {
      name: "First",
      maturity: "experimental",
      evidence: "",
      targets: ["Astro", "React"],
      implementations: [
        { family: "martlet", platform: "Astro", state: "published" },
      ],
    },
    {
      name: "Second",
      maturity: "stable",
      evidence: "Reviewed in real use.",
      targets: ["React"],
      implementations: [],
    },
  ]);
  assert.equal(result.total, 2);
  assert.equal(result.stable, 1);
  assert.equal(result.missingEvidence, 1);
  assert.equal(result.missingImplementations, 1);
  const martletAstro = result.coverage.find(
    (row) => row.family === "martlet" && row.platform === "Astro",
  );
  assert.equal(martletAstro.published, 1);
  assert.equal(martletAstro.unimplemented, 0);
  const krigReact = result.coverage.find(
    (row) => row.family === "krigsvold" && row.platform === "React",
  );
  assert.equal(krigReact.targeted, 2);
  assert.equal(krigReact.unimplemented, 2);
  assert.equal(krigReact.published, 0);
});
test("evidence filtering distinguishes blank text from recorded observations", () => {
  const input = [
    {
      name: "Blank",
      summary: "",
      category: "Input",
      targets: ["React"],
      maturity: "experimental",
      evidence: "  ",
    },
    {
      name: "Observed",
      summary: "",
      category: "Input",
      targets: ["React"],
      maturity: "experimental",
      evidence: "Observed in real work.",
    },
  ];
  assert.deepEqual(
    filterRecords(input, "", "", "", "missing").map((x) => x.name),
    ["Blank"],
  );
  assert.deepEqual(
    filterRecords(input, "", "", "", "recorded").map((x) => x.name),
    ["Observed"],
  );
});

test("revision comparisons ignore target ordering but retain real field differences", async () => {
  const { compareDrafts } = await import("../src/contract.mjs");
  const current = {
    ...newDraft(),
    name: "Button",
    targets: ["Astro", "React"],
  };
  const historical = {
    ...current,
    targets: ["React", "Astro"],
    summary: "An earlier purpose.",
  };
  assert.deepEqual(compareDrafts(current, historical), [
    { key: "summary", current: "", previous: "An earlier purpose." },
  ]);
});
test("restoring a historical draft creates a revision and retains current availability and history", () => {
  const store = openRegistry(":memory:");
  try {
    const original = store.get("button");
    const next = store.save(
      original.id,
      {
        ...toDraft(original),
        summary:
          "A later specification that is retained in history after restoration.",
      },
      original.revision,
    );
    const restored = store.save(original.id, toDraft(original), next.revision);
    assert.equal(restored.revision, 3);
    assert.equal(restored.summary, original.summary);
    assert.deepEqual(restored.implementations, next.implementations);
    assert.deepEqual(
      store.history(original.id).map((x) => x.revision),
      [3, 2, 1],
    );
    assert.equal(store.history(original.id)[1].snapshot.summary, next.summary);
    assert.throws(
      () => store.save(original.id, toDraft(original), next.revision),
      (error) => error.status === 409,
    );
  } finally {
    store.close();
  }
});
