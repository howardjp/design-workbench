# Martlet source decisions

Origin reconciliation 0.2 · Consolidation candidate · Original palette and existing defaults retained

Use jameshoward.us as the authority for existing objects. This profile distinguishes restored source roles from application extensions. The full grammar remains experimental. Original source commit: `32b7166a629ea696147d0d779d911b713e4baf7e`, repository `k3jph/k3jph.github.io`. Review `src/styles/global.css`, `content.css`, `document-pages.css`, and `src/components/{SiteHeader,SiteFooter,PageIndex,TableOfContents,PageIntro}.astro` at that commit. The audit and reconciliation ledger record evidence and remaining limits.

## Existing source objects

| Role | Decision | Source / reason |
| --- | --- | --- |
| Prose | Cambo, 1.075rem/1.72, ink #222a33 in light mode; headings navy #0b1c33. | Global typography and observed About Me rendering. |
| Reading width | 48rem, with independent media/code overflow. | Global reading-container and document composition. Do not widen prose to fill a playground. |
| UI typography | Lato; field labels .86rem/1.5, weight 700, .02em tracking. Cinzel is selective display/identity. | Global controls and source identity roles. |
| Links | Keep observed #154c9e and .16em underline offset. | The live cascade wins over the raw global declaration #255f91. |
| Headings | Foundation h1/h2/h3 scales, weight 400, 1.18 leading. Short gold rule below content h2. | Global and content styles. A full-width rule above every title is removed. |
| Document index | `TableOfContents variant="index"`; unnumbered, depth 2 bold, depth 3 indented/regular; gold uppercase label, 2px gold top rule; transparent at wide widths. | PageIndex and document-pages. `items[].depth` defaults to 2. |
| Index composition | Navigation before body, 16rem index + bounded 48rem text, adaptive gap. Sticky at 6rem when there is room. | Source document-layout. In a nested Article, the 74rem threshold uses available container width; portrait also stacks. Narrow index becomes in-flow cream. Its small label uses existing gold-700 for contrast on cream (source gold-600 measures 4.25:1 there); the wide white context retains source gold-600. This is an explicit accessibility improvement. |
| Inline contents | `variant="inline"`; cream, gold top rule, column flow when available, one column when narrow. | Separate source inline TOC. It is not a right-hand context panel. |
| Supporting content | Keep separate from navigation. Article's `aside` renders after body; caller may compose a separate supporting region when comparison requires it. | Source has multiple insets/facts/media contexts; none authorizes merging all support with the index. |
| Quote | 4px gold leading rule, muted serif quotation. | Global blockquote. |
| Controls | Square primary button; source button padding .65rem/1.1rem; native inputs use their own small radius and .65rem/.8rem padding. | Global button and input declarations. Do not apply button radius indiscriminately to fields. |
| Table | .94rem Lato, .8rem/.9rem cells, top alignment, pale uppercase header, source rule. | Global table. Compact density must be a separate task choice; default row padding is not a family contrast. |
| Focus | White 3px outline with navy outer shadow, visible across light and dark surfaces. | Global focus and live keyboard observation. |
| Website navigation | Dark/transparent source header anatomy, white links with gold current/hover underline, collapsed Menu at 68rem or portrait. | SiteHeader. The documentation uses the solid state from the start because its pages have no photographic masthead behind navigation. |
| Footer | Navy, grouped links, separate identity/base line. | SiteFooter. Documentation link content and system mark belong to this host. No gold footer stripe. |

## Explicit application extensions

AppShell is a compact application frame, not the origin website's scrolling masthead. Top/side/none remain available. Its existing default remains top for compatibility; it carries no automatic gold stripe and no built-in prose. Navigation content and identity belong to the caller.

Field, hint and error linkage, native selection controls, a task dialog, error summary, status notice, badge, switch, manual tabs, controlled data paging, and note workflows are application extensions. Their purpose is visible labels, understandable scope/state, retained work and recovery. Keep native keyboard conventions and distinguish disabled, read-only, invalid, pending and saved. Invalid styling matches `aria-invalid="true"` only. ErrorSummary uses a consistent leading severity rule; no forced opposite Krigsvold treatment. Tabs have a selected underline without decorative rounded/fill variants. DefinitionList supports `layout="rows"`, `"stack"` or `"grid"` in either family.

The field/group/region application roles are .5/1.5/2.5rem. They use source scale values but their relationship assignments remain experimental. They do not replace source section spacing or reading rhythm. Notebook rows have no meaningless ordinals. Its find/read/edit progression is a task choice available to other frames too.

Dark mode preserves source anatomy using existing theme semantic contrast roles. It is an extension, not evidence that every origin object has a dark counterpart. Code surfaces retain theme code roles pending source-matched code specimen review. The source index, its hierarchy and quote accents remain identifiable; do not turn dark mode into permission for decorative rules.

## Boundary and evidence

The theme-site bird is an existing system mark used by documentation; adopting apps supply their own brand. The documentation component finder, preview frames, copy controls, failure simulator and local-only saves are host tools. Source imagery, seasonal treatments, personal identity, analytics and legal policy do not become global language requirements.

Full media/figure/footnote/maths, source card/archive variants and complete application pattern breadth are not shipped contracts merely because their CSS exists at the origin. Accessibility, localization/RTL, forced colors across complete pages and sustained use still require evidence. Retrieve this decision profile alongside grammar and API references; a source hash identifies content, not design correctness.

## Framework consolidation

Core 2.2.0 and Astro 1.2.0 are unreleased candidates. The source profile is an opt-in import and class; existing core defaults and existing Astro slots remain compatible. New TableOfContents and grouped SiteFooter anatomy are available in the paired candidate packages. React 0.1.0 retains its existing theme 2.1.0 dependency and React-specific events and focus contracts. Framework support is recorded in language.json. These additions do not make the grammar stable.
