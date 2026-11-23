# 003 — Character Data Model and Schema

**Product:** Catalyst Character Studio  
**Status:** Proposed architecture baseline — subject to owner review  
**Depends on:** 001 Product Scope; 002 Module Architecture; 009 Sourcebook Library  
**Implementation:** Versioned TypeScript schemas; portable local files (storage details in 010)

## 1. Purpose and constraints

Define a stable, rules-neutral character document that supports guided D&D 5e (2014), D&D 5.5e (2024 Edition), manual characters, homebrew, and future RPG systems without baking D&D-specific attributes or leveling into the core schema. Character documents are authoritative local files. All derived calculations are reproducible and may be cached only as non-authoritative snapshots.

## 2. Core aggregate

A character is one logical aggregate with stable identity and revision control. The authoritative representation contains:
- `schemaVersion`, `characterId` (UUID or equivalent durable opaque ID), `revision`, creation/update timestamps.
- `identity`: display name, pronouns (optional), portrait reference, biography, notes, and user-defined metadata.
- `rulesContext`: system ID, edition ID, pinned pack IDs/versions/hashes, optional campaign/house-rule references.
- `creationMode`: `guided`, `manual`, or `hybrid`; this is provenance, not a permanent limitation.
- `selections`: typed references to chosen options (e.g., class/species/background) with stable option IDs and selection source.
- `values`: authored base values, user-defined fields, manual overrides, and explicit resources.
- `inventory`, `abilities`, `features`, `actions`, `notes`, `attachments`: extensible collections rather than mandatory D&D structures.
- `advancement`: recorded progression events and user-confirmed changes.
- `sheet`: template ID/version, layout preferences, and custom field placements.
- `audit`: lightweight change provenance and optional imported-from metadata.

Character state must distinguish **definition** (long-lived choices), **current session state** (HP/resource consumption, temporary conditions, equipment use), and **derived view** (computed statistics). Session state may be stored within the same character aggregate but must be a separately typed section. No derived view is authoritative.

## 3. Identifiers, revisions, and references

- Stable IDs are opaque and globally collision-resistant; never derive IDs from display names or file paths.
- Collection items (equipment instances, features, notes, custom fields, advancement events) receive stable IDs.
- `revision` changes on every committed edit and supports optimistic concurrency. Timestamps are metadata, not revision authority.
- A rules reference is `{packId, packVersion, optionId}`; add a content digest/snapshot reference when required to guarantee deterministic reconstruction.
- A sourcebook citation is `{documentId, edition?, pageIndex?, printedPageLabel?, locator?}`, matching 009. A citation is informational, not an executable rules object.
- Unknown optional extension fields must be preserved during supported round trips, or rejected with an explicit compatibility error; never silently discarded.

## 4. Rules-neutral field/value model

A field has stable `fieldId`, declared `valueType`, `value`, optional unit/format, and provenance. Supported baseline value types: number, integer, boolean, string, rich text (safe structured format), enum, set/list, reference, dice expression, and structured object (schema-validated).

Values are **namespaced** by system/pack or user scope to prevent collisions. D&D-specific keys such as `strength`, `armorClass`, or `proficiencyBonus` are defined by D&D packs, not required by the character core. Derived values are addressed by declared calculation keys, not persisted as unqualified authoritative fields.

Every user override records target field, replacement or adjustment mode, reason (optional), author/time, and status. UI shows base/computed/override separately. No recalculation may silently erase an override.

## 5. Selections and progression

Selections are typed records `{selectionId, category, optionRef, choiceGroupId?, choices?, source}`. Categories are extensible: species, ancestry, class, subclass, background, feat, skill, spell, equipment, archetype, or system-specific categories. They are **not fixed core enum values**.

Multiclassing, split progression, level-less systems, XP, milestones, point-buy, and narrative advancements must be representable as rules-defined progression tracks/events. No core `level: number` assumption.

Advancement events record event ID, timestamp, progression-track ID, prior/new state or changeset, rule context, selected options, validation result, and user confirmation. The event log is an auditable history, not automatically a replayable event-sourcing system; current committed character state remains authoritative. Undo/respec behavior is deferred to 007.

## 6. Equipment, spells, features, and resources

- **Inventory items:** unique instance ID, optional content option reference, quantity, container/equipment relationships, user notes, and custom attributes. Equipping is a state/relationship, not an implicit rule mutation.
- **Abilities/features/spells:** stable instance ID, optional pack option reference, origin/provenance, prepared/known/equipped status when meaningful, custom properties, and references to actions/resources.
- **Resources:** named/typed counters with optional minimum/maximum formula references, current value, reset policy, and temporary modifications. Rest mechanics are pack-defined.
- **Conditions/effects:** instances with source, duration/expiry semantics, stacking identity, and rules-defined consequences; the core does not assume D&D condition names.
- **Actions:** reference a rules-defined action definition or a user-authored manual action; dice expressions are data, never executable JavaScript.

