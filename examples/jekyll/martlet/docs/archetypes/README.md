# Page archetypes

A portable, MIT-licensed collection of **50 page recipes** rendered independently by Martlet and Krigsvold. The fictional Northlight Field Institute supplies the same content to both. Neither family has capability exclusions.

## Source ownership

| Path | Owns |
| --- | --- |
| `content/catalog.json` | Authored content, semantic class, composition choice, sections, destinations, and fixture provenance |
| `contracts/catalog.schema.json` | Versioned data contract, section discriminators, and semantic requirements |
| `jekyll/_layouts/` | Eight composition frames: landing, reading, document, collection, detail, dossier, workspace, dashboard |
| `jekyll/_includes/examples/` | Section renderers and class-specific context such as article navigation and event details |
| `jekyll/assets/` | Shared interaction mechanics, original illustrations, and sample data |
| `families/<family>/` | Family composition rules and mapping to existing shell roles |
| `../jekyll/<family>/` | Complete standalone Jekyll projects, including their authoritative exported shell and generated adapters |

Edit canonical files here, then run `python3 examples/page-archetypes/scripts/sync.py` from the repository root. Do not hand-edit generated example pages or `_data/examples.json`. Generated exports are committed so each project remains usable without Node or Python. The sync operation overlays owned files and preserves unrelated site content; removing or renaming a recipe requires explicitly removing its old generated page too.

A semantic class describes what the content is. A composition describes how it is arranged. A new content class warrants a class-specific include or layout when it introduces meaningful required fields, ordering, behaviour, or accessibility semantics. A new colour scheme or hero illustration does not, by itself, justify a new template. Shared frames may support several classes.

## Run and verify

Install Node dependencies at the workbench root (`npm ci --ignore-scripts`). In each standalone Jekyll project, run `bundle install` using the checked-in lockfile. Then:

```sh
python3 examples/page-archetypes/scripts/sync.py
node examples/page-archetypes/scripts/verify.mjs
python3 examples/page-archetypes/scripts/build.py
python3 examples/page-archetypes/scripts/verify-html.py examples/jekyll/martlet/dist
python3 examples/page-archetypes/scripts/verify-html.py examples/jekyll/krigsvold/dist
```

The cross-framework long-content reflow check runs against already-built root-path sites. Set `NIGHTJAR_JEKYLL_ROOT` to a directory containing `martlet` and `krigsvold` Jekyll builds, build both Astro and React families at `/`, then run `CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/internationalization-stress.mjs`. Optional `NIGHTJAR_ASTRO_ROOT` and `NIGHTJAR_REACT_ROOT` select alternate paired output directories. The test checks multilingual unbroken titles and associated labels at 320 and 768 pixels in both LTR and RTL direction. It does not establish complete RTL, translation, locale formatting or assistive-technology support.

The same paired builds also support `CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/enlarged-text-motion.mjs`. It tests 200% root font size and reduced-motion emulation at 320 and 768 pixels across the three dashboards, including keyboard navigation, focus return and filter submission. Root font-size scaling is not browser zoom; these checks do not establish full reduced-motion or assistive-technology support.

Run `CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/gallery-link-contract.mjs` against those paired builds to verify modified image links, keyboard dialog focus return and direct image access without JavaScript.

Run `CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/dense-table-reflow.mjs` against the same builds to check 100-row, 19-column tables with long words at 320px. The check verifies useful column widths and a named, keyboard-scrollable region; users must scroll horizontally to inspect wide tables.

Simulation controls derive IDs from the unique section ID using reserved `_simulation-` and `_scene-` prefixes. Existing links to the former fixed `#simulation-mode`, `#ventilation`, or `#scene-view` control IDs must be updated.

For the multiple-simulation composition check, also install the locked Astro example dependencies with `npm ci --prefix examples/astro-slice --ignore-scripts`, then run `CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/simulation-composition.mjs` from the workbench root. Omit `CHROMIUM_PATH` if Playwright’s Chromium is installed. The check builds disposable fixtures; Ruby, Bundler and both Jekyll lockfiles must be available.

The build uses `bundle exec jekyll` by default. `JEKYLL_COMMAND_JSON` can select an installed Jekyll command as a JSON argument array. Builds also create a clean `dist/template.zip`, excluding Git, hosting identity, caches, dependencies, and prior output. Each standalone project can also be built with ordinary `bundle exec jekyll build --destination dist` (without regenerating the source archive).

See [porting](PORTING.md), [acceptance criteria](ACCEPTANCE.md), and [verification evidence](VERIFICATION.md). These examples are experimental, not a declaration that every role has been promoted into a stable component package.

## Coverage

Presentation: home, about, announcement. Publishing: article, archive, category, category index, changelog. People: profile, opportunities, opportunity detail. Research: project index, case study, reference document, report. Support: documentation index, guide, contact, FAQ, privacy, terms, search, integration guide. Commerce: service, place, plan comparison, software, product. Collections: index, object detail, exhibition. Events: index and detail. Accounts: sign-in, sign-up, reset, two-factor. Recovery: 404 and server-error specimen. Applications: observation workspace, messaging, station sensors, fleet register, scene viewer. Verification: stress test and section library.

The application specimens are intentionally local. Identity, messaging delivery, payments, bookings, device access, and immersive rendering require service adapters. The integration guide explains each boundary in both demos. No real organisation, vacancy, event, measurement, transaction, or scientific finding is represented by the fixture content.

The collection now includes three paired dashboard applications and their reusable capability reference. See [dashboard contracts](DASHBOARDS.md).
