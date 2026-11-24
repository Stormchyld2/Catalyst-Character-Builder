# 004 — RPG Systems and Rules-Pack Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed architecture baseline — subject to owner review  
**Depends on:** 001 Product Scope; 002 Module Architecture; 003 Character Data Model; 009 Sourcebook Library  
**Primary objective:** Support multiple editions and RPG systems without hardcoding game-specific mechanics into the shared engines.

## 1. Core model and terminology

- **Game system:** A rules family, such as Dungeons & Dragons or another tabletop RPG.
- **Edition/profile:** A particular rules interpretation and compatibility boundary within a system.
- **Rules pack:** Versioned, validated, locally installed structured data defining mechanics, options, prerequisites, advancement, and presentation metadata.
- **Content pack:** Additional structured character options and descriptive content, possibly dependent on one or more rules packs.
- **House-rule overlay:** User-authored pack that explicitly extends or overrides selected rules for an identified edition.
- **Sourcebook:** A user-owned PDF/EPUB/etc. reference in architecture 009. It is **not** an automatically active rules pack.
- **Rules context:** Resolved edition and immutable versions/digests of enabled packs for one character or a draft.

No executable JavaScript, TypeScript, Rust, plugins, or arbitrary expressions from untrusted packs. Any rule expressions must use a constrained, typed, deterministic declarative language specified in 005.

## 2. First-class editions and defaults

Initial supported edition profiles:

| Display label | Proposed edition ID | Default |
|---|---|---|
| **D&D 5e (2014)** | `dnd5e-2014` | **Yes** |
| **D&D 5.5e (2024 Edition)** | `dnd5e-2024` | No |

These are Catalyst UI labels and internal IDs; they do not assert that Wizards of the Coast officially calls the 2024 revision “6th Edition.” Exact system namespace and identifier grammar are finalized before implementation.

**Settings → Game Rules → Default Edition** determines the edition for *new* D&D characters. Existing characters pin their own edition and packs. The library supports both concurrently. Changing Settings never converts or recalculates existing characters against another edition.

Each edition has separate base pack definitions, progression tables, class/species/background options, feat prerequisites, spells, and rule interpretations as appropriate. Shared engine algorithms are reused only when behavior is actually equivalent. Cross-edition pack compatibility must be explicitly declared; similarity of names is insufficient.

## 3. Pack manifest and identity

Every pack must declare at least:
- `schemaVersion`, `packId` (namespaced, stable), `version` (semver-like immutable release), and `contentDigest`.
- `systemId`, supported `editionIds` and any explicit compatibility ranges.
- `kind`: base-rules, expansion, content, homebrew, or overlay.
- `title`, creator/publisher, optional description, attribution, license and distribution permissions.
- Dependencies (required/optional), compatible core-engine/schema versions, and conflict declarations.
- Stable option identifiers and namespaces; localizable display labels separate from IDs.
- Optional sourcebook citations, without embedding copyrighted PDF text into distributed packs.
- Capabilities (e.g., guided creation, character advancement, spellcasting, equipment), expressed as data.

Pack IDs are not filenames or titles. Content digests identify exact bytes; a version must never silently change content. The registry detects version reuse with differing digests.

## 4. Rules-pack layout (illustrative)

```text
packs/
  manifest.json
  definitions/
    fields.json
    choices.json
    progressions.json
    modifiers.json
    prerequisites.json
    actions.json
    resources.json
  content/
    species.json
    classes.json
    backgrounds.json
    feats.json
    spells.json
    equipment.json
  sheets/
    default-sheet.json
  citations/
    sources.json
```

A pack may omit irrelevant categories. The above is a **proposed logical layout**, not a production schema. Exact JSON Schema definitions, allowed expression operators, and package format must be locked during implementation design in 004/005/008. JSON is preferred for interoperable canonical interchange; optional YAML authoring must be parsed safely into the same validated model.

## 5. Extensible rule vocabulary

The engine must support rules-declared:
- Character fields, value types, derived attributes, and resource pools.
- Option categories, choice groups, prerequisites, and conditional visibility.
- Numeric modifiers, replacements, caps/floors, proficiency-like features, stacking and precedence.
- Progression tracks, class/archetype paths, level-less advancement, multiclass or equivalent.
- Equipment, proficiencies, spells/powers, actions, costs, conditions and duration.
- Guided-builder steps, sheet bindings, source citations and localization keys.

