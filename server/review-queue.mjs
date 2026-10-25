import { reviewState } from "./review.mjs";
import { blankReview, summarizeReview } from "../src/review.mjs";
// A single list() SELECT is the snapshot boundary. Never mix per-record reads.
export function reviewQueue(records, generatedAt = new Date().toISOString()) {
  const entries = records.map((record) => {
    const state = reviewState(record);
    const checks = (state.current ? record.review.checks : blankReview()).map(
      ({ id, outcome }) => ({ id, outcome }),
    );
    return {
      id: record.id,
      name: record.name,
      summary: record.summary,
      category: record.category,
      maturity: record.maturity,
      revision: record.revision,
      position: !record.review
        ? "not-recorded"
        : state.current
          ? "current"
          : "renewal",
      recordedAt: record.review?.recordedAt ?? null,
      checks,
      summaryCounts: summarizeReview(checks),
      savedSummary: state.summary,
    };
  });
  return {
    schemaVersion: 1,
    policyVersion: 1,
    generatedAt,
    entries,
    counts: {
      total: entries.length,
      current: entries.filter((e) => e.position === "current").length,
      renewal: entries.filter((e) => e.position === "renewal").length,
      notRecorded: entries.filter((e) => e.position === "not-recorded").length,
      allPassed: entries.filter((e) => e.summaryCounts.passed === 6).length,
    },
  };
}
