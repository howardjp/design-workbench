# Astro catalog experiment

This partial port builds 22 selected records and a catalog index using family-specific Astro Layouts and buttons with a contextual source-inspired shell. It draws content from the shared catalog and supports Markdown, cards, facts, tables, listings and search. The shell adds a masthead, breadcrumb, grouped footer, responsive menu and persisted appearance; Krigsvold uses aligned label/content regions. These translations do not establish visual parity with Jekyll.

Article author, date, subjects and context links, and event start/end, timezone, location and registration state are retained. Long listings progressively enhance to three items per page with keyboard controls and live status; without JavaScript and when printed, all records remain available. The event's table has a labelled scroll region, caption, and row and column headers.

Markdown uses markdown-it with raw HTML disabled; local root-relative links and images respect the build base. This deliberately does not support the trusted HTML and MathML in the stress fixture. Unsupported section kinds fail the build rather than silently disappearing. Other interactive section and dashboard contracts remain to be implemented.

Some catalog destinations are not yet ported and return 404 in this standalone slice; the index and search label the 28 unavailable entries. The shell uses a fictional host identity and does not introduce an invented mark. Complete navigation, authentic source marks, matching source-shell details and full cross-framework visual review remain open for both families.

```sh
npm ci --ignore-scripts
NIGHTJAR_FAMILY=martlet npm run build
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ npm run build
# Install Playwright Chromium, or select an existing executable:
CHROMIUM_PATH=/usr/bin/chromium npm test
```

Each build selects only its own family shell, styles and fonts. Output is under `dist/<family>`. The test rebuilds both families for `/` and `/preview/`; it checks shared content and destinations, generated CSS isolation, loaded page assets and 320px overflow on all 22 records and the catalog index. It runs automated axe on seven representative pages plus the index per build, checks article/event metadata, table content, pagination keyboard operation, print and no-JavaScript fallbacks, search query recovery, result safety and unavailable labels, and checks Markdown escaping, unsafe links, and base-aware paths. It checks that destinations correspond to catalog records, not that all linked pages exist. Manual visual comparison, screen-reader checks, other browser engines, print on paper and wider viewport review remain open.
