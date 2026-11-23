# 007 — Character Advancement, Multiclassing and Progression Architecture

**Product:** Catalyst Character Studio  
**Status:** Proposed implementation architecture — subject to owner review  
**Authority:** 010 Character Engine Build Plan & Ownership; 003 Character Data Model; 004 Rules Packs; 005 Calculation/Validation; 006 Guided and Manual Creation  
**Primary owners:** M03 Character Advancement; C04 Multiclass, Feature & Advancement Planner; integration with C01–C03, C05–C09, C12, and shared S04–S06.

## 1. Purpose and non-negotiable boundaries

Provide guided and manual character progression, including level-up, multiclassing, feature acquisition, feat/ability improvements, spell/power changes and non-level-based advancement. Progression is a **proposed, validated, previewed transaction** against the existing C01 character record, not an alternate character model.

No engine may silently mutate authoritative character files. C04/M03 are owned and tested here for later use in parent Catalyst. The parent injects file storage, event/permissions, dice and printing adapters. Do not duplicate S07 dice evaluation, S12/S13 PDF/sourcebook, S14 print or S01–S03 global storage.

## 2. Release order and prerequisites

Per approved 010, gameplay/advancement work follows successful C01 schema/roundtrip, S04–S06 + C02/C03 foundation, manual sheet MVP (C09/M02), and guided creator (M01). This document specifies the design now; implementation waits for those gates.

Required inputs: immutable character snapshot and revision; pinned system/edition/pack digests; validated progression definitions; available options and prerequisites; current authored state and overrides; explicit user choices. Missing packs produce diagnostics, not speculative advancement.

## 3. Rules-neutral progression vocabulary

Core engines do not assume `level`, `XP`, six ability scores, spell slots, or classes. Rules packs define:
- **Track:** progression identity, e.g., overall character, class, skill, reputation, milestone, narrative or point pool.
- **Rank/state:** typed current position or state on a track.
- **Transition:** permitted change from one state to another with prerequisites, costs and grants.
- **Grant:** feature, option, resource adjustment, field change or unlocked choice group.
- **Decision:** required or optional player selection at a transition.
- **Advancement event:** user-confirmed change with stable event ID, prior/new states, rules provenance, timestamps and explanation.

Multiple simultaneous tracks are allowed. A system may support advancement with no numeric level. Progression definitions are declarative and versioned under S04; prerequisite and cost logic uses S05/S06, never arbitrary scripts.

## 4. D&D edition profiles

- **D&D 5e (2014)** and **D&D 5.5e (2024 Edition)** have separate pinned progression rules and option references.
- The 2014 edition remains the configured default for *new* D&D characters; changing the default does not reinterpret an existing character.
- Initial distributable content target per 010 is System-Neutral plus appropriately licensed SRD 5.2.1 (2024). Full 2014 guided progression must not be advertised until the requisite licensed pack exists.
- Rules packs define class advancement tables, subclasses, feats/ability score improvements, spellcasting changes, multiclass prerequisites and grants, and other edition-specific details. Do not hardcode the timing of these benefits or assume a rule shared across editions.

A multiclass character retains separate track identities and advancement records for each class. Any aggregate level, proficiency or spellcasting result is calculated by the pinned rules, not duplicated as an authoritative value.

## 5. M03 user workflow

The character sheet offers **Advance Character** only when an eligible rules profile supports it; manual characters can use **Record Manual Advancement** without installing a pack.

1. Select a progression track and proposed transition (or manual milestone).
2. Display eligibility, requirements, available choices and relevant source citations.
3. Open a resumable advancement draft; preserve the original committed character.
4. Collect choices (new class/subclass, features, feats, abilities, spells, resources, equipment or other pack-defined decisions).
5. Preview changes with before/after values, new/removed features, unresolved requirements, resource consequences and warnings.
6. Confirm the transition explicitly.
7. Commit via application use case with optimistic revision check, authoritative record update and audit/history linkage.
8. Refresh the interactive sheet from the committed C01 record.

