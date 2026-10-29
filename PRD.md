# Project: Angular RxJS Enterprise Playground

## 1. Project overview

Build an **Angular RxJS Enterprise Playground** — a single practice application where every RxJS operator has its own component, runnable example, source code, explanation, and real-world enterprise use case.

Instead of creating a simple CRUD application and using RxJS operators randomly, this project will help learners understand how Angular applications in large engineering teams handle API calls, search, cancellation, concurrent requests, caching, state management, event streams, error recovery, and performance.

## 2. Technical requirements

Use these as the baseline for the generated project.

| Area | Requirement |
|---|---|
| Angular | Angular 17 or newer; use a currently supported version compatible with the environment |
| Language | TypeScript with strict type checking |
| UI architecture | Standalone components and lazy-loaded routes |
| Reactive programming | RxJS, using pipeable operators |
| HTTP | Angular `HttpClient` and functional interceptors where appropriate |
| Forms | Reactive Forms |
| State | Signals for suitable local UI state; RxJS for asynchronous streams and stream composition |
| Styling | Responsive layout, reusable design tokens, accessible controls |
| Testing | Angular testing tools, RxJS marble tests where useful, and HTTP testing utilities |
| Quality | ESLint, formatting, no unexplained `any`, no unexplained subscriptions |
| Backend | Mock services initially, with an optional real API integration layer |

**Version note:** Angular 17+ is the minimum, not a requirement to use Angular 17 specifically. Have the coding agent select a supported Angular release compatible with the available Node.js environment and pin dependency versions. Use current Angular APIs where possible, but avoid newer APIs if they would break the stated minimum without an explicit compatibility decision.

## 3. Application features and user experience

The application should feel like an internal developer-learning portal used by a large engineering organization.

### A. Operator Explorer

Search operators by name, category, difficulty, or use case. Every operator has a dedicated URL, such as `/operators/transformation/map`.

### B. Interactive Operator Lab

Run examples, change input values, select timing options, inspect emitted values, and compare similar operators.

### C. Enterprise Scenarios

Demonstrate debounced search, dependent API requests, concurrent data loading, sequential writes, request retries, caching, and real-time streams.

### D. Learning Progress

Mark examples as completed, save favorites, track category progress, and take quizzes on operator selection.

### Required page layout

- Left sidebar: categories and operator navigation.
- Header: global search, theme switch, and progress indicator.
- Main content: operator explanation, interactive controls, and examples.
- Code panel: TypeScript implementation with syntax highlighting.
- Output panel: emitted values, event timeline, completion state, and errors.
- Related operators: comparisons such as `switchMap` vs `mergeMap` vs `concatMap` vs `exhaustMap`.

The code examples must be actual executable TypeScript implementations in the Angular components, not just code strings rendered on the screen.

## 4. Complete RxJS operator curriculum

The goal is broad coverage of the public RxJS API, while prioritizing operators you'll actually encounter in enterprise Angular applications.

The following curriculum is the application's required content catalogue. Each listed operator must have an example component, either individually or as part of a clearly scoped family component when noted.

### Category 1 — Creation operators

Create observables from values, events, timers, and other observables.

| Operator / API | Example scenario |
|---|---|
| `of` | Emit predefined configuration values |
| `from` | Convert a Promise or iterable into a stream |
| `fromEvent` | Listen to input or DOM events |
| `interval` | Periodic polling or heartbeat |
| `timer` | Delayed execution and scheduled requests |
| `defer` | Create a fresh observable at subscription time |
| `range` | Generate a sequence of values |
| `throwError` | Simulate a service failure |
| `EMPTY` | Complete without emitting a value |
| `NEVER` | Demonstrate a stream that never terminates |
| `iif` | Select between observable branches |
| `generate` | Generate values using an iterator-style condition |
| `pairs` | Convert object entries into emissions, if supported by the selected version |
| `scheduled` | Schedule emissions from an input source |
| `ajax` | Demonstrate RxJS Ajax integration as an optional alternative to Angular `HttpClient` |

Also cover `concat`, `merge`, `combineLatest`, `forkJoin`, `race`, `zip`, `partition`, and `using` where supported by the selected RxJS version. Some of these are creation or combination APIs depending on how they are used.

