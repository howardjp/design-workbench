# Technical field guide in Martlet

`FieldGuide.tsx` is a standalone React reading page using the installed `@martlet/react` API, its styles, and the packaged theme fonts. `field-guide.css` supplies only local composition and the optional larger text setting. Mount the component once as the document's main landmark. `index.html` and `preview.tsx` provide an isolated preview; `dist/index.html` is its production build.

## Guidance and provenance

Applied `/root/.codex/skills/remote-skills/martlet-builder/SKILL.md`. The workbench's local stdio MCP server was available and used for `get_manifest`, task-oriented `search_guidance`, and exact `get_reference` retrieval. Complete grammar, source decisions, relevant component contracts, Article/Field examples, and compatibility are retained in `references.json`.

The manifest identifies family **martlet**, React snapshot **0.1.0**, theme **2.1.0**, and source digest `9f97c894b5fb813e8a5f8819d73fe08737420ab44a7981147796304f5f40b814`. Its `sourceCommit` is **null**; a commit is not inferred from the snapshot version. The decisions reference separately identifies original source commit `32b7166a629ea696147d0d779d911b713e4baf7e` in `k3jph/k3jph.github.io`. React support and application grammar remain experimental; the React package is unpublished.

| Classification | Guidance used or task choice |
| --- | --- |
| Source rule | Package Article supplies Cambo prose at 1.075rem/1.72 with a 48rem measure, source headings and short section rules. Interface text uses Lato. Package colors, links, controls and focus treatment are retained. |
| Source rule | `TableOfContents variant="index"` precedes body content, with unnumbered depth-2 sections and depth-3 subordinate headings. Package CSS supplies the wide left index and container-dependent narrow cream index. Supporting annotations remain separate from navigation. |
| Contextual translation | A focused page suits one short technical reading task. No global application navigation or identity mark is invented. A nearby cream annotation ties a qualification to its passage without assigning it to the index. |
| Application extension | Field hint/error linkage, native Select/TextInput/Checkbox controls, ErrorSummary, and Notice use the experimental package contracts. Fields use group spacing; the component's error text and summary preserve the draft and identify the correction. |
| New task choice | Original troubleshooting passage; a linked annotation with a return action; standard/large prose; optional annotations; and a required 5–90 minute whole-number reading goal. These are product decisions, not inherited Martlet rules. The annotation is ordinary semantic HTML, not a claimed shipped footnote API. |
| New task choice | Apply commits settings to this visit; cancel restores the applied draft. Reload resets settings. Draft changes survive in-page section navigation; a browser unload guard protects changes before reload/leaving. No network save is performed, so transport failure/retry states are outside this specimen. |

## Verification and limits

Passed targeted TypeScript checking against installed declarations, an isolated Vite production build, and server rendering with the actual package. Static checks verified one main/h1, subordinate index items, native select/number/checkbox markup, label targets, and all fragment destinations. `verification.json` records results; `rendered.html` preserves rendered markup.

Commands from the workbench root:

```sh
./node_modules/.bin/tsc -p test-results/reconciled-skill-use/martlet/tsconfig.json --noEmit
node test-results/reconciled-skill-use/martlet/build.mjs
node test-results/reconciled-skill-use/martlet/verify-static.mjs
```

`verify.mjs` contains the browser checks, but its run stopped before page execution because neither the expected Playwright browser nor system Chrome/Chromium is installed. No dependency was installed. Validation interactions/focus, apply/cancel, annotation navigation, responsive rendering, 200% text, reduced motion, axe, and screenshots are therefore **not verified**. Manual assistive-technology, localization/RTL, forced-colors, and sustained-use evidence also remain open. Only the light reading page is implemented; complete-page dark mode is an explicit experimental extension in the guidance and is not claimed here.

All created files are within `test-results/reconciled-skill-use/martlet/`. No packages, shared documentation, skills, other fixtures, or live sites were modified; no deployment was performed.
