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

## Early findings and rehearsal evidence

An initial independent inventory reports that the registry's React `0.1.0` packages and the frozen workbench's unreleased packages both declare `0.1.0` but have different built JavaScript, declarations and CSS. A local tarball under that name/version is therefore not the published artifact; replacing or publishing that version is not an available cutover. The source-site/theme and Astro version ownership map is being verified against exact repository and registry snapshots.

Initial local-only Jekyll snapshots have passed root/subpath link checks, safe mode, sanitization, archive rebuild without Git metadata and unsafe-file rejection. Network tracing observed no network calls during the tested builds, but network-namespace isolation was denied, so this is observation rather than enforced isolation. The candidates and verification are being refined; their final exact revisions will be recorded separately.

Initial local-only React snapshots built and packed with no workbench checkout, passed isolated tarball rendering and a Chromium packed Tabs exercise, and produced JS/types/CSS matching the frozen workbench builds. A no-Git archive also installed offline with a warmed npm cache. These findings do not establish all component, browser or 50-recipe conformance. The repository-independent runner prototype has exercised 200 Jekyll static routes across both families and root/subpath; it explicitly marks absent Astro/React inputs and does not label static checks as full behavioral or accessibility conformance.

The Astro package review reproduced a potential privacy defect in both existing starter registration forms: when JavaScript is unavailable, the enabled form can send entered values in a native GET despite its local-only notice. Isolated family fixes and no-JavaScript/blocked/partial-initialization regression tests are in progress; no deployment or package publication has occurred.

The corrected Astro baseline test confirmed the no-JavaScript case and a synthetic same-origin GET containing the supplied name, email and note. A prior test invocation had incorrectly spelled Playwright's `javaScriptEnabled` option; that invocation is not used as evidence. A CSP-based blocked-script test is necessary because Astro can inline its script. The family repository workflows permit PR verification and publish on published releases, but external preview integrations could not be ruled out through the available deployment API; changes are being preserved as local commits and reviewable workbench patches rather than risking an unauthorized deployment.

[Draft #44](https://github.com/k3jph/design-workbench/pull/44), head `8ef98f849e4515ab9e5d9fa92ae737029c272d38`, provides the exact authority/version inventory and a reproducible 370-path Jekyll source/manifest map. Its checker also validates copied bytes and source-shell provenance; a synthetic mutation was detected. [Draft #45](https://github.com/k3jph/design-workbench/pull/45), head `f26a7c7575a4f6b44b6d9b4a53f401f00d6e91ed`, provides standalone React materialization and a PR-only, read-only three-browser packed-consumer rehearsal; browser jobs are pending. The local React snapshots are `af9b22320cca37b8d39951a071b2a2813655a926` and `8e639da4b4ad2ef6f5fe5ea87c9a2809b656cc6f`; these private local tarballs are not the published `0.1.0` artifacts. [Draft #46](https://github.com/k3jph/design-workbench/pull/46), head `c1e1fa29e242d708d73f5331c3aa0ac499ea4e06`, documents reproducible Jekyll materialization and local patch exports. Its final local candidate commits are Martlet `3a2edc64aa46c38069f5479d0816cb12d54269a6` and Krigsvold `bb5c940495320db59769180bbd76341b4dbddb0f`; fresh materializations reproduced their trees, and observed offline, safe-mode, archive and security checks passed. These snapshots deliberately retain baseline `80a5635`, not later pending fixes.

A clean-room Jekyll adoption exercise also reproduced an axe `landmark-unique` violation: the People directory section and its nested table region share an accessible name. A source-level correction and cross-framework regression are being prepared; no axe assertion was weakened. The runner's final-head Jekyll pass covered 200 static routes, content/semantic sections, links, dashboard data and experimental results across families and root/subpaths. Its absent independent Astro and React gallery targets remain explicitly untested; frozen workbench reference implementations are not independent family packages.
