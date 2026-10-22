# Design workbench

A working component registry for **Martlet** and **Krigsvold**, with independent React presentations and one shared data contract. Use it to manage component requirements, target platforms, family decisions, maturity, and usage evidence. MIT licensed, including the application, specifications, and both component packages.

## Run it

Use Node 24.19 or a later Node 24 release and npm 11.

```sh
npm ci --ignore-scripts
npm run build
npm start
```

Open **http://127.0.0.1:4173/martlet/** or **http://127.0.0.1:4173/krigsvold/**. Both views edit the same database. The default database is `var/registry.sqlite`; set `REGISTRY_DB` to choose another path and `PORT` to choose another loopback port. For development, build once, then run `npm run dev` and reload after changes. Dev mode deliberately disables HMR. Node's bundled SQLite may print an experimental-feature warning on the supported Node version.

Review coverage and missing evidence in the overview; search, sort, or paginate the inventory; inspect a component, edit its specification, save, and reload. Add components as work expands. Failed writes preserve drafts, stale revisions produce an explicit conflict, and unsaved navigation offers a choice. The initial 30 records reflect the exported Astro and React component inventory, with published Astro implementations distinguished from unpublished React workspace implementations. All seed maturity stages remain experimental and evidence starts empty. Seed records are installed once when the database is created; restarting never replaces edits.

## Boundaries of this first release

This is an **experimental, single-user local application**. It binds only to 127.0.0.1, rejects unexpected Host/Origin requests, and has no account or authentication model. It is usable for actual registry work now. Public or team hosting requires authentication, authorization, operational backups, persistent storage, and a deployment review. Do not expose the local service through a public tunnel. It is not a production multi-user administration service.

Edits update the local registry and its revision history. Earlier contracts can be reviewed and opened as drafts; saving them appends a new revision. They do not publish packages, alter GitHub, modify either source site, or automatically certify a component. Implementation availability is the checked-in inventory snapshot; user-editable target platforms express intended reach. Stable maturity requires human-reviewed usage and verification evidence; deprecation requires migration guidance. A text field is a record of a decision, not an automated certification.

## React packages

- [@martlet/react](packages/martlet-react/README.md): warm editorial hierarchy, horizontal navigation, spacious grouping, Cambo/Lato/Cinzel typography.
- [@krigsvold/react](packages/krigsvold-react/README.md): precise workspace hierarchy, side navigation, aligned regions, Roboto/Roboto Slab typography.

Both export AppShell, Button, TextInput, Select, Textarea, Field, Notice, Badge, DataTable, Dialog, Checkbox, Fieldset, Disclosure, and ErrorSummary. They consume the existing `@martlet/theme` / `@krigsvold/theme` 2.1.0 tokens and work in light and dark modes. Package APIs are experimental and unpublished. `npm run pack:react` produces tarballs for local installation. `private: true` prevents accidental registry publication until release contracts and trusted publishing are ready.

## Specifications and direction

- [Construction plan](docs/construction-plan.md)
- [Registry contract and acceptance criteria](docs/registry.md)
- [Explicit inventory updates](docs/inventory-updates.md)
- [Martlet foundations specification PR](https://github.com/martlettheme/npm/pull/4)
- [Krigsvold foundations specification PR](https://github.com/krigsvoldtheme/npm/pull/4)
- [Component contracts and states](docs/components.md)
- [Maturity, compatibility, and migration policy](docs/maturity.md)
- [Martlet charter](https://github.com/martlettheme/npm/blob/main/docs/charter.md)
- [Krigsvold charter](https://github.com/krigsvoldtheme/npm/blob/main/docs/charter.md)

The companion foundations specifications live with each theme package. The original live websites remain publishing baselines; this registry is the emerging administration baseline. Evidence from real use may replace inherited design decisions and must feed back into the source sites.

## Verification

```sh
npm run check
npx playwright install --with-deps chromium
npm run test:browser
npm run pack:react
```

Node tests cover validation, real SQLite reopen persistence, revision conflicts, creation, immutable availability, export, and HTTP request boundaries. Browser tests exercise both families through the same workflow and check light/dark accessibility and 320/1440-pixel reflow. Automated checks do not replace manual screen-reader, text-spacing, zoom, or sustained-use review. See [the review record](docs/verification.md) for the checks actually completed in this change.

## Data and backups

“Export registry” downloads a schema-versioned JSON snapshot of the latest records. This portable snapshot does not contain full revision history and there is no JSON-import UI yet. To preserve the complete database, stop the server, copy `var/registry.sqlite` to a safe location, then restart. To restore, stop the server and point `REGISTRY_DB` at the saved database (keep the old one). WAL/SHM sidecars may exist while the server is running; do not copy a live database file alone. The database and exports are never committed to git. Seed changes do not silently migrate existing inventories. Use Inventory updates to preview and explicitly apply bundled additions and implementation metadata, retaining edited specifications and history. See [the update contract](docs/inventory-updates.md).

## Visual review

Both views below use the same saved inventory and functionality.

| Martlet | Krigsvold |
| --- | --- |
| ![Martlet overview](docs/qa/martlet-overview.jpg) | ![Krigsvold overview](docs/qa/krigsvold-overview.jpg) |

[Martlet inventory](docs/qa/martlet-inventory.jpg) · [Krigsvold inventory](docs/qa/krigsvold-inventory.jpg)

Third-party fonts and dependencies retain their own licenses; see [NOTICE.md](NOTICE.md).
