# Review queue

Working implementation · October 22, 2026 · Experimental · MIT

Choose Review queue in either family, or open `/martlet/?view=queue` and `/krigsvold/?view=queue`. Both read the same local registry and offer the same content and behavior. The queue does not write records or history. Reviews still save only through the existing revision-safe editor.

## Saved positions and effective outcomes

`GET /api/reviews/queue` returns schema/policy version 1, a generation timestamp, compact entries, and whole-snapshot counts. One `store.list()` SQLite SELECT supplies every record; derivation never mixes separate per-record reads. The response is no-store and uses existing loopback/origin restrictions. Query filtering and pagination happen in the client; this endpoint returns the full local inventory. There is no new database migration.

| Position | Meaning | Current outcomes |
| --- | --- | --- |
| Not recorded | No local review metadata | Six Not reviewed |
| Needs renewal | Saved policy/basis no longer matches the identity, contract, or implementation inventory | Six Not reviewed; earlier saved counts explicitly historical |
| Current basis | Saved observations match the current policy and content fingerprint | The six saved outcomes, including partial reviews and Needs work |

Whole-snapshot counts and filtered-result counts have different labels. Six current passes is a count of recorded assertions, not verified evidence, availability, maturity, or release permission. Historical passes never enter that count. No observations are fabricated in the seed. Review notes remain in the editor/history; the queue response includes only outcome IDs and summaries.

## Find and open work

Search matches name, purpose, and category. Review position, current outcome, and area filters intersect. Any area means at least one of the six checks has that outcome. A selected area only narrows a selected outcome; with Any outcome, it does not exclude records (the interface explains this). Attention first orders renewal, current Needs work, absent reviews, current partial reviews, then six current passes. Name/id break ties deterministically. Component name orders alphabetically.

Ten results appear per page. Filtering or ordering resets to page one; missing/invalid/out-of-range pages normalize to a valid bounded page, including after a refreshed inventory shrinks. Empty results offer Clear queue filters. The `rq-search`, `rq-position`, `rq-outcome`, `rq-area`, `rq-sort`, and `rq-page` URL parameters retain state across reload, family navigation, review entry, and return. Search is bounded to 200 characters. Defaults are omitted; unrelated routing parameters remain. Browser back/forward filter history is not implemented: edits replace the current URL.

Current area outcomes disclosures expose all six results for each component. Review links enter the existing editor and fetch its latest specification/review. A queue snapshot can become old; it is never a write lease. The editor's expected revision and conflict/uncertain-save recovery still apply. Unsaved observations require the existing Keep editing/Discard changes decision when returning to the queue. A saved review appears after returning or explicitly refreshing the queue.

Initial loading and explicit refresh are cancellable. A failed refresh retains the previous snapshot, its timestamp, and filters. An alert explains that it may be old and offers retry. Navigation cancels late responses. There is no polling or claim of live synchronization. The surrounding workspace inventory header uses its separately loaded records; the queue's own timestamp/counts describe its authoritative snapshot.

## Presentation and component contract

Martlet groups each result in two spacious editorial columns with its action below. Krigsvold aligns contract, position/outcomes, and action in three regions with a leading rule. Typography, shell navigation, and spacing remain independently composed beyond palette. At narrower widths both reflow to one column. The queue's Pagination is the nineteenth experimental export in each React package: native bounded previous/next buttons, labelled navigation, polite page position, disabled state, and forwarded native nav props/ref. It does not fetch or route.

Build/types, Node derivation/HTTP/no-write checks, real browser workflows, keyboard paging, URL reload/family transfer, retained failures, cancelled late loads, fresh review entry, unsaved navigation, empty states, exact content parity, measured family composition, 320/1440px light/dark axe/reflow, and enlarged text/spacing are automated. See verification.md for checkpoint results. Manual screen readers, actual browser zoom, non-Chromium/mobile, forced colors, RTL/localization, print pagination, sustained use, authenticated reviewers, and automated assertion verification remain open. All packages stay unpublished/experimental; the service remains local and unauthenticated.

The partial viewport captures in `docs/qa/martlet-queue.jpg` and `docs/qa/krigsvold-queue.jpg` show the same real seeded inventory, with no saved review observations. After build, reproduce with `node scripts/capture-review.mjs queue` (or set PLAYWRIGHT_EXECUTABLE_PATH). The remaining records and pagination continue below the images.
