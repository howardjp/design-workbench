# Contact-directory demo

`Directory.tsx` is one self-contained React component using the actual `@krigsvold/react` 0.1.0 exports, theme 2.1.0, and bundled Roboto family fonts. It supplies its own fictional Civic contact book identity. Two destinations use a horizontal AppShell; the task does not warrant the default side rail.

Search and team scope belong to the collection region. Compact aligned result rows use an edge and the word “Open” for the current record. A separate detail region holds reading, explicit editing, and object commands. Existing field, group, and region spacing roles preserve regional separation. At 48rem and below, opening a record replaces the collection and focuses its heading; Back to contacts restores collection focus.

Required fields use Field descriptions and a focused ErrorSummary with links to controls. Saving prevents duplicate submission. The separate Demo controls disclosure can fail one valid save; the editor retains every field and exposes Retry save. Changed-draft departures use a mounted native Dialog with Keep editing as its default action. Synthetic changes live only in component state and reset on reload. No external contacts, messages, or writes occur.

## Grounding

Read the installed `/root/.codex/skills/remote-skills/krigsvold-builder/SKILL.md` and its grammar, component, and source references. Also exercised the local stdio MCP server through the existing SDK: `get_manifest`, a task-oriented `search_guidance`, then full `grammar`, `pattern:collection-editor`, component/API/example, and token references. `retrieval.json` records those real responses. The manifest identifies family `krigsvold`, snapshot 0.1.0, theme 2.1.0, experimental React, source commit `null`, and digest `f896af673c9c4fd54bf2bc95f9ca027ba84b4032af7a0ef7c632c9259496c880`. A commit identity was not claimed.

## Observed checks

All commands ran from `/workspace/scratch/ea99548f98cf/workbench` using existing dependencies:

```sh
node_modules/.bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --jsx react-jsx --types node,vite/client test-results/skill-use/krigsvold/Directory.tsx
node_modules/.bin/vite build test-results/skill-use/krigsvold --outDir dist
node test-results/skill-use/krigsvold/verify.mjs
```

Strict compilation and production bundling passed. The isolated Vite/Playwright harness used the already installed `/tmp/chromium` binary because Playwright's default Chromium download was absent. No tools or dependencies were installed. Its 16 passing checks cover scope/search/counts/no-match/reset; open/read/edit; validation, summary and field focus; dirty record and navigation departures; Escape recovery; pending/failed/retry/success; multiline notes; discard continuation; dark appearance; 320px reflow and return; 200% root font size with a long draft and reduced-motion preference; mobile draft protection; navigation; fixture reset; and keyboard Tab/Enter activation. `verification.json` records no page errors and zero axe violations in failed-save/light and reading/dark states. Four screenshots were inspected for layout and state clarity.

## Limits

This is a session-only demonstrator with simulated persistence and transport failure. No loading service, collaboration, routing, create/delete operations, or durable storage is provided. The browser observations use one Chromium binary. Screen-reader announcement quality, every keyboard path, native unload prompts, browser zoom, Firefox/WebKit, forced colors, RTL/localization, touch, and sustained-use usability remain unverified. The 200% check changes root font size; it is not browser zoom. Axe and screenshots do not certify accessibility. Existing project sources were not edited; the component, harness, logs, screenshots, and build output are isolated under this directory.
