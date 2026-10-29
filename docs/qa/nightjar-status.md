# Operation Nightjar progress ledger

## 2026-10-29 — baseline and continuation

This campaign builds on `feat/portable-page-archetypes` at `4935a11`. Work is isolated on local branch `nightjar/audit`; the existing branch has not been modified. Its catalog contains 50 matched recipes, including analytics, administration and operations dashboards for each family. The shared catalog, fixture, contracts, generator and Jekyll source live in `examples/page-archetypes`; the standalone Jekyll exports live in `examples/jekyll`.

### Repository and framework inventory

| Repository | Inspected main commit | Role / evidence |
| --- | --- | --- |
| `k3jph/design-workbench` | `aafd9a8` | Experimental React packages and reference apps; feature branch contains the canonical portable catalog and Jekyll examples. |
| `martlettheme/martlettheme` | `b588542` | Martlet source site; existing `work/application-ports` branch preserved. |
| `krigsvoldtheme/krigsvoldtheme` | `fa4a66c` | Krigsvold source site; existing `work/application-ports` branch preserved. |
| `martlettheme/npm` | `0ee1de9` | Martlet core package, identified by source site as canonical. |
| `krigsvoldtheme/npm` | `5deb567` | Krigsvold core package, identified by source site as canonical. |
| `martlettheme/astro` | `ed1f121` | Astro package and starter; starter examples differ from the portable catalog. |
| `krigsvoldtheme/astro` | `af57afb` | Astro package and starter; starter examples differ from the portable catalog. |

The Astro starters include index, article, documentation, form and layouts examples, but they do not establish parity with this catalog. The workbench React reference apps demonstrate components and patterns but do not consume the catalog. Full Astro and React parity, including all dashboards, remains unimplemented and unverified. `examples/page-archetypes/PORTING.md` records the adapter boundaries; it is not evidence of implemented ports.

### Verified baseline

- `npm ci --ignore-scripts` succeeded.
- `npm run test:examples` passed: 50 recipes and their contracts, parity, destinations and shell hashes; shared dashboard data integrity; six dashboard model tests.
- `npm run check` passed, including builds and 110 Node tests.
- Regenerating the standalone Jekyll exports produced no tracked differences.
- Jekyll builds, browser, accessibility and visual checks remain to be reproduced in this environment. Ruby is absent from the base image; a user-local runtime is being built.

### Release and access boundaries

The npm and Astro package repositories have release-triggered publication workflows; the workbench also has release-triggered publishing and a manual candidate workflow. Do not trigger releases, publishing or deployment. Shell `gh auth status` reports the configured `GH_TOKEN` invalid; public clones work. The separate authenticated GitHub connector reports push permission for the seven repositories, but no write has been tested. Preserve local commits and use `git format-patch` for export if needed.

### Next actions

1. Build both locked Jekyll projects and run root/subpath link, dashboard browser, responsive and automated accessibility checks; record actual outcomes and fix confirmed defects.
2. Reconcile all recipe and dashboard capabilities against Astro and React, and implement ports using the shared contracts after the Jekyll baseline is stable.
3. Expand adversarial, accessibility, responsive, performance and component checks, documenting limitations and avoiding unreviewed visual baselines.

### Pagination recovery

The administration URL accepts a `page` parameter. A fractional value such as `?page=1.5` previously produced a fractional page label and sliced the wrong records. The shared collection model now accepts only safe integer pages, defaulting invalid values to page 1 while retaining normal bounds clamping. Both generated Jekyll exports were synchronized. The model regression test passes for fractional, non-finite and nonnumeric values; a paired browser regression has been added and awaits execution with the Jekyll builds.

### Parity scope

The shared catalog has eight composition frames and 16 section roles: prose, cards, listing, facts, table, form, FAQ, figure, plans, stats, gallery, search, workspace, chat, sensors and scene. Three dashboards use dedicated renderers and a common synthetic dataset. None of the corresponding 50 Astro or 50 React pages per language has been established as consuming this catalog; analogous starter/reference demonstrations do not constitute parity. Consequently build, functional, accessibility, responsive, visual and performance status for those ports is **unverified**, not passing. Start with paired Astro routes driven by the shared catalog after the Jekyll acceptance gates, preserving base paths, family shells and class semantics; expand section and interaction coverage rather than copying generated Jekyll HTML.

