import { test } from "node:test";
import assert from "node:assert/strict";
import { openRegistry } from "../server/store.mjs";
import { createWorkbenchServer } from "../server/http.mjs";
import { reviewQueue } from "../server/review-queue.mjs";
import {
  queueQuery,
  writeQueueQuery,
  selectQueue,
} from "../src/queue-query.mjs";
import { blankReview } from "../src/review.mjs";
import { toDraft } from "../src/contract.mjs";
const checks = () =>
  blankReview().map((c) => ({
    ...c,
    outcome: "passed",
    notes: "Fixture observations only; no production evidence is claimed.",
  }));
function setup(t) {
  const store = openRegistry(":memory:");
  t.after(() => store.close());
  const current = store.saveReview(
    "button",
    checks().map((c) =>
      c.id === "keyboard" ? { ...c, outcome: "needs-work" } : c,
    ),
    1,
    true,
  ).record;
  const stale = store.saveReview("text-input", checks(), 1, true).record;
  store.save(
    stale.id,
    {
      ...toDraft(stale),
      summary: "Changed specification requires fresh review of all six areas.",
    },
    stale.revision,
  );
  return { store, current, stale };
}
test("queue derives current, renewal and absent positions from one snapshot without counting historical passes", (t) => {
  const { store } = setup(t);
  const before = store.list();
  const result = reviewQueue(before, "2026-10-22T09:00:00Z");
  assert.equal(result.counts.total, before.length);
  assert.deepEqual(result.counts, {
    total: before.length,
    current: 1,
    renewal: 1,
    notRecorded: before.length - 2,
    allPassed: 0,
  });
  const stale = result.entries.find((e) => e.id === "text-input");
  assert.equal(stale.savedSummary.passed, 6);
  assert.equal(stale.summaryCounts.passed, 0);
  assert.equal(stale.summaryCounts.unreviewed, 6);
  assert.equal(
    result.entries.find((e) => e.id === "button").summaryCounts.needsWork,
    1,
  );
  assert.equal(
    stale.checks.some((c) => c.notes),
    false,
  );
  assert.deepEqual(store.list(), before);
  assert.equal(store.history("text-input").length, 3);
  // Renewal changes only after a real saved review; the older DTO stays a snapshot.
  store.saveReview("text-input", blankReview(), 3, true);
  assert.equal(reviewQueue(store.list()).counts.current, 2);
  assert.equal(stale.position, "renewal");
  const complete = store.saveReview("radio", checks(), 1, true).record;
  assert.equal(reviewQueue(store.list()).counts.allPassed, 1);
  assert.equal(complete.maturity, "experimental");
  store.save("radio", { ...toDraft(complete), summary: "A changed contract invalidates the six recorded fixture passes." }, complete.revision);
  assert.equal(reviewQueue(store.list()).counts.allPassed, 0);

});
test("queue filters intersect areas and outcomes, deterministic attention order and bounded pages", (t) => {
  const { store } = setup(t),
    entries = reviewQueue(store.list()).entries;
  let q = queueQuery(new URLSearchParams());
  assert.deepEqual(
    selectQueue(entries, q)
      .entries.slice(0, 2)
      .map((e) => e.id),
    ["text-input", "button"],
  );
  q = { ...q, position: "current", outcome: "needs-work", area: "keyboard" };
  assert.deepEqual(
    selectQueue(entries, q).entries.map((e) => e.id),
    ["button"],
  );
  assert.equal(selectQueue(entries, { ...q, area: "consumer" }).total, 0);
  assert.equal(selectQueue(entries, { ...q, position: "renewal" }).total, 0);
  assert.equal(
    selectQueue(entries, {
      ...q,
      position: "all",
      outcome: "not-reviewed",
      query: "changed specification",
    }).total,
    1,
  );
  const last = selectQueue(entries, {
    ...queueQuery(new URLSearchParams()),
    page: 99999999,
  });
  assert.equal(last.page, last.pageCount);
  assert.ok(last.entries.length > 0);
  const empty = selectQueue([], q);
  assert.equal(empty.pageCount, 1);
  assert.equal(empty.page, 1);
  const reversed = selectQueue(
    [...entries].reverse(),
    queueQuery(new URLSearchParams()),
  );
  assert.deepEqual(
    reversed.entries,
    selectQueue(entries, queueQuery(new URLSearchParams())).entries,
  );
});
test("queue URL state validates hostile values, preserves unrelated routing and round-trips meaningful filters", () => {
  const defaults = queueQuery(new URLSearchParams());
  for (const page of ["0", "-1", "1.5", "Infinity", "999999999", "garbage"])
    assert.equal(queueQuery(new URLSearchParams({ "rq-page": page })).page, 1);
  assert.equal(
    queueQuery(new URLSearchParams({ "rq-search": "x".repeat(500) })).query
      .length,
    200,
  );
  const params = new URLSearchParams(
    "view=queue&record=button&rq-area=unrecognized&rq-sort=__proto__",
  );
  assert.deepEqual(queueQuery(params), defaults);
  const q = {
    ...defaults,
    query: "Native radio & keyboard",
    position: "renewal",
    outcome: "not-reviewed",
    area: "assistive",
    sort: "name",
    page: 3,
  };
  writeQueueQuery(params, q);
  assert.deepEqual(queueQuery(params), q);
  assert.equal(params.get("record"), "button");
  writeQueueQuery(params, defaults);
  assert.equal(params.toString(), "view=queue&record=button");
});
test("HTTP queue is read-only, no-store and uses exactly one list read per response", async (t) => {
  const { store } = setup(t);
  let calls = 0;
  const list = store.list;
  const server = createWorkbenchServer({
    store: {
      ...store,
      list: () => {
        calls++;
        return list();
      },
    },
    dist: "dist",
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  t.after(
    () =>
      new Promise((done) => {
        server.close(done);
        server.closeAllConnections();
      }),
  );
  const url = `http://127.0.0.1:${server.address().port}/api/reviews/queue`;
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).counts.current, 1);
  assert.equal(calls, 1);
  assert.equal(
    (
      await fetch(url, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).status,
    404,
  );
  assert.equal(
    (await fetch(url, { headers: { origin: "https://example.com" } })).status,
    403,
  );
  assert.equal(store.history("button").length, 2);
});
