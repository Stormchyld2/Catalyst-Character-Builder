# 011 — Character Import, Export & Printing Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 016 Character Engine Build Plan; 003 Character Data Model; 008 Interactive Sheet & Designer; 009 Sourcebook Library; 010 Storage, Persistence & Recovery  
**Owner:** C11 Character Import/Export & Print Profiles; interfaces to C01, C09, C10, C12 and parent Catalyst S14/S26.

## 1. Goal and ownership

C11 makes characters portable and printable while preserving the **C01 canonical character record** as the only authoritative editable character model. It owns character-specific serializers, import mapping, validation previews, sheet print profiles, and export orchestration. Parent Catalyst owns S14 shared print/layout rendering, S26 generic import/export adapters, S01–S03 file storage, and S12/S13 sourcebook/PDF infrastructure. Character Studio must **not** implement its own general-purpose PDF engine, dice engine, or global file-storage engine.

Exports are user-initiated snapshots, not live secondary records. A printable character sheet is a presentation of an evaluated character, not a substitute for canonical data.

## 2. Supported formats and priorities

| Format | Import | Export | Notes |
|---|---|---|---|
| Native character JSON | V1 | V1 | Lossless C01 roundtrip where schema versions are supported |
| Native character bundle (manifest + JSON + permitted assets) | Later | Later | Portable, versioned; asset/license review |
| YAML | Later | Later | Safe data-only parser, no tags/object construction |
| Markdown | Later | Later | Human-readable document with explicit machine-readable metadata for lossless mode |
| PDF completed character sheet | No general automatic import | V1 via S14 | Static presentation, not canonical |
| PDF blank character sheet | Not applicable | V1 via S14 | Template-driven, no personal data |
| Decorative/ink-friendly PDF variants | Not applicable | Later via S14 | Character-specific profiles, shared renderer |
| Third-party character JSON/CSV | Adapter-specific | Adapter-specific | Explicit field mapping and compatibility report |
| Other VTT formats | Future, if documented/licensed | Future | Never assume one universal VTT schema |

The native **authoritative storage format** remains JSON per 010. YAML and Markdown exports must not silently create a second writable authority. A plain Markdown document is not presumed lossless unless the export profile embeds or references the complete validated C01 data.

## 3. Pure C11 conversion pipeline

Separate the pure, deterministic transformations from host IO:

1. **Identify:** detect format by content signature and explicit profile, not filename extension alone.
2. **Bound and parse:** enforce size/depth/collection limits; reject unsafe YAML tags, prototype keys, script content and invalid encodings.
3. **Normalize:** map external fields to a typed intermediate import representation with source provenance and unresolved values.
4. **Preview:** show source/target system, edition, pack compatibility, identity handling, field mapping, omissions, conflicts and lossy conversions.
5. **Validate:** C01 structural validation; C03/S06 rules-aware diagnostics when packs are available.
6. **Confirm:** explicit user selection to create new character, merge/reconcile, or cancel.
7. **Commit:** host repository adapter performs revision-aware, idempotent save; C12 records import provenance/history.
8. **Report:** return saved ID/revision or structured failure; never report success based solely on parsing.

C11 must never directly modify a user-selected source file during import. Parsing a PDF character sheet, if ever supported, requires a separately designed, opt-in extraction/mapping workflow and must not be represented as reliable native import.

## 4. Stable IDs, provenance and collision policy

- Native export includes schema version, character ID, revision, pinned system/edition/pack IDs/versions/digests, custom field IDs, extension namespaces and authored overrides.
- **Import as new:** allocate a new character ID, remap internal owned references consistently, and record source identity in provenance.
- **Update existing:** require explicit target selection, expected revision, mapping preview and conflict resolution; never overwrite by matching name.
- **Duplicate ID:** stop and offer import-as-new, reconcile, or cancel; never silently merge.
- **Unsupported future schema:** preserve source bytes, report incompatibility and block destructive import.
- **Missing pack:** retain unresolved references and authored fields, warn and avoid substituting another edition.
- **Unknown extension fields:** preserve supported namespaces or disclose exact losses before confirmation.

