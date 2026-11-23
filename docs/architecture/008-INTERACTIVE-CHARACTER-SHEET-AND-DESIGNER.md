# 008 — Interactive Character Sheet, Binding & Sheet Designer Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 016 Character Engine Build Plan & Ownership; 003 Character Data Model; 005 Calculation/Conditions/Validation; 006 Creation; 007 Advancement; 009 Sourcebook Library  
**Primary ownership:** M02 Interactive Character Sheet & Designer; C09 Character Sheet Binding & Theme. Integrations with C01–C08 and C10–C12.

## 1. Purpose and design principles

Provide a polished, interactive, offline character sheet for both rules-driven and System-Neutral/manual characters. The sheet is a **view and editor over the canonical C01 record**, never a second character database or a separate model for guided characters. C09 owns the reusable typed binding/view-model engine; M02 owns the Svelte presentation and visual designer.

Support a quick, usable **manual sheet MVP in V1**. Advanced layout authoring, decorative themes and extensive template management follow in later milestones. Design for Catalyst's charcoal/gunmetal, silver and amber/gold UI without embedding presentation dependencies in the core.

## 2. Ownership and non-duplication

| Concern | Owner / boundary |
|---|---|
| Character identity, authored fields, selections, revisions and drafts | C01 |
| Rules-pack definitions and resolved context | S04 |
| Derived stats, modifiers and explanation traces | S05 |
| Choice/prerequisite logic | S06 / C02 / C03 |
| Advancement and history | C04 / M03 / C12 |
| Spells, equipment, conditions and resources | C05 / C06 / C07 |
| Action/roll binding | C08 via parent Catalyst S07 dice **port only** |
| Sheet bindings, template interpretation, widget view models, theme tokens | C09 |
| Interactive UI, sheet designer, accessibility and responsive layouts | M02 |
| Citations and PDF navigation | C10 via parent S12/S13 ports |
| Character-specific print profiles | C11 via parent S14 print port |
| Storage, permissions and events | Host-provided S01–S03 / S09–S10 adapters |

C09 is a pure TypeScript library: no Svelte components/stores, browser DOM, Tauri IPC, filesystem, PDF rendering, print engine or dice evaluation. Parent Catalyst imports the same library and injects host services.

## 3. Canonical data versus view state

Authoritative character data includes stable character/field/item IDs, authored values, manual overrides, resource state, equipment state, progression history, and a selected sheet template ID/version plus user customizations (003).

Non-authoritative data includes derived calculations, widget render models, search indexes, transient tab selection, zoom, open dialogs and preview caches. Layout customizations may be persisted as explicit user-owned template/character settings, but must never overwrite character values. Changing a sheet skin or template does not modify a character's rules context, selections or derived computation semantics.

## 4. Sheet document and widget schema

A versioned `SheetTemplate` declares:
- Stable `templateId`, `schemaVersion`, `templateVersion`, title, supported system/edition and optional pack capabilities.
- Pages/tabs, sections, layout regions, breakpoints, widget IDs, ordering, visibility predicates and display labels.
- Binding references to canonical field IDs/paths, derived keys, resources, selections, inventory, feature/action lists, or explicit manual content.
- Widget types and validated configuration; accessibility metadata, display formats and optional theme tokens.
- Optional print-profile references and provenance/creator/license metadata.

Proposed initial widget vocabulary: text, rich text, number, checkbox, toggle, counter/resource tracker, stat card, calculated field, choice summary, inventory list, feature list, spell/power list, action/roll button, notes, image/portrait and section heading. Complex or game-specific widgets must be optional capabilities, not mandatory core assumptions.

Templates are declarative data. **No arbitrary JavaScript, CSS injection, HTML scripts or executable formulas inside templates.** Formula references resolve only through validated S05 rules expressions. Reject unbounded nesting, cycles in visibility/binding dependencies, unsupported widgets and unsafe asset paths.

## 5. Binding resolution (C09)

