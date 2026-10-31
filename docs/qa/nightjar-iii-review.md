# Nightjar III review candidate — work in progress

## Decision and boundaries

[Draft integration #49](https://github.com/k3jph/design-workbench/pull/49) is based on the frozen Nightjar II commit `80a5635abe4de7a07a1983de0b3ef796b101e047`; the current integration head at this checkpoint is `f6a4b072c38fc6c2b5d21925eb17a6e2bc16fcf1`, tree `3042a994a22276aa014616393b8223e3b6dcdf27`. Recheck the PR head before using any result. This is a review candidate, not authority to merge, create remote repositories, transfer source ownership, publish, deploy, or modify production controls. The separate [progress ledger](nightjar-iii-status.md) is updated without changing the tested candidate.

## Review branches and implementations

| Draft | Disposition |
| --- | --- |
| [#43](https://github.com/k3jph/design-workbench/pull/43) | Progress ledger and this independently maintained review record. |
| [#44](https://github.com/k3jph/design-workbench/pull/44) | Exact seven-repository authority/release inventory and frozen 370-path Jekyll map. |
| [#45](https://github.com/k3jph/design-workbench/pull/45) | Local React extraction, provenance, private tarballs and packed consumers. |
| [#46](https://github.com/k3jph/design-workbench/pull/46) | Local Jekyll materialization, source archives, rollback and pinned follow-up snapshots. |
| [#47](https://github.com/k3jph/design-workbench/pull/47) | Reviewable offline Astro patch stacks for native-GET leakage and subpath navigation; no family-repo push. |
| [#48](https://github.com/k3jph/design-workbench/pull/48) | Fix duplicate Jekyll/Astro administration landmark names. |
| [#50](https://github.com/k3jph/design-workbench/pull/50) | Offline-input, immutable-pin conformance runner and bounded static evidence. |
| [#51](https://github.com/k3jph/design-workbench/pull/51) | Separate publication, adoption, deployment and repository-cutover approval boundaries. |
| [#52](https://github.com/k3jph/design-workbench/pull/52) | Paired React/Astro clean-room consumer scenarios and measurements, stacked on #48. |
| [#53](https://github.com/k3jph/design-workbench/pull/53) | Canonical Jekyll guide and paired standalone dashboard exercise, stacked on #48. |

The local-only, separately attributed final Jekyll guide snapshots are Martlet `9ae0b3609c82f1a27291d0934dab5ff4564ea9d0` and Krigsvold `6212d2bc076f959cd88e297023d40dff48dc6554`; earlier frozen and landmark-only snapshots and patch exports are preserved. The independent React local candidate commits are Martlet `af9b22320cca37b8d39951a071b2a2813655a926` and Krigsvold `8e639da4b4ad2ef6f5fe5ea87c9a2809b656cc6f`. The Astro review patches reconstruct local commits Martlet `3c43243653a1f5a3acf3bca23e776177a53e2402` and Krigsvold `9e2cced9b4397c04f444a864c8eda4c0b43e75b2`. None is a new remote repository or a released package.

## Evidence and limitations

The independent frozen baseline passed `npm run check`, the 50-recipe/model checks, archive tests, source-manifest check and 300-cell inventory consistency check. The integration at `2dfc3f6` independently passed `npm run check` (116 tests), Jekyll materializer and React extraction regression tests, 11 publication graph tests, the final separately named 370-path authority snapshot check, source manifest, conformance inventory and `git diff --check`. After runner hardening, current head `f6a4b07` passed `npm run check` (120 tests), eight focused adversarial tests, final authority snapshot, source-manifest and diff-whitespace checks locally. Jekyll and Astro landmark checks passed both families at root/subpath in Chromium. The Jekyll snapshots passed locked, git-free root/subpath builds and archive rebuilding, safe mode, hostile markup and unsafe-source rejection; strace observed no network calls with preinstalled locked gems, but a network namespace could not be enforced.

The hardened runner's 600 static Chromium cases use independent Jekyll snapshots and actual React/Astro package tarball bytes with explicitly pinned workbench-owned React/Astro gallery harnesses. Astro's harness imports the package Button surface; those apps are not independent 50-recipe implementations. Tarballs were extracted into preinstalled harnesses for that run. An intentionally corrupted heading was rejected. The separately pinned corrected Jekyll snapshots passed 200 additional static cases. The verifier now rejects encoded traversal and escaping HTML/index symlinks; the runner rejects altered Git replacement refs, untracked archive attributes and output-root redirection. Declared package-input consumption is explicitly `not_verified`: trusted build commands can ignore inputs. Build commands and network access are not sandboxed. Static route checks do not prove interactions, full API conformance, visual parity or accessibility.

Independent clean-room exercises used the same two-person directory in both families and all three frameworks with keyboard Apply/Clear, empty recovery, small-width reflow and static no-JS fallback. React and Astro additionally used whole-page axe in the documented tested states; Jekyll's true no-JS state was sampled via Chromium's accessibility tree, not axe. These are bounded synthetic applications, not the complete workbench dashboard or proof of sustained developer adoption. Firefox/WebKit for the new consumers and manual AT remain open. The React 320px local transfer was approximately 69.5 KB compressed JS for the composed article/directory application; client mount measurements varied widely and are not server hydration or production benchmarks.

At this checkpoint the exact integration hosted runs are workbench `41217168146`, portable `41217168162`, and read-only packed React rehearsal `41217168155`; all are queued. Earlier invalid React workflow run `41214797112` failed configuration before jobs; moving `runner.temp` to step-level environment produced valid focused run [41214866993](https://github.com/k3jph/design-workbench/actions/runs/41214866993), which passed generated standalone packed consumers in Chromium, Firefox and WebKit at #45 head `a0c62c2db73e57360c53f6ba56bfd52766b6a1e9`. The unavailable GitHub annotation means the exact configuration diagnosis remains an inference. This focused pass is not a pass for queued integrated-head jobs.

## Decisions and next work

Published `@martlet/react@0.1.0` and `@krigsvold/react@0.1.0` differ in JS, types and CSS from the unreleased candidate packages that declare the same version. Any eventual publication requires a distinct reviewed version and separate authorization. Astro `latest` is 1.1.0 while `next` is 1.2.2; current workbench Astro pins the latter and newer theme versions, while React pins theme 2.1.0. Do not represent unqualified installs as identical artifacts.

The family Astro fixes are local commits and patch stacks: external preview/deployment integrations could not be ruled out. Their five-page starter checks do not establish independent 50-recipe Astro parity. Jekyll and React source authority remains in the workbench until an explicitly approved cutover. The runner does not enforce network isolation for trusted build commands and currently depends on the workbench for the Astro/React gallery harnesses. New family repository names, access, owners, source history and release channels are unapproved.

The 18 Firefox and 18 WebKit contrast incompletes, manual AT, physical print, 65 administrator-restricted Dependabot records, historical bundled Workers and downloads remain open. The existing publication proposal is inactive; one pre-package gate alone may still permit later host adoption/deployment. [#51](https://github.com/k3jph/design-workbench/pull/51) details separate integration, release, adoption and deployment approvals, old workflow runs, four-repository staged cutover and rollback. No graph test proves live controls.

Before any separately authorized handoff: complete exact-head hosted checks; review the package/version collision and external hosting; settle one owner for each source, generated fixture and shared model; approve the four local candidates and staged repository creation individually; verify provenance, pins and rollback; independently validate publication protection; then seek separate authorization for each merge, release, adoption or deployment. No such action follows automatically from this report.