External formats without stable IDs receive newly allocated IDs. Import/export should not regenerate IDs during a lossless native roundtrip.

## 5. Export profile model

A versioned `CharacterExportProfile` identifies format, schema/profile version, intended audience, inclusion/exclusion rules, locale, data redaction, asset handling, source attribution and optional template/skin. Export is generated from an immutable C01 snapshot and explicit evaluation context.

Suggested profiles:
- **Native Backup:** full supported character data, exact pinned references, user-owned extensions.
- **Portable Exchange:** documented C01-compatible data and optional safe assets.
- **Player Share:** selected visible identity, statistics and features; omit GM-only/private fields.
- **GM Summary:** concise character overview subject to host permissions.
- **Blank Sheet:** empty fields and labels only.
- **Completed Sheet:** evaluated stats, resources, equipment and notes.
- **Ink-Friendly:** low-ink monochrome presentation.
- **Decorative:** optional styled sheet using licensed assets and safe templates.

Export selection is explicit; do not infer that everything visible locally is authorized for sharing. Parent S09/S10 permission/visibility decisions apply to integrated Catalyst projects.

## 6. Print layout and data consistency

C09 generates the typed `SheetViewModel` from the same pinned character and rules context used by M02. C11 maps that view model and a validated character print profile to a **print document description** consumed by parent S14. S14 owns pagination, font embedding, PDF creation, print preview/queue and device output.

Print profiles specify paper size (e.g., Letter/A4), orientation, margins, page breaks, field order, headings, typography tokens, overflow behavior, accessible labels, and optional background/decorative assets. The profile must not embed arbitrary executable code or unsafe HTML/CSS.

For each printed value, distinguish authored, calculated and manually overridden values where the chosen profile requires transparency. Use a consistent evaluated snapshot; a print job must not mix character revision N with calculated values from revision N+1.

Long notes, inventory and spell lists must paginate without truncating important content. Missing bindings produce visible placeholders or blocking diagnostics according to profile policy, never fabricated numbers.

## 7. Blank, completed and decorative sheets

**Blank:** render selected sheet template labels and writable spaces, independent of any character record. System-Neutral blank sheets require no D&D assumptions.

**Completed:** use canonical C01 record and C09 view model. Support user-configured sections, optional resource trackers, notes and appropriate source citations.

**Decorative:** theme-only change; cannot change field bindings, rules evaluation or character state. Decorative art and fonts require compatible redistribution rights. Provide a clean and ink-friendly fallback if assets are missing.

A print template version is pinned in the job manifest. Designer changes after export starts do not mutate the in-flight job.

## 8. Citations, licensing and privacy

C10 supplies structured source references and parent S12/S13 resolves titles, editions and page locators. Printing may include short source citations/links, but never automatically append imported sourcebook pages or redistribute protected book text.

Exporting personal notes, campaign secrets, hidden GM fields, linked portraits or third-party assets requires explicit inclusion rules and applicable host permission checks. Default sharing profiles should minimize private data. File names must be sanitized; output path permissions are provided by the host, not C11.

A sourcebook being readable in the local library does not grant redistribution rights. Rules-pack license metadata and attribution requirements must be honored in export profiles.

## 9. Export transaction and error handling

- Snapshot character ID, revision, rules context digest, template/profile versions and evaluated data before export.
- Validate output, preview destination and inclusion manifest, then request user confirmation where sensitive/lossy.
- Write via host-provided output port using temporary files and safe replacement, consistent with 010. Do not partially overwrite existing exports.
- Export does not increment character revision or mutate character data.
- If S14 is unavailable, return `print-unavailable`; do not silently substitute a custom PDF renderer.
- Missing assets, unsupported formats, unavailable destinations and insufficient permissions return structured diagnostics.
- A canceled operation leaves original character and target files unchanged; cleanup incomplete temporary artifacts.
- Preserve a manifest/checksum for native bundles to detect missing or modified members.

