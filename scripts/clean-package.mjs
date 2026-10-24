import { rmSync } from "node:fs";
const family = process.argv[2];
if (!["martlet", "krigsvold"].includes(family))
  throw new Error("Unknown family");
rmSync(new URL(`../packages/${family}-react/dist/`, import.meta.url), {
  recursive: true,
  force: true,
});
