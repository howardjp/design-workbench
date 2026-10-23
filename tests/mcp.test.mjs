import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { resolve } from "node:path";
for (const family of ["martlet", "krigsvold"])
  test(
    `${family} MCP negotiates, retrieves sources, isolates family and handles unsupported requests`,
    { timeout: 20000 },
    async () => {
      const client = new Client({
        name: "language-verification",
        version: "1.0.0",
      });
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [resolve(`mcp/${family}.mjs`)],
        stderr: "pipe",
      });
      let stderr = "";
      transport.stderr?.on("data", (chunk) => {
        stderr += chunk;
      });
      try {
        await client.connect(transport);
        const tools = await client.listTools();
        assert.deepEqual(tools.tools.map((t) => t.name).sort(), [
          "get_manifest",
          "get_reference",
          "search_guidance",
        ]);
        assert.ok(tools.tools.every((t) => t.annotations.readOnlyHint));
        const call = async (name, args = {}) => {
          const raw = await client.callTool({ name, arguments: args });
          return {
            raw,
            value: JSON.parse(raw.content.find((c) => c.type === "text").text),
          };
        };
        const manifest = (await call("get_manifest")).value;
        assert.equal(manifest.family, family);
        assert.equal(manifest.references.length, 52);
        assert.equal(manifest.platforms.React.published, false);
        assert.ok(manifest.sourceDigest.length === 64);
        const found = (
          await call("search_guidance", {
            query: "Cardfile collection editor recovery",
          })
        ).value;
        assert.equal(found.results[0].id, "pattern:collection-editor");
        const grammar = (await call("get_reference", { id: "grammar" })).value;
        assert.equal(grammar.family, family);
        assert.equal(
          createHash("sha256").update(grammar.content).digest("hex"),
          grammar.contentSha256,
        );
        assert.ok(grammar.content.includes(`--${family}-field-gap`));
        const example = (await call("get_reference", { id: "example:Field" }))
          .value;
        assert.ok(example.content.includes(`@${family}/react`));
        assert.ok(
          !example.content.includes(
            `@${family === "martlet" ? "krigsvold" : "martlet"}/react`,
          ),
        );
        const unsupported = await call("get_reference", {
          id: "grammar",
          version: "99.0.0",
        });
        assert.equal(unsupported.raw.isError, true);
        assert.equal(unsupported.value.error, "unsupported_version");
        const absent = await call("get_reference", {
          id: "../../server/database",
        });
        assert.equal(absent.raw.isError, true);
        assert.equal(absent.value.error, "reference_not_available");
        const invalid = await client.callTool({
          name: "search_guidance",
          arguments: { query: "x", limit: 999 },
        });
        assert.equal(invalid.isError, true);
        const noMatch = (
          await call("search_guidance", { query: "zzzznonexistentterm" })
        ).value;
        assert.equal(noMatch.results.length, 0);
        const resources = await client.listResources();
        assert.equal(resources.resources.length, 52);
        const resource = resources.resources.find((r) => r.name === "grammar");
        const exact = await client.readResource({ uri: resource.uri });
        assert.equal(
          JSON.parse(exact.contents[0].text).content,
          grammar.content,
        );
      } finally {
        await client.close();
      }
      assert.equal(stderr, "");
    },
  );
