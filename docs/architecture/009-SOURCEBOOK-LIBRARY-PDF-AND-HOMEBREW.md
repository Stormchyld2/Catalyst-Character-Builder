# 009 — RPG Sourcebook Library: PDF and Homebrew Content Architecture

**Status:** Approved target; implementation not yet started
**Product:** Catalyst RPG Sourcebook Library, reusable across Character Studio and the parent Catalyst application
**Primary input:** PDF; secondary: EPUB, Markdown, plain text and structured rules-pack JSON/YAML
**Principle:** User-owned local files, offline reading/search and explicit separation of **book content** from **executable rules data**.

## 1. Goal

Allow users to import legally obtained digital rulebooks, player supplements, character option guides, campaign settings, bestiaries, adventures, spell collections, third-party expansions and homebrew materials. Preserve originals and access locally without cloud accounts or upload requirements.

PDFs are first-class: imported through file picker or drag/drop, organized into libraries by game system/edition, publisher, type, campaign and user tags. Default import policy is configurable **copy into managed local library** or **link to existing file**; linked files missing later should show a repair action rather than data loss. Deduplicate by content hash only after verifying identity; do not merge different editions based on filename/title.

## 2. Integrated PDF reader

- Open PDFs inside Catalyst with navigation, page thumbnails, table-of-contents/outlines when provided, zoom, fit width/page, jump to page, keyboard search and selectable text where present.
- Text layer: per-book search with highlighted matches; full offline cross-book text search using a disposable/rebuildable index; cite book title, edition, document ID and PDF page index + printed page label when known.
- Scanned PDFs: identify image-only pages and offer **opt-in local OCR** with preview and text correction. OCR-derived words must be marked as lower-confidence and are not automatically trusted as rule data.
- Bookmarks, tags, highlights and notes should be stored in portable **sidecar JSON/YAML/Markdown** keyed by document stable ID, page geometry and optional quote fingerprints; never modify the original PDF as an unintended side effect.
- Optional full-text search index must be completely rebuildable. No authoritative SQLite book contents. Images and embedded assets stay local.
- User-configured PDF renderer: evaluate PDF.js for an offline bundled viewer, ensuring compatible licensing and dependencies before integration. No remote CDN or external tracking.
- Accessibility: keyboard controls, text selection, reflow or accessible extracted-text view where source permits.

## 3. Sourcebook metadata

Store stable sourcebook ID, display name, edition, system, publisher, author, optional ISBN/identifier, source URL, purchase/import notes, copyright/license as declared by user, original file hash, import mode, relative or external safe path, file type, tags, page-label metadata and timestamps.

**Ownership is not equivalent to redistribution permission.** Books imported from DriveThruRPG, Wizards/D&D publishers or independent creators may be read locally where the user's access rights permit, but the software must not upload, redistribute, bundle, publicly host or generate shareable copies of the copyrighted text by default.

Do not attempt DRM removal or bypass. If a protected file cannot be opened, explain limitations and permit a supported unprotected lawful copy instead.

## 4. Character Studio reference integration

The Character Builder shows an optional **View Source** action beside classes, species, backgrounds, feats, spells, equipment and mechanics when linked to an imported book or permitted local pack. This opens the PDF viewer at the linked page with book title and edition.

The sourcebook reader and content rules pack manager remain separate:
1. **PDF library:** browsing/searching/annotations is useful even without parsing mechanics.
2. **Structured rules packs:** validated character choices, attributes, prerequisites, spell and equipment catalogs must be declared in a versioned data format and sourced to a user-approved edition.
3. **Bridge/import assistant:** extracts candidate text and fields from allowed accessible pages for user review, maps them to explicit rule objects, validates prerequisites/math/licensing and only publishes content to a local personal rules pack after approval.

The bridge must never automatically activate extracted rules or silently change existing characters. Locally OCR'd text can be wrong. Show confidence/uncertainty, original quoted snippets only within user-local UI, page attribution and a side-by-side validation workflow. Parsed rules should be rechecked against the source before acceptance.

