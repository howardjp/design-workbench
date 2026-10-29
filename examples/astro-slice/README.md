# Astro catalog experiment

This is a partial port of the shared Northlight fixture, not an Astro implementation of the whole catalog. It builds 21 selected records using the published native `@martlet/astro` or `@krigsvold/astro` 1.2.2 layouts, headers, footers and action buttons. Content and destinations come directly from `../page-archetypes/content/catalog.json`; Markdown, cards, facts, tables and listings are supported. It uses reading layouts for document, reading and dossier compositions and landing layouts for the other currently selected compositions. These are contextual translations, not evidence of visual parity with the Jekyll reference.

Article author, date, subjects and context links, and event start/end, timezone, location and registration state are retained. Long listings progressively enhance to three items per page with keyboard controls and live status; without JavaScript and when printed, all records remain available. The event's table has a labelled scroll region, caption, and row and column headers.

Markdown uses markdown-it with raw HTML disabled; local root-relative links and images respect the build base. This deliberately does not support the trusted HTML and MathML in the stress fixture. Unsupported section kinds fail the build rather than silently disappearing. Interactive section and dashboard contracts remain to be implemented.

The sample deliberately retains catalog links to records not yet ported. **Some destinations therefore return 404 in this standalone slice.** The currently linked unported destinations are collection-item, contact, FAQ, gallery, integrations, place, pricing, reference, report, sensors and workspace. Links to those records do not establish parity. The package headers are generic native Astro components and do not reproduce the origin masthead. Independent review found that Krigsvold's about page is also missing the source mark, navy footer, breadcrumb, appearance toggle and aligned label/content composition. Shell integration and visual review are needed for both families before claiming visual parity.

```sh
npm ci --ignore-scripts
NIGHTJAR_FAMILY=martlet npm run build
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ npm run build
# Install Playwright Chromium, or select an existing executable:
CHROMIUM_PATH=/usr/bin/chromium npm test
```

Each build selects only its own family shell, styles and fonts. Output is under `dist/<family>`. The test rebuilds both families for `/` and `/preview/`; it checks shared content and destinations, generated CSS isolation, loaded page assets and 320px overflow on all 21 pages. It runs automated axe on six representative pages per build, checks article/event metadata, table content, pagination keyboard operation, print and no-JavaScript fallbacks, and checks Markdown escaping, unsafe links, and base-aware paths. It checks that destinations correspond to catalog records, not that all linked pages exist. Manual visual comparison, screen-reader checks, other browser engines, print on paper and wider viewport review remain open.
