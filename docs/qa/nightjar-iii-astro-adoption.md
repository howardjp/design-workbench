# Nightjar III: Astro package adoption and starter safety

This is an offline review package. It does not publish, deploy, push to either family repository, alter authority, or change the frozen workbench candidate `80a5635abe4de7a07a1983de0b3ef796b101e047`.

## Inventory

- Martlet Astro checkout: `ed1f121ae991fd868e757228664d1c3a737c3c10`; package `@martlet/astro` version `1.2.2`, peer theme `^2.2.2`, Astro `^5.14.0 || ^6.0.0 || ^7.0.0`. Its pinned CI theme source is `7e130a937b730292e940deb4c41a9b164ef0b0a2`.
- Krigsvold Astro checkout: `af57afbc6413d7690cea8a839c7c0e1d48e2730c`; package `@krigsvold/astro` version `1.2.2`, peer theme `^2.2.3`, same Astro range. Its pinned CI theme source is `86e610a6f5f79115d740d1c989fcbc71c1ef52f4`.
- Registry metadata on October 31, 2026 reported both family Astro packages at `latest: 1.1.0`, `next: 1.2.2`. Treat channel choice explicitly; a local fix to 1.2.2 is not published automatically.
- Each package exports layout, structure, reading, table-of-contents and site-header/footer components, and a five-route starter (`/`, `/article/`, `/documentation/`, `/layouts/`, `/form/`). The form behavior is host-owned starter JavaScript, not a reusable package Form API. Neither package supplies the workbench's 50 recipes, dashboards, scientific workspace, or the Nightjar II custom form-validation controller. Those require host application code and shared fixtures; this is a material adoption and conformance gap, not an absent import to invent.
- Both checked-in `verify.yml` workflows trigger on pull requests and main pushes and use read-only contents permission; `publish.yml` triggers on published releases and calls npm publish after verification. The connector rejected deployment-API requests (`INVALID_ARGUMENT`); absence of commit-status entries does not prove that external apps, webhooks or preview deploy triggers are absent. Thus the family branches have not been pushed. A workbench reviewer can inspect these patches before an authorized operator chooses an appropriate source-repo delivery path.

## Reproduced registration safety defect

Each starter describes its registration as local, but static markup gave the form active controls with `novalidate` and no method/action override. With JavaScript disabled, a synthetic Martlet submission was observed at a local HTTP server as a GET containing the supplied name, email and access-note values. Both family packed-starter browser runs, with Playwright `javaScriptEnabled: false`, failed the new pre-fix assertion that registration controls are disabled. No actual personal data was used. The initial test draft misspelled Playwright's option and its failure was discarded; the corrected baseline was run afresh.

The local candidates keep form controls disabled in the HTML, show an unavailable explanation, and only enable controls and set `noValidate` after all listeners are installed. This protects disabled JavaScript, blocked inline scripts (tested with a `script-src 'none'` CSP), and a deliberately interrupted setup; it preserves native constraint validation until enhancement, protects the no-navigation promise, and does not change theme styling or turn the specimen into a server-backed form. Once initialized, the original keyboard/focus, validation, simulated failure, retry, reset and appearance checks continue to apply. This is a starter safety change, not a fix to the 50 workbench recipes.

Local family commits, both based directly on the source revisions above:

| Family | Local commit | Export |
| --- | --- | --- |
| Martlet | `66e543b6f6b5a04c4e29dac1ab3191876805075b` | [martlet-safe-form.patch](nightjar-iii-astro-patches/martlet-safe-form.patch) |
| Krigsvold | `65504010638330c3f93a2b28221698a5526bef40` | [krigsvold-safe-form.patch](nightjar-iii-astro-patches/krigsvold-safe-form.patch) |

Both patches passed `git apply --check` against the exact clean source heads. Both family `npm test` suites passed (three tests each). Clean packaged-consumer starter builds and Chromium browser smoke passed for each family with Astro 5.18.2 and 7.4.4, Node 24.19.0, and their respective pinned, locally built theme sources. This covers six viewport widths, light/dark modes, enlarged text, keyboard, form validation/retry/reset, no-JS, CSP-blocked scripts, partial setup failure and automated axe checks. Firefox, WebKit, actual assistive technology and physical printing were not run in this local assessment. No visual baseline was approved. A clean `npm audit` is not claimed to resolve repository security alerts or assess published Workers.

## Reproducing the patches

Use an isolated, clean checkout of each existing Astro repository at its exact base above and inspect the patch. From that checkout, substitute the local path to this review package:

```sh
git apply --check /path/to/workbench/docs/qa/nightjar-iii-astro-patches/martlet-safe-form.patch
git apply /path/to/workbench/docs/qa/nightjar-iii-astro-patches/martlet-safe-form.patch
npm ci --ignore-scripts --legacy-peer-deps --no-audit --no-fund
npm test
MARTLET_CORE_SOURCE=/absolute/path/to/built/pinned-martlet-theme MARTLET_BROWSER=1 PLAYWRIGHT_EXECUTABLE_PATH=/path/to/chromium node scripts/smoke.mjs
```

For Krigsvold use `krigsvold-safe-form.patch`, `KRIGSVOLD_CORE_SOURCE` and `KRIGSVOLD_BROWSER`. Use the pinned theme revision and lockfile before building it; the smoke script packs the theme and Astro package, installs them in a temporary starter, builds it and executes browser assertions. `npm install` used by the temporary starter may fetch Astro and its dependencies; these are **not** offline-install tests. No command above pushes or publishes. To roll back a local application use `git apply -R` on the exact same patch after checking the worktree; do not reset or overwrite unrelated work.

## Remaining maturity gaps

The starter's hard-coded root-relative example links are not subpath-safe: a Martlet starter built with Astro `base: '/preview'` emitted `/article/` and `/form/`, which escape `/preview`. The two package starters share this source pattern; a separately validated paired change is needed before claiming subpath adoption. A workbench-independent adapter must map the canonical fixtures and contracts into a consumer app rather than treating the five starter routes as 50-recipe conformance. Review current source-site Astro 7 / Node >=22.19 security PRs and host build/runtime settings independently; this package test uses Node 24 and does not validate Cloudflare configuration. Manual accessibility, real browser zoom in Firefox/WebKit, released-site artifact updates and external deployment settings remain open.
