import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of, Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, map, delay } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-switch-map-example',
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
        (run)="triggerPredefinedSequence()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <!-- Interactive Controls -->
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              In real-world web apps, users type unpredictably and network delays fluctuate. 
              These controls let you manipulate outer event frequency and inner response timing to observe 
              how <code>switchMap</code> guarantees <strong>latest-value-wins</strong> and terminates stale in-flight work.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Interactive Search Input:</strong> Dispatches typed characters to the stream. Typing multiple characters triggers new inner requests.</li>
              <li><strong>Simulated Network Delay:</strong> Adjusts how long the backend takes to respond. Higher latency exposes race conditions if wrong operators are used.</li>
              <li><strong>Debounce Time:</strong> Configures quiet-period stabilization before triggering the network call.</li>
              <li><strong>⚡ Fast User Burst Typing:</strong> Simulates automated typing ("A" &rarr; "An" &rarr; "Ang") faster than the API can respond, visually demonstrating cancellation of "A" and "An".</li>
            </ul>
          </div>

          <div class="field-group">
            <label class="field-label">Interactive Search Box (Latest Query Wins):</label>
            <div class="search-input-wrap">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="onQueryInput($event)"
                class="ctrl-input" 
                placeholder="Type quickly: e.g. ang, angular, rxjs..."
              />
              <span class="active-badge" *ngIf="activeInnerRequests > 0">
                Active In-flight: {{ activeInnerRequests }}
              </span>
            </div>
            <span class="hint-text">Each typed character dispatches an inner simulated HTTP call. Watch preceding requests cancel!</span>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Simulated Network Delay (ms):</label>
              <input type="number" [(ngModel)]="mockDelayMs" min="100" max="2000" step="100" class="ctrl-input num-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Debounce Time (ms):</label>
              <input type="number" [(ngModel)]="debounceMs" min="0" max="1000" step="50" class="ctrl-input num-input" />
            </div>
          </div>

          <div class="quick-sim-buttons">
            <button class="sim-btn" (click)="simulateBurstTyping()">
              ⚡ Simulate Fast User Burst Typing ("A" -> "An" -> "Ang")
            </button>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Experiment & Check Live Telemetry:</strong>
            <ol>
              <li>Click <strong>⚡ Simulate Fast User Burst Typing</strong> or type rapid letters into the box.</li>
              <li>Watch the <strong>Telemetry Output Console</strong> on the right: notice how requests for "A" and "An" receive an immediate <span class="badge badge-utility">UNSUBSCRIBE</span> event before their timer expires.</li>
              <li>Only the final query ("Ang") completes and delivers data into the stream, proving previous requests were safely cancelled.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">debounceTime(300)</span>
              <span class="token-desc">Waits until the user pauses typing for 300ms. Prevents firing an HTTP request for every single keystroke.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">distinctUntilChanged()</span>
              <span class="token-desc">Ignores consecutive identical emissions (e.g., user presses arrow key or backspaces and retypes the same letter).</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">switchMap(term =&gt; ...)</span>
              <span class="token-desc"><strong>The core switch:</strong> Takes the query term and maps it to an inner HTTP Observable. If a new term arrives while an HTTP call is in-flight, it unsubscribes the previous call and subscribes to the new one.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">catchError(() =&gt; of([]))</span>
              <span class="token-desc"><strong>Inner error isolation:</strong> Catches network errors on the inner stream and returns a fallback array. This prevents the outer <code>searchControl.valueChanges</code> stream from permanently dying.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Explanation -->
        <div explanation>
          <h4>Semantics: Why <code>switchMap</code> Cancels Previous Subscriptions</h4>
          <p>
            When a new value arrives from the outer source, <code>switchMap</code> immediately <strong>unsubscribes</strong> from any currently running inner Observable and subscribes to the newly returned Observable.
          </p>
          <div class="callout callout-warning">
            <strong>Critical Enterprise Architectural Fact:</strong>
            <p>
              When used with Angular's <code>HttpClient</code>, unsubscribing from the inner observable triggers an <code>AbortController.abort()</code> or cancels the underlying browser <code>XMLHttpRequest</code>.
              However: <strong>client cancellation does NOT guarantee the server cancelled execution</strong> if the HTTP request already arrived at the backend! Therefore, never use <code>switchMap</code> for non-idempotent operations like payment charges or account updates; use <code>concatMap</code> or <code>exhaustMap</code> instead.
            </p>
          </div>

          <div class="callout callout-info">
            <strong>Where to place <code>catchError</code>:</strong>
            <p>
              Always place <code>catchError</code> <em>inside</em> the inner pipeline passed to <code>switchMap</code>. If placed outside, any single HTTP failure will permanently complete/terminate the outer search stream!
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Dynamic Master-Detail Router Sync</h5>
              <p>
                When a user clicks rapidly through table rows or master lists (e.g., customer profiles), <code>switchMap</code> ensures that clicking Customer #32 immediately cancels the fetching of Customer #31, eliminating out-of-order stale data rendering.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Live Filter & Facet Coordination</h5>
              <p>
                In enterprise analytics dashboards with 10+ filter dropdowns (date range, tenant ID, status), binding form changes through <code>switchMap</code> discards obsolete query payloads as filters change.
              </p>
            </div>
          </div>
        </div>
      </app-operator-example-layout>
    }
  `,
  styles: [`
    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .field-row {
      display: flex;
      gap: 1rem;
    }
    .num-input {
      max-width: 140px;
    }
    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .search-input-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .ctrl-input {
      flex: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
    }
    .ctrl-input:focus {
      border-color: var(--border-focus);
    }
    .hint-text {
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    .active-badge {
      background: rgba(245, 158, 11, 0.2);
      color: var(--accent-amber);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .quick-sim-buttons {
      margin-top: 0.25rem;
    }
    .control-purpose-list {
      margin: 0.4rem 0 0 0;
      padding-left: 1.25rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .control-purpose-list strong {
      color: var(--accent-cyan);
    }
    .code-breakdown-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .breakdown-row {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
    }
    .code-token {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .token-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .production-use-cases {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    @media (max-width: 640px) {
      .production-use-cases { grid-template-columns: 1fr; }
    }
    .use-case-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.75rem;
    }
    .use-case-card h5 {
      margin: 0 0 0.35rem 0;
      font-size: 0.85rem;
      color: #38bdf8;
      font-weight: 600;
    }
    .use-case-card p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .tutorial-instructions {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .tutorial-instructions strong {
      color: var(--text-main);
      display: block;
      margin-bottom: 2px;
    }
    .how-to-verify {
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border-subtle);
      border-radius: 6px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .how-to-verify strong {
      color: var(--accent-emerald);
    }
    .how-to-verify ol {
      padding-left: 1.25rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .sim-btn {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .sim-btn:hover {
      background: rgba(99, 102, 241, 0.25);
    }
    .callout {
      padding: 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    .callout-warning {
      background: rgba(245, 158, 11, 0.08);
      border-left: 3px solid var(--accent-amber);
      color: var(--text-main);
    }
    .callout-info {
      background: rgba(6, 182, 212, 0.08);
      border-left: 3px solid var(--accent-cyan);
      color: var(--text-main);
      margin-top: 0.5rem;
    }
  `]
})
export class SwitchMapExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  searchQuery = '';
  mockDelayMs = 400;
  debounceMs = 150;
  activeInnerRequests = 0;
  events: StreamEvent[] = [];
  isRunning = false;

  private readonly searchSubject$ = new Subject<string>();
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Production Search Autocomplete Pipeline
readonly results$ = this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => {
    // Inner HTTP request: cancels if a new term arrives!
    return this.http.get<SearchResult[]>('/api/search', { params: { q: term } }).pipe(
      // Keep outer pipeline alive on error
      catchError(err => {
        this.logError(err);
        return of([]);
      })
    );
  })
);`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('switch-map');
    this.initStream();
  }

  private initStream(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    this.startTime = Date.now();
    this.sub = this.searchSubject$.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      tap(query => {
        this.record('next', `Outer Query: "${query}" (Starting inner stream)`);
      }),
      switchMap(query => {
        this.activeInnerRequests++;
        this.isRunning = true;
        const reqId = query;
        this.record('subscribe', `Subscribed to inner simulated HTTP [query="${query}"]`);

        // Return simulated async HTTP call
        return of({
          query,
          matchedResults: [`Result for ${query} #1`, `Result for ${query} #2`]
        }).pipe(
          delay(this.mockDelayMs),
          tap({
            next: (data) => {
              this.activeInnerRequests = Math.max(0, this.activeInnerRequests - 1);
              if (this.activeInnerRequests === 0) this.isRunning = false;
              this.record('next', data);
            },
            unsubscribe: () => {
              this.activeInnerRequests = Math.max(0, this.activeInnerRequests - 1);
              this.record('unsubscribe', `Cancelled inner request for "${reqId}"`);
            }
          })
        );
      })
    ).subscribe({
      next: () => {},
      error: (err) => this.record('error', err)
    });
  }

  onQueryInput(query: string): void {
    if (!this.sub) this.initStream();
    this.searchSubject$.next(query);
  }

  updateDebounce(ms: number): void {
    this.debounceMs = ms;
    this.initStream();
  }

  simulateBurstTyping(): void {
    const chars = ['A', 'An', 'Ang'];
    chars.forEach((term, idx) => {
      setTimeout(() => {
        this.searchQuery = term;
        this.onQueryInput(term);
      }, idx * 100); // 100ms apart (faster than mock delay)
    });
  }

  triggerPredefinedSequence(): void {
    this.simulateBurstTyping();
  }

  resetStream(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    this.searchQuery = '';
    this.events = [];
    this.isRunning = false;
    this.activeInnerRequests = 0;
    this.initStream();
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
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
