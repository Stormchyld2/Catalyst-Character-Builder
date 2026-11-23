# 012 — Character Studio Integration Contracts & Host Adapters

**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 016 approved ownership plan; 002, 003, 005–011  
**Scope:** Public engine packages, application use cases, parent Catalyst adapters, capability negotiation and cross-repository coordination.

## 1. Goal and ownership

Character Studio owns and tests M01–M04 and C01–C12, plus any incubated pure S04/S05/S06 implementation. Parent Catalyst must **consume those same engines** rather than rebuild them. Parent owns S01–S03 project storage, S07 dice, S09/S10 event/permissions, S12/S13 sourcebooks, S14 print, and S15/S22/S26 asset/inventory/import-export services. Character Studio may provide standalone adapters but never fork these global engines.

The dependency direction is UI → application use cases → pure engines/ports; concrete adapters are injected at the composition root. No pure engine imports Svelte, Tauri, Rust, filesystem, DOM or network APIs.

## 2. Package and version boundaries

Recommended independently importable logical packages: character-core (C01/C12), character-options (C02/C03), character-advancement (C04), character-gameplay (C05–C08), character-sheet (C09), character-content (C10/C11), rules-core (S04), calculation-core (S05), choice-core (S06), and character-application (orchestration/ports). Only split packages once real dependency boundaries justify them.

Publish versioned TypeScript entrypoints with explicit ESM exports, declaration files, supported runtime targets, schema version compatibility and documented peer dependencies. Use semantic versioning for public APIs and separate schema versioning for persisted documents and rules packs. Avoid deep imports into internal paths.

## 3. Typed host capabilities

The host supplies adapters for:
- **CharacterRepositoryPort:** load/list/create/update, expected-revision compare-and-swap, draft save/recover, atomic or recoverable persistence, operation-id idempotency.
- **RulesPackPort:** enumerate/resolve exact system/edition/pack version/digest; report missing and incompatible packs.
- **DicePort (S07):** accept typed roll expression/context, return outcome/provenance; no local dice evaluator in C08.
- **SourcebookCitationPort (S12/S13):** resolve document ID, edition, page index and printed label, open a page via host UI; no PDF reader inside C10.
- **PrintPort (S14):** accept versioned character print document, return preview/job status; no PDF renderer in C11.
- **AssetPort (S15):** resolve permission-managed portrait and attachment references.
- **ImportExportPort (S26):** host destination/source handles and generic format transport; C11 owns character mapping.
- **PermissionPort (S10):** authorize read/edit/roll/print/share/GM-only data before use-case execution.
- **EventPort (S09):** publish committed domain events with stable event IDs, never before persistence succeeds.
- **Clock/IdProvider:** explicit time and stable ID generation at application boundary; deterministic injected fixtures in tests.

Host ports expose capabilities, not UI component instances or raw Tauri command names. Optional capability absence must be explicit and gracefully degraded.

## 4. Public use cases and DTO conventions

The public API includes create/open/list/update character, draft checkpoint/finalize, list/apply choice, validate/calculate, propose/commit advancement, build sheet view model, apply sheet edit, bind roll, resolve source citation, import/export, and print.

Each request carries relevant character ID, expected revision, pinned rules context or digest, actor/campaign context where applicable, operation ID for mutations and optional cancellation token. Responses use discriminated unions such as `ok`, `validation-error`, `conflict`, `missing-capability`, `missing-pack`, `permission-denied`, `unsupported-version`, `cancelled`, `io-error`. Do not use exceptions as ordinary control flow.

Illustrative composition contract:

```ts
interface CharacterHostPorts {
  characters: CharacterRepositoryPort;
  rules: RulesPackPort;
  permissions: PermissionPort;
  events?: EventPort;
  dice?: DicePort;
  sourcebooks?: SourcebookCitationPort;
  printing?: PrintPort;
  assets?: AssetPort;
  transfer?: ImportExportPort;
  clock: ClockPort;
  ids: IdPort;
}
interface CharacterStudioEngine {
  createCharacter(request: CreateCharacterRequest): Promise<CreateCharacterResult>;
  calculateCharacter(request: CalculateCharacterRequest): CalculationResult;
  proposeAdvancement(request: AdvancementRequest): AdvancementProposalResult;
  commitAdvancement(request: ConfirmedAdvancementRequest): Promise<CommitResult>;
  getSheetViewModel(request: SheetRequest): SheetViewModelResult;
}
```

These are interface shapes to finalize, not executable declarations with unresolved type imports.

## 5. Integration and lifecycle

Standalone Tauri composition root wires local file storage, bundled rules fixtures and optional host capabilities. Parent Catalyst composition root wires existing shared services. Parent never launches the standalone Character Studio process to calculate a stat or render a sheet.

Load and edit flows must verify authorization before exposing restricted fields. Calculation uses immutable snapshots and exact pinned rules. Mutations revalidate revision and rules digest before persistence. Events publish only after confirmed durable commit. Parent events are supplementary to authoritative C01/C12 history.

Version negotiation checks engine API, character schema, rules-pack schema and print/sourcebook adapter contracts independently. Incompatibility returns a structured diagnostic; never silently convert editions or upgrade persisted characters.

## 6. Integration tests and acceptance criteria

1. Import pure engine package into a separate TypeScript test app without Svelte/Tauri.
2. Load and save identical C01 fixtures through standalone and mocked parent repository ports.
3. Detect revision conflict and idempotent retry across adapters.
4. Calculate with exact pinned pack and reject edition mismatch.
5. Invoke S07 port exactly once for a roll; verify no alternate dice evaluator.
6. Invoke S12/S13 citation port and S14 print port without importing PDF libraries into core.
7. Reject unauthorized edit/GM-only export before persistence or event emission.
8. Publish committed event only after repository success.
9. Missing optional print/dice/sourcebook capability returns actionable status while sheet remains usable.
10. Reject incompatible API/schema versions with preservation of source data.
11. Verify no cyclic imports or forbidden UI/host imports in domain packages.
12. Test complete offline use with no network dependency.

## 7. Implementation gates

Before parent integration, publish a versioned port package, contract tests, a standalone adapter test suite, and a minimal external consumer fixture. Keep parent Catalyst architecture 023 aligned with this ownership assignment; any transfer of ownership requires an explicit architecture decision.

**Rule:** One character engine implementation, multiple hosts, injected shared services.
