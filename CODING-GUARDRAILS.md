# Coding Guardrails

How to write code in this repo. `AGENTS.md` says *what* to build and *where* it lives; this file says *how much* code to write. When in doubt, write less.

## The default: simplest thing that works

1. **Solve the stated task, nothing more.** No unrequested features, options, flags, hooks or "future-proofing." If something seems missing, mention it in your summary instead of building it.
2. **Edit before you add.** Put new code in the existing file that already handles that concern. Do not create a new file, module, package or folder unless the existing one would clearly become unreadable (roughly 400+ lines) or the task explicitly asks for it.
3. **No abstraction until it is used three times.** Write it inline once, copy it a second time, extract a helper on the third use. This applies to helpers, base classes, factories, wrappers, registries, strategy objects, generic types and config tables.
4. **No speculative layers.** The architecture boundaries in `AGENTS.md` (pure core, ports for host services) are real and required. Inside those boundaries, do not add extra layers: no service-that-calls-a-manager-that-calls-a-helper, no interface with a single implementation unless it is a host port named in the architecture docs, no dependency injection for pure functions.
5. **Plain functions and plain data.** Prefer a function over a class, an object literal over a builder, a `switch` over a plugin map, a direct import over an index re-export chain. Use generics only when two or more real call sites need different types today.
6. **No speculative config.** Hard-code values that have one caller. Add a setting, constant file or options parameter only when there is a second, actual use.

## Keep diffs small

- Touch only the lines the task needs. Do not rename, reformat, reorder imports or "tidy up" unrelated code.
- Match the surrounding style exactly (naming, formatting, error style, file layout), even if you would do it differently.
- One concern per change. If you notice another problem, note it; do not fix it in the same diff.
- Delete dead code you created. Do not leave commented-out code, TODO scaffolding or empty stubs "for later."

## Comments and docs

- Code should read clearly without comments. Comment only *why* something non-obvious is done (a rule citation, an edge case, a workaround), never *what* a line does.
- No JSDoc on every function, no banner comments, no restating the type signature.
- Update existing docs only when behavior changes. Do not create new markdown files to describe your change; put that in the PR summary.

## Verify, then report honestly

- Run the narrowest check that proves the change: the affected test file (`node --test packages/<pkg>/test/<file>.test.ts`) and `npm run typecheck`. Run the full suite before opening a PR.
- Add a test only for new behavior or a fixed bug, in the existing test file for that package. One clear test beats five overlapping ones.
- Summaries list what changed, which commands ran, and whether they passed. If you did not run something, say so. Never describe stubs, plans or unrun tests as working.

## Quick self-check before submitting

- Could this be done with fewer files? Fewer functions? Fewer lines?
- Did I add anything the task did not ask for?
- Is every new abstraction used at least three times?
- Would a reviewer understand the diff in under two minutes?

If any answer is wrong, simplify before submitting.
