# Astro catalog experiment

This is a partial port of the shared Northlight fixture, not an Astro implementation of the whole catalog. It builds 17 selected records using the published native `@martlet/astro` or `@krigsvold/astro` 1.2.2 layouts, headers, footers and action buttons. Content and destinations come directly from `../page-archetypes/content/catalog.json`; Markdown, cards, facts and short listings are supported. It uses reading layouts for document and dossier compositions and landing layouts for the other currently selected compositions. These are contextual translations, not evidence of visual parity with the Jekyll reference.

Markdown uses markdown-it with raw HTML disabled; local root-relative links and images respect the build base. This deliberately does not support the trusted HTML and MathML in the stress fixture. Listings with more than three records are excluded because Jekyll's interactive pagination has not yet been ported. Unsupported section kinds fail the build rather than silently disappearing. The catalog's two additional structured fields for articles and events and all interactive section and dashboard contracts remain to be implemented.

The sample deliberately retains catalog links to records not yet ported. **Some destinations therefore return 404 in this standalone slice.** Links to those records do not establish parity. The package headers are generic native Astro components and do not reproduce the origin masthead.

```sh
npm ci --ignore-scripts
NIGHTJAR_FAMILY=martlet npm run build
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ npm run build
# Install Playwright Chromium, or select an existing executable:
CHROMIUM_PATH=/usr/bin/chromium npm test
```

Each build selects only its own family shell, styles and fonts. Output is under `dist/<family>`. The test rebuilds both families for `/` and `/preview/`; it checks shared content and destinations, generated CSS isolation, loaded page assets and 320px overflow on all 17 pages. It runs automated axe on three representative pages per build, and checks Markdown escaping, unsafe links, and base-aware paths. It checks that destinations correspond to catalog records, not that all linked pages exist. Manual visual comparison, screen-reader checks, other browser engines, print and wider viewport review remain open. Astro components are static; no client hydration is required for these pages.
