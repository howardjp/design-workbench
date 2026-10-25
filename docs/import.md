# Reviewed specification import

Schema 1 · Import policy 1 · Experimental · October 22, 2026

Use **Export registry** to download the current saved records. In **Import specifications**, select a UTF-8 JSON export, choose **Preview import**, review every proposed field change and conflict, then acknowledge the policy and apply. Selecting a file reads it into this page's memory; Preview sends its text to the local service. Preview never writes records. Clear selected file removes the selection and returns focus to the native chooser. A reload clears the selection.

This workflow imports component contracts. Full database recovery still uses the stopped-server SQLite backup procedure in the root README. Imports cannot replace history or implementation inventory, delete missing records, or promote/deprecate a contract. Both presentations use the same import service, content, limits, and review choices.

## File contract and policy

The JSON envelope is `{schemaVersion: 1, exportedAt: "UTC ISO timestamp", components: [...]}` as returned by GET /api/export. The client rejects unreadable UTF-8 and files larger than 1 MiB; the server independently bounds the submitted UTF-8 text to 1 MiB and the file to 500 components. Empty arrays are valid no-ops. The UI does not split oversized exports; exports beyond these limits need smaller valid envelopes or individual editor review. A file label must have 1–180 characters without paths or control characters. Extensions and browser MIME hints are not validation.

Each component must have a unique exported slug ID (up to 160 characters), a positive safe-integer revision, a valid save timestamp, and all editable fields satisfying the normal registry contract. IDs and names must be unique within the file; names are compared without case distinctions. The server reports at most 20 field errors per invalid document. Unknown fields are ignored; nested content is never executed or rendered as HTML.

| Input | Applied behavior |
| --- | --- |
| Existing ID | Update only changed specification fields after source-revision and whole-preview checks |
| New ID | Preserve the supplied valid ID; create server revision 1 with maturity proposed and no implementations |
| Maturity | Retain the saved stage for an existing ID; explain any different source stage in the preview |
| Specification fields | Name, summary, category, targets, acceptance criteria, evidence, both family decisions, migration guidance |
| Implementations, readiness reviews, source revision/save time, unknown metadata | Never copied from the source; existing local review metadata is retained and can become stale after specification changes; server assigns the next revision and save time |
| Record absent from file | Retain without a write or new history entry |
| Unchanged specification | No write, even if the source revision is older; target order alone is not a change |

A retained stable stage still requires supporting evidence; retained deprecation still requires migration guidance. Import is not a way around those rules. Evidence text is a source assertion, not verification, and does not itself authorize promotion. Deliberate lifecycle changes remain in the specification editor.

## Conflicts and atomicity

A meaningful change to an existing ID requires its source revision to equal the current registry revision. Matching revision numbers do not establish shared lineage or authorship across independent databases: the explicit field diff remains essential. An older changed source must be refreshed or reviewed through the normal editor; there is no force-import option or automatic merge. Unchanged old snapshots are harmless, which permits a successful import to be previewed again without rewriting it.

The final names across imported and retained records must be unique. A single file may exchange two current names atomically, but cannot collide with a retained contract. Every conflict blocks the entire batch, including otherwise valid new contracts.

The preview token binds policy version, file label, submitted-text fingerprint, and the complete current registry. Application starts BEGIN IMMEDIATE and recomputes that preview before writing. A change to any saved record, source text, or label invalidates the preview. All changed records and history snapshots commit together; a mid-batch storage failure rolls them all back. A successful application returns the current records and a no-change preview. No-op application appends no history.

After any failed application, review is reset and application is disabled until Preview import succeeds again. If a response is lost after a commit, preview the same file again to see the actual saved state; do not replay a stale token. A committed import produces no further specification changes, while concurrent edits can produce conflicts requiring deliberate resolution. Preview transport failures retain the selected text for retry. File validation errors link back to the native chooser.

## Revision provenance

Every changed history snapshot has optional `change` metadata containing kind `json-import`, the selected file label, `documentHash` (SHA-256 of the submitted source text), and the export time stated in the file. These appear in the revision disclosure. The server's history timestamp records when the revision was actually saved. No schema migration is required: provenance lives inside the existing snapshot document.

The label and stated export time are untrusted descriptions. A fingerprint identifies submitted text; it is not a signature, a claim of authorship, or a hash of the original file bytes. UTF-8 decoding may remove a BOM, and formatting differences produce different text hashes. The full source text is not stored in the database. Current records and later ordinary saves do not inherit the provenance of earlier import events. JSON export contains current records only, so it does not transfer revision provenance or history. Keep the original source separately if an audit needs it.

## Verification and boundaries

Node checks cover real-export no-ops, validation/limits, immutable availability and lifecycle, stale source revisions and tokens, name conflicts/swaps, retained-stage support requirements, all-or-nothing rollback after a first write, restart persistence, provenance, and HTTP origin/body boundaries. Both browser presentations cover native keyboard file selection, review gating/focus, application/reload/provenance, stale preview recovery, committed-response loss, invalid JSON/UTF-8/oversize recovery, retry, clearing, unsaved-navigation protection, and long-content light/dark reflow and axe checks at 320/1440px with enlarged text and spacing.

FileInput remains a native file control; native dialog wording and appearance vary by platform. Manual screen-reader announcement, actual browser zoom, non-Chromium and mobile file choosers, forced colors, and sustained-use review remain open. This local unauthenticated service must remain on loopback. No remote upload store, audit actor identity, export signature, destructive synchronization, publication, or multi-user authorization is provided.
