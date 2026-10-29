# Parallel dashboard contracts

Three canonical applications use exactly the same information architecture, records, controls, calculations, and recovery behaviour in Martlet and Krigsvold. The existing language shell, native buttons, typography, palette semantics, forms, bounded tables and disclosures remain authoritative. No framework, chart dependency, package, or repository is added.

## Source and component ownership

| Source | Responsibility |
| --- | --- |
| `content/dashboards.json` | Shared synthetic fixture, schema version, as-of time and domain records |
| `scripts/generate-dashboard-fixtures.py` | Reproducible generation; no randomness or external data |
| `contracts/dashboards.schema.json` | Types, enum values and fixture provenance |
| `jekyll/_layouts/example-dashboard.html` | Shared information architecture and application landmarks |
| `jekyll/_includes/examples/dashboard-*.html` | Domain-specific content classes composed from existing controls and reusable presentation |
| `jekyll/_includes/examples/metric.html`, `chart.html` | General metric and accessible chart frames |
| `jekyll/_includes/examples/table.html` | Existing table frame, extended with optional density |
| `jekyll/assets/js/dashboard-model.mjs` | Framework-neutral calculations and collection/workflow behaviour |
| `jekyll/assets/js/dashboard-ui.mjs` | Small reusable text-safe table, chart, metric, and CSV renderers |
| `jekyll/assets/js/dashboards.mjs` | Browser controllers and page-memory state |
| `jekyll/assets/css/dashboard.css` | Reflow and composition mechanics, without a new palette |
| `families/<family>/assets/css/dashboard-family.css` | Independent source-token mappings and family compositions |

Dashboard CSS and modules load only on dashboard pages. Ordinary examples retain their current assets; the general table-density addition preserves the default appearance. Both standalone exports receive generated copies and the same data, checked for drift.

## Shared fixture

Northlight is fictional. Data includes 168 daily category observations over 56 days ending October 28, 2026; 24 invented directory records using `example.invalid`; five services with 24 hourly synthetic samples each; three alerts and their corresponding activity entries. No personal or production data is used. Every page identifies its as-of time and synthetic/page-memory boundary.

## Analytics

The default range is October 22–28, 2026. Quick ranges cover 7, 14 and 28 days; custom start/end dates and category selection scope all metrics, charts, source records, and CSV export. Inputs outside the fixture or in reversed order produce a focusable alert, retain the last valid results, and disable export until corrected.

Metrics: sessions, downloads, completion rate (`sum(completions) / sum(sessions)`), and mean duration (`sum(duration_seconds) / sum(sessions)`). Comparisons use the immediately preceding equal-length period only when fully available. Missing comparisons say unavailable. The charts show session and download trends and category totals against the preceding period. Exact values are available through native disclosures and accessible tables, including dates, category and units. CSV export contains the filtered source records.

## Administration

Search covers configured fields; status filtering, stable column sorting and direction, row count, page controls, and density remain independent. Page numbers clamp after filtering. The select-all checkbox affects only visible rows; selections may persist across pages, and filter changes clear selection. The bulk confirmation names the selected records and intended status. Cancel and Escape write nothing. Confirmation updates selected IDs only and returns focus to an available control.

The person editor adds or edits names, invented email addresses, roles and statuses. It validates required fields, email syntax, duplicates excluding the current record, and enum values. Validation retains drafts, marks fields invalid and links a focusable error summary to the fields. Rendering uses text nodes, including user-entered names. Directory changes reset on reload.

The explicit state-preview control demonstrates ready, loading, error and empty states. Loading disables writes. Error recovery retains filters and drafts. Empty states explain recovery. These are labelled local state specimens, not claims that a network operation took place.

## Operations

Monitoring windows cover 6, 12 or 24 hourly samples. Service selection scopes trends, status, alert counts and activity. A whole-number warning threshold from 50–1000 ms classifies each service's latest latency; the line plot shows the mean across selected services and labels the threshold separately. Severity and acknowledgement filters scope the alert register. The unacknowledged summary explicitly counts all severities in the service scope.

Acknowledgement and undo update page memory and add an explicitly local timeline entry. Reset restores the original fixture. Availability is identified as a minimum sampled synthetic value, not a live SLA calculation. Status and severity use text and borders as well as semantic colours.

## Family composition and deliberate extensions

Both families use the same DOM information sequence and functional controller. Martlet uses documentary side navigation, an open reading hierarchy, generous groups, Cambo headings, Lato controls/numbers, restrained gold rules and a full-width primary trend. Krigsvold uses aligned bounded panels, a compact sidebar, Roboto/Roboto Slab/Roboto Mono roles, paired trend panels and an aligned category comparison.

Both switch the application sidebar to a disclosure below 64rem, reduce metric columns below 68rem, stack working panels below 42rem, and use one metric column below 26rem. Named table regions contain necessary horizontal scrolling. Application layout, not source identity, changes to meet the denser working context. Native site menus and buttons remain intact. Neither source website is modified.

## Portable component contracts

`collectionView(records, options, fields)` returns filtered rows, clamped page, page count, page size, and total; `fields` declares searchable keys, sortable keys and default sort. Records require stable IDs. `analyticsView` and `operationsView` are domain calculations, not visual components. `applyBulk` and `validatePerson` remain domain workflow helpers.

Charts accept labelled numeric rows, an optional previous value and an optional threshold. The Jekyll SVG adapter is replaceable; the data table and equivalent information are required. Metrics require a name, formatted unit, and explanation of comparison/aggregation. Reuse existing React controls and tables when porting; implement rendering and state in the framework's normal mechanisms, keeping these fixture and behaviour contracts. Do not copy imperative DOM controllers into React.

## Verification

Run `npm run test:examples` after sync. The existing Jekyll workflow builds root and subpath variants from locked dependencies, then builds `/martlet` and `/krigsvold` test prefixes. `npm run test:dashboards` uses the existing Playwright and axe dependencies against those generated sites. It tests paired workflows, validation/recovery, scoped writes, safe text, responsive widths (320, 768, 1100 and 1440px), mobile navigation, and light/dark accessibility. Browser screenshots/traces are CI artifacts and establish the initial visual evidence; no historical dashboard baseline or comprehensive manual screen-reader certification is claimed.