Users can backtrack through the advancement draft without altering the committed character. Cancel leaves the committed character unchanged.

## 6. C04 planning and dependencies

C04 receives the resolved S04 rules context, C01 snapshot, proposed track transition and candidate choices. It:
- Builds a deterministic dependency graph of grants, prerequisites and affected fields.
- Queries S06 for choice eligibility and S05 for derived before/after values.
- Coordinates C02 option discovery and C03 completeness/legality checks.
- Produces a structured `AdvancementPlan` with pending decisions, proposed state changes, source IDs, and diagnostics.
- Never saves files, rolls dice or changes the source snapshot.

Class features, proficiencies, spell changes and equipment effects are referenced by stable IDs and reconciled with C05/C06; resource maximum changes are evaluated with C07 without silently rewriting consumed current values. Rules packs specify whether increases preserve current deficits, restore capacity or require another policy. If undefined, block automatic application and ask for an explicit decision.

## 7. Multiclassing

Multiclassing is a rules-declared transition, not a special hardcoded schema. For supporting systems:
- Check entry prerequisites, class limits, advancement costs and permitted combinations.
- Track each class's independent progression state and grants.
- Resolve aggregate derived statistics through S05, including any multiclass-specific tables or combination rules declared by the edition.
- Preview newly available, suppressed, replaced and conflicting features.
- Preserve stable identities for previously earned grants.
- Show why an option is unavailable and cite the responsible rule when present.

Changing class allocation or removing a level after commitment is a **respec/reconciliation** operation with its own impact preview; it is not ordinary undo.

## 8. Ability improvements, feats and optional choices

An advancement decision may offer mutually exclusive alternatives such as a feat or ability increase, or a rules-defined combination. S06 validates budgets, caps, prerequisite timing and exclusivity. No automatic selection is committed unless explicitly defined as an automatic grant.

Changing an earlier choice must identify affected downstream selections and require confirmation before invalidating them. Rejected or superseded selections remain recoverable in history when permitted by C12.

## 9. Spells, powers, equipment and resources

C04 coordinates with specialized character engines rather than reimplementing them:
- **C05:** known/prepared spell or power grants, swaps and eligibility.
- **C06:** equipment grants, proficiencies, loadout consequences and dependent modifiers.
- **C07:** HP, recovery, conditions, resource capacity and rules-defined refresh transitions.
- **C08:** action definitions and roll bindings to the parent S07 port; no dice rolls occur during advancement.
- **C09/M02:** updated sheet bindings and view models after commit.
- **C10:** source citations via the parent sourcebook contract.

Every proposed change is represented as an explicit patch with source attribution; effects requiring a choice remain pending rather than guessed.

## 10. Preview, validation and transaction semantics

The advancement engine returns a typed, immutable proposal containing:
- `proposalId`, `characterId`, `baseRevision`, rules-context digest, target track/transition.
- Player selections, proposed patch, new grants/removals, affected dependencies and resource deltas.
- Before/after computed summaries, unresolved values, blocking errors and advisory warnings.
- Source references and migration/compatibility notices.

**Commit preconditions:** matching character ID and revision, same pinned rules context, valid proposal/choices, no blocking diagnostics, authorized actor, and explicit confirmation.

The application layer revalidates the proposal against the latest committed record before writing. On stale revision or changed pack digest, reject and offer recomputation; never silently rebase a previously approved proposal. Apply record update and advancement history atomically through the host repository transaction contract. If an adapter cannot provide an atomic multi-file transaction, use a single authoritative character aggregate and recoverable write protocol; do not claim transactional guarantees that the adapter cannot meet.

Retries must be idempotent by proposal/commit ID. Failed writes leave the previous record recoverable. Derived calculations are rebuilt, not treated as saved authority.

## 11. History, undo, rollback and respec

