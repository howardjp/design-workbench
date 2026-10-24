# Fieldnotes directory

`Directory.tsx` exports one React component using the actual installed `@martlet/react` **0.1.0**, `@martlet/theme` **2.1.0**, and React **19.3.1**. The sibling HTML/JS files are an isolated verification harness. No existing project source, package, or configuration was edited for this demo.

The side rail keeps small, persistent contact groups available. Collection → reading → editing gives each person's context a bounded reading space; there is no comparison task requiring simultaneous panes. Field relationships use the package's 0.5rem field, 1.5rem group, and 2.5rem region roles. Compact list padding uses the existing 1rem foundation step. Lato carries interface work, Cambo carries names and working notes, and the shell retains its selective Cinzel brand role. Semantic package colors and original package styles supply both themes. Fieldnotes is an adopting application's text identity, with no invented Martlet mark, palette, or hero.

Search covers name, role, email, and notes within the named group. Reading/back retains the group, query, and opener focus. Choosing a group deliberately starts an unfiltered collection. Empty groups and no matches have distinct recovery. Explicit reading actions avoid ambiguous row activation.

Validation retains fields and focuses linked errors. The optional, clearly labelled demo control fails one save, retains the draft, and exposes Retry save; retry commits and announces completion. Pending saves disable navigation and editing. A changed editor guards back, group changes, and cancellation with a native modal whose safe initial choice is Keep editing; Escape preserves the draft and returns focus to editing. Explicit discard continues the requested transition. Reload protection uses native `beforeunload` while dirty. Multiline notes survive saving. All people are synthetic, all addresses use `example.test`, and no network or messaging operation occurs.

## Guidance and provenance

Applied `/root/.codex/skills/remote-skills/martlet-builder/SKILL.md`. No Martlet tools were connected, and the local MCP entry point lacked `mcp/catalogs` at inspection, so the skill's offline fallback was used: experimental application grammar **0.1**, React **0.1.0**, theme **2.1.0**. APIs were checked against the installed package declarations and implementation. The workbench Git HEAD was `97592e679f1e44338463b579ade224ae3caafbde`; the working tree already contained changes, so HEAD alone does not identify that source snapshot.

SHA-256 reference fingerprints:

- Bundled grammar: `8a375826e45ddbd79b1b8dcd52740871b595af7442949f146586c59b77d36883`
- Bundled component contracts: `2da7487a02d765769d9044e34623369df46bfaec84eddfd97d9f7cf3070eafb0`
- Consumed package `dist/index.js`: `5f1e3db40480e6de880eceaf928497449cf8ce4a2b12c8b42ef19a142b402a2f`

## Verification

Run from the workbench root:

```sh
./node_modules/.bin/tsc --project test-results/skill-use/martlet/tsconfig.json --noEmit
./node_modules/.bin/vite build test-results/skill-use/martlet --outDir dist --logLevel warn
node test-results/skill-use/martlet/verify.mjs
```

TypeScript and the production build pass. The script serves that production build, exercises the complete workflow in existing Playwright Firefox 1555, checks focus and no horizontal overflow, writes `verification.json`, and captures multiple states. It checks wide/narrow light and dark collection views, reading, validation, retained failed save and retry, modal keep/Escape/discard, empty recovery, 320px layout, 200% base text, long unbroken content, and reduced motion. Axe reports zero violations in seven tested frames; there are no browser page errors. Screenshots include reading with grayscale and the application brand hidden, for hierarchy review.

Firefox requires test-process-only `MOZ_DISABLE_CONTENT_SANDBOX=1` and `--no-sandbox` in this container. WebKit could not start because host libraries are absent; no dependencies were installed. Manual screen-reader, mobile-device, real browser zoom, forced-colors, localization/RTL, and cross-browser usability checks remain open. Enlarged-text checks change the base font size, rather than browser zoom. This is an experimental session-only consumer: durable storage, backend retrieval/failure, concurrency, creation, removal, and routing are outside its scope. Automated checks and screenshot inspection do not establish production accessibility or sustained usability.
