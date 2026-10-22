# Changelog

## Unreleased — experimental 0.1.0 preparation

- Two independent React component families and one local SQLite design-system workbench.
- Twenty-two experimental exports per family, including native Switch and manually activated Tabs used by workspace settings.
- Registry editing, history, reviewed imports/inventory updates, specification reading, readiness observations/queue, and explicit conflict recovery.
- Fresh reads for queue entry, including records added in another window; failures retain selection and navigation cancels late reads.
- Browser specification draft recovery with explicit restore/discard, separate editing-session copies, storage-failure feedback, and revision-safe restored editing.
- Inventory checks after uncertain creation, resolving matching saved content without replaying a save. This does not establish request attribution or a general exactly-once protocol.
- Saved browser settings for starting section, inventory page size, future draft protection, and confirmed clearing of browser recovery copies.
- Browser-selectable regression configuration; all claimed results and manual-review gaps belong in docs/verification.md.

No npm publication, remote hosting, or stable component certification is claimed. SQLite schema 2 and API/export schema 1 remain unchanged.
