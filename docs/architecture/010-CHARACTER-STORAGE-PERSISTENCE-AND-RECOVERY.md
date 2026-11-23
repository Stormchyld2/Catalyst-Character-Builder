# 010 — Character Storage, Persistence & Recovery Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 016 Character Engine Build Plan & Ownership; 002 Application Architecture; 003 Character Data Model; 006 Drafts; 007 Advancement; 008 Sheets  
**Primary scope:** C01 record/draft/migration and standalone persistence adapters; interfaces to parent Catalyst S01–S03, S09/S10, S15 and S26.

## 1. Purpose and ownership boundary

Character Studio is offline-first. User-owned, portable, schema-versioned Markdown/YAML/JSON documents are authoritative; no cloud account or SQLite database is required. This document defines **character-specific file layout, persistence protocol, conflict detection, backups, migrations and recovery**.

C01 owns typed character/draft schemas, validation, revisions and migration previews. The application layer owns save orchestration. A standalone local filesystem adapter may implement the shared **repository port**, but must not duplicate Catalyst's global project/document storage engine (S01–S03). When integrated, parent Catalyst supplies its own adapter. Pure engines never import Node filesystem, Rust, Tauri, Svelte or browser storage.

## 2. Authoritative, derived and ephemeral state

**Authoritative:** canonical character records, resumable drafts, user-owned sheet templates/customizations, explicit authored values and overrides, session state, advancement records, pinned rules references and source citations.

**Derived and rebuildable:** computed statistics, sheet view models, search indexes, thumbnails, compiled rules, caches and export previews.

**Ephemeral:** open dialogs, tab focus, temporary unsaved form input and calculation jobs. UI may maintain a recovery checkpoint, but it must be clearly distinguished from the last committed character.

The canonical C01 character aggregate is the source of truth. A JSON export, printed sheet or derived cache must not become an alternate authority.

## 3. Recommended standalone directory layout

The exact user-selected library root is chosen by the host adapter and may be located on a removable drive. Do not assume a fixed Windows profile path.

```text
<CharacterLibrary>/
  characters/
    <characterId>/
      character.json                 # authoritative character aggregate
      assets/                        # explicitly managed character-owned assets
      recovery/                      # local recovery/backup snapshots
  drafts/
    <draftId>.json                   # authoritative resumable draft
  sheet-templates/
    <templateId>/
      template.json                  # user-owned template/version
  rules-packs/                       # optional installed pack documents; S04 owns resolution
  .catalyst-character-studio/
    index.json                       # rebuildable index, never authoritative
    transactions/                    # recovery journals/temp files, adapter-owned
```

Use stable opaque IDs as directory/file names, not character display names. Name changes must not move authoritative records. The root may also be a parent Catalyst project: map the same repository contract to the parent document service instead of enforcing this standalone layout.

**Initial canonical format:** UTF-8 JSON with explicit `schemaVersion`, `characterId`, `revision` and stable nested IDs. Markdown/YAML interoperability is provided by C11 import/export adapters, not three simultaneously writable authoritative representations of one character. A character can be exported to other supported formats without creating ambiguous dual authority.

The folder structure above is a **proposed v1 convention**, not a claim of existing implemented paths.

## 4. Document identity, serialization and references

- Character and draft IDs are durable, opaque and collision-resistant; never derived from filenames, display names or mutable labels.
- Revision is a monotonically changing opaque token or revision identifier controlled by the repository transaction; wall-clock timestamps are informational only.
- Serialize deterministically with stable key ordering and explicit UTF-8 normalization; do not reorder semantically ordered arrays.
- Preserve supported unknown extension namespaces during parse/serialize. Unknown mandatory schema versions or unsafe keys must fail with actionable diagnostics rather than being silently discarded.
- Rules context records system/edition and pinned pack IDs, versions and digests; no automatic pack or edition substitution.
- External sourcebooks and parent project documents are referenced by stable IDs and portable locators; do not embed copyrighted book text or PDF binaries in the character file.
- Asset references must be relative to a validated managed asset root or use a permission-managed external locator. Reject traversal, symlink escapes and unexpected absolute paths.

Canonical digest/hash can detect corruption or confirm backup equality, but is not a substitute for schema validation or optimistic revision checks.

## 5. Repository port and application commands

The public port is transport-neutral and strongly typed; illustrative contract:

