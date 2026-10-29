# Scientific workspace ports

Jekyll and Astro build `/examples/scientific-workspace/` in both language families. This experimental, directly addressable page complements the React harness described in `examples/react-catalog/SCIENTIFIC.md`; it is not yet part of the 50-recipe canonical catalog or linked from its navigation. The catalog inventory remains unchanged. The shared template uses page-specific IDs and supports one instance per document; callers must not duplicate it without assigning unique IDs. A full visual, interaction and accessibility conformance review, manual screen-reader assessment and physical print inspection remain open.

The Jekyll include `jekyll/_includes/examples/scientific.html` is a trusted authored native-HTML template, shared directly by Astro as build-time source rather than copied from compiled Jekyll output. It contains a static default chart and table so blocked and no-JavaScript users can inspect the model's example output. The browser regression compares the initial table and chart points with the shared model. `jekyll/assets/js/thermal-model.mjs` is the common calculation and export logic used by all three frameworks; placing it in the canonical Jekyll source also includes it in the self-contained template archive. Jekyll and Astro use `scientific.mjs` for progressive enhancement. These controls remain disabled and the fallback remains visible until the module registers its handlers and renders the default data.

A failed calculation retains draft inputs and the last successful results, chart and CSV. Errors identify each invalid field and an error-summary link moves focus to it. A successful retry updates the run parameters, chart, table and CSV together. Values are synthetic, local and reset on reload. The model is illustrative and is not a measurement or engineering prediction. The shared template and stylesheet are an application extension using the host shells; separate family type and host conventions remain in force. The offline Martlet and Krigsvold builder guidance identifies forms and calculation controllers as host-owned native HTML in Astro; no React API is attributed to Astro.

After installing locked Node/Ruby dependencies and building the workbench packages:

```sh
export PATH=/path/to/ruby/bin:$PATH BUNDLE_PATH=/path/to/gems BUNDLE_FROZEN=true
node --test examples/page-archetypes/tests/thermal-model.test.mjs
CHROMIUM_PATH=/usr/bin/chromium node examples/page-archetypes/tests/scientific-ports.mjs
```

Omit `CHROMIUM_PATH` when Playwright's Chromium is installed. The browser regression builds both families × Jekyll/Astro × root/subpath and checks static-model agreement, invalid drafts, error-link focus, successful keyboard retry, actual CSV bytes, narrow/wide reflow, automated light/dark axe checks and blocked/no-JavaScript fallbacks. It checks for page errors and external requests on normal runs. Set `NIGHTJAR_SCIENCE_SCREENSHOTS` to an output directory for optional inspection; screenshots are not automatically approved as baselines. The separate React test covers its four family/root/subpath builds. These results do not establish complete accessibility or cross-framework visual parity.