### Jekyll runtime and browser baseline

Ruby 3.2.3 and Bundler 2.4.19 were built without system privileges under `/workspace/nightjar/toolchains/ruby-3.2.3-install`; gems are installed in `/workspace/nightjar/toolchains/gems`. The locked dependencies installed with `BUNDLE_FROZEN=true`. For reuse, put that Ruby's `bin` on `PATH`, and set `BUNDLE_PATH` and `BUNDLE_FROZEN=true`.

Both Jekyll sites built at `/` and `/preview`. `verify-html.py` passed for each build: 57 HTML pages and 1,428 local destinations/fragments per site. The dashboard suite passed 47/47 using installed Chromium 151 with a temporary executable-path override, including the new paired malformed-page regression, interactions, 320/768/1100/1440px overflow/navigation checks, and axe WCAG-tagged checks in light and dark modes. The Playwright browser download was denied by network policy, so these results are specific to system Chromium. Automated checks do not establish complete accessibility conformance.

The 1440px analytics screenshots for both languages and the 320px Martlet analytics screenshot were inspected; both desktop compositions rendered distinctly, and the mobile view reflowed with a bounded table. This is a limited inspection, not a comprehensive visual regression comparison. Screenshots are ignored test artifacts; no visual baseline was approved.

The existing React reference browser suite passed 39/39 on system Chromium. Further registry browser checks are in progress.

The existing workbench registry browser suite also passed 178/178 using system Chromium on isolated port 4190; the React reference suite passed 39/39. These include automated axe and responsive checks and do not replace manual screen-reader testing.

### Operations filter drafts

Acknowledging an alert previously read unapplied monitoring controls and could silently change the active scope; an invalid pending threshold could leave a stale display after the underlying local state changed. Commit `dc759fe` re-renders acknowledgement against the last applied scope while preserving form drafts and the URL's applied state. The paired browser regression failed before the fix and passed after it. Both Jekyll dashboard fixtures rebuilt, `npm run test:examples` passed, and the full system-Chromium dashboard suite passed 49/49 in the independent fix worktree.

### Non-dashboard checks and contrast

A Chromium sweep visited 46 non-dashboard routes in each family at 320, 768 and 1440px (276 visits) without page-level horizontal overflow. Fourteen representative paired interaction cases passed, covering search, gallery focus, workspace, chat, sensors, scene and local sign-in validation. Two images initially appeared incomplete because they were lazy-loaded; both loaded after scrolling and decoding. Axe checks on 20 representative pages identified Krigsvold table-caption contrast failures: 4.49:1 in light and 3.97:1 in dark against 4.5:1. Commit `27dedee` uses the existing Krigsvold semantic text role for example captions. The targeted checks passed in both families and modes; the full dashboard suite in that worktree passed 51/51, `test:examples` passed, and the Krigsvold generated-site link check passed.

### Astro first slice

Commit `9fc7301` adds a private, standalone Astro proof of concept driven by the existing catalog for home and about in both families. It uses the published family-specific Astro shells and separates CSS/font bundles. Four Chromium build/browser combinations passed (both families at `/` and `/preview/`), checking content, destination mapping, assets, CSS isolation, 320px overflow and automated axe checks. This is partial: 48 recipes are unported, links to them return 404 within the slice, generic Astro headers have not established Jekyll visual parity, and most section kinds and Markdown remain unsupported. The slice deliberately rejects unsupported input and documents these limitations; it is not a release-ready example collection. Continue the adapter rather than counting these two pages as full parity.

### Responsive chart labels and combined verification

At 320px, the fixed 720-unit chart viewBox scaled 13px labels down to roughly 4–5px. Commit `5aa133c` sizes chart coordinates to the available plot width, redraws on resize, staggers compact category labels and retains exact-data disclosures. The 320px Martlet analytics screenshot was inspected in the fix worktree. After integration of pagination, operations, caption and chart changes, both dashboard sites rebuilt and the complete system-Chromium dashboard suite passed 55/55, including resize, both contrast modes and draft preservation. `npm run test:examples` also passed on the integrated branch. The initial Astro slice's four build/browser combinations were rerun successfully on the integrated branch.

### Astro adapter expansion

