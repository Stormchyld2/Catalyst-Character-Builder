# 018 — Portrait Studio, Image Editor and VTT Token Maker

**Status:** APPROVED product scope and interaction design by product owner (2026-11-23). **Implementation not yet verified or claimed.**
**Owner:** Catalyst Character Studio, standalone repo `Stormchyld2/Catalyst-Character-Builder`.
**Related:** 017 Local Character Portrait Generation (C13), 016 Character Engine Ownership, 003 Character Data Model, 012 Host Adapters, 011 Catalyst Design System.
**Reference:** Foundry VTT-style Tokenizer functionality and dynamic token concepts. This is a functional benchmark only, not permission to copy their code, artwork, UI trade dress, or protected assets.

## 1. Approved purpose and boundaries

**Portrait Studio** is the character-focused visual workspace for portrait creation, import, nondestructive editing, variants, token composition and export. **C13** is the separate optional AI portrait-generation adapter. **Token Maker** is an integrated editing mode of Portrait Studio rather than another isolated application. Both imported images and AI-generated images enter exactly the same editing and token workflow.

The character builder, sheets, NPC creator and future Catalyst Map Studio reference a shared portrait/token asset by stable ID; they must never embed raw image bytes in a character JSON record. The user can build and use characters without any portrait, AI model, network service, or token.

The user explicitly approved the complete Portrait Studio concept, including VTT token functionality, AI/import workflows, local storage, and integration. No UI screens or executable behavior are thereby considered implemented.

## 2. Screen and user journeys

**Entry points:** character workspace Portrait tab; optional Generate/Import choice near guided-builder review; NPC/creature portrait action; character card portrait context action.

**AI path:** open Portrait Studio → prepopulate character appearance using installed system/edition and user-authored appearance (not fabricated lore) → select headshot/full-body, style and other explicit overrides → invoke optional installed C13 model → review generated variations → select candidate → **Open in Editor** → edit/crop/create token → save portrait and token asset references to the same character. Never automatically overwrite a portrait after regeneration.

**Import path:** open Portrait Studio → drag-and-drop/file picker or choose existing asset → validate format, dimensions and file safety → open unchanged original in editor → nondestructively edit → save portrait/token outputs. Show the same controls and capabilities as generated images; never require an AI model.

**Saved project path:** reopen an existing portrait project with its source image reference, edit operations, crop geometry, masks, layers, token frame, named variants and export settings intact.

**Primary UI sections:** header with selected character and current asset; original/variant strip; large image editing canvas with zoom/pan and safe guides; inspector for image adjustments/crops/layers; a **Portrait / Token** mode selector; token preview showing circle/square framing; asset actions Import, Generate, Duplicate Variant, Set as Portrait, Set as Token, Export, Save/Discard.

The approved visual system is **Obsidian, charcoal, gunmetal and Frost Blue** from Architecture 011. Use official Catalyst branding assets, not approximate logos.

## 3. Nondestructive portrait editor

Required V1 tools:
- import common safe raster formats (PNG, JPEG, WebP); export PNG/WebP where supported; preserve original bytes and metadata in the managed asset store;
- pan, zoom, rotate, flip, scale, reposition and crop; reset individual transforms; undo/redo and before/after comparison;
- optional brightness, contrast, saturation and simple tone adjustment; persist numeric operations without baking into source;
- configurable canvas aspect ratio (sheet portrait, headshot, bust and full-body), cropping guides and background color/transparency;
- store edited versions, select active portrait, save variants; do not destroy previous versions or source image;
- edit imported and generated images identically;
- keep missing-file/relink, disk full, import failure and unsupported image states recoverable.

Advanced tasks (deferred, optional): background removal, subject segmentation, style transfer, upscale, inpainting/image-to-image, batch NPC portrait generation and consistency-preserving variations. Those are not prerequisites for functional V1.

## 4. VTT Token Maker — full approved scope

**Composition:** foreground portrait/subject, optional editable background, independent mask, independent frame/ring, optional shadow/border/effect layers. Layers support order, visibility, opacity, transform, lock and duplication with bounded counts.

**Shape presets:** circular and square token masks are mandatory; allow future hexagonal/custom shapes. Tokens may be flat 2D exports with an optional ring, border thickness/color, frame texture, shape crop, vignette and true transparent corners/outside-mask.

