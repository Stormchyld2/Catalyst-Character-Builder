# 002 — Application and Reusable Module Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed architecture baseline — subject to owner review  
**Dependencies:** 001 Product Scope; 009 Sourcebook Library  
**Stack:** Svelte 5, TypeScript, Tauri 2, Rust

## 1. Architectural goal

Ship a standalone offline-first desktop application whose character, rules, calculation, progression, dice, and sheet engines can later be consumed by the parent Catalyst application **without importing Character Studio UI or Tauri runtime dependencies**.

Dependency direction is strictly inward: UI → application use cases → domain engine interfaces; infrastructure adapters implement ports and are injected at composition time. Domain packages must never import application UI, desktop APIs, storage adapters, or other host-specific services.

## 2. Recommended workspace structure

```text
apps/
  character-studio/               # Svelte 5 UI and desktop composition root
    src/
      routes-or-views/             # App navigation and screens (routing choice later)
      features/                    # Builder, library, sheets, settings
      components/                  # Catalyst UI primitives
      styles/                      # Charcoal/silver/gold design tokens
    src-tauri/                     # Tauri 2 commands, capabilities, Rust host
packages/
  domain/                          # Stable IDs, common domain types, errors, events
  character-core/                  # Character aggregate, commands, history
  rules-core/                      # Ruleset definitions, pack resolution, registry
  calculation-engine/              # Pure evaluation, modifiers, explanations
  validation-engine/               # Preconditions, prerequisites, diagnostics
  advancement-engine/              # Level/experience/milestone transitions
  dice-engine/                     # Dice notation and explicit RNG injection
  sheet-engine/                    # Field bindings, layout/schema interpretation
  builder-engine/                  # Guided step graph, draft state, resumability
  content-core/                    # Structured content and source citations
  sourcebook-core/                 # Reader/search/annotation service contracts (009)
  application/                     # Orchestrated use cases and ports
  adapters-file/                   # Portable filesystem serialization, atomic writes
  adapters-tauri/                  # Host bridge; never imported by domain packages
  ui-kit/                          # Optional Catalyst shared visual components
rules-packs/                       # Only redistributable or test-fixture content
docs/architecture/
tests/
```

This is a **logical package plan**, not a requirement to publish every package separately at launch. Start with packages whose independent contracts are real; avoid empty scaffolding and premature fragmentation.

## 3. Dependency boundaries

- `domain` defines common stable identity and neutral value types; it contains no game-specific fields.
- `character-core` models character lifecycle and state transitions; it can reference opaque ruleset/option IDs but not particular editions.
- `rules-core` interprets versioned pack metadata and resolves enabled content. It cannot mutate character files.
- `calculation-engine` computes derived values and provenance from explicit inputs; it cannot read disk, call UI, or mutate its inputs.
- `validation-engine` returns structured diagnostics; it never silently corrects user data.
- `advancement-engine` proposes and validates advancement transitions; persistence is a separate confirmed use case.
- `dice-engine` parses/rolls with injected randomness; deterministic test RNG must be supported.
- `sheet-engine` maps model fields to system-specific and manual layouts without owning character state.
- `builder-engine` runs a pack-defined workflow and persists draft decisions through application ports.
- `content-core` stores licensed/structured options and citations; imported PDF text is not executable rules.
- `sourcebook-core` defines the ports described in 009; its viewer and OCR adapters are optional infrastructure.
- `application` coordinates transactions, authorization/validation, history, and adapter calls.
- `apps/character-studio` owns Svelte components, screen state, desktop settings, and dependency injection.
- Rust/Tauri is a **host adapter**, not the authority for RPG calculations unless an explicit future ADR changes this.

No circular imports. Rules-pack data must not import executable code or run arbitrary user scripts. Dependency rules should be enforced in automated checks.

## 4. Service contract conventions

Public engine APIs are typed, documented, and versioned. Prefer explicit request/response objects and structured errors over throwing for ordinary validation failures. Engine calls must accept explicit context (ruleset ID/version, enabled pack snapshot, character state, overrides, and optional campaign settings).

Representative contracts (illustrative, not final schemas):

```ts
interface CharacterRepositoryPort {
  load(id: string): Promise<unknown>;
  save(input: unknown, expectedRevision: string): Promise<{ revision: string }>;
  list(): Promise<readonly unknown[]>;
}
interface RulesRegistryPort {
  resolve(input: { systemId: string; editionId: string; packIds: readonly string[] }): Promise<unknown>;
}
interface CalculationService {
  evaluate(input: unknown): { values: unknown; explanations: unknown; diagnostics: readonly unknown[] };
}
interface AdvancementService {
  propose(input: unknown): { preview: unknown; diagnostics: readonly unknown[] };
}
```

