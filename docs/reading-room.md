# Specification reading room

Experimental · October 21, 2026

The reading room completes the initial four comparative experiences in the workbench: article with supporting material, substantial form, searchable collection, and coverage dashboard. It is a working view of saved registry data, not evidence of sustained use or production readiness.

## Real task and shared content

Open a component in the inventory and choose **Read specification**, or choose **Reading room** in workspace navigation. Select any saved component, follow its section links, refresh its saved revision, print its current loaded content, or choose **Edit this specification**. Saving through the normal editor persists a new revision; returning to reading shows that saved record. The URL retains the selected record and reading view. A section fragment also restores focus after a direct load or reload.

Both family presentations render one content source. They include the saved name and summary, category and targets, acceptance criteria, implementations for **both** families, both sets of design decisions, evidence, migration guidance, revision, and save time. Availability and maturity remain separate. Empty metadata is explained without inventing support or evidence. Supplementary prose explains how to interpret a registry contract; it is not a claim of measured adoption or successful manual review.

A failed refresh retains the previously loaded revision and provides a focused error with Retry specification. A successful refresh records the server-returned revision in the current window without writing data. Navigation away aborts an outstanding refresh so a late response does not update a different task. The normal editor still rejects stale saves and preserves drafts. No new API endpoint or database schema was needed.

The picker retains keyboard focus while changing records. Section links use native fragments and focusable headings. In-app navigation into the reader focuses main; editing from the reader focuses the editor. Unsaved navigation retains the existing keep/discard choice. Family links preserve the selected record and view; they do not synchronize scroll position.

## Independent composition

| Decision | Martlet | Krigsvold |
| --- | --- | --- |
| Body text | Cambo serif, 1.12rem / 1.8 | Roboto sans-serif, 1rem / 1.7 |
| Heading | Broad, regular serif heading and a selective gold rule | Strong slab heading, tight tracking, restrained accent rule |
| Supporting material | Related right-hand panel with roomier grouping | Aligned left-hand context rail with a precise boundary |
| Metadata | Quiet, wrapping band beneath the introduction | Aligned, compact band beneath the introduction |
| Narrow view | Context precedes the body; one column | Context precedes the body; one column |

Both use a bounded text measure, native links, semantic headings/lists/tables, and the same saved contract. The comparison test checks exact text parity, distinct prose fonts, and opposite context placement without relying on palette. These are experimental application roles built from the adopted foundation vocabulary. No published theme tokens or original websites changed.

## Reusable packages

Both packages now export `Article` and `TableOfContents`, added in the sixteen-component checkpoint (the packages now include FileInput as their seventeenth export). See [component contracts](components.md) and package READMEs for the typed surface.

`Article` owns its accessible title, introduction, metadata, optional context, body measure, and footer. The caller owns content and routing. `titleLevel` defaults to 1 for a standalone document; the workbench uses 2 below its page heading. Callers choose a coherent level for subsequent headings and supply valid, unique section IDs. `TableOfContents` uses an ordered list inside a named navigation region and native fragment anchors. Focusable heading targets use `tabIndex={-1}`. Neither component embeds registry state, fetches data, parses Markdown, or renders untrusted HTML.

The presentation components can render as static HTML, as verified in the isolated package consumer. Their native fragment links remain useful without hydration when valid heading targets are present. The current workbench is a client-rendered application: loading records, selecting contracts, refreshing, editing, and printing from its action button require JavaScript. It has no server-rendered/no-JavaScript route fallback.

The initial seed now contains 33 records. Existing databases receive the new component records only through the explicit bundled-inventory preview and application workflow. Restarting never replaces saved contracts.

## Printing and verification limits

Print specification invokes the browser's print action. Print CSS keeps the loaded contract and supporting reading notes, removes shell/task controls and the table of contents, and uses a single document column. It does not create a versioned export or fetch a newer revision. Refresh before printing when a later saved revision may exist.

Verification covers semantic rendering/native props and refs; direct/reloaded fragment focus; editor save/reload persistence; concurrent-write rejection; refresh failure and recovery; empty records; long content; exact family text parity; and visual inspection of the two reading compositions. Eight article cases cover light/dark modes at 320 and 1440 CSS pixels, axe WCAG A/AA, programmatic 200% text enlargement and text-spacing overrides. Wide cases also check print-media visibility and retained content.

Actual browser zoom, paper/PDF pagination and margins, manual assistive technology, non-Chromium browsers, forced colors, RTL/localization, and sustained real-workload review remain open. Print-media emulation is not a claim that every printer or page size has been manually reviewed. All maturity remains experimental.

## Reproduce the comparison images

After building, run `node scripts/capture-review.mjs reading`. The script uses a temporary in-memory registry and writes the two reading images under docs/qa. Set PLAYWRIGHT_EXECUTABLE_PATH when using a custom Chromium binary. Optional view arguments are inventory, overview, and reading; omitting them captures all three. Images in this change show the same saved Button contract.
