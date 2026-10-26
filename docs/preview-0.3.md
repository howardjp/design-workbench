# Design language 0.3 preview

October 25, 2026. Martlet and Krigsvold are independently usable experimental design languages. This preview is a public invitation to build and review interfaces within their documented scope. It does not require a 1.0 version number and does not establish stable accessibility or unlimited pattern coverage.

| Language | Canonical home | Public React reference | MCP |
| --- | --- | --- | --- |
| Martlet | https://martletdesign.dev/ | https://martletdesign.dev/react/ | https://martletdesign.dev/mcp |
| Krigsvold | https://krigsvolddesign.dev/ | https://krigsvolddesign.dev/react/ | https://krigsvolddesign.dev/mcp |

The original theme domains remain compatibility entrances. Human pages redirect with their path and query intact. Existing `/mcp` connections and `/health` remain served directly. Origin checks allow each language's own canonical and legacy origins; the other family's origin is not implicitly allowed. Navigation, original marks, palettes, type roles, download formats and consent behavior remain independent.

The design-language and knowledge snapshot version is 0.3.0; grammar is 0.3. Package versions remain independent: Martlet core 2.2.2, Krigsvold core 2.2.3, Astro 1.2.2 and React 0.1.0. Core and Astro are published under npm `next`; initial React npm publication is pending. The React GitHub prerelease contains verified installable tarballs and checksums. A new language version does not silently promote package maturity or imply new component exports.

The public React documentation archive contains only its selected language's reference build, local fonts/assets, license notices, skill/offline downloads and source metadata. It contains no workbench administration service, database, user records or authenticated Site content. Private review Sites keep their audience. Each theme-reference build verifies the exact archive SHA-256 and safe contained paths before unpacking its `react/` directory.

Public installation can use the React prerelease directly:

```sh
npm install https://github.com/howardjp/design-workbench/releases/download/react-v0.1.0/martlet-react-0.1.0.tgz react@19 react-dom@19
# Or choose Krigsvold:
npm install https://github.com/howardjp/design-workbench/releases/download/react-v0.1.0/krigsvold-react-0.1.0.tgz react@19 react-dom@19
```

Framework APIs are documented separately. Astro supplies its shipped layout/reading components and host-controlled native interactions. React supplies the 22 documented components and reference compositions. Neither language requires a specific navigation direction. Cardfile product development remains deferred.

Manual assistive technology, localization/RTL, compact density, broader publishing vocabulary and sustained consumer use remain open. The coverage ledgers identify actual rules, bounded observations and future work. “Preview” is a concrete support boundary, not a promise that every possible interface is implemented.