Commit `ad42b88` extends the Astro experiment to 17 selected catalog records per family, adding Markdown (raw HTML disabled), base-aware links and images, facts and short listings, with native family reading/landing layouts and buttons. Both families at root and `/preview/` passed the expanded build and Chromium suite in the independent worktree, including catalog content, destinations, loaded resources, CSS isolation and 320px reflow; axe ran on three representative pages per build. Thirteen distinct linked destinations remain unported, and long-list pagination, trusted HTML/MathML, article/event metadata semantics, interactive examples, dashboards and visual parity remain open. The partial app can still contain links to routes it does not implement; do not treat it as release-ready.

### Astro article, event and listing behavior

Commit `d9f9745` expands the experimental Astro adapter to 21 selected records per language. It adds article author/date/tags/context, event time/zone/registration information, responsive captioned tables and progressive pagination for longer listings. The independent suite passed for both families at root and subpath: content, destinations, assets, 320px overflow, keyboard pagination, no-JavaScript and print fallbacks, with axe on six representative pages per build. Eleven distinct linked destinations remain unported. A separate visual comparison of Krigsvold about found missing source masthead, mark, grouped footer, breadcrumb, appearance toggle and aligned label/content composition. These remain open visual gaps; no visual parity is claimed.

### Astro catalog and search

Commit `cab41d6` adds a browsable catalog and local search over all 50 shared records; 22 recipe pages are implemented in the experiment. Direct query restoration, bounded input, text-safe results, no-JavaScript catalog fallback and availability labels were tested in both families at root and subpaths, alongside existing pagination and representative axe checks. The remaining 28 records are labeled unavailable but currently still link to unimplemented routes; removing those broken navigation targets is outstanding. Source-shell fidelity and the other interaction contracts remain open.

### Astro shell increment

Commit `bf6ed24` adds contextual source-informed family shells with a masthead, breadcrumb, grouped footer, responsive keyboard navigation and persisted appearance; Krigsvold gains aligned section regions and a secondary-action outline. On its independent 21-page branch the suite passed for both families at root/subpath, including menu/Escape/focus, no-JavaScript navigation, appearance persistence, dark-mode axe and geometry checks. Krigsvold About was visually inspected at 320 and 1440px. Exact original shell/mark, complete navigation and footer, manual screen-reader review and other engines remain open. The shell and subsequent search increment were merged; combined validation is pending.

### Astro forms and merged shell verification

Commit `790aaaf` adds six local form demonstrations (contact, sign-in, sign-up, password reset, two-factor and newsletter), bringing the adapter to 28 recipes per language. Catalog/search entries for the 22 missing pages now show unavailable without a navigable link; other recipe links can still target missing routes. The form suite checks native invalid and valid inputs, local-only submission, reset, clearing password/code fields and disabled controls without JavaScript. After merging shell, search and forms, the combined suite passed for both families at `/` and `/preview/`, including those form checks, menu and appearance behavior, pagination, content/assets, 320px reflow and representative axe checks. Exact source-shell fidelity and full parity remain unverified.

### Astro gallery and figures

Commit `d587e4f` adds gallery, collection-item, place, product and reference records, bringing the experimental adapter to 33 of 50 recipes per language. Canonical images are built into Astro; the image dialog supports keyboard open, Escape and close with focus return, while direct image links remain usable without JavaScript. The independent branch suite passed for both families at root and subpath, including alt text, caption and image loading, gallery accessibility, no-JS asset access, 320px reflow and prior shell, form, search and pagination checks. Seventeen recipes and their interactions remain unported; exact visual parity is still open.

### Jekyll search JSON safety

Commit `b7d080a` escapes `<` after serializing the Jekyll search index into its inert JSON script element. Previously an authored catalog value containing `</script>` could break out of the element. A rendered Jekyll build and Chromium regression using such a value in title, summary and category failed before the fix and passed afterward; `npm run test:search-safety` and `npm run test:examples` also passed after integration. The Jekyll CI workflow now runs the regression after Chromium installation. This is a defense for authored catalog data, not a claim that an untrusted CMS is deployed.

### Astro workspaces and messaging

