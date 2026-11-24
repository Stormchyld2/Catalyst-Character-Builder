# 016 — Catalyst Character Studio: Character Engine Build Plan & Ownership

**Date:** 2026-11-23  
**Status:** Approved implementation scope, not proof of completed code  
**Repository:** `Stormchyld2/Catalyst-Character-Builder`  
**Product:** Catalyst Character Studio  
**Source of coordination:** `Stormchyld2/Catalyst/docs/architecture/023-CATALYST-SHARED-AND-MODULE-ENGINES.md`

## 1. Ownership and product goals

This standalone repository is the **implementation and test owner** of Character Builder, Character Sheet, advancement UX and all **C01–C13 supporting character engines** listed below. The same implementation is later integrated into the parent Catalyst program via adapters and contracts. Claude working in the parent Catalyst repo should **not independently rebuild** these engines.

Use Catalyst branding: Obsidian/charcoal/gunmetal, metallic silver and Frost Blue (#6EA9CF), with exact palette values defined in repository AGENTS.md; Svelte 5 + TypeScript + Tauri 2 + Rust; Windows offline-first; ordinary user-owned Markdown/YAML/JSON project files authoritative, never a mandatory SQLite/cloud backend.

Feature benchmark: guided creation, calculations and interactive digital sheets as close to **D&D Beyond functionality** as practical without using its proprietary branding, interface artwork or non-licensed content. Both **Guided Builder** and **Manual Character Creation** are first-class, producing exactly the same canonical character record. Rule-pack support must remain system-independent; initial System-Neutral + appropriately licensed SRD 5.2.1 D&D 2024 edition.

## 2. Primary Character Studio engines

| Engine | Feature | Release target |
|---|---|---|
| M01 — Guided Character Builder | Rules-driven step navigation, selection cards, eligibility, progress, review, draft/recovery | V1 |
| M02 — Interactive Character Sheet & Designer | Digital sheet rendering, tab/section widgets, custom editable fields, skins, sheet template editor | Sheet MVP V1, advanced designer subsequent milestone |
| M03 — Character Advancement | Level-up/advance, dependencies, impact previews, approval and change history | V1 |
| M04 — NPC & Creature Stat Block Composer | Quick NPC profile or full combat/stat block, templates and GM-ready presentation | Basic V1, expanded later |

**Additional approved module:** **M22 Portrait Studio & VTT Token Maker**, owned by this standalone repository. See [018 Portrait Studio & VTT Token Maker](018-PORTRAIT-STUDIO-AND-VTT-TOKEN-MAKER.md). It is separate from optional C13 AI portrait generation and relies on parent S15 asset/image infrastructure. Prioritize the editor and non-AI token maker before C13 model integration.

## 3. Required character-specific supporting engines

| ID | Engine | Core responsibilities |
|---|---|---|
| **C01** | Character Record, Draft & Migration | Typed canonical records, stable IDs, schema versions, safe saves, wizard drafts, unknown-field roundtrips, migration previews |
| **C02** | Character Option Catalog & Source Filter | Rules-pack, edition and licensed-source-aware species/class/subclass/background/feat/spell/equipment catalogs; browse/search/filter |
| **C03** | Build Legality & Completeness Validator | Prerequisite checks, selection counts, mutually exclusive choices, pending decisions, clear error explanations |
| **C04** | Multiclass, Feature & Advancement Planner | Level and subclass progression, feature grants, feats/ability improvements, multiclass requirements and before/after diffs |
| **C05** | Spellbook & Power Management | Known/prepared spells, available spells, spell lists, slots, casting resources, conditions like concentration when pack defines them |
| **C06** | Equipment Effects & Loadout | Inventory, worn/equipped/attuned state, weapons/armor/defenses, carrying limits, equip-dependent modifiers |
| **C07** | Character Resources, Recovery & Conditions | HP/temporary HP, rests, exhaustion/other conditions, death saves and non-D&D resource models driven by pack |
| **C08** | Action & Roll Binding | Build roll actions/expressions for checks, saves, attacks, damage or abilities using the **parent shared dice engine contract**; do not implement separate dice evaluation |
| **C09** | Character Sheet Binding & Theme | Render fields and derived stats into customizable widgets, tabs, responsive design, decorative/clean/ink-friendly skins |
| **C10** | Character Sourcebook Linker | Edition, sourcebook and page references for character options using the **parent shared Sourcebook Library PDF/citation API** |
| **C11** | Character Import/Export & Print Profiles | Native Markdown/YAML/JSON roundtrips, character import mapping, blank/completed/decorative PDF sheet profiles using shared print interfaces |
| **C12** | Character History, Diff & Reconciliation | Auditable changes, advancement history, undo/recovery where valid, rule-pack upgrades, conflicting manual overrides and template migrations |\n| **C13** | Local Character Portrait Generation | Optional offline image generation, complete pipeline ≤2B parameters, character-aware prompts, model validation, inference adapters, portrait preview/asset attachment; see Architecture 017 |

These engines are not substitutes for the parent application's global project/document storage, search, PDF reader, dice evaluation, print engine, or event/permission APIs.

## 4. Shared foundational engine interfaces consumed or developed as pure reusable libraries

The following *contracts* must be compatible with parent Catalyst:

- **S01/S02/S03:** file-authoritative project documents, stable identity/links, schema and template registry. Standalone can use an adapter; integration uses existing parent services.
- **S04 — Rules Pack Registry:** versioned/validated mechanics packs, edition/source references. Character Studio may incubate the pure implementation, reusable by encounters and GM modules.
- **S05 — Declarative Formula & Modifier Engine:** safe AST/DSL, derived dependency graph, source-aware stat breakdowns, cycle protection. Character Studio may incubate the pure implementation.
- **S06 — Choice & Prerequisite Engine:** eligibility, invalidation, progression options. Character Studio may incubate pure implementation.
- **S07 — Dice Notation & Outcome Engine:** **owned by global Catalyst dice workstream**. Character Studio consumes a typed port only, with optional local test stub; do not duplicate random roller/parser.
- **S09/S10:** event history and visibility/permission contracts; character adapter must respect GM/player boundaries.
- **S12/S13:** PDF/sourcebook and citation/licensing engines remain shared; C10 consumes them.
- **S14:** shared print/layout renderer; C11 provides character-specific page templates.
- **S15/S22/S26:** assets, inventory shared contracts and import/export adapters.

**Engine code must be pure and transport-agnostic where possible**, without Svelte, Tauri IPC, browser DOM or proprietary storage dependencies. Keep Svelte 5 UI components in separate presentation layers.

## 5. Build order and test gates

1. **Schema first (C01):** stable IDs, canonical character record, System-Neutral values, local save/reload, unknown-field preservation, migration checks.
2. **Option/validation core (C02, C03 + S04/S05/S06 contracts):** edition-aware choices and rule evaluation with deterministic test fixtures; no arbitrary script execution from rules packs.
3. **Manual sheet MVP (C09 + M02 subset):** blank system-neutral sheet, editable fields and panels, autosave/recovery, optional rules assistance, basic printable output.
4. **Guided creator (M01):** all rules-driven steps, prerequisite/choice previews, incomplete-choice dashboard, review/create in the **same** character schema; verify licensed 2024 SRD pack.
5. **Gameplay/advancement (C04–C08 + M03):** spells, equipment, resources, rests, conditions, action binding to shared dice; advancement with history.
6. **Sheets/content polish (C10–C12 + M04):** sourcebook page linking, print variants, import/export, sheet designer, NPC/creature views and migration workflows.

Each stage must create a demonstrably working offline artifact before starting the next; no broad rewrites, no claimed success without build and tests.

## 6. Source code donor evaluation

Do not copy donor applications wholesale. Prioritize independently licensed code from:
- `https://github.com/caioldcarvalho/dnd-character-tracker` (rpgman): Rust + Tauri 2 + Svelte, stat calculation explanations; MIT.
- `https://github.com/papsop/dnd-character` (Character Forge): guided 2024 creation/legality and printing; MIT code, SRD data under CC BY.
- `https://github.com/Richie735/obsidian-sheetsmith` (Sheetsmith): manual/custom sheet concept and pure TypeScript; MIT, Obsidian plugin APIs need isolation.
- `https://github.com/TeamBorealis/borealis` (Borealis): fuller guided mechanic reference; verify licenses and dependencies.
- `https://github.com/arrowedisgaming/OpenPentacle` (OpenPentacle): Svelte 5 UX reference **only** absent explicit GPL adoption.
- `https://github.com/TaylorMouse/dnd_character_creator`: vanilla JS guided flow reference; its separately supplied proprietary book data and PDF template must **not** be copied.

For copied functions/assets, pin source commit SHA, audit dependencies and asset/content licenses, retain notices and add attribution. Confirm exact licenses at the chosen source revision before importing. Use only lawful SRD content for bundled packs.

## 7. Standalone-to-Catalyst integration contract

Provide a documented public API for:
- `createCharacter({rulesPackId, creationMode, campaignId?})`
- `updateCharacter(id, patch, version)`
- `getCharacter(id)`, `validateCharacter(id)`, `calculateCharacter(id)`
- `listAvailableChoices(context)`, `applyChoice(draft, choice)`
- `advanceCharacter(id, choices)`
- `getSheetViewModel(id, templateId)`, `exportCharacter(id, format)`
- `bindRollAction(id, actionId)`, `getCharacterSourceCitations(id)`

Those are illustrative names; finalize DTOs and typed errors in actual contracts. Parent Catalyst injects persistence, dice, sourcebook, printing and permission adapters. No import of the standalone application itself is required.

## 8. Acceptance criteria

- Guided and manual methods create same canonical schema and preserve IDs across save/reopen/rename.
- System-Neutral never assumes D&D levels, classes, or six attributes.
- 5e 2024 packs are edition-correct, legally bundled, complete enough for supported creation options, and do not silently mix incompatible source data.
- Derived stats have transparent source breakdown; cycles/invalid math caught.
- Character sheet reflects equipment, progression, conditions, resource use and choice changes; invalidation and undo are controlled.
- Every engine has typed API, deterministic tests, malformed-input tests and offline runtime validation.
- Print outputs match authoritative values; character imports and exports preserve custom fields.
- No copied GPL code without deliberate permission/licensing decision; no protected official book text redistributed.
- The shared global dice engine remains the only authoritative dice evaluator.

**Coordination:** Parent Catalyst architecture 023 has been updated to assign M01–M04 and C01–C13 here. Claude's parent-app engine sessions should focus on unowned shared engines, adapters and contracts, not duplicate these implementations.

## Approved engine-first execution override (2026-11-23)

Owner-approved controlling sequence: M0 toolchain and ownership audit; shared engines (reuse verified parent implementations, otherwise implement portable libraries with explicit ownership); all character-specific engines C01–C13 and M01–M04/M22 domain services, including drafts, inventory, spells, notes, journal, roster, conversion and export; engine validation gate; only then production UI for all 17 approved workspaces; parent integration and release. Earlier milestones requiring production UI before engine completion are superseded; retain their functional acceptance tests using headless harnesses until UI phase. Optional AI model availability must not block non-AI portrait/token functionality. No duplicate shared engines, no fabricated test results. Preserve official branding per design section 27. Owner authorizes routine implementation and documentation updates without per-milestone approval. Record actual evidence and blockers; do not mark untested work complete.

## Approved four-family V1 scope (2026-11-24)

Apply the profile requirements and acceptance gates in [019](019-MULTI-SYSTEM-V1-RULESET-PROFILES.md) to existing C01–C13 and S04–S06 contracts. C08 consumes S07 for d20 and percentile outcomes. Do not create per-system engines. Extend contracts only for demonstrated gaps in actual fixtures. Initial 2024 SRD content is the first slice, not the full V1 target.