**Editing:** drag to reposition character inside mask; zoom portrait without moving ring; rotate/scale source; fine-control sliders; align/center; optional portrait protrusion above ring (subject cutout) only when segmentation exists and the user enables it. Provide live token preview at actual map icon sizes (e.g., 64, 128, 256 pixels) and high-resolution export preview.

**Frame library:** bundled original/licensed or user-supplied reusable frame presets; imported frame PNGs retain provenance; user can create personal presets. No Foundry/other proprietary frame art bundled without rights. Neutral default frames should work for fantasy, sci-fi, contemporary and horror settings; do not hardwire D&D themes.

**Export:** transparent PNG default, optional WebP; user selectable output size (common 256/512 px, bounded by source resolution and hardware), square/circular masks and frame/no-frame. Transparent output must have proper premultiplied-alpha handling and no unintended opaque corners or halos. Exports can be saved into the character's managed assets, exported externally, and used in other VTTs as ordinary token image files.

**Catalyst native dynamic tokens:** retain a **layered source project** with independent foreground/subject, background, ring and mask, with optional declarative cosmetic status indicators and animation later. Do not assume third-party dynamic-token metadata formats or promise interoperability with Foundry's dynamic token format; export flattened PNG/WebP for broad compatibility until a dedicated licensed/format-tested adapter is designed.

**Map and character integration:** user selects one `activePortraitAssetId` and optional `activeTokenAssetId`; the sheet/dashboard shows portrait and Map Studio/GM Console shows token. Changing one does not silently overwrite the other. Missing assets display repair/placeholder state without deleting references. Later Android character app reads flattened derivatives even when editor/inference is unavailable.

## 5. Architecture and reusable-engine ownership

- **M22 — Portrait Studio & VTT Token Maker:** Character Studio-owned Svelte workspace and portrait-specific editing workflow. This is a *module-specific* component, not a replacement for global asset/image engines.
- **C13 — Character-aware AI Portrait Generation:** character context, prompt builder, framing, optional generation jobs, selection/attachment. Its preferred SD3 Medium pipeline and benchmark/license requirements remain in Architecture 017.
- **Shared image inference service (parent Catalyst):** owns the actual generic model runtime, model manifests/download policy, hardware probing, queue/cancel and provenance. Character Studio consumes a typed port; avoid a second generic model runtime.
- **S15 Asset Library & Media Transform (parent Catalyst):** owns global file import, binary storage, safe paths/hash, reference lifecycle, thumbnails, format decoding/encoding and reusable nondestructive transform/compositor primitives. Standalone Character Studio may use a local adapter.
- **C01 character repository:** commits portrait/token stable asset IDs using expected revision and conflict checks, without embedding large bytes.
- **C09/M02:** displays active portrait in sheets and cards; user-selected sheet theme does not modify source image.
- **M04:** NPC/creature uses exactly the same studio and asset contracts.
- **Parent Map Studio and GM Console:** consume token reference and shared asset renderer; no duplicate token editor or image-generation engine.
- **S14/C11:** print/layout uses selected portrait assets, respecting print crop/export geometry.

Core image editing data types and project schemas should remain framework-independent. The Svelte canvas implements user interaction; generic decoding/processing may use a host-specific implementation behind an interface. No additional authoritative database.

## 6. Suggested portable data contracts

A portrait project stores `projectId`, `schemaVersion`, `characterId?`, `sourceAssetId`, authored transform/edit operations, layers, mask/crop geometry, frame assets, output variants and export presets. Every layer has a stable ID, z-order, normalized transform/opacity, type, rights/provenance, and an optional referenced asset ID. Operations and masks are data, not executable scripts.

Port interface suggestions:

```ts
interface PortraitStudioPort {
  openProject(projectId: string): Promise<PortraitProject>;
  importSource(input: ImageImportRequest): Promise<AssetReference>;
  preview(project: PortraitProject): Promise<ImagePreview>;
  saveProject(project: PortraitProject, expectedRevision: string): Promise<SaveResult>;
  renderToken(project: PortraitProject, preset: TokenExportPreset): Promise<AssetReference>;
  attachToCharacter(characterId: string, portraitAssetId?: string,
    tokenAssetId?: string, expectedCharacterRevision?: string): Promise<SaveResult>;
}
interface PortraitGenerationPort {
  listAvailableModels(): Promise<ModelCapability[]>;
  generate(request: PortraitGenerationRequest): Promise<PortraitGenerationJob>;
  cancel(jobId: string): Promise<void>;
}
```

