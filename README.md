# RxJS Operator Studio

> **Interactive Spatial UI workbench & visual laboratory for RxJS and Angular.** Explore 40+ operators with real-time stream execution, live marble telemetry, cancellation & lifecycle debugging, and battle-tested enterprise architectures with deterministic testing.

---

## 🌟 Highlights & Features

- **Spatial UI & visionOS Aesthetic**: Floating frosted glass panels, ambient radiant lighting, specular reflections, tactile elevation, and high-contrast dark & light themes.
- **Dedicated Operator Laboratories**: Dedicated interactive components for over 40+ creation, transformation, filtering, combination, error handling, utility, multicasting, and time-based operators.
- **Real-Time Stream Telemetry**:
  - Live **Event Timeline** (clock & virtual tick representation)
  - Interactive **Telemetry Console** tracing `next`, `complete`, `error`, `subscribe`, and `unsubscribe` events with millisecond precision
- **The Concurrency Four Comparison**: Side-by-side behavioral topologies for `switchMap`, `mergeMap`, `concatMap`, and `exhaustMap`.
- **Hot Observables & Subjects Workbench**: Hands-on inspection of `Subject`, `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject` with dynamic late/early consumer connections.
- **7 End-to-End Enterprise Architectural Scenarios**:
  1. **Search Autocomplete & Live Typeahead** (debouncing, query distinctness, cancellation, failure isolation)
  2. **Multi-Source API Dashboard** (`forkJoin`, `combineLatest`, coordinated filter states, and fallback mocks)
  3. **Order Submission Workflow** (duplicate-click exhaust guard, serialized queues, client cancel vs server rollback)
  4. **Resilient API Client** (exponential backoff retry policies, SLA timeout barriers)
  5. **Real-Time Live Activity Feed** (stream merge, scan state accumulation, burst windowing, cleanup)
  6. **Client-Side Cache Layer** (request deduplication, shareReplay, TTL expiration, reference counting)
  7. **Reactive Form Async Server Validation** (cross-field validation, server race-condition prevention)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.19.0+ or v20+)
- npm (v9+)

### Installation
```bash
git clone https://github.com/Soumyagit123/RxJS-Operator-Studio.git
cd RxJS-Operator-Studio
npm install
```

### Running Locally
```bash
npm start
# or: ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you modify any source files.

### Testing
Execute the complete test suite (119 passing tests covering operators and scenarios):
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 🏗️ Architecture

- **Angular 17+**: Standalone components, modern Signals, and Angular router.
- **RxJS 7.8**: Strict typing, functional pipelines, pure stream boundaries, and marble testability.
- **Pure CSS Design System**: Custom Spatial visionOS design tokens with zero Tailwind overhead, optimized for contrast and silky-smooth rendering.