Commit `7aae638` adds observation and fleet workspaces and local conversation, reaching 36 of 50 catalog recipes per language. The shared workspace supports filtering, keyboard selection, local review, filtered-selection clearing and reset. Chat rejects whitespace, renders user input as text, resets locally and makes no submission. In the independent worktree, both family/root/subpath configurations passed content checks, workspace keyboard behavior, chat safety/no-network, no-JavaScript records/messages and disabled controls, and representative axe checks. Fourteen examples remain unported, and complete visual and functional parity are not established.

### Astro simulations and static sections

Commit `ae67d4f` ports station and scene simulations, FAQ, plan and statistic sections, and the original report CSV, bringing the adapter to 45 of 50 recipes per family. Four full Chromium configurations passed in the independent worktree for catalog content, original CSV bytes, keyboard simulation, native disclosures, no-JavaScript fallback, 320px reflow and 21 representative axe pages. The static recovery examples do not configure HTTP error status codes. The stress fixture and four dashboard-related records remain unported; the simulation adapter currently guards against duplicate instances rather than supporting them. Visual and comprehensive functional parity remain open.

### Astro content stress fixture

Commit `44ee4d6` adds the stress record, bringing the experimental adapter to 46 of 50 recipes per language. Ordinary Markdown continues to disable raw HTML; only the checked-in stress fixture opts into a restricted sanitized HTML/MathML subset. Footnotes have scoped IDs and return links; code blocks are keyboard focusable and long text wraps. The independent suite passed both families at root and subpaths, including stress-page axe, MathML namespace, footnote targets, 320px reflow, hostile markup and unsafe URL rejection; targeted checks also covered nested lists, heading hierarchy and code focus. The four dashboard-related records remain unported in this branch. A combined rerun after integration is in progress.

### Astro analytics and operations routes

Commits `91f2e23` and `8591934` add explicit analytics and operations dashboard routes using the shared synthetic fixture and framework-neutral dashboard logic. Independent tests passed both families at root and subpaths: analytics totals, filters, CSV, invalid-date recovery, no-JS source data, reflow and light/dark axe; operations scope, threshold, pending-filter preservation, acknowledgement/undo, reset, error handling, reflow, light/dark axe and no-JS tables. Dashboard navigation, catalog/search integration, cross-family comparison and visual parity remain unfinished. Administration and dashboard overview are still pending. Separate tests are being rerun against the combined branch.

### Astro administration route

Commit `8d51e39` adds the administration dashboard using the synthetic fixture and shared controller, including static no-JavaScript directory content. Chromium tests passed after integration for both families at root and subpath: local editing, filtering, selection and confirmation, recovery states, safe text, malformed pagination, narrow reflow and light/dark axe. A scoped Krigsvold dark button token correction addressed a contrast failure found during development. Analytics and operations tests also passed on the combined branch in both families and base paths. The dashboard overview, catalog registration, shared navigation, peer comparison, exact visual parity and manual assistive-technology review remain open.

### Astro dashboard and catalog integration

Commit `7476a4c` connects the three Astro dashboard routes and dashboard overview to the catalog, with shared mobile keyboard navigation and optional validated `NIGHTJAR_PEER_URL` for comparison links that retain query state. Both language builds now serve all 50 catalog destinations. This establishes route availability, not complete parity. Operations family CSS was isolated after the integrated suite caught cross-family selectors. Dashboard headings now sit in the working region rather than in a tall editorial hero. Independent integrated tests passed the generic 47-page suite and all three dedicated dashboard suites in both families at root and subpaths, plus all 50 route responses, keyboard/Escape/focus, no-JavaScript navigation and configured peer-link checks. At 1440×900, admin table top measured y=846 Martlet and y=817 Krigsvold against the inspected Jekyll y=841–862; analytics filters were y=465/442 and KPIs y=777/737. Full visual parity, real deployment peer URLs, other browser engines and manual assistive-technology testing remain unverified.

### Astro print refinement

Commit `e59fdcf` hides site navigation/footer chrome and analytics controls in print while retaining report and table content. An emulated-print regression failed before the change and passed afterward for both families at root and subpath, covering all three dashboards and an article. Dark-mode print colors, physical printers and other browser engines remain unverified.

### Astro dependency security

