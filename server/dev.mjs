import { createServer } from "vite";
import { openRegistry } from "./store.mjs";
import { createWorkbenchServer } from "./http.mjs";
import { root, databasePath, listen } from "./runtime.mjs";
const vite = await createServer({
  root,
  server: { middlewareMode: true, hmr: false },
  appType: "spa",
});
const store = openRegistry(databasePath);
listen(
  createWorkbenchServer({ store, middleware: vite.middlewares }),
  store,
  () => vite.close(),
);
