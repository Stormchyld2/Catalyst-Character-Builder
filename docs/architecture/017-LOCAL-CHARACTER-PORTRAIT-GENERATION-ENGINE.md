# 017 — Local Character Portrait Generation Engine (C13)

**Date:** 2026-11-23  
**Status:** Stable Diffusion 3 Medium pipeline approved as preferred model; optimization and hardware minimums require benchmarking. Not implemented.  
**Owner:** Catalyst Character Studio (`Stormchyld2/Catalyst-Character-Builder`)  
**Consumers:** M01 Guided Builder, M02 Interactive Sheet, M04 NPC/Creature Composer; parent Catalyst may consume through a typed port.

## 1. Product requirement

Build a fully offline, optional **Character Portrait Generator**. Given a character's tabletop RPG system/edition, species/race/ancestry, class/role, background and optional appearance choices, generate an original portrait that can be selected for the canonical character sheet. Default D&D 5e (2014) experience is a UX preference, not a restriction: any supported system or System-Neutral character can generate or import a portrait. Generation must not be required to create, save, edit, print or advance a character.

**Approved model decision (2026-11-23):** Prefer **Stable Diffusion 3 Medium and its required complete pipeline**. The owner explicitly relaxed the previous 2B *total-pipeline* ceiling for SD3 Medium after hands-on portrait comparison found Sana 1.5 produced distorted faces. The 2B figure describes the SD3 Medium image backbone, **not** the total pipeline. Minimize actual disk footprint and peak RAM/VRAM through measured optimization (e.g. precision, quantization, optional component loading) without compromising portrait quality. Do not claim a guaranteed size, hardware minimum, license grant or CPU performance before verification. Keep weights optional and installed on demand.

## 2. User journey

1. Character builder/sheet offers **Portrait → Generate**, **Import**, **Choose Existing**, **Remove**.
2. **Dynamic installed-system selection:** tabletop system dropdown enumerates installed, validated rule-pack manifests from S04/C02, then a dependent edition/ruleset dropdown enumerates only installed compatible packs. Species/race/ancestry, class/role/profession, subclass/archetype/specialization and other descriptors are dynamically resolved from the selected pack's schemas and option catalogs; never hardcode D&D option lists. Changing system/edition invalidates incompatible selections with explicit notice, and reloading installed packs refreshes options. Empty/unavailable fields are hidden or disabled with explanation; classless systems show their actual field vocabulary. Existing character context is preselected and pinned to its pack version; portrait settings must not silently change character rules or edition. Prompt composer also offers editable age, hair, eyes, clothing/armor, equipment, expression, pose, background and visual style. Do not invent unsupported mechanics or lore as facts.
3. **Framing switch:** segmented **Headshot (Character Sheet)** / **Full Body (Artwork/Reference)**, default **Headshot** for new requests. Headshot prioritizes clear face and shoulders and sheet-friendly 1:1 crop; Full Body explicitly requests complete figure and a suitable taller aspect ratio. Both modes use the same installed SD3 Medium pipeline. User reviews prompt and starts generation. Show installed model, device mode, estimated resources if measured, progress/cancel and non-blocking failure recovery.
4. Preview generated result; **Use Portrait**, **Save to Library**, **Regenerate/Variation**, **Discard**. A generation never overwrites an existing portrait without confirmation.
5. Selected image is copied/linked through a host asset port with stable ID and metadata, then referenced by the character record via C01/C09. Preserve source image and crop metadata separately; sheet and print derive thumbnails.
6. Support **both headshot and full-body generation in the first portrait UI release**, with headshot as default and sheet attachment using a non-destructive crop. Consistent character variations are a future enhancement, not a V1 guarantee.

## 3. Engine boundaries and ownership

**C13 — Local Character Portrait Generation Engine** owns prompt assembly, model manifest and validation, capability assessment, job orchestration, inference adapter interface, seed/settings provenance, cancellation, output validation and user-facing diagnostics. **C13 does not own** rules calculations, the canonical character file, global asset storage, image editing UI, network access, PDF printing or the sheet layout engine.

- **C01** owns character portrait reference and revision-safe updates; do not embed large image bytes in canonical JSON.
- **C09/M02** render and crop selected portrait without changing its source asset.
- **M01** supplies available character choices/appearance, without coupling wizard completion to generation.
- **M04** reuses C13 for NPC portraits, with no second model implementation.
- **S15** parent shared asset contract (or standalone adapter) stores and retrieves user-owned generated/imported files, with safe filenames and content hashing.
- **S14/C11** handle print/export, using selected asset with missing-image fallback.
- **S04** identifies game system/edition and supported descriptors; rules packs never execute model code.

Pure TypeScript C13 contracts and prompt orchestration must not import Tauri, Svelte, filesystem, network, or model runtime. A host-side Windows inference adapter (possibly Rust process wrapper or isolated local worker) performs actual model execution and exposes a typed port. No cloud API or account dependency; model downloads, if supported, are explicitly user-initiated, verified, and never needed for normal app operation.

## 4. Proposed typed contracts (illustrative; refine during implementation)

- `PortraitCharacterContext { characterId, systemId, editionId?, species?, classOrRole?, background?, appearance?, style? }`
- `PortraitGenerationRequest { context, promptOverrides?, negativePrompt?, seed?, width, height, qualityPreset, modelId }`
- `PortraitModelManifest { id, version, license, componentFiles, sha256, totalParameters, diskBytes, minimumRamBytes?, minimumVramBytes?, supportedBackends, modelSource }`
- `PortraitJob { id, status: queued|running|completed|cancelled|failed, progress?, diagnostic?, outputAssetId? }`
- `PortraitInferencePort { listInstalledModels(), probeCapabilities(), generate(request, onProgress, cancellation), validateOutput() }`
- `PortraitAssetPort { importGeneratedImage(bytes, metadata), attachToCharacter(characterId, assetId, expectedRevision) }`

