# Concurrent specification recovery

Working implementation · October 22, 2026 · Experimental · MIT

An existing specification can change while another window retains a draft. The editor now offers Compare with latest saved record after a stale revision or uncertain existing-record response. Saving is locked until comparison or explicit discard/reload resolves the opened revision. The original draft remains in memory while comparing; it is not browser-local storage or a durable autosave.

## Three sources, explicit choices

The comparison fetches the latest full record through the existing GET endpoint. Each differing editable field shows its original editing base, normalized retained draft, and saved-now value. Markers distinguish changes in the draft and saved record. Even a change made only in the other window requires a choice. Radio options start unset: Use my draft or Use saved revision N. There is no automatic text merge, target-set union, chosen-default source, or force write.

Comparison follows stored-value rules: outer text whitespace is trimmed and target order is insignificant. Every editable field participates, including name, maturity, evidence, both family decisions and migration. Target lists are chosen as complete values. Identical values require no choice. Unknown identities, older revisions and invalid revision numbers cannot become an editing base. A same-id record with a later revision due only to readiness observations is legitimate.

Use choices as editing draft only updates local editing state. The latest comparison revision becomes the base, and the latest implementation inventory/readiness metadata are retained. The normal editor still validates combinations: choosing stable from one source and empty evidence from another does not bypass the evidence gate. Only an explicit subsequent Save can append a revision/history transaction. Another window can save after comparison; that save causes another normal conflict and preserves the prepared draft.

If normalized draft content already matches the latest saved record, Return to matching saved record accepts that read without writing another revision. This resolves a response lost after commit without replaying the save. It confirms content/revision, not authorship or which window performed the matching save. New-record creation with an uncertain response remains outside this existing-record workflow; verify the inventory before retrying creation. There is no durable operation ID or general exactly-once mutation protocol.

## Failures, refresh and navigation

Initial load/transport/identity failures retain the original draft and offer retry. Failed refresh also retains loaded context and comparison choices, but applying remains disabled until a successful retry. Refresh comparison and clear choices explicitly replaces context and clears choices only after success; choices must be made against that loaded revision again. The snapshot is not a lease, lock, or live synchronization claim.

Discard choices and return to my draft leaves the original editor values intact, with the save conflict/uncertainty still requiring recovery. The existing discard-and-reload path remains available. Global navigation and full-page unload preserve the unsaved-draft prompt; a comparison counts as unfinished work. Navigation/return cancels late reads. Initially focused comparison headings, linked missing-choice fieldsets, native radios, focused error summaries, disabled loading/application states and explicit return-to-editor focus support keyboard use. Comparison temporarily occupies the full workspace; the unchanged inventory returns afterward.

No new endpoint, schema, persisted draft, import authority, maturity promotion, review certification, publication or authenticated collaboration is introduced. Server-side validation, unique names, transactional history and expected revisions remain authoritative.

## Shared component and independent composition

DefinitionList is the twentieth experimental export in each React package. Native dl/dt/dd groups accept unique keyed term/description nodes and native dl props/ref. The component does not fetch, parse raw HTML, add headings/landmarks, or manage workflow state. Martlet lays three comparison sources beside one another with editorial spacing; Krigsvold uses aligned leading terms and vertically ordered source rows. Both use identical content and native choice contracts, collapsing safely on narrow screens. Both packages remain MIT source, private workspace manifests and unpublished.

Verification includes pure three-source/choice/normalization tests, all fields and no metadata injection, real SQLite save/reopen and repeated conflicts, native/ref consumer fixtures, packed package consumers, full browser workflows and failure injection, keyboard links/choices, exact content parity and measured family composition, plus light/dark 320/1440px axe/reflow and 200% text/text-spacing checks. See verification.md for checkpoint results. Reproduce visual fixtures with `node scripts/capture-recovery.mjs` after building (or supply PLAYWRIGHT_EXECUTABLE_PATH). The labelled fixture observations in captures are not production review evidence.

Manual screen readers, actual browser zoom, non-Chromium/mobile, forced colors, RTL/localization, print pagination and sustained consumer use remain open. The service stays unauthenticated and loopback-only.
