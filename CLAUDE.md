# CLAUDE.md — Angular RxJS Enterprise Playground

## Project purpose

This repository is an Angular RxJS Enterprise Playground: a practical learning application with dedicated Angular components for RxJS operators, interactive demonstrations, enterprise scenarios, and tests.

The full product requirements are in `PRD.md`. Read that document before implementing features and treat it as the source of truth.

## Mandatory instructions

1. **Read `PRD.md` first.** Before coding, inspect the existing repository, `package.json`, Angular configuration, and current implementation.
2. **Preserve existing work.** Do not overwrite working files or recreate the project unnecessarily. Make focused changes.
3. **One operator, one example component.** Every operator in the supported catalogue must have its own component, template, and unit test. Related-family overview pages are allowed, but they do not replace the individual examples.
4. **No placeholders masquerading as finished work.** Every example must execute real RxJS code. A component that only displays a title or static code snippet is incomplete.
5. **Displayed code must match executed code.** Do not maintain a separate, inaccurate code string for the UI. Where code display is generated or stored as metadata, keep it synchronized with the actual implementation and test it.
6. **Check version compatibility.** Verify operator availability against the installed RxJS version and verify Angular/TypeScript/Node.js compatibility. Do not import removed APIs. Mark deprecated APIs clearly and teach modern alternatives.
7. **Use Angular best practices.** Prefer standalone components, typed services, lazy-loaded routes, Reactive Forms where appropriate, the `async` pipe, and `takeUntilDestroyed` for imperative component-lifecycle subscriptions when suitable.
8. **Compose streams with operators.** Do not use nested `subscribe()` calls to compose asynchronous work. Use `subscribe()` only at appropriate stream boundaries.
9. **Demonstrate real semantics.** Explain completion, errors, cancellation, hot/cold streams, multicasting, subscription lifetimes, and the differences among `switchMap`, `mergeMap`, `concatMap`, and `exhaustMap`.
10. **Handle errors deliberately.** Place `catchError` at the correct stream level. Retry only appropriate failures; do not imply that client cancellation guarantees server-side rollback.
11. **Treat caching carefully.** Explain `share` and `shareReplay` behavior, reference counting, lifetime, and invalidation. Do not present `shareReplay` alone as a complete cache policy.
12. **Keep strict typing.** Avoid unnecessary `any`, unsafe casts, duplicated metadata, circular dependencies, and oversized components/services.
13. **Test behavior.** Add unit tests for every operator example. Use RxJS `TestScheduler`/marble tests for timing and concurrency behavior where useful. Use Angular HTTP testing utilities for HTTP services.
14. **Keep documentation current.** Update the operator registry, catalogue, completion checklist, README, and architecture documentation as implementation progresses.
15. **Report only verified results.** Never claim tests, lint, or builds passed unless you ran them and observed the result.

## Architecture expectations

Follow the feature-first structure in `PRD.md`, separating:

- `core/`: application shell, layout, global services, interceptors, and core models.
- `shared/`: reusable UI components, pipes, and utilities.
- `features/operators/`: catalogue, registry, routes, and dedicated operator examples.
- `features/scenarios/`: end-to-end enterprise learning scenarios.
- `features/subjects/`: RxJS primitives, separately from operators.
- `features/quizzes/` and `features/progress/`: learning and tracking features.
- `data-access/`: API clients, repositories, and mock data.
- `testing/`: shared fixtures and marble-test helpers.
- `docs/`: architecture, catalogue, coding standards, and roadmap.

Reuse presentation components such as code viewers, output consoles, and timelines, but keep each operator's stream logic in its dedicated example component.

Use explicit typed registries or route mappings. Do not resolve arbitrary component names from untrusted strings.

## Required operator example features

Each operator page should include, where relevant:

- Definition, category, difficulty, and status.
- Simple and enterprise examples.
- Interactive controls.
- Actual emitted output and an event timeline.
- Completion, error, teardown, and cancellation behavior.
- Common mistakes and performance considerations.
- Related operator comparisons.
- Unit tests and official RxJS documentation link.

Use deterministic virtual time for tests. Real-time browser demos may supplement but must not replace deterministic tests.

## Enterprise scenarios required by the PRD

Implement and test:

1. Search autocomplete.
2. API dashboard with multiple data sources.
3. Order workflow and flattening-operator comparison.
4. Reliable API client with bounded retry and timeout.
5. Live activity feed.
6. Sharing/caching demonstration.
7. Reactive form async validation.

Use mock services so the application can run without external credentials or a separate backend.

## Working procedure

Work in small, verifiable phases:

1. Inspect the repository and environment.
2. Build the foundation, shell, routes, registry, and reusable example layout.
3. Implement operators in category-based batches.
4. Implement enterprise scenarios.
5. Finish tests, accessibility, documentation, and verification.

After each phase, update a checklist with each operator's component, test, and documentation status. Report:

- Files created or changed.
- Features completed.
- Tests actually executed and their results.
- Lint and production build status.
- Remaining work and compatibility issues.

If interrupted, inspect the current code and checklist, then continue from the first incomplete item. Do not restart from scratch.

## Definition of done

A phase is complete only when its implementation is real, relevant tests have been run, the build status has been checked, and documentation/checklists are updated. The project is complete only when it meets the acceptance criteria in `PRD.md`.

## Start here

Read `PRD.md`, inspect the repository and runtime, then begin Phase 1. Do not stop at a plan or create placeholder-only files.
