# React catalog: partial paired implementation

This experimental workbench example uses the existing `@martlet/react` and `@krigsvold/react` workspace packages and the shared `page-archetypes/content/catalog.json`. It prerenders 41 selected catalog records for each family, then hydrates React-controlled archive pagination. Both families use their own `AppShell`, `Article`, `DefinitionList`, `DataTable`, `Disclosure` and `Pagination` components and theme 2.1.0. Build-time family selection keeps the other family's CSS and fonts out of the build.

Run from the workbench root with Node 24 and the locked dependencies. The shared framework-neutral Markdown renderer uses the workbench's locked parser dependencies; it is executed during build, not bundled into the React client.

```sh
npm ci --ignore-scripts
npm run build --workspaces
NIGHTJAR_FAMILY=martlet node examples/react-catalog/build.mjs
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ node examples/react-catalog/build.mjs
CHROMIUM_PATH=/usr/bin/chromium node examples/react-catalog/test.mjs
npx tsc --ignoreConfig --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2022 --types vite/client,node --resolveJsonModule --skipLibCheck --strict examples/react-catalog/src/*.tsx examples/react-catalog/src/*.ts
```

The build emits real route HTML at `dist/<family>/examples/<id>/`; no server-side SPA fallback is needed for these routes. HTML is present with JavaScript disabled. Archive pagination progressively enhances after hydration: without JavaScript or in print, every record is visible. Navigating to the first or last page restores focus to the available button. Structured destinations, Markdown links and fixture SVGs are base-aware; the build rejects unsupported section kinds rather than silently dropping them. Article author, date and subjects, and event start/end, timezone, location and registration state are retained. Tables use the native family DataTable with a named scrolling region and semantic headers; figures retain the fixture's alt text and captions. The build compiles checked-in Markdown with raw HTML disabled except for the stress fixture, where the shared renderer applies a narrow HTML/MathML allowlist. This is not an untrusted-content ingestion API; no general HTML sanitization claim is made. The report CSV is copied from the shared fixture.

The Chromium test covers both families at `/` and `/preview/`, every implemented route's titles, section headings, structured links, figures and tables, CSS isolation, resource loading, 320px overflow, representative 1440px overflow and automated axe checks, keyboard pagination and focus recovery, reload, print and no-JavaScript visibility. It also exercises Markdown structure and allowlist safety, article metadata, event context, native disclosures, search, local form validation and sensitive-field clearing. Search and form controls are disabled before hydration, so no-JavaScript output cannot accidentally submit values.

**This is not full parity.** Nine records—including all three dashboards, gallery, workspace, chat and simulations—remain unported. Catalog links to those pages lead to 404 in this standalone build. The recovery pages illustrate content but do not configure actual HTTP error status. The generic AppShell is an application frame, not the original source masthead, footer or mobile navigation, and visual parity with Jekyll or Astro is not established. Family-specific non-landing compositions, dark mode, internationalization, screen-reader and cross-browser testing remain open. The React packages and layout translation remain experimental. Do not deploy this incomplete slice as a complete example site.
