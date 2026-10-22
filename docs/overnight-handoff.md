# Overnight continuation

The user explicitly authorized continued autonomous work overnight, including creation of repositories when useful. Preserve the adopted charters, living-baseline rule, independent family character, complete free distribution, and honest maturity labels.

## Current ownership

The interactive work session is implementing the first slice on `work/registry-foundations` in howardjp/design-workbench. Companion foundation documents are on `work/foundations-spec` in martlettheme/npm and krigsvoldtheme/npm. Fetch current remote refs and open PRs before making changes. If there is new activity in the interactive session, avoid overlapping edits. Remote heads and CI are authoritative; do not assume a scratch directory or cached SHA survived.

## Implemented first slice

Two React presentations consume one shared domain/API. A SQLite registry supports create, edit, validation, revision history, optimistic conflicts, persistence across restart, and JSON current-state export. Initial records represent actual Astro and workspace React exports. All component maturity starts experimental; availability is separate from intended targets. The two component packages each export ten initial primitives. They remain unpublished private workspace packages with public MIT source.

The service is deliberately local-only and unauthenticated. Team hosting, remote authentication/authorization, and npm publication require separate completed implementation and release setup. Do not expose this server publicly. Do not change repository visibility, production websites, unrelated draft showcases, external communications, or billing.

## Next useful slices

1. Finish checking and publishing the first slice to a reviewable PR. Verify the latest remote CI and package tarball contents. Preserve the existing foundation specs and link them from the construction plan.
2. Add a real coverage/readiness dashboard derived entirely from registry data, with links into filtered records. Extend the collection with accessible sorting and bounded pagination. Preserve identical behavior/content across both designs.
3. Extract additional native controls actually used by the editor, then record their full states, keyboard model, API, and acceptance criteria. Checkbox/Fieldset/Disclosure are natural early candidates; do not invent a large unused catalogue.
4. Improve revision review and safe recovery (compare snapshots and explicitly restore as a new revision), with stale-write protection and tests. Do not silently replace a live database or add destructive reset actions.
5. Add controlled inventory-update/import tooling with validation, transactional preview, version checks, and clear conflict handling before claiming automatic synchronization.
6. Broaden manual-style keyboard, 200% type, 400% zoom equivalent, and text-spacing checks; verify light/dark, long content, empty/error/loading states, and isolated package installation. Document what could not be checked.
7. Continue the remaining comparative experiences and component specifications from the construction plan. Use real tasks and data rather than synthetic adoption statistics.

## Working conventions

Read docs/construction-plan.md, registry.md, maturity.md, verification.md, and each package README. Tests: npm ci --ignore-scripts; npm run check; npx playwright install --with-deps chromium; npm run test:browser; npm run pack:react. On the original scratch host a Chromium binary is available at /workspace/scratch/ea99548f98cf/browser-qa-runtime/headless. Node 24 is required for bundled SQLite. Use temporary databases for tests; never overwrite a user's registry.

Commit coherent tested checkpoints, document the exact remote head and results in PR descriptions, and keep this handoff current. API ref writes must use expected-head leases. The scheduled continuation is bounded to this night; it is not authorization for endless recurring work.
