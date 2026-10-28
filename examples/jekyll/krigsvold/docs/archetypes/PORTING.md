# Porting the collection to Astro and React

## Preserve the contract

Consume `content/catalog.json` and validate against `contracts/catalog.schema.json`; do not parse the generated Liquid or rendered HTML. Preserve stable IDs, destinations, semantic classes, order of sections, source metadata, and capability boundaries. The schema version is `1`; incompatible changes require a migration and a version increment.

A page has `id`, `semantic_class`, `composition`, `title`, `summary`, `category`, and `sections`. Articles additionally require `date`, `author`, and `tags`. Events require a structured event record with offset-bearing start/end timestamps, display values, IANA timezone, location, and registration state. Other classes currently compose their domain information from typed sections; add dedicated schemas and renderers when those classes acquire reusable structured behaviour. A class label alone does not imply a complete domain model.

Sections are a discriminated union: prose (no `kind`), cards, listing, facts, figure, table, stats, FAQ, plans, form, search, gallery, workspace, chat, sensors, scene. IDs are stable fragment destinations. Keep links and media in structured fields so adapters can apply the deployment base path. Content strings are authored Markdown, not Liquid or JSX. The stress fixture deliberately contains trusted author-supplied semantic HTML/MathML. Do not feed untrusted user HTML through this renderer; sanitise it at the ingestion boundary using an explicit allowlist.

## Adapter boundaries

- **Astro:** implement the seven composition frames as layouts and section roles as components; emit the shared browser enhancement script or equivalent island behaviour. Generate routes from the catalog and apply `BASE_URL` to structured local destinations and media. Use the family's native shell and fonts.
- **React:** implement a typed discriminated union from the schema and a section renderer keyed by `kind`; use the family's existing components where their contracts fit. Keep browser state in the relevant component, with effect cleanup. Use the chosen router's base-path handling. Do not import both families' CSS or fonts into a single-family build.
- **Shared:** reuse the content and acceptance criteria. The existing dependency-free browser script is a reference for behaviour, not a requirement to use imperative DOM code in React.

Martlet demonstrates sustained reading, editorial collections, and a collection-to-focused-record flow. Krigsvold demonstrates aligned section labels, compact records, supporting facts, and a divided collection/active-record workspace. Both collapse to a logical reading order on small screens. Do not reduce this distinction to a token swap, or make either family unable to render the other family's content.

## Service integrations

| Capability | Required live adapter | Current specimen |
| --- | --- | --- |
| Contact/newsletter | Submission endpoint, delivery, abuse controls, consent handling | Native constraints and local status only |
| Identity and two-factor | Identity provider, server verification, sessions, recovery | Format validation, no authentication |
| Booking/payment | Confirmed registration or transaction provider | Enquiry destination only |
| Messaging | Authorised service, persistence, delivery acknowledgement | Text-only messages in page memory |
| Sensors and fleet | Authorised data/device service | Simulated data and local selection/review |
| Scene/VR | Renderer and device support | Captioned static scene selector |
| Search | Optional hosted search for larger collections | Build-time index of title, summary, category |
| Error routing | Host-specific status and routing configuration | `404.html`; server-error page returns normal static status |

Do not show a success claim until the relevant live adapter confirms it. Keep loading, validation failure, empty, unavailable, uncertain-result, and retry states explicit as live services are added. Account screen variants are composition choices, not separate identity implementations.

## Extending the collection

1. Identify the new content semantics before designing the frame.
2. Extend and version the schema where required.
3. Add fixture content once, with real destination relationships.
4. Add a section renderer, class-specific renderer, or composition only when the new semantics require it.
5. Provide both family renditions and the same recovery/accessibility behaviour.
6. Run parity, root/base-path, rendered-link, no-JavaScript, print, and browser checks.

The 46 recipes cover the Material Kit catalog's general page roles plus reference documents, collection records, search, events, reports, exhibitions, change histories, and content stress testing. They do not reproduce Creative Tim source code or claim backend functionality.
