import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const root = fileURLToPath(new URL("../", import.meta.url));
export const databasePath =
  process.env.REGISTRY_DB === ":memory:"
    ? ":memory:"
    : resolve(process.env.REGISTRY_DB ?? resolve(root, "var/registry.sqlite"));
export const port = Number(process.env.PORT ?? 4173);
if (!Number.isInteger(port) || port < 0 || port > 65535)
  throw new Error("PORT must be an integer between 0 and 65535.");
export function listen(server, store, extraClose = () => {}) {
  server.listen(port, "127.0.0.1", () =>
    console.log(
      `Design workbench: http://127.0.0.1:${server.address().port}/martlet/\nDatabase: ${databasePath}`,
    ),
  );
  for (const signal of ["SIGTERM", "SIGINT"])
    process.once(signal, () =>
      server.close(async () => {
        store.close();
        await extraClose();
        process.exit(0);
      }),
    );
}