A D&D-specific pack may define Strength, Armor Class, proficiency bonus, hit dice, spell slots, and other mechanics. The neutral engine must not require them.

## 6. Resolution, precedence and conflicts

Resolution occurs before evaluating character calculations:
1. Identify exact system and edition.
2. Load required base rules and pinned pack versions/digests.
3. Resolve dependency graph; reject cycles, missing required dependencies and incompatible schema/edition ranges.
4. Validate unique identifiers, schema, references, permissions and declarative rule expressions.
5. Apply extensions and explicitly targeted overlays using deterministic, documented precedence.
6. Produce a frozen resolved-rules snapshot or digest for calculations and character history.

**No implicit last-write-wins.** Conflicting definitions must either have an explicit allowed override target and declared priority, or produce actionable diagnostics. User-authored house rules must show their affected targets and impact preview before activation. Dependency order alone does not authorize replacement. Pack load order cannot arbitrarily change calculated results.

An overlay may add a new option, replace a specific field/rule under a declared contract, or disable a specific option; it cannot silently rewrite another pack. Cross-edition imports are prohibited unless an explicit compatibility adapter or migration is available.

## 7. Character pinning and upgrades

A saved character records system/edition and the exact enabled pack identities, versions and digests (003). The application may install newer pack versions, but existing characters continue resolving against their pinned set while available.

When a pinned pack is missing or damaged:
- Preserve the character and its authored fields.
- Display missing/invalid pack diagnostics and last-known context.
- Permit safe manual viewing/editing without falsely presenting recalculated values as authoritative.
- Offer repair/relink or a user-confirmed migration preview.

A pack upgrade or edition conversion is an explicit operation: inspect compatibility, preview changed options and calculations, report losses/conflicts, create backup/revision, and require confirmation. Never silently upgrade an existing character.

## 8. Homebrew and third-party support

Users can author local structured packs for species, classes, subclasses, backgrounds, feats, spells, gear, progression, and house rules. Provide schema validation, preview, dependency reporting, source attribution and a publish/activate confirmation.

Third-party packs are not automatically trusted because they were imported from a PDF or named after a publisher. Imported sourcebooks remain references until a reviewed conversion into structured rules is explicitly approved (009). OCR results are candidate text, not validated mechanics.

Local use and export/distribution are separate rights decisions. Never bundle paid proprietary rulebooks, scrape protected services, bypass DRM, or assume that ownership of a PDF permits redistributing its text. Licensed material may be bundled only after verifying applicable redistribution terms and required attribution. **Local personal-use content availability and provenance remain scope gates; commercial redistribution approval is not required for lawful local use**; supporting an edition in the architecture does not mean all its proprietary options are included.

## 9. Public engine interfaces

The rules core should expose pure, host-independent operations conceptually equivalent to:

- `validatePack(pack): Diagnostics`
- `resolveRulesContext({systemId, editionId, pinnedPacks, overlays}): ResolvedRules | Diagnostics`
- `listChoices({context, category, characterDraft}): ChoiceResult`
- `evaluatePrerequisites({context, character, optionId}): ValidationResult`
- `inspectProvenance({context, ruleId}): RuleSource[]`
- `previewPackChange({character, targetPacks}): ChangeImpact`

These are conceptual contracts, not final TypeScript signatures. Concrete input/output schemas are established with 003 and 005. Filesystem access belongs to repository ports and adapters; engines must not depend on Tauri, Svelte, or Rust.

## 10. Local registry and security

- Maintain a local pack registry/index that is disposable and rebuildable from authoritative pack files.
- Validate all pack files against explicit size, nesting, path, identifier, and reference limits.
- Reject archive path traversal, unsafe symlinks, external URLs as required runtime dependencies, and arbitrary script execution.
- Use bounded evaluation, cycle detection, and deterministic rule execution; prevent resource exhaustion from malformed expressions.
- Preserve original imported pack bytes or record immutable digests; never edit a third-party pack in place without an explicit user action.
- Offline installation from local files must work with networking disabled.
- Signature/trust indicators may be added later, but unsigned homebrew can be locally usable after validation and user approval; do not conflate a valid schema with a trusted publisher.

## 11. Builder, sheet, and sourcebook integration

- Builder engine (006) consumes pack-defined choice groups, prerequisite results, and edition-specific workflows.
- Advancement engine (007) consumes pack-defined progression and transition rules.
- Sheet engine (008) consumes declared fields, actions, resources and layout templates; missing packs yield visible unresolved bindings.
- Sourcebook services (009) provide `View Source` links and citation metadata; sourcebooks cannot execute rules.
- Parent Catalyst uses the same versioned rules resolution contracts, not Character Studio's Svelte stores.