Given a frozen C01 record, resolved rules context (if available), a validated template and an optional explicit session context, C09:
1. Validates template/schema and edition compatibility.
2. Resolves bindings by stable ID, not label or visual position.
3. Queries S05 for computed values and traces when available; otherwise uses authored/manual values.
4. Applies display formatting without changing authoritative numeric or typed values.
5. Emits typed `SheetViewModel` containing tabs, ordered widgets, effective values, computed/base/override distinctions, editability, provenance, warnings and unresolved binding diagnostics.
6. Returns a deterministic view model for equivalent inputs, independent of widget layout order.

Missing packs, references or attachments yield explicit placeholders and diagnostics, not invented values or silent field deletion. Template compatibility must not cause an edition conversion.

## 6. Editing and live interaction

Editable widgets dispatch typed **intents** (e.g. `setAuthoredField`, `setResourceCurrent`, `toggleCondition`, `equipItem`, `setManualOverride`, `updateNotes`) to application use cases. C09 never directly mutates or saves records.

The application layer validates intents against C01 structure and C03/C07 rules, checks expected revision, produces a preview when required, and commits through the injected repository port. After commit, C09 rebuilds affected bindings; the UI updates from committed state.

- Keep focused text edits in temporary UI state until checkpoint; show pending/failed save status.
- Provide explicit Save and recovery; autosave must use conflict-aware revision checks, not overwrite newer changes.
- For resource consumption, condition changes, and equipment effects, use C07/C06 proposed transitions.
- Editing a computed field creates an explicit override or navigates to the source selection; it must not silently rewrite an S05 formula.
- Reorder or rename widgets without changing bound character field IDs.

## 7. Sheet MVP (V1)

First functional sheet milestone (after C01 and S04/S05/S06/C02/C03 foundations) includes:
- System-Neutral blank/manual sheet with name, portrait reference, editable custom fields and notes.
- User-created sections, basic field types, stable IDs and a responsive tab/section layout.
- Resource counters and manual feature/action notes where structurally supported.
- Local save/reopen, draft recovery and explicit unsaved/conflict feedback.
- Optional read-only derived stats when a compatible rules pack exists.
- One clean built-in template and an ink-friendly print-profile handoff, **not** a second PDF renderer.

No D&D-specific six-attribute requirement. Guided-created characters later open in the **same** M02 sheet.

## 8. Advanced Sheet Designer (later milestone)

A dedicated designer supports:
- Create/duplicate/rename templates, pages/tabs and sections.
- Drag/reorder and resize widgets on a constrained grid, with keyboard-accessible alternatives.
- Bind existing fields, add new namespaced custom fields, configure labels/formatting/visibility and widget variants.
- Preview with a sample character and switch between desktop, compact and print breakpoints.
- Validate bindings and show missing-source warnings before publishing/activating.
- Save reusable template files independently of character data, with version history and migration previews.
- Import/export user templates through approved adapters, preserving attribution and safe resource paths.

Designer changes are staged and previewed. Activating a new template version must not destroy removed/renamed widget data; bindings retain stable IDs, and incompatible migrations require explicit confirmation. Undo within an uncommitted design session is distinct from reverting a published template version.

## 9. Layout, themes and accessibility

Separate three layers:
1. **Binding:** typed data and edit intents (C09).
2. **Layout:** tabs, sections, responsive regions and widget geometry.
3. **Skin:** visual tokens for fonts, borders, surfaces, accent colors and decorative treatments.

Built-in skin targets: Catalyst dark (charcoal/gunmetal with silver/gold accents), clean neutral, and ink-friendly. Optional decorative fantasy styles must not affect content or calculations. Theme tokens are allowlisted and versioned; no arbitrary template CSS execution.

Support keyboard-only navigation, visible focus, accessible widget names/errors, appropriate contrast, scalable type, reduced-motion preferences and screen-reader announcements for changed resource values. Responsive layout must preserve editing access at narrower widths. Print output uses a dedicated print layout, not a screenshot of the dark UI.

## 10. Actions and dice contract

C08 supplies typed action definitions, modifiers and dice expressions; C09 exposes them as view-model actions. Clicking a roll button delegates to the **parent Catalyst S07 dice port** (or an injected compatible standalone host adapter) and returns the outcome to the UI. C09/M02 do not implement random rolling, dice parsing or a second dice engine. The sheet remains usable when the dice port is absent: show a disabled action with explanation or a non-rolling expression display.

