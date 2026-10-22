import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openRegistry } from "../../server/store.mjs";
import { toDraft } from "../../src/contract.mjs";
export const missing = [
  "checkbox",
  "fieldset",
  "disclosure",
  "error-summary",
  "article",
  "table-of-contents",
  "file-input",
];
export function createOlderRegistry(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), "inventory-upgrade-"));
  const path = join(dir, "registry.sqlite");
  let store = openRegistry(path);
  const before = store.get("button");
  const edited = store.save(
    "button",
    {
      ...toDraft(before),
      name: "My Button",
      summary:
        "A real edited specification retained during inventory synchronization.",
      targets: ["Vue"],
      maturity: "stable",
      evidence: "Manually reviewed in this local consumer; keep this evidence.",
    },
    before.revision,
  );
  const custom = store.save(null, {
    ...toDraft(before),
    name: "Local application control",
  });
  store.close();
  const db = new DatabaseSync(path);
  for (const id of missing) {
    db.prepare("DELETE FROM components WHERE id=?").run(id);
    db.prepare("DELETE FROM history WHERE id=?").run(id);
  }
  const previous = {
    ...edited,
    implementations: [
      ...edited.implementations.map((item) =>
        item.platform === "React" ? { ...item, version: "0.0.1" } : item,
      ),
      {
        family: "martlet",
        platform: "Vue",
        package: "@martlet/local",
        version: "0.1.0",
        state: "workspace",
      },
    ],
  };
  db.prepare("UPDATE components SET document=? WHERE id='button'").run(
    JSON.stringify(previous),
  );
  db.prepare(
    "UPDATE history SET snapshot=? WHERE id='button' AND revision=?",
  ).run(JSON.stringify(previous), previous.revision);
  if (options.collision) {
    const record = { ...custom, name: "Checkbox" };
    db.prepare("UPDATE components SET document=? WHERE id=?").run(
      JSON.stringify(record),
      custom.id,
    );
  }
  db.close();
  store = openRegistry(path);
  return {
    store,
    path,
    previous,
    custom,
    close: () => {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
