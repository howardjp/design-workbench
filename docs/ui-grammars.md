# Two independent UI grammars

**October 24 review status:** application grammar 0.3 remains experimental. The [origin audit](qa/origin-audit-2026-10-23.md) records 67 baseline findings; the [reconciliation ledger](qa/origin-reconciliation.md) states every implemented disposition and remaining gap. Source objects are authoritative in their contexts. New application capabilities retain explicit task/interaction specifications. Broader pattern and consumer evidence is required before grammar stability.

October 23, 2026 · Implementation brief · Pattern decisions remain experimental

Martlet and Krigsvold are independent design languages with equal capability and breadth. A template, a component catalogue, or two presentations of one application does not establish either language. Each must explain how its foundations, components, interactions, and complete task patterns combine, and why a particular combination suits a particular situation. Independence includes spacing, density, hierarchy, grouping, boundaries, action placement, disclosure, feedback, and continuity during change.

The adopted [Martlet charter](https://github.com/martlettheme/npm/blob/main/docs/charter.md) and [Krigsvold charter](https://github.com/krigsvoldtheme/npm/blob/main/docs/charter.md) remain authoritative. Existing colors, typography, and original identity assets are the vocabulary from which this work proceeds. Neither language is defined by a navigation orientation, a content genre, or being the opposite of the other.

Each language also requires its own independently usable [MCP interface and companion builder skill](mcp.md), giving agents access to the same versioned grammar, pattern rationale, contracts, examples, and compatibility limits as human readers, together with a method for applying them. Both deliverables must preserve the languages' independence and distinguish implemented knowledge from proposals.

## What a grammar must supply

| Layer | Required decisions | Evidence |
| --- | --- | --- |
| Foundations | Semantic spacing relationships; measures and grids; density; surfaces and boundaries; motion and layering; existing color and type roles | Versioned rules with rationale, responsive behavior, and examples beyond one page |
| Components | Anatomy, variants, states, content, dimensions, keyboard and focus behavior | Usable implementation and documented limits |
| Composition | How labels, help, controls, actions, status, and related regions belong together; when a boundary, surface, or whitespace carries the relationship | Multiple compositions following the same rule; counterexamples explaining failures |
| Task patterns | Finding and filtering, selecting, creating, editing, saving, validation, destructive actions, recovery, and navigation | Complete flows including unsuccessful and interrupted work |
| Adaptation | Changes in width, text size, language, input method, available space, and data volume | Retained capabilities and understandable source/focus order across conditions |

Spacing is relational. A field's label, control, and explanation must read as one unit; neighboring fields form a different relationship; a new task region is another. A scale of numbers alone does not say when to use them. Density must preserve those relationships and readable, operable controls. Compact working regions and generous larger regions are available to both languages. The present React spacing roles are experimental implementation values, not a completed grammar or a new foundation specification.

## Independent decisions grounded in the charters

These are criteria for developing and reviewing patterns, not a claim that every pattern already implements them.

| Concern | Martlet criterion | Krigsvold criterion |
| --- | --- | --- |
| Grouping | Proximity, proportion, and hierarchy make related information and the next action understandable | Alignment, regional space, and purposeful boundaries make context and relationships legible |
| Working density | Preserve a readable sequence and clear local groups as the task becomes compact | Preserve stable alignment and useful comparison within compact working regions |
| Assistance | Place useful explanation with the decision it supports; warmth remains precise during failure | Identify requirements, current state, and available recovery precisely; clarity remains approachable |
| Change | Preserve the person's place and understanding during expansion, validation, loading, and navigation | Keep context and alignment stable while distinguishing pending, completed, and failed work |
| Emphasis | Let hierarchy and selective accents carry importance; decoration must have a purpose | Let controlled contrast and meaningful regions carry importance; boundaries must have a purpose |

These criteria can lead to the same sound decision. Do not manufacture different keyboard conventions, inferior recovery, or an opposite layout merely to demonstrate difference. Share accessibility requirements, domain logic, state invariants, and tests when useful. Shared tooling must not force one rendered composition, spacing model, action hierarchy, or interaction sequence onto both languages. Equally, independent implementations must each work without loading the other family.

## Pattern specification contract

Every pattern records:

1. The person's goal, task context, data volume, and when another pattern is preferable.
2. Anatomy and relationships: orientation, scope, work area, supporting context, actions, and feedback.
3. Each family's independent rationale, semantic spacing/density choices, hierarchy, and interaction decisions. Link the relevant charter principles and originating-site evidence.
4. A state and transition model: initial, loading, populated, empty, no matches, selected, editing, changed, submitting, success, failure, and recovery as applicable. Distinguish absent data, no search matches, and failed retrieval.
5. Action scope and consequences: object versus collection actions, selection versus opening, draft versus saved data, removal versus deletion, cancel versus reset. Explain what survives a failed or interrupted action.
6. Keyboard, focus, announcements, pointer/touch, reduced motion, and a stable experience without animation. Use expected platform semantics; document optional shortcuts without making them the only route.
7. Narrow and enlarged-text behavior, long labels, localization and direction, density changes, and source order. State what changes and what remains available.
8. Worked examples, counterexamples, implementation ownership, maturity, compatibility impact, and observed evidence. Distinguish a proposal, a working specimen, and a validated reusable pattern.

A successful screenshot is one state. A reusable pattern must explain and demonstrate what happens before and after it.

## First application test: a Cardfile-like collection

Cardfile supplies a task model, not authorization to replace the application or copy private records into examples. Use identical synthetic content and capabilities for both family specimens. Each language must support folders, searching, a collection, reading, creating, editing, and the relevant commands. Top navigation, side navigation, and a focused workspace without primary navigation are composition choices available to both.

Resolve the same scenarios independently:

| Scenario | Required outcome |
| --- | --- |
| Enter a folder; search; clear the query | Search scope is explicit; results and empty/no-match states are understandable; clearing restores the intended collection |
| Choose a record; open it; return | Selection and opening have explicit meanings; collection position and focus remain understandable |
| Edit a record; attempt to leave with changes | The draft is not silently lost; the person can understand and resolve the pending choice |
| Submit invalid content | Explain errors at their controls and provide an appropriate route to them; retain entered work |
| Save successfully or encounter a save failure | Distinguish pending, saved, and unsaved states; prevent duplicate submission; retain a useful retry path |
| Remove or delete a record | State the scope and consequence; use confirmation or recovery appropriate to the operation rather than an automatic dialog for every action |
| Use the workspace at narrow widths or enlarged text | Retain finding, reading, editing, and recovery; keep orientation and return paths clear |
| Use a compact collection with a comfortable editor | Density serves each region's task while grouping, focus visibility, and control usability remain intact |

Do not start with a shared three-column template and reskin it. Start with the task, derive each composition from its language, then assess the results against the same outcomes. A split view may be appropriate in both; that alone proves neither sameness nor distinction.

## Acceptance and current position

The [grammar conformance map](grammar-conformance.md) binds the settled decisions to executable checks and states their scope. Owner-directed documentation surfaces are recorded separately from application grammar; the latest [navigation decision](documentation-navigation.md) supersedes the earlier origin-header host translation. Independent adoption uses the [Claude exercise](qa/claude-adoption-brief.md) and does not inherit existing internal findings.

Evaluate the same task, content, state set, and data volume in both languages. Review family coherence across several compositions, capability parity, keyboard and focus behavior, failure/recovery, narrow and enlarged-text layouts, and recognition with marks removed and color distinctions reduced. Record observations and remaining uncertainty. Use findings to improve the reusable rules and return validated improvements to the originating sites.

The current 22-component React packages and workbench are experimental building blocks and consumers. Each family has a proposed versioned application grammar, an existing theme-site mark, semantic theme roles, a separate documentation composition, flexible AppShell placements, and a collection/editor specimen. The October 24 reconciliation restores documented source-object roles and removes unsupported decoration; documentation compositions remain host translations. The specimens share a tested domain model while choosing different compositions and transitions between collection, reading, and editing. Local MCP servers and companion skills expose the documented snapshot with provenance and limitations; hashes establish what was retrieved, not whether the design rules are correct. Remaining source vocabulary, extension validation, comprehensive pattern coverage, manual accessibility review, and sustained consumer evidence remain open. Do not present documentation layout differences or passing component tests as acceptance of the complete languages.

## External references

[Carbon's pattern overview](https://www.carbondesignsystem.com/building-blocks/core/patterns/overview) distinguishes task patterns from individual implemented components. Its [forms guidance](https://www.carbondesignsystem.com/building-blocks/core/patterns/forms) shows the level of detail needed for grouping, context, spacing, validation, and action behavior. These references inform the scope of our specification; Carbon's individual decisions are not automatically Martlet or Krigsvold rules.

Creative Tim application templates provide examples of useful frames and combinations. Treat them as references for breadth of composition, rather than definitions of either design language or evidence that a generic dashboard is sufficient.
