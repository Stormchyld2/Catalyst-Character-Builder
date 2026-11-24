# 015 — Implementation Roadmap & Delivery Milestones

**Status:** Proposed execution plan — subject to owner review  
**Authority:** 016 approved Character Engine Build Plan & Ownership  
**Scope:** Dependency-ordered coding milestones, deliverables, acceptance gates, coordination and definition of done.

## 1. Execution policy

Architecture 016 controls ownership and sequence. This roadmap translates that approved order into reviewable vertical slices. Do not start broad UI scaffolding or advanced features before core data roundtrip works. Each milestone delivers tested offline behavior, not just source files or documentation.

## 2. Milestone sequence

### M0 — Workspace and contract baseline

Verify Svelte 5/TypeScript/Tauri 2/Rust Windows toolchain and locked dependencies. Establish pure domain package boundary, repository-port DTOs, lint/typecheck/unit test commands, Windows CI and synthetic fixtures. Record current code inventory before claiming existing implementation.

**Exit:** clean build/test baseline and one pure package importable without app runtime.

### M1 — C01 record, drafts and persistence

Follow `docs/milestones/C01-M1-CHARACTER-RECORD-DRAFT-ROUNDTRIP.md` and Architecture 010. Implement schema validation, stable IDs, unknown-field preservation, manual System-Neutral record, drafts, revision-aware repository, atomic/recoverable save and migration previews.

**Exit:** create → save → close → reopen → edit → save, with crash/conflict tests and real offline Windows evidence.

### M2 — S04/S05/S06 + C02/C03

Build validated pinned rules registry, declarative formula/choice primitives, source-aware option catalog and structured legality/completeness diagnostics. First System-Neutral fixtures, then appropriately licensed SRD 5.2.1 (2024). Keep 2014 default preference distinct from installed guided-content availability.

**Exit:** deterministic calculations, option eligibility, invalidation previews, edition isolation and malicious pack rejection tests.

### M3 — C09/M02 manual interactive sheet MVP

Deliver a working character library and System-Neutral sheet with editable fields, sections, notes, basic resources, autosave/conflict UI and one clean template. Integrate C09 pure binding engine and print handoff stub.

**Exit:** Windows user can edit and reopen a character entirely offline, with no mandatory D&D fields.

### M4 — M01 guided creation

Implement pack-declared step graph, options, prerequisites, draft checkpoints, backtracking, live preview, incomplete choices, review/finalize and handoff to same C01/M02 sheet. Confirm licensed 2024 starter content before advertising supported guided options.

**Exit:** complete guided creation and interrupted-draft recovery, including idempotent finalization and choice-change preview.

### M5 — C04–C08/M03 gameplay and advancement

Add level/track progression, multiclassing, spells/powers, equipment effects, resources/recovery/conditions and action binding to injected S07 dice port. Record C12-compatible history and explicit previews for consequential transitions.

**Exit:** advancement proposal → validate → preview → commit → sheet refresh, with recovery and no duplicated grants.

### M6 — C10–C12/M04 content, printing and designer polish

Implement sourcebook page linking via S12/S13, native import/export and character print profiles via S14/S26, advanced sheet designer, history reconciliation and basic NPC/creature stat block composer. Avoid creating a second global sourcebook, PDF, printing or inventory service.

**Exit:** native export/import roundtrip, printed sheet parity, source citations, designer template migration and basic NPC view all verified offline.

### M7 — Parent Catalyst integration and release candidate

Package versioned pure engines and typed ports; build separate parent consumer fixture, integrate host permissions/events/storage, perform Windows release validation and documentation. Ensure parent repo does not independently implement M01–M04/C01–C12.

**Exit:** external consumer passes contract tests, release checklist is signed off, artifact and migration/backup paths tested.

## 3. Cross-cutting delivery rules

- Every milestone includes TypeScript types, tests, negative cases, README/API documentation, sample fixture and runnable Windows verification steps.
- No silent edition conversion, loss of unknown fields, or implicit migration.
- User files remain authoritative; derived caches are disposable.
- No mandatory SQLite, cloud or network access.
- No proprietary D&D book text or assets without valid rights.
- No duplicated global Catalyst S07/S12/S13/S14/S01–S03 engines.
- Keep scope focused; avoid large simultaneous rewrites.

## 4. Backlog priority

**Must ship in initial functional baseline:** C01 roundtrip, stable revisions, System-Neutral manual sheet, rules-neutral field binding, local recovery, clear error states.

**Needed for full V1:** S04/S05/S06, C02/C03, M01 guided builder, C04–C08/M03 gameplay/advancement, licensed starter pack, basic print/export and basic NPC.

**Later polish:** sophisticated sheet designer, decorative print skins, broad third-party imports, advanced sourcebook extraction, additional RPG packs and optional integration enhancements.

Where these priority bands overlap the numbered gates, **the gate order wins**. Do not claim V1 complete while any mandatory gate is missing.

## 5. Milestone evidence template

For each milestone record: scope, changed paths, commit SHA, fixture list, commands run, pass/fail counts, manual Windows smoke observations, known limitations, license/attribution status, recovery behavior and next dependency. A document-only commit is marked planning complete, not code complete.

## 6. Risk register

| Risk | Mitigation |
|---|---|
| Schema changes break old characters | C01 migrations, backup and unknown-field tests |
| Conflicting writes corrupt files | Revision checks, tested safe replacement and recovery |
| 2014 default mistaken for bundled 2014 pack | Explicit edition/content availability UI |
| Rules-pack content licensing | Inventory and attribution before bundling |
| Duplicate parent/standalone engines | 016 ownership and 012 contract tests |
| Sheet values diverge from rules | C09 view model from same C01/S05 snapshot |
| Advancement double-application | Operation IDs, immutable previews, C12 history |
| PDF/dice services fork | Typed S14/S07 ports, contract tests |
| Windows-only assumptions leak into core | Pure packages and external consumer tests |

## 7. Definition of done

A feature is done only when its public contract, deterministic tests, negative tests, offline user flow, persistence behavior, accessibility expectations and integration boundary are verified. A milestone is done only when its stated exit gate passes with evidence. The architecture set is a plan for implementation, not evidence that implementation has begun.

**Next action after documentation:** audit current repository code against M0/M1, then implement the smallest C01 record/draft roundtrip slice.

## Approved engine-first execution override (2026-11-23)

Owner-approved controlling sequence: M0 toolchain and ownership audit; shared engines (reuse verified parent implementations, otherwise implement portable libraries with explicit ownership); all character-specific engines C01–C13 and M01–M04/M22 domain services, including drafts, inventory, spells, notes, journal, roster, conversion and export; engine validation gate; only then production UI for all 17 approved workspaces; parent integration and release. Earlier milestones requiring production UI before engine completion are superseded; retain their functional acceptance tests using headless harnesses until UI phase. Optional AI model availability must not block non-AI portrait/token functionality. No duplicate shared engines, no fabricated test results. Preserve official branding per design section 27. Owner authorizes routine implementation and documentation updates without per-milestone approval. Record actual evidence and blockers; do not mark untested work complete.

## Approved four-family V1 scope (2026-11-24)

The full V1 target includes all profiles in [019](019-MULTI-SYSTEM-V1-RULESET-PROFILES.md). Sequence D&D, Pathfinder, Cthulhu, WFRP after System-Neutral foundation, with headless profile fixtures before production UI. These packs are no longer later-polish scope. Release requires each profile's licensing and acceptance gates or explicit owner-approved scope revision.
