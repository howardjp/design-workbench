# Browser specification drafts and workspace settings

Experimental · October 22, 2026

The workbench protects unfinished specification fields in versioned browser storage when protection is enabled. This includes invalid/incomplete inputs and the original editing specification/revision, plus a marker for a write whose outcome may be uncertain. The marker is written synchronously before a save request begins when storage is available. Registry records and history remain in SQLite; a browser copy is not a committed record or a database backup.

## Recovery contract

A distinct editing session has its own UUID/key. Returning to the same browser address offers named, timestamped Restore/Discard actions. Nothing is restored or written to the registry automatically. Restoring an existing contract first reads its saved record; failed reads retain the offered copy, navigation cancels late reads, and an older-than-base or wrong-identity response is refused. A changed base or uncertain existing-record write requires the ordinary explicit field comparison before saving. A restored copy gets its own protection key so two tabs do not overwrite the same active draft. Original copies are removed only after the restored copy is protected. When protection is off, the original offered copy is retained until Save or explicit discard; subsequent editing remains memory-only.

The saved specification must still pass normal field, evidence, uniqueness and optimistic-revision validation. Restoring historical content does not import implementation/review metadata from browser storage. Successful Save and resolved matching content remove the active recovery copy. Deliberately discarding an active edit removes its copy; unrelated sessions remain. Returning a draft to its unmodified base clears its unnecessary copy. Storage failures are visible and do not disable ordinary server saves or erase the in-memory draft. Malformed/oversized/future-schema copies are isolated and retained for explicit removal.

For an uncertain new-record write, Save stays locked until a fresh inventory check. Matching normalized fields return to the saved component without replaying creation or appending history. A matching name/identifier with different fields requires deliberate comparison as an existing-record edit, or a changed name and another check. No match permits an ordinary validated retry, with the server's transactional uniqueness check still authoritative. This confirms current content, not the identity of a request or exactly-once processing. A late original creation still encounters the same unique-name/identifier constraints.

## Settings pattern

Settings is a real application consumer for Switch and Tabs in both packages. It saves the default starting section, default inventory page size, and whether future specification drafts are protected. An explicit URL section overrides the default. Saved page size applies to the current inventory and on reopening. Preferences are shared by both family routes at the same origin; already-open tabs use their loaded preferences until reopening. The header retains the separate appearance control.

Tabs use manual activation: arrows/Home/End move focus; Enter/Space select a panel. Panel contents stay mounted and preserve unsaved values. Changes participate in the application's unsaved-navigation dialog. Save has visible success or a focused error, retains choices on storage failure, and can be retried. Reset discards only unsaved preference choices. Unknown/corrupt preferences use explained safe defaults until explicitly replaced by Save.

The recovery switch has a fixed visible name and native checkbox behavior with role=switch. Turning it off stops future automatic protection after settings are saved; existing recovery copies remain. Clearing all browser recovery copies is a separate action with a modal confirmation whose default is Keep. It affects only the versioned draft keys, including copies from other tabs; those tabs may write new copies on their next edit. Saved SQLite contracts/history, preferences, appearance and unrelated browser data are retained. Clearing keys is not transactional; if browser storage fails midway, the application reports partial failure and refreshes the remaining offers.

## Scope and limits

Copies are scoped to a browser profile and exact origin, including port. They are not bound to a cryptographic database identity. Confirm the intended registry when restoring after replacing a database at the same address; identity/revision checks cannot distinguish identical cloned records. Browser clearing, eviction, unavailable/quota-limited storage, a new profile, or another port can prevent recovery. There is no cross-device sync, encryption layer, background server save, draft expiry, or operation attribution. Each envelope is limited to 65,536 UTF-16 code units before sanitization; only declared draft fields are restored.

Readiness-observation drafts, selected comparison choices, import selections and unsaved settings are still memory-only. Reloading a comparison recovers the specification fields and base, then requires a fresh comparison. Clearing browser copies is not a replacement for backing up the stopped SQLite database.
