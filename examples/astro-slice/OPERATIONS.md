# Astro operations dashboard increment

The operations route is a paired Astro adapter around the canonical synthetic fixture and the existing framework-neutral Jekyll dashboard model, rendering helpers, browser controller and layout CSS. It implements service and time scope, warning thresholds, alert severity and acknowledgement filters, local acknowledgement/undo, activity, reset, and accessible chart-data tables. No real service is contacted or changed. With JavaScript disabled, the initial service and alert tables remain visible and controls stay disabled.

```sh
npm ci --ignore-scripts
CHROMIUM_PATH=/usr/bin/chromium node test-operations.mjs
```

The independent test rebuilds both families at root and `/preview/` and checks thresholds, scoped services/alerts, acknowledgement and undo, pending control preservation, validation/focus, reset, responsive overflow at 320/768/1100/1440px, light/dark automated axe, and no-JS tables. It does not establish manual screen-reader or visual parity.

The catalog/search supported list has not been updated in this isolated increment. The dashboard sidebar intentionally labels analytics and administration unavailable until the parallel ports are integrated. The canonical controller expects a comparison link, so this adapter supplies a hidden local placeholder; a real cross-family Astro comparison link and preservation of applied query state need integration work. Source-shell identity and visual fidelity remain open for review. No deployment or release is implied.
