import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
const selected = process.argv[2] ?? "both";
if (!["martlet", "krigsvold", "both"].includes(selected))
  throw new Error("Choose martlet, krigsvold or both");
const commit = process.env.GITHUB_SHA ?? process.argv[3];
if (!commit || !/^[a-f0-9]{40}$/.test(commit))
  throw new Error(
    "Supply GITHUB_SHA or a full verified source commit as the second argument",
  );
const directory = resolve("release-candidates");
await mkdir(directory, { recursive: true });
const candidates = [];
for (const family of selected === "both"
  ? ["martlet", "krigsvold"]
  : [selected]) {
  const pkg = JSON.parse(
    await readFile(`packages/${family}-react/package.json`, "utf8"),
  );
  if (
    !/^0\./.test(pkg.version) ||
    pkg.private !== false ||
    pkg.publishConfig?.tag !== "next" ||
    pkg.publishConfig?.access !== "public" ||
    pkg.publishConfig?.provenance !== true
  )
    throw new Error(
      "Candidates must be release-enabled experimental next-tag packages with public/provenance release configuration",
    );
  const result = spawnSync(
    "npm",
    [
      "pack",
      "--workspace",
      pkg.name,
      "--json",
      "--pack-destination",
      directory,
    ],
    { encoding: "utf8" },
  );
  if (result.status) throw new Error(result.stderr);
  const [packed] = JSON.parse(result.stdout);
  for (const file of [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/styles.css",
    "LICENSE",
    "NOTICE.md",
    "README.md",
    "CHANGELOG.md",
  ])
    if (!packed.files.some((item) => item.path === file))
      throw new Error(`Missing ${file}`);
  const path = resolve(directory, packed.filename);
  const data = await readFile(path);
  candidates.push({
    name: pkg.name,
    version: pkg.version,
    tag: "next",
    sourceCommit: commit,
    tarball: packed.filename,
    sha256: createHash("sha256").update(data).digest("hex"),
    bytes: (await stat(path)).size,
    integrity: packed.integrity,
    files: packed.files.map((f) => f.path),
    publication: "unpublished candidate; publication is a separate workflow",
    remaining: [
      "Review exact-commit CI and manual consumer evidence",
      "Confirm npm scope ownership and trusted publisher",
      "Publish reviewed tarball with provenance under next; verify registry install",
    ],
  });
}
await writeFile(
  resolve(directory, "manifest.json"),
  JSON.stringify(
    { schemaVersion: 1, repository: "k3jph/design-workbench", candidates },
    null,
    2,
  ) + "\n",
);
console.log(
  `Prepared ${candidates.length} unpublished candidate(s) in ${directory}`,
);
