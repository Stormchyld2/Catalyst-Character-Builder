# AGENTS.md — Catalyst Character Studio

> Instructions for Claude, Codex and other coding agents working in this repository. Read before planning, changing code, or creating pull requests. These instructions apply repository-wide. Detailed specifications are in `docs/architecture/001–016`; this file summarizes the approved decisions and execution rules. When a document conflicts with the newer approved Frost Blue palette below, this file and the approved parent Catalyst design tokens take precedence until that document is corrected.

**Coding style is mandatory:** follow [`CODING-GUARDRAILS.md`](CODING-GUARDRAILS.md) for every code change. Keep code compact and direct: edit existing files before adding new ones, no abstraction until it is used three times, no unrequested features or speculative config, small diffs. The architecture boundaries below are required; do not add layers beyond them.

## 1. Product, repository and current phase

- **Product:** Catalyst Character Studio — standalone offline-first Windows RPG character builder, interactive character sheet, advancement tool and NPC/creature composer.
- **Repository:** `Stormchyld2/Catalyst-Character-Builder`.
- **Parent:** `Stormchyld2/Catalyst`. This repository is the implementation/test owner of Character Studio engines and will integrate them into the parent through typed ports.
- **Stack:** Svelte 5 + TypeScript + Tauri 2 + Rust host. Keep core engines pure TypeScript and host-independent.
- **Current project status:** Architecture documents 001–016 are authored. Documentation completion does **not** mean features, builds, tests or integrations exist. Inspect the actual code and Git status before claiming implementation.
- **Authoritative build ownership:** `docs/architecture/016-CHARACTER-ENGINE-BUILD-PLAN.md`. **Implementation roadmap:** `docs/architecture/015-IMPLEMENTATION-ROADMAP-AND-DELIVERY-MILESTONES.md`. **First coding gate:** `docs/milestones/C01-M1-CHARACTER-RECORD-DRAFT-ROUNDTRIP.md`.

**Approved Portrait Studio & VTT Token Maker:** `docs/architecture/018-PORTRAIT-STUDIO-AND-VTT-TOKEN-MAKER.md` governs non-destructive imported/generated portrait editing, optional C13 AI generator, circle/square token composition, transparent PNG exports and character/map asset integration. **M22 belongs to Character Studio.** Start editor/token MVP without requiring an AI model.

## 2. Approved Catalyst design system — mandatory

**Frost Blue replaces amber/gold.** The parent Catalyst design system is authoritative; Character Studio must use the same palette, semantic tokens, typography and component language, not invent an independent application theme. The user supplied an approved palette image and reported uploading its copy to the repository's `images/` folder. Locate and inspect the actual image before changing UI styling; do not invent its filename. If the parent repo exposes shared tokens, reuse/align with those rather than copying unrelated styles.

| Token | Name | Hex | Intended use |
|---|---|---|---|
| `--color-obsidian` | Obsidian | `#111214` | Main application background |
| `--color-charcoal` | Charcoal | `#202328` | Navigation and base panels |
| `--color-gunmetal` | Gunmetal | `#2C3036` | Elevated panels, cards and controls |
| `--color-frost-blue` | Frost Blue | `#6EA9CF` | Primary actions, active selections and focus accents |
| `--color-metallic-silver` | Metallic Silver | `#BCC2CC` | Secondary visual details |
| `--color-text-primary` | Primary Text | `#F0F1F3` | Main text |
| `--color-text-muted` | Muted Text | `#A3A9B2` | Secondary text |
| `--color-border` | Borders | `#41464E` | Dividers and outlines |
| `--color-blue-hover` | Blue Hover | `#8CC0E1` | Interactive hover state |

These CSS names are proposed semantic aliases; adapt them to the parent Catalyst's actual token names once inspected, while preserving the **exact approved hex values**. Check WCAG contrast for actual text/button combinations; do not assume a color pair is accessible because it appears in the palette. Use non-color cues for state. Keep UI accessible by keyboard, screen reader, text zoom and reduced motion. WCAG 2.2 AA is the verification target.

**Do not use gold/amber as the Catalyst app accent** or reintroduce the old palette from historical docs. Decorative character-sheet skins may be independently themed by users; the app shell remains Catalyst Frost Blue. A character-sheet theme cannot change canonical rules or data.

## 3. Approved functional scope

