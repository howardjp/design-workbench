# Registry contract

Schema 1 · Experimental

Both family views call the same API and edit the same SQLite database. There is no browser-local data replica. Only the light/dark preference uses localStorage. The default local service listens on 127.0.0.1:4173 and rejects unexpected Host and Origin headers and cross-site requests. JSON writes are bounded to 64 KiB. The server is local-only and unauthenticated; team hosting is future work.

## Record

| Field | Contract |
| --- | --- |
| id | Immutable slug, derived on creation from name |
| name | Unique without case distinctions, 2–80 characters |
| summary | 20–600 characters describing the task |
| category | Layout, Input, Navigation, Feedback, Data, Overlay, Content |
| maturity | proposed, experimental, stable, deprecated |
| targets | Nonempty unique list from CSS, Astro, React, Vue, Svelte, Native, Editors; intent, not availability |
| acceptanceCriteria | 20–4000 characters, one verifiable requirement per line |
| evidence | Up to 2000 characters; stable requires at least 20 characters documenting human-reviewed evidence |
| martletNotes / krigsvoldNotes | Up to 4000 characters each; independent design decisions |
| migration | Up to 4000 characters; deprecation requires at least 20 characters explaining the transition |
| implementations | Read-only inventory of family, platform, package, version, and published/workspace availability |
| revision / updatedAt | Server-assigned integer revision and UTC timestamp |

The server validates every mutation independently of the client. Creation ignores supplied inventory/revision/id metadata. Editing preserves implementation metadata; changes to target platforms never assert that an implementation exists. Evidence is human-authored, not machine-certified. The initial 29 records combine the 17 Astro exports with the 13 React exports (Button overlaps), with both families represented. New records start without implementation claims.

## API

| Method and path | Behavior |
| --- | --- |
| GET /api/components | Ordered complete inventory |
| GET /api/components/:id | Current record |
| POST /api/components | Create from `{record: draft}` |
| PUT /api/components/:id | Save `{record: draft, revision: expectedRevision}` |
| GET /api/components/:id/history | Latest 20 snapshots, newest first |
| GET /api/export | Schema-versioned JSON of latest records; no history |

Writes return the saved record. Validation uses 422 with field errors; stale revision uses 409; malformed JSON/revision uses 400; an unknown record uses 404. Only successful writes append history. Record and history commit in a single SQLite transaction. SQLite schema version 1 is recorded with user_version. Newer schemas are refused. Initial seeding occurs only at schema creation; upgrades must never overwrite user records implicitly.

The overview derives actual counts and per-family/platform coverage from the same saved records. Its missing-evidence action opens a filtered inventory. It records no synthetic adoption or activity metrics.

## Acceptance criteria

1. Both family routes expose identical records, filtering behavior, fields, and validation rules.
2. Search matches component name, purpose, or category; maturity, intended-platform, and usage-evidence filters intersect. Name, lifecycle stage, and update date columns support explicit sort order; changing filters or ordering resets bounded pagination. No-match results explain recovery and offer Clear filters.
3. Inspecting a record shows its requirements, selected-family implementation inventory, family decisions, and revision history. Availability and maturity remain separate.
4. Editing preserves entered values after validation, transport, server, and revision-conflict failures. Invalid fields have associated errors and a focused summary; successful writes have a polite status.
5. Creating a component requires a valid unique name and complete specification. Reload confirms creation without fabricated availability.
6. Saved changes survive browser reload and complete store close/reopen. Stale concurrent edits cannot overwrite a newer saved revision.
7. Navigation away from a dirty draft offers a discard choice. The in-app dialog has an accessible name, initial focus on Keep editing, Escape dismissal, and native focus containment/restoration. Full-page navigation uses the browser's unsaved-change prompt.
8. At 320 CSS pixels, fields and actions wrap and the document does not overflow. Tables can scroll in a named keyboard-focusable region. Both light and dark modes use the same semantic structure.
9. Reduced-motion preference removes transitions. Visible keyboard focus, labels, landmarks, and skip navigation remain usable. Automated accessibility checks supplement manual review.
10. Export contains a schema version and actual saved records. Full backups preserve SQLite and history through the documented stop/copy/restore procedure.

Known boundaries: no authentication, remote deployment, history restoration UI, JSON import, package publishing, source-site mutation, automated inventory synchronization, or claims of sustained production usage. These are explicit subsequent work, not hidden effects of Save.