**Production note:** Use Angular `HttpClient` for standard Angular HTTP workflows. Keep specialized APIs such as `ajax`, `generate`, and `scheduled` in the learning section rather than making them default architectural choices.

### Category 2 — Transformation operators

Transform values or flatten streams of observables.

| Operator | Example scenario |
|---|---|
| `map` | Transform an API response into a view model |
| `mapTo` | Emit a constant value; mark deprecated where applicable |
| `pluck` | Extract a property from an object; mark deprecated |
| `switchMap` | Search suggestions and latest-request-wins behavior |
| `mergeMap` | Execute independent requests concurrently |
| `concatMap` | Queue operations in order |
| `exhaustMap` | Ignore duplicate submissions while one is active |
| `mergeAll` | Subscribe to multiple inner streams concurrently |
| `concatAll` | Subscribe to inner streams sequentially |
| `switchAll` | Switch to the newest inner observable |
| `exhaustAll` | Ignore new inner observables while one is active |
| `expand` | Recursively fetch paginated or linked data |
| `scan` | Accumulate state over time |
| `mergeScan` | Accumulate state with asynchronous inner work |
| `buffer` | Collect values until a closing notifier emits |
| `bufferCount` | Group a fixed number of values |
| `bufferTime` | Batch events by time |
| `bufferToggle` | Collect values between opening and closing events |
| `bufferWhen` | Repeatedly collect values until a closing observable is produced |
| `window` | Create observable windows separated by notifier events |
| `windowCount` | Group values into count-based windows |
| `windowTime` | Group values into time-based windows |
| `windowToggle` | Create windows from opening and closing events |
| `windowWhen` | Create repeated windows using closing observables |
| `groupBy` | Group events by tenant, user, or event type |
| `pairwise` | Compare previous and current values |

For all four flattening operators, create an additional comparison lab that makes request timing and cancellation visible. Their behavior is different even when their TypeScript syntax looks similar.

### Category 3 — Filtering and selection operators

| Operator | Example scenario |
|---|---|
| `filter` | Keep only valid records |
| `take` | Read a fixed number of emissions |
| `takeLast` | Return the last values after completion |
| `takeUntil` | Stop listening when a notifier emits |
| `takeWhile` | Continue while a condition holds |
| `skip` | Ignore initial emissions |
| `skipLast` | Omit trailing values after completion |
| `skipUntil` | Ignore values until a notifier emits |
| `skipWhile` | Ignore values while a condition holds |
| `first` | Select the first matching emission |
| `last` | Select the final matching emission |
| `elementAt` | Select an emission by index |
| `single` | Require exactly one matching emission |
| `debounce` | Delay output based on a duration selector |
| `debounceTime` | Debounce search input |
| `throttle` | Limit emissions using a duration selector |
| `throttleTime` | Limit rapid button or scroll events |
| `audit` | Emit the latest value after a duration selector |
| `auditTime` | Sample the latest value at the end of a time window |
| `distinct` | Emit values not seen before |
| `distinctUntilChanged` | Suppress consecutive duplicates |
| `distinctUntilKeyChanged` | Suppress unchanged object properties |
| `ignoreElements` | Ignore values but preserve completion and errors |

### Category 4 — Combination operators

| Operator / API | Example scenario |
|---|---|
| `combineLatest` | Combine filters, pagination, and sort state |
| `combineLatestWith` | Combine a stream with another live stream |
| `withLatestFrom` | Submit using the latest form state |
| `zip` | Pair values by emission index |
| `zipWith` | Pair one stream with another |
| `forkJoin` | Wait for several HTTP calls to complete |
| `merge` | Combine independent event streams |
| `mergeWith` | Merge additional sources |
| `concat` | Execute streams sequentially |
| `concatWith` | Append another stream after completion |
| `race` | Use the first source to emit |
| `raceWith` | Race against another stream |
| `startWith` | Provide an initial value |
| `endWith` | Append a final value on completion |
| `pairwise` | Compare adjacent emissions |
| `partition` | Split a source into matching and nonmatching streams |
| `combineAll` | Combine the latest values of inner observables after the outer completes; deprecated in relevant versions |
| `concatAll` | Sequentially flatten an observable of observables |
| `mergeAll` | Concurrently flatten an observable of observables |
| `switchAll` | Flatten using latest-inner semantics |
| `exhaustAll` | Flatten while ignoring overlapping inner observables |

