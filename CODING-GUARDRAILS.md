# Coding Guardrails

How to write code in this repo. `AGENTS.md` says *what* to build and *where* it lives; this file says *how much* code to write. When in doubt, write less.

## The default: simplest thing that works

1. **Solve the stated task, nothing more.** No unrequested features, options, flags, hooks or "future-proofing." If something seems missing, mention it in your summary instead of building it.
2. **Edit before you add.** Put new code in the existing file that already handles that concern. Do not create a new file, module, package or folder unless the existing one would clearly become unreadable (roughly 400+ lines) or the task explicitly asks for it.
3. **No abstraction until it is used three times.** Write it inline once, copy it a second time, extract a helper on the third use. This applies to helpers, base classes, factories, wrappers, registries, strategy objects, generic types and config tables.
4. **No speculative layers.** The architecture boundaries in `AGENTS.md` (pure core, ports for host services) are real and required. Inside those boundaries, do not add extra layers: no service-that-calls-a-manager-that-calls-a-helper, no interface with a single implementation unless it is a host port named in the architecture docs, no dependency injection for pure functions.
5. **Plain functions and plain data.** Prefer a function over a class, an object literal over a builder, a `switch` over a plugin map, a direct import over an index re-export chain. Use generics only when two or more real call sites need different types today.
6. **No speculative config.** Hard-code values that have one caller. Add a setting, constant file or options parameter only when there is a second, actual use.

## Working habits

- **Read first.** Before editing, read the code you will touch, its callers and its tests, and check `git status`/`git diff`. Base changes on what the code does, not on what the docs say it should do.
- **Reproduce, then fix.** Make a bug fail (a test or a command) before fixing it, and show it passing after. Fix the root cause, not the symptom.
- **Ask instead of guessing wide.** If a request can be read more than one way, pick the narrowest reasonable reading and say so, or ask. Don't build every interpretation.
- **Stop when blocked.** If something fails twice for an unclear reason, stop and report what you tried and what you saw. Don't pile on workarounds, retries or silenced errors.
- **One task per branch and PR,** with small commits whose messages say what changed and why.

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
- Never say "done" or "fixed" without running the check and quoting the result. Summaries list what changed, which commands ran and whether they passed, then what was **not** verified. Keep them short and plain. Never describe stubs, plans or unrun tests as working.

## Known pitfalls (mistakes already made in Catalyst)

- **Node runs `.ts` files with type stripping, so use only erasable TypeScript.** No constructor parameter properties (`constructor(private readonly x: T)`): declare the field and assign it in the body. No `enum`, `namespace`, `import x = require()` or decorators. Use `as const` objects or string-literal unions instead of enums. Keep `.ts` extensions on relative imports, and use `import type` for type-only imports.
- **The build must pass after every commit.** Run typecheck and tests before you push. Never commit a half-edited file or a reference to a module, function or asset that isn't on the branch yet.
- **Rename every caller.** When you rename or remove a function, store method or export, search the repo and update every call site in the same change. Catalyst shipped a broken "Next" button because the UI called a store method that had been renamed.
- **Don't delete or weaken failing tests.** When a feature changes, rewrite its tests to cover the new behavior. A failing test is a bug report, not clutter.
- **Test on Windows if it runs on Windows.** Code behind a Windows-only flag (`#[cfg(windows)]`, path handling, file locking) only counts as tested if CI runs the tests on `windows-latest`. Building it is not testing it.
- **Keep file and path names short.** Windows paths cap at 260 characters and file names at 255 bytes. Never derive temp or recovery names from the user's filename (hex-encoding doubles its length); use a short ID. Don't nest staging folders.
- **One source of truth.** Each setting or piece of data lives in exactly one file or store. Never write the same value to two places that can drift apart.
- **Finish removals.** When a feature is retired, remove its menu items, shortcuts, settings, file associations and UI text in the same change, or list what is left in the summary.
- **Make new behavior handle old data.** Old projects, records and file formats must still open: migrate them, keep reading the old format, or show a clear read-only notice. Never strand existing user data.

## Quick self-check before submitting

- Could this be done with fewer files? Fewer functions? Fewer lines?
- Did I add anything the task did not ask for?
- Is every new abstraction used at least three times?
- Would a reviewer understand the diff in under two minutes?

If any answer is wrong, simplify before submitting.
