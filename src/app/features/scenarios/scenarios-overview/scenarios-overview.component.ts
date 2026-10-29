import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-scenarios-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="scenarios-page">
      <div class="page-header">
        <h1 class="page-title">Enterprise RxJS Scenarios</h1>
        <p class="page-sub">
          7 comprehensive end-to-end architectural scenarios demonstrating real enterprise workflows.
        </p>
      </div>

      <div class="scenarios-grid">
        @for (scenario of scenarios; track scenario.id) {
          <a [routerLink]="['/scenarios', scenario.id]" class="scenario-card glass-panel interactive-card">
            <div class="card-top">
              <span class="scenario-num">{{ scenario.num }}</span>
              <span class="badge badge-utility">{{ scenario.badge }}</span>
            </div>
            <h3 class="scenario-title">{{ scenario.title }}</h3>
            <p class="scenario-desc">{{ scenario.description }}</p>
            <div class="op-tags">
              @for (op of scenario.operators; track op) {
                <span class="op-tag"><code>{{ op }}</code></span>
              }
            </div>
            <div class="card-action">
              <span>Launch Interactive Lab →</span>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .scenarios-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.03em;
    }
    .page-sub {
      color: var(--text-muted);
      font-size: 1rem;
      margin-top: 0.35rem;
    }
    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }
    .scenario-card {
      padding: 1.75rem;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-decoration: none;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-md);
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .scenario-card:hover {
      transform: translateY(-4px) scale(1.01);
      border-color: var(--border-focus);
      background: var(--bg-card-hover);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .scenario-num {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--accent-cyan);
      font-family: var(--font-mono);
      letter-spacing: 0.05em;
    }
    .scenario-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .scenario-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.55;
      flex: 1;
    }
    .op-tags {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-subtle);
    }
    .op-tag {
      font-size: 0.78rem;
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      padding: 3px 8px;
      border-radius: 6px;
      color: var(--accent-indigo);
      font-weight: 700;
    }
    .card-action {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--accent-cyan);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.25rem;
      transition: transform 0.2s;
    }
    .scenario-card:hover .card-action {
      transform: translateX(4px);
    }
  `]
})
export class ScenariosOverviewComponent {
  readonly scenarios = [
    {
      id: 'search-autocomplete',
      num: 'SCENARIO A',
      badge: 'Phase 4',
      title: 'Search Autocomplete & Live Typeahead',
      description: 'Debounced search with duplicate query elimination, latest-request-wins cancellation, loading tracking, and isolated error boundaries.',
      operators: ['debounceTime', 'distinctUntilChanged', 'switchMap', 'catchError', 'finalize']
    },
    {
      id: 'api-dashboard',
      num: 'SCENARIO B',
      badge: 'Phase 4',
      title: 'Multi-Source API Dashboard',
      description: 'Concurrent aggregation of users, orders, and system metrics with coordinated filter state and isolated service failure fallbacks.',
      operators: ['forkJoin', 'combineLatest', 'startWith', 'map', 'catchError']
    },
    {
      id: 'order-workflow',
      num: 'SCENARIO C',
      badge: 'Phase 4',
      title: 'Order Workflow & Flattening Comparison',
      description: 'Prevent duplicate double-click submissions, queue sequential transaction records, and clarify why client cancel does not undo server transactions.',
      operators: ['exhaustMap', 'concatMap', 'switchMap', 'catchError']
    },
    {
      id: 'reliable-api-client',
      num: 'SCENARIO D',
      badge: 'Phase 4',
      title: 'Reliable API Client with Bounded Retries',
      description: 'Resilient HTTP client simulating transient 503 errors, bounded exponential backoff retry policies, and strict SLA request timeouts.',
      operators: ['retry', 'timeout', 'catchError', 'tap', 'finalize']
    },
    {
      id: 'live-activity-feed',
      num: 'SCENARIO E',
      badge: 'Phase 4',
      title: 'Live Real-time Activity Feed',
      description: 'Multi-stream event merger, accumulated state windowing, burst batching, and declarative component teardown unsubscription.',
      operators: ['scan', 'merge', 'bufferTime', 'takeUntil', 'share']
    },
    {
      id: 'caching-layer',
      num: 'SCENARIO F',
      badge: 'Phase 4',
      title: 'Client-side Multi-Subscriber Caching',
      description: 'Multi-subscriber HTTP request sharing, cache TTL expiration, reference counting, and why shareReplay is not an entire cache solution on its own.',
      operators: ['shareReplay', 'defer', 'switchMap', 'tap']
    },
    {
      id: 'reactive-forms',
      num: 'SCENARIO G',
      badge: 'Phase 4',
      title: 'Reactive Form Async Server Validation',
      description: 'Asynchronous username and email availability validator with race condition prevention and in-flight cancellation.',
      operators: ['valueChanges', 'debounceTime', 'switchMap', 'distinctUntilChanged']
    }
  ];
}