```ts
type SaveOutcome =
  | { status: "saved"; id: string; revision: string; digest: string }
  | { status: "conflict"; id: string; expectedRevision: string | null; actualRevision: string | null }
  | { status: "invalid"; diagnostics: readonly Diagnostic[] }
  | { status: "io-error"; code: string; recoverable: boolean };

interface CharacterRepositoryPort {
  loadCharacter(id: string): Promise<CharacterLoadResult>;
  listCharacters(): Promise<readonly CharacterSummary[]>;
  saveCharacter(input: {
    record: CharacterRecord;
    expectedRevision: string | null; // null means create-only
    operationId: string;
  }): Promise<SaveOutcome>;
  loadDraft(id: string): Promise<DraftLoadResult>;
  saveDraft(input: {
    draft: CharacterDraft;
    expectedRevision: string | null;
    operationId: string;
  }): Promise<SaveOutcome>;
}
```

This is an illustrative contract pending C01 schema finalization; production types must not use `unknown` placeholders. Operations must distinguish missing record, unsupported future schema, corrupted record, denied access, missing removable drive and revision conflict.

The application layer validates structural integrity, authorization and intent before invoking the adapter. It never assumes that a successful UI click means a durable save.

## 6. Safe local write protocol

A standalone filesystem adapter must implement a **recoverable atomic replacement** appropriate to the actual filesystem:

1. Validate schema, ID, allowed paths and expected revision; verify target is within the authorized library root.
2. Acquire per-record serialization/locking and recheck the committed revision while holding it. The lock protocol must work across concurrent processes or report unsupported concurrency; a process-local mutex alone is insufficient.
3. Write a complete new document to a uniquely named temporary file in the **same directory/filesystem** as the target. Never write directly over the live file.
4. Flush the temp file to durable storage where supported; verify byte count and optional digest.
5. Preserve the previous valid committed document in a recoverable snapshot/journal according to the backup policy.
6. Atomically rename/replace the target where the host/filesystem guarantees it; flush parent directory metadata where supported. If the platform cannot guarantee durable atomic replace, expose that limitation and use a tested journal/recovery protocol rather than asserting atomicity.
7. Only after successful commit report the new revision and update disposable indexes.
8. Clean stale temp/journal artifacts only after verifying which committed version is authoritative.

On Windows, removable drives and filesystems can have different rename, locking and flush semantics. Test NTFS and a representative removable filesystem before claiming power-loss guarantees. A missing drive or interrupted write must never be treated as a request to create an empty library.

## 7. Optimistic concurrency and idempotency

Every save supplies an expected revision. If it differs from the latest committed revision, reject the write without modifying the newer record. The UI offers reload, compare or explicit reconciliation; it must preserve the user's unsaved edits separately until a decision.

An operation ID prevents repeated save/finalization/advancement commands from creating duplicate records or applying a grant twice. Persist the idempotency outcome where needed to survive process restart, or derive it from a durable committed operation record; do not rely only on in-memory deduplication.

Advancement, sheet edits, resource transitions and guided finalization all use the same revision-aware repository boundary. Cross-document operations are not automatically atomic: either commit one authoritative aggregate or use a documented recoverable multi-file transaction protocol.

## 8. Drafts, autosave and crash recovery

Guided drafts are separately identified documents with draft ID, intended character ID, workflow/pack version, pending choices, step position, revision and status. A draft may be mechanically incomplete but must pass structural validation.

- Checkpoint after confirmed choices and meaningful navigation; debounce typing but provide explicit Save Draft.
- Show saved, saving, unsaved and failed/conflicted states; never promise a save before the port confirms success.
- On restart, scan valid drafts and offer Resume, Review or Recover; do not silently finalize.
- Finalization must save the character first, then mark the draft finalized using an idempotent operation ID. A crash between these steps must reconcile against the already committed character, not create a duplicate.
- A missing pinned pack preserves the draft and allows inspection, with blocked rules-dependent actions and explicit repair/migration options.
- Recovery files are not automatically promoted to authority without validation and user-visible selection when ambiguity exists.

## 9. Backups, retention and restore

Before destructive migration, edition conversion, template migration, respec or replacement with nontrivial risk, create a validated backup of the last committed record. Routine-save backup frequency and retention must be configurable or documented before release; do not invent a fixed retention count as an established product decision.

Each backup records character ID, original revision, schema version, timestamp, content digest and reason. Store backups in the user-controlled library where feasible and provide an export option. Backups are distinct from C12's logical change history.

Restore workflow: inspect candidate → validate checksum/schema/pack references → preview differences → choose recovery target → save as a **new revision** (or explicit duplicate with new ID). Never silently replace the current character or erase its history. Test restoration with corrupt latest file, missing pack, missing asset and disconnected removable storage.

## 10. Schema migrations and compatibility

C01 maintains explicit version-to-version migration functions that are pure, deterministic and tested. Migration is a **preview-first** operation:

