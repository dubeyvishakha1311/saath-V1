# Saath UI direction · 0.4.0

## Intent

A personal notebook, not a wellness landing page. The interface should feel useful and specific to its purpose rather than decorated to look reassuring. These are design decisions implemented in code, not a claim of human authorship or validated user-research findings.

## Decisions

1. **Give each screen one job.** Today starts with a voluntary feeling check-in and one journal action. Explore provides other entry points. Calm presents immediate tools without forcing writing. Reading, writing and screening have different layouts.
2. **Use hierarchy instead of decoration.** Warm paper surfaces, quiet rules and restrained corners; one rust accent for primary writing actions and forest for navigation/support tools. No generic pastel grid, floating leaf illustrations, sparkles, gradients or repeated motivational filler.
3. **Make reading feel like reading.** Georgia/system serif for English titles and original story/poem text; system sans-serif for controls. Bundle Hindi glyphs locally to avoid missing text or a remote font dependency. No changes to English questionnaire items.
4. **Keep decisions visible.** Plain action labels, explicit optionality, local-save feedback, pressed states and instructions to tap a feeling again to clear it. No guilt for missed days or confetti for completing clinical-style questions.
5. **Make important controls easy to find.** Preserve Back/Home on every screen, help in the header, labelled bottom navigation, and the larger raised centre Calm button. Core controls target 44–48px minimum touch height; the Calm icon is 62px.
6. **Respect attention.** No automatic screen entrance animation. Only the breathing ring animates; instruction text stays still. Reduced-motion preference disables animation. Keyboard selection updates retain focus; new screens/questions focus their headings without scrolling unexpectedly.
7. **Keep limitations visible.** No removal of clinical, screening, privacy, encryption or crisis-service limitations for visual cleanliness. Muted text is used for supplementary detail, not to hide safety disclosures. No automatic calling or implied human monitoring.

## Design tokens

- Paper `#FAF8F3`, surface `#FFFDF9`, ink `#29332E`, muted `#6B7066`.
- Forest `#334E43`, rust `#994A32`, sand `#EFE7D8`, sage `#E9EEE5`.
- Shared control radius 12px; reading sheets are flatter. Layout spacing follows 6–8px increments with larger breaks between tasks.
- Mobile app canvas up to 460px. Desktop preview contains that canvas rather than stretching mobile content across a website layout.

## Checks and unresolved work

Automated functional tests and mobile browser checks cover English/Hindi layout, focus, mood clearing, reduced motion and existing safety flows. These are not a substitute for usability sessions, a complete contrast/screen-reader audit, font scaling/keyboard testing on real Android devices, or clinical/native-speaker review. The content and storage limitations documented in the PRD and feature coverage remain unchanged.