The project should explain the difference between `combineLatest`, `forkJoin`, `zip`, and `withLatestFrom` through one shared API-dashboard scenario.

### Category 5 — Error handling and recovery

| Operator | Example scenario |
|---|---|
| `catchError` | Show a fallback UI or recover from a failed request |
| `retry` | Retry transient API failures |
| `retryWhen` | Teach legacy retry-notifier patterns; clearly flag version/deprecation concerns |
| `throwIfEmpty` | Treat an empty result as a domain error |
| `onErrorResumeNext` | Continue with another source after termination; explain its semantics carefully |
| `materialize` | Convert notifications into values |
| `dematerialize` | Reconstruct notifications from values |

Include failure simulation controls for network errors, empty results, and successful retries. Teach that `catchError` placement matters: an error caught inside `switchMap` can allow future search input to continue, whereas an error caught around the whole outer stream can terminate normal interaction unless it is recovered correctly.

### Category 6 — Utility and lifecycle operators

| Operator | Example scenario |
|---|---|
| `tap` | Diagnostic logging without changing emitted values |
| `finalize` | Reset loading indicators on success, error, or unsubscribe |
| `delay` | Simulate response latency |
| `delayWhen` | Delay using a duration observable |
| `timeout` | Enforce a request deadline |
| `timeoutWith` | Switch to an alternate stream on timeout |
| `observeOn` | Demonstrate notification scheduling |
| `subscribeOn` | Demonstrate subscription scheduling |
| `subscribe` | Explain the terminal subscription API, not a pipeable operator |
| `toArray` | Collect emissions into an array on completion |
| `count` | Count emissions |
| `reduce` | Produce one accumulated result at completion |
| `max` | Find the maximum value |
| `min` | Find the minimum value |
| `find` | Return the first matching value |
| `findIndex` | Return the index of the first match |
| `every` | Test whether all values satisfy a predicate |
| `isEmpty` | Check whether the stream completes without values |
| `defaultIfEmpty` | Provide a value for an empty stream |
| `sequenceEqual` | Compare emissions from two sequences |
| `identity` | Teach the identity function in operator composition where applicable |
| `noop` | Demonstrate a no-op callback utility where relevant |

Teach `tap` versus `map`, `finalize` versus `complete` callbacks, and `takeUntil` versus Angular's `takeUntilDestroyed` as distinct concepts. `takeUntilDestroyed` is an Angular interop utility, not an RxJS operator.

### Category 7 — Multicasting, sharing, and replay

| Operator / API | Example scenario |
|---|---|
| `share` | Share one source subscription between consumers |
| `shareReplay` | Cache and replay HTTP results |
| `publish` | Legacy connectable observable pattern |
| `publishBehavior` | Legacy behavior-subject multicasting |
| `publishLast` | Legacy replay of the last value after completion |
| `publishReplay` | Legacy replay-based multicasting |
| `multicast` | Explain connectable observable patterns |
| `connect` | Demonstrate explicit connection to a shared source |
| `refCount` | Explain automatic connection management for supported connectable patterns |
| `connectable` | Explain explicit multicast connection management |

Label legacy APIs and version-specific availability in the interface. Do not recommend deprecated multicasting operators for new application code. The primary production demos should use `share` and `shareReplay`, with explicit discussion of cache invalidation, reference counting, and memory retention.

### Category 8 — Time and event coordination

Create a dedicated family page with interactive timelines for:

- `debounceTime`
- `throttleTime`
- `auditTime`
- `delay`
- `delayWhen`
- `timeout`
- `timeoutWith`
- `bufferTime`
- `windowTime`
- `interval`
- `timer`
- `sample`
- `sampleTime`
- `timeInterval`
- `timestamp`
- `takeUntil`
- `skipUntil`

Include `sample` and `sampleTime` as their own examples. The user must be able to change the event interval and duration, then observe which emissions survive.

### Category 9 — Subjects and observable primitives

These are not operators, but are essential to RxJS mastery and belong in a separate section.

- `Subject`
- `BehaviorSubject`
- `ReplaySubject`
- `AsyncSubject`
- `Observable`
- `Subscription`
- `Notification`
- `SchedulerLike`
- `ConnectableObservable`, where supported

