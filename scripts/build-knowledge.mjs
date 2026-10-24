import { readFile, writeFile, mkdir, cp, rm, mkdtemp } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { transformSync } from "rolldown/utils";
const guidanceCheck = spawnSync(process.execPath, ['scripts/sync-language.mjs', '--check'], {stdio:'inherit'});
if (guidanceCheck.status) throw new Error('Canonical guidance check failed');
const hash = (s) => createHash("sha256").update(s).digest("hex");
const commit = process.env.DESIGN_SOURCE_COMMIT ?? null;
if (commit !== null && !/^[a-f0-9]{40}$/.test(commit))
  throw new Error("DESIGN_SOURCE_COMMIT must be a full commit");
const repo = "https://github.com/howardjp/design-workbench";
const ref = commit ?? "work/registry-foundations";
const componentSource = await readFile("docs/components.md", "utf8");
const contracts = componentSource
  .split("## Administration compositions")[0]
  .split("\n")
  .filter((l) => /^\| [A-Z]/.test(l) && !l.startsWith("| Export"))
  .map((l) => {
    const [name, api, behavior] = l.slice(2, -2).split(" | ");
    return { name, api, behavior };
  });
await mkdir("mcp/catalogs", { recursive: true });
await mkdir("agent-dist", { recursive: true });
await mkdir("test-results", { recursive: true });
for (const family of ["martlet", "krigsvold"]) {
  const canonical = JSON.parse(await readFile(`docs/languages/${family}/canonical.json`, 'utf8'));
  const implementations = JSON.parse(await readFile(`docs/languages/${family}/implementation.json`, 'utf8'));
  const canonicalUrl = path => `https://github.com/${canonical.repository}/blob/${canonical.commit}/${path}`;
  const entries = [];
  function add(
    id,
    kind,
    title,
    content,
    path,
    tags = [],
    maturity = "experimental",
  ) {
    entries.push({
      id,
      kind,
      title,
      tags,
      maturity,
      source: /^(npm:|https:\/\/)/.test(path) ? path : `${repo}/blob/${ref}/${path}`,
      sourcePath: path,
      contentSha256: hash(content),
      content,
    });
  }
  const grammar = await readFile(`docs/languages/${family}/grammar.md`, "utf8");
  add(
    "grammar",
    "grammar",
    `${family} application grammar`,
    grammar,
    canonicalUrl('docs/grammar.md'),
    [
      "spacing",
      "density",
      "interaction",
      "hierarchy",
      "composition",
      "forms",
      "feedback",
    ],
  );
  add(
    "charter",
    "charter",
    `${family} adopted charter`,
    await readFile(`docs/languages/${family}/charter.md`, "utf8"),
    `docs/languages/${family}/charter.md`,
    ["principles", "language"],
    "adopted",
  );
  add(
    "decisions", "grammar", `${family} source decisions and application extensions`,
    await readFile(`docs/languages/${family}/decisions.md`, "utf8"),
    canonicalUrl('docs/source-decisions.md'),
    ["origin", "source", "typography", "navigation", "contents", "provenance"],
  );
  add(
    "pattern:collection-editor",
    "pattern",
    `${family} collection, reading and editing pattern`,
    grammar.slice(grammar.indexOf("## Working pattern:")),
    canonicalUrl('docs/grammar.md'),
    [
      "Cardfile",
      "notebook",
      "notes",
      "collection",
      "editor",
      "search",
      "filter",
      "save",
      "validation",
      "recovery",
      "undo",
      "draft",
    ],
  );
  const tmp = await mkdtemp(resolve("test-results/knowledge-"));
  try {
    const source = (
      await readFile("docs-app/src/examples.tsx", "utf8")
    ).replace(/(['"])docs-family\1/g, JSON.stringify(`@${family}/react`));
    const transformed = transformSync("examples.tsx", source, {
      lang: "tsx",
      jsx: { runtime: "automatic" },
      target: "es2022",
    });
    if (transformed.errors.length)
      throw new Error("Example compilation failed");
    const path = join(tmp, "examples.mjs");
    await writeFile(path, transformed.code);
    const { exampleCode, defaults } = await import(pathToFileURL(path));
    for (const c of contracts) {
      add(
        `component:${c.name}`,
        "component",
        `${c.name} API and behavior`,
        `${c.name}\n\n${c.api}\n\n${c.behavior}`,
        "docs/components.md",
        [c.name, "React", "API", "keyboard", "accessibility"],
      );
      add(
        `example:${c.name}`,
        "example",
        `${c.name} standalone React example`,
        exampleCode(c.name, defaults, family),
        "docs-app/src/examples.tsx",
        [c.name, "React", "code", "imports"],
      );
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
  for (const name of ["foundation", "layout", "tokens"])
    add(
      `tokens:${name}`,
      "tokens",
      `${family} theme 2.1.0 ${name}`,
      await readFile(`node_modules/@${family}/theme/dist/${name}.json`, "utf8"),
      `npm:@${family}/theme@2.1.0/${name}.json`,
      ["tokens", "colors", "typography", "spacing", "layout"],
      "published",
    );
  const provenance = JSON.parse(
    await readFile("docs-app/brand/provenance.json", "utf8"),
  )[family];
  add(
    "asset:mark",
    "asset",
    `${family} original system mark`,
    JSON.stringify(provenance, null, 2),
    "docs-app/brand/provenance.json",
    ["identity", "icon", "logo", "mark"],
    "source-original",
  );
  add(
    "compatibility",
    "compatibility",
    `${family} support and compatibility`,
    `React 0.1.0 is experimental and unpublished; React 19 and @${family}/theme 2.1.0. Theme 2.1.0 and Astro 1.1.0 are published. Core 2.2.0 and Astro 1.2.0 are unreleased consolidation candidates; new Astro contents/footer contracts require the paired candidate packages. This server supplies React examples only. Do not translate React event or focus props into Astro APIs. Canonical migration guide: ${canonicalUrl('docs/consolidation.md')}. Vue, Svelte, native, and web-component APIs are not implemented here. The collection specimen is fictional and session-only. Manual assistive technology, localization, RTL, and sustained use remain open.\n\n${JSON.stringify(implementations, null, 2)}`,
    "docs/maturity.md",
    ["platform", "version", "support", "migration"],
  );
  const sourceDigest = hash(
    entries.map((e) => `${e.id}:${e.contentSha256}`).join("\n"),
  );
  const catalog = {
    schemaVersion: 1,
    family,
    version: "0.1.0",
    themeVersion: "2.1.0",
    sourceCommit: commit,
    sourceDigest,
    platforms: {
      React: { version: "0.1.0", maturity: "experimental", published: false },
      Astro: { version: "1.2.0", maturity: "experimental", published: false, examples: false, core: "^2.2.0" },
    },
    canonicalGuidance: canonical,
    limitations: [
      "Local stdio only; no hosted MCP endpoint.",
      "Search and exact retrieval; no code audit or migration automation.",
      "Pattern coverage starts with a collection/editor.",
      "No registry database, user drafts, or write operations.",
    ],
    entries,
  };
  await writeFile(
    `mcp/catalogs/${family}.json`,
    JSON.stringify(catalog, null, 2) + "\n",
  );
  const dir = `agent-dist/${family}`;
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await cp("mcp/server.mjs", `${dir}/server.mjs`);
  await cp(`mcp/catalogs/${family}.json`, `${dir}/catalog.json`);
  await writeFile(
    `${dir}/index.mjs`,
    `import { run } from './server.mjs';\nawait run('${family}',new URL('./catalog.json',import.meta.url));\n`,
  );
  await cp(`skills/${family}-builder`, `${dir}/${family}-builder`, {
    recursive: true,
  });
  await cp("LICENSE", `${dir}/LICENSE`);
  await writeFile(
    `${dir}/package.json`,
    JSON.stringify(
      {
        name: `${family}-design-language-mcp`,
        version: "0.1.0",
        private: true,
        type: "module",
        license: "MIT",
        engines: { node: ">=24.19.0 <25" },
        dependencies: { "@modelcontextprotocol/server": "2.3.1", zod: "4.3.6" },
      },
      null,
      2,
    ) + "\n",
  );
  const lock = JSON.parse(await readFile("mcp/agent-lock.json", "utf8"));
  lock.name = `${family}-design-language-mcp`;
  lock.packages[""].name = lock.name;
  await writeFile(
    `${dir}/package-lock.json`,
    JSON.stringify(lock, null, 2) + "\n",
  );
  await writeFile(
    `${dir}/README.md`,
    `# ${family} agent tools\n\nExperimental MIT local stdio MCP and companion builder skill. Source ${repo}/tree/${ref}; content digest ${sourceDigest}.\n\nRun npm install --ignore-scripts in this directory, then configure a stdio MCP client with command node and args [\"/absolute/path/to/index.mjs\"]. The client starts the process. The server exposes get_manifest, search_guidance, get_reference, and exact resources. Confirm the family using get_manifest.\n\nCopy ${family}-builder into your client's supported skills directory. No hosted endpoint, npm publication, static audit, or production-accessibility certification is claimed. This archive includes no workbench server or database.\n`,
  );
  const packed = spawnSync("tar", [
    "-czf",
    resolve(`agent-dist/${family}-agent-tools.tar.gz`),
    "-C",
    resolve("agent-dist"),
    family,
  ]);
  if (packed.status) throw new Error("Agent archive failed");
  console.log(
    `${family}: ${entries.length} references, ${sourceDigest.slice(0, 12)}`,
  );
}