These are illustrative, not frozen APIs. Explicitly model generation artifacts, source assets, portrait projects and flattened token derivatives as distinct types. Preserve reference integrity, schema versioning, license/provenance and optional prompt metadata. Never save full embedded image bytes in character records.

## 7. Safety, privacy and performance

Everything works fully offline except user-initiated download of optional licensed model weights. Imported image files are untrusted: validate MIME/signature, dimensions, encoded length, decompression limits and asset path; avoid unsafe SVG/script execution and remote image URLs. Guard against runaway memory use with streaming or tiled processing for very large sources; constrain canvas/output sizes and render jobs. Cancelled edits/generations cannot mutate the authoritative character.

Provide explicit user consent before applying AI prompts generated from private notes; no telemetry or private asset uploads. AI model licensing, bundled fonts/art/frame packs and donor source reuse require per-version audits. Store source images with original quality; render previews/exports as disposable derivatives.

Token Maker must be keyboard accessible for numeric positioning and sizing, support focus, text alternatives, zoom and reduced motion. Transparent tokens must be previewed against dark/light checkerboards so users can inspect clipping.

## 8. Build sequence and acceptance gates

**P0 — Source and editor:** import local image → validate → create portrait project → manipulate crop/zoom/rotate → save/reopen nondestructively → attach as active portrait. Demonstrate a complete offline file roundtrip.

**P1 — VTT Token Maker:** circle/square masks, layered ring/background, free reposition, token preview, transparent PNG export, set active token; verify corners/edges and VTT-safe dimensions.

**P2 — Variants and library:** import user frame asset, named saved presets, variant history, before/after, duplicate/edit without touching original; broken file repair/undo/recovery.

**P3 — C13 generator integration:** optional AI generation → select output → edit with the same Portrait Studio → export portrait/token; missing model/hardware constraints do not block import or token work. Honor Architecture 017 license/hardware benchmark before bundling weights.

**P4 — Parent application:** typed adapter to S15 asset library, C01 stable references, Character Sheet, NPC workspace, Map Studio and GM Console; dynamic token sources retained for Catalyst-native later use.

Acceptance tests:
1. A user with **no AI model installed** imports a portrait, edits it, exports a transparent circular PNG token and links both outputs to a character.
2. AI-generated and imported images enter the **same editor**, with no difference in tool availability.
3. Source image bytes remain unchanged across crop, frame change, save/reopen, token export and revert.
4. Token circle/square mask output displays correct alpha; frame does not move when portrait position changes.
5. Token output can be read as a regular PNG in other VTTs, without proprietary metadata.
6. Layered project reopens with identical mask, transform, frame, ordering and active asset links.
7. Broken or missing source/frame references offer relinking and do not silently clear the character's reference.
8. Cancel/failed generation/failed save produces no new character attachment or false success.
9. Character dashboard/sheet uses portrait; Map Studio uses token, and they can be changed independently.
10. No forced cloud, copied third-party visual assets, unlicensed image model redistribution or second generic inference/asset storage engine.

**Next coordination step:** Register M22 in the parent Catalyst 023/024 ownership matrix; it is Character Studio-owned. M22 is a module, not a new global shared engine. Do not interfere with main Catalyst's active Campaign Wizard, soundboard, left panel or theme work.

## Approved portrait environment selection (2026-11-24)

Architecture 017 §12 controls the 52 text-prompt environment presets (36 fantasy, 10 modern, 6 universal), shared across D&D and Pathfinder editions and filtered by the character's pinned ruleset genre. Automatic (default), Preset, Custom Environment and Show All Environments are supported, with optional lighting, weather, time of day and atmosphere controls and prompt preview. Use the same C13 catalog and SD3 Medium runtime in the embedded builder and standalone Portrait Studio; generate scenery and character together, no required background image library. Imported backgrounds remain optional editor/token layers; no mandatory segmentation or inpainting in V1. Environment selection never changes mechanical character Background. Follow 017 acceptance gates and preserve non-AI workflows.
