# Construction plan

Working plan · October 21, 2026

Martlet and Krigsvold will be complete, freely available design systems: foundations, specifications, idiomatic components, compositions, administration patterns, documentation, and tooling. Every supported implementation is given away under a permissive license. There is no paid tier containing the useful half of the system. Broad platform reach is a goal; a platform appears as supported only when its implementation and checks exist.

The two systems share behavioral obligations while preserving independent visual judgment. Martlet welcomes through editorial hierarchy, rhythm, and related groups. Krigsvold clarifies through alignment, composed space, restrained surfaces, and precise hierarchy. A shared accessibility solution need not differ. Distinction must survive the removal of brand colors; a palette swap is insufficient.

## Evidence loop

The original jameshoward.us and krigsvold.org sites provide continuous evidence for reading, public navigation, publishing, and responsive composition. The workbench supplies a real administrative task: maintaining the systems themselves. Capture a failure during actual use, generalize a remedy, verify it, update the reusable system, return the improvement to the source consumer, and observe it again. Source fidelity never excuses retaining a decision that fails when generalized. A new application and passing automated checks are the start of evidence, not proof of sustained use.

## Work sequence and completion gates

| Stage | Deliverable | Completion gate | Present position |
| --- | --- | --- | --- |
| Direction | Independent charters, baseline rule, free distribution commitment | Human approval | Charters adopted; distribution policy recorded here |
| Foundations | Type, spacing relationships, reflow, density, surfaces, layering, motion, accessibility | Shipped values distinguished from proposals; examples verified in real consumers | Working specifications proposed alongside both theme packages |
| Administration baseline | Shared registry with independent family presentations | Browse, filter, inspect, create/edit, validate, persist, reload; failures preserve work | First local SQLite/React implementation in this repository |
| React foundation | Typed packages consumed by the registry | Packaged exports, native semantics, common behavior tests, responsive and accessible composition | Twenty-two experimental components in each family; unpublished |
| Comparative experiences | Article, substantial form, searchable collection, dashboard | Identical content and functionality; family differences documented beyond color | Registry provides form, searchable collection, coverage dashboard, and a shared-content specification reading room; sustained consumer review remains |
| Component expansion | Forms, navigation, feedback, disclosure, overlays, data | Documented states, keyboard model, acceptance criteria, real consumer | Inventory managed here; expanded controls remain planned |
| Block and application library | Reusable sections, workflows, full admin reference | Working data operations; compositions assembled from public packages | Registry is the first application, not the full admin catalogue |
| Broader platforms | Idiomatic integrations and adapters | Build/install/example checks for each claimed platform | CSS and Astro already published; React experimental; other platforms planned |
| Stable releases | Versioned contracts, compatibility tables, migrations, automated publishing | Real usage evidence, manual accessibility review, regression checks | Current theme/Astro release process exists; React release process pending |

## First working administration slice

The shared domain is a component contract. It records a name, purpose, category, maturity, intended platforms, acceptance criteria, evidence, migration guidance, and separate Martlet/Krigsvold design notes. Recorded implementations have independent package/version/availability metadata. The initial inventory is drawn from actual exports. It makes no claims of measured adoption or production validation.

A user can browse the same inventory through either design, search and filter it, inspect a record, edit or create a specification, receive validation feedback, save, and reload the saved revision. SQLite provides persistence beyond a browser session; append-only snapshots provide revision history. Optimistic revisions reject stale writes. The local application has an explicit operational boundary before team hosting.

## Inventory expansion

Prioritize controls demanded by registry and source-site work. Checkbox and Fieldset are now consumed by the registry. Native Radio now supports readiness-review outcome groups. The next form set includes richer choice groups, Combobox, DateInput, richer file upload, and further form compositions. A linked ErrorSummary now serves validation and recovery workflows. Native FileInput is now consumed by reviewed specification import. Native Pagination now serves the review queue. Further navigation includes breadcrumbs, tree navigation, and responsive application navigation. Feedback includes progress, inline alerts, status, and dismissible notifications. Disclosure now uses native details; further patterns include accordion; overlays include menu, popover, tooltip, and richer dialog composition. DefinitionList now serves retained-draft conflict comparisons. Further data work includes sortable/selectable tables, filtering, pagination, charts, and empty/loading/error patterns.

Each component specification records purpose, anatomy, content guidance, supported properties, state model, keyboard behavior, accessibility obligations, responsive behavior, density, both family decisions, acceptance criteria, availability, and migration impact. Do not implement every conceivable control simultaneously. Choose the next real task, complete its behavioral contract, and extend both families using the same test scenarios.

## Broader application definition

Expand the registry into an operational workspace only as real work requires it: dashboard of actual coverage and outstanding criteria, component detail and history, platform compatibility, release readiness, specifications, search, settings, and eventually authenticated collaboration. Use real counts and recorded states. Structured readiness reviews now persist six observation areas, preserve history, and require renewal after specification/inventory changes; they do not automate promotion or publication. A server-derived queue exposes current, renewal, and absent positions with per-area outcome filters, URL persistence, and direct review entry. Permission management, authentication, audit actors, shared editing, and remote persistence are separate product work before public administration hosting.

Explicit bundled-inventory updates now preview additions, metadata, retained entries, and conflicts before transactional application. They preserve saved specifications and history; reviewed JSON specification import now has independent file validation, field diffs, provenance, stale-source conflict policy, and atomic application. Existing maturity and implementation claims remain under local control; missing records are retained. Destructive reconciliation remains outside scope.

Concurrent specification recovery now compares editing base, retained draft and latest values, requires explicit field choices, and retains revision-safe saving.

The four comparative experiences now have working registry consumers. They must continue to use identical content, functionality, states, and data volume. Their applications may compose differently. Review at narrow and wide widths, in light and dark modes, with long text, validation failures, empty results, loading, keyboard use, and assistive technology. Publish a showcase only with honest labels distinguishing a working reference, an experiment, and a production consumer.

## Distribution and governance

Keep a framework-independent token and specification contract. React is the first additional application platform, followed by platforms for which a real maintainer or consumer supplies demand. Astro, React, Vue, Svelte, web components, native toolkits, editor themes, and design-tool assets need platform-appropriate APIs, not a universal wrapper that conceals limitations. Reuse domain behavior where it helps; retain idiomatic rendering and platform semantics.

Releases require changelogs, package compatibility, migration instructions, accessible examples, and provenance/trusted publishing appropriate to repository visibility. Experimental packages remain explicitly experimental. Define deprecation windows when a stable contract first ships; never retroactively impose an undocumented removal. No automated release occurs solely because a registry record says stable.



Browser specification draft recovery and saved workspace settings now extend the administration baseline. Switch and Tabs have real settings consumers; browser drafts retain their editing bases and uncertain-write markers for explicit recovery. Current original-site styling is unchanged. Independent React documentation homes are planned at react.martletdesign.dev and react.krigsvolddesign.org, with separate family build/deploy targets and shared behavioral contracts; see docs/react-sites.md. Experimental release packaging/versioning and a proposed stable deprecation window are recorded in docs/release-policy.md, without publishing packages or adopting a stable support guarantee.
