# Audit inventory

Read [the audit and disposition register](../origin-audit-2026-10-23.md) first. This inventory records implementation `594055a647a84fa30bb400c98810f946b66a7c0b`; it does not certify that the implementation matches its origins.

| File | Contents |
| --- | --- |
| declarations.csv | All 2,114 declarations in seven authored UI stylesheets and four active theme/foundation stylesheets; file/line, selector, media context, value, variable references, category, review IDs and bounded literal source candidates. |
| components.csv | All 44 family/export pairs, with source location and review IDs. |
| inline-styles.csv | All four JSX style/document-mode assignments in the reference application. |
| sources.json | The 49 pinned origin files, source URLs, original Git blob identities, matching cached identities and SHA-256 hashes. |
| source-selectors.json | Selector index for the origin's own component/layout/style directories, including Astro scoped style blocks. The large inherited Material Kit selector list is omitted from this index; its file identity is in sources.json and it was parsed for candidate matches. |
| totals.json | Scope, file hashes, counts, import edges and component compilation comparison. |

The manual register has 67 review items, including preserved behavior and justified extension candidates. This is not a count of 67 independent bugs. A category attached to a declaration is a review disposition, not proof that its number or color was used in the same role at the origin. Even an exact property/value match can be coincidental. Computed styles can override authored declarations, as the live Martlet link observation demonstrates.

To reproduce, retrieve each sources.json entry from its pinned commit into `<cache>/<family>/<path>`, preserving bytes. Copy sources.json into `<cache>/origins.json`; the script verifies every cached file's Git blob identity before proceeding. From the unchanged workbench baseline with dependencies installed, run:

```sh
node scripts/inventory-origin-audit.mjs /absolute/path/to/cache
```

The generator uses the workspace's existing PostCSS and Rolldown installations. It does not fetch sources, execute origin code, install dependencies, run application tests, modify packages, or deploy anything. To compare a changed implementation, update the audit baseline deliberately instead of relabelling this fixed record.
