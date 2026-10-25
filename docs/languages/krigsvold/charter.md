# Krigsvold design charter

Version 1.0 · Adopted October 21, 2026

This charter establishes the direction for Krigsvold's development as a complete design system. Its starting observation is agreed: Krigsvold feels icy. The meaning of that character is still developing; the principles below make it specific enough to explore and evaluate. Existing package contracts remain in force; this document introduces no token, API, or compatibility changes and does not imply that the proposed component inventory has shipped.

## Purpose and character

Krigsvold should give digital experiences a sense of clarity, stillness, precision, and space. Its icy character should emerge through crisp typography, deliberate boundaries, aligned regions, and controlled contrast. People should be able to understand the structure of an unfamiliar page and find the information or action they need.

The existing navy, glacier blue, paper surfaces, bronze accents, and Roboto family provide a starting vocabulary. Roboto supports body and interface text; Roboto Slab gives headings a strong presence; Roboto Mono supports code and numerical work. Literal imagery of ice is optional. The character should remain apparent in an ordinary form or table and in both Light and Dark modes.

Krigsvold's originating sites offer useful evidence, but the system should support publishing, services, collections, and interactive applications. A reading experience deserves as much care as a working panel. Adopting projects supply their own identity, content, and organizational purpose.

## Design principles

**Make structure legible.** Establish clear regions for orientation, content, supporting information, and action. Use alignment, typographic hierarchy, boundaries, and contrasting surfaces to explain those regions. A boundary should communicate a meaningful change in purpose, state, or context.

**Give space a defined role.** Separate major regions generously when their purposes differ. Within a working region, spacing should group related information and support efficient comparison. A compact table and an expansive page can belong to the same system. Density must be an explicit choice with readable text and usable controls.

**Use contrast to clarify importance.** Navy, glacier tones, light surfaces, and bronze should establish an understandable hierarchy. Assign color through semantic roles, including status and interaction states. Color is one source of information; labels, shape, position, and other cues must preserve meaning when color distinctions are unavailable.

**Treat precision as assistance.** Labels should identify what information is required. Status should distinguish what has happened, what is happening, and what someone can do next. Errors should explain a useful recovery path and retain entered work where possible. Icy clarity must remain approachable when a person is uncertain or a task fails.

**Keep change controlled.** Transitions should establish a new state or location without competing with the task. Use restrained motion and provide understandable updates when motion is reduced or absent. Stable alignment and persistent context matter during loading, filtering, expansion, and navigation.

## Foundations and component contracts

The specification should cover semantic color, typography, spacing, reading and content widths, responsive composition, density, borders, shape, elevation, layering, and motion. Define the relationships among page regions and the local spacing inside them. Reference scales, semantic tokens, and component dimensions need separate explanations. Numerical values and public names belong in versioned specifications; the charter supplies criteria for their development.

Expand the component inventory through forms, navigation, feedback, disclosure, overlays, data presentation, and complete task patterns. Each supported component needs a purpose, anatomy, applicable states, interaction rules, content guidance, responsive behavior, and accessibility acceptance criteria. Demonstrate combinations such as a filtered collection or a validated form. Distinguish planned, experimental, and stable capabilities.

Accessibility is a condition of acceptance. Review keyboard operation, focus visibility and restoration, labels and announcements, contrast, text enlargement, reflow, forced colors, and reduced motion where applicable. Support long content, localization, and changes in reading direction. Document what works without JavaScript and which interactions require it. Preserve source order and access to information as layouts change.

## Relationship with Martlet

Krigsvold and Martlet share blue, white, gold, order, and restraint. Their different emotional temperatures emerged through their development. Krigsvold's charter should describe its own character; each design decision does not need an opposing Martlet decision. Sound usability and accessibility can produce identical answers in both families.

Share interaction contracts, accessibility work, tests, and tooling where practical. Keep independent judgments about typography, spatial organization, surfaces, and visual emphasis. Krigsvold's icy character needs to be recognizable beyond its palette or a distinctive hero. Neither family is restricted to institutional or editorial work.

## Living baselines

[krigsvold.org](https://krigsvold.org/) is the starting ground truth for Krigsvold and remains a live baseline throughout the system's development. Its real content, tasks, and ongoing use provide evidence for design decisions. The baseline describes what works today and can evolve as generalization exposes better solutions.

An inherited decision that fails when generalized should be removed or revised. Establish a working replacement against both the originating site's real usage and the broader conditions that exposed the failure. Historical fidelity does not justify retaining a design that no longer works.

Carry the validated improvement into the packages and specifications, then back into the originating website. Verify the revised site in use so it becomes the next live baseline. Record the failure, the replacement, and the reasons for the change, and follow the release and migration requirements of affected contracts.

This feedback loop continues throughout development: observe real use, generalize, test, replace what fails, and improve the baseline. Controlled examples and automated checks support that work; they cannot establish real-world fitness on their own.

## Evidence and review

The next milestone is four comparative experiences: an article with supporting material, a substantial form, a searchable collection, and an application dashboard. Ground these comparisons in real content and tasks, and give both families the same content and functionality. Continue evaluating changes against the live baseline while exploring contexts beyond it. With brand marks removed, review whether Krigsvold's structure, rhythm, and emphasis still convey its character. Check that generous regional spacing and any compact local density remain useful at narrow widths and with enlarged text.

The live sites should exercise the system as consumers. Move reusable decisions into the packages and specifications while keeping site identity, navigation, routing, content, analytics, and consent policy with the host. Examples embedded in a site should use its shared page shell. Standalone starters should make their purpose clear.

Maintainers should document the reasons for consequential changes and identify provisional decisions. Review proposals against the charter, demonstrated user needs, and compatibility obligations. Version and deprecate stable contracts deliberately. The charter can change as practical use gives greater precision to the meaning of icy clarity.
