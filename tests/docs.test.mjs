import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, mkdir, rm, readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve, join } from "node:path";
import { transformSync } from "rolldown/utils";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const contracts = JSON.parse(
  await readFile("docs-app/src/contracts.json", "utf8"),
);
await mkdir(resolve("test-results"), { recursive: true });
function compile(source, name) {
  const r = transformSync(name + ".tsx", source, {
    lang: "tsx",
    jsx: { runtime: "automatic" },
    target: "es2022",
  });
  assert.deepEqual(r.errors, [], name);
  return r.code;
}
for (const family of ["martlet", "krigsvold"]) {
  test(`${family} documentation covers the actual exports and every copied example compiles and renders`, async () => {
    const dir = await mkdtemp(resolve("test-results/docs-"));
    try {
      const exports = await import(`@${family}/react`);
      assert.deepEqual(
        contracts.map((c) => c.name).sort(),
        Object.keys(exports).sort(),
      );
      const source = (
        await readFile("docs-app/src/examples.tsx", "utf8")
      ).replace(/(['"])docs-family\1/g, JSON.stringify(`@${family}/react`));
      await writeFile(join(dir, "examples.mjs"), compile(source, "examples"));
      const { Example, exampleCode, defaults } = await import(
        pathToFileURL(join(dir, "examples.mjs"))
      );
      let i = 0;
      for (const contract of contracts) {
        assert.ok(contract.api.length > 30 && contract.behavior.length > 40);
        for (const options of [
          defaults,
          {
            ...defaults,
            text: 'A "quoted" <title> & {braces}\nSecond line',
            disabled: true,
            invalid: true,
            vertical: true,
            kind: "error",
            variant: "quiet",
          },
        ]) {
          assert.ok(
            renderToStaticMarkup(
              React.createElement(Example, { name: contract.name, options }),
            ).length > 0,
          );
          const copied = exampleCode(contract.name, options, family).replace(
            /^import '@[^']+\.css';\n/gm,
            "",
          );
          const path = join(dir, `copy-${i++}.mjs`);
          await writeFile(path, compile(copied, contract.name));
          const module = await import(pathToFileURL(path));
          const html = renderToStaticMarkup(
            React.createElement(module.default),
          );
          assert.ok(html.includes(`data-${family}="light"`));
        }
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  test(`${family} deployment contains only its selected component styles, fonts and no workbench service`, async () => {
    const other = family === "martlet" ? "krigsvold" : "martlet";
    const dir = `docs-dist/${family}/assets`;
    const files = await readdir(dir);
    const css = (
      await Promise.all(
        files
          .filter((f) => f.endsWith(".css"))
          .map((f) => readFile(join(dir, f), "utf8")),
      )
    ).join("");
    const js = (
      await Promise.all(
        files
          .filter((f) => f.endsWith(".js"))
          .map((f) => readFile(join(dir, f), "utf8")),
      )
    ).join("");
    assert.ok(css.includes(`.${family}-button`));
    assert.ok(!css.includes(`.${other}-button`));
    assert.ok(!css.includes(`--${other}-`));
    assert.ok(
      !files.some((f) =>
        family === "martlet"
          ? f.startsWith("roboto")
          : /^(cambo|cinzel|lato|ibm-plex)/.test(f),
      ),
    );
    assert.ok(!js.includes("/api/components"));
    assert.ok(!js.includes("node:sqlite"));
    assert.ok(!js.includes(`@${other}/react`));
  });
}
