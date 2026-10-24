import { createHash } from "node:crypto";
import { cleanDraft, compareDrafts, validateDraft } from "../src/contract.mjs";
export const IMPORT_MAX_BYTES = 1024 * 1024;
export const IMPORT_MAX_RECORDS = 500;
const hash = (value) => createHash("sha256").update(value).digest("hex");
export class ImportDocumentError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.fields = fields;
  }
}
const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T/.test(value) &&
  Number.isFinite(Date.parse(value));
export function parseImport(source, fileName) {
  if (
    typeof source !== "string" ||
    Buffer.byteLength(source, "utf8") > IMPORT_MAX_BYTES
  )
    throw new ImportDocumentError(
      "Choose a UTF-8 JSON export no larger than 1 MiB.",
    );
  if (
    typeof fileName !== "string" ||
    fileName.length < 1 ||
    fileName.length > 180 ||
    /[\x00-\x1f\x7f/\\]/.test(fileName)
  )
    throw new ImportDocumentError(
      "Provide a file name of 1–180 characters without paths or control characters.",
    );
  let document;
  try {
    document = JSON.parse(source.replace(/^\uFEFF/, ""));
  } catch {
    throw new ImportDocumentError("The file is not valid JSON.");
  }
  if (
    !document ||
    Array.isArray(document) ||
    document.schemaVersion !== 1 ||
    !validDate(document.exportedAt) ||
    !Array.isArray(document.components) ||
    document.components.length > IMPORT_MAX_RECORDS
  )
    throw new ImportDocumentError(
      "Use a schema 1 registry export with an export time and no more than 500 components.",
    );
  const ids = new Set();
  const names = new Set();
  const fields = {};
  const records = [];
  for (const [index, entry] of document.components.entries()) {
    const errors = validateDraft(entry);
    if (
      !entry ||
      typeof entry.id !== "string" ||
      entry.id.length > 160 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)
    )
      errors.id = "Provide a valid component ID (up to 160 characters).";
    if (!Number.isSafeInteger(entry?.revision) || entry.revision < 1)
      errors.revision = "Provide the exported positive revision number.";
    if (!validDate(entry?.updatedAt))
      errors.updatedAt = "Provide the exported save time.";
    if (entry && typeof entry.id === "string") {
      if (ids.has(entry.id))
        errors.id = "Component IDs must be unique in the file.";
      ids.add(entry.id);
    }
    if (entry && typeof entry.name === "string") {
      const name = entry.name.trim().toLowerCase();
      if (names.has(name))
        errors.name = "Component names must be unique in the file.";
      names.add(name);
    }
    if (Object.keys(errors).length) {
      for (const [key, error] of Object.entries(errors))
        if (Object.keys(fields).length < 20)
          fields[`components.${index}.${key}`] =
            `Component ${index + 1}: ${error}`;
    } else
      records.push({
        id: entry.id,
        revision: entry.revision,
        updatedAt: entry.updatedAt,
        ...cleanDraft(entry),
      });
  }
  if (Object.keys(fields).length)
    throw new ImportDocumentError(
      "The import document is invalid. Correct the listed fields (up to 20 shown) and preview again.",
      fields,
    );
  return {
    fileName,
    documentHash: hash(source),
    exportedAt: document.exportedAt,
    records,
  };
}
export function previewImport(current, document) {
  const byId = new Map(current.map((record) => [record.id, record]));
  const changes = [];
  const conflicts = [];
  const finalNames = new Map(current.map((record) => [record.id, record.name]));
  const retainedMaturity = [];
  for (const entry of document.records) {
    const previous = byId.get(entry.id);
    // Lifecycle review stays in the editor; a file cannot promote or deprecate.
    const after = {
      ...cleanDraft(entry),
      maturity: previous?.maturity ?? "proposed",
    };
    if (after.maturity !== entry.maturity)
      retainedMaturity.push({
        id: entry.id,
        name: entry.name,
        requested: entry.maturity,
        applied: after.maturity,
      });
    finalNames.set(entry.id, after.name);
    const differences = previous
      ? compareDrafts(previous, after).map(
          ({ key, current, previous: proposed }) => ({
            key,
            before: current,
            after: proposed,
          }),
        )
      : Object.entries(after).map(([key, value]) => ({
          key,
          before: null,
          after: value,
        }));
    if (!differences.length) continue;
    if (previous && previous.revision !== entry.revision)
      conflicts.push({
        id: entry.id,
        name: entry.name,
        message: `The file has revision ${entry.revision}; the registry has revision ${previous.revision}. Export a fresh snapshot or use the specification editor to review an older contract.`,
      });
    const validation = validateDraft(after);
    if (Object.keys(validation).length)
      conflicts.push({
        id: entry.id,
        name: entry.name,
        message: `The saved lifecycle requires valid supporting fields: ${Object.values(validation).join(" ")}`,
      });
    changes.push({
      id: entry.id,
      name: entry.name,
      kind: previous ? "update" : "add",
      revision: previous?.revision ?? null,
      after,
      differences,
    });
  }
  const names = new Map();
  for (const [id, name] of finalNames) {
    const key = name.toLowerCase();
    if (names.has(key))
      conflicts.push({
        id,
        name,
        message: `The final name is also used by ${names.get(key)}. Resolve the name conflict before importing.`,
      });
    else names.set(key, id);
  }
  return {
    schemaVersion: 1,
    policyVersion: 1,
    fileName: document.fileName,
    documentHash: document.documentHash,
    exportedAt: document.exportedAt,
    token: hash(
      JSON.stringify([
        1,
        document.fileName,
        document.documentHash,
        [...current].sort((a, b) => a.id.localeCompare(b.id, "en")),
      ]),
    ),
    changes,
    conflicts,
    retainedMaturity,
    total: document.records.length,
    unchanged: document.records.length - changes.length,
  };
}
