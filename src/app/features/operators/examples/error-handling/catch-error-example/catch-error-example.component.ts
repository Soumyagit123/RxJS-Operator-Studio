import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-catch-error-example',
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
              Unhandled errors in RxJS completely terminate the stream and tear down all subscribers.
              <code>catchError</code> intercepts an unhandled error notification from upstream. 
              These controls let you test and contrast the two primary recovery strategies.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Return Fallback Strategy:</strong> Recovers from an API failure by returning <code>of(fallbackData)</code>. Downstream subscribers receive the safe payload and the stream completes gracefully without crashing the UI.</li>
              <li><strong>Rethrow Domain Error Strategy:</strong> Logs diagnostic telemetry to Sentry/Datadog and rethrows a sanitized DomainException via <code>throwError</code> to trigger an Angular global error toast.</li>
              <li><strong>▶ Run Stream:</strong> Simulates an upstream 500 server crash to trigger your chosen recovery policy.</li>
            </ul>
          </div>

          <div class="strategy-selector-grid">
            <label class="strategy-card" [class.selected]="recoveryStrategy === 'fallback'">
              <input type="radio" [(ngModel)]="recoveryStrategy" value="fallback" name="strat" />
              <div class="strategy-info">
                <strong>Return Fallback (Graceful Recovery)</strong>
                <span>Emits safe fallback payload and completes cleanly.</span>
              </div>
            </label>

            <label class="strategy-card" [class.selected]="recoveryStrategy === 'rethrow'">
              <input type="radio" [(ngModel)]="recoveryStrategy" value="rethrow" name="strat" />
              <div class="strategy-info">
                <strong>Rethrow Domain Error</strong>
                <span>Intercepts, logs telemetry, and re-throws transformed error.</span>
              </div>
            </label>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Error Resilience:</strong>
            <ol>
              <li>Select <strong>Return Fallback</strong> and click <strong>▶ Run Stream</strong>:
                Notice how the upstream <code>500 Server Error</code> is caught, a fallback value <code>[Cached Offline Data]</code> is emitted, and the stream completes with status <code>COMPLETE</code> instead of failing.
              </li>
              <li>Select <strong>Rethrow Domain Error</strong> and click <strong>▶ Run Stream</strong>:
                Notice telemetry logs error interception, then propagates a custom domain error to the consumer with status <code>ERROR</code>.
              </li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">catchError(err =&gt; ...)</span>
              <span class="token-desc">Must return an Observable (e.g., <code>of(fallback)</code> or <code>throwError(() =&gt; new DomainError(err))</code>). Returning plain data without wrapping in an Observable is a compile error!</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Stream Isolation Boundary</span>
              <span class="token-desc">When placed inside <code>switchMap(q =&gt; this.http.get(...).pipe(catchError(...)))</code>, a failure only kills the inner call, keeping the outer search bar reactive forever.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Telemetry Interception</span>
              <span class="token-desc">Allows inspecting the raw error, logging metadata, and rethrowing a friendly domain exception for component presentation.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Safe Stream Isolation & Error Boundaries</h4>
          <p>
            In enterprise Angular applications, placement of <code>catchError</code> is critical.
            When used inside an inner stream (such as within a <code>switchMap</code> or <code>mergeMap</code>), catching errors prevents the outer user-interaction stream (like search input changes or button clicks) from dying.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Fatal "Outer catchError" Trap:</strong>
            <p>
              If you place <code>catchError</code> outside <code>switchMap</code>, a single HTTP 404 or 500 error will trigger recovery once and then complete the *outer* stream permanently. The user will be unable to type or search again without a full page refresh!
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Search Typeahead Resilience</h5>
              <p>
                Wrapping autocomplete HTTP requests in inner <code>catchError(() =&gt; of([]))</code> so network drops show "No results found" while preserving user typing ability.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Feature Flag Fallback</h5>
              <p>
                When a LaunchDarkly/Unleash API gateway times out, catching the error and returning <code>of(DEFAULT_FEATURE_FLAGS)</code> keeps the app running in safe mode.
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
    .strategy-selector-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem; }
    .strategy-card { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem; border-radius: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); cursor: pointer; transition: all 0.2s ease; }
    .strategy-card:hover { border-color: var(--accent-indigo); }
    .strategy-card.selected { border-color: var(--accent-indigo); background: rgba(99, 102, 241, 0.08); }
    .strategy-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .strategy-info strong { font-size: 0.85rem; color: var(--text-main); }
    .strategy-info span { font-size: 0.75rem; color: var(--text-dim); }
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
export class CatchErrorExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  recoveryStrategy: 'fallback' | 'rethrow' = 'fallback';
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Enterprise HTTP Error Recovery
this.http.get<UserPreferences>('/api/preferences').pipe(
  catchError((err: HttpErrorResponse) => {
    // 1. Log telemetry to monitoring service
    this.telemetry.logError('Preferences fetch failed', err);

    // 2. Return resilient fallback to keep UI functional
    return of(DEFAULT_USER_PREFERENCES);
  })
).subscribe({
  next: (prefs) => this.applyPreferences(prefs),
  error: (fatalErr) => this.showCriticalAlert(fatalErr)
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('catch-error');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', 'Initiating simulated API call: GET /api/data');

    // Simulate an upstream HTTP stream that encounters a 500 error
    const source$ = of('Initiated').pipe(
      tap(() => this.record('next', 'Upstream request dispatched...')),
      map(() => {
        throw new Error('500 Internal Server Error: Gateway Unavailable');
      })
    );

    this.sub = source$.pipe(
      catchError((error) => {
        this.record('error', `[catchError Intercepted] ${error.message}`);
        if (this.recoveryStrategy === 'fallback') {
          this.record('next', 'Returning graceful fallback: of({ cached: true, offlineMode: true })');
          return of({ cached: true, offlineMode: true, timestamp: new Date().toISOString() });
        } else {
          this.record('error', 'Transforming to DomainException and re-throwing...');
          return throwError(() => new Error('[DomainException] Failed to contact remote cluster'));
        }
      })
    ).subscribe({
      next: (val) => {
        this.record('next', val);
      },
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err) => {
        this.record('error', `Stream terminated with unhandled error: ${err.message}`);
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
