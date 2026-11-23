# 005 — Calculation, Conditions, and Validation Engines

**Product:** Catalyst Character Studio  
**Status:** Proposed architecture baseline — subject to owner review  
**Depends on:** 001–004; coordinates with 006–009  
**Primary goal:** Deterministic, explainable, rules-neutral calculation and validation services reusable by Character Studio and parent Catalyst.

## 1. Responsibilities and boundaries

Three independently testable domain packages collaborate:
- **Calculation Engine:** Evaluates declared derived values, modifiers, caps, replacements, and dependencies; returns values with traces and diagnostics.
- **Conditions/Effects Engine:** Resolves active effect instances, durations, scopes, suppression, and stacking into declarative modifiers and action restrictions.
- **Validation Engine:** Checks character structure, pack compatibility, choice prerequisites, resource transitions, and legal state transitions; returns structured findings.

The engines consume immutable snapshots of a character, rules context, and optional explicit encounter/session inputs. They never save files, mutate character documents, access Svelte/Tauri/Rust, read clocks implicitly, access the network, or run arbitrary user scripts.

The rules pack, not engine code, defines D&D ability modifiers, armor class, proficiency, spell DCs, action economy, and edition-specific interpretations.

## 2. Deterministic evaluation context

Every evaluation request includes:
- Character ID and revision or immutable draft snapshot.
- Exact system ID, edition ID, resolved pack IDs/versions/digests, and approved overlays.
- Authored base values, selections, equipped items, active conditions/effects, explicit manual overrides.
- Optional scenario context (e.g., action, target, environment, campaign configuration).
- Explicit evaluation instant/turn index when duration semantics require it.
- Engine/schema version and requested output keys.

A canonical context digest keys disposable caches. Caches cannot be authoritative; an absent cache must not change results. Evaluation must not roll dice: randomness is represented as a typed dice expression or probability descriptor until a separate dice service receives an explicit RNG.

## 3. Typed declarative expression language

Rules packs contain validated abstract syntax trees (AST), not executable JavaScript, Rust, SQL, or template code. The initial expression vocabulary should include:
- Literals: integer/decimal, boolean, string, typed reference, bounded list.
- References to declared character fields, selection counts, progression tracks, context values, and resource values.
- Arithmetic: add, subtract, multiply, divide (with explicit zero handling), floor/ceil/round, min/max/clamp.
- Comparisons and boolean operators with short-circuit semantics.
- Conditional branches and bounded collection aggregates (count, sum, any, all) over schema-declared collections.
- Dice-expression values as *data* (e.g., `2d6+3`), not implicit random results.

No arbitrary loops, recursion, filesystem access, network access, reflection, dynamic imports, or user-defined executable functions. Pack validation rejects unknown operators, mismatched types, unresolved references, dependency cycles, and expressions exceeding depth/node/collection budgets. Numeric precision, overflow behavior, division, rounding, and dice grammar must be versioned in the interpreter specification before implementation.

## 4. Calculation dependency graph

1. Resolve the exact pinned rules context (004).
2. Validate referenced fields and expressions.
3. Build a directed dependency graph for requested outputs.
4. Reject or diagnose cycles, missing inputs, and incompatible value types.
5. Evaluate in deterministic topological order.
6. Collect applicable effect/modifier contributions.
7. Apply declared precedence, stacking, and override policies.
8. Return typed results, calculation traces, and diagnostics.

Stable IDs, not file enumeration order, break ties. Evaluation is side-effect free. If a critical dependency fails, its derived result is `unresolved`, not an invented default such as zero. Partial results may be returned with clearly scoped errors.

## 5. Modifier semantics and precedence

Represent each modifier with:
- Stable modifier ID and source reference (pack/option/feature/item/condition/house rule).
- Target field or rule path, operation (`add`, `multiply`, `replace`, `min`, `max`, `cap`, or declared custom primitive).
- Typed operand expression, activation predicate, scope, stacking group, and priority.
- Explicit edition compatibility and optional duration.

