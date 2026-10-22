import { createHash } from "node:crypto";
import { toDraft } from "../src/contract.mjs";
import { blankReview, summarizeReview } from "../src/review.mjs";
export function reviewBasis(record) {
  const draft = { ...toDraft(record), targets: [...record.targets].sort() };
  const implementations = record.implementations
    .map(({ family, platform, package: packageName, version, state }) => ({
      family,
      platform,
      package: packageName,
      version,
      state,
    }))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), "en"));
  return createHash("sha256")
    .update(JSON.stringify([1, record.id, draft, implementations]))
    .digest("hex");
}
export function reviewState(record) {
  const basisHash = reviewBasis(record);
  return {
    record,
    basisHash,
    current:
      !!record.review &&
      record.review.policyVersion === 1 &&
      record.review.basisHash === basisHash,
    summary: summarizeReview(record.review?.checks ?? blankReview()),
  };
}
