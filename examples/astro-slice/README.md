# Astro catalog experiment

This experimental implementation builds all 50 catalog records and a catalog index using family-specific Astro Layouts and buttons with a contextual source-inspired shell. It draws content from the shared catalog and supports Markdown, cards, facts, tables, listings, figures, an interactive gallery, search, local form demonstrations, record workspaces, local messaging, simulated station controls, scene selection, native disclosures, plans and statistics. The shell adds a masthead, breadcrumb, grouped footer, responsive menu and persisted appearance; Krigsvold uses aligned label/content regions. These translations do not establish visual parity with Jekyll.

Article author, date, subjects and context links, and event start/end, timezone, location and registration state are retained. Long listings progressively enhance to three items per page with keyboard controls and live status; without JavaScript and when printed, all records remain available. The event's table has a labelled scroll region, caption, and row and column headers.

The gallery retains the canonical image alt text and captions, offers a labelled modal with Escape and focus return, and leaves direct image links available without JavaScript. Assets are built from the shared fixture SVGs.

The observation and fleet workspaces support filtering, selection, local review and reset. The conversation specimen accepts messages as text in page memory and can reset; no messages are delivered. Without JavaScript the original records and messages remain visible and controls are disabled.

The station and scene controls are illustrative and disabled without JavaScript; they do not connect to real devices. The report serves the shared example CSV. Recovery recipes are static example pages and do not configure HTTP error status or routing.

The contact, account and newsletter forms validate locally with invented values; they send, save and authenticate nothing. They remain disabled without JavaScript, and example passwords and verification codes are cleared on validation.

Markdown uses markdown-it and footnote parsing; local root-relative links and images respect the build base. Raw HTML remains disabled by default. Only the checked-in stress fixture enables raw markup, which is passed through a narrow HTML/MathML sanitizer before rendering; this fixture-specific option is not an ingestion policy for untrusted HTML. Code blocks are labelled and keyboard focusable, and footnote identifiers are scoped to their page section. Unsupported section kinds fail the build rather than silently disappearing. Multiple instances of the same simulation on one page are not supported. The three dashboard implementations reuse the shared synthetic fixture and framework-neutral behavior, with browser-local state; functional and visual parity remain subject to further review.

The catalog and search link all 50 fixture records. The dashboard workspace links all three applications. Set `NIGHTJAR_PEER_URL` to the absolute HTTP(S) base URL of the other family build to expose a cross-family comparison link; without it, no public host is assumed. Query state is retained when following that link. The shell uses a fictional host identity and does not introduce an invented mark. Complete navigation, authentic source marks, matching source-shell details and full cross-framework visual review remain open for both families.

```sh
# From the workbench root: install shared renderer dependencies
npm ci --ignore-scripts
cd examples/astro-slice
npm ci --ignore-scripts
NIGHTJAR_FAMILY=martlet npm run build
NIGHTJAR_FAMILY=krigsvold NIGHTJAR_BASE=/preview/ npm run build
# Install Playwright Chromium, or select an existing executable:
CHROMIUM_PATH=/usr/bin/chromium npm test
CHROMIUM_PATH=/usr/bin/chromium npm run test:navigation
CHROMIUM_PATH=/usr/bin/chromium npm run test:analytics
CHROMIUM_PATH=/usr/bin/chromium node test-administration.mjs
CHROMIUM_PATH=/usr/bin/chromium node test-operations.mjs
```

Each build selects only its own family shell, styles and fonts. Output is under `dist/<family>`. The test rebuilds both families for `/` and `/preview/`; it checks shared content and destinations, generated CSS isolation, loaded page assets and 320px overflow on the 47 non-dashboard records and the catalog index. Dedicated dashboard and navigation suites cover the other three routes. It runs automated axe on twenty-two representative pages plus the index per build, checks article/event metadata, table and image content, MathML and footnote navigation, keyboard-focusable code, malicious markup sanitization, gallery keyboard open/close and focus return, pagination keyboard operation, print and no-JavaScript fallbacks, search query recovery, result safety, non-navigable unavailable labels, station and scene keyboard/no-JavaScript states, native disclosure, CSV content, record selection/filter/review/reset, message validation and injection resistance, local form validation, reset, no-network behavior and sensitive field clearing, and checks Markdown escaping, unsafe links, and base-aware paths. The dashboard-navigation suite additionally requests each catalog route. Manual visual comparison, screen-reader checks, other browser engines, print on paper and wider viewport review remain open.