Explain hot versus cold observables, multiple subscribers, completion, error propagation, replay, and unsubscription. Demonstrate why an ordinary `Subject` is not automatically a replacement for a well-designed state-management service.

### Category 10 — Deprecated and specialized APIs

The generator must not silently teach deprecated APIs as recommended production patterns. Create a separate legacy reference section covering applicable APIs such as:

- `toPromise`
- `combineLatest` and `concat` legacy static forms where deprecated
- `flatMap` as an alias of `mergeMap`
- `mapTo`, `pluck`, and `concatMapTo`
- `retryWhen` and `repeatWhen` where deprecated in the chosen version
- Legacy `publish*`, `multicast`, and `refCount` patterns
- Deprecated connectable and combination APIs where applicable

The exact list must be validated against the installed RxJS version and official API documentation. Do not create runnable examples that import removed APIs; where an API no longer exists, render a migration example and explain its replacement.

## 5. Enterprise scenarios to implement

### Scenario A — Search autocomplete

**Operators:** `debounceTime`, `distinctUntilChanged`, `switchMap`, `filter`, `catchError`, `finalize`, `shareReplay`.

Expected behavior: A user types in a search box. Requests are debounced, duplicate terms are ignored, obsolete requests are cancelled when possible, loading is tracked, and an individual request failure doesn't break future searches.

Acceptance test: type several terms quickly and verify that only the latest relevant search results appear.

### Scenario B — API dashboard

**Operators:** `forkJoin`, `combineLatest`, `startWith`, `map`, `catchError`, `shareReplay`.

Expected behavior: Load users, orders, and metrics concurrently; combine filter state with results; refresh the dashboard; and handle independent service failures appropriately.

### Scenario C — Order submission

**Operators:** `exhaustMap`, `concatMap`, `switchMap`, `catchError`, `finalize`.

Expected behavior: Prevent duplicate submissions, queue sequential writes when required, and demonstrate why a client-side cancellation does not guarantee a server-side operation was undone.

### Scenario D — Reliable API client

**Operators:** `retry`, `timeout`, `catchError`, `tap`, `finalize`, `throwError`.

Expected behavior: Simulate transient failures, apply bounded retry policies, enforce deadlines, and record request lifecycle events. Retry only appropriate failures, especially for non-idempotent operations.

### Scenario E — Live activity feed

**Operators:** `scan`, `merge`, `filter`, `bufferTime`, `distinctUntilChanged`, `takeUntil`, `share`.

Expected behavior: Merge event streams, update accumulated state, batch bursts of events, and stop the feed when the user leaves the page.

### Scenario F — Client-side caching

**Operators:** `shareReplay`, `defer`, `switchMap`, `tap`, `finalize`.

Expected behavior: Demonstrate multiple subscribers sharing a request, cache expiration or invalidation, and the difference between sharing an observable and implementing a full cache.

### Scenario G — Reactive form validation

**Operators:** `valueChanges`, `debounceTime`, `distinctUntilChanged`, `switchMap`, `catchError`, `startWith`.

Expected behavior: Perform asynchronous username availability checks and demonstrate how to handle stale results and validation errors.

## 6. Recommended project structure

Use a feature-first architecture. Keep the shared shell, operator catalogue, operator implementations, scenario demonstrations, and data access separate.

