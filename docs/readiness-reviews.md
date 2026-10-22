# Structured readiness reviews

Review policy 1 · Experimental · October 22, 2026

Readiness reviews record observations about a saved component specification and both implementation inventories. They support a deliberate stability or release decision. They do not certify an API, establish authorship, promote maturity, alter implementation claims, or publish a package. The existing free-form evidence field and maturity validation remain separate; this workflow does not enforce every human release obligation.

Open **Readiness reviews** from workspace navigation, or **Review readiness** in the component inspector. Both presentations show the same component, context, review areas, and outcomes. The context contains requirements, existing evidence, both families' decisions, migration guidance, targets, maturity, and both actual implementation inventories.

## Observations and outcomes

| Area | What to record |
| --- | --- |
| Real consumer | Application, task, date, observed results and unresolved work |
| Keyboard and behavior | Native keyboard/focus paths, state changes, failures and recovery |
| Assistive technology | Manual screen-reader/other assistive-technology environment, task and result |
| Responsive appearance | Both families; light/dark, narrow/wide, text resizing and spacing |
| Compatibility and regressions | Platforms, versions, browsers, package installation, relevant regressions |
| Migration and support | API compatibility, upgrade guidance or a reason none applies, support obligations |

Every area has one native radio choice: Not reviewed, Needs work, or Passed. A pass or needs-work outcome requires 20–2000 characters of concrete observations. Unreviewed notes may be blank and may contain up to 2000 characters. The server requires exactly one entry for each of the six area IDs; unknown/duplicate/missing outcomes are rejected. Observation dates/environments belong in the notes; the server timestamp records when the entry was saved, not when a human actually performed a check.

A separate acknowledgement confirms that the observations were considered against the displayed specification/inventory. It resets when notes or outcomes change, after saving, and after failed saves. Partial reviews can be saved; blank areas remain visibly Not reviewed. Even six recorded passes are assertions requiring a separate human decision. There is no synthesized adoption score, release-ready badge, automatic stable transition, or automatic publication.

## Scope, freshness, and history

The server stores optional `review` metadata in the component record: policyVersion, basisHash, basedOnRevision, recordedAt, and the six checks. The SHA-256 basis covers the component ID, all editable specification fields and the complete recorded implementation inventory for both families. Target and implementation ordering do not matter; revision numbers, save timestamps, and the review itself are excluded. This fingerprint compares content; it is not a signature or independent verification.

A successful changed review increments the ordinary component revision and appends a complete history snapshot in the same transaction. Its history-only `change.kind` is `readiness-review`; the revision disclosure shows all recorded observations. A repeated identical current review is a no-op. Every write still needs the currently loaded revision, so even an identical stale request fails with 409. An unrelated component's save does not conflict with this single-component operation.

Specification edits, inventory updates, imports, and historical draft restoration retain the latest local review metadata. A different basis marks that review as needing renewal; old observations remain visible and are retained in history. Opening a stale review copies the old notes into the new draft but resets all outcomes to Not reviewed. The reviewer must deliberately record renewed results. Returning exactly to an earlier reviewed content/inventory basis can match again; this is content matching, not proof of recent testing. There is no calendar-based expiration or verification of notes.

Review edits do not invalidate their own basis. They do invalidate pending ordinary editor/import/inventory writes through the normal record revision/token checks. JSON export includes current optional review metadata; JSON import ignores source review claims, preserves existing local reviews, and creates new records without any imported review. Export/import is not transfer of review history. Full SQLite backup is required to preserve the complete audit trail.

## Failures, navigation, and keyboard access

Field errors appear in a focused, linked ErrorSummary; area links focus named fieldsets and confirmation links focus its checkbox. Each radio group uses a unique native name inside Fieldset/legend. Arrow keys select an outcome, Space activates it, and Tab follows native group behavior. No custom ARIA radio keyboard model is layered on top.

Unsaved observations use the application's normal discard dialog and browser unload guard. Component selection, navigation, refresh, and entering the specification editor respect that choice. A failed refresh preserves the draft and previously loaded context. Loading/retry is explicit; aborted selection/navigation cannot apply a late response or steal picker focus. Controls are disabled during saving and in-app navigation waits for it to finish.

409 conflicts preserve the draft and require loading the latest record before another save. An uncertain network result also disables saving until explicit refresh. If a response is lost after commit, refreshing reveals the saved revision without replaying it. A failed refresh keeps the draft; choosing to discard for refresh only replaces it after a successful read. SQLite failures roll back the record and history together.

## Database upgrade and operational boundary

**Stop the server and copy the complete SQLite database before first using this version with an existing registry.** Use the README's stopped-server backup procedure; do not copy a live WAL database file alone.

New databases use SQLite user_version 2. Existing schema-1 databases upgrade the version marker transactionally, retaining every record/history snapshot and without reseeding or inventing review data. The table layout is unchanged; structured metadata lives in existing JSON documents. The version bump prevents older application builds, which drop unfamiliar metadata on ordinary saves, from writing these databases. Older builds refuse version 2; newer unknown versions are also refused. Keep the schema-1 backup to return to an older build. API/export schema version 1 and import policy 1 remain unchanged.

This remains a local, unauthenticated, single-user service. There is no authenticated reviewer identity, attestation signature, automated evidence verification, hosted permission model, review-specific deletion, or cross-user approval workflow. Reviews are freely available MIT functionality. Package APIs and the review policy remain experimental.

## Verification

Checks cover validation, current-basis/idempotence, stale revisions, no maturity/availability changes, every editable field and inventory changes, ordering invariance, metadata retention through imports/inventory, ignored foreign review claims, actual schema-1 migration, backup retention, close/reopen history, newer-schema refusal, transactional rollback after a record write, and HTTP validation/origin/content boundaries.

Both families exercise native radio arrows and group/error focus, acknowledgement, disabled saving/navigation, save/reload/history, stale-contract renewal with retained notes and reset outcomes, committed-response loss, loading/refresh failures, unsaved navigation, empty/no-implementation states, cancelled late selection, and picker focus. Eight populated light/dark 320/1440px cases check axe and reflow with 200% text and spacing overrides. Automated checks do not replace manual screen readers, actual browser zoom, non-Chromium/mobile, forced-colors, RTL/localization, or sustained consumer review.
