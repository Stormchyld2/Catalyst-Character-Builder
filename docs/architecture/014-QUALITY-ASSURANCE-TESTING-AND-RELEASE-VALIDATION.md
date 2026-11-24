# 014 — Quality Assurance, Testing & Release Validation

**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 016 approved build order; 002 architecture; 003–013 component contracts  
**Scope:** Test strategy, fixture management, CI, offline Windows verification and acceptance gates.

## 1. Quality objectives

Prove character correctness, file integrity, rules edition isolation, recoverability, security, accessible interaction and reuse from parent Catalyst. A committed architecture document is not evidence of implemented code. Every milestone requires reproducible commands and actual test results.

## 2. Test layers

- **Schema/unit:** C01 typed records, migrations, unknown fields, IDs, revisions; S04 pack validation; S05 formula evaluation/cycles; S06 choices; C02–C12 pure engine behavior.
- **Property/fuzz:** malformed JSON/YAML, oversized input, unsafe paths, deep nesting, duplicate IDs, random choice graphs, invalid expressions and adversarial archives.
- **Contract:** repository, rules, dice, print, citation, permission, event and transfer ports; parent consumer compatibility.
- **Integration:** application use cases with real standalone adapter and mocked shared ports.
- **End-to-end:** Windows/Tauri app launch, create/edit/save/reopen, guided flow, sheet, advancement, export and recovery.
- **Accessibility:** keyboard-only, screen reader/manual review, focus, contrast, scaling and reduced motion.
- **Reliability:** fault injection, concurrent writes, crash/restart, disk-full, removable-drive disconnect, corrupted index and backup restore.

## 3. Canonical fixture matrix

Maintain checked-in synthetic, licensed fixtures: System-Neutral manual record; incomplete guided draft; custom fields and unknown extension namespaces; D&D 2014 and 2024 pinned edition references; appropriately licensed 2024 SRD test options; multiclass/advancement; missing pack; conflicting revisions; unsupported future schema; long notes; large inventory; missing asset; corrupt document; invalid template; GM-hidden fields.

Use no copyrighted proprietary rulebook data as test fixtures without rights. Pin fixture pack digests and expected outputs; document the source and license.

## 4. Determinism and correctness

S05 calculations and C04 progression proposals must be pure and deterministic. Verify identical inputs produce identical outputs and traces, independent of UI order and host. Assert that manually authored values and overrides survive recalculation, serialization and migration.

Dice outcome tests use a **mock S07 port** and deterministic supplied results, not a duplicate dice evaluator. Confirm action binding passes expressions/context correctly and never rolls during passive rendering.

## 5. Persistence and recovery fault matrix

Inject failures before temp write, during write, after flush, before replacement, after replacement, during backup, before index update and during finalization draft cleanup. At each stage assert that at least the previous committed record is recoverable and no false success is returned.

Test two writers with same revision, stale operation IDs, idempotent retry after crash, external edits, NTFS permissions, read-only media and missing removable library. Never assert power-loss atomicity without platform-specific evidence.

## 6. CI pipeline

For pull requests and mainline merges:
1. Dependency installation from locked manifests; license/security checks.
2. Format/lint/typecheck and forbidden dependency graph checks.
3. Unit/property/contract tests with coverage reporting.
4. Integration tests against temporary filesystem and mocked parent ports.
5. Svelte production build and Tauri desktop compile smoke test on Windows runner.
6. Artifact checks for bundled license notices, rules packs and no remote runtime dependencies.
7. Release candidate manual smoke checklist and signed/checksummed artifacts where supported.

CI must fail on tests, type errors, unsafe dependency imports or license violations. Report skipped tests honestly; a green docs-only build is not product readiness.

## 7. Milestone gates aligned with 016

**Gate 1 — C01-M1:** System-Neutral create/save/reopen, drafts, unknown-field preservation, schema/migration validation, revision conflicts and offline local file roundtrip.

**Gate 2 — Rules/options:** S04/S05/S06 plus C02/C03 deterministic fixtures, edition isolation, legality and completeness diagnostics.

**Gate 3 — Manual sheet:** C09/M02 editable System-Neutral sheet, autosave, template binding, print handoff and Windows UI smoke.

**Gate 4 — Guided builder:** M01 full draft/finalization workflow, upstream invalidation preview, no duplicate finalization, licensed 2024 options.

**Gate 5 — Gameplay/advancement:** C04–C08/M03, spell/equipment/resource transitions, history, explicit confirmation and shared dice port.

**Gate 6 — Polish/integration:** C10–C12/M04, source links, export/print, designer, NPCs and parent Catalyst external consumer.

No stage is complete without passing tests and a demonstrable offline artifact.

## 8. Release readiness

Record build commit SHA, toolchain versions, dependency lockfile, test command outputs, manual Windows version/hardware, migration fixtures, known issues, licensing review and recovery verification. Test fresh install, upgrade, rollback (where supported), uninstall without deleting user library, and app launch with network blocked.

Never overwrite a user's library during install/update. Any incompatible migration requires backup and explicit confirmation.

## 9. Acceptance tests

1. Pure engine tests execute without Svelte/Tauri.
2. Windows desktop build launches with networking disabled.
3. System-Neutral character roundtrips with stable IDs and custom fields.
4. 2014/2024 pack fixtures remain isolated.
5. Calculation cycles and unsafe ASTs fail safely.
6. Concurrent stale save cannot overwrite newer revision.
7. Interrupted save restores last valid record.
8. Draft finalization retry does not duplicate character.
9. Missing pack preserves authored values.
10. Advancement preview matches committed result.
11. Shared S07 dice mock is sole roll outcome source.
12. Shared S14 print mock receives accurate sheet document.
13. Import/export preserves allowed extension data.
14. Permission-gated exports exclude hidden fields.
15. Keyboard navigation and manual accessibility checks pass documented criteria.
16. Parent consumer imports engine package without app runtime.
17. Personal installation verifies local pack provenance and required notices; shared artifacts exclude proprietary local packs.
18. Test evidence and known limitations are attached to milestone review.

**Rule:** No milestone or release claim without executable evidence and documented failures.

## Personal-use content policy

Owner-approved personal-use policy (2026-11-24): Catalyst Character Studio is for the owner's private use only, with no planned commercial release or redistribution. Target comprehensive rules coverage, including lawful local sourcebooks and structured datasets, not SRD-only coverage. Commercial redistribution permission is not a gate for the owner's local installation; applicable access, copying, conversion and software-license terms still apply. Keep proprietary books, extracted data, assets and private packs outside tracked Git files, shared CI fixtures and public artifacts; use synthetic or appropriately licensed fixtures in Git. Do not bypass DRM or access controls. Record source provenance and validate imported data. Do not impose commercial licensing negotiations on lawful local use. Any future redistribution requires a separate owner decision and rights review.
