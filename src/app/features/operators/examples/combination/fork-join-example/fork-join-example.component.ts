import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, timer, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-fork-join-example',
  standalone: true,
  imports: [CommonModule, FormsModule, OperatorExampleLayoutComponent],
  template: `
    @if (operator) {
      <app-operator-example-layout
        [operator]="operator"
        [code]="codeSnippet"
        [events]="events"
        [isRunning]="isRunning"
        [isFavorite]="catalogService.isFavorite(operator.id)"
        [isCompleted]="catalogService.isCompleted(operator.id)"
        (run)="executeStream()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              In enterprise dashboards, fetching data sequentially results in waterfalls and cumulative latency.
              <code>forkJoin</code> runs multiple Observables in parallel and waits for <strong>ALL of them to complete</strong>, then emits one combined dictionary with the final value of each stream.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Endpoint Latency Sliders:</strong> Customize response latency for 3 separate microservice endpoints (User Profile, Recent Orders, App Settings).</li>
              <li><strong>Parallel Execution Verification:</strong> Observe that total pipeline wall-clock time equals only the slowest individual endpoint (e.g. <code>max(user, orders, settings)</code>), not the sum!</li>
              <li><strong>▶ Run Stream:</strong> Triggers parallel dispatch and telemetry logging.</li>
            </ul>
          </div>

          <div class="endpoint-grid">
            <div class="endpoint-card">
              <span class="ep-title">👤 User Profile API</span>
              <label class="field-label">Latency (ms):</label>
              <input type="number" [(ngModel)]="userDelay" min="100" max="2000" step="100" class="ctrl-input" />
            </div>

            <div class="endpoint-card">
              <span class="ep-title">📦 Recent Orders API</span>
              <label class="field-label">Latency (ms):</label>
              <input type="number" [(ngModel)]="ordersDelay" min="100" max="2000" step="100" class="ctrl-input" />
            </div>

            <div class="endpoint-card">
              <span class="ep-title">⚙️ App Settings API</span>
              <label class="field-label">Latency (ms):</label>
              <input type="number" [(ngModel)]="settingsDelay" min="100" max="2000" step="100" class="ctrl-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Parallel Joining:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Notice telemetry logs: all 3 HTTP streams subscribe simultaneously at <code>+0ms</code>.</li>
              <li>When the fast API finishes, <code>forkJoin</code> holds emission. Only when the slowest API completes does <code>forkJoin</code> emit the full object <code>&#123; user, orders, settings &#125;</code> and complete immediately.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">forkJoin(&#123; user$, orders$, settings$ &#125;)</span>
              <span class="token-desc">Pass a dictionary of Observables. Returns an Observable that emits an object with identical keys once all sources complete.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Last-Value Semantic</span>
              <span class="token-desc"><code>forkJoin</code> only emits the *last* value from each source Observable. Intermediate values are discarded.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Completion Requirement</span>
              <span class="token-desc">Every input Observable *must* complete. If a source stream never completes, <code>forkJoin</code> will never emit.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Multi-Resource Initial Page Loading</h4>
          <p>
            <code>forkJoin</code> is the RxJS equivalent of <code>Promise.all()</code>. In enterprise Angular route resolvers and initial page dashboards, it is the primary tool for loading independent API endpoints concurrently.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ Must Complete Rule:</strong>
            <p>
              If any of the inner Observables passed to <code>forkJoin</code> does not complete (or emits an error), <code>forkJoin</code> will never emit! Always ensure long-lived streams (like web sockets or Subjects) are paired with <code>take(1)</code> before passing to <code>forkJoin</code>.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Angular Route Resolver Pre-fetch</h5>
              <p>
                Resolving user profile, global feature flags, and tenant permissions concurrently before permitting navigation into an admin portal.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Multi-Part Form Data Persistence</h5>
              <p>
                Submitting a complex wizard form where payment verification, address validation, and customer notes are dispatched to 3 separate backend services simultaneously.
              </p>
            </div>
          </div>
        </div>
      </app-operator-example-layout>
    }
  `,
  styles: [`
    .controls-panel { display: flex; flex-direction: column; gap: 1rem; }
    .tutorial-instructions { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
    .tutorial-instructions strong { color: var(--text-main); display: block; margin-bottom: 2px; }
    .control-purpose-list {
      margin: 0.4rem 0 0 0;
      padding-left: 1.25rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .control-purpose-list strong { color: var(--accent-cyan); }
    .endpoint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    @media (max-width: 768px) { .endpoint-grid { grid-template-columns: 1fr; } }
    .endpoint-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.35rem; }
    .ep-title { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
    .field-label { font-size: 0.75rem; color: var(--text-dim); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.4rem 0.6rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .code-breakdown-table { display: flex; flex-direction: column; gap: 0.5rem; }
    .breakdown-row { display: flex; flex-direction: column; gap: 0.2rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; }
    .code-token { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600; }
    .token-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .production-use-cases { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    @media (max-width: 640px) { .production-use-cases { grid-template-columns: 1fr; } }
    .use-case-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.75rem; }
    .use-case-card h5 { margin: 0 0 0.35rem 0; font-size: 0.85rem; color: #38bdf8; font-weight: 600; }
    .use-case-card p { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
    .callout { padding: 0.85rem; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); font-size: 0.85rem; margin-top: 0.75rem; }
  `]
})
export class ForkJoinExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  userDelay = 300;
  ordersDelay = 600;
  settingsDelay = 200;

  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Concurrent Dashboard Aggregation
forkJoin({
  profile: this.http.get<UserProfile>('/api/profile'),
  orders: this.http.get<Order[]>('/api/orders'),
  settings: this.http.get<AppSettings>('/api/settings')
}).subscribe({
  next: (dashboardData) => this.renderDashboard(dashboardData),
  error: (err) => this.showGlobalError(err)
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('fork-join');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Dispatched 3 parallel HTTP calls. Max latency: ${Math.max(this.userDelay, this.ordersDelay, this.settingsDelay)}ms`);

    const profile$ = timer(this.userDelay).pipe(
      map(() => ({ id: 'USR-891', name: 'Dev Lead', role: 'admin' })),
      tap(() => this.record('subscribe', `Profile API finished at +${Date.now() - this.startTime}ms (waiting for other streams)`))
    );

    const orders$ = timer(this.ordersDelay).pipe(
      map(() => ([{ id: 'ORD-101', total: 420.50 }])),
      tap(() => this.record('subscribe', `Orders API finished at +${Date.now() - this.startTime}ms (waiting for other streams)`))
    );

    const settings$ = timer(this.settingsDelay).pipe(
      map(() => ({ theme: 'dark', notifications: true })),
      tap(() => this.record('subscribe', `Settings API finished at +${Date.now() - this.startTime}ms (waiting for other streams)`))
    );

    this.sub = forkJoin({
      profile: profile$,
      orders: orders$,
      settings: settings$
    }).pipe(
      tap(result => this.record('next', result))
    ).subscribe({
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err) => {
        this.record('error', err);
        this.isRunning = false;
      }
    });
  }

  resetStream(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    this.events = [];
    this.isRunning = false;
  }

  private record(type: any, value?: any): void {
    this.events.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now() - this.startTime,
      type,
      value
    });
  }

  ngOnDestroy(): void {
    this.resetStream();
  }
}
