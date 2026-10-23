# Demonstrating the two design languages

October 23, 2026 · Experimental foundation review

Start with the language, then the work. Martlet and Krigsvold have their own original identity, native theme vocabulary, application grammar, component implementations, reference composition, and agent-facing knowledge. Neither language is limited to a particular content genre or navigation orientation. The purpose of this demonstration is to review a working foundation and the evidence behind its decisions, not to declare a complete, stable design system.

## A five-part demonstration

1. Open each private reference home. Follow The language / Design language. Compare how the rules account for grouping, spatial relationships, hierarchy, assistance, scope, and change. Original marks and existing colors identify the systems; they do not carry the entire distinction.
2. Open Working patterns and then the focused workspace. Both contain the same fictional notes and operations. Martlet's Commonplace leads from a browsable collection into focused reading and editing. Krigsvold's Notes workspace retains the collection beside the current record when width permits. Discuss the task decisions behind each, rather than treating the two compositions as mandatory templates.
3. Search within a collection, recover from no matches, create a note, and edit it. Try an empty title. Turn on the separate failure-inspection control and save: the draft survives, the error explains recovery, and retry commits it. Try leaving a changed editor and cancel that choice. Move a saved note to trash and undo it. These transitions matter as much as the populated screen.
4. Use the 320px and 768px width controls and change light/dark mode while editing. The same working document retains its draft as it reflows. Inspect the native AppShell component separately with top, side, and no primary navigation. Compact application frames are available in both languages.
5. Open For agents / Agent tools. Download that family's archive, install its locked dependencies outside the workbench, and query the local stdio server. Begin with get_manifest, search for a collection/editor task, then retrieve the full pattern, grammar, and actual component example. Inspect family, source hashes, maturity, and unsupported-version handling. Read the companion skill's method for applying the rules.

## What is working

Each family has 22 experimental React exports and all-component live examples, a versioned first application grammar, a complete session-only collection/editor specimen, a local MCP server with 52 references, and an independently usable builder skill and distribution archive. Both archives have been installed and queried outside the workbench. Independent skill-use evaluations produced contact-directory demos in a Martlet side-navigation frame and a Krigsvold top-navigation frame; source, observations and limits are retained under qa/skill-evaluation.

The local registry remains a separate, functional administration consumer. It is not included in either static reference or agent archive. Its revision history, conflict recovery, readiness observations and browser draft/settings behavior remain subject to their existing regression suite.

## What the demonstration does not establish

The notebook deliberately uses fictional session data; it does not replace Cardfile or supply durable persistence, collaboration, rich text, or backend retrieval. MCP is local stdio, with SDK-client interoperability verified; remote hosting and individual desktop-client setup are further work. The skills are included in the source and agent archives. Synchronization to the user's personal Skills service failed with HTTP 422, so personal installation is not claimed.

Pattern breadth, manual assistive-technology review, localization/RTL, forced colors, real consumer adoption, and sustained usability evidence remain open before stable release. Passing automated checks and a polished demonstration do not remove those obligations. npm publication, DNS changes, source-site replacement and repository restructuring are not part of this milestone.
