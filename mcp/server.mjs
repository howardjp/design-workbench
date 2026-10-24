import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { readFile } from "node:fs/promises";

export function createLanguageServer(catalog) {
  if (
    !["martlet", "krigsvold"].includes(catalog.family) ||
    catalog.schemaVersion !== 1
  )
    throw new Error("Invalid language catalogue");
  const server = new McpServer({
    name: `${catalog.family}-design-language`,
    version: catalog.version,
  });
  const entries = new Map(catalog.entries.map((e) => [e.id, e]));
  const annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };
  const reply = (value) => ({
    content: [{ type: "text", text: JSON.stringify(value) }],
    structuredContent: value,
  });
  const provenance = {
    family: catalog.family,
    version: catalog.version,
    themeVersion: catalog.themeVersion,
    sourceCommit: catalog.sourceCommit,
    sourceDigest: catalog.sourceDigest,
  };
  server.registerTool(
    "get_manifest",
    {
      description:
        "Identify this design language, exact snapshot provenance, supported platform and available references. Start here; missing capabilities are not implied.",
      annotations,
    },
    async () =>
      reply({
        ...provenance,
        platforms: catalog.platforms,
        canonicalGuidance: catalog.canonicalGuidance,
        limitations: catalog.limitations,
        references: catalog.entries.map(({ content, ...metadata }) => metadata),
      }),
  );
  server.registerTool(
    "search_guidance",
    {
      description: `Search ${catalog.family} grammar, task patterns, actual component contracts, verified examples, tokens and charter. Results include source/version and maturity. Retrieve exact references before composing UI.`,
      inputSchema: z.object({
        query: z.string().trim().min(1).max(300),
        kind: z
          .enum([
            "grammar",
            "pattern",
            "component",
            "example",
            "tokens",
            "charter",
            "asset",
            "compatibility",
          ])
          .optional(),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      annotations,
    },
    async ({ query, kind, limit }) => {
      const words = [
        ...new Set(
          query
            .toLowerCase()
            .split(/[^\p{L}\p{N}]+/u)
            .filter((w) => w.length > 1),
        ),
      ];
      const results = catalog.entries
        .filter((e) => !kind || e.kind === kind)
        .map((e) => {
          const title = `${e.title} ${e.tags.join(" ")}`.toLowerCase();
          const body = e.content.toLowerCase();
          const score = words.reduce(
            (v, w) =>
              v + (title.includes(w) ? 5 : 0) + (body.includes(w) ? 1 : 0),
            0,
          );
          const position =
            words
              .map((w) => body.indexOf(w))
              .filter((p) => p >= 0)
              .sort((a, b) => a - b)[0] ?? 0;
          const { content, ...metadata } = e;
          return {
            ...metadata,
            score,
            excerpt: content.slice(
              Math.max(0, position - 100),
              Math.max(0, position - 100) + 650,
            ),
          };
        })
        .filter((e) => e.score > 0)
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
        .slice(0, limit);
      return reply({
        ...provenance,
        results,
        message: results.length
          ? "Retrieve matching IDs with get_reference for complete rules and examples."
          : "No matching guidance exists in this snapshot. Do not invent a component or substitute another language.",
      });
    },
  );
  server.registerTool(
    "get_reference",
    {
      description:
        "Retrieve a complete reference by its exact ID from search or the manifest. This snapshot does not silently fall back between versions, platforms, or languages.",
      inputSchema: z.object({
        id: z.string().min(1).max(160),
        version: z.string().max(80).optional(),
      }),
      annotations,
    },
    async ({ id, version }) => {
      if (version && version !== catalog.version)
        return {
          ...reply({
            ...provenance,
            error: "unsupported_version",
            requestedVersion: version,
            availableVersions: [catalog.version],
          }),
          isError: true,
        };
      const entry = entries.get(id);
      if (!entry)
        return {
          ...reply({
            ...provenance,
            error: "reference_not_available",
            requestedId: id,
            message:
              "Use the manifest or search to discover available references. No API or pattern is implied.",
          }),
          isError: true,
        };
      return reply({ ...provenance, ...entry });
    },
  );
  for (const entry of catalog.entries) {
    const uri = `${catalog.family}://reference/${encodeURIComponent(entry.id)}`;
    server.registerResource(
      entry.id,
      uri,
      { description: entry.title, mimeType: "application/json" },
      async () => ({
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify({ ...provenance, ...entry }),
          },
        ],
      }),
    );
  }
  return server;
}
export async function run(
  family,
  catalogue = new URL(`./catalogs/${family}.json`, import.meta.url),
) {
  const catalog = JSON.parse(await readFile(catalogue, "utf8"));
  if (catalog.family !== family) throw new Error("Family catalogue mismatch");
  await serveStdio(() => createLanguageServer(catalog));
}
