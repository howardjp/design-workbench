# Operation Nightjar progress ledger

## 2026-10-29 — baseline and continuation

This campaign builds on `feat/portable-page-archetypes` at `4935a11`. Work is isolated on local branch `nightjar/audit`; the existing branch has not been modified. Its catalog contains 50 matched recipes, including analytics, administration and operations dashboards for each family. The shared catalog, fixture, contracts, generator and Jekyll source live in `examples/page-archetypes`; the standalone Jekyll exports live in `examples/jekyll`.

### Repository and framework inventory

| Repository | Inspected main commit | Role / evidence |
| --- | --- | --- |
| `k3jph/design-workbench` | `aafd9a8` | Experimental React packages and reference apps; feature branch contains the canonical portable catalog and Jekyll examples. |
| `martlettheme/martlettheme` | `b588542` | Martlet source site; existing `work/application-ports` branch preserved. |
| `krigsvoldtheme/krigsvoldtheme` | `fa4a66c` | Krigsvold source site; existing `work/application-ports` branch preserved. |
| `martlettheme/npm` | `0ee1de9` | Martlet core package, identified by source site as canonical. |
| `krigsvoldtheme/npm` | `5deb567` | Krigsvold core package, identified by source site as canonical. |
| `martlettheme/astro` | `ed1f121` | Astro package and starter; starter examples differ from the portable catalog. |
| `krigsvoldtheme/astro` | `af57afb` | Astro package and starter; starter examples differ from the portable catalog. |

The Astro starters include index, article, documentation, form and layouts examples, but they do not establish parity with this catalog. The workbench React reference apps demonstrate components and patterns but do not consume the catalog. Full Astro and React parity, including all dashboards, remains unimplemented and unverified. `examples/page-archetypes/PORTING.md` records the adapter boundaries; it is not evidence of implemented ports.

### Verified baseline

- `npm ci --ignore-scripts` succeeded.
- `npm run test:examples` passed: 50 recipes and their contracts, parity, destinations and shell hashes; shared dashboard data integrity; six dashboard model tests.
- `npm run check` passed, including builds and 110 Node tests.
- Regenerating the standalone Jekyll exports produced no tracked differences.
- Jekyll builds, browser, accessibility and visual checks remain to be reproduced in this environment. Ruby is absent from the base image; a user-local runtime is being built.

### Release and access boundaries

The npm and Astro package repositories have release-triggered publication workflows; the workbench also has release-triggered publishing and a manual candidate workflow. Do not trigger releases, publishing or deployment. Shell `gh auth status` reports the configured `GH_TOKEN` invalid; public clones work. The separate authenticated GitHub connector reports push permission for the seven repositories, but no write has been tested. Preserve local commits and use `git format-patch` for export if needed.

### Next actions

1. Build both locked Jekyll projects and run root/subpath link, dashboard browser, responsive and automated accessibility checks; record actual outcomes and fix confirmed defects.
2. Reconcile all recipe and dashboard capabilities against Astro and React, and implement ports using the shared contracts after the Jekyll baseline is stable.
3. Expand adversarial, accessibility, responsive, performance and component checks, documenting limitations and avoiding unreviewed visual baselines.

### Pagination recovery

The administration URL accepts a `page` parameter. A fractional value such as `?page=1.5` previously produced a fractional page label and sliced the wrong records. The shared collection model now accepts only safe integer pages, defaulting invalid values to page 1 while retaining normal bounds clamping. Both generated Jekyll exports were synchronized. The model regression test passes for fractional, non-finite and nonnumeric values; a paired browser regression has been added and awaits execution with the Jekyll builds.
