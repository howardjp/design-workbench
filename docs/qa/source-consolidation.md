# Source consolidation review

This is an implementation consolidation, not grammar stabilization. The October 23 origin audit remains a fixed baseline. Source decisions, contextual translations and application extensions remain explicit.

## Review set

| Language | Canonical core | Astro candidate | Main reference |
| --- | --- | --- | --- |
| Martlet | [PR 4](https://github.com/martlettheme/npm/pull/4), `7ef42fd241b7cb99014b19bccb1aeec10be0ca89` | [PR 3](https://github.com/martlettheme/astro/pull/3) | [PR 8](https://github.com/martlettheme/martlettheme/pull/8) |
| Krigsvold | [PR 4](https://github.com/krigsvoldtheme/npm/pull/4), `a52f17b3ccbf6a8ff946bdc13b29347c8ea87963` | [PR 3](https://github.com/krigsvoldtheme/astro/pull/3) | [PR 7](https://github.com/krigsvoldtheme/krigsvoldtheme/pull/7) |

Core 2.2.0 and Astro 1.2.0 are unreleased candidates. React 0.1.0 remains experimental and unpublished, with its existing theme 2.1.0 dependency. The main theme sites retain installed core 2.0.0 and Astro 1.0.0 until a separate package adoption and release. Their new language pages identify candidate availability separately from the installed-package specification.

## Consolidated contracts

- Each core repository owns its independent grammar, source-decision profile, foundation requirements and machine-readable implementation/pattern manifest.
- Optional source-profile CSS adds audited reading roles and experimental field/group/region relationships. Existing palettes and default styling contracts remain intact. The scope removes the unsupported page-header accent. Pattern CSS adds only new selectors.
- Astro TableOfContents renders native nested lists with depth-2 parents and depth-3 children, index and inline variants, and a caller-localized label. ArticleLayout adds a contents slot before the body while retaining its existing supporting sidebar after the body. DocumentationLayout navigation remains separate.
- SiteFooter retains its existing plain default and flat links. Its grouped variant accepts labelled groups, identity and base slots. Martlet places publishing groups above the identity/base row; Krigsvold uses the wide identity column, four-group region and independent base. Adopting hosts supply identities, content and destinations.
- Main references add `/design-language/`, source provenance and framework support in `/design-system.json`, and a link from the installed-package reference. Generated heading views preserve a single page h1; source tables have named keyboard-accessible regions.
- React docs, MCP grammar/decisions and offline skill references use exact copies of the canonical core revision. Build checks reject changed hashes or diverging offline references. The manifest exposes the canonical repository/commit independently of the workbench snapshot commit. All 53 MCP references remain available; examples remain React-specific.

## Validation

- Core builds and 25 Node tests pass across both families; original light/dark color-contract checks pass.
- Both Astro packed consumers build. The three package checks per family pass. Chromium covers four routes at six widths (280, 307, 390, 768, 1280, 1600), enlarged text, local fonts, nested grids, source order, skip links and reduced motion. New contents composition and grouped footer pass hierarchy/geometry checks, including 320px and 400% text. CI also exercises Astro 5.18.2 and 7.3.2.
- Both main theme sites build and pass their existing Node suites. Browser scenarios pass: 16 Martlet and 18 Krigsvold, including consent regression checks, new guidance at 280/320/768/1440px, one main h1, framework metadata and 200% text. Analytics requests are intercepted during these tests.
- Workbench TypeScript and all 86 Node tests pass. Seventeen reading browser checks pass, including axe, both appearances, narrow/wide layouts, source order and retained content. Both agent archives install and serve through a real MCP client outside the workbench. Both bundled skills validate.

The local browser is Chromium 153 via the temporary runtime; CI uses its official Playwright browser installation. Screenshots are available in the Astro and main-reference CI artifacts. Automated checks do not substitute for manual assistive technology, localization/RTL or sustained use.

## Remaining boundaries

Source code-surface matching, full figure/footnote/maths vocabulary, archive/card variants, broader form/data workflow evidence and full dark-mode validation remain open. Astro SiteHeader remains a wrapping link header: source dropdown anatomy is guidance for host-owned menus, not a newly shipped controller. Top, side and focused frames remain possible in both languages.

This pass does not publish npm packages, merge release branches, change source websites, configure DNS, expose hosted MCP, submit vendor plugins or change the private review audience. Hosted MCP and plugin integration remain subsequent work.
