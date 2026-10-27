# npm adoption guidance reconciliation

Verified on October 26, 2026 (America/New_York), October 27 UTC.

Both public React packages resolve `latest` and `next` to 0.1.0. Workbench main was a01fa72db2ed9d3cfb97476694050f66784f4477. The live Martlet MCP still reported React unpublished and source 8d1e9b3e0991ad5568fb3f950e4789d17848cc0b.

The distribution record now identifies npm publication and uses exact-version installation. Getting-started output consumes that command. Offline React setup and regenerated plugin references retain the immutable GitHub archive URL and checksum as an alternative, explicitly distinguishing that checksum from npm bytes. Canonical historical snapshots and adoption evidence remain unchanged. Active workbench generator repository references use k3jph.

The external React consumer check now installs each package from npm in a fresh directory, checks registry resolution and theme 2.1.0, repeats npm ci, builds, and exercises real exports. It separately verifies the existing public archive checksum. Local Chromium passed for both families: validation and linked errors, retained failed-save input and retry, guarded reset and modal focus, light/dark, 320/360/1280 widths, enlarged text and automated axe checks. This is implementer regression evidence, not the fresh independent four-project adoption retest.

Local validation: check (build, docs build, 92 Node tests), compiled hosted MCP checks, and both extracted agent archive checks passed. No npm version or package release is created by this documentation correction. The next justified React release must still establish post-transfer trusted publication. macOS rendering and manual accessibility reviews remain open.
