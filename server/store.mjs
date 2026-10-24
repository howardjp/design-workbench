import { reviewState, reviewBasis } from "./review.mjs";
import { validateReview, cleanReview } from "../src/review.mjs";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { inventorySnapshot, previewInventory } from "./inventory.mjs";
import { parseImport, previewImport, ImportDocumentError } from "./import.mjs";
import { cleanDraft, validateDraft } from "../src/contract.mjs";
export class RegistryError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export function openRegistry(path) {
  const inventory = inventorySnapshot(
    JSON.parse(readFileSync(new URL("./seed.json", import.meta.url), "utf8")),
  );
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  const version = db.prepare("PRAGMA user_version").get().user_version;
  if (version > 2) {
    db.close();
    throw new Error("Database schema is newer than this application.");
  }
  if (version === 0) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(
        "CREATE TABLE components (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, document TEXT NOT NULL); CREATE TABLE history (id TEXT NOT NULL, revision INTEGER NOT NULL, at TEXT NOT NULL, snapshot TEXT NOT NULL, PRIMARY KEY(id,revision)); PRAGMA user_version=2;",
      );
      const seed = inventory.records;
      const at = new Date().toISOString();
      for (const entry of seed) {
        const record = { ...entry, revision: 1, updatedAt: at };
        db.prepare("INSERT INTO components VALUES (?,?,?)").run(
          record.id,
          1,
          JSON.stringify(record),
        );
        db.prepare("INSERT INTO history VALUES (?,?,?,?)").run(
          record.id,
          1,
          at,
          JSON.stringify(record),
        );
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      db.close();
      throw error;
    }
  }
  // Schema 2 protects structured review metadata from older writers that discard unknown fields.
  if (version === 1) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec("PRAGMA user_version=2; COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      db.close();
      throw error;
    }
  }
  const get = (id) => {
    const row = db
      .prepare("SELECT document FROM components WHERE id=?")
      .get(id);
    if (!row) throw new RegistryError(404, "Component not found.");
    return JSON.parse(row.document);
  };
  const list = () =>
    db
      .prepare(
        "SELECT document FROM components ORDER BY json_extract(document,'$.name') COLLATE NOCASE, id",
      )
      .all()
      .map((row) => JSON.parse(row.document));
  const write = (record, change) => {
    db.prepare(
      "INSERT INTO components VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, document=excluded.document",
    ).run(record.id, record.revision, JSON.stringify(record));
    db.prepare("INSERT INTO history VALUES (?,?,?,?)").run(
      record.id,
      record.revision,
      record.updatedAt,
      JSON.stringify(change ? { ...record, change } : record),
    );
  };
  const importDocument = (source, fileName) => {
    try {
      return parseImport(source, fileName);
    } catch (error) {
      if (error instanceof ImportDocumentError)
        throw new RegistryError(422, error.message, error.fields);
      throw error;
    }
  };
  return {
    close: () => db.close(),
    list,
    previewImport: (source, fileName) =>
      previewImport(list(), importDocument(source, fileName)),
    applyImport(source, fileName, token) {
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
        throw new RegistryError(
          400,
          "A valid import preview token is required.",
        );
      const document = importDocument(source, fileName);
      db.exec("BEGIN IMMEDIATE");
      try {
        const preview = previewImport(list(), document);
        if (preview.token !== token)
          throw new RegistryError(
            409,
            "The registry or selected file changed after this preview. Preview the import again and review the result.",
          );
        if (preview.conflicts.length)
          throw new RegistryError(
            409,
            "Resolve the import conflicts before applying any records.",
          );
        const at = new Date().toISOString();
        const provenance = {
          kind: "json-import",
          fileName: document.fileName,
          documentHash: document.documentHash,
          exportedAt: document.exportedAt,
        };
        for (const change of preview.changes) {
          const previous = change.kind === "add" ? null : get(change.id);
          write(
            {
              ...change.after,
              id: change.id,
              revision: (previous?.revision ?? 0) + 1,
              updatedAt: at,
              implementations: previous?.implementations ?? [],
              ...(previous?.review ? { review: previous.review } : {}),
            },
            provenance,
          );
        }
        const components = list();
        const next = previewImport(components, document);
        db.exec("COMMIT");
        return { applied: preview.changes.length, components, preview: next };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    previewInventory: () => previewInventory(list(), inventory),
    applyInventory(token) {
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
        throw new RegistryError(
          400,
          "A valid inventory preview token is required.",
        );
      db.exec("BEGIN IMMEDIATE");
      try {
        const preview = previewInventory(list(), inventory);
        if (preview.token !== token)
          throw new RegistryError(
            409,
            "The registry or bundled inventory changed after this preview. Refresh the preview and review it again.",
          );
        if (preview.conflicts.length)
          throw new RegistryError(
            409,
            "Resolve the listed name conflicts before applying inventory updates.",
          );
        const at = new Date().toISOString();
        for (const change of preview.changes) {
          const previous = change.kind === "add" ? null : get(change.id);
          write({
            ...(previous ?? change.record),
            implementations: change.after,
            revision: (previous?.revision ?? 0) + 1,
            updatedAt: at,
          });
        }
        const components = list();
        const next = previewInventory(components, inventory);
        db.exec("COMMIT");
        return { applied: preview.changes.length, components, preview: next };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    get,
    getReview: (id) => reviewState(get(id)),
    saveReview(id, checks, revision, confirmed) {
      const fields = validateReview(checks);
      if (confirmed !== true)
        fields.confirmation =
          "Confirm that these observations were reviewed against the displayed specification and inventory.";
      if (Object.keys(fields).length)
        throw new RegistryError(
          422,
          "The readiness review needs a few changes.",
          fields,
        );
      if (!Number.isSafeInteger(revision) || revision < 1)
        throw new RegistryError(400, "A valid revision is required.");
      db.exec("BEGIN IMMEDIATE");
      try {
        const previous = get(id);
        if (previous.revision !== revision)
          throw new RegistryError(
            409,
            "This component changed in another window. Your review draft is preserved. Load the latest specification and review it before saving again.",
          );
        const basisHash = reviewBasis(previous),
          clean = cleanReview(checks);
        if (
          previous.review?.basisHash === basisHash &&
          JSON.stringify(previous.review.checks) === JSON.stringify(clean)
        ) {
          db.exec("COMMIT");
          return reviewState(previous);
        }
        const at = new Date().toISOString();
        const record = {
          ...previous,
          revision: revision + 1,
          updatedAt: at,
          review: {
            policyVersion: 1,
            basisHash,
            basedOnRevision: revision,
            recordedAt: at,
            checks: clean,
          },
        };
        write(record, { kind: "readiness-review", basisHash });
        db.exec("COMMIT");
        return reviewState(record);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    history: (id) => {
      get(id);
      return db
        .prepare(
          "SELECT revision,at,snapshot FROM history WHERE id=? ORDER BY revision DESC LIMIT 20",
        )
        .all(id)
        .map((row) => ({ ...row, snapshot: JSON.parse(row.snapshot) }));
    },
    save(id, draft, revision) {
      const fields = validateDraft(draft);
      if (Object.keys(fields).length)
        throw new RegistryError(422, "Check the highlighted fields.", fields);
      if (id && (!Number.isSafeInteger(revision) || revision < 1))
        throw new RegistryError(400, "A valid revision is required.");
      db.exec("BEGIN IMMEDIATE");
      try {
        const previous = id ? get(id) : null;
        if (previous && previous.revision !== revision)
          throw new RegistryError(
            409,
            "This record changed in another window. Your draft is preserved. Compare with the latest saved record or reload it before trying again.",
          );
        const data = cleanDraft(draft);
        const slug =
          id ||
          data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        if (!slug)
          throw new RegistryError(
            422,
            "Choose a name containing a letter or number.",
            { name: "Include a letter or number in the name." },
          );
        const duplicate = db
          .prepare(
            "SELECT id FROM components WHERE lower(json_extract(document,'$.name'))=lower(?) AND id!=?",
          )
          .get(data.name, slug);
        if (
          duplicate ||
          (!id && db.prepare("SELECT id FROM components WHERE id=?").get(slug))
        )
          throw new RegistryError(422, "That component already exists.", {
            name: "Choose a unique component name.",
          });
        const record = {
          ...data,
          id: slug,
          revision: (previous?.revision ?? 0) + 1,
          updatedAt: new Date().toISOString(),
          implementations: previous?.implementations ?? [],
          ...(previous?.review ? { review: previous.review } : {}),
        };
        if (previous)
          db.prepare(
            "UPDATE components SET revision=?,document=? WHERE id=?",
          ).run(record.revision, JSON.stringify(record), slug);
        else
          db.prepare("INSERT INTO components VALUES (?,?,?)").run(
            slug,
            record.revision,
            JSON.stringify(record),
          );
        db.prepare("INSERT INTO history VALUES (?,?,?,?)").run(
          slug,
          record.revision,
          record.updatedAt,
          JSON.stringify(record),
        );
        db.exec("COMMIT");
        return record;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
