import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Observable, Subscription } from 'rxjs';
import { shareReplay, tap, delay } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-share-replay-example',
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
              In Angular applications, multiple components or <code>async</code> pipes frequently request the exact same remote resource (e.g., Current User, Tenant Config).
              <code>shareReplay({{ '{' }} bufferSize: 1, refCount: true {{ '}' }})</code> shares a single upstream HTTP execution and replays the cached result to future late subscribers.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Connect Subscriber A:</strong> Triggers the initial upstream HTTP request. Latency is simulated at 500ms.</li>
              <li><strong>Connect Subscriber B (Late Subscriber):</strong> Connects after the response has arrived. Receives the cached payload <strong>instantly (0ms latency)</strong> without firing another HTTP call.</li>
              <li><strong>Invalidate Cache Button:</strong> Simulates a user mutation or cache bust, resetting the replay buffer so the next subscriber triggers fresh data.</li>
            </ul>
          </div>

          <div class="subscriber-controls">
            <button class="subscriber-btn" (click)="subscribeSubscriberA()" [disabled]="isSubscribedA">
              {{ isSubscribedA ? '✅ Subscriber A Connected' : '➕ Connect Subscriber A' }}
            </button>
            <button class="subscriber-btn" (click)="subscribeSubscriberB()" [disabled]="isSubscribedB">
              {{ isSubscribedB ? '✅ Subscriber B Connected' : '➕ Connect Subscriber B (Late Subscriber)' }}
            </button>
            <button class="reset-cache-btn" (click)="invalidateCache()">
              🔄 Invalidate Cache
            </button>
          </div>

          <div class="cache-telemetry-badge">
            <span>Upstream Backend HTTP Calls Triggered: <strong class="call-count">{{ backendCallCount }}</strong></span>
            <span class="cache-status">{{ backendCallCount === 1 ? '⚡ HTTP Response Cached in Memory' : 'No active cache' }}</span>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check HTTP Deduplication:</strong>
            <ol>
              <li>Click <strong>➕ Connect Subscriber A</strong>:
                Notice an upstream HTTP call is triggered (HTTP Calls: 1), simulated network delay passes, and Subscriber A receives the live response.
              </li>
              <li>Click <strong>➕ Connect Subscriber B (Late Subscriber)</strong>:
                Notice HTTP Calls stays at 1! Subscriber B receives the cached emission <strong>instantly (0ms latency)</strong> without re-executing the network request.
              </li>
              <li>Click <strong>🔄 Invalidate Cache</strong> and connect again:
                The cache resets and a new upstream fetch occurs.
              </li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">bufferSize: 1</span>
              <span class="token-desc">Specifies how many previous emissions to record and replay to new late subscribers. In HTTP caching, this is almost always set to 1.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">refCount: true</span>
              <span class="token-desc"><strong>Critical Memory Rule:</strong> Automatically unsubscribes from upstream when subscriber count drops to 0, preventing memory leaks when views are destroyed.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Multicast Hot Conversion</span>
              <span class="token-desc">Converts a cold HTTP Observable (which would otherwise re-execute for every <code>async</code> pipe) into a shared hot ReplaySubject proxy.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: HTTP Request Caching & refCount Semantics</h4>
          <p>
            Always configure <code>refCount: true</code> in Angular applications (<code>shareReplay({{ '{' }} bufferSize: 1, refCount: true {{ '}' }})</code>).
            Without <code>refCount: true</code>, the stream retains an active upstream connection indefinitely even after all consumers unsubscribe, causing subtle memory leaks.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ shareReplay is an In-Memory Multicaster, NOT a Full Cache:</strong>
            <p>
              <code>shareReplay</code> does not have built-in TTL expiration or tag-based invalidation. For complex caching across routes, wrap <code>shareReplay</code> in a dedicated service cache dictionary with explicit timestamp invalidation.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Current User Profile Caching</h5>
              <p>
                A navbar, sidebar, and dashboard page all requesting <code>authService.currentUser$</code> in the same view. <code>shareReplay(1)</code> deduplicates 3 HTTP requests into 1.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Static Reference Data (Lookup Tables)</h5>
              <p>
                Country lists, currency rates, and tax jurisdictions loaded once during application bootstrap and shared across dozens of form components.
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
    .subscriber-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .subscriber-btn { background: rgba(99, 102, 241, 0.15); border: 1px solid var(--accent-indigo); color: var(--text-main); padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .subscriber-btn:disabled { opacity: 0.5; cursor: not-allowed; border-color: transparent; }
    .reset-cache-btn { background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f43f5e; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; margin-left: auto; }
    .cache-telemetry-badge { display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.02); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 0.85rem; }
    .call-count { color: var(--accent-emerald); font-size: 1.1rem; }
    .cache-status { color: var(--text-dim); font-size: 0.8rem; }
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
    .callout { padding: 0.85rem; border-radius: 6px; font-size: 0.85rem; line-height: 1.5; }
    .callout-warning { background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); color: var(--text-main); margin-top: 0.5rem; }
  `]
})
export class ShareReplayExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  backendCallCount = 0;
  isSubscribedA = false;
  isSubscribedB = false;

  private cachedStream$?: Observable<any>;
  private subA?: Subscription;
  private subB?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Reusable HTTP Response Caching
private userProfileCache$?: Observable<UserProfile>;

getUserProfile(): Observable<UserProfile> {
  if (!this.userProfileCache$) {
    this.userProfileCache$ = this.http.get<UserProfile>('/api/me').pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
  return this.userProfileCache$;
}`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('share-replay');
    this.initSharedStream();
  }

  initSharedStream(): void {
    this.backendCallCount = 0;
    this.cachedStream$ = of({
      tenantId: 'ACME-CORP',
      plan: 'ENTERPRISE-ELITE',
      cachedAt: new Date().toLocaleTimeString()
    }).pipe(
      delay(300),
      tap(() => {
        this.backendCallCount++;
        this.record('subscribe', `[Upstream HTTP Dispatched] Executed network GET /api/tenant (Total Calls: ${this.backendCallCount})`);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  executeStream(): void {
    // Default Run runs both in sequence
    this.resetStream();
    this.initSharedStream();
    this.subscribeSubscriberA();
  }

  subscribeSubscriberA(): void {
    if (!this.cachedStream$ || this.isSubscribedA) return;
    this.isRunning = true;
    this.isSubscribedA = true;
    this.startTime = Date.now();

    this.record('subscribe', 'Subscriber A connecting to shared stream...');
    this.subA = this.cachedStream$.subscribe(data => {
      this.record('next', { subscriber: 'Subscriber A', data, latency: `${Date.now() - this.startTime}ms` });
    });
  }

  subscribeSubscriberB(): void {
    if (!this.cachedStream$ || this.isSubscribedB) return;
    this.isRunning = true;
    this.isSubscribedB = true;
    const clickTime = Date.now();

    this.record('subscribe', 'Subscriber B (Late Subscriber) connecting...');
    this.subB = this.cachedStream$.subscribe(data => {
      this.record('next', { subscriber: 'Subscriber B (From Replay Buffer)', data, latency: `${Date.now() - clickTime}ms` });
    });
  }

  invalidateCache(): void {
    this.record('unsubscribe', '🔄 Cache invalidated. Recreating fresh upstream observable.');
    this.resetStream();
    this.initSharedStream();
  }

  resetStream(): void {
    if (this.subA) {
      this.subA.unsubscribe();
      this.subA = undefined;
    }
    if (this.subB) {
      this.subB.unsubscribe();
      this.subB = undefined;
    }
    this.isSubscribedA = false;
    this.isSubscribedB = false;
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