- **M01 Guided Character Builder:** pack-defined steps, options, eligibility, dependency previews, draft/resume/review/finalize.
- **M02 Interactive Character Sheet & Designer:** manual and guided characters share the same canonical sheet model; editable fields, derived values, resources, tabs, versioned templates, customization and print profiles.
- **M03 Character Advancement:** level/track progression, multiclassing where rules define it, explicit proposals, validation, previews, confirmations and history.
- **M04 NPC & Creature Stat Block Composer:** simple NPC and expanded rules-driven creature/stat-block workflows.\n- **C13 Local Portrait Generator:** optional offline portrait generation from system/species/class/appearance, model downloaded only by explicit user action, complete inference pipeline capped at 2B parameters pending verified benchmark; never block character creation.
- **Sourcebooks:** users may reference lawfully obtained PDF and other digital books offline; sourcebook library/reader and citation infrastructure are shared parent services. Imported PDF text is **not automatically executable rules data**.
- **Guided and Manual creation are equally first-class** and produce the same C01 character schema. System-Neutral manual creation must work with no D&D pack installed.
- **Edition policy:** application default for new D&D characters is D&D 5e **2014**; D&D 5.5e **2024 Edition** is selectable. Initial planned distributable structured starter content is appropriately licensed **SRD 5.2.1 (2024)**, subject to license verification. Do not silently mix 2014/2024 rules, substitute a missing pack, or advertise unsupported guided content. Existing characters pin their own system/edition and pack versions/digests; changing default settings does not migrate them.

## 4. Engine ownership — no duplicate implementations

Character Studio **owns**:
- `C01` Character Record, Draft & Migration
- `C02` Character Option Catalog & Source Filter
- `C03` Build Legality & Completeness Validator
- `C04` Multiclass, Feature & Advancement Planner
- `C05` Spellbook & Power Management
- `C06` Equipment Effects & Loadout
- `C07` Character Resources, Recovery & Conditions
- `C08` Action & Roll Binding (bind to S07, never roll independently)
- `C09` Character Sheet Binding & Theme
- `C10` Character Sourcebook Linker
- `C11` Character Import/Export & Print Profiles
- `C12` Character History, Diff & Reconciliation\n- `C13` Local Character Portrait Generation — optional fully offline character/NPC portrait engine; complete pipeline ≤2B parameters; see `docs/architecture/017-LOCAL-CHARACTER-PORTRAIT-GENERATION-ENGINE.md`

Character Studio may incubate pure reusable **S04 Rules Pack Registry**, **S05 Declarative Formula & Modifier Engine**, **S06 Choice & Prerequisite Engine** for later parent consumption.

Parent Catalyst owns **S01–S03** project/document storage, identity and schema registry; **S07** dice; **S09/S10** events and permissions; **S12/S13** PDF/sourcebook/citations; **S14** printing; **S15/S22/S26** shared assets/inventory/import-export. Consume via typed ports/adapters; no duplicate global storage, PDF reader, dice evaluator, print renderer or event engine. Reference parent coordination document `Stormchyld2/Catalyst/docs/architecture/023-CATALYST-SHARED-AND-MODULE-ENGINES.md` when available.

## 5. Core engineering rules

1. Pure core has **no Svelte, Tauri, Rust, DOM, filesystem, network or UI-store imports**. UI → application use cases → domain/ports; host adapters are injected at composition.
2. User-owned, local, portable **versioned character JSON** is the initial authoritative representation per Architecture 010. Markdown/YAML are supported through explicit import/export profiles, not concurrent writable authorities. No mandatory SQLite/cloud/accounts/telemetry/network.
3. C01 owns stable opaque IDs, revision-aware optimistic concurrency, draft checkpoints, unknown-field preservation, schema migration previews and recoverable writes. Never silently discard authored fields, overrides or history.
4. Distinguish long-lived character definition, current session state and derived views. Calculated values and indexes are **non-authoritative** and rebuildable.
5. Rules and formula packs are data-only, validated and versioned; no arbitrary script execution. Deterministic calculations expose provenance/traces, cycles and invalid prerequisites.
6. Changes with consequences (choice invalidation, edition conversion, advancement, resources, migration, imports) follow **propose → validate → preview → confirm → commit** where applicable. Commits check expected revision and use operation IDs for idempotency.
7. Missing rules packs, disconnected removable storage, invalid schema and conflicts must produce actionable diagnostics without erasing files or pretending a save succeeded.
8. C09 sheets use typed bindings and commands, never direct file edits. C08 uses injected S07 dice service. C10 uses S12/S13 sourcebooks. C11 uses S14 print and S26 transport adapters.
9. Respect GM/player visibility and permissions through host S09/S10. Do not export private or copyrighted sourcebook content by default.
10. Offline core must work with networking blocked. All UI assets needed for core operation are bundled locally.

