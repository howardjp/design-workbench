# Operation Nightjar III progress ledger

## Baseline and authority

Work begins from frozen Nightjar II candidate [#37](https://github.com/k3jph/design-workbench/pull/37), commit `80a5635abe4de7a07a1983de0b3ef796b101e047`, tree `b65bf1fd31c277048e7e4542130f34f7b0416ed4`. It descends from the frozen Nightjar I candidate `5138a89fc2956d9019d5bd720c987b8b9e24533b`. The starting worktree was clean; hosted workbench run `41153829102` and portable run `41153829162` succeeded at this exact commit. These baseline results do not validate Nightjar III work.

The work order is [issue #42](https://github.com/k3jph/design-workbench/issues/42). No main push or merge, publication, tag, deployment, production-control change, source-authority transfer, or creation or population of remote family repositories is authorized. Jekyll and React extraction candidates are local rehearsals only; generated workbench paths remain authoritative until a separately approved transition. The two design languages retain distinct identities.

At this checkpoint Node is `v24.19.0` and the provisioned Ruby is `3.2.3`; network access follows the managed environment's enforced restricted policy. The 18 Firefox and 18 WebKit axe contrast incompletes, manual assistive-technology and physical-print checks, and individual default-branch Dependabot alert records remain open. The Nightjar II publication-control proposal is not active protection.

An independent local baseline at `80a5635` passed `npm ci --ignore-scripts`, `npm run check` (112 Node tests plus builds), `npm run test:examples` (50-recipe verification and 28 model/date tests), the Jekyll source-archive test, `update-source-manifest.py --check`, and the 300-cell conformance inventory consistency check. The latter validates the recorded matrix and inputs; it is not a fresh 300-cell browser or accessibility assessment. Exact commands use the pinned Ruby 3.2.3 and existing Bundler gems for the archive test.

## Workstreams

| Phase | Current status | Evidence and next gate |
| --- | --- | --- |
| 0 — authority inventory | In progress | Re-inventory exact repositories, versions, ownership, generated exports, fixtures and downstream actions. |
| 1 — Jekyll rehearsal | In progress | Produce two local standalone candidates and reproducible, offline build/archive evidence; no remote repositories or cutover. |
| 2 — React rehearsal | In progress | Produce two local package candidates and packed-consumer evidence; no package publication or ownership transfer. |
| 3 — Astro maturity | In progress | Inspect the actual family package repos and test justified fixes on isolated branches; no deployment. |
| 4 — independent conformance | In progress | Prototype explicit immutable pins and offline local inputs, maintaining truthful coverage. |
| 5 — clean-room adoption | Pending | Exercise each family/framework from documented artifacts; record missing APIs, metrics and limitations. |
| 6 — hardening | Pending | Verify cross-browser and adversarial contracts and preserve incomplete/manual classifications. |
| 7 — publication and migration | Pending | Prepare an independently reviewable plan and explicit approval gates; do not activate controls or move ownership. |
| 8 — extended queue | Pending | Continue evidence-led work without gratuitous abstraction or examples. |

This ledger records progress and does not itself transfer ownership or authorize integration. Individual branches and exact test results will be added as work is completed.