## 5. Homebrew and third-party material

Accept any lawfully held local PDF as a **readable reference**, irrespective of whether Catalyst understands the game system. Imported structured third-party packs must validate against the pack schema. Allow users to author their own character classes, species, features, spells, gear and house rules manually, including content derived from personal references where permitted.

**Sharing/export is a separate explicit action** with license warnings and per-content inclusion controls. Never assume material in a user's imported PDFs is freely redistributable. Do not scrape or integrate paid-content DRM systems without authorization.

## 6. Shared-engine architecture

Sourcebook functionality must be available as reusable services:
- `SourcebookRepositoryPort`: add/link/unlink/find/version and metadata.
- `DocumentRenderPort`: open page, page dimensions, selectable text, optional thumbnails.
- `TextExtractionPort`: extract embedded text, optional local OCR with provenance.
- `SearchIndexPort`: per-book and cross-book local search, disposable index.
- `AnnotationPort`: persist user sidecar annotations/bookmarks.
- `SourceCitationPort`: stable IDs, sourcebook edition, printed/page index mappings.
- `RulesImportPort`: reviewable candidate options, explicit approval and validated pack write.

Character Studio UI consumes these services. Parent Catalyst can reuse the same services from World Builder, Adventure Studio, GM Console, Encounter Builder and Print Studio. The sourcebook library must not depend on or start the standalone Character Studio UI.

## 7. Release phases

1. **MVP:** import/link PDFs, local library organization, integrated reader, page navigation, per-book text search, bookmarks, no DRM bypass.
2. **Search:** rebuildable full-library index, filters, annotations, stable page references and character-option View Source links.
3. **Homebrew:** structured personal pack editor, author-managed links to pages and source attribution.
4. **Extraction assistant:** optional local text extraction, OCR of image PDFs, reviewed field mapping, safe data validation.
5. **Parent Catalyst integration:** use same sourcebook library/engines across GM, maps, adventures, characters and future Android reader.

## 8. Acceptance tests

- Import a text PDF, reopen offline, navigate bookmarks, search and display correct page.
- Import a scanned PDF: reader works; search shows no fabricated text until local OCR succeeds.
- Cross-library search index can be deleted and rebuilt without losing books/annotations.
- Linked file moved or missing displays a repairable state and does not erase metadata.
- Duplicate filenames with different bytes do not collide.
- Book PDF remains unchanged after bookmarking/highlighting.
- Character option source link resolves to expected book ID/page and edition.
- Invalid extracted rule candidate cannot change a character or active rules pack.
- No network calls, paid-content redistribution, unauthorized DRM circumvention or bundling of imported books in app releases.

## Personal-use content policy

Owner-approved personal-use policy (2026-11-24): Catalyst Character Studio is for the owner's private use only, with no planned commercial release or redistribution. Target comprehensive rules coverage, including lawful local sourcebooks and structured datasets, not SRD-only coverage. Commercial redistribution permission is not a gate for the owner's local installation; applicable access, copying, conversion and software-license terms still apply. Keep proprietary books, extracted data, assets and private packs outside tracked Git files, shared CI fixtures and public artifacts; use synthetic or appropriately licensed fixtures in Git. Do not bypass DRM or access controls. Record source provenance and validate imported data. Do not impose commercial licensing negotiations on lawful local use. Any future redistribution requires a separate owner decision and rights review.

## Local content storage safeguard

Owner-approved public-repository safeguard: copyrighted sourcebook PDFs, restricted extracted rules data and restricted artwork must remain outside both Git working trees, in an owner-selected local content root (recommended Windows Desktop/Catalyst Content, organized by system/edition). Resolve the actual folder through user selection, never hardcode a username or Desktop path. Store local paths in untracked local settings; do not upload private content to GitHub, CI, logs or shared artifacts. A future private repository does not automatically authorize upload; require explicit owner approval and applicable rights. Keep local content separate from distributable code.