## 12. Acceptance tests

1. Install and resolve 2014 and 2024 base packs in the same library without namespace collisions.
2. Create a character with the default 2014 edition, change Settings to 2024, and verify the first character remains unchanged.
3. Create a 2024 character and confirm it uses only compatible pinned packs.
4. Reject a 2014-only option pack in a 2024 context unless explicit compatibility is declared.
5. Detect dependency cycles, missing required packs, and conflicting override targets.
6. Resolve the same valid pack set in different file enumeration orders and obtain identical output digest.
7. Reject a malicious pack with executable code, unsafe paths, or unbounded recursive expressions.
8. Import a local homebrew pack offline, validate it, preview it, and activate only after user confirmation.
9. Remove a pinned pack; the character remains visible with unresolved references and no silent data loss.
10. Upgrade a pack only through preview, conflict reporting, and user confirmation.
11. Import a PDF sourcebook and verify it does not automatically register any executable rules.
12. Run rules-core tests without Svelte, Tauri, Rust, network access, or filesystem side effects.

## 13. Implementation gates and open decisions

Before writing the rules interpreter, finalize:
- Canonical pack manifest and option JSON Schemas with sample fixtures for **both** editions.
- Edition/system ID grammar, stable option IDs, semantic versioning and content digest rules.
- Exact dependency and overlay precedence model.
- Bounded declarative expression language and error semantics (005).
- Local content inventory for each edition; comprehensive coverage is the target, with missing content explicitly recorded.
- Pack file layout, migration and atomic install process (010).
- Builder step and sheet template schemas (006/008).

**Architectural rule:** Editions and homebrew are data-driven and independently versioned. A character's saved choices are never silently reinterpreted under another rules edition.

## Personal-use content policy

Owner-approved personal-use policy (2026-11-24): Catalyst Character Studio is for the owner's private use only, with no planned commercial release or redistribution. Target comprehensive rules coverage, including lawful local sourcebooks and structured datasets, not SRD-only coverage. Commercial redistribution permission is not a gate for the owner's local installation; applicable access, copying, conversion and software-license terms still apply. Keep proprietary books, extracted data, assets and private packs outside tracked Git files, shared CI fixtures and public artifacts; use synthetic or appropriately licensed fixtures in Git. Do not bypass DRM or access controls. Record source provenance and validate imported data. Do not impose commercial licensing negotiations on lawful local use. Any future redistribution requires a separate owner decision and rights review.

## Redistribution classification (owner-approved)

Record redistribution status for every imported rule record, text, artwork, template and asset, using existing pack/source provenance rather than a second registry. Proposed values: `redistributable`, `personal-only`, `permission-required`, `unknown`. Store source ID, edition/version, license or permission evidence, applicable restrictions and required attribution. Pack/source defaults may be inherited only when they unambiguously cover the record; explicit narrower restrictions win. Missing, mixed or conflicting rights resolve conservatively; derived records inherit applicable source restrictions. A tag is not itself proof of permission. Local lawful use is independent of redistribution classification.

Keep restricted payloads outside tracked Git and shared artifacts. If the owner later authorizes distribution, construct a separate staging artifact from an explicit allowlist of verified redistributable records/assets, retaining notices and satisfying applicable terms. Exclude unknown and restricted records, including embedded descriptions, indexes, caches, thumbnails and sourcebooks. Validate dependency closure, references and required choices; omit or replace dependent content with lawful alternatives rather than leaving broken rules. Report omissions and fail closed on unresolved references or rights. Never mutate the owner's personal packs. No public-release pipeline is required now; capture metadata during acquisition and use existing S04/S13/S26 boundaries when implementation reaches them.

## Local content storage safeguard

Owner-approved public-repository safeguard: copyrighted sourcebook PDFs, restricted extracted rules data and restricted artwork must remain outside both Git working trees, in an owner-selected local content root (recommended Windows Desktop/Catalyst Content, organized by system/edition). Resolve the actual folder through user selection, never hardcode a username or Desktop path. Store local paths in untracked local settings; do not upload private content to GitHub, CI, logs or shared artifacts. A future private repository does not automatically authorize upload; require explicit owner approval and applicable rights. Keep local content separate from distributable code.
