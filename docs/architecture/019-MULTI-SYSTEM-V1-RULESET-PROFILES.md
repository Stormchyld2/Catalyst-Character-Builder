# 019 — Multi-system V1 ruleset profiles

Status: owner-approved release scope, implementation pending. This document supersedes earlier statements that defer Pathfinder, Call of Cthulhu or Warhammer Fantasy Roleplay beyond V1. The existing engine-first sequence and ownership in 016 and AGENTS.md remain controlling.

## Release scope and sequence

| Profile | Edition | Implementation order |
|---|---|---|
| System-Neutral | Manual | Foundation |
| D&D | 2014 and 2024, separate pinned profiles | First game family |
| Pathfinder | Second Edition Remastered | Second |
| Call of Cthulhu | Seventh Edition | Third |
| Warhammer Fantasy Roleplay | Fourth Edition | Fourth |

D&D 2014 remains the default for new characters; the first licensed structured fixture may still be 2024 SRD. Pathfinder 1e and Warhammer 40K systems are deferred. Profile support is distinct from installed licensed content. Never silently substitute editions. Each family must pass its headless engine gates before production UI; no parallel duplicate implementations.

## Profile requirements

- D&D: species/race, background, class/subclass, ability generation, skills, equipment, spells, level and multiclass progression, HP, rests and conditions; isolate 2014 and 2024 mechanics.
- Pathfinder 2e Remastered: ancestry, heritage, background, class, attribute boosts, trained skills and proficiency ranks, feats by category, equipment, spell traditions and preparation, focus resources, three-action economy, degrees of success, level progression and archetypes. Do not equate archetypes with D&D multiclass levels. Remaster and legacy content must be explicitly compatible and sourced.
- Call of Cthulhu 7e: investigator identity, eight characteristics, occupation and personal-interest skill allocations, derived HP, magic points, sanity, luck, build and damage bonus; percentile checks with regular/hard/extreme thresholds, bonus/penalty dice, pushed rolls where permitted, improvement checks, sanity and injury state. No mandatory class, species selection, level or spell slots. Occupation budgets and advancement must be pack-defined; optional variants explicitly enabled.
- WFRP 4e: species, career class, career and career tier, characteristics, skills, talents, trappings, wounds, fate/fortune, resilience/resolve, corruption and conditions; percentile tests, success levels, opposed tests and XP expenditure for advances and career transitions. Optional rules and errata must be pinned; do not assume D&D levels or universal recovery rules.

These are capability requirements, not a substitute for verified edition-specific rules or a license to reproduce books.

## Reuse and boundaries

C01 retains one canonical record with namespaced values, selections, progression and resources. S04 validates/pins data-only packs; S05 handles bounded formulas and modifiers; S06 handles choices and prerequisites. C02/C03 resolve catalogs and legality. C04 handles level, skill improvement and XP/career proposals using existing transaction/history contracts. C05–C07 manage pack-defined powers, equipment and resources; C08 binds checks to parent S07 (including percentile outcomes); C09 binds profile-specific sheet templates. C10–C12 retain source links, export and history. C13/M22 reuse portrait/token services. Extend existing contracts only where actual fixtures demonstrate a gap; no new per-system engine families, arbitrary pack scripts or duplicate dice/storage services. Audit actual code and tests before implementation.

## UX and artwork

M01 uses pack-defined workflow steps, labels, prerequisites and review; M02 uses profile-specific sheet templates; M03 exposes appropriate progression actions. Hide irrelevant mechanics rather than displaying empty D&D sections. Preserve the shared Catalyst shell and accessibility rules. Keep the 13 approved full-color fantasy class medallions, reuse equivalent archetypes through explicit pack artwork mappings, inherit parent artwork for subclasses, and support optional custom art. Pathfinder-specific emblems, Cthulhu occupation-category emblems and WFRP eight career-class emblems are planned content assets, not mechanical identifiers. Cthulhu uses period-appropriate bronze/Art Deco styling; WFRP may use weathered fantasy styling. No individual subclass or occupation artwork requirement. Missing artwork never blocks creation; use a neutral fallback. Artwork rights and exact asset inventory must be verified before packaging.

## Content and licensing gate

Maintain per-pack source/version, rights basis, attribution, permitted distribution and asset provenance. Verify exact D&D SRD Creative Commons terms, Pathfinder ORC/OGL terms by source, and Chaosium/Cubicle 7/Games Workshop permissions as applicable. Do not presume proprietary occupation/career catalogs, official sheets, logos or book text may be bundled. Separate lawful local user content from distributable starter packs. If rights are unavailable, retain generic engine capability and lawful manual/user-authored workflows; disclose limitations and do not advertise complete guided support. Full V1 target is not met until each profile's agreed lawful content and functional scope passes review, or the owner explicitly approves a revised release scope.

## Acceptance gates

For each edition: validated pack install/pin, guided and manual creation, deterministic calculation and eligibility fixtures checked against lawful references, draft interruption/reopen, advancement preview/commit/idempotency, resource and condition transitions, shared dice binding, sheet/print parity, native export/import roundtrip, missing-pack recovery and offline Windows smoke test. Include negative fixtures for cross-edition contamination, invalid skill/XP budgets, stale revisions, missing content and malicious packs. Verify D&D level grants, Pathfinder proficiency/feat eligibility and degree-of-success outcomes, Cthulhu occupation allocations and skill improvement, WFRP career transitions and XP expenditure. No release claims from architecture alone.