## 10. Suggested public contracts (illustrative)

```ts
interface CharacterImportEngine {
  inspect(input: ImportInspectRequest): ImportInspection;
  preview(input: ImportPreviewRequest): ImportPreview;
  transform(input: ConfirmedImportMapping): CharacterCandidateResult;
}

interface CharacterExportEngine {
  describe(input: ExportRequest): ExportManifestResult;
  serialize(input: NativeExportRequest): SerializedCharacterResult;
  buildPrintDocument(input: PrintProfileRequest): PrintDocumentResult;
}

interface CharacterTransferApplication {
  commitImport(input: ConfirmedImportRequest): Promise<ImportCommitResult>;
  writeExport(input: ConfirmedExportRequest): Promise<ExportWriteResult>;
  print(input: ConfirmedPrintRequest): Promise<PrintJobResult>;
}
```

Domain engines remain pure. Application services inject C01 repository, S14 renderer, S26 format adapters, permissions and filesystem/export destination ports. Finalize exact discriminated DTOs, error codes, profile schemas and cancellation semantics before implementation.

## 11. Security and interoperability

- Treat imported documents and archive members as untrusted. Defend against zip-slip, decompression bombs, duplicate paths, symlink entries, malicious YAML tags, unsafe JSON keys and overlong/deep structures.
- Validate embedded/linked assets and MIME signatures; no external network fetch during offline import.
- Keep pack content separate from character selections; exporting a character does not export entire rules books or executable pack code.
- Document any unavoidable third-party format loss, including unrecognized fields, edition mismatch, class progression, spells, equipment and homebrew.
- Maintain deterministic output for identical canonical inputs/profile versions, except explicitly supplied export timestamps or host metadata.
- Never run scripts from user files, templates, or imported content.

## 12. Acceptance tests

1. Native JSON export/import roundtrips stable IDs, custom fields, unknown permitted extensions, overrides and pinned pack references.
2. Import-as-new remaps character and owned nested references without breaking internal links.
3. Duplicate character ID triggers explicit conflict handling, not overwrite.
4. Future schema and malformed/oversized input are rejected without modifying originals.
5. Missing rules pack preserves source values and yields unresolved-reference warnings.
6. YAML/Markdown export/import profiles disclose whether they are lossless and roundtrip when promised.
7. External third-party format mapping preview identifies all unsupported/lossy fields.
8. Exporting the same snapshot/profile twice yields deterministic data.
9. Export never changes authoritative character revision.
10. Blank System-Neutral sheet renders without D&D fields or rules packs.
11. Completed print uses one coherent C01 revision and C09 evaluation snapshot.
12. Overflowing equipment/notes paginate without silent truncation.
13. Decorative and ink-friendly variants preserve identical values and IDs.
14. Print request invokes injected S14 renderer; no local PDF engine is called.
15. Missing S14 renderer produces an explicit unavailable result.
16. Source citations resolve via C10/S12/S13; no imported PDF pages are bundled.
17. Permission-filtered player share omits GM-only/private fields.
18. Failed/canceled export leaves existing destination intact.
19. Native bundle import rejects traversal, malicious archives and asset path escapes.
20. C11 pure tests run offline without Svelte, Tauri, filesystem, PDF engine or network dependencies.

## 13. Delivery sequence and gates

- **First:** complete C01-M1 and canonical schema, validation, revision-safe repository and migration fixtures.
- **Next:** implement C11 native JSON inspection/export against C01 and verify lossless roundtrip.
- **Sheet MVP:** supply a simple blank/completed print profile handoff to S14 after C09/M02 view-model contracts exist.
- **Later:** YAML/Markdown, third-party mappings, bundle/assets, decorative profiles and advanced template print customization.
- **Integration:** verify S14/S26/S09/S10 adapter contracts with parent Catalyst; do not duplicate shared infrastructure.

**Architectural rule:** C11 translates and presents character data; it never becomes a second character authority or a second PDF renderer.