There is **no universal D&D stacking rule** in the engine. Each rules profile declares which modifier groups stack, select highest/lowest, are mutually exclusive, or are suppressed. Replacement conflicts without a declared deterministic policy are errors, not implicit last-write-wins. Priority is meaningful only within an explicitly permitted rule operation and never authorizes one pack to overwrite another pack silently (004).

Define an evaluation pipeline with distinguishable stages: authored base → resolved applicable rule contributions → rules-defined caps/floors → effective computed value → explicit user override/display result. The exact order for a field can be defined by its validated rule specification; traces must show the order actually used.

## 6. Manual overrides

Overrides are authored data from 003, not rewritten rule definitions. Each override has a target, mode (replacement or adjustment), active flag, optional reason, provenance, and optional scope. The engine returns both the **computed** and **effective** values, plus an `overridden` indicator and trace.

A user can turn an override off without losing its record. Override application cannot erase the underlying calculation, and changes to packs or conditions cannot silently remove an override. If an override violates a hard invariant, validation reports it and the UI must show the conflict. Whether a manual/hybrid sheet permits displaying a non-rules-legal value is a policy choice; structural integrity is always enforced, while rules legality can be advisory in manual mode.

## 7. Conditions and effects

Conditions are typed, source-attributed instances with unique IDs, status (active/inactive/suppressed), start/expiry or turn-based timing, scope, stacking identity, and optional linked resource or concentration-like constraints.

The engine distinguishes:
- **Condition definition:** rules-pack data describing meaning and consequences.
- **Condition instance:** character/session state indicating that a particular effect applies.
- **Resolved effect:** the computed modifiers, restrictions, and annotations currently active.

Durations are evaluated only against supplied time/turn context. Real-time expiration is not assumed in an offline character sheet. Multiple sources of the same condition must be representable. Stacking, immunity, resistance, suppression, dispelling, and removal behavior are edition/rules-defined.

Examples such as advantage/disadvantage, exhaustion, frightened, prone, concentration, and temporary hit points belong to D&D packs, not hardcoded core enums. A condition may restrict an action without changing a numeric field; return action-availability diagnostics separately.

## 8. Resources and state transitions

Resource pools (HP, spell slots, stamina, mana, charges, etc.) use typed current/maximum/minimum state and rules-defined refresh behavior. Maxima may be derived; current consumption remains authored session state.

A resource operation is proposed then validated, not applied during calculation. Example commands: spend, restore, set, reset, damage, heal, or rules-defined custom action. Validate bounds, costs, eligibility, and edition-specific semantics; return a preview of state changes and diagnostics. Persist only after the user or an authorized application workflow confirms. Do not silently clamp invalid authored values unless the rules explicitly require it and the UI reports the transformation.

## 9. Validation categories and severity

The Validation Engine reports machine-readable issues with:
- `code`, `severity` (`error`, `warning`, `info`), affected stable ID/path, source/rule citation, message key and parameters, optional remediation, and blocking context.
- **Structural validation:** schema, IDs, value types, reference integrity, supported version.
- **Pack validation:** dependencies, edition, license metadata, expression safety, conflict declarations.
- **Creation validation:** required choices, prerequisites, mutually exclusive options, budgets/allocations.
- **Advancement validation:** progression eligibility, selections, track transitions, multiclass rules where applicable.
- **Session validation:** resource costs, conditions, action availability, transition legality.
- **Import/migration validation:** missing references, incompatible upgrades, lossy transformations.

Structural corruption and unsafe pack execution are always blocking. Rules-incomplete drafts are permitted; guided completion gates can block finalization. Manual/hybrid characters may intentionally be rules-incomplete with visible warnings. Never conflate “valid file” with “legal character under this edition.”

## 10. 2014 versus 2024 edition isolation

- **D&D 5e (2014)** is the application default for newly created D&D characters.
- **D&D 5.5e (2024 Edition)** is separately selectable.
- Every evaluation uses the character's pinned edition and exact pack versions/digests.
- Different edition definitions for class features, background options, feats, proficiency, spells, conditions, or progression are not merged implicitly.
- Switching the default in Settings cannot change an existing character's calculations.
- Edition conversion must be a distinct previewed, confirmed, backed-up migration; not a calculation side effect.

