# Independent adoption exercise for Claude

Build small, working examples of Martlet and Krigsvold using only their public guidance. The question is whether a new adopter can make a coherent interface without help from the systems' implementer. This is an adoption exercise, not a review of the implementation repository.

## Starting points

- Martlet: https://martletdesign.dev/ and https://martletdesign.dev/react/
- Krigsvold: https://krigsvolddesign.dev/ and https://krigsvolddesign.dev/react/
- Read-only MCP endpoints: https://martletdesign.dev/mcp and https://krigsvolddesign.dev/mcp

Start a new directory for each language and framework. Follow the public getting-started instructions and discover the documented skill/MCP setup there. Record exact versions, installation sources, commands and the retrieved guidance provenance. Do not use a local checkout, unpublished workspace packages, existing examples' application code, or previous adoption reports. If a documented package cannot be obtained, report that first; a documented public alternative can be tried as a separately labelled route. Do not infer an undocumented API or quietly repair the library.

## Task

Create a fictional workshop information and registration interface in each language, through React and Astro, for four independently runnable projects. Use the same content and capabilities while making each language's own compositional decisions. This is a small exercise, not a production registration service.

Include a workshop overview with several linked sections and supporting information; a short registration form with related attendee and attendance decisions; visible requirements and useful help; validation, retained input, simulated submission failure, retry and success. Clearly disclose that nothing is sent or stored durably. Use synthetic names and addresses only.

Choose navigation and layout from the documented task rules. Do not assume the two languages require different navigation orientations. Use only documented capabilities; distinguish framework components from native HTML and host-owned scripting. A documented capability gap is a finding, not permission to invent a library export.

Exercise wide and narrow layouts, long labels, enlarged text, both documented appearances, and keyboard interaction. Inspect actual focus, validation links, reading order, hidden content, form recovery, and horizontal overflow. Treat automated accessibility results as bounded evidence rather than certification.

## Independence

Before asking the implementer for help, preserve the exact command, URL, excerpt or UI state that stopped you. Keep a first-attempt record even if you later find a workaround. Trace important choices about spacing, typography, surfaces, action placement, navigation, and state to guidance; mark choices left to the adopter. Do not make the two results look different merely to satisfy the exercise.

You may read public package sources to investigate a failure after recording the guidance-only attempt. Keep that investigation separate. Do not read the workbench's existing adoption findings, regression tests, or internal decision ledgers before completing your first findings.

## Return

Return source and lockfiles for all four projects, reproducible run commands, a short first-attempt log, and screenshots of representative wide/narrow and success/failure states. For each finding give the public instruction followed, expected and observed result, reproduction, impact, workaround and confidence. Separate defects, documentation gaps, ambiguous design choices and environmental blockers.

Conclude separately for each language/framework: could you install it, identify supported APIs, build the requested behavior, explain the design decisions, and recover when something failed? Report untested items explicitly. Do not publish packages, merge library changes, deploy public apps, or connect real registration services as part of this exercise.
