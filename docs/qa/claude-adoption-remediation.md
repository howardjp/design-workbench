# Independent adoption: repairs and remaining evidence

Baseline: [Claude's report at prism7 commit 6649c63](https://github.com/howardjp/prism7/blob/6649c63/adoption/REPORT.md). That exercise used Astro packages and separately labelled theme-only React reconstructions. It did not exercise the actual React component packages. Its browser harness records many observations; those records are not equivalent to assertion-based acceptance.

Grammar remains experimental 0.3. Core 2.2.2 and Astro 1.2.2 are the repair preview; React components remain 0.1.0 on their tested theme 2.1.0 dependency. Publication, artifact availability and grammar maturity are separate fields.

| Finding | Repair / disposition | Evidence route |
| --- | --- | --- |
| X1 public sites blocked in Claude's sandbox | Environmental limitation retained; MCP now includes complete installation paths so a blocked website need not block adoption. | MCP manifest, platform:React, platform:Astro; no claim to change Claude's network policy. |
| X2 / RM1 / RK1 React availability | Public release tarballs exist. Add exact URL, SHA-256, install command and tested dependency to manifests and platform:React. npm publication remains pending; do not claim it succeeded. | Public release byte verification and fresh locked consumers in test-public-react.mjs. |
| X3 forms outside React | Add core forms.css, included in full.css, with exact native field/hint/error/fieldset/choice/action/summary/notice/dialog anatomy. Host controllers remain explicit. | Packed Astro /form/ starter; both appearances, axe, reflow, keyboard and recovery assertions. |
| X4 / RM2 direct HTML classes | Publish native-html.md, including base/modifier classes, reading/sidebar/footer anatomy and source order. Retrieve through platform:HTML. | Canonical snapshot and exact MCP retrieval; packed consumers use documented classes. |
| X5 choice geometry | Exclude choice and non-text input types from generic text-field geometry. Choice wrappers retain native inputs and usable label targets. | Rendered choice height/minimum assertions in both appearances. |
| X6 mixed version labels | Correct current grammar/package labels, preserve version independence, provide pinned platform guidance and explicit React dependency boundary. | Canonical language.json, distribution metadata and platform references. |
| X7 registry README | Package READMEs are shipped. Baseline queried an unqualified registry field, which does not establish the rendering of the next release. Observe registry metadata after publication; do not infer a website result. | npm metadata observation; keep separate from tarball/source availability. |
| X8 starter discovery | Document npm pack/extract/copy and installed node_modules locations. | Astro README and platform:Astro. |
| A1 native Button type, both families | Resolve native attributes once, preserving explicit submit/reset and default button. | Exact emitted-HTML attribute count and real form/dialog activation. |
| A2 Martlet anchor button | Remove the redundant source-profile anchor-color override so button text retains its own role. | Rendered anchor/action color equality plus axe. |
| A3 Martlet dark eyebrow | Use a semantic dark-appearance role while retaining source light gold. | Axe in the real native form specimen. |
| A4 fragment focus | Document explicit focusable target headings. | Existing contents/skip checks; content author owns IDs and heading hierarchy. |
| A5 appearance ownership | Document nearest data attribute, initial preference and persistence as host policy. | Both-mode specimen assertions; no new framework controller claim. |
| K1 secondary action cascade | Primary source-profile defaults use inheritable variables; modifiers and disabled states retain precedence. | Nested appearance, primary/secondary/disabled material and axe checks. |
| K2 supporting sidebar composition | Let supported indexed body use available width, retaining bounded prose and container-based wrapping. | Actual side-by-side supporting-region geometry, narrow reflow and enlarged text. |
| K3 field-label role | Record Roboto .9rem/1.5 700 as an application extension, distinct from navigation eyebrow typography. | Source decisions and forms.css; no origin-observation claim. |
| K4 native legend boundary | Keep real legends; separate successive Krigsvold task regions with a leading boundary and region separation. | Native starter grouping, reflow and axe checks. |
| RM3 real component contracts | Run fresh consumers of exact public React archives, not rebuilt workspaces or replicas. | All three engine CI jobs download/hash/install/build and assert real exported fields, summaries, notices and dialogs. |
| RM4 host navigation/draft policy | Continue to state host ownership. No new routing controller is exported. | Form/reset specimen is bounded; complete production routing/persistence remains host work. |

The new checks can expose defects in the consumer specimen too. In particular, retry must move focus before its failure summary disappears, rather than testing for focus in an already hidden region. Success alone must not steal focus. Native fieldset.disabled is inspected directly, and the contained input's operability is checked separately.

Passing these checks does not close manual screen-reader, forced-colors, RTL/localization, print, touch-device or sustained consumer evidence. A [fresh independent retest](claude-adoption-retest.md) remains necessary. Preserve the original first-attempt log and report rather than retroactively declaring that attempt successful.
