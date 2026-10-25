import { reviewAreas } from "./review.mjs";
const choose = (value, options, fallback) =>
  options.includes(value) ? value : fallback;
export function queueQuery(params) {
  const rawPage = params.get("rq-page");
  return {
    query: (params.get("rq-search") ?? "").slice(0, 200),
    position: choose(
      params.get("rq-position"),
      ["all", "not-recorded", "renewal", "current"],
      "all",
    ),
    outcome: choose(
      params.get("rq-outcome"),
      ["all", "not-reviewed", "needs-work", "passed"],
      "all",
    ),
    area: choose(
      params.get("rq-area"),
      ["all", ...reviewAreas.map((a) => a.id)],
      "all",
    ),
    sort: choose(params.get("rq-sort"), ["attention", "name"], "attention"),
    page: rawPage && /^[1-9]\d{0,7}$/.test(rawPage) ? Number(rawPage) : 1,
  };
}
export function writeQueueQuery(params, query) {
  const defaults = queueQuery(new URLSearchParams());
  for (const key of ["query", "position", "outcome", "area", "sort", "page"]) {
    const name = key === "query" ? "rq-search" : `rq-${key}`;
    if (query[key] === defaults[key]) params.delete(name);
    else params.set(name, String(query[key]));
  }
  return params;
}
const rank = (e) =>
  e.position === "renewal"
    ? 0
    : e.summaryCounts.needsWork
      ? 1
      : e.position === "not-recorded"
        ? 2
        : e.summaryCounts.unreviewed
          ? 3
          : 4;
/** @param {import("./types").ReviewQueueEntry[]} entries */
export function selectQueue(entries, query, pageSize = 10) {
  const needle = query.query.trim().toLocaleLowerCase("en");
  const matching = entries
    .filter(
      (e) =>
        (!needle ||
          `${e.name} ${e.summary} ${e.category}`
            .toLocaleLowerCase("en")
            .includes(needle)) &&
        (query.position === "all" || query.position === e.position) &&
        (query.outcome === "all" ||
          e.checks.some(
            (check) =>
              (query.area === "all" || query.area === check.id) &&
              check.outcome === query.outcome,
          )),
    )
    .sort(
      (a, b) =>
        (query.sort === "attention" ? rank(a) - rank(b) : 0) ||
        a.name.localeCompare(b.name, "en") ||
        a.id.localeCompare(b.id, "en"),
    );
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  return {
    total: matching.length,
    page,
    pageCount,
    entries: matching.slice((page - 1) * pageSize, page * pageSize),
  };
}
