# Astro catalog experiment

This is a first, partial port of the shared Northlight fixture, not an Astro implementation of the whole catalog. It builds the `home` and `about` recipes with the published native `@martlet/astro` or `@krigsvold/astro` 1.2.2 layouts, headers and footers. Content and destinations come directly from `../page-archetypes/content/catalog.json`; only plain prose and cards are implemented, and the build rejects unsupported section kinds or Markdown in the body. This constraint prevents silently dropping new content; a complete adapter must implement the catalog's Markdown and other section contracts.

The sample deliberately retains catalog links to records not yet ported. **Those destinations will return 404 in this standalone slice.** Only home and about can be navigated here; linking to the remaining fixture pages does not establish their Astro parity. The package headers are generic native Astro components and do not reproduce the origin masthead; this is not a claim of visual parity with the Jekyll reference.

```sh
npm ci --ignore-scripts
NIGHTJAR_FAMILY=martlet npm run build
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ npm run build
# Install Playwright Chromium, or select an existing executable:
CHROMIUM_PATH=/usr/bin/chromium npm test
```

Each build selects only its own family shell, styles and fonts. Output is under `dist/<family>`. The test rebuilds both families for `/` and `/preview/`; it checks shared content and destinations, generated CSS isolation, loaded page assets, 320px overflow and automated axe results in Chromium. It checks that destinations correspond to catalog records, not that the 48 unported routes exist. Manual visual comparison, screen-reader checks, other browser engines, print and wider viewport review remain open. Astro components are static; no client hydration is required for these two pages.
