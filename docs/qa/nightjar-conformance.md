# Nightjar conformance evidence snapshot

Snapshot of evidence through workbench commit `b923078` (October 28, 2026). The machine-readable [matrix](nightjar-conformance.json) contains all 300 example × language × framework cells. Each table entry below applies to both Martlet and Krigsvold because the cited suites ran both; visual identities were not compared for pixel equality.

**B**: route generated and checked in the recorded build; **I**: at least one relevant interaction was exercised; **A**: automated axe checks were run on this example; **R**: recorded responsive checks include this example. A dash means this snapshot does not attribute that check to that specific example. Every I, A and R is partial evidence, not a comprehensive pass. The catalog suites check all 47 content routes at 320px for Astro and React; dedicated suites cover dashboards. The Jekyll baseline checked every generated route and local link; its dashboard suite includes reflow checks. Some additional Jekyll non-dashboard sweeps are documented in the ledger without a per-route result set, so they are not attributed here.

No cell claims complete visual conformance, manual assistive-technology review, or performance conformance. Limited screenshot reviews and local transfer-size measurements are recorded in the [progress ledger](nightjar-status.md); these do not establish full coverage. Automated axe checks and a route build do not certify accessibility, behavior, visual parity or release readiness. Error-page examples demonstrate content and do not set host HTTP error statuses. Other engines, complete interactions, screen-reader testing, print-on-paper, source-shell fidelity and cross-framework comparisons remain open.

| Example | Jekyll | Astro | React |
| --- | --- | --- | --- |
| home | B — — — | B — A R | B — A R |
| about | B — — — | B — — R | B — — R |
| article | B — — — | B — A R | B — A R |
| archive | B — — — | B I A R | B I A R |
| category | B — — — | B — — R | B — — R |
| categories | B — — — | B — — R | B — — R |
| person | B — — — | B — A R | B — — R |
| projects | B — — — | B — — R | B — — R |
| case-study | B — — — | B — — R | B — A R |
| documentation | B — — — | B — — R | B — — R |
| guide | B — — — | B — A R | B — — R |
| reference | B — — — | B — — R | B — A R |
| contact | B — — — | B I A R | B — A R |
| faq | B — — — | B I A R | B I A R |
| privacy | B — — — | B — — R | B — — R |
| terms | B — — — | B — — R | B — — R |
| service | B — — — | B — — R | B — — R |
| place | B — — — | B — — R | B — A R |
| pricing | B — — — | B — A R | B — A R |
| careers | B — — — | B — — R | B — — R |
| opportunity | B — — — | B — — R | B — — R |
| software | B — — — | B — — R | B — — R |
| product | B — — — | B — — R | B — — R |
| collection | B — — — | B — — R | B — — R |
| collection-item | B — — — | B — A R | B — — R |
| events | B — — — | B — — R | B — — R |
| event | B — — — | B — A R | B — A R |
| report | B — — — | B — A R | B — — R |
| gallery | B I — — | B I A R | B I A R |
| changelog | B — — — | B — — R | B — — R |
| search | B I — — | B I A R | B I A R |
| sign-in | B I — — | B I — R | B I — R |
| sign-up | B — — — | B I A R | B — — R |
| password-reset | B — — — | B I — R | B — — R |
| two-factor | B — — — | B I A R | B I — R |
| coming-soon | B — — — | B I — R | B — — R |
| not-found | B — — — | B — — R | B — — R |
| server-error | B — — — | B — — R | B — — R |
| workspace | B I — — | B I A R | B I A R |
| chat | B I — — | B I A R | B I A R |
| sensors | B I — — | B I A R | B I A R |
| fleet | B — — — | B I A R | B I A R |
| scene | B I — — | B I A R | B I A R |
| integrations | B — — — | B — — R | B — — R |
| stress-test | B — — — | B — A R | B — A R |
| patterns | B — — — | B — A R | B — — R |
| dashboard-analytics | B I A R | B I A R | B I A R |
| dashboard-components | B — — — | B — — R | B — — R |
| dashboard-administration | B I A R | B I A R | B I A R |
| dashboard-operations | B I A R | B I A R | B I A R |

See [the ledger](nightjar-status.md), [Jekyll verification](../../examples/page-archetypes/VERIFICATION.md), [dashboard contracts](../../examples/page-archetypes/DASHBOARDS.md), [Astro notes](../../examples/astro-slice/README.md) and [React notes](../../examples/react-catalog/README.md) for the scope and limitations of the recorded runs. This is a dated snapshot; regenerate only after reviewing new evidence, and update the snapshot identifier and evidence lists.

To check that the checked-in matrix still matches the canonical catalog and route inventories, run `node scripts/qa/nightjar-conformance.mjs --check`. A successful check verifies consistency, not that a historical browser test was rerun.