```text
rxjs-enterprise-playground/
├── README.md
├── package.json
├── angular.json
├── tsconfig.json
├── docs/
│   ├── architecture.md
│   ├── operator-catalog.md
│   ├── coding-standards.md
│   └── implementation-roadmap.md
├── public/
│   └── assets/
└── src/
    ├── main.ts
    ├── styles.scss
    ├── environments/
    │   ├── environment.ts
    │   └── environment.development.ts
    └── app/
        ├── app.config.ts
        ├── app.routes.ts
        ├── core/
        │   ├── layout/
        │   │   ├── app-shell/
        │   │   ├── app-header/
        │   │   └── app-sidebar/
        │   ├── interceptors/
        │   │   ├── logging.interceptor.ts
        │   │   └── error.interceptor.ts
        │   ├── services/
        │   │   ├── notification.service.ts
        │   │   └── preferences.service.ts
        │   └── models/
        ├── shared/
        │   ├── components/
        │   │   ├── code-viewer/
        │   │   ├── output-console/
        │   │   ├── event-timeline/
        │   │   ├── operator-card/
        │   │   └── loading-state/
        │   ├── pipes/
        │   └── utils/
        ├── features/
        │   ├── dashboard/
        │   │   ├── dashboard-page/
        │   │   └── dashboard.routes.ts
        │   ├── operators/
        │   │   ├── operator-catalog/
        │   │   ├── operator-detail/
        │   │   ├── operator-search/
        │   │   ├── operator-registry.ts
        │   │   ├── operator.model.ts
        │   │   ├── operators.routes.ts
        │   │   └── examples/
        │   │       ├── creation/
        │   │       ├── transformation/
        │   │       ├── filtering/
        │   │       ├── combination/
        │   │       ├── flattening/
        │   │       ├── error-handling/
        │   │       ├── utility/
        │   │       ├── multicasting/
        │   │       └── time-based/
        │   ├── scenarios/
        │   │   ├── search-autocomplete/
        │   │   ├── api-dashboard/
        │   │   ├── order-workflow/
        │   │   ├── resilient-api/
        │   │   ├── live-activity-feed/
        │   │   ├── caching/
        │   │   └── reactive-form-validation/
        │   ├── subjects/
        │   ├── quizzes/
        │   ├── progress/
        │   └── settings/
        ├── data-access/
        │   ├── api/
        │   ├── repositories/
        │   ├── interceptors/
        │   └── mock-data/
        └── testing/
            ├── marble-helpers/
            └── fixtures/
```

### Separate components for every operator

The requirement is that each operator has a distinct, maintainable example component. For example:

```text
examples/
├── creation/
│   ├── of-example/
│   │   ├── of-example.component.ts
│   │   ├── of-example.component.html
│   │   └── of-example.component.spec.ts
│   ├── from-example/
│   ├── defer-example/
│   └── timer-example/
├── transformation/
│   ├── map-example/
│   ├── switch-map-example/
│   ├── merge-map-example/
│   ├── concat-map-example/
│   ├── exhaust-map-example/
│   └── scan-example/
└── filtering/
    ├── filter-example/
    ├── debounce-time-example/
    └── distinct-until-changed-example/
```

Every example component should have its own TypeScript, template, and unit test. The generator should create the full set, not just these illustrative examples.

To avoid an unwieldy application, shared display components such as `code-viewer` and `output-console` can be reused, while the operator-specific logic remains in each dedicated example component.

## 7. Standard interface for an operator example

Every operator example must use a consistent structure so users can move from one operator to another without learning a different interface each time.

Example: `switchMap`

**Purpose:** Switch to the latest inner observable and stop forwarding values from the previous inner subscription.

### Interactive controls

- Search input.
- Configurable simulated API delay.
- Run/reset controls.
- Optional event timing controls.

### Example implementation

```typescript
readonly results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term =>
    this.searchService.search(term).pipe(
      catchError(() => of([]))
    )
  )
);
```

### What to explain

- Why `switchMap` is appropriate for latest-query-wins behavior.
- What happens to the previous inner subscription.
- How Angular `HttpClient` cancellation differs from a guaranteed rollback on the server.
- Why the inner `catchError` allows future searches to continue.
- How to test the behavior with controlled timing.

### Required component contract

Each example must include:

1. Operator name and category.
2. Short definition and marble diagram or timeline.
3. A beginner-friendly runnable example.
4. A realistic enterprise example.
5. Editable input values and controls where relevant.
6. The exact TypeScript source code used for execution.
7. Actual output values, completion, error, and cancellation events.
8. Common mistakes and performance considerations.
9. Related operators and a comparison with alternatives.
10. Unit tests and a link to the official RxJS API reference.

For timing-based operators, include a deterministic demo mode using a virtual scheduler or marble tests. Don't rely only on real-time browser delays for correctness.

## 8. Data model and operator registry

Create a typed operator registry so the application can generate category lists, search results, completion tracking, and operator detail pages without hardcoding the same metadata in multiple places.