Reference tests should include mechanically different 2014 and 2024 fixtures and assert each follows its own pack rules. Do not claim full official rule coverage until licensed content inventory and fixtures are verified.

## 11. Explainability and diagnostics

For every derived output, expose a structured trace:
- Requested output key, base/input values, each applied or suppressed modifier with source ID and reason.
- Expression and intermediate results (in human-readable form where feasible).
- Final computed value, effective overridden value (if any), and diagnostics.
- Exact rules context and version/digest provenance.
- Optional sourcebook citation that opens architecture 009's reader; absence of a PDF must not prevent rules evaluation.

Traces are domain data, not preformatted Svelte markup. They can power tooltips, “Why is this value X?” panels, debug reports, and future GM Console integrations.

## 12. Proposed engine interfaces (illustrative)

```ts
type EvaluationResult<T> = {
  status: "resolved" | "partial" | "unresolved";
  values: Readonly<Record<string, T>>;
  traces: readonly CalculationTrace[];
  diagnostics: readonly Diagnostic[];
  contextDigest: string;
};

interface CalculationEngine {
  evaluate(request: EvaluationRequest): EvaluationResult<unknown>;
}

interface ConditionsEngine {
  resolve(request: EffectResolutionRequest): EffectResolutionResult;
}

interface ValidationEngine {
  validateCharacter(request: CharacterValidationRequest): ValidationReport;
  validateChoice(request: ChoiceValidationRequest): ValidationReport;
  validateTransition(request: TransitionValidationRequest): ValidationReport;
}
```

These are conceptual signatures only; 003/004 schemas and 006/007 use cases must settle exact types. `unknown` must not remain in production public contracts.

## 13. Performance and offline requirements

Evaluation must run offline, without filesystem or network access in domain packages. Memoize immutable context results when useful, with explicit invalidation by revision, rules digest, and scenario context. Prefer incremental recomputation for interactive sheets, but correctness comes before optimization. Define measurable performance budgets using representative character fixtures during implementation; avoid inventing untested latency guarantees.

Guard against malicious packs with strict parser and evaluator limits, bounded memory, and actionable errors. All engines must be testable in a plain TypeScript runtime without Svelte/Tauri.

## 14. Test fixtures and acceptance criteria

1. Same character/context/rules produces byte-equivalent canonical results and trace ordering across repeated runs.
2. Equivalent packs loaded in different filesystem orders resolve identically.
3. A missing dependency yields `unresolved`, never an invented numeric default.
4. A cyclic or unbounded expression fails validation safely.
5. Modifier stacking, suppression, cap, replacement, and priority follow declared rules; undeclared conflicts are errors.
6. Manual override preserves computed result and can be disabled without data loss.
7. Multiple condition instances with different sources/durations resolve deterministically.
8. Explicit turn/time changes expire effects only when rule-defined.
9. Resource spending produces a preview and cannot mutate the character until confirmed.
10. Guided creation blocks missing required choices; manual mode preserves intentionally incomplete data with warnings.
11. 2014 and 2024 fixtures use their own pinned rule definitions and produce edition-appropriate outcomes.
12. Switching the application's default edition does not change existing character results.
13. A malicious/oversized pack is rejected within configured evaluation budgets.
14. Trace source links resolve to the expected rule/option and optional sourcebook citation.
15. Engines execute unit tests without network, Svelte, Tauri, Rust, or local storage access.

## 15. Follow-up decisions

- **006:** choice validation timing, draft incompleteness, builder error UX.
- **007:** advancement transaction previews, rest/reset operations, undo and respec.
- **008:** sheet bindings, computed/effective display, explanation affordances.
- **010:** persistence of manual overrides, condition instances, and session state.
- **014:** property-based testing, edition fixture suites, performance budgets, fuzzing and regression gates.

**Non-negotiable:** Engines calculate and explain; they do not silently mutate authoritative character data.
