import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, timer } from 'rxjs';
import { exhaustMap, tap, map } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-exhaust-map-example',
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
        (run)="simulateRapidClicks()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              Users frequently double-click or spam action buttons while network requests are processing.
              <code>exhaustMap</code> projects each source value to an inner Observable, but <strong>IGNORES and drops all subsequent outer emissions</strong> as long as the current inner Observable is still active.
            </p>
            <ul class="control-purpose-list">
              <li><strong>💳 Submit Payment Transaction:</strong> Emits an individual event on each click. Notice that clicking rapidly while in-flight changes click count but executes zero duplicate charges.</li>
              <li><strong>⚡ Simulate User Quad-Click:</strong> Automates 4 rapid emissions within 50ms, visually demonstrating 1 allowed execution and 3 safely dropped calls.</li>
              <li><strong>🔒 In-flight Lock Active Badge:</strong> Shows the active lock state during the 600ms simulated gateway roundtrip.</li>
            </ul>
          </div>

          <div class="submit-action-box">
            <button class="submit-btn" (click)="onSubmitClick()">
              💳 Submit Payment Transaction (Clicks: {{ clickAttempts }})
            </button>
            <button class="sim-burst-btn" (click)="simulateRapidClicks()">
              ⚡ Simulate User Quad-Click (Rapid 4 Clicks)
            </button>
            <span class="active-badge" *ngIf="isRunning">
              🔒 In-flight Lock Active (Ignoring duplicate clicks)
            </span>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Live Submission Guarding:</strong>
            <ol>
              <li>Click <strong>Submit Payment Transaction</strong> multiple times in rapid succession or click the quad-click button.</li>
              <li>Notice that ONLY the 1st click initiates a transaction. The subsequent 3 clicks trigger <span class="badge badge-utility">IGNORED</span> telemetry and are dropped completely.</li>
              <li>Only after the 600ms transaction completes does <code>exhaustMap</code> unlock to accept another submission.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">submitClick$</span>
              <span class="token-desc">Outer stream driven by DOM clicks, keyboard shortcuts, or programmatic form submissions.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">exhaustMap(payload =&gt; http.post(...))</span>
              <span class="token-desc"><strong>Active Locking:</strong> Starts inner Observable. Drops any outer emission until inner Observable completes. Unlike <code>switchMap</code>, it never cancels running work; unlike <code>concatMap</code>, it never queues backlog.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Security / Idempotency Guarantee</span>
              <span class="token-desc">Prevents duplicate credit card authorizations or double-booking records directly at the reactive stream level without relying solely on UI disable states.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Button Double-Click Guards & Auth Refresh</h4>
          <p>
            <code>exhaustMap</code> is the industry standard for form submissions (checkout, booking confirmations, loan requests) and token refresh locks.
            Unlike disabling buttons only in HTML (which can still be triggered by enter keys or fast mobile taps), <code>exhaustMap</code> guarantees at the reactive stream level that only 1 request can run at a time.
          </p>
          <div class="callout callout-warning">
            <strong>When NOT to Use exhaustMap:</strong>
            <p>
              Never use <code>exhaustMap</code> for search autocomplete or typeahead filters! If a user types "ang" and then types "angular", <code>exhaustMap</code> would ignore "angular", causing the UI to permanently display obsolete results for "ang".
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Non-Idempotent Payment Gateways (Stripe / PayPal)</h5>
              <p>
                Preventing double-charging customers during slow 3G cellular network transactions when users impatiently tap "Pay Now" multiple times.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. JWT Token Refresh Mutex (Single-Flight Lock)</h5>
              <p>
                When an OAuth access token expires, multiple parallel API calls fail with 401. An HTTP interceptor using <code>exhaustMap</code> ensures only ONE refresh token call is sent to Auth0, while others wait for the new token.
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
    .submit-action-box { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .submit-btn { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: transform 0.15s; }
    .submit-btn:hover { transform: translateY(-1px); }
    .sim-burst-btn { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .active-badge { font-size: 0.8rem; color: var(--accent-amber); font-weight: 600; }
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
export class ExhaustMapExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  clickAttempts = 0;
  events: StreamEvent[] = [];
  isRunning = false;

  private readonly clickSubject$ = new Subject<number>();
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Double-Click & Redundant Submission Guard
submitClick$.pipe(
  exhaustMap(orderPayload => this.http.post('/api/checkout', orderPayload))
).subscribe(confirmation => console.log('Charged successfully:', confirmation));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('exhaust-map');
    this.initStream();
  }

  private initStream(): void {
    this.startTime = Date.now();
    this.sub = this.clickSubject$.pipe(
      tap(clickId => {
        if (this.isRunning) {
          this.record('unsubscribe', `[Ignored click #${clickId}: Active transaction in progress]`);
        }
      }),
      exhaustMap(clickId => {
        this.isRunning = true;
        this.record('subscribe', `[Accepted Click #${clickId}: Initiating transaction (600ms lock active)]`);
        return timer(600).pipe(
          map(() => ({ transactionId: 'TXN-' + Math.floor(Math.random() * 90000 + 10000), clickId })),
          tap({
            next: (txn) => {
              this.record('next', txn);
              this.isRunning = false;
            }
          })
        );
      })
    ).subscribe();
  }

  onSubmitClick(): void {
    this.clickAttempts++;
    this.clickSubject$.next(this.clickAttempts);
  }

  simulateRapidClicks(): void {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.onSubmitClick(), i * 80);
    }
  }

  resetStream(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    this.clickAttempts = 0;
    this.events = [];
    this.isRunning = false;
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
    if (this.sub) this.sub.unsubscribe();
  }
}