```typescript
export type OperatorCategory =
  | 'creation'
  | 'transformation'
  | 'filtering'
  | 'combination'
  | 'error-handling'
  | 'utility'
  | 'multicasting'
  | 'time-based'
  | 'legacy';

export type OperatorStatus =
  | 'recommended'
  | 'specialized'
  | 'deprecated'
  | 'removed';

export interface OperatorDefinition {
  id: string;
  name: string;
  category: OperatorCategory;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: OperatorStatus;
  useCases: string[];
  relatedOperators: string[];
  officialDocsUrl: string;
  componentPath: string;
}
```

Example registry entry:

```typescript
export const OPERATOR_CATALOG: OperatorDefinition[] = [
  {
    id: 'switch-map',
    name: 'switchMap',
    category: 'transformation',
    description: 'Switches to the newest inner observable.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: [
      'Search autocomplete',
      'Route-driven data loading',
      'Latest request wins'
    ],
    relatedOperators: [
      'merge-map',
      'concat-map',
      'exhaust-map'
    ],
    officialDocsUrl: 'https://rxjs.dev/api/operators/switchMap',
    componentPath: 'switch-map-example'
  }
];
```

The coding agent should populate the registry from the complete operator catalogue, validate links, and verify that every entry maps to an actual component.

Do not use dynamic component loading from arbitrary strings without a defined mapping. Use explicit route definitions or a typed component registry so the compiler can detect invalid references.

## 9. Enterprise engineering standards

- **Subscription management:** Prefer the `async` pipe, Angular signals interop where appropriate, and `takeUntilDestroyed` for imperative subscriptions tied to a component's lifecycle.
- **Error handling:** Handle errors at the correct level of the stream. Distinguish recoverable request failures from fatal stream failures.
- **HTTP cancellation:** Demonstrate cancellation with `switchMap`, but never claim that client-side cancellation guarantees the server stopped processing.
- **Caching:** Explain the behavior and lifecycle of `shareReplay`; don't treat it as a complete caching solution without an invalidation policy.
- **Concurrency:** Make `mergeMap`, `concatMap`, `switchMap`, and `exhaustMap` differences visible through timelines and tests.
- **Type safety:** Use typed API responses and avoid unnecessary `any` and unsafe casts.
- **Testing:** Test success, error, empty completion, teardown, timing, and concurrent emissions.
- **Performance:** Use lazy-loaded routes, avoid duplicate subscriptions that trigger duplicate HTTP requests, and clean up event listeners.
- **Accessibility:** Provide keyboard-accessible navigation, visible focus states, accessible labels, and reduced-motion support.
- **Documentation:** Explain why an operator is appropriate, not only what it does.

## 10. Implementation roadmap

### Phase 1 — Foundation and navigation

Create the Angular workspace, shell, responsive sidebar, routing, operator registry, search, and reusable example layout.

Deliverable: runnable application with placeholder operator pages.

### Phase 2 — Core operators

Implement creation, transformation, filtering, combination, and flattening operators with dedicated components and tests.

Deliverable: working examples and operator comparison labs.

### Phase 3 — Advanced RxJS

Add error recovery, multicasting, time-based operators, subjects, and marble-testing utilities.

Deliverable: broad operator coverage and deterministic tests.

### Phase 4 — Enterprise scenarios

Implement the search, dashboard, order workflow, resilient API client, activity feed, caching, and reactive form scenarios.

Deliverable: complete practical learning examples.

### Phase 5 — Quality and completeness

Add quizzes, saved progress, documentation, accessibility checks, test coverage, and deprecated API guidance.

Deliverable: a complete, maintainable practice application.

## 11. Copy-ready master prompt for the coding agent

Act as a senior Angular architect, RxJS specialist, frontend engineering lead, and test engineer.

Build the complete Angular RxJS Enterprise Playground according to this PRD. Generate actual project files and working features, not only a plan or snippets.

Before coding, inspect the repository and environment. Check Node.js, Angular, TypeScript, and RxJS compatibility. Preserve existing useful work.

Implement in phases. Every operator must have a dedicated component, template, test, registry entry, real runnable stream, explanation, and documentation link. Do not leave placeholder implementations. Verify each API against the installed RxJS version and identify deprecated or removed APIs.

At the end of each phase, report files changed, features completed, tests executed and actual results, build and lint status, remaining tasks, and compatibility issues. Maintain a completion checklist mapping every catalogue entry to its component, test, and documentation.

Do not claim a test or build passes unless you actually ran it. Continue from the next incomplete phase if interrupted.

Start with Phase 1 now.
