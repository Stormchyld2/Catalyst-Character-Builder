# 013 — Character Studio UX, Design System & Accessibility

**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 001 scope, 006 guided/manual creation, 007 advancement, 008 interactive sheets, 016 ownership  
**Scope:** Standalone Svelte 5 desktop experience, reusable presentation tokens, accessibility and UX states.

## 1. Product experience

Character Studio should feel like one coherent Catalyst application: Obsidian/charcoal/gunmetal surfaces, metallic silver structure and Frost Blue (#6EA9CF) interactive accents; use the approved nine-color palette in repository AGENTS.md. Prioritize readability, clear hierarchy, predictable keyboard operation and fast offline workflows over decorative effects. Do not copy D&D Beyond artwork, proprietary layouts or assets.

The application offers Character Library, New Character (Guided/Manual), Drafts, Interactive Sheet, Advancement, Sheet Templates/Designer, Rules & Sources, Import/Export/Print and Settings. Capabilities not yet implemented must not appear as functional controls.

## 2. Navigation and screen architecture

**Library:** searchable list/grid with character identity, system/edition, last saved time, draft status and unresolved content badges; never use calculated stats as index authority.

**Creation:** persistent step navigation, center option workspace, right live summary on wide screens; compact collapsible summary at narrow widths. Manual and guided share C01 data and M02 sheet.

**Sheet:** tabs/sections for identity, abilities/skills, actions, resources/conditions, equipment, spells/powers, features and notes, with actual tabs determined by template and rules capabilities. System-Neutral characters do not inherit mandatory D&D categories.

**Advancement:** explicit draft, choices, before/after preview, validation, confirmation and committed-history view.

**Designer:** distinct edit/preview modes, versioned templates, constrained layout grid, keyboard reordering, undo pending edits and explicit publish.

**Sourcebooks:** View Source delegates to parent shared reader; offline availability and missing file repair states are visible.

## 3. Design tokens and components

Versioned tokens: background/surface/elevated surfaces, border, text-primary/secondary, accent, success/warning/error, focus ring; typography scale; spacing grid; corner radii; elevation; motion durations; breakpoints. Do not encode game mechanics in color alone.

Shared UI primitives: navigation rail, toolbar, card, stat display, field editor, counter, choice tile, source citation, validation panel, confirmation dialog, toast, save indicator, diff row, resource meter, empty state and loading skeleton. Maintain design token parity with parent Catalyst where feasible, but avoid importing parent application runtime.

## 4. Accessibility requirements

- Full keyboard access for navigation, fields, modals, choice cards, resource counters, sheet tabs and designer reordering.
- Logical focus order, visible focus indicators, modal focus trapping/return, no keyboard traps.
- Accessible names/descriptions and programmatically associated errors.
- Screen-reader announcements for save completion/failure, validation and resource changes; avoid excessive live-region chatter.
- Text resize, responsive layouts, high contrast, reduced motion and non-color status cues.
- Accessible tables and readable print profiles.
- Prefer WCAG 2.2 AA as design/test target; measure actual compliance rather than claiming it without audit.

## 5. Save, conflict and failure UX

Every edit distinguishes unsaved, saving, saved, conflict and failed. Show last confirmed save revision/time when available. Autosave does not conceal errors. Revision conflicts offer review/reload/reconcile while preserving local pending edits.

Missing rules pack: show authored data with unresolved computed fields and repair options. Missing portrait/template: fallback without erasing reference. Unsupported schema: safe read-only/backup guidance. Disconnected removable library: clear unavailable state; never fabricate an empty library.

No action silently changes edition, discards downstream choices or commits advancement. Preview and confirm consequential changes.

## 6. Responsive and performance strategy

Target Windows desktop first; use adaptive widths for split panes, collapsed rails and scrollable content. Avoid horizontal scrolling for primary actions. Large inventories, spell lists and option catalogs use virtualization or pagination while retaining accessible search. Calculations may be memoized by character revision and rules digest; cached values are non-authoritative.

Do not make network access necessary for fonts, icons, sourcebook search or normal navigation. Heavy PDF/print operations belong to shared adapters and should not block basic character editing.

## 7. Interaction contracts

Svelte UI emits typed commands to application services; it does not directly patch JSON files or run rules formulas. Domain engines return view models, diagnostics and provenance. Keep presentational state (open tab, filter, dialog) separate from authoritative character state. Permission-sensitive controls must be backed by application authorization, not only hidden in UI.

## 8. Test matrix

1. Navigate all MVP screens with keyboard only.
2. Validate focus restoration after modal close and failed save.
3. Screen-reader labels and error associations on guided and manual forms.
4. Responsive sheet remains editable at supported compact widths.
5. System-Neutral sheet has no forced D&D-only fields.
6. Choice changes show dependency preview before invalidation.
7. Advancement diff and confirmation are comprehensible without color.
8. Autosave states reflect real repository results.
9. Missing pack, disconnected drive and unsupported schema preserve authored data.
10. Designer reorder works without drag-and-drop.
11. Print preview and actual export match authoritative values.
12. Core app runs with networking disabled and bundled assets only.
13. Long text, localized labels and large font settings do not hide actions.
14. Verify accessibility against WCAG 2.2 AA criteria with automated and manual checks.

## 9. Delivery gates

Ship library/manual sheet UX before advanced designer. Define visual token spec and keyboard interaction patterns before creating many screens. Capture screenshot review and accessibility audit results during implementation, not as a documentation-only claim.

**Rule:** Every visible state is grounded in an actual engine or adapter result; polish must never disguise data loss.

## Approved integrated portrait workflow and artwork scope (2026-11-24)

Architecture 006, 017 and 018 and AGENTS.md define the controlling integrated workflow. M01 renders the same M22 Portrait Studio components inside its central Appearance & Portrait step, preserving wizard navigation/progress/context; no modal, visible module switch or duplicate generator. C13 prepopulates prompts from the saved draft; shared inference and S15 remain single implementations. Checkpoint before entry; Accept & Continue attaches the approved managed asset with revision checks and advances to review. Cancel/failure/reopen preserve selections and previous portrait. Default class art, import and skip remain available without AI. Use accepted portrait across builder, library, dashboard, sheet, roster and print; token independent. Bundled character art is limited to 26 male/female defaults for 13 planned D&D classes, with neutral fallback for unsupported/classless systems; no required species/subclass/background paintings. Class artwork: individual 3:2 cinematic PNG masters, target 1536 x 1024 or higher, class-appropriate environments, simple lowercase filenames (ranger-male.png), dynamic cover cropping/focal points. Sidebar art fades via CSS; official branding unchanged. Test both contexts, offline non-AI completion, draft recovery, cancel/failure, attachment and cross-view rendering. Engine-first validation remains mandatory; this decision does not establish implementation completion.