C01 stores authoritative advancement records; C12 provides history/diff/reconciliation. Distinguish:
- **Cancel draft:** discard uncommitted proposed changes, no history event.
- **Undo pending choice:** revert within an uncommitted advancement draft.
- **Revert committed transition:** new compensating, validated event; preserve original history.
- **Respec:** explicit revisioned plan that may invalidate later grants, spells, equipment or features; preview and confirm.
- **Rules-pack upgrade/edition conversion:** separate migration process with backup and compatibility report; never implicit during advancement.

A committed advancement event records stable event ID, actor (if known), confirmation time, prior/new revision, track change, selected options, pack identities/digests, and structured change summary. History is auditable but not assumed to be full event sourcing. Parent S09/S10 event/visibility contracts may supplement the local history without becoming its storage authority.

## 12. Missing content, manual overrides and failure behavior

- Missing pinned pack: preserve character and advancement draft; display unavailable rules and block rules-driven commit until repaired.
- Manual/hybrid: allow explicit manual progression records while identifying mechanically unverified choices.
- Overrides: preserve authored override provenance and show both computed and effective before/after values; flag new conflicts.
- Unsupported schema or malformed pack: reject unsafe evaluation and avoid partial writes.
- Aborted application or failed save: recover last committed character and latest valid advancement checkpoint.
- Unsupported edition conversion: do not offer it as a level-up shortcut.

## 13. Proposed pure interfaces (illustrative)

```ts
interface AdvancementPlanner {
  listTransitions(input: TransitionQuery): TransitionListResult;
  propose(input: AdvancementRequest): AdvancementProposalResult;
  validate(input: AdvancementValidationRequest): ValidationReport;
  diff(input: AdvancementDiffRequest): AdvancementDiff;
}

interface AdvancementApplicationService {
  commit(input: ConfirmedAdvancementRequest): Promise<CommitResult>;
}
```

`AdvancementPlanner` belongs to the pure C04 engine; `AdvancementApplicationService` coordinates persistence, authorization and history via injected ports. Concrete DTOs, error unions and patch semantics must be finalized with C01/C03/C12 before implementation.

## 14. Acceptance tests

1. A System-Neutral manual character records a milestone without gaining an implicit D&D level.
2. A valid 2024 SRD fixture advances through its pack-defined track and required choices.
3. A 2014-only advancement option is unavailable to a 2024 character and vice versa.
4. Multiclass eligibility and aggregate calculations follow pinned pack definitions, not hardcoded assumptions.
5. A prerequisite failure returns actionable diagnostics and prevents guided commit.
6. A missing feat/ability/spell choice remains pending and blocks completion only when required.
7. Before/after preview identifies changes to features, resources and derived values with source attribution.
8. A failed or canceled proposal leaves the committed character byte-for-byte unchanged.
9. A stale base revision or changed pack digest rejects commit without overwriting data.
10. Repeated confirmation of one proposal cannot grant a feature or level twice.
11. Resource maximum changes respect explicit pack policy and preserve current state where required.
12. A manual override survives advancement and conflicts are visible.
13. A respec previews downstream invalidations and requires separate confirmation.
14. Revert creates a compensating event and retains the original advancement history.
15. Missing pack and corrupt draft recovery preserve the last valid character.
16. Domain planner tests run offline without Svelte, Tauri, PDF, dice evaluation, or filesystem dependencies.

## 15. Implementation gates

Before coding M03/C04:
- C01 record and revision/migration contract passes C01-M1.
- S04/S05/S06 and C02/C03 expose stable typed contracts with edition-specific test fixtures.
- C05–C07 define grant/resource transition APIs used by advancement.
- C12 history event and reconciliation semantics are finalized.
- Explicit patch/commit idempotency and recoverable persistence protocol are tested.
- Confirm licensed content and source citations for any bundled advancement tables.

**Architectural rule:** Advancement is a reviewable transaction over a pinned character and rules context; it never silently rewrites a character, rolls dice, or substitutes another edition.