Action availability may be constrained by C07 conditions or C03 validation. Do not assume all systems use D&D advantage/disadvantage or action economy.

## 11. Sourcebooks, assets and printing

C10 provides optional `View Source` links by document/edition/page locator; parent S12/S13 owns PDF reading, OCR, search and licensing. Missing sourcebooks must not block editing a valid character.

Portraits and decorative assets use host-managed asset references (S15) and safe path permissions. Avoid embedding arbitrary binary blobs in character JSON.

C11 defines character-specific blank/completed/decorative/ink-friendly print profiles and a typed layout handoff to S14. M02 may offer Print/Preview, but **does not render its own PDF engine**. Print values must come from the same canonical record and evaluated view model as the interactive sheet; document and rules provenance remain available where appropriate.

## 12. Public interfaces (illustrative)

```ts
interface CharacterSheetEngine {
  validateTemplate(input: TemplateValidationRequest): TemplateDiagnostics;
  buildViewModel(input: SheetBindingRequest): SheetViewModel;
  previewTemplateChange(input: TemplateChangeRequest): TemplateChangePreview;
}

interface CharacterSheetApplication {
  applyEdit(input: SheetEditIntent & { expectedRevision: string }): Promise<EditCommitResult>;
  resolveRollAction(input: RollActionRequest): Promise<RollActionResult>;
  requestPrint(input: CharacterPrintRequest): Promise<PrintJobResult>;
}
```

Concrete DTOs, versioning and typed error unions must be defined before implementation. The pure sheet engine returns intents and view models; host application coordinates persistence, permissions, S07 and S14.

## 13. Failure and recovery behavior

- **Missing rules pack:** show authored fields and unresolved computed bindings; never erase data.
- **Missing template:** open safe built-in fallback with a warning; retain the pinned template reference for repair.
- **Unsupported template version:** preserve original and offer compatibility preview, never silently rewrite.
- **Stale save:** reject and show conflict/reload/reconcile choices; do not discard unsaved user input.
- **Invalid widget/binding:** isolate affected widget and report diagnostics rather than crashing the sheet.
- **Print adapter unavailable:** show an actionable unavailable status, not a false completed print.
- **No dice adapter:** preserve expression/action data without simulating rolls.
- **Offline:** all sheet editing and template design must work with network disconnected.

## 14. Acceptance tests

1. Manual System-Neutral character renders with no installed rules packs or D&D assumptions.
2. Guided and manual characters use the same C01 schema and C09 binding pipeline.
3. Rename/reorder widget preserves stable field IDs and stored values.
4. Changing skins/layouts does not change canonical character data or calculations.
5. Calculated values display base, modifier trace and manual override separately.
6. Missing pack or binding displays diagnostics and retains authored values.
7. Editing a computed field proposes an override rather than modifying a formula.
8. Stale revision edit fails without overwriting committed data.
9. Resource and equipment actions use C07/C06 validated transitions.
10. Template schema rejects unsafe scripts, unknown widgets, deep nesting and cyclic bindings.
11. Template migration preview preserves unbound/removed custom field data.
12. Keyboard-only navigation and editable widget labels meet accessibility checks.
13. Roll button calls injected S07 port once and does not evaluate dice locally.
14. Print uses S14 port and matches authoritative evaluated values.
15. Reopen sheet offline and restore last committed layout and character fields.
16. Run C09 unit tests without Svelte, Tauri, DOM, filesystem, dice engine or PDF dependencies.

## 15. Implementation gates

- C01-M1 must pass create/save/reopen, revision conflict, schema and migration tests.
- C09 MVP binding DTOs must be validated against System-Neutral fixture before M02 UI coding.
- S05 calculation traces and C07 resource transitions need typed adapters before interactive advanced widgets.
- Template JSON Schema, widget allowlist, stable binding syntax and migration semantics must be finalized before designer coding.
- Verify integration compatibility with parent Catalyst S07/S12/S13/S14 ports rather than duplicating them.
- Test real offline behavior and a Windows/Tauri build before claiming desktop readiness.

**Architectural rule:** Character data is authoritative; sheets are reusable, customizable presentations of that data, not competing records.
