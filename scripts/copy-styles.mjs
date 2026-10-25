import { copyFileSync } from "node:fs";
const family = process.argv[2];
if (!["martlet", "krigsvold"].includes(family))
  throw new Error("Unknown family");
copyFileSync(
  new URL(`../packages/${family}-react/src/styles.css`, import.meta.url),
  new URL(`../packages/${family}-react/dist/styles.css`, import.meta.url),
);
