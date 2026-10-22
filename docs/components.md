# React component contracts

Version 0.1 · Experimental · October 21, 2026

Both packages expose the same behavioral surface. Family-specific typography, spacing, emphasis, and shell composition come from their own styles and theme dependencies. The workbench consumes these exports directly. These are working requirements, not claims of sustained production validation. React 19 is the current supported rendering platform.

Every interactive component must preserve its native keyboard model, consumer attributes, a visible focus indicator, and text that survives resizing and translation. Field names must stay visible. Color, shape, and motion cannot be the only status indicator. Errors retain entered data. A caller remains responsible for correct copy, unique document landmarks, and a coherent overall heading/focus order.

## API, states, and acceptance criteria

| Export | Properties and native contract | States and acceptance criteria |
| --- | --- | --- |
| AppShell | brand, navigation, utilities, children. One header/nav and one main; skip link targets main. One shell per document. | Navigation/current-page content supplied by the caller. Header wraps on narrow screens. Skip link becomes visible on focus and moves to main. Martlet uses a horizontal header; Krigsvold a side rail that becomes a header when space runs out. |
| Button | Native button props and ref; variant primary/secondary/quiet. Defaults to type=button. | Default, hover, focus, disabled, pending through caller content/aria-busy. Enter/Space activate a focused button. Disabled cannot activate. A new enabled state or theme change paints its readable colors immediately, avoiding a low-contrast color transition. A form submit requires explicit type=submit. |
| TextInput | Native input props/ref, including type, required, disabled, readOnly, autocomplete, value and change handlers. | Empty, populated, focus, invalid, disabled, read-only. Labels remain associated; invalid state uses Field errors. Native input behavior and browser autofill remain available. Native read-only permits inspection; disabled is excluded from interaction/submission. |
| Select | Native select props/ref and option children. | Empty/default selection, selected, focus, invalid, disabled. Use the platform's native keyboard and popup behavior; do not replace it with an untested ARIA listbox. A placeholder choice must clearly explain whether it is valid. |
| Textarea | Native textarea props/ref, rows, controlled or uncontrolled values. Vertically resizable. | Empty, populated, focus, invalid, disabled, read-only. Newlines survive saving. Long text wraps without widening the document. Resizing cannot cover subsequent controls. |
| Field | label string; optional hint/error; render function receives id, aria-describedby, aria-invalid. | Default/hint/error. Visible label points to the rendered control; hint and error are both described. Error text remains visible until resolved or explicitly cleared. The caller spreads supplied attributes onto the actual control and adds required/readOnly/etc. |
| Checkbox | Native input props/ref except type; label node; optional id; className styles the wrapper. Binary only in this release. | Unchecked, checked, focus, disabled, invalid through caller ARIA/group errors. Clicking the label and pressing Space toggle the same control. Names/values support native form submission. Mixed state is deferred until a real task and a reviewed keyboard/announcement contract require it. |
| Fieldset | Native fieldset props/ref; legend node; optional hint/error. | Default, invalid group, disabled group. Legend is the first child; descriptions reference hint/error IDs and preserve any consumer description. Disabled reaches descendants natively. Error identifies the group without replacing per-control labels. |
| Notice | kind info/success/error and children. No automatic dismissal. | Info/success use role=status; blocking errors use role=alert. Copy explains what happened and recovery. Pending/saved/failed state comes from the caller. Do not repeatedly reannounce unchanged messages or use an alert for ordinary progress. |
| Badge | children, rendered as concise static text. | Text names the actual status. It is not a button and does not claim a live update. Status remains intelligible without color. Do not put lengthy explanations into a badge. |
| DataTable | Native table props/ref, required caption string, table children. Named, focusable overflow region around a semantic table. | Empty/loading/error belong to caller composition. Captions, scoped headers, and native cells remain intact. A genuinely wide table scrolls inside its region at 320 CSS pixels. Sorting buttons and aria-sort are composed in the workbench; data order changes without losing controls. Pagination is a separate labelled navigation region. |
| Disclosure | Native details props/ref plus summary node and children. | Closed/open, focus; Enter/Space on summary toggles. No simulated accordion keyboard model. A disclosure must not hide blocking errors or required actions. The workbench uses it for optional revision history. |
| Dialog | Controlled open boolean, title string, onDismiss callback, children. Uses native dialog.showModal and the browser top layer. Keep mounted. | Closed/open; Escape calls onDismiss. Caller supplies a visible dismissal action and appropriate initial autofocus. Focus stays in the modal, then returns to the trigger if it remains available. A destructive draft choice defaults to Keep editing. Clicking the backdrop does not silently discard work. |

FieldControl is a TypeScript type describing the control attributes returned by Field. It is not a rendered component.

## Administration compositions

The inventory composes a labelled search, maturity/target/evidence filters, sortable semantic columns, bounded pages, an inspector/editor, and live feedback. Sorting a column updates aria-sort; changing a filter resets pagination to page one. A selected record may remain open while its row is filtered or paginated away. The editor preserves unsaved data and requires an explicit discard decision when an in-app navigation would abandon it.

The overview derives counts, implementation coverage, and recent records from the same saved inventory. Recorded targets and availability remain separate. Coverage includes platforms that appear in target or implementation metadata. A missing-evidence action opens the corresponding inventory filter; it does not promote, certify, or publish any contract. No seeded adoption, productivity, revenue, or performance statistics appear.

The revision disclosure currently exposes the latest 20 snapshots' revision, timestamp, name, and maturity. Comparing or restoring full snapshots is subsequent work. A save result records an actual committed revision. Failure and conflict states do not pretend success.

## Verification and promotion

Automated checks cover native semantics and forwarded attributes, field associations, group errors, live-region priority, table captions/overflow, checkbox/disclosure keyboard activation, modal dismissal, collection ordering/pagination, persistence, and conflict recovery. The app exercises all thirteen exports in both families. See verification.md for completed checks and current limitations.

Before promoting any API to stable, add real use observations, manual screen-reader and keyboard review, text resizing/spacing checks, documented browser support, compatibility and migration guidance, and any missing state-specific regression cases. A passing automated scan is one piece of that evidence.
