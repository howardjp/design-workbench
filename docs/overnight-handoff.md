# Overnight continuation

The user explicitly authorized continued autonomous work overnight, including creation of repositories when useful. Preserve the adopted charters, living-baseline rule, independent family character, complete free distribution, and honest maturity labels.

## Current ownership

The interactive work session is implementing the first slice on `work/registry-foundations` in howardjp/design-workbench. Companion foundation documents are on `work/foundations-spec` in martlettheme/npm and krigsvoldtheme/npm. Fetch current remote refs and open PRs before making changes. If there is new activity in the interactive session, avoid overlapping edits. Remote heads and CI are authoritative; do not assume a scratch directory or cached SHA survived.

## Implemented first slice

Two React presentations consume one shared domain/API. A SQLite registry supports create, edit, validation, revision history, optimistic conflicts, persistence across restart, and JSON current-state export. Initial records represent actual Astro and workspace React exports. All component maturity starts experimental; availability is separate from intended targets. The two component packages each export thirteen initial primitives. They remain unpublished private workspace packages with public MIT source.

The service is deliberately local-only and unauthenticated. Team hosting, remote authentication/authorization, and npm publication require separate completed implementation and release setup. Do not expose this server publicly. Do not change repository visibility, production websites, unrelated draft showcases, external communications, or billing.

## Next useful slices

1. Verify the latest remote CI and package tarball consumer check. First checkpoint is in howardjp/design-workbench PR #1 at 3d6e0f805996cea1a0d78f4e20aae465f8af6822. The second checkpoint is fc9a08a1e55c088b20818d7c70be0c84263a5542 (CI passed), with the coverage/dashboard and thirteen-component contracts. The next tested checkpoint extends that same branch with revision comparison and draft-based restoration; fetch the latest head. Foundation PRs are martlettheme/npm #4 at 6619f7ad8dd56453fb2145a5fe05365dbeadbf7c and krigsvoldtheme/npm #4 at 0a25f1ecf6fa608f425c03db6f28feb987fb7e7c. All first-checkpoint CI runs passed.
2. Coverage/readiness dashboard, evidence drilldown, accessible sorting, and pagination are implemented in the second checkpoint. Expand only where real registry work calls for it.
3. Checkbox, Fieldset, and Disclosure are now extracted and consumed; all thirteen exports have API/state/keyboard/acceptance contracts in docs/components.md. Choose further controls from real workflow needs.
4. Revision review now compares editable fields and opens an earlier snapshot as a draft. Saving creates a new revision through normal validation and stale-write protection, retaining history and current implementation metadata. A loading-failure retry exists. Continue recovery work only where real use finds a gap; do not add destructive reset actions.
5. Add controlled inventory-update/import tooling with validation, transactional preview, version checks, and clear conflict handling before claiming automatic synchronization.
6. Broaden manual-style keyboard, 200% type, 400% zoom equivalent, and text-spacing checks; verify light/dark, long content, empty/error/loading states, and isolated package installation. Document what could not be checked.
7. Continue the remaining comparative experiences and component specifications from the construction plan. Use real tasks and data rather than synthetic adoption statistics.

## Working conventions

Read docs/construction-plan.md, registry.md, maturity.md, verification.md, and each package README. Tests: npm ci --ignore-scripts; npm run check; npx playwright install --with-deps chromium; npm run test:browser; npm run test:packages. On the original scratch host a Chromium binary is available at /workspace/scratch/ea99548f98cf/browser-qa-runtime/headless. Node 24 is required for bundled SQLite. Use temporary databases for tests; never overwrite a user's registry.

Commit coherent tested checkpoints, document the exact remote head and results in PR descriptions, and keep this handoff current. API ref writes must use expected-head leases. The scheduled continuation is bounded to this night; it is not authorization for endless recurring work.

## Latest completed slice

The third slice adds historical field comparison, opening a prior contract as an editable draft, and saving it as a new revision without changing implementation metadata or erasing history. Revision-loading failures now have retry behavior. Focus transitions run before paint; no delayed animation-frame callback can steal a checkbox keystroke after the editor opens.

Local verification at this checkpoint: package/app build and type checks pass; 20 Node tests and 34 browser tests pass. Historical comparisons also receive narrow-screen reflow and axe checks. Both packed React packages passed isolated installation/rendering in the preceding checkpoint, whose GitHub CI also passed. The current commit's remote CI must be read before claiming success. Full manual assistive-technology, actual browser zoom, non-Chromium, and sustained-use review remain open.

The next material gaps are explicit, non-destructive inventory synchronization/import with preview and conflict handling; the article comparative experience; broader real-use components; and further consumer review. Avoid reimplementing the completed dashboard, native controls, or revision workflow. The initial seed now contains 29 records; an existing 26-record database is deliberately left intact until explicit inventory synchronization is implemented.

A fourth corrective checkpoint follows the third: dialog modal state also changes before paint. This fixes a reproduced focus loss when an unsaved-changes dialog closed after the application attempted to focus its inert editor. Escape/trigger restoration and discard/cancel/conflict recovery focus are now asserted. The third checkpoint f4c33086120f0678abdd871362b1b2a683bbbbc0 passed remote CI; read current CI for the later correction.
