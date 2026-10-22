# Overnight continuation

The user explicitly authorized continued autonomous work overnight, including creation of repositories when useful. Preserve the adopted charters, living-baseline rule, independent family character, complete free distribution, and honest maturity labels.

## Current ownership

The first interactive implementation and its four checkpoints are complete; the continuation now advances explicit inventory updates on `work/registry-foundations` in howardjp/design-workbench. Companion foundation documents are on `work/foundations-spec` in martlettheme/npm and krigsvoldtheme/npm. Fetch current remote refs and open PRs before making changes. If there is new activity in the interactive session, avoid overlapping edits. Remote heads and CI are authoritative; do not assume a scratch directory or cached SHA survived.

## Implemented first slice

Two React presentations consume one shared domain/API. A SQLite registry supports create, edit, validation, revision history, optimistic conflicts, persistence across restart, and JSON current-state export. Initial records represent actual Astro and workspace React exports. All component maturity starts experimental; availability is separate from intended targets. The two component packages each export fourteen initial primitives. They remain unpublished private workspace packages with public MIT source.

The service is deliberately local-only and unauthenticated. Team hosting, remote authentication/authorization, and npm publication require separate completed implementation and release setup. Do not expose this server publicly. Do not change repository visibility, production websites, unrelated draft showcases, external communications, or billing.

## Next useful slices

1. Verify the latest remote CI and package tarball consumer check. First checkpoint is in howardjp/design-workbench PR #1 at 3d6e0f805996cea1a0d78f4e20aae465f8af6822. The second checkpoint is fc9a08a1e55c088b20818d7c70be0c84263a5542 (CI passed), with the coverage/dashboard and thirteen-component contracts. The next tested checkpoint extends that same branch with revision comparison and draft-based restoration; fetch the latest head. Foundation PRs are martlettheme/npm #4 at 6619f7ad8dd56453fb2145a5fe05365dbeadbf7c and krigsvoldtheme/npm #4 at 0a25f1ecf6fa608f425c03db6f28feb987fb7e7c. All first-checkpoint CI runs passed.
2. Coverage/readiness dashboard, evidence drilldown, accessible sorting, and pagination are implemented in the second checkpoint. Expand only where real registry work calls for it.
3. Checkbox, Fieldset, and Disclosure are now extracted and consumed; all fourteen exports have API/state/keyboard/acceptance contracts in docs/components.md. Choose further controls from real workflow needs.
4. Revision review now compares editable fields and opens an earlier snapshot as a draft. Saving creates a new revision through normal validation and stale-write protection, retaining history and current implementation metadata. A loading-failure retry exists. Continue recovery work only where real use finds a gap; do not add destructive reset actions.
5. Explicit bundled-inventory updates are now implemented; see the latest slice below. General JSON import/export round trips remain separate future work.
6. Broaden manual-style keyboard, 200% type, 400% zoom equivalent, and text-spacing checks; verify light/dark, long content, empty/error/loading states, and isolated package installation. Document what could not be checked.
7. Continue the remaining comparative experiences and component specifications from the construction plan. Use real tasks and data rather than synthetic adoption statistics.

## Working conventions

Read docs/construction-plan.md, registry.md, maturity.md, verification.md, and each package README. Tests: npm ci --ignore-scripts; npm run check; npx playwright install --with-deps chromium; npm run test:browser; npm run test:packages. On the original scratch host a Chromium binary is available at /workspace/scratch/ea99548f98cf/browser-qa-runtime/headless. Node 24 is required for bundled SQLite. Use temporary databases for tests; never overwrite a user's registry.

Commit coherent tested checkpoints, document the exact remote head and results in PR descriptions, and keep this handoff current. API ref writes must use expected-head leases. The scheduled continuation is bounded to this night; it is not authorization for endless recurring work.

## Earlier completed slice: revision recovery

The third slice adds historical field comparison, opening a prior contract as an editable draft, and saving it as a new revision without changing implementation metadata or erasing history. Revision-loading failures now have retry behavior. Focus transitions run before paint; no delayed animation-frame callback can steal a checkbox keystroke after the editor opens.

