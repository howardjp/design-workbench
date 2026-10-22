import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
const directory = mkdtempSync(join(tmpdir(), "design-packages-"));
try {
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({
      name: "isolated-consumer",
      private: true,
      type: "module",
    }),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      "react@19.3.1",
      "react-dom@19.3.1",
      resolve("martlet-react-0.1.0.tgz"),
      resolve("krigsvold-react-0.1.0.tgz"),
    ],
    { cwd: directory, stdio: "pipe" },
  );
  for (const family of ["martlet", "krigsvold"]) {
    const packagePath = join(directory, "node_modules", `@${family}`, "react");
    if (
      !existsSync(join(packagePath, "dist/styles.css")) ||
      !existsSync(join(packagePath, "dist/index.d.ts")) ||
      existsSync(join(packagePath, "dist/src"))
    )
      throw new Error(`Invalid ${family} package contents`);
  }
  writeFileSync(
    join(directory, "consumer.mjs"),
    `import {createElement as h} from 'react';import {renderToStaticMarkup} from 'react-dom/server';import * as Martlet from '@martlet/react';import * as Krigsvold from '@krigsvold/react';for(const UI of [Martlet,Krigsvold]){if(Object.keys(UI).length!==13)throw new Error('Missing component exports');const html=renderToStaticMarkup(h(UI.Field,{label:'Name'},props=>h(UI.TextInput,{...props,name:'name'})));if(!html.includes('name="name"'))throw new Error('Consumer render failed');}console.log('Both packed packages installed and rendered outside the workspace.');`,
  );
  execFileSync(process.execPath, ["consumer.mjs"], {
    cwd: directory,
    stdio: "inherit",
  });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
