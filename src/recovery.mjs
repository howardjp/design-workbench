import { cleanDraft, compareDrafts, draftKeys, toDraft } from "./contract.mjs";
function identity(base, latest) {
  if (
    base.id !== latest.id ||
    !Number.isSafeInteger(latest.revision) ||
    latest.revision < base.revision
  )
    throw new Error(
      "The loaded record has a different identity or an older revision. Return to your draft and verify the local registry.",
    );
}
/** @param {import('./types').ComponentRecord} base @param {import('./types').Draft} draft @param {import('./types').ComponentRecord} latest */
export function recoveryFields(base, draft, latest) {
  identity(base, latest);
  const local = cleanDraft(draft);
  const localChanged = new Set(compareDrafts(local, base).map((c) => c.key));
  const savedChanged = new Set(compareDrafts(latest, base).map((c) => c.key));
  return compareDrafts(latest, local).map((c) => ({
    key: c.key,
    base: base[c.key],
    draft: c.previous,
    saved: c.current,
    localChanged: localChanged.has(c.key),
    savedChanged: savedChanged.has(c.key),
  }));
}
/** @param {import('./types').ComponentRecord} base @param {import('./types').Draft} draft @param {import('./types').ComponentRecord} latest @param {Record<string, string>} choices */
export function resolveRecovery(base, draft, latest, choices) {
  const fields = recoveryFields(base, draft, latest);
  if (
    fields.some((f) => !["draft", "saved"].includes(choices[f.key])) ||
    Object.keys(choices).some((key) => !fields.some((f) => f.key === key))
  )
    throw new Error("Choose a source for every differing field.");
  const local = cleanDraft(draft),
    saved = toDraft(latest);
  return Object.fromEntries(
    draftKeys.map((key) => {
      const value = choices[key] === "draft" ? local[key] : saved[key];
      return [key, Array.isArray(value) ? [...value] : value];
    }),
  );
}
export const draftLabels = {
  name: "Component name",
  summary: "Summary",
  category: "Category",
  maturity: "Maturity stage",
  targets: "Target platforms",
  acceptanceCriteria: "Acceptance criteria",
  evidence: "Usage and verification evidence",
  martletNotes: "Martlet notes",
  krigsvoldNotes: "Krigsvold notes",
  migration: "Migration guidance",
};