Keep generation and attachment as separate operations: cancelled or failed generation must never mutate a character. Persist optional seed/model/version/parameters/prompt metadata for reproducibility and user control, with an explicit option to exclude metadata on export.

## 5. Runtime, safety and licensing requirements

- **Offline by default and in operation:** no network calls, remote telemetry, model auto-downloads, accounts or API keys. Users opt in to obtaining/installing model weights; checksum verification and license acceptance are explicit.
- **Hardware:** target ordinary Windows PCs where practical; CPU fallback is desirable but not yet promised. Probe RAM/VRAM, CPU/GPU backend support and disk space; decline unsupported runs safely. Model installation is optional and removable.
- **Resource limits:** bounded image dimensions, generation concurrency default one, cancellation, memory/disk preflight, timeouts, temp cleanup and recovery after crash; generation runs off UI thread.
- **Content:** user-owned portraits only; no bundling copyrighted character art, protected franchise visual assets or unlicensed model weights. Review model licenses for commercial redistribution, derivatives, attribution, and offline distribution.
- **Security:** treat prompts and model packages as untrusted data; validated manifests and file paths; avoid arbitrary scripts from downloaded model bundles. Never pass private character notes into prompts without clear user control.
- **Privacy:** prompts, seeds, images and character metadata stay local. Provide delete and library management controls.
- **Accessibility:** keyboard-accessible controls, progress/status announcements, meaningful error states and text alternatives for selected portraits.

## 6. Candidate evaluation (research backlog, NOT selection)

**Primary:** Stable Diffusion 3 Medium (owner-approved model/pipeline; not yet approved for redistribution until license audit). Benchmark full pipeline disk/RAM/VRAM and optimize without degrading face quality. **Comparison history:** Sana 1.5 produced distorted faces in the owner's initial trial; keep as evaluation evidence, not the default. Verify SD3 license terms for intended commercial use/distribution, complete weights, Windows runtime, CPU/GPU compatibility, peak memory and performance. The previous 2B total-pipeline cap is superseded **only for this approved SD3 Medium pipeline**.

Benchmark a fixed prompt suite: elf ranger, human fighter, dwarf cleric, halfling rogue, a non-D&D investigator, a cyberpunk character and a System-Neutral homebrew archetype. Include multiple skin tones, ages, genders, attire and backgrounds. Score prompt adherence, anatomy, face quality, diversity, repeatability, time-to-image, peak RAM/VRAM, disk size and cancellation behavior. Record licenses and source revisions.

## 7. Build plan and acceptance gates

**C13-P0:** research/license/hardware spike; benchmark and license-audit the approved SD3 Medium full pipeline, record size/memory/performance and optimization tradeoffs; do not bundle weights until license and distribution rights are confirmed.

**C13-P1:** pure TS contracts, prompt builder and deterministic tests (no model dependency); System-Neutral and non-D&D tests required.

**C13-P2:** standalone local inference adapter with model manifest validation, Windows runtime capability probe, progress/cancel, disk/memory guardrails and offline smoke test.

**C13-P3:** S15 asset integration, portrait preview, Use Portrait/Discard, C01 revision-safe attachment, C09 rendering and C11 print/export fallback.

**C13-P4:** NPC integration, variations, portrait library management, performance tuning and parent Catalyst adapter.

**Definition of done:** with networking disabled, a supported Windows PC with an installed compliant model can generate a portrait, preview it, attach it to a character, save/reopen, print/export and remove it without corrupting the character; unsupported hardware and missing model produce actionable diagnostics; the SD3 Medium pipeline is optimized and measured against practical size/memory targets; licensing is documented; unit/integration/offline tests pass. No claim of completion before actual evidence.

## 8. Cross-reference

- `docs/architecture/016-CHARACTER-ENGINE-BUILD-PLAN.md` — C01–C12, M01–M04 and shared S15 ownership.
- `docs/design/CHARACTER-STUDIO-DASHBOARD-AND-WORKFLOW.md` — dashboard and creation UX.
- `AGENTS.md` — project-wide architecture, UI palette and agent constraints.
- Parent `Stormchyld2/Catalyst/docs/architecture/023-CATALYST-SHARED-AND-MODULE-ENGINES.md` — coordination source; parent document update is a separate task, not silently assumed complete.

## 9. Approved UI mockup implementation requirements (2026-11-23)

- Catalyst Obsidian/Charcoal/Gunmetal with Frost Blue controls; official logo assets only.
- Layout: character context and dynamically populated tabletop system → installed ruleset/edition → species → class/role → subclass/specialization, appearance details, Headshot/Full Body framing switch, aspect ratio/art style; center preview/variations; right generation controls, save actions, installed rule-pack summary.
- Ruleset dropdowns must read actual validated installed manifests/catalogs from the user's system files via existing S04/C02 interfaces and host adapters. Never present example systems in mockups as proof that those packs are installed.
- For a character already open, default selectors to the character's pinned system/edition and valid choices; edits in portrait composer affect prompts only unless user explicitly applies a character edit through C01.
- Class and subclass dependencies must refresh immediately; handle classless systems, empty catalogs, pack removal, and stale selections safely.
- Default **Headshot**; **Full Body** is a first-release option. Use separate prompts, framing and recommended aspect ratios; both remain editable.
- Generated image variants, Save to Character, Save to Library and Export Image are independent actions. No generation writes to canonical character data until user selects Save to Character.
