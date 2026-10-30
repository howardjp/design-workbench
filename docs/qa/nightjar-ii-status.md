# Operation Nightjar II progress ledger

## Baseline and boundaries

The review baseline is frozen [PR #20](https://github.com/k3jph/design-workbench/pull/20), commit `5138a89fc2956d9019d5bd720c987b8b9e24533b`, tree `b0b513513d81106fe174b03ad1a21009a727e664`. Nightjar II work starts on new branches based on that commit; #20 and the earlier #18/#19 layers are not modified. No main merge, package/archive publication, deployment, or production-control change is authorized by [issue #21](https://github.com/k3jph/design-workbench/issues/21).

The Nightjar I [decision report](https://github.com/k3jph/design-workbench/blob/nightjar/release-readiness/docs/qa/nightjar-release-readiness.md) records the candidate's successful workbench and portable CI, independent checks, release gate, 18 incomplete contrast results in each Firefox/WebKit smoke run, and unresolved Dependabot and Worker/agent artifacts. Those results apply to the recorded candidate and do not establish success for later Nightjar II commits.

## Work queue

| Package | Initial state | Evidence and next gate |
| --- | --- | --- |
| A — publication safety | In review | Develop a fail-closed proposal and nonpublishing validation; no live workflow or protected-environment changes. Main integration remains unauthorized. |
| B — history state | Reproduced independently | A Jekyll analytics initialization replaced a seeded host `history.state` with `null`; audit other dashboard/search writers and verify paired failure/recovery without assuming one framework's behavior proves another. |
| C — contrast and visual | Investigation | Classify Firefox/WebKit incomplete results with context and measured evidence; retain unresolved human-review cases. |
| D — supply chain | Investigation | The 65 alert records still need authorized access. Current candidate archive reproducibility and generated Zod dependencies are being tested independently; do not equate lockfile audit with bundled artifact coverage. |
| E — components and developer experience | Investigation | Review public packed consumer behavior and contracts without homogenizing families. |
| F — Jekyll extraction | Planning | Refine ownership, shared inputs and migration gates; no repository creation or authority transfer. |
| G — adversarial engineering | Queued | Select demonstrated high-value boundary failures after the preceding packages have evidence. |

Local runtime: Node `v24.19.0`; Ruby is supplied by `/workspace/nightjar/toolchains/ruby-3.2.3-install/bin` with gems in `/workspace/nightjar/toolchains/gems`; `/usr/bin/chromium` is available. Firefox/WebKit local availability must be checked rather than inferred from hosted results. Root and Astro `npm ci --ignore-scripts` succeeded on the Nightjar II working tree. The candidate worktree and its branch were clean at this checkpoint.
