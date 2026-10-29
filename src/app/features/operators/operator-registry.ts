import { OperatorDefinition } from './operator.model';

export const OPERATOR_CATALOG: OperatorDefinition[] = [
  // --- Category 1: Creation ---
  {
    id: 'of',
    name: 'of',
    category: 'creation',
    description: 'Emits the specified arguments in order, then completes immediately.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Emit predefined configuration values', 'Synchronous mock fallbacks in services', 'Returning fixed values in catchError'],
    relatedOperators: ['from', 'defer', 'generate'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/of',
    componentPath: 'creation/of-example'
  },
  {
    id: 'from',
    name: 'from',
    category: 'creation',
    description: 'Creates an Observable from an Array, an array-like object, a Promise, an iterable object, or an Observable-like object.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Convert Promise to Observable', 'Stream individual items of an array', 'Async iterable bridges'],
    relatedOperators: ['of', 'defer', 'fromEvent'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/from',
    componentPath: 'creation/from-example'
  },
  {
    id: 'from-event',
    name: 'fromEvent',
    category: 'creation',
    description: 'Creates an Observable that emits events of a specific type coming from the given event target.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['DOM click/scroll event listeners', 'Window resize listeners', 'Custom event emitter bridge'],
    relatedOperators: ['from', 'interval'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/fromEvent',
    componentPath: 'creation/from-event-example'
  },
  {
    id: 'interval',
    name: 'interval',
    category: 'creation',
    description: 'Creates an Observable that emits sequential numbers every specified interval of time.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Periodic polling or heartbeat', 'Live ticker updates', 'Session keepalive pings'],
    relatedOperators: ['timer', 'delay'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/interval',
    componentPath: 'creation/interval-example'
  },
  {
    id: 'timer',
    name: 'timer',
    category: 'creation',
    description: 'Creates an Observable that starts emitting after an initial delay and then emits periodically.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Scheduled requests', 'Delayed execution/timeouts', 'One-shot delayed notifications'],
    relatedOperators: ['interval', 'delay'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/timer',
    componentPath: 'creation/timer-example'
  },
  {
    id: 'defer',
    name: 'defer',
    category: 'creation',
    description: 'Creates an Observable that, on subscribe, calls an Observable factory to make an Observable for each new Observer.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Create fresh observable at subscription time', 'Lazy evaluation of current timestamps/tokens', 'Re-evaluating dynamic conditions per subscriber'],
    relatedOperators: ['from', 'of', 'iif'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/defer',
    componentPath: 'creation/defer-example'
  },
  {
    id: 'range',
    name: 'range',
    category: 'creation',
    description: 'Creates an Observable that emits a sequence of numbers within a specified range.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Generate sequences of numbers', 'Deterministic iteration test streams', 'Pagination index generators'],
    relatedOperators: ['generate', 'interval'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/range',
    componentPath: 'creation/range-example'
  },
  {
    id: 'throw-error',
    name: 'throwError',
    category: 'creation',
    description: 'Creates an Observable that emits no items and immediately emits an error notification.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Simulate a service failure', 'Re-throw custom domain errors in catchError', 'Conditional error emission'],
    relatedOperators: ['EMPTY', 'catchError'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/throwError',
    componentPath: 'creation/throw-error-example'
  },
  {
    id: 'empty',
    name: 'EMPTY',
    category: 'creation',
    description: 'A simple Observable that emits no items to the Observer and immediately emits a complete notification.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Complete without emitting in catchError fallback', 'Default branch in iif', 'Terminating sub-streams gracefully'],
    relatedOperators: ['throwError', 'defaultIfEmpty'],
    officialDocsUrl: 'https://rxjs.dev/api/index/const/EMPTY',
    componentPath: 'creation/empty-example'
  },
  {
    id: 'never',
    name: 'NEVER',
    category: 'creation',
    description: 'An Observable that emits neither values nor errors nor the completion notification.',
    difficulty: 'intermediate',
    status: 'specialized',
    useCases: ['Testing uncompleted streams', 'Pausing race conditions indefinitely', 'Holding stream open in conditional branches'],
    relatedOperators: ['EMPTY', 'throwError'],
    officialDocsUrl: 'https://rxjs.dev/api/index/const/NEVER',
    componentPath: 'creation/never-example'
  },
  {
    id: 'iif',
    name: 'iif',
    category: 'creation',
    description: 'Decides at subscription-time which Observable will actually be subscribed to based on a boolean condition.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Branching stream subscriptions dynamically', 'Feature flag conditional data loading', 'Auth check routing'],
    relatedOperators: ['defer', 'filter'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/iif',
    componentPath: 'creation/iif-example'
  },
  {
    id: 'generate',
    name: 'generate',
    category: 'creation',
    description: 'Generates an observable sequence by running a state-driven loop producing the sequence values.',
    difficulty: 'intermediate',
    status: 'specialized',
    useCases: ['Iterator-style conditional generation', 'Fibonacci or custom numerical series', 'Controlled loop streams'],
    relatedOperators: ['range', 'expand'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/generate',
    componentPath: 'creation/generate-example'
  },
  {
    id: 'ajax',
    name: 'ajax',
    category: 'creation',
    description: 'Creates an Observable for an Ajax request with either a request object or a string with a URL.',
    difficulty: 'intermediate',
    status: 'specialized',
    useCases: ['RxJS native HTTP requests without Angular HttpClient', 'Direct WebSocket/XHR emulation', 'Low-level streaming response handling'],
    relatedOperators: ['from', 'defer'],
    officialDocsUrl: 'https://rxjs.dev/api/ajax/ajax',
    componentPath: 'creation/ajax-example'
  },

  // --- Category 2: Transformation & Flattening ---
  {
    id: 'map',
    name: 'map',
    category: 'transformation',
    description: 'Applies a given project function to each value emitted by the source Observable, and emits the resulting values.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Transform API response to View Model', 'Extract computed fields', 'Format display strings'],
    relatedOperators: ['switchMap', 'scan', 'pluck'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/map',
    componentPath: 'transformation/map-example'
  },
  {
    id: 'switch-map',
    name: 'switchMap',
    category: 'transformation',
    description: 'Projects each source value to an Observable which is merged in the output Observable, emitting values only from the most recently projected Observable.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Search autocomplete with query cancellation', 'Route parameter change-driven HTTP loading', 'Latest-request-wins interaction'],
    relatedOperators: ['mergeMap', 'concatMap', 'exhaustMap'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/switchMap',
    componentPath: 'transformation/switch-map-example'
  },
  {
    id: 'merge-map',
    name: 'mergeMap',
    category: 'transformation',
    description: 'Projects each source value to an Observable which is merged in the output Observable concurrently.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Concurrent independent API calls', 'Batch item downloading', 'Parallel processing of unordered jobs'],
    relatedOperators: ['switchMap', 'concatMap', 'exhaustMap'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/mergeMap',
    componentPath: 'transformation/merge-map-example'
  },
  {
    id: 'concat-map',
    name: 'concatMap',
    category: 'transformation',
    description: 'Projects each source value to an Observable which is merged in the output Observable, in a serialized fashion waiting for each one to complete before merging the next.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Queueing save/update requests sequentially', 'FIFO guaranteed transaction handling', 'Sequential step executions'],
    relatedOperators: ['mergeMap', 'switchMap', 'exhaustMap'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/concatMap',
    componentPath: 'transformation/concat-map-example'
  },
  {
    id: 'exhaust-map',
    name: 'exhaustMap',
    category: 'transformation',
    description: 'Projects each source value to an Observable which is merged in the output Observable only if the previous projected Observable has completed.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Form submit button double-click guard', 'Preventing duplicate ongoing payments', 'Refreshing OAuth access tokens'],
    relatedOperators: ['switchMap', 'mergeMap', 'concatMap'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/exhaustMap',
    componentPath: 'transformation/exhaust-map-example'
  },
  {
    id: 'scan',
    name: 'scan',
    category: 'transformation',
    description: 'Applies an accumulator function over the source Observable, and returns each intermediate result.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Accumulate live state over time', 'Cart total computations', 'Undo/redo and historical log accumulation'],
    relatedOperators: ['reduce', 'mergeScan'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/scan',
    componentPath: 'transformation/scan-example'
  },
  {
    id: 'merge-scan',
    name: 'mergeScan',
    category: 'transformation',
    description: 'Applies an accumulator function over the source Observable where the accumulator returns an Observable, merging results.',
    difficulty: 'advanced',
    status: 'specialized',
    useCases: ['Async state accumulation with database writes', 'Rolling aggregate computation backed by async fetches'],
    relatedOperators: ['scan', 'mergeMap'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/mergeScan',
    componentPath: 'transformation/merge-scan-example'
  },
  {
    id: 'expand',
    name: 'expand',
    category: 'transformation',
    description: 'Recursively projects each source value to an Observable which is merged in the output Observable.',
    difficulty: 'advanced',
    status: 'recommended',
    useCases: ['Recursive cursor/pagination fetching', 'Traversing tree hierarchy APIs', 'Polling until completion flag'],
    relatedOperators: ['mergeMap', 'scan'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/expand',
    componentPath: 'transformation/expand-example'
  },
  {
    id: 'buffer',
    name: 'buffer',
    category: 'transformation',
    description: 'Buffers the source Observable values until closingNotifier emits.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Collect click coordinates until release', 'Batching events until explicit user commit', 'Flush on save notification'],
    relatedOperators: ['bufferCount', 'bufferTime'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/buffer',
    componentPath: 'transformation/buffer-example'
  },
  {
    id: 'buffer-count',
    name: 'bufferCount',
    category: 'transformation',
    description: 'Buffers the source Observable values until its size reaches bufferSize.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Grouping fixed batch sizes for bulk API', 'Pairwise custom windowing', 'Chunking upload payloads'],
    relatedOperators: ['buffer', 'bufferTime'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/bufferCount',
    componentPath: 'transformation/buffer-count-example'
  },
  {
    id: 'buffer-time',
    name: 'bufferTime',
    category: 'transformation',
    description: 'Buffers the source Observable values for a specific time duration.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Batching telemetry log bursts', 'Bulk chat message rendering', 'Micro-batching metrics submissions'],
    relatedOperators: ['buffer', 'throttleTime'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/bufferTime',
    componentPath: 'transformation/buffer-time-example'
  },
  {
    id: 'pairwise',
    name: 'pairwise',
    category: 'transformation',
    description: 'Groups pairs of consecutive emissions together and emits them as an array of two values.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Comparing previous route with current route', 'Scroll delta computation', 'Form value before/after delta detection'],
    relatedOperators: ['bufferCount', 'scan'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/pairwise',
    componentPath: 'transformation/pairwise-example'
  },
  {
    id: 'group-by',
    name: 'groupBy',
    category: 'transformation',
    description: 'Groups the items emitted by an Observable according to a specified criterion, and emits these grouped items as GroupedObservables.',
    difficulty: 'advanced',
    status: 'recommended',
    useCases: ['Demultiplexing websocket message by event type', 'Multi-tenant event isolation', 'Categorized stream sorting'],
    relatedOperators: ['buffer', 'map'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/groupBy',
    componentPath: 'transformation/group-by-example'
  },

  // --- Category 3: Filtering & Selection ---
  {
    id: 'filter',
    name: 'filter',
    category: 'filtering',
    description: 'Filter items emitted by the source Observable by only emitting those that satisfy a specified predicate.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Filter out null or undefined results', 'Route guard activation checks', 'Role-based permission filtering'],
    relatedOperators: ['first', 'takeWhile'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/filter',
    componentPath: 'filtering/filter-example'
  },
  {
    id: 'take',
    name: 'take',
    category: 'filtering',
    description: 'Emits only the first count values emitted by the source Observable.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['One-shot configuration read', 'Limited event capture', 'Canceling infinite streams after N items'],
    relatedOperators: ['first', 'takeUntil', 'takeWhile'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/take',
    componentPath: 'filtering/take-example'
  },
  {
    id: 'take-until',
    name: 'takeUntil',
    category: 'filtering',
    description: 'Emits values until a notifier Observable emits a value.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Declarative subscription cleanup on destroy', 'Stop listening on logout event', 'Cancel stream on user abort'],
    relatedOperators: ['takeWhile', 'skipUntil'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/takeUntil',
    componentPath: 'filtering/take-until-example'
  },
  {
    id: 'take-while',
    name: 'takeWhile',
    category: 'filtering',
    description: 'Emits values emitted by the source Observable so long as each value satisfies the given predicate, and immediately completes as soon as this predicate is not satisfied.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Read streaming data until EOF flag', 'Progress bar increments while percent < 100', 'Polling while status is PENDING'],
    relatedOperators: ['filter', 'takeUntil'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/takeWhile',
    componentPath: 'filtering/take-while-example'
  },
  {
    id: 'debounce-time',
    name: 'debounceTime',
    category: 'filtering',
    description: 'Emits a notification from the source Observable only after a particular time span has passed without another source emission.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Search bar query debouncing', 'Auto-save form fields after typing pause', 'Window resize stabilization'],
    relatedOperators: ['throttleTime', 'auditTime'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/debounceTime',
    componentPath: 'filtering/debounce-time-example'
  },
  {
    id: 'throttle-time',
    name: 'throttleTime',
    category: 'filtering',
    description: 'Emits a value, then ignores subsequent source values for duration milliseconds.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Rapid button double-click throttling', 'Scroll position sampling', 'Limiting rate of high-frequency events'],
    relatedOperators: ['debounceTime', 'auditTime'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/throttleTime',
    componentPath: 'filtering/throttle-time-example'
  },
  {
    id: 'distinct-until-changed',
    name: 'distinctUntilChanged',
    category: 'filtering',
    description: 'Returns a result Observable that emits all items emitted by the source Observable that are distinct by comparison from previous item.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Eliminating redundant identical search queries', 'Suppressing identical route query params', 'State change deduplication'],
    relatedOperators: ['distinct', 'filter'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/distinctUntilChanged',
    componentPath: 'filtering/distinct-until-changed-example'
  },
  {
    id: 'first',
    name: 'first',
    category: 'filtering',
    description: 'Emits only the very first value (or first that meets condition), then completes.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Reading first valid state', 'Ensuring single emission before complete', 'Http request wrapping'],
    relatedOperators: ['take', 'last', 'single'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/first',
    componentPath: 'filtering/first-example'
  },
  {
    id: 'last',
    name: 'last',
    category: 'filtering',
    description: 'Emits only the last value (or the last value that satisfies the predicate) emitted by the source Observable upon completion.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Final aggregate inspection', 'Last message from completed transfer', 'Terminal value selection'],
    relatedOperators: ['first', 'takeLast'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/last',
    componentPath: 'filtering/last-example'
  },

  // --- Category 4: Combination ---
  {
    id: 'combine-latest',
    name: 'combineLatest',
    category: 'combination',
    description: 'Combines multiple Observables to create an Observable whose values are calculated from the latest values of each of its input Observables.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Combining filters, search text, pagination and sorting', 'Coordinated UI form state', 'Multi-source dashboard aggregation'],
    relatedOperators: ['forkJoin', 'withLatestFrom', 'zip'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/combineLatest',
    componentPath: 'combination/combine-latest-example'
  },
  {
    id: 'fork-join',
    name: 'forkJoin',
    category: 'combination',
    description: 'Accepts an Array of ObservableInput or a dictionary of ObservableInput and waits for complete Observables to emit their last values.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Wait for multiple parallel HTTP calls to finish', 'Initial page loader aggregating profile, permissions, and settings', 'Promise.all equivalent for observables'],
    relatedOperators: ['combineLatest', 'zip'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/forkJoin',
    componentPath: 'combination/fork-join-example'
  },
  {
    id: 'with-latest-from',
    name: 'withLatestFrom',
    category: 'combination',
    description: 'Combines the source Observable with other Observables to create an Observable whose values are calculated from the latest values of each, only when the source emits.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Submit button event taking current form value snapshot', 'Telemetry click event enriched with current user ID', 'Event-triggered state pairing without re-triggering on state change'],
    relatedOperators: ['combineLatest', 'zip'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/withLatestFrom',
    componentPath: 'combination/with-latest-from-example'
  },
  {
    id: 'merge',
    name: 'merge',
    category: 'combination',
    description: 'Creates an output Observable which concurrently emits all values from every given input Observable.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Combining multiple event streams (e.g. mouse clicks + touch events)', 'User action or timer timeout combined stream', 'Multi-channel notification inbox'],
    relatedOperators: ['concat', 'race'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/merge',
    componentPath: 'combination/merge-example'
  },
  {
    id: 'concat',
    name: 'concat',
    category: 'combination',
    description: 'Creates an output Observable which sequentially emits all values from the first given Observable and then moves on to the next.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Emit cached data first, followed by live fresh network stream', 'Step-by-step sequential guided tour', 'Chained queued animations'],
    relatedOperators: ['merge', 'startWith'],
    officialDocsUrl: 'https://rxjs.dev/api/index/function/concat',
    componentPath: 'combination/concat-example'
  },
  {
    id: 'start-with',
    name: 'startWith',
    category: 'combination',
    description: 'Returns an Observable that emits the items you specify as arguments before it begins to emit items emitted by the source Observable.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Providing initial loading or empty state', 'Triggering instant initial form evaluation', 'Default placeholder data'],
    relatedOperators: ['endWith', 'concat'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/startWith',
    componentPath: 'combination/start-with-example'
  },

  // --- Category 5: Error Handling & Recovery ---
  {
    id: 'catch-error',
    name: 'catchError',
    category: 'error-handling',
    description: 'Catches errors on the source Observable by returning a new Observable or throwing an error.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Graceful fallback to empty array or default cache', 'Isolating sub-stream errors inside switchMap', 'Mapping HTTP error status to localized messages'],
    relatedOperators: ['retry', 'throwError'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/catchError',
    componentPath: 'error-handling/catch-error-example'
  },
  {
    id: 'retry',
    name: 'retry',
    category: 'error-handling',
    description: 'Returns an Observable that mirrors the source Observable with the exception of an error; if error happens, resubscribes with configurable count or backoff delay.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Retry transient 503/network failures with exponential backoff', 'Re-attempting idempotent read requests', 'Auto-reconnecting live stream'],
    relatedOperators: ['catchError', 'retryWhen'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/retry',
    componentPath: 'error-handling/retry-example'
  },
  {
    id: 'throw-if-empty',
    name: 'throwIfEmpty',
    category: 'error-handling',
    description: 'Emits an error if the source Observable completes without emitting any value.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Treat empty search or resource response as 404 domain error', 'Ensuring required stream emissions exist before continuing'],
    relatedOperators: ['defaultIfEmpty', 'catchError'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/throwIfEmpty',
    componentPath: 'error-handling/throw-if-empty-example'
  },

  // --- Category 6: Utility & Lifecycle ---
  {
    id: 'tap',
    name: 'tap',
    category: 'utility',
    description: 'Used to perform side-effects for notifications from the source observable without modifying the stream values.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Diagnostic logging/debugging streams', 'Triggering UI notifications', 'Updating analytical event metrics'],
    relatedOperators: ['finalize', 'map'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/tap',
    componentPath: 'utility/tap-example'
  },
  {
    id: 'finalize',
    name: 'finalize',
    category: 'utility',
    description: 'Call a specified function when the source terminates on complete, error, or unsubscription.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Reset loading spinners on success, failure, or user cancel', 'Closing open file/socket handles', 'Cleaning up temporary allocated resources'],
    relatedOperators: ['tap'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/finalize',
    componentPath: 'utility/finalize-example'
  },
  {
    id: 'delay',
    name: 'delay',
    category: 'utility',
    description: 'Delays the emission of items from the source Observable by a given timeout or until a given Date.',
    difficulty: 'beginner',
    status: 'recommended',
    useCases: ['Simulating network latency in mocks', 'Staggering animation cues', 'Delayed toast dismissal'],
    relatedOperators: ['timer', 'delayWhen'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/delay',
    componentPath: 'utility/delay-example'
  },
  {
    id: 'timeout',
    name: 'timeout',
    category: 'utility',
    description: 'Errors if the source Observable does not emit a value within the specified time span.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Enforcing strict SLA deadlines on API requests', 'Timeout unfulfilled RPC calls', 'Network degradation fallbacks'],
    relatedOperators: ['delay', 'catchError'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/timeout',
    componentPath: 'utility/timeout-example'
  },

  // --- Category 7: Multicasting & Sharing ---
  {
    id: 'share',
    name: 'share',
    category: 'multicasting',
    description: 'Returns a new Observable that multicasts (shares) the original Observable with reference counting.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Share single WebSocket or sensor subscription among multiple components', 'Prevent duplicate execution of expensive pipeline'],
    relatedOperators: ['shareReplay'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/share',
    componentPath: 'multicasting/share-example'
  },
  {
    id: 'share-replay',
    name: 'shareReplay',
    category: 'multicasting',
    description: 'Share source and replay specified number of emissions on future subscriptions with configurable refCount.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Client-side caching of HTTP GET responses', 'Replaying current authenticated user profile to late subscribers', 'Config data sharing across routes'],
    relatedOperators: ['share'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/shareReplay',
    componentPath: 'multicasting/share-replay-example'
  },

  // --- Category 8: Time-based ---
  {
    id: 'sample-time',
    name: 'sampleTime',
    category: 'time-based',
    description: 'Emits the most recently emitted value from the source Observable within periodic time intervals.',
    difficulty: 'intermediate',
    status: 'recommended',
    useCases: ['Sampling cursor mouse movements for canvas drawing', 'Sampling scroll progress bar updates', 'Throttling high volume metrics'],
    relatedOperators: ['throttleTime', 'auditTime'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/sampleTime',
    componentPath: 'time-based/sample-time-example'
  },

  // --- Category 10: Legacy / Deprecated / Specialized ---
  {
    id: 'pluck',
    name: 'pluck',
    category: 'legacy',
    description: 'Maps each source value to its specified nested property. Deprecated: use map(x => x?.prop) instead.',
    difficulty: 'beginner',
    status: 'deprecated',
    useCases: ['Legacy codebase maintenance', 'Migration to standard map operator with optional chaining'],
    relatedOperators: ['map'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/pluck',
    componentPath: 'legacy/pluck-example'
  },
  {
    id: 'map-to',
    name: 'mapTo',
    category: 'legacy',
    description: 'Emits the given constant on each emission. Deprecated: use map(() => constant) instead.',
    difficulty: 'beginner',
    status: 'deprecated',
    useCases: ['Legacy codebase maintenance', 'Migration to arrow function map'],
    relatedOperators: ['map'],
    officialDocsUrl: 'https://rxjs.dev/api/operators/mapTo',
    componentPath: 'legacy/map-to-example'
  }
];

export const OPERATOR_MAP = new Map<string, OperatorDefinition>(
  OPERATOR_CATALOG.map(op => [op.id, op])
);
