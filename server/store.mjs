import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { cleanDraft, validateDraft } from "../src/contract.mjs";
export class RegistryError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export function openRegistry(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  const version = db.prepare("PRAGMA user_version").get().user_version;
  if (version > 1) {
    db.close();
    throw new Error("Database schema is newer than this application.");
  }
  if (version === 0) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(
        "CREATE TABLE components (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, document TEXT NOT NULL); CREATE TABLE history (id TEXT NOT NULL, revision INTEGER NOT NULL, at TEXT NOT NULL, snapshot TEXT NOT NULL, PRIMARY KEY(id,revision)); PRAGMA user_version=1;",
      );
      const seed = JSON.parse(
        readFileSync(new URL("./seed.json", import.meta.url), "utf8"),
      );
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
  const get = (id) => {
    const row = db
      .prepare("SELECT document FROM components WHERE id=?")
      .get(id);
    if (!row) throw new RegistryError(404, "Component not found.");
    return JSON.parse(row.document);
  };
  return {
    close: () => db.close(),
    list: () =>
      db
        .prepare(
          "SELECT document FROM components ORDER BY json_extract(document,'$.name') COLLATE NOCASE, id",
        )
        .all()
        .map((row) => JSON.parse(row.document)),
    get,
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
            "This record changed in another window. Your draft is preserved. Reload the saved record before trying again.",
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
