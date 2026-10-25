import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
for (const family of ["martlet", "krigsvold"]) {
  const tmp = await mkdtemp(join(tmpdir(), "language-consumer-"));
  try {
    const unpack = spawnSync("tar", [
      "-xzf",
      resolve(`agent-dist/${family}-agent-tools.tar.gz`),
      "-C",
      tmp,
    ]);
    if (unpack.status) throw Error("Unpack failed");
    const cwd = join(tmp, family);
    const install = spawnSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--fetch-retries=0", "--fetch-timeout=20000"], {
      cwd,
      encoding: "utf8",
    });
    if (install.status) throw Error(install.stderr);
    const pkg = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
    assert.ok(
      !Object.keys(pkg.dependencies).some(
        (n) => n.includes("react") || n.includes(family),
      ),
    );
    const client = new Client({
      name: "independent-artifact-consumer",
      version: "1.0.0",
    });
    try {
      await client.connect(
        new StdioClientTransport({
          command: process.execPath,
          args: [join(cwd, "index.mjs")],
        }),
      );
      const raw = await client.callTool({
        name: "get_manifest",
        arguments: {},
      });
      const manifest = JSON.parse(raw.content[0].text);
      assert.equal(manifest.family, family);
      assert.equal(manifest.references.length, 57);
    } finally {
      await client.close();
    }
    console.log(
      `${family}: extracted archive installs and serves outside the workbench`,
    );
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
