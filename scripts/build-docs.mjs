import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const contracts = (await readFile("docs/components.md", "utf8"))
  .split("## Administration compositions")[0]
  .split("\n")
  .filter((line) => /^\| [A-Z]/.test(line) && !line.startsWith("| Export"))
  .map((line) => {
    const [name, api, behavior] = line.slice(2, -2).split(" | ");
    return { name, api, behavior };
  });
if (contracts.length !== 22 || contracts.some((item) => !item.behavior))
  throw new Error("Expected all 22 component contracts");
await mkdir("docs-app/src", { recursive: true });
await writeFile(
  "docs-app/src/contracts.json",
  JSON.stringify(contracts, null, 2) + "\n",
);
for (const family of ["martlet", "krigsvold"]) {
  const result = spawnSync(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "build",
      "--config",
      "docs-app/vite.config.ts",
      "--mode",
      family,
    ],
    { stdio: "inherit" },
  );
  if (result.status) process.exit(result.status ?? 1);
  await mkdir(`docs-dist/${family}/agents`, { recursive: true });
  await cp(`agent-dist/${family}-builder.zip`, `docs-dist/${family}/agents/${family}-builder.zip`);
  await cp(
    `agent-dist/${family}-agent-tools.tar.gz`,
    `docs-dist/${family}/agents/${family}-agent-tools.tar.gz`,
  );
}
