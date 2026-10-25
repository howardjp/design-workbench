import { createHash } from "node:crypto";
import { cleanDraft, platforms, validateDraft } from "../src/contract.mjs";

const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const key = (item) => `${item.family}/${item.platform}/${item.package}`;
const canonicalImplementations = (items) =>
  items
    .map(({ family, platform, package: packageName, version, state }) => ({
      family,
      platform,
      package: packageName,
      version,
      state,
    }))
    .sort((a, b) => key(a).localeCompare(key(b), "en"));

// The only source is the checked-in inventory bundled with this server. This is
// deliberately not a JSON-import endpoint or a claim of live package discovery.
export function inventorySnapshot(entries) {
  if (!Array.isArray(entries) || entries.length > 2000)
    throw new Error("Invalid bundled inventory.");
  const ids = new Set();
  const names = new Set();
  const records = entries
    .map((entry) => {
      if (
        !entry ||
        typeof entry.id !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) ||
        Object.keys(validateDraft(entry)).length ||
        entry.maturity !== "experimental" ||
        entry.evidence !== "" ||
        !Array.isArray(entry.implementations)
      )
        throw new Error("Invalid bundled component contract.");
      const draft = cleanDraft(entry);
      if (ids.has(entry.id) || names.has(draft.name.toLowerCase()))
        throw new Error("Duplicate bundled component.");
      ids.add(entry.id);
      names.add(draft.name.toLowerCase());
      const implementationKeys = new Set();
      const implementations = entry.implementations.map((item) => {
        if (
          !item ||
          !["martlet", "krigsvold"].includes(item.family) ||
          !platforms.includes(item.platform) ||
          typeof item.package !== "string" ||
          !/^@[a-z0-9-]+\/[a-z0-9-]+$/.test(item.package) ||
          typeof item.version !== "string" ||
          !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(item.version) ||
          !["published", "workspace"].includes(item.state) ||
          implementationKeys.has(key(item))
        )
          throw new Error("Invalid bundled implementation.");
        implementationKeys.add(key(item));
        return {
          family: item.family,
          platform: item.platform,
          package: item.package,
          version: item.version,
          state: item.state,
        };
      });
      return {
        id: entry.id,
        ...draft,
        implementations: canonicalImplementations(implementations),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, "en"));
  return { version: hash(records), records };
}

export function previewInventory(current, snapshot) {
  const byId = new Map(current.map((item) => [item.id, item]));
  const changes = [];
  const conflicts = [];
  for (const entry of snapshot.records) {
    const previous = byId.get(entry.id);
    if (!previous) {
      const duplicate = current.find(
        (item) => item.name.toLowerCase() === entry.name.toLowerCase(),
      );
      if (duplicate) {
        conflicts.push({
          id: entry.id,
          name: entry.name,
          message: `The name is already used by ${duplicate.id}. Rename that saved component before refreshing this preview.`,
        });
      } else
        changes.push({
          id: entry.id,
          name: entry.name,
          kind: "add",
          revision: null,
          before: [],
          after: entry.implementations,
          record: entry,
        });
      continue;
    }
    // Retain all user-authored fields and unrelated implementation entries.
    const merged = new Map(
      previous.implementations.map((item) => [key(item), item]),
    );
    for (const item of entry.implementations) merged.set(key(item), item);
    const before = canonicalImplementations(previous.implementations);
    const after = canonicalImplementations([...merged.values()]);
    if (JSON.stringify(before) !== JSON.stringify(after))
      changes.push({
        id: previous.id,
        name: previous.name,
        kind: "implementations",
        revision: previous.revision,
        before,
        after,
      });
  }
  const bundledById = new Map(
    snapshot.records.map((entry) => [
      entry.id,
      new Set(entry.implementations.map(key)),
    ]),
  );
  const retained = current
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      implementations: entry.implementations.filter(
        (item) => !bundledById.get(entry.id)?.has(key(item)),
      ),
    }))
    .filter((entry) => entry.implementations.length);
  return {
    schemaVersion: 1,
    source: "Bundled component inventory",
    inventoryVersion: snapshot.version,
    token: hash([
      snapshot.version,
      [...current].sort((a, b) => a.id.localeCompare(b.id, "en")),
    ]),
    changes,
    conflicts,
    retained,
    unchanged:
      current.length -
      changes.filter((item) => item.kind === "implementations").length,
  };
}
