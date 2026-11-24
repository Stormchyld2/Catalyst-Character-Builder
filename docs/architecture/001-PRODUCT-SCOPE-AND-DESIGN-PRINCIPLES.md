# 001 — Product Scope and Design Principles

**Product:** Catalyst Character Studio  
**Repository:** `Stormchyld2/Catalyst-Character-Builder`  
**Status:** Proposed architecture baseline — subject to owner review  
**Target stack:** Svelte 5, TypeScript, Tauri 2, Rust  
**Related specification:** `009-SOURCEBOOK-LIBRARY-PDF-AND-HOMEBREW.md`

## 1. Product mission

Catalyst Character Studio is a standalone, offline-first tabletop RPG character creation, advancement, and digital-sheet application. It will ultimately integrate with the larger Catalyst platform without requiring that platform to operate.

Its experience should be comparable in clarity and usability to D&D Beyond's guided character creation, without copying proprietary visual assets, text, code, or protected content.

## 2. Primary users and use cases

- **Players:** Create, manage, advance, play, print, and export characters.
- **Game Masters:** Review characters and configure campaign-specific options, source selections, and house rules; later integration may provide broader campaign tools.
- **Homebrew creators:** Define custom options and sheet templates with explicit validation and source attribution.
- **Other-system players:** Create manual characters immediately, and use guided automation when compatible rules packs are available.

## 3. Supported workflows

### Guided creation
A resumable, step-by-step process driven by an installed, compatible rules pack. The steps and available choices are system-defined, not hardcoded to one edition. The initial target supports two independently versioned D&D 5e-compatible rule profiles: **D&D 5e (2014)** and **D&D 5.5e (2024 Edition)**. The 2014 profile is the application default. Users select the default in Settings → Game Rules → Default Edition; each character records its own edition, so changing the default only affects newly created characters and never silently converts existing ones.

### Manual creation
Create or edit a character without a supported rules pack. Users can define fields, sections, labels, notes, resources, and sheet layouts. Manual values must not be silently overwritten by automation. Guided and manual characters must coexist in the same library.

### Character lifecycle
Create, save, duplicate, import, edit, advance, optionally retrain/respec, archive, and export. Maintain stable character IDs, meaningful provenance, advancement history, and reversible or reviewable changes. Distinguish current character state from long-term character definition.

### Interactive sheets
Present derived values, resources, equipment, spells or abilities, notes, and actions appropriate to the selected system. Provide accessible keyboard navigation, clear explanations for calculated values, and printable layouts.

### Reference material
Allow locally owned rulebooks, supplements, and homebrew documents as described in architecture 009. Reading a sourcebook does not automatically activate its contents as executable rules.

## 4. Product boundaries

**In scope for the standalone product:**
- Character library and profile management.
- Guided and manual creation.
- Rules-pack selection and validation.
- Character calculations and advancement.
- Customizable interactive sheets.
- File import/export, printing, and PDF export.
- Local sourcebook references and future homebrew authoring.
- Offline operation, backups, and recovery.

**Out of scope for the initial standalone MVP:**
- Mandatory online accounts or cloud synchronization.
- Multiplayer hosting, live virtual tabletop, or remote campaign sessions.
- Full encounter, map, world, or adventure authoring.
- Bundling proprietary paid rulebooks or bypassing DRM.
- A guarantee that every RPG system can be fully automated at launch.

These exclusions do not prevent future integration or separately approved phases.

## 5. Non-negotiable design principles

