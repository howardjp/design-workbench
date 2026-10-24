import { draftKeys } from "./contract.mjs";

export const draftPrefix = "design-workbench:specification-draft:v1:";
const maxBytes = 65536;
const textKeys = draftKeys.filter((key) => key !== "targets");
// Incomplete/invalid form values are recoverable. Only the storage envelope and
// field types are validated here; the ordinary editor still validates saves.
function shape(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid draft fields");
  if (
    textKeys.some((key) => typeof value[key] !== "string") ||
    !Array.isArray(value.targets) ||
    value.targets.length > 30 ||
    value.targets.some((target) => typeof target !== "string")
  )
    throw new Error("Invalid draft fields");
  return Object.fromEntries(
    draftKeys.map((key) => [
      key,
      key === "targets" ? [...value.targets] : value[key],
    ]),
  );
}
export function parseDraft(text, key) {
  if (typeof text !== "string" || text.length > maxBytes)
    throw new Error("Draft is too large");
  const value = JSON.parse(text);
  if (
    !value ||
    value.schemaVersion !== 1 ||
    typeof value.id !== "string" ||
    !/^[a-zA-Z0-9-]{1,80}$/.test(value.id) ||
    key !== draftPrefix + value.id ||
    typeof value.savedAt !== "string" ||
    !Number.isFinite(Date.parse(value.savedAt)) ||
    typeof value.uncertain !== "boolean"
  )
    throw new Error("Invalid draft envelope");
  const existing = value.recordId !== null;
  if (
    existing &&
    (typeof value.recordId !== "string" ||
      !/^[a-z0-9-]{1,160}$/.test(value.recordId) ||
      !Number.isSafeInteger(value.baseRevision) ||
      value.baseRevision < 1)
  )
    throw new Error("Invalid editing base");
  if (!existing && (value.baseRevision !== null || value.baseDraft !== null))
    throw new Error("Invalid new draft");
  return {
    schemaVersion: 1,
    id: value.id,
    savedAt: value.savedAt,
    recordId: value.recordId,
    baseRevision: value.baseRevision,
    baseDraft: existing ? shape(value.baseDraft) : null,
    draft: shape(value.draft),
    uncertain: value.uncertain,
  };
}
export function readDrafts(storage) {
  const drafts = [],
    invalidKeys = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(draftPrefix)) continue;
    try {
      drafts.push(parseDraft(storage.getItem(key), key));
    } catch {
      invalidKeys.push(key);
    }
  }
  return {
    drafts: drafts.sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    invalidKeys,
  };
}
export function writeDraft(storage, value) {
  const key = draftPrefix + value.id;
  const text = JSON.stringify(value);
  const sanitized = parseDraft(text, key);
  storage.setItem(key, JSON.stringify(sanitized));
  return sanitized;
}
export function removeDraft(storage, id) {
  storage.removeItem(draftPrefix + id);
}
