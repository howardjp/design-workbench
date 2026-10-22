# Independent React documentation apps

October 22, 2026 · Experimental 0.1.0 · MIT

The shared documentation source now builds two independent static React applications. Each contains all 22 real component specimens, searchable navigation, family light/dark modes, relevant state controls, reset actions, copyable standalone JSX, API contracts and keyboard/accessibility notes. A source-install guide explains that the packages are still unpublished.

| Family | Private review site | Proposed public home | Output |
| --- | --- | --- | --- |
| Martlet | https://martlet-react-reference.k3jph.chatgpt.site | https://react.martletdesign.dev | docs-dist/martlet |
| Krigsvold | https://krigsvold-react-reference.k3jph.chatgpt.site | https://react.krigsvolddesign.org | docs-dist/krigsvold |

Both review destinations are separate private Sites with terminal successful deployments from workbench implementation f0fdfe22991910deea6a1e03f9b603c620801407; exact Site source/deployment IDs are recorded in docs/verification.md. Public domains and DNS are not configured by this change. Neither npm publication nor changes to the originating websites are implied.

## Build and separation

```sh
npm ci --ignore-scripts
npm run build
npm run build:docs
npm test
```

`docs-app/vite.config.ts` selects one virtual family module at build time. It imports only that package, its CSS and its font bundle. Shared example/contract data remains common; dormant documentation layout rules describe the two compositions but do not import the other component family. Tests inspect emitted styles, tokens, font filenames and JavaScript to reject accidental cross-family packages or registry API code. The two outputs can be deployed independently to ordinary static hosts; query-based component routes and native section fragments require no server rewrite.

Martlet uses an editorial heading rhythm, horizontal masthead and paired reading/control specimens. Krigsvold uses a stronger leading rule, structured side rail, vertically arranged specimens and a two-column component index. Both retain native interaction contracts. The AppShell specimen runs in its own document so the documentation page never nests two main landmarks.

`npm run build:docs` derives its API/state text from docs/components.md. `tests/docs.test.mjs` checks the contract/export inventory, renders every specimen, and compiles and renders every standalone copied example in both default and altered states, including quotes, braces and markup-like text. The copy action falls back to focusing/selecting the read-only source if clipboard access is unavailable. Component state lives in the page; appearance preference is browser-local. No entered file is uploaded and no documentation interaction writes registry data.

## Hosting a review build

Each Site checkout retains its own `.openai/hosting.json` identity and static directory. Do not create another Site for an existing checkout. After source is committed and the documentation build passes:

```sh
node scripts/stage-docs.mjs martlet /absolute/martlet-site-checkout FULL_SOURCE_COMMIT
node scripts/stage-docs.mjs krigsvold /absolute/krigsvold-site-checkout FULL_SOURCE_COMMIT
```

Staging copies one output plus runtime/font licenses and records the exact workbench source commit in `source.json`. Publish the exact staged/pushed source and archive through the Sites workflow. It contains no SQLite service, admin data or authentication substitute. The local registry remains loopback-only.

## Validation limits

Source builds/types, all copied-example checks and output isolation are automated. Initial Martlet browser review covered the landing layout, navigation into Button, action feedback, disabled state and selected-source clipboard fallback. Further cloud-browser inspection was blocked by the browser URL policy. Theme attribute binding was corrected in the source review after those initial views; a complete final visual review of both sites, narrow layouts and dark mode remains open. Existing workbench browser/axe results do not certify these new documentation compositions. Manual screen readers, RTL/localization and sustained use remain open.