1. **Offline-first:** All core workflows must function with network access disabled. No remote runtime dependency, telemetry requirement, CDN, or account gate.
2. **File-authoritative:** Human-portable, versioned local character and rules-pack files are the source of truth. Indexes, thumbnails, and caches are disposable. SQLite is not authoritative.
3. **Rules-neutral core:** Shared engines must not assume six attributes, d20 checks, proficiency bonuses, fixed level caps, spell slots, or a particular action economy.
4. **Deterministic and explainable:** Calculated outputs must be reproducible from character state, active rules, and explicit inputs. Expose calculation sources and modifier precedence.
5. **No silent mutations:** Imports, rule upgrades, recalculation, and homebrew changes must not silently replace user-authored values or invalidate existing characters.
6. **Stable identity and provenance:** Characters, packs, options, and templates use durable IDs; record pack version and source references needed to understand historical choices.
7. **Separation of concerns:** Svelte UI orchestrates reusable TypeScript domain packages through explicit interfaces; filesystem and OS-specific behavior lives behind adapters.
8. **Standalone and embeddable:** The character/rules/template engines cannot depend on Character Studio UI or Tauri. Catalyst integration uses versioned contracts rather than copying application internals.
9. **Accessible and adaptable:** Keyboard-first paths, readable contrast, scalable type, customizable sheets, and print-friendly presentation.
10. **Legal content boundaries:** Only bundle content with appropriate redistribution rights. Local import does not imply permission to redistribute. Do not bypass DRM.
11. **Data portability:** Provide documented export formats, schema migrations, backups, and recovery paths; avoid irreversible proprietary lock-in.
12. **Testable by design:** Pure engine functions, deterministic fixtures, compatibility tests, and offline acceptance testing are expected before feature release.

## 6. Platform and technology direction

- **UI:** Svelte 5 and TypeScript.
- **Desktop shell:** Tauri 2.
- **Native integration:** Rust for justified desktop/system capabilities.
- **Domain engines:** Framework-agnostic TypeScript packages, unless a later architecture decision explicitly justifies another implementation.
- **Visual identity:** Catalyst charcoal, silver, and gold; central design tokens and reusable components.
- **Initial release target:** Desktop, with Windows as the primary verification platform. Other platforms are future compatibility targets, not promises in this document.

Specific package boundaries, file formats, schema versioning, security model, and build pipelines are defined by later documents.

## 7. Shared-engine ownership

The following are planned independent capabilities, with exact boundaries to be defined in 002–005 and subsequent specifications:

- Character model and lifecycle services.
- Rules-pack registry, dependency and compatibility resolution.
- Calculation and modifier evaluation.
- Prerequisite and character-state validation.
- Character advancement.
- Dice and randomization services.
- Sheet/template interpretation.
- Content/sourcebook references and import review.

An engine is reusable only if it has no runtime dependency on the Character Studio interface and can be invoked through documented APIs in another Catalyst module.

## 8. Initial delivery definition

A viable first release should allow a user to:
1. Launch without signing in or connecting to the internet.
2. Create a manual character and save/reopen it.
3. Create a guided character using an installed, legally distributable 5e-compatible rules pack.
4. View a usable interactive sheet with explainable calculated fields.
5. Advance a character while retaining a history of changes.
6. Print or export a readable character sheet.
7. Back up, restore, and move character data without losing identity or user-authored information.

Sourcebook integration and advanced homebrew tooling can be phased separately, consistent with architecture 009.

## 9. Acceptance criteria

- A complete core workflow succeeds with network access disabled.
- Character data survives restart, export/import, and supported schema migration.
- Manual characters work with no installed rules pack.
- Engine tests execute without Svelte, Tauri, or Rust.
- A second rules model can be represented without adding D&D-specific assumptions to core character schema.
- Computed values expose their contributing rules; manual overrides remain distinguishable.
- No imported book content is redistributed automatically.
- The standalone product runs without the parent Catalyst application.

## 10. Open decisions for follow-up architecture

- Exact licensed content baseline for both D&D 5e (2014) and D&D 5.5e (2024 Edition), including rules-pack availability and permitted distribution.
- Rules-pack schema, dependency semantics, and cross-edition compatibility.
- Character file layout, transactional writes, encryption options, and backup policy.
- Sheet-template schema and manual/custom field model.
- Advancement history, retraining, and respec semantics.
- Parent Catalyst packaging and API versioning.
- Exact PDF renderer/export pipeline and accessibility implementation.

**Architecture sequencing:** 002 defines boundaries; 003 defines character data; 004 defines rules packs; 005 defines calculations and validation. Document 009 remains the sourcebook-library baseline and must be reconciled with those contracts.

## Approved four-family V1 scope (2026-11-24)

The full V1 release target is the four game families and five editions in [019](019-MULTI-SYSTEM-V1-RULESET-PROFILES.md), plus System-Neutral. The initial D&D slice is not the full release scope.