Commit `20a5a29` updates the Astro experiment's Astro, markdown-it and sanitize-html dependencies. The prior npm audit reported four advisories (one high, one moderate, two low) in this build-time dependency tree; remote exploitability was not established. `npm audit` now reports zero advisories including development dependencies. In the independent updated worktree the full 47-page catalog suite and analytics, administration, operations and navigation suites passed for both families at root and subpaths. A targeted review of Markdown sanitization, links, JSON script escaping, text-only chat/results and dashboard fixture rendering found no further concrete injection defect; it is not a complete security certification.

### React catalog first increment

Commit `2939aaf` adds a paired React catalog experiment using the existing workbench React/Vite toolchain and shared fixture, without new dependencies. Four independent Chromium configurations passed for 14 prerendered routes in each language at root/subpaths: content and links, family CSS isolation, no console errors or missing assets, 320px and representative desktop reflow, axe on home/archive/case-study, keyboard pagination/focus recovery, reload, print and no-JavaScript record visibility. Strict TypeScript and `npm run test:examples` also passed. The standalone slice still has 36 unported routes and links to some of them; Markdown-heavy, interactive and dashboard examples, native source shells and visual parity remain open. It is not release-ready.

### Astro dark-appearance printing

Commit `0914c64` addresses pale text when a dark screen appearance is printed without backgrounds. Print-only rules use the existing light semantic colors and leave saved screen appearance unchanged. The emulated-print test failed before the fix and passed afterward in both languages at root/subpaths for article and all three dashboard pages; a background-free Chromium PDF was visually inspected. Other engines and physical printers remain unverified.

### React analytics component

Commit `dad099b` adds an isolated paired React analytics component using controlled filter state, the shared synthetic fixture and calculation model, native family buttons, responsive SVG charts with data-table alternatives, local CSV and server-rendered source data. A standalone harness passed both families at root/subpaths for filtering and totals, CSV content, query restoration, invalid-date focus and recovery, light/dark axe, responsive overflow, no-JavaScript behavior and strict TypeScript. It is not yet wired into the catalog or dashboard navigation; visual parity, manual assistive-technology review, print and other engines remain unverified. The standalone harness is intended to keep chart and fixture cost out of simple content pages.

### React operations component

Commit `41bed8c` adds a standalone paired React operations dashboard with controlled draft/applied state, scope and threshold controls, acknowledgement/undo, local timeline, reset and focus recovery, accessible trend data and server-rendered no-JavaScript tables. Its independent Chromium suite passed both families at root/subpaths for state transitions, invalid pending draft preservation, URL restoration, focus, 320/1440 reflow, light/dark axe and no-JavaScript; strict TypeScript passed. Catalog route, shared navigation, comparison, visual fidelity, manual assistive technology and print remain open.

### React reading/data and shared renderer

Commits `1e5d2b7` and `0280bca` expand React from 14 to 29 paired routes with Markdown, article/event metadata, SVG figures and native accessible data tables. The parser now lives in `examples/page-archetypes/lib` rather than the Astro adapter; both frameworks consume the shared implementation. The independent tests passed both languages at root/subpaths for content, metadata, resources, responsive reflow, axe, pagination/focus, print/no-JavaScript and Markdown safety, with strict TypeScript. Twenty-one routes and their interactions, dashboard wiring and visual parity remain open. The same update resolves a pre-existing high-severity root zod advisory by updating to 4.6.7. On the integrated branch `npm ci --ignore-scripts`, `npm audit --audit-level=low` (zero advisories) and `npm run check` (110 tests) passed. The independently tested Astro 47-route suite also passed after the renderer move; Astro requires the documented root dependency install for the shared module.

### React administration and dashboard navigation components

Commits `6c10dd4` and `8d55ac9` add isolated React administration and shared dashboard-navigation components. Administration uses controlled local state, native family Button/Dialog and a server-rendered all-record fallback. Independent Chromium tests passed both families at root/subpaths for filtering, pagination, selection, confirmation/Escape/focus, scoped updates, editing/validation, safe text, recovery, malformed URLs, 320px, light/dark axe, no POST and no-JavaScript; sorting has an additional check in progress. Navigation's independent tests covered mobile keyboard disclosure, Escape/focus return, SSR/no-JS links and optional validated peer URLs preserving query state. These components are not yet wired into catalog routes; deployment URLs, complete visual parity and manual assistive-technology review remain open.

### React catalog interactions

