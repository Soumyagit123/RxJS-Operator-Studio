import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { defer, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-defer-example',
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
            <strong>🎯 Purpose of Interactive Controls:</strong>
            <p>
              <code>defer(() =&gt; Observable)</code> creates an Observable factory that is <strong>called afresh each time a new subscriber joins</strong>.
              This guarantees that timestamps, authentication tokens, or dynamic configuration values are evaluated at subscription time, not definition time.
            </p>
          </div>

          <div class="comparison-grid">
            <div class="card eager-card">
              <h4>Static of(new Date().toISOString())</h4>
              <p>Evaluates timestamp ONCE when the Observable is created.</p>
              <button class="run-btn eager-btn" (click)="testEagerOf()">
                Inspect of(...) Subscription
              </button>
            </div>

            <div class="card defer-card">
              <h4>Lazy defer(() =&gt; of(new Date().toISOString()))</h4>
              <p>Evaluates timestamp ANEW every single time a subscriber connects!</p>
              <button class="run-btn defer-btn" (click)="testLazyDefer()">
                Inspect defer(...) Subscription
              </button>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>Inspect of(...)</strong> multiple times with a 2-second pause in between:
                Notice the timestamp <strong>never changes</strong> because <code>of(...)</code> locked in the date at definition time!
              </li>
              <li>Now click <strong>Inspect defer(...)</strong> multiple times:
                Notice each click produces a <strong>brand new fresh millisecond timestamp</strong>, proving subscription-time lazy evaluation!
              </li>
            </ol>
          </div>
        </div>

        <div code-description class="code-description-box">
          <table class="code-breakdown-table">
            <thead>
              <tr>
                <th>Code Construct</th>
                <th>Enterprise Role & Mechanics</th>
              </tr>
            </thead>
            <tbody>
              <tr class="breakdown-row">
                <td class="code-token"><code>defer(() =&gt; &#123; ... &#125;)</code></td>
                <td class="token-desc">
                  Lazy factory function. Defers execution of the inner block until a subscriber calls <code>.subscribe()</code>.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>crypto.randomUUID() / Date.now()</code></td>
                <td class="token-desc">
                  Dynamic invocation. Guarantees fresh cryptography nonces and timestamps are generated per individual request rather than being captured once at module evaluation.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>this.http.get(...)</code></td>
                <td class="token-desc">
                  Returns the concrete Observable pipeline configured with fresh subscription headers.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Dynamic Headers, Lazy Promises & Retry Reliability</h4>
          <p>
            When preparing HTTP requests that require a dynamic cryptographic signature, fresh timestamp header, or current auth token, wrapping the call with <code>defer()</code> guarantees every retried or subsequent subscription recalculates the token dynamically.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Promises Executing Eagerly Without defer</strong>
            <p>
              If you write <code>from(fetch(url))</code>, the network fetch fires <strong>immediately</strong> when the line of code executes, NOT when subscribed!
              Wrapping in <code>defer(() =&gt; from(fetch(url)))</code> restores pure laziness.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Fresh OAuth Nonces & Signatures</h5>
              <p>
                AWS SigV4 and OAuth 1.0 require HMAC signatures calculated with <code>x-amz-date</code>. <code>defer</code> guarantees retried HTTP calls generate valid non-expired timestamps.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Converting Third-Party Lazy Async Functions</h5>
              <p>
                Ensuring complex asynchronous computations (such as WebAssembly crypto hashing or canvas image export) only consume CPU when actively subscribed.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Conditional Stream Branching at Runtime</h5>
              <p>
                Evaluating tenant feature flags dynamically: <code>defer(() =&gt; this.featureFlags.isEnabled('v2') ? this.apiV2$ : this.apiV1$)</code>.
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
    .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .card h4 { margin: 0; font-size: 0.85rem; color: var(--text-main); font-family: var(--font-mono); }
    .card p { margin: 0 0 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
    .run-btn { border: none; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .eager-btn { background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f43f5e; }
    .defer-btn { background: var(--accent-indigo); color: white; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class DeferExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  private eagerStream$ = of({ evaluatedAt: new Date().toLocaleTimeString() + '.' + new Date().getMilliseconds() });
  private lazyStream$ = defer(() => of({ evaluatedAt: new Date().toLocaleTimeString() + '.' + new Date().getMilliseconds() }));

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Fresh Evaluation per Subscription (e.g. Dynamic Timestamp/Nonce)
const request$ = defer(() => {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  
  return this.http.get('/api/secure-data', {
    headers: { 'X-Nonce': nonce, 'X-Timestamp': timestamp.toString() }
  });
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('defer');
  }

  executeStream(): void {
    this.testLazyDefer();
  }

  testEagerOf(): void {
    this.startTime = Date.now();
    this.record('subscribe', 'Subscribing to static eager of(...)');
    this.eagerStream$.subscribe(val => {
      this.record('next', { source: 'of() [Static Frozen]', ...val });
      this.record('complete');
    });
  }

  testLazyDefer(): void {
    this.startTime = Date.now();
    this.record('subscribe', 'Subscribing to defer(() => of(...)) factory');
    this.lazyStream$.subscribe(val => {
      this.record('next', { source: 'defer() [Dynamic Fresh Evaluation]', ...val });
      this.record('complete');
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
      timestamp: Date.now() - (this.startTime || Date.now()),
      type,
      value
    });
  }

  ngOnDestroy(): void {
    this.resetStream();
  }
}
