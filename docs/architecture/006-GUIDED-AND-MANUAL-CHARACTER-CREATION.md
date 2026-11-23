# 006 — Guided and Manual Character Creation Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 016 Character Engine Build Plan & Ownership; 003 Character Data Model; 004 Rules Packs; 005 Calculation and Validation  
**Owned components:** M01 Guided Character Builder, C01 Character Record/Draft/Migration, C02 Option Catalog, C03 Build Legality & Completeness; integrations with S04/S05/S06 and C09/M02.

## 1. Purpose

Deliver two first-class creation experiences: a rules-driven guided builder and a flexible manual editor. Both produce the **same versioned canonical character record** defined by C01/003. Creation mode is provenance, not a separate schema or permanent restriction. A character may later move between guided, manual, and hybrid editing without losing authored fields, selections, IDs, or history.

The experience benchmark is a polished, approachable guided flow comparable in capability to modern online character builders, but without copying proprietary branding, artwork, content or interface assets. The application must remain functional offline.

## 2. Release sequencing

This document describes the target UX, **not permission to skip the implementation order** in approved 016:
1. C01: System-Neutral canonical record, draft/recovery, migration and save/reload tests.
2. S04/S05/S06 foundations plus C02/C03: pack-aware choices, safe calculations, legality/completeness.
3. C09/M02 manual interactive sheet MVP.
4. M01 guided creator, initially using licensed/verified 2024 SRD options; additional editions and systems follow pack availability.
5. C04–C08/M03 gameplay and advancement; C10–C12 polish and integration.

Do not claim a functional guided builder until the dependent engines and end-to-end tests pass.

## 3. Starting a character

A **New Character** entry point offers:
- **Guided Creation** — choose a system/edition and eligible installed pack set, then follow a rules-pack-declared workflow.
- **Manual Creation** — create a blank System-Neutral record immediately, or select a system/edition as optional context.
- **Resume Draft** — reopen an unfinished draft at its last checkpoint.
- **Import Character** — later supplied by C11, not a separate canonical data model.

For new D&D characters, the previously approved application setting defaults to **D&D 5e (2014)**, with **D&D 5.5e (2024 Edition)** selectable. The 016 initial implementation-content target is System-Neutral plus properly licensed SRD 5.2.1 (2024); if a distributable 2014 rules pack is unavailable, the UI must visibly distinguish the edition setting from actual installed guided-content availability. It must never silently substitute 2024 mechanics for 2014.

A character's chosen edition and exact rules pack versions/digests are pinned in its record. Changing the default edition does not modify existing characters.

## 4. Guided workflow graph

M01 consumes a **versioned declarative workflow graph** from the active rules context, not a hardcoded list of D&D screens. Nodes define:
- Stable step ID, title/localization key, category and presentation hint.
- Required and optional inputs/choice groups with references to C02/S06.
- Entry conditions, dependencies, eligibility and completion criteria.
- Branches and repeatable groups where the rules pack explicitly permits them.
- Review/confirmation gates and step-level validation scope.

A workflow can express identity, species/ancestry, class, background, ability allocation, skills, feats, equipment, spells and final review for a D&D profile. Another RPG system may use different steps or omit levels/classes entirely. Workflow definitions are bounded, acyclic or explicitly bounded for repeats; invalid graphs fail pack validation.

**Navigation:** users can move backward without losing selections, skip optional steps, and visit any unlocked step. A locked step explains which dependency must be satisfied. Returning to an earlier choice triggers an impact preview for downstream dependent choices; never silently erase them.

## 5. Draft lifecycle and persistence

C01 owns canonical draft structure and revision semantics. M01 owns only the interpretation of workflow state.

Draft statuses: `in-progress`, `needs-review`, `ready-to-finalize`, `finalized`, `abandoned` (with explicit retention policy). A draft contains stable draft ID, intended character ID, exact rules context, workflow version, current step, completed/pending step IDs, selections, authored values, revision, and diagnostics snapshot metadata.