## 7. Edition isolation and defaults

- Supported initial profiles: `dnd5e-2014` (**D&D 5e (2014)**, application default) and `dnd5e-2024` (**D&D 5.5e (2024 Edition)**).
- These IDs are proposed stable identifiers; 004 must finalize their namespace and compatibility policy before code is written.
- Settings → Game Rules → Default Edition is an **application setting**, not a global mutation of saved characters.
- Every character stores its own edition and pinned pack references. Both editions can coexist in the same library.
- Switching the default changes only the starting edition for **new** characters.
- Conversion between editions is a distinct user-confirmed operation with preview, loss/conflict reporting, backup, and a new revision. It is never automatic.

## 8. Guided drafts and manual/hybrid operation

Guided creation is a resumable draft with `draftId`, target character ID (if allocated), rules context, step graph version, selections, incomplete values, validation state, and revision. Drafts may contain invalid/incomplete intermediate states; committed characters must pass structural validation but may be intentionally rules-incomplete in manual mode.

Manual characters require no installed rules pack. Hybrid mode permits authored fields alongside calculated fields with explicit override precedence. A missing rules pack must never make a saved character disappear or erase its manual content; display unresolved references and permit safe viewing/editing.

## 9. Suggested illustrative schema (not final JSON Schema)

```ts
type CharacterDocument = {
  schemaVersion: string;
  characterId: string;
  revision: string;
  identity: { name: string; notes?: string; [key: string]: unknown };
  rulesContext?: {
    systemId: string;
    editionId: string;
    packs: Array<{ packId: string; version: string; digest?: string }>;
  };
  creationMode: "guided" | "manual" | "hybrid";
  selections: SelectionRecord[];
  values: Record<string, AuthoredValue>;
  sessionState: SessionState;
  advancement: AdvancementRecord[];
  sheet: { templateId?: string; templateVersion?: string };
};
```

This sample is deliberately partial. It must **not** be copied directly into production as the validated schema. Authoritative schemas and fixtures are implementation deliverables under 003–005 and 010.

## 10. Serialization, safety, and compatibility

- Use explicit schema versions and migrations. Never rewrite a newer, unsupported schema.
- Validate all imported character files before saving; cap size and nesting depth, reject unsafe paths, and sanitize rich-text rendering.
- Persist relative attachment paths only within a managed character bundle, or explicit permission-managed external references.
- Store portable references to portraits, PDFs, and templates; do not embed arbitrary binary data into JSON by default.
- Prefer deterministic serialization for diffs and backup verification; exact file layout, atomic writes, crash recovery, and checksums are defined in 010.
- Export must not implicitly bundle copyrighted sourcebook content.
- Missing optional content packs should yield visible diagnostics, not destructive automatic migration.

## 11. Required fixtures and acceptance tests

1. Save/reopen a manual character with no rules packs installed.
2. Create and reopen one 2014 and one 2024 character; both retain distinct edition IDs.
3. Change the app default from 2014 to 2024; existing characters remain unchanged.
4. Reorder/rename items without changing their stable IDs.
5. Missing pack yields unresolved references without data loss.
6. Recalculate a value and verify the original authored value and manual override remain intact.
7. Simulate two edits from the same revision; the stale save fails with a conflict rather than overwriting.
8. Import malformed, deeply nested, oversized, or unsupported-version data and fail safely.
9. Save/reopen an inventory with duplicate item types but distinct instance IDs.
10. Round-trip unknown permitted extension data without loss.
11. Record an advancement event and verify it references the pinned rule context.
12. Delete a derived cache and regenerate it without changing the authoritative character.

## 12. Decisions to finalize downstream

- **004:** exact system/edition/pack ID syntax, dependencies, immutable pack versions, and content licensing.
- **005:** typed formula inputs/outputs, calculation traces, override precedence, and effect stacking.
- **006:** draft workflow graph, checkpoints, resume/restart semantics.
- **007:** progression transitions, undo/respec, event snapshots.
- **008:** custom field and sheet-template schemas.
- **010:** character bundle layout, backup/migration strategy, atomic save and conflict policy.

**Architecture principle:** The character model records what the player authored and selected; the rules engines explain what those choices mean. Never conflate them.
