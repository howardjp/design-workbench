# Nightjar III portable conformance prototype

This is an **offline-input, bounded static evidence runner**, not a replacement for the workbench browser suites and not proof of conformance, accessibility, visual equivalence or release readiness. It accepts separately maintained implementations at explicit full Git commit IDs and runs builds from fresh `git archive` snapshots with no `.git` directory or dependency on the original checkout at build time. It never fetches a repository or updates a ref. Pinned trees containing symlinks or Git submodules are rejected: their external targets could otherwise escape the recorded snapshot. Supply required sources as separate pinned repositories instead. Each family/framework/base case gets fresh copies of all pinned inputs, so mutations or generated caches from one case cannot become another case's source. Existing worktree changes are ignored by construction. A partial run lists every missing family/framework target; `--require-matrix` rejects anything short of all six.

The runner executes the manifest's commands as **trusted local code**, with the caller's environment and permissions. It does **not** sandbox those commands or enforce network isolation: an arbitrary build script could access the network or the filesystem. Use only reviewed inputs and commands, do not put secrets in the manifest or command arguments, and use an independently enforced network sandbox if an offline guarantee is required. The runner itself performs no remote fetch. Its browser context disables JavaScript and aborts network requests when inspecting HTML; the build remains a separate trust boundary. There is no remote-fetch mode in this prototype.

## Inputs and invocation

Use Node 24.19, Python 3, Git, tar, the workbench's locked npm dependencies (`npm ci --ignore-scripts`), the language-specific locked build toolchains, and a Playwright browser already installed. The commands below are illustrative: replace paths and commit IDs with the exact local repositories and commits being reviewed. Install the existing locked build dependencies in advance; the runner does not install them automatically. Put the manifest and the new output file outside the source repositories. A result path that already exists is rejected, so an unsuccessful rerun cannot be confused with earlier evidence.

```json
{
  "version": 1,
  "repositories": {
    "fixtures": {"path": "/absolute/workbench", "commit": "80a5635abe4de7a07a1983de0b3ef796b101e047"},
    "martlet-jekyll": {"path": "/absolute/martlet-jekyll", "commit": "3a2edc64aa46c38069f5479d0816cb12d54269a6"},
    "krigsvold-jekyll": {"path": "/absolute/krigsvold-jekyll", "commit": "bb5c940495320db59769180bbd76341b4dbddb0f"}
  },
  "fixture": {
    "repository": "fixtures",
    "catalog": "examples/page-archetypes/content/catalog.json",
    "dashboards": "examples/page-archetypes/content/dashboards.json"
  },
  "targets": [
    {"family": "martlet", "framework": "jekyll", "repository": "martlet-jekyll", "commands": [["python3", "nightjar/build.py", "--baseurl", "{base}", "--destination", "{output}"]]},
    {"family": "krigsvold", "framework": "jekyll", "repository": "krigsvold-jekyll", "commands": [["python3", "nightjar/build.py", "--baseurl", "{base}", "--destination", "{output}"]]}
  ]
}
```

```sh
CHROMIUM_PATH=/path/to/chromium node scripts/qa/portable-runner.mjs \
  --manifest /absolute/manifest.json --output /absolute/new-result.json --browser chromium
```

The example Jekyll commits are **local-only rehearsal commits**, not public repositories or a transfer of authority. The fixture pin belongs to the frozen Nightjar II workbench. For Firefox or WebKit use `--browser firefox` or `--browser webkit` with the matching Playwright-managed browser available; `CHROMIUM_PATH` only configures Chromium. `{base}` expands to an empty string or `/preview`; `{baseSlash}` expands to `/` or `/preview/`; `{output}` is a new absolute output directory; and `{source:name}` is the archived snapshot of any named input repository. Commands are argument arrays, run directly without an implicit shell, from the target's archived repository root. A target can use several ordered commands for an offline install, build and consumer harness. The output directory must contain the generated site root, including `examples/<id>/index.html` and the experimental scientific workspace. No command or revision is inferred from a moving branch.

For React and Astro, an independent **site consumer** of the candidate package must supply all those routes before a gallery target can be added. A library tarball or five-page starter alone is not a 50-example implementation. Include its package and consumer-harness repositories as separately pinned inputs, refer to their archived paths with `{source:name}`, and install/build the package offline using reviewed commands and pre-existing locked caches. A source pin alone does not prove that a consumer actually used it; inspect the commands and resulting artifact. If no such harness exists, leave the target out and report the gap. Do not copy a workbench-specific application into a family repository or treat a successful package installation as 50-route parity.

## What is checked

For each configured family/framework at `/` and `/preview`, the runner checks all 50 canonical route files with JavaScript disabled: one canonical heading and `main`, the canonical summary, section titles and representative structured text, table headers/rows/scope, image alt text, and dashboard fixture names and nonempty tables where applicable. The shared HTML verifier checks local `href`/`src` paths and fragments in every rendered HTML page. The separate experimental science route is checked for a heading and static result rows. Output symlinks and special files are rejected before traversal. The result records the exact repository commits and fixture hashes, commands, Node/browser version, source and verifier hashes, whether the runner checkout was dirty, per-build output-tree hash and per-route static status. Paths and outputs are temporary; the JSON report is written only after every configured case succeeds.

This does **not** validate interaction, hydration, keyboard/focus, interrupted events, JS-blocked behavior, cross-engine parity, visual identity, performance, contrast, axe, screen readers or physical print. It does not fetch external resources, compare all prose or all dashboard states, inspect CSS `url()` dependencies, or certify that a build command consumed the intended package. A 300-cell static inventory means 50 routes × two families × three supplied framework consumers; testing both bases yields 600 route checks. Each status is explicitly `static_content: checked`, not a general pass. The experimental route is tracked separately and is not the 51st canonical example. The 18 Firefox and 18 WebKit incomplete contrast results remain open.

Run `npm run test:portable-runner` for regression tests of pin validation, rejecting moving refs and incomplete matrices, preserving existing result files, and using committed bytes rather than dirty worktrees. Record the exact runner commit and clean/dirty state, manifest, input commits, toolchain, commands and result artifact in the campaign ledger. Continue to run the existing behavior, browser, package, accessibility and archive suites independently.