- Create a draft before substantial user input; assign durable IDs using injected ID/time providers.
- Save checkpoints after confirmed selections and navigation; debounce text editing in the UI but preserve explicit Save/Save Draft.
- The application invokes a host-provided persistence port with optimistic revision checking and atomic writes; M01 never writes files itself.
- On unexpected termination, resume from the last committed checkpoint and disclose unsaved edits when detectable.
- A stale concurrent edit yields a conflict/reconciliation UI, never a blind overwrite.
- If a pinned pack or workflow version is missing, preserve draft data and offer read-only review, repair or an explicit migration preview.
- Abandon/delete drafts only through explicit user action and recovery policy; finalization must not accidentally duplicate a character.

Drafts may be incomplete or rules-invalid during creation. Finalization requires structural integrity and the rules-profile completion policy. The saved character ID remains stable across finalization and later edits.

## 6. Option discovery and selection (C02)

C02 indexes *structured, licensed and activated* pack content by system, edition, pack version/digest, category, source and declared compatibility. It supports:
- Browse, keyword search, filters, sorting and category grouping.
- Option cards with title, short description, prerequisites, grants, edition, source attribution and eligibility state.
- A detailed inspection panel with explicit rule effects, sourcebook citation link (C10/S12/S13), and restrictions.
- Filters such as eligible only, installed sources, selected sourcebooks and homebrew when enabled.
- Stable option IDs independent of localized display names.

Sourcebook PDF imports are **not automatically executable options**. C02 does not scrape PDF pages or treat OCR output as trusted rules. Missing or unlicensed content must be clearly identified rather than silently substituted.

## 7. Prerequisites, legality and completeness (S06/C03)

Separate three concepts:
- **Eligibility:** can the current draft select an option under the pinned rules context?
- **Legality:** does the resulting character satisfy the edition's mechanical constraints?
- **Completeness:** has the player supplied all required choices for the selected workflow/finalization gate?

C03 produces structured diagnostics with severity, stable target path, rule/source reference, reason and suggested repair. The guided UI groups outstanding requirements into an **Incomplete Choices** panel and shows the next actionable step. Warnings and optional decisions must not masquerade as blocking errors.

Changing a parent selection must run dependency invalidation analysis:
1. Calculate potentially affected selections and derived values.
2. Preview retained, invalidated and newly available options.
3. Request confirmation before destructive changes.
4. Preserve discarded authored input in recoverable history when supported by C12.
5. Revalidate and recalculate from the new immutable draft snapshot.

No hidden auto-selection of feats, spells, equipment or proficiencies unless a pack explicitly defines an automatic grant. A default suggested choice is not a committed selection.

## 8. Calculations and live previews (S05)

After a draft edit, request a pure deterministic evaluation using the pinned rules context. Show:
- Current effective stats and resources.
- Difference from the prior confirmed checkpoint.
- Source-aware breakdown of bonuses, caps, substitutions and manual overrides.
- Unresolved values and errors without manufacturing defaults.

Calculation engine inputs/outputs remain independent of Svelte, Tauri and local file adapters. No random rolls are performed by the builder; later action bindings use parent Catalyst S07 dice contract.

## 9. Manual and hybrid creation

Manual creation is available without any installed rules packs or internet access. It provides:
- Identity, portrait reference, notes and arbitrary namespaced typed fields.
- Add/remove/reorder custom sections and fields with stable IDs.
- Optional selection of system/edition and sheet template without requiring a complete rules workflow.
- User-authored resources, features, actions, equipment and freeform notes.
- Optional calculated fields and overrides if compatible rules packs are present.

Manual edits can be structurally valid but mechanically incomplete; report advisory legality findings without deleting values. Switching a character into hybrid assistance preserves authored values and explicitly distinguishes computed from overridden results. Switching back to manual mode does not erase pack references or prior choices.

The interactive sheet and designer are owned by M02/C09; M01 must reuse their field binding/view-model contracts instead of creating a second sheet renderer.

## 10. Review and finalization

The final review shows identity, rules context, selected options, derived stats, unresolved choices, custom fields, source attribution and blocking/warning diagnostics. It must allow jumping directly to the relevant step.