Commit `61ff6cd` expands React to 41 paired routes with query-backed search, six local form specimens, native disclosures, pricing, statistics, report CSV and the scoped sanitized stress fixture. Independent Chromium tests passed both families at root/subpaths for all 41 routes, representative axe and responsive checks, safe markup, search, local validation, sensitive-field clearing, disabled no-JavaScript controls, native disclosures, pagination and print; strict TypeScript passed. Nine routes, including dashboard integration and other interactive fixtures, remain unported. Standalone dashboard components are not yet catalog routes.

### React workspace and chat components

Commit `68d0625` adds isolated controlled React workspaces and local chat. Two concurrent workspace instances have distinct accessible detail names; the fixture supports keyboard selection, review, filtering and reset, with complete server-rendered records. Chat rejects whitespace, renders entered text safely, resets locally and does not send a POST. Independent Chromium tests passed both families at root/subpaths for two instances, keyboard/focus, no-JavaScript, 320px, light/dark axe and no network submission; focused TypeScript passed. Catalog wiring and full visual/manual accessibility review remain open.

### React simulation components

Commit `4969c99` adds standalone controlled station and scene simulations with per-instance IDs/state, canonical content and base-aware images. Server-rendered snapshots remain available and controls are disabled until hydration; no device or service is contacted. Strict TypeScript and four independent Chromium configurations passed, including simultaneous instances, keyboard, status, image decoding, reset, unique IDs, 320/1440 reflow, light/dark axe and no-JavaScript. Catalog integration remains pending.

### React gallery component

Commit `29f9775` adds a standalone React gallery using canonical image content, base-aware allowlisted assets, SSR direct links and a native labelled dialog with focus restoration. When JavaScript or `showModal` is unavailable, image links remain usable. Both family/root/subpath Chromium runs passed two simultaneous galleries, keyboard Enter/Escape and focus, alt/caption, 320px, light/dark axe and no-JS/no-`showModal` navigation; strict TypeScript passed. Catalog wiring, visual parity, manual assistive technology and other engines remain open.

### React dashboard route integration

Commit `11c3663` connects the three React dashboards and dashboard overview, and adds a 50-record index. It prerenders 44 routes, labels the six missing destinations as unavailable, separates dashboard JavaScript, and includes route-specific CSS in server-rendered HTML so no-JavaScript dashboards are styled. Independent tests passed both families at root/subpaths for dashboard workflows, peer query, keyboard/mobile navigation, representative axe, no-JS tables/controls/styles and normal-page dashboard-bundle isolation; the generic 41-page suite, family CSS/font isolation and strict TypeScript also passed. The six interactive records remain to be wired. Narrow no-JavaScript dashboard charts retain a fixed SVG viewBox, so labels may be small; exact-data tables are present. Visual parity, physical printing, manual assistive technology and other browsers remain open.

### React no-JavaScript chart labels

Commit `985c0a5` addresses the narrow-screen fallback recorded above. Server-rendered analytics and operations charts start with a compact 240-unit SVG capped at 240px; hydrated charts retain adaptive resizing and exact-data disclosures remain available. Dedicated tests passed both families at root/subpaths for 320/1440 no-JavaScript label geometry, category-label overlap, data disclosures, overflow and hydrated resizing; strict TypeScript passed. A 320px no-JavaScript Krigsvold category chart was visually inspected. The desktop no-JavaScript chart intentionally remains compact; full visual and manual accessibility review remains open.

### React rapid acknowledgement

Commit `6404df3` fixes a React operations race: two batched clicks could both read the prior alert state, losing a toggle and duplicating the acknowledgement event. The updated handler tracks the latest local alert state synchronously and resets it consistently. A regression failed before the change and passed in both families at root/subpaths, requiring one acknowledgement and one reopening event; the operations suite, existing recovery/axe and no-JavaScript checks also passed. The catalog integration is being rebased onto this correction.

### React complete route coverage and prerender safety

