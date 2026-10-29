# Astro catalog experiment

This partial port builds 36 selected records and a catalog index using family-specific Astro Layouts and buttons with a contextual source-inspired shell. It draws content from the shared catalog and supports Markdown, cards, facts, tables, listings, figures, an interactive gallery, search, local form demonstrations, record workspaces and local messaging. The shell adds a masthead, breadcrumb, grouped footer, responsive menu and persisted appearance; Krigsvold uses aligned label/content regions. These translations do not establish visual parity with Jekyll.

Article author, date, subjects and context links, and event start/end, timezone, location and registration state are retained. Long listings progressively enhance to three items per page with keyboard controls and live status; without JavaScript and when printed, all records remain available. The event's table has a labelled scroll region, caption, and row and column headers.

The gallery retains the canonical image alt text and captions, offers a labelled modal with Escape and focus return, and leaves direct image links available without JavaScript. Assets are built from the shared fixture SVGs.

The observation and fleet workspaces support filtering, selection, local review and reset. The conversation specimen accepts messages as text in page memory and can reset; no messages are delivered. Without JavaScript the original records and messages remain visible and controls are disabled.

The contact, account and newsletter forms validate locally with invented values; they send, save and authenticate nothing. They remain disabled without JavaScript, and example passwords and verification codes are cleared on validation.

Markdown uses markdown-it with raw HTML disabled; local root-relative links and images respect the build base. This deliberately does not support the trusted HTML and MathML in the stress fixture. Unsupported section kinds fail the build rather than silently disappearing. Other interactive section and dashboard contracts remain to be implemented.

The catalog and search include all 50 fixture records; the 14 unported entries are labeled unavailable and are not links there, with intended paths retained as metadata. Other recipe pages still contain links to unported routes. The shell uses a fictional host identity and does not introduce an invented mark. Complete navigation, authentic source marks, matching source-shell details and full cross-framework visual review remain open for both families.

```sh
npm ci --ignore-scripts
NIGHTJAR_FAMILY=martlet npm run build
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ npm run build
# Install Playwright Chromium, or select an existing executable:
CHROMIUM_PATH=/usr/bin/chromium npm test
```

Each build selects only its own family shell, styles and fonts. Output is under `dist/<family>`. The test rebuilds both families for `/` and `/preview/`; it checks shared content and destinations, generated CSS isolation, loaded page assets and 320px overflow on all 36 records and the catalog index. It runs automated axe on fifteen representative pages plus the index per build, checks article/event metadata, table and image content, gallery keyboard open/close and focus return, pagination keyboard operation, print and no-JavaScript fallbacks, search query recovery, result safety, non-navigable unavailable labels, record selection/filter/review/reset, message validation and injection resistance, local form validation, reset, no-network behavior and sensitive field clearing, and checks Markdown escaping, unsafe links, and base-aware paths. It checks that destinations correspond to catalog records, not that all linked pages exist. Manual visual comparison, screen-reader checks, other browser engines, print on paper and wider viewport review remain open.
