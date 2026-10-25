# Experimental distribution and adoption review

October 25, 2026. This extends grammar coverage 0.3 into usable distribution. Cardfile and new product development remain deferred. Existing Cloudflare Workers host the public MCPs; no Railway service is required. Private React review builds keep their audience.

## Release boundaries

Core 2.2.1, Astro 1.2.1 and React 0.1.0 have independent versions. The core and Astro candidates use GitHub pre-release labels and npm's `next` tag; existing `latest` tags remain unchanged. React's first release is also experimental and uses `next`. React retains its tested theme 2.1.0 dependency; Astro requires core ^2.2.1. This is an explicit compatibility matrix, not a claim that every package needs the same version number.

`docs/distribution.json` records verified package and endpoint availability separately from immutable canonical guidance snapshots. A merged PR, candidate tarball or successful build is not recorded as a published npm version. The package workflows use trusted publishing; no token is committed. The React gate checks repository, exact version tag and main ancestry and runs the supported-browser, package and agent checks before publication.

## Accessibility and release review

| Area | Evidence and limit |
| --- | --- |
| Keyboard and focus | Existing browser scenarios and complete reference transitions cover native controls, error links, modal dismissal, return focus, retained work and cancellation of late completion. |
| Contrast and semantics | Automated accessibility checks run on the reference patterns in both appearances; source-role and target-size decisions remain documented. This is not a global conformance claim. |
| Reflow | The focused patterns cover 320px layouts, 200% text and 400% text at a 1280px viewport. Agent setup has a narrow/enlarged-text check. |
| Framework honesty | Astro contracts describe native HTML and host scripts. React props and controllers are not presented as Astro exports. |
| Manual assistive technology | Not established by this review. Screen-reader, forced-colors and sustained real-user observations remain open. |
| Broader language evidence | RTL, compact density, larger remote datasets, broader publishing vocabulary and sustained application use remain open. |

## MCP and skills

Both independent catalogues have 58 references, including `builder-skill` and the platform-specific `platform:Astro` API reference. HTTP and stdio share the registration factory and canonical hashes. The public Worker uses the official SDK with the Worker-compatible schema validator, stateless modern 2026-07-28 and legacy Streamable HTTP serving, bounded bodies and read-only tools. Source includes required dependency licenses. There is no registry database, user draft, write API, runtime credential or runtime external content fetch in the knowledge service.

Source and compiled-Worker client checks cover tools/resources, exact content hashes, family isolation, missing versions/references, invalid arguments, origin/body limits and fallback to the existing static site. Offline archives install outside the workbench using locked dependencies. Optional skill ZIPs are separate from the MCP protocol; fetching a builder method does not claim a persistent skill was installed.

Client instructions follow official OpenAI and Anthropic documentation in [agent setup](../agent-setup.md). Protocol interoperability, installation in a particular account, and public directory submission are separate observations. The final release record and CI links should report actual successes and blockers without treating any one as proof of all three.

## Adoption acceptance

An empty-project consumer must install the actual advertised packages, import CSS and fonts explicitly, use the correct family scope, retrieve the grammar and task pattern, exercise a complete form or query transition, and record provenance and limits. A locally packed consumer is additional evidence and does not substitute for an actual registry installation.

## Independent first-consumer findings

Two fresh Astro 5.18.2 consumers installed the actual registry core 2.2.0 / Astro 1.2.0 packages and built distinct host identities. Martlet passed 14 semantic/assets and 15 Chromium observations; Krigsvold passed 24 semantic and 11 Chromium observations. Both checked production build, local assets, source order, narrow/enlarged text and native focus behavior. These are bounded adoption fixtures, not sustained product use.

The checks exposed misleading packaged “unreleased” wording, React-only offline API guidance, missing distinction between a skill directory and the full stdio archive, and an actual Krigsvold source-profile header border. Patch releases correct the packaged metadata and scoped border. Astro integration now asserts the computed zero-width border. Both builders have explicit Astro href/slot/header/footer/print guidance. Astro contents remain visible in print; source mastheads are not falsely advertised as exported Astro controllers.

Private portable plugins pair each skill with only its own remote MCP and source mark. Claude Code 2.1.310 `plugin validate --strict` passes both manifests/MCP configurations; its separate directory-submission checks still note absent raster listing icons and privacy-policy URLs. No public directory submission is claimed. Standalone personal-skill persistence failed with HTTP 422; validated source remains committed locally and in the workbench distribution.
