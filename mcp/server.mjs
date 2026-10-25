import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { readFile } from "node:fs/promises";
import { createLanguageServer } from "./language.mjs";
export { createLanguageServer } from "./language.mjs";

export async function run(
  family,
  catalogue = new URL(`./catalogs/${family}.json`, import.meta.url),
) {
  const catalog = JSON.parse(await readFile(catalogue, "utf8"));
  if (catalog.family !== family) throw new Error("Family catalogue mismatch");
  await serveStdio(() => createLanguageServer(catalog));
}