1. Parse and identify source schema version without rewriting original bytes.
2. Reject unsupported future versions safely and allow read-only preservation/export when possible.
3. Resolve a supported migration chain and generate a preview with changes, preserved extension fields, losses and unresolved references.
4. Create a verified backup and require explicit confirmation for any potentially lossy or semantic transformation.
5. Revalidate the migrated record and commit through the revision-aware repository port.
6. Retain original backup and migration provenance for recovery.

Schema migration, rules-pack upgrade and D&D edition conversion are distinct operations. A schema migration must not automatically change pinned rules/edition. Missing rules packs do not justify deleting selections, authored values or overrides.

## 11. Indexes, searches and removable-drive behavior

Library listings may use a disposable metadata index, but every record remains discoverable by scanning authoritative files. Rebuild index after corruption, manual file edits or a library move. Avoid reading derived indexes as the sole source of character existence.

Support user-selected library locations and removable drives. Detect disconnected/read-only storage and report it clearly. Do not silently redirect writes to another folder or create an apparently empty replacement library. On reconnect, re-read revisions before applying queued edits. External file changes require conflict detection, not last-write-wins.

## 12. Security and privacy

- Validate JSON sizes, nesting depth, field counts, value types, duplicate IDs, unsafe prototype keys and path references before allocating expensive processing.
- Treat imported files, templates, homebrew and rich text as untrusted. No arbitrary scripts, unsafe HTML or executable expressions.
- Minimize Tauri filesystem capabilities; use explicit library-root permissions and canonical path checks.
- Keep characters, notes and portrait assets local by default; no mandatory telemetry, remote account or background uploads.
- Respect parent Catalyst visibility/permissions (S09/S10) when integrated; local possession of a file is not a substitute for host authorization policy.
- Do not embed private external documents or copyrighted sourcebook material in exported character bundles without explicit authorization.

## 13. Integration with parent Catalyst

C01 schema, validation, migration and repository-port types remain pure reusable packages. Standalone Character Studio injects a local file adapter. Parent Catalyst injects its existing S01–S03 project/document persistence and S09/S10 permissions/event adapters.

C11 uses the shared S26 import/export contract for alternate formats; C10 uses S12/S13 for sourcebook links; C08 uses S07 for dice; C11 printing uses S14. None of these engines is reimplemented here. Port compatibility and DTO version negotiation must be tested using a separate TypeScript consumer without importing the Svelte/Tauri application.

## 14. Test plan and release gates

1. Create/save/reopen a System-Neutral manual character offline with no packs.
2. Rename character and verify unchanged character ID and folder path.
3. Preserve permitted unknown extension fields byte-semantically through parse/serialize.
4. Save two concurrent edits from one revision; reject stale write without losing newer data.
5. Crash/inject failure at every write stage; recover last complete valid revision.
6. Simulate disk full, permission denied, read-only and disconnected removable drive; do not report false success.
7. Rebuild an index after deletion/corruption; recover all valid authoritative records.
8. Checkpoint/reopen incomplete draft with unchanged selections and stable IDs.
9. Crash after character finalization but before draft status update; retry without duplicate character.
10. Reject oversized, deeply nested, malformed, unsafe-path and unsupported-future-schema documents.
11. Preview a schema migration without mutating original; confirm backup and explicit commit.
12. Restore from a validated backup as a new revision and preserve current record until confirmed.
13. Preserve pinned 2014/2024 edition and pack identities across saves and schema migrations.
14. Verify derived caches can be deleted and rebuilt without changing character bytes.
15. Test local adapter on Windows NTFS and representative removable media, documenting actual durability limitations.
16. Run C01 core tests in plain TypeScript without Svelte, Tauri, filesystem or network access; adapter tests may access a temporary filesystem.
17. Verify a parent-compatible repository adapter can load/save identical canonical records.
18. Verify no global dice, PDF, print or project storage engine was duplicated.

**First implementation gate:** `docs/milestones/C01-M1-CHARACTER-RECORD-DRAFT-ROUNDTRIP.md` must pass with actual commands, test output and offline local-file save/reopen evidence. This architecture is a specification, not proof that storage or recovery has been implemented.

## 15. Open decisions before implementation

- Finalize C01 JSON Schema, exact revision token generation and idempotency persistence semantics.
- Select and test Windows-safe atomic replacement/journal strategy for supported filesystems.
- Define backup frequency/retention, encryption (if any), and restore UX.
- Finalize asset-root and external reference permission policy.
- Finalize parent Catalyst S01–S03 port compatibility and migration of standalone library roots.
- Specify precise validation budgets and cross-process locking behavior.

**Architectural rule:** The user's canonical character file is authoritative. All writes are validated, revision-aware and recoverable; shared storage ownership remains with parent Catalyst.
