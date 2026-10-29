# React catalog: first paired implementation

This experimental workbench example uses the existing `@martlet/react` and `@krigsvold/react` workspace packages and the shared `page-archetypes/content/catalog.json`. It prerenders 14 selected catalog records for each family, then hydrates genuine React-controlled archive pagination. Both families use their own `AppShell`, `Article`, `DefinitionList` and `Pagination` components and theme 2.1.0. Build-time family selection keeps the other family's CSS and fonts out of the build.

Run from the workbench root with Node 24 and its locked dependencies:

```sh
npm ci --ignore-scripts
npm run build --workspaces
NIGHTJAR_FAMILY=martlet node examples/react-catalog/build.mjs
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ node examples/react-catalog/build.mjs
CHROMIUM_PATH=/usr/bin/chromium node examples/react-catalog/test.mjs
npx tsc --ignoreConfig --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2022 --types vite/client,node --resolveJsonModule --skipLibCheck --strict examples/react-catalog/src/*.tsx examples/react-catalog/src/*.ts
```

The build emits real route HTML at `dist/<family>/examples/<id>/`; no server-side SPA fallback is needed for these routes. HTML is present with JavaScript disabled. Archive pagination progressively enhances after hydration: without JavaScript or in print, every record is visible. Navigating to the first or last page restores focus to the available button. Structured destinations are base-aware, and the build rejects unsupported section kinds and Markdown in the selected records instead of dropping content silently. Tests cover both families at `/` and `/preview/`, all implemented route titles, sections and catalog destinations, CSS isolation, resource loading, 320px overflow, representative 1440px overflow and automated axe checks, keyboard pagination and focus recovery, reload, print and no-JavaScript visibility.

**This is not full parity.** Thirty-six records—including all three dashboards, article/event-specific content, Markdown, forms, search, gallery, workspace, chat and simulations—remain unported. Catalog links to those pages lead to 404 in this standalone build. The generic AppShell is an application frame, not the original source masthead, footer or mobile navigation, and visual parity with Jekyll or Astro is not established. Family-specific non-landing compositions, dark mode, internationalization, screen-reader and cross-browser testing remain open. The React packages and layout translation remain experimental. Do not deploy this incomplete slice as a complete example site.
