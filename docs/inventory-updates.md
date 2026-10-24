# Explicit inventory updates

Experimental · October 21, 2026

Use **Inventory updates** to bring an existing registry forward after installing a newer workbench. The source is `server/seed.json`, validated and fingerprinted when the server opens the database. It is a reviewed, bundled inventory, not a live scan of npm or installed exports. Installing a newer build or restarting the server never silently updates existing records.

## Review and apply

1. Open Inventory updates in either family. The preview reads the database without writing. Both views show the same additions, full initial specifications, saved/proposed implementation lists for both families, retained entries, and conflicts.
2. Resolve any name collision through the normal specification editor, then refresh the preview. A missing bundled ID whose name is used by a different saved ID blocks the entire update. Existing IDs retain their user-edited names.
3. Review the changes and select “I have reviewed these inventory changes.” Applying is unavailable until that review, and remains unavailable while applying or when the preview has conflicts or an error. Every refresh clears the review choice.
4. Apply the exact preview. The server recomputes it inside `BEGIN IMMEDIATE`, compares its token, and writes all changed records and history in one transaction. Any error rolls back the whole batch.
5. Inspect the saved records and revision history. Package metadata differences appear alongside editable-field comparisons. Opening an old revision as a draft retains current implementation metadata when saved.

The preview token fingerprints the bundled inventory and the complete saved registry state. Any concurrent record edit or creation invalidates it, even if unrelated to a proposed change. Refresh and review again after a 409 response. A token is a consistency check, not an authentication credential. The server only accepts the token; submitted change lists or records do not supply inventory content.

If a response is lost, the UI cannot know whether the transaction committed. It disables replay and asks for a fresh preview. A committed batch then appears as already reflected, with no duplicate revisions. A failed batch remains available for review. Refresh failures have an explicit retry. Unsaved editor drafts keep the existing discard/cancel protection when navigating to this workflow.

## Exact mutation policy

| Situation | Result |
| --- | --- |
| Bundled ID is absent and its name is free | Create its validated experimental specification, implementations, and revision 1 |
| Saved ID has new/different bundled metadata | Merge by family/platform/package, taking the bundled version and published/workspace state for matching keys; append one revision |
| Saved specification differs from its bundled initial specification | Preserve every editable field, including name, targets, maturity, evidence, migration, and family decisions |
| Saved implementation is absent from the bundle | Retain it and expose it under Other saved implementations; the bundle does not confirm its availability |
| Saved component is absent from the bundle | Retain it; no deletion or retirement is inferred |
| No inventory changes remain | No writes, timestamps, or history entries change |
| Name conflict, stale preview, or storage failure | Apply nothing |

A changed bundled initial specification does not replace an existing specification. This is intentionally an additive inventory update, not a destructive reconciliation or a general-purpose import. Removed exports, retired implementations, per-entry selection, and audit actors remain subsequent work. Reviewed JSON specification import and current-state export round trips now have a separate [file-validation, provenance, and conflict policy](import.md); the bundled-inventory API never accepts arbitrary source files. No update promotes maturity, publishes a package, fetches a remote inventory, or changes the source sites.

The SQLite schema remains version 1. Stop/copy/restore backups still preserve the complete database and history. Export remains a current-state JSON snapshot without full history.

## API

- `GET /api/inventory/preview` returns schema version 1, source label, full inventory SHA-256, preview token, changes, conflicts, retained implementations, and unchanged saved-record count.
- `POST /api/inventory/apply` accepts `{ "token": "<preview token>" }` and returns applied-record count, current components, and the resulting preview.
- Invalid/missing tokens return 400; stale tokens or name conflicts return 409; unexpected storage failures return 500. Existing Host/Origin checks, loopback binding, JSON content type, and request-size limits remain in force.

Tests upgrade an isolated earlier inventory, preserve edited stable contracts and unrelated availability, exercise simultaneous changes, block collisions, force a failure after partial writes to verify rollback, reopen real SQLite files, and simulate an HTTP response lost after commit. They never modify a user's registry.