Finalization is an explicit application use case:
1. Validate current draft revision and exact pinned pack context.
2. Re-run C03 structural/completeness/legality checks and S05 calculation.
3. Refuse finalization on blocking errors with actionable diagnostics.
4. Create or commit the canonical C01 character record using optimistic revision and host storage adapter.
5. Record provenance and initial history entry through C12/event contract where available.
6. Mark draft finalized only after character commit succeeds; retry must be idempotent for the intended character ID.
7. Open the M02 character sheet using the same record, not a separate builder export.

For manual creation, completion of a guided workflow is not required; only structural integrity is mandatory.

## 11. UI organization and accessibility

Target desktop UX:
- Persistent left step rail or compact progress navigator; center choice/editor workspace; right live character summary (responsive collapsible).
- Distinct `Not Started`, `In Progress`, `Complete`, `Needs Attention` states; no progress percentage that assumes every workflow has equal-length steps.
- Searchable option cards, keyboard navigation, visible focus, screen-reader labels, clear validation text, adequate contrast, scalable typography.
- Undo/revert for pending edits and clear confirmation for irreversible actions.
- No mandatory account, network, telemetry or cloud sync.

Catalyst charcoal/gunmetal, silver and amber/gold styling is presentation-layer only. Avoid importing Svelte stores into engine packages.

## 12. Engine and adapter boundaries

| Responsibility | Owner |
|---|---|
| Canonical record, draft, migration | C01 |
| Pack registry and compatibility | S04 reusable core |
| Formulas, modifiers and explanations | S05 reusable core |
| Choice/prerequisite primitives | S06 reusable core |
| Character option catalog and filters | C02 |
| Build-specific legality and completeness | C03 |
| Guided workflow state and presentation | M01 |
| Sheet bindings, interactive sheet, designer | C09/M02 |
| Advancement | C04/M03 |
| Dice outcomes | Parent Catalyst S07 — typed port only |
| PDF reading, citations and licenses | Parent Catalyst S12/S13 — typed ports only |
| Global file/project storage | Parent Catalyst S01–S03 — repository port and standalone adapter only |
| Printing | Parent Catalyst S14 — character templates/port only |

The parent Catalyst application imports the pure engine packages and injects its own persistence, permissions, dice, sourcebook and printing services. It must not import or launch the standalone Character Studio UI.

## 13. Acceptance tests

1. Create a System-Neutral manual character with no rules packs; save/reopen without losing custom fields.
2. Create guided and manual characters and verify both serialize to the same C01 schema.
3. Checkpoint a partially completed draft; close/reopen and resume at the same step with the same stable IDs.
4. Change an earlier choice and verify downstream invalidation preview before confirmation.
5. Show blocking incomplete choices separately from advisory warnings.
6. Resolve options from a 2024 pack without leaking incompatible 2014 content.
7. Change the application default edition and verify existing pinned characters/drafts are unchanged.
8. Disable/miss a pinned pack; draft remains accessible with diagnostics and no destructive edits.
9. Prevent duplicate character creation on a retried finalization.
10. Reject stale revision saves and preserve newer data.
11. Validate all workflow graphs, including cycles and unbounded repeats, before activation.
12. Verify calculations are deterministic and show source attribution; no dice execution occurs.
13. Verify keyboard-only guided navigation and readable error messages.
14. Verify no domain package imports Svelte, Tauri, DOM, global storage, PDF reader or dice engine implementations.
15. Run guided/manual end-to-end flows with network disabled and no cloud account.

## 14. Implementation gates and open decisions

- C01 schema and draft APIs must pass milestone C01-M1 before M01 implementation.
- S04/S05/S06 and C02/C03 require pinned, licensed fixtures with explicit edition compatibility.
- Define exact workflow graph JSON Schema, invalidation semantics, and idempotent finalization DTOs before coding M01.
- Establish a distributable starter-content inventory; do not claim that a complete 2014 guided pack is bundled until licensing and content checks pass.
- Set measurable autosave/recovery and accessibility test budgets during implementation.
- Resolve the 2014 default setting versus initial 2024 SRD implementation-content availability explicitly in product UX.

**Architectural rule:** The guided builder is a workflow over the canonical character record, not a competing character data model.
