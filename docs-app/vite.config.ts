import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig(({ mode }) => {
  if (!["martlet", "krigsvold"].includes(mode))
    throw new Error("Choose a documentation family");
  const name = mode === "martlet" ? "Martlet" : "Krigsvold";
  return {
    root: fileURLToPath(new URL(".", import.meta.url)),
    plugins: [
      {
        name: "selected-family",
        resolveId: (id) => (id === "docs-family" ? "\0docs-family" : undefined),
        load: (id) =>
          id === "\0docs-family"
            ? `export * from '@${mode}/react'; import '@${mode}/react/styles.css'; import '@${mode}/theme/fonts.css'; export const family = '${mode}'; export const familyName = '${name}';`
            : undefined,
      },
      {
        name: "family-title",
        transformIndexHtml: (html) =>
          html.replace(
            "<title>React reference</title>",
            `<title>${name} React · Component reference</title>`,
          ),
      },
    ],
    build: {
      target: "es2022",
      outDir: fileURLToPath(new URL(`../docs-dist/${mode}`, import.meta.url)),
      emptyOutDir: true,
    },
  };
});