Local verification at this checkpoint: package/app build and type checks pass; 20 Node tests and 34 browser tests pass. Historical comparisons also receive narrow-screen reflow and axe checks. Both packed React packages passed isolated installation/rendering in the preceding checkpoint, whose GitHub CI also passed. The current commit's remote CI must be read before claiming success. Full manual assistive-technology, actual browser zoom, non-Chromium, and sustained-use review remain open.

The next material gaps after revision recovery were explicit inventory updates, the article comparative experience, broader real-use components, and further consumer review. Inventory updates are now implemented below; avoid duplicating them. Avoid reimplementing the completed dashboard, native controls, or revision workflow. The initial seed now contains 30 records; an existing 26-record database is deliberately left intact until the user reviews and applies an explicit inventory update.

A fourth corrective checkpoint follows the third: dialog modal state also changes before paint. This fixes a reproduced focus loss when an unsaved-changes dialog closed after the application attempted to focus its inert editor. Escape/trigger restoration and discard/cancel/conflict recovery focus are now asserted. The third checkpoint f4c33086120f0678abdd871362b1b2a683bbbbc0 passed remote CI; read current CI for the later correction.


## Continuation: explicit inventory updates and linked errors

Implementation checkpoint: `b11e4322b96d5c3fa9bea8c9a66317a0dcd2dd4d` on `work/registry-foundations`, extending PR #1. Its tree passed the local checks below. This handoff-only follow-up pins that implementation SHA; inspect the current remote PR head and its CI before proceeding.

Baseline remote workbench head verified before editing: `2057fc28966d04eda495b87c9501e45ac15bc991`, PR #1, CI success in run `39707756046`. Both companion foundations heads remain `6619f7ad8dd56453fb2145a5fe05365dbeadbf7c` (martlettheme/npm #4, successful run `39704843812`) and `0a25f1ecf6fa608f425c03db6f28feb987fb7e7c` (krigsvoldtheme/npm #4, successful run `39704845497`). Their refs and current workbench PR were read before work; no newer work was overwritten.

The completed slice adds Inventory updates in both family presentations. A validated bundled snapshot produces a read-only preview of new contracts, full initial specifications, changed metadata, retained implementations not confirmed by the bundle, and name conflicts. Explicit application requires review and a token matching the full current registry and source snapshot. A transaction writes all records and history together. Existing editable fields, unrelated implementations, and history remain. Stale previews and conflicts block the full batch. Refresh after a lost response resolves an uncertain result without replaying it. This is not arbitrary JSON import, deletion/reconciliation, or live package discovery. See docs/inventory-updates.md.

Both packages now expose fourteen experimental components, adding ErrorSummary with caller focus/ref support and linked errors. Field accepts an optional explicit id. The editor uses these links to focus invalid inputs and groups. The seed now contains 30 components. Existing databases stay unchanged until the user explicitly reviews and applies updates. Historical comparisons show implementation differences, and restoring a historical draft retains current implementations.

Validation for this slice: app/package builds and TypeScript/native-ref fixtures; 29 Node tests; 52 Chromium browser tests; isolated install/render of both packed packages. New cases exercise an older database, edited stable contracts, rollback after partial transaction writes, restart persistence, stale previews, name collisions, response loss after commit, keyboard review and field links, unsaved navigation, both themes, 320/1440px reflow/axe checks, and enlarged text/text spacing. Preview and comparison panels were visually inspected for both families. Manual screen reader, actual browser zoom, non-Chromium browsers, and sustained use remain open. No hosting, npm publication, or production site changes occurred.

Next useful slice: the shared-content article comparative experience, or a real registry task that justifies further reusable controls. An export round-trip import is still open but must have its own validation, provenance, preview, and conflict policy; do not treat the bundled-inventory API as arbitrary import. Keep the existing free/MIT, local-only, independent-family, and honest-maturity boundaries. Read current remote refs, open PRs, and CI before editing.
