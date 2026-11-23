# Milestone C01-M1 — Canonical Character Record and Draft Roundtrip

**Status:** Implementation-ready acceptance gate; not yet implemented or tested  
**Owner:** Catalyst Character Studio (C01)  
**Source of truth:** `docs/architecture/010-CHARACTER-ENGINE-BUILD-PLAN.md`; compatible with 002–005  
**Scope:** First demonstrably working offline domain artifact, before UI, rules packs, or advancement.

## Repository baseline and coordination

The branch `docs/architecture-foundation` contains architecture documents and a README describing the application as pre-code. No application source, package manifests, automated tests, or Tauri build were verified in the inspected branch; treat the codebase as **not yet bootstrapped**, not as a working application. Verify the working tree locally before scaffolding. Do not claim passing tests until they have actually run.

Architecture 002 previously proposed a local `dice-engine`; approved 010 supersedes that ownership: **S07 dice is owned by parent Catalyst**. Similarly, sourcebook/PDF (S12/S13), global file storage (S01–S03), and print (S14) remain host/shared services. C01 consumes an injected persistence port and may use a standalone local adapter for testing; it does not create a second global storage engine.

The approved 010 explicitly prioritizes System-Neutral plus appropriately licensed SRD 5.2.1 2024 content. Earlier documents also designate D&D 5e (2014) as the new-D&D-character default. These are distinct concerns: first C01 fixture is System-Neutral; initial bundled content and final D&D default behavior require an explicit implementation decision before UI release. C01 must not bake either edition into the schema.

## M1 deliverable

A standalone TypeScript package `packages/character-core` (with shared primitive types where warranted) exposing:
- A versioned, rules-neutral canonical `CharacterRecord` with stable opaque ID, revision, identity, rules context, creation mode, authored fields, choices, extensible collections, and unknown permitted extension data.
- `CharacterDraft` as a separately identified, resumable snapshot referencing its eventual character ID, workflow position, pending selections, and revision.
- Pure constructors, parsers/validators, serialization, revision-aware update operations, and migration **preview** API.
- A `CharacterRepositoryPort` interface for load/save with expected-revision checks. Test adapter can be in-memory; filesystem adapter is an application concern.
- One simple offline CLI/test fixture demonstrating create → edit → save → reload → compare, with no Svelte, Tauri, dice, PDF, or network dependency.

## Proposed package boundaries

```text
packages/
  character-core/
    src/
      types.ts
      schema.ts
      character.ts
      draft.ts
      migrations.ts
      repository-port.ts
      index.ts
    test/
      character.test.ts
      draft.test.ts
      migration.test.ts
tests/fixtures/
  system-neutral-character.json
```

Keep package count minimal; do not scaffold unused engines. Define strict TypeScript settings, a single reproducible test command, and a dependency-free domain package where practical. Schema validation must operate at runtime, not only via TypeScript interfaces.

## Required behavior

1. **Canonical identity:** Character ID survives rename, save/reopen and changes to sheet layout.
2. **Rules neutrality:** System-Neutral character has no mandatory level, class, spell slots, or six D&D abilities.
3. **Pinned context:** System/edition/pack IDs and digests are explicit and not silently rewritten.
4. **Authored versus derived:** Authored values and overrides are persisted; derived calculations are not authoritative.
5. **Roundtrip:** Parse → serialize → parse preserves known data and permitted unknown extension keys.
6. **Drafts:** Persist/reload draft steps, incomplete choices and revision without finalizing character.
7. **Concurrency:** Stale expected revision fails without overwriting newer state.
8. **Migration:** Old supported schema produces a deterministic, inspectable migration preview; apply only after explicit confirmation, with original retained for recovery.
9. **Safety:** Reject malformed input, duplicate IDs, unsupported future schema, dangerous prototype keys, nonfinite numbers, and oversized/deeply nested payloads with structured diagnostics.
10. **Purity:** Domain operations do not access disk, browser, Tauri, time or random generators implicitly; inject ID/time providers for constructors.

## First testable checkpoint

Run one documented command (e.g. `npm test` after workspace bootstrap) that executes automated tests for:
- create/reopen/rename preserving identity;
- System-Neutral fixture with arbitrary typed authored fields;
- unknown extension roundtrip;
- incomplete draft checkpoint/resume;
- stale revision conflict;
- malformed/future-version input rejection;
- no mutation of frozen input;
- migration preview without modifying original;
- stable serialization across repeated runs.

**Exit gate:** All tests pass locally with networking disabled, and a real offline local-file adapter demonstrates save/reopen with atomic write and conflict behavior. The adapter is only a standalone implementation of the host persistence port, **not** a competing Catalyst global storage engine. Record exact commands and test output in the milestone completion report.

## Next milestone after C01

- **S04 rules-pack contract:** immutable edition-aware pack identity, dependency and digest resolution.
- **S05 formula/modifier contract:** pure bounded declarative expressions, deterministic traces.
- **S06 choice/prerequisite contract + C02/C03:** catalog/filter, eligibility, legality/completeness validation.
- Then manual sheet MVP (C09/M02), followed by guided creation (M01).

Do not start UI screens or claim the Guided Builder works until the underlying domain milestone is tested.