`unknown` placeholders are intentional until 003–005 define authoritative schemas. Do not implement these placeholders as-is.

## 5. Rules edition isolation

The initial supported profiles are:
- **D&D 5e (2014)** — application default.
- **D&D 5.5e (2024 Edition)** — selectable alternative.

Settings → Game Rules → Default Edition affects **new characters only**. Every character records a stable `systemId`, `editionId`, and pinned rules-pack version references. A character library may contain both editions. Edition conversion must be an explicit, previewable, validated operation, never an implicit effect of changing Settings.

Use distinct edition identifiers and rules-pack namespaces. Neither edition's content may silently override the other. Shared mechanics may reuse engine code but not conflate edition-specific rule data.

## 6. State ownership and persistence

- **Authoritative:** portable, schema-versioned local character documents, user rules packs, custom templates, sourcebook metadata/sidecars, and settings.
- **Derived:** previews, indexes, thumbnails, compiled rules, and UI caches; all rebuildable.
- **Ephemeral:** open dialogs, transient navigation, unsaved form state.
- **Drafts:** explicitly persisted, resumable character-building state with revision metadata.

Only application use cases write authoritative data, via repository ports. Use optimistic revision checks and atomic replacement/recovery to prevent lost updates or partial writes. No SQLite database is authoritative. Precise formats, folder layout, migrations, and backup semantics are specified in 010.

## 7. Cross-module integration with Catalyst

Parent Catalyst consumes shared packages or versioned service interfaces. Character Studio remains an independent host and should never be started merely to perform a calculation or render a sheet.

Integration candidates:
- GM Console: inspect character statistics and conditions.
- Encounter Builder: use dice, action/resource rules, and calculated modifiers.
- Adventure Studio: link character and sourcebook references.
- Print Studio: render sheet templates to printable output.
- Sourcebook Library: share repository, citation, and search services from 009.

Shared APIs must declare version compatibility, migration strategy, and explicit host-provided adapters. Avoid importing app-specific stores or Svelte components into engine packages.

## 8. Host security and offline requirements

- Tauri capabilities must grant minimum necessary filesystem/dialog/print access; no broad arbitrary filesystem scope by default.
- User-selected external files are accessed only through explicit permissions and safe path handling.
- Treat imported PDFs, pack metadata, templates, and homebrew text as untrusted inputs; validate schema, sizes, references, and paths.
- No remote CDN, account, telemetry, or network dependency for core features.
- No arbitrary code execution in user packs or templates.
- Keep originals unchanged on import unless the user explicitly requests a separate transformation.
- Ensure exports do not silently include copyrighted sourcebook contents.

## 9. Quality gates

Before feature implementation:
1. Verify the workspace builds in a clean Windows environment.
2. Prove a pure engine package can run unit tests in Node without Svelte/Tauri.
3. Verify a mocked repository adapter can save/reopen a manual character.
4. Verify 2014 and 2024 edition identifiers remain isolated.
5. Verify offline launch with networking blocked.
6. Verify an invalid rules pack cannot mutate saved characters.
7. Verify domain packages contain no UI/Tauri imports.
8. Verify atomic save and revision-conflict behavior in adapter tests.

CI should enforce typecheck, lint, package dependency boundaries, unit tests, and desktop build smoke tests.

## 10. Decisions deferred to later documents

- **003:** character aggregate, fields, stable IDs, revisions, history, manual override semantics.
- **004:** rules-pack schemas, dependencies, edition identifiers, licensing and trust.
- **005:** expression language, evaluation order, modifier stacking, explanations, validation.
- **006–008:** builder state machine, advancement, interactive sheet templates.
- **009:** sourcebook services, reader, annotations and import review.
- **010:** exact file layout, atomic writes, migrations and backups.
- **011–014:** printing, public integration API, design system, testing and release.

## 11. Acceptance criteria

- Character Studio runs independently of the parent Catalyst application.
- Pure engines can be imported into a separate TypeScript consumer without Svelte, Tauri or Rust.
- Two rules editions can coexist in one library without changing each other's character data.
- Switching the default edition never mutates an existing character.
- Storage adapters can be replaced without modifying domain engine code.
- A sourcebook is readable without turning its text into active rules.
- A failing validation or interrupted write cannot silently corrupt authoritative files.
- A future Catalyst module can call a shared engine using a documented, versioned contract.
