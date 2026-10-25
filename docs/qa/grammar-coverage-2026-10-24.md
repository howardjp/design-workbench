# Grammar coverage and gap review

October 24, 2026 · Experimental grammar 0.3

This review follows the source consolidation and evaluates each independent language against its adopted charter, observed origin objects, actual component exports and complete UI transitions. The work adds focused reference patterns within the design documentation. Cardfile and new application development remain deferred.

## Canonical review set

| Language | Canonical grammar, coverage and patterns | Astro boundary documentation | Main reference |
| --- | --- | --- | --- |
| Martlet | [core PR 4](https://github.com/martlettheme/npm/pull/4), `bbd30eb29daddfb8f706693d5afa7858bed97d8e` | [Astro PR 3](https://github.com/martlettheme/astro/pull/3) | [reference PR 8](https://github.com/martlettheme/martlettheme/pull/8) |
| Krigsvold | [core PR 4](https://github.com/krigsvoldtheme/npm/pull/4), `9834910bf3eb37b314b2eacce00d939112951dd2` | [Astro PR 3](https://github.com/krigsvoldtheme/astro/pull/3) | [reference PR 7](https://github.com/krigsvoldtheme/krigsvoldtheme/pull/7) |

Each canonical `docs/coverage.md` and `language.json` records eighteen reviewed domains. Status distinguishes documented source behavior, clarified rules, checked reference compositions and open consumer/manual evidence. Grammar 0.3 remains experimental. Core 2.2.0 and Astro 1.2.0 remain unreleased candidates; React stays at its existing experimental 0.1.0 API and theme 2.1.0 dependency.

## Findings and resulting changes

| Finding | Before | Resolution |
| --- | --- | --- |
| R01 Grouping and action placement | Intent was described, but substantial form composition was underspecified. | Explicit field/group/region, density, assistance and command placement rules; two-group validated form. |
| R02 Layer behavior | Foundations required a backdrop for every overlay. | Separate inline disclosure, non-modal popup and native modal contracts. Only the modal receives the modal background/focus contract. |
| R03 Target-size claim | Foundations claimed every new React target was 44 by 44 pixels. | Describe 44px as a design target for standalone actions; distinguish WCAG minimum/exception assessment from an unmeasured global assertion. |
| R04 Role availability | Foundation prose still located relational aliases only in React. | Record the core candidate's opt-in source-profile aliases while retaining experimental maturity. |
| R05 Pending query scope | Collection/editor examples did not specify a changed request alongside previous results. | Separate draft controls, requested scope and committed results; keep prior data labelled during pending/failure, with explicit retry. |
| R06 Selection scope | No complete query/page/selection composition existed. | Stable-identity selection on the committed page; reset on changed scope commit, retain on failure/unchanged refresh; no unsupported select-all/mixed-state API. |
| R07 Focus and cancellation | Individual dialog/error examples did not exercise the complete combined workflow. | Summary-to-control focus, changed-reset confirmation, failed preparation, Escape/cancel, return focus and invalidation of late completion. |
| R08 Framework claims | Shared rules could be mistaken for equivalent controllers on every platform. | Per-pattern availability explicitly separates React interactive references, core roles and Astro native-HTML/host-script guidance. |
| R09 Enlarged text in the host | Narrow documentation identity and local context padding could force overflow. | Martlet identity can wrap and its narrow header enters document flow; context padding adapts to available width. New pattern headings wrap at enlarged sizes. These are documented host/context translations. |

## Independent composition

Martlet's form follows a bounded reading sequence through related decisions. Semantic groups use readable headings and proximity; the cream guidance context follows the work. The comparative table is selected for its task and is not a universal collection presentation.

Krigsvold gives request details, response preferences, query, results and commands explicit regional jobs. Comparable information aligns within each region; supporting scope guidance may sit beside the work when both retain useful width. Boundaries explain a change in purpose and do not surround every field.

Both languages retain the same native form, table, checkbox and dialog semantics, plus top/side/focused frame options. Comfortable density is demonstrated in both. Neither gets arbitrary opposite behavior merely to appear different. No new palette or replacement mark is introduced.

## Reference surfaces

- `?page=patterns` exercises a substantial form: four linked validation errors, retained values/preferences, pending submission, simulated failure/retry, saved state and changed-reset confirmation.
- `?page=patterns&pattern=results` exercises draft/applied query, grouping/sort, paging, old-results retention, failed retrieval/retry, no matches versus empty source, current-page selection, preparation failure/cancel/success and late-completion cancellation.
- `?page=patterns&pattern=coverage` renders the canonical eighteen-domain coverage inventory and remaining evidence.
- The existing collection/editor and component examples remain available. The draft guard in the form covers specimen reset; leaving the surrounding documentation unmounts and resets the example. Requests and preparation are simulated, not remote services.

## Implementation agreement and provenance

The cores own grammar, source decisions, pattern contracts and coverage. Main references render exact pinned copies with hash and generated-heading checks. React reference layouts remain independent while sharing sound state logic. Existing package APIs and defaults are retained; no new React export is added and no Astro Form or query controller is invented.

MCP and builder bundles contain 56 references each: the existing 53 plus validated-form, query-results and coverage references. The catalogue exposes grammar version 0.3 and canonical hashes. Offline references are checked against the same canonical files. Personal Skills installation is a separate save operation; downloadable bundles do not imply it succeeded.

## Validation method and limits

Reference browser checks exercise actual exported components through complete transitions, not only static specimens. They include both appearances, 320px layouts, 200% text, 400% text at a 1280px viewport, native error links, focus return, cancellation, retained selection and automated accessibility. The new reference suite runs alongside the existing workbench suite in each CI browser. Main-reference checks include one page h1, all eighteen coverage rows, detailed pattern contracts, narrow reflow and existing consent behavior.

Local checks use the pinned temporary Chromium runtime; CI uses official Playwright browsers. No observed test result establishes sustained use or manual assistive-technology support. Actual results belong in the PR validation record and CI artifacts.

## Deliberately open

Compact density, complete figure/footnote/maths/archive vocabulary, dashboard breadth, large/remote datasets, real server conflicts, localization/RTL, manual assistive technology and sustained consumer use remain open. The new examples improve grammar coverage without promoting it to stable. Hosted MCP, public plugin distribution and package publication are separate distribution work; this review does not silently perform releases or change the private review audience.
