# Reading typography verification

`tests/reading-framework-typography.mjs` compares representative article, documentation, contact and sign-up pages in both families across Jekyll, Astro and React. It checks source heading font roles and responsive sizes, 320px and 1440px page overflow, form text sizing, browser errors, and 200% root text sizing on the Astro and React contact pages. This is a focused regression check, not a pixel comparison or a substitute for manual assistive-technology testing.

Prepare locked dependencies and root-path builds as described under “Cross-framework behavioral comparison” in [DASHBOARDS.md](DASHBOARDS.md), then run from the workbench root:

```sh
CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/reading-framework-typography.mjs
```

Set `NIGHTJAR_JEKYLL_ROOT` to the directory containing the two Jekyll builds. `NIGHTJAR_ASTRO_ROOT` and `NIGHTJAR_REACT_ROOT` optionally override the default Astro and React `dist` directories. Omit `CHROMIUM_PATH` when Playwright's Chromium is installed.