## 6. Required implementation order and gates

Follow 015 and 016; no broad rewrite or parallel feature sprawl:
1. **M0:** audit actual repository, toolchain, workspace, pure-package boundary, tests and CI.
2. **M1 / C01:** validated System-Neutral character record + draft + local save/reopen, stable IDs, unknown fields, migration and conflict/recovery tests.
3. **M2:** S04/S05/S06 contracts and C02/C03 option/legality engines, with edition-aware deterministic fixtures.
4. **M3:** C09/M02 manual interactive sheet MVP, editable fields, autosave, recovery, simple print handoff.
5. **M4:** M01 guided creator with pack-declared steps, resumable drafts, idempotent finalization.
6. **M5:** C04–C08/M03 gameplay and advancement, source-aware calculations, shared dice binding.
7. **M6:** C10–C12/M04 source links, import/export, printing, designer and NPC/creature composer.
8. **M7:** parent Catalyst integration through typed ports, Windows release validation and licensing audit.

Every stage requires a demonstrably working offline artifact and tests before declaring the gate complete.

## 7. Testing and definition of done

- Check formatting, lint, TypeScript typecheck, pure-engine unit tests, malformed-input/security tests, adapter contract tests, Windows/Tauri build and offline smoke tests appropriate to the milestone.
- Test concurrent saves, stale revisions, interrupted writes, disconnected/read-only drives, missing packs, unsupported future schemas, migration/restore, idempotent finalization, edition isolation and unknown fields.
- Test sheet values against one coherent character revision/rules snapshot; no silent truncation in print.
- Keyboard-only and manual accessibility checks accompany UI milestones.
- Verify license/attribution before copying donor code, assets, rules or templates. Never bundle proprietary D&D book text or artwork without rights.
- Report **what actually changed**, commit SHA, commands executed, pass/fail evidence, limitations and remaining gates. Never claim that architecture, UI mockups, stubs or unrun tests are finished product features.

## 8. Working practices for agents

- Read `AGENTS.md`, `docs/architecture/016-CHARACTER-ENGINE-BUILD-PLAN.md`, `docs/architecture/015-IMPLEMENTATION-ROADMAP-AND-DELIVERY-MILESTONES.md`, the relevant numbered architecture document and the relevant milestone before editing.
- Inspect actual code and Git status; distinguish implemented functionality from plans. Preserve unrelated user changes.
- Work in small, reviewable vertical slices; keep public contracts typed and versioned. Add tests and update docs with behavior changes.
- Do not silently modify the parent repository when tasked with Character Studio; coordinate changes and state which repo was edited.
- When asked to analyze progress, inspect **actual source code and tests**, not just roadmaps.
- Do not assume that a referenced image or file exists at a guessed path; locate it before depending on it.
- Treat the approved palette in §2 as the current visual authority. Update historical gold references in architecture/docs when touching related files, and keep parent/standalone tokens consistent.

**Operating principle:** One authoritative character record; one implementation of each owned engine; one shared Catalyst design language; fully offline, safe and testable.

## Approved engine-first execution override (2026-11-23)

Owner-approved controlling sequence: M0 toolchain and ownership audit; shared engines (reuse verified parent implementations, otherwise implement portable libraries with explicit ownership); all character-specific engines C01–C13 and M01–M04/M22 domain services, including drafts, inventory, spells, notes, journal, roster, conversion and export; engine validation gate; only then production UI for all 17 approved workspaces; parent integration and release. Earlier milestones requiring production UI before engine completion are superseded; retain their functional acceptance tests using headless harnesses until UI phase. Optional AI model availability must not block non-AI portrait/token functionality. No duplicate shared engines, no fabricated test results. Preserve official branding per design section 27. Owner authorizes routine implementation and documentation updates without per-milestone approval. Record actual evidence and blockers; do not mark untested work complete.
