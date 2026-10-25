# Krigsvold reading page

`FieldGuide.tsx` is a standalone React page using the installed `@krigsvold/react` 0.1.0 API, React 19.3.1, and theme 2.1.0. `main.tsx` and `index.html` supply an isolated preview; no package, documentation, skill, other fixture, or live site was changed.

## Guidance used

Read `/root/.codex/skills/remote-skills/krigsvold-builder/SKILL.md` and its grammar, component contracts, decisions, and source references. Then used the workbench's local Krigsvold stdio MCP: `get_manifest`, task-oriented `search_guidance`, and full `get_reference` retrieval for grammar, decisions, Article/TableOfContents, native form controls, Field, ErrorSummary, Notice, and examples. The complete retrieval record is `guidance.json`.

The manifest identifies family `krigsvold`, experimental/unpublished React 0.1.0, theme 2.1.0, and snapshot digest `1f2165d539e34ba484f7bc6accba36596fa097a4479ba0779616b8223a154694`. Its `sourceCommit` is null; the current workspace HEAD is `76130c227be4e9282ff13c8e8a064c51669c060a`. The retrieved decisions attribute original origin evidence to `basuhoward/krigsvold.org` commit `a3cf072c516c59ed35814e0fa153028cc91ceecd`; this task did not independently audit that site.

| Classification | Applied choice and purpose |
| --- | --- |
| Source roles retained through package CSS | Paper/ink canvas, Roboto editorial prose, Roboto Slab headings, bounded reading measure, native controls, and navy primary action. Mono appears only in technical code. |
| Contextual translation | A focused `AppShell` with `navigationPlacement="none"` gives sustained reading priority. Article's index precedes the passage and uses installed responsive styles. |
| Existing experimental application guidance | `TableOfContents` uses native fragment links with depth 2/3, unique IDs, and focusable headings. `Field` passes labels, descriptions, and invalid state to the actual native number/select controls. `ErrorSummary` receives focus after a rejected attempt; `Notice` announces successful application. |
| New task-specific choices | Original retry passage and linked/returnable annotation; a distinct preference region separated by a meaningful rule; standard/large passage size; annotation visibility; a required 5–90 whole-minute planning goal. These choices serve reading and are not claimed as origin rules. |

Preferences are synchronous and session-only. Draft changes stay visible until Apply; invalid input is retained and linked feedback explains recovery. Section/annotation navigation preserves the draft. Applying changes updates passage size, annotation visibility, and the displayed session goal; reload restores defaults. A timer, persistence, remote save, and full-page dark mode are outside this specimen's scope. No server save or artificial pending state is implied.

## Verification

From `/workspace/scratch/ea99548f98cf/workbench`:

```sh
./node_modules/.bin/tsc --noEmit -p test-results/reconciled-skill-use/krigsvold/tsconfig.json
./node_modules/.bin/vite build --config test-results/reconciled-skill-use/krigsvold/vite.config.ts
```

Both pass. The production preview is `dist/index.html` with local bundled assets. The isolated tsconfig adds Vite's CSS module declarations; it retains the workbench's strict settings. Existing packages were consumed without rebuilding or modifying them.

`verify.mjs` contains browser checks for fragment focus, native checkbox keyboard behavior, range/step/required validation, retained drafts, Apply success, annotations, narrow/enlarged text, print, runtime errors, and axe. Execution stopped before loading the page because Playwright's Chromium executable is missing; no dependencies or browsers were installed. A preinstalled Chromium can be supplied using `PLAYWRIGHT_EXECUTABLE_PATH`. These browser checks are prepared, **not passed**. Visual rendering, manual keyboard/screen-reader review, forced colors, non-Chromium behavior, localization/RTL, and sustained reading remain unverified.

Run the local preview with `./node_modules/.bin/vite --config test-results/reconciled-skill-use/krigsvold/vite.config.ts`; run prepared browser checks with `node test-results/reconciled-skill-use/krigsvold/verify.mjs` after an executable is available.
