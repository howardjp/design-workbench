import { resolve } from "node:path";
import { openRegistry } from "./store.mjs";
import { createWorkbenchServer } from "./http.mjs";
import { root, databasePath, listen } from "./runtime.mjs";
const store = openRegistry(databasePath);
listen(createWorkbenchServer({ store, dist: resolve(root, "dist") }), store);