Commit `60db50c` wires gallery, workspace, fleet, chat, sensors and scene, so all 50 canonical React catalog destinations and the index are generated. Interactive and dashboard code remains route-split, with CSS included in server-rendered output. It also fixes literal `$&`, `$'` and dollar-backtick corruption in generated markup, titles and styles by using callback replacements, with a targeted regression. Independent tests passed both families at root/subpaths for the 47 content routes and three dashboards/index, local destination files, representative axe and reflow, interactive workflows, no-JavaScript output/styles, bundle isolation, rapid acknowledgement, narrow no-JS charts and peer query state; strict TypeScript passed. Route coverage and these checks do not establish complete visual, behavioral or manual accessibility parity across frameworks.

### Astro print palette isolation correction

The earlier dark-print change `0914c64` placed both families' palette declarations in a shared stylesheet, which caused the existing Astro CSS-isolation assertion to fail in the combined suite. Commit `56735b5` moves each palette into its family-specific shell stylesheet. The paired root/subpath dark-print tests passed in the independent worktree; the complete Astro suite is running with this correction and the pagination asset optimization. The prior print change should not be treated as fully validated until that suite passes.

### Cross-framework workspace filtering

Commit `e33b8be` reapplies a workspace's active filter after a review changes a record. Previously React could keep a now-hidden record selected and actionable; Jekyll and Astro could leave the nonmatching row visible. The change clears selection when the record leaves scope, updates the visible results and restores focus appropriately. The React regression failed before the fix; React workspace/chat checks passed both families at root/subpaths, targeted Jekyll checks passed both families, and focused Astro workspace/fleet checks passed all four configurations. A full Astro suite is running with the separately integrated CSS-isolation correction.

### Cross-framework analytics URL state

Commit `a318f60` makes end-date-only URLs display Custom range in all three frameworks and validates initial React URL ranges. Invalid React ranges retain default results, show/focus an error and disable CSV until corrected. The React invalid-range regression failed before the change; the independently run Jekyll dashboard suite passed 57/57, Astro analytics and standalone/integrated React dashboard suites passed both families at root/subpaths, `test:examples` and strict React TypeScript passed. Both Jekyll exports were synchronized.

### Astro listing asset isolation

Commit `af3939a` loads the Astro listing enhancement only on pages with listings. In a local Chromium 151, 1440px root-path measurement, Martlet About JavaScript fell from 1,891 raw / 856 gzip bytes to 1,312 / 537 and one script request was removed. Targeted tests passed for both families at root/subpaths: About omits the controller, Archive loads and advances, and no-JavaScript Archive retains all records. The full content suite with the print-palette isolation correction is still running. Initial measurements also found dashboards embedding unused fixture domains; further scoping is being investigated.

### React operations URL validation

Commit `11935fb` validates an initial React operations threshold URL. Invalid input now remains in the draft, reports and focuses the error and retains the default valid metrics until a valid threshold is applied. The regression failed before the fix; standalone and integrated React dashboard suites passed both families at root/subpaths, including rapid acknowledgement and no-JavaScript checks, and strict TypeScript passed.

### Dashboard cross-framework checks and mobile width

Commits `1f7896e` and `529ebc4` correct redundant React mobile dashboard padding and add a reproducible representative cross-framework dashboard test. At 320px the administration form grew from 192/200px to 272/280px (Martlet/Krigsvold) while retaining the family AppShell gutter; a corrected Martlet screen was visually inspected. The independent integrated React dashboard suite passed both families at root/subpaths, including hydrated and no-JavaScript geometry. The new comparison passed all six family/framework combinations for analytics filters and error focus, operations acknowledgement with pending drafts, keyboard confirmation/cancel and focus, mobile navigation/overflow and no-JavaScript content. It is representative rather than complete visual or manual accessibility conformance; React still differs in source mark and full site chrome.

### Jekyll account guidance and combined workspace checks

Commit `b738dc6` associates the visible password and verification-code hints with their Jekyll inputs, matching the Astro and React behavior. Both family builds passed; targeted Chromium checks confirmed accessible descriptions for sign-in, sign-up and two-factor pages, root/subpath link checks passed (57 pages, 1,428 destinations per build), and `test:examples` passed. The initial link-check invocation omitted `--baseurl` and produced false missing-file reports; rerunning with correct base paths passed.

After workspace correction `e33b8be` and Astro palette correction `56735b5`, the independent full Astro and React catalog suites passed both families at root and subpaths (47 direct content routes per build), including representative axe, routing, responsive and no-JavaScript checks. These are not a substitute for full manual accessibility or visual review.
