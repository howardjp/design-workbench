# Maturity and compatibility

Maturity describes the component contract. Availability describes a particular implementation. A platform target is intent. These are separate facts.

| Stage | Meaning | Gate for the next stage |
| --- | --- | --- |
| Proposed | Requirements recorded; implementation may not exist | Working implementation and explicit acceptance criteria |
| Experimental | Usable contract under evaluation; APIs may change | Recorded real consumer, manual accessibility review, behavioral regressions, documented compatibility and migrations |
| Stable | Reviewed public contract with documented support obligations | Continuing evidence and compatible maintenance |
| Deprecated | Replacement and migration instructions published | Announced removal window and supported migration |

The editor requires evidence before choosing stable, but it cannot establish whether a written claim is true. Review evidence manually. A published package does not retrospectively certify all of its components as stable. Seed records therefore start experimental.

| Implementation | Current inventory | Contract position |
| --- | --- | --- |
| @martlet/theme | 2.1.0 published | Existing palette/foundation/layout contracts retained |
| @krigsvold/theme | 2.1.0 published | Existing palette/foundation/layout contracts retained |
| @martlet/astro | 1.1.0 published | Existing exports retained; broader component maturity under review |
| @krigsvold/astro | 1.1.0 published | Existing exports retained; broader component maturity under review |
| @martlet/react | 0.1.0 workspace, unpublished | Experimental; React 19; theme 2.1.0 |
| @krigsvold/react | 0.1.0 workspace, unpublished | Experimental; React 19; theme 2.1.0 |
| Registry API and database | Schema 1 | Experimental; Node 24.19+ within Node 24 |
| Vue, Svelte, native components, web components | Planned | No implementation support claimed |

The React packages are private workspace packages to prevent premature publication, while their source remains publicly available under MIT. Remove the private flag only as part of a reviewed release setup with package names, trusted publishers, release verification, changelog, and compatibility documentation. No npm token is committed or required to build.

For stable APIs, compatible fixes use patch versions, compatible additions minor versions, and breaking changes major versions. Experimental releases still describe every breaking change and provide upgrade notes. Stable deprecation requires a named replacement, steps, examples, an announced minimum support window, and a major-version removal. The exact support window must be adopted before the first stable React release. No window is invented retroactively.

Database updates need ordered, transactional migrations, backup guidance, and a test using an earlier saved database. This schema does not migrate package availability or seed updates automatically. Explicit bundled-inventory previews can add records and update metadata without replacing saved specifications or removing implementations; they append revision history transactionally. JSON export is a portable current-state snapshot, not a full database backup. Changing family appearance does not require a data migration: both views edit the same records.
