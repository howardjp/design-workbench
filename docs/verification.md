# Verification record

First implementation and coverage workflow · October 21, 2026

The local workbench builds against React 19.3.1, Vite 8.3.5, TypeScript 7.0.2, Node 24.19.0, and the published theme 2.1.0 packages. Package lockfiles pin the installed dependency graph.

Completed checks:

- TypeScript compilation of the app and both independently built React packages, including native attribute/ref consumer fixtures.
- Twenty-nine Node tests covering native component semantics, associated form labels/hints/errors, live-region priorities, semantic tables, inventory provenance, real SQLite close/reopen persistence, revision history, stale-write rejection, server-side validation, creation, immutable availability metadata, search/filter intersections, JSON export, malformed requests, body limits, and Host/Origin boundaries.
- Fifty-two browser tests against a fresh in-memory SQLite-backed HTTP server. Both family routes complete browse/filter/inspect/edit/validate/save/reload/create workflows; preserve drafts on transport failures and concurrent changes; and support modal Escape dismissal and unsaved-navigation choices.
- Automated axe WCAG A/AA checks on each family editor and overview at 320 and 1440 CSS pixels in light and dark modes, without reported violations. The same cases assert no document overflow and reduced-motion handling.
- Sorting, pagination, evidence drilldowns, native checkbox/disclosure keyboard behavior, loading/retry recovery, and programmatic 200% text resizing with WCAG text-spacing overrides.
- Independent installation and server rendering of both npm tarballs in a temporary consumer outside the workspace. Package builds clean generated output to exclude stale artifacts.
- Historical draft comparison/restoration and revision-history retry, with saved history and current availability retained. Focus moves during the render transition, before painting, so delayed focus cannot steal native-control keystrokes. An added regression reproduced blocked focus when a modal was still making the editor inert; dialog closing now precedes application focus. Tests assert Escape returns to the trigger and discard/cancel/conflict recovery focus the inspected record.
- Explicit bundled-inventory preview/application from an earlier database, source validation/fingerprints, preservation of edited contracts and unrelated implementations, stale preview rejection, name conflicts, transactional rollback after partial writes, close/reopen persistence, and recovery after a response lost following commit. Both family previews also pass 320/1440px light/dark axe and reflow checks plus 200% text/text-spacing overrides.
- Reusable ErrorSummary rendering/native-ref type contracts and browser tests for keyboard field-link activation, invalid-group focus, and unsaved navigation to inventory updates.
- Visual inspection of both family registry views with the same Button record at 1440 pixels, followed by adjustment of hint placement to keep filter controls aligned. Martlet uses horizontal navigation and editorial grouping; Krigsvold uses a side rail and tighter aligned records.

Browser checks use Playwright 1.64.1 and Chromium 153 in the local review environment. CI installs Playwright's managed Chromium. A custom local browser path can be supplied with PLAYWRIGHT_EXECUTABLE_PATH; it is not required in CI.

Automated checks do not establish complete WCAG conformance, manual screen-reader usability, sustained production use, all-browser compatibility, or operational readiness for shared hosting. Manual screen-reader, actual browser zoom, non-Chromium browser, and real-workload reviews remain open. No package has been published and no production consumer has been changed by this work.
