import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { timeout, delay, tap, catchError } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-timeout-example',
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
              <code>timeout(ms)</code> raises a <code>TimeoutError</code> if the source stream fails to emit a value within the specified duration limit.
              It enforces strict SLAs on asynchronous requests.
            </p>
          </div>

          <div class="settings-grid">
            <div class="input-group">
              <label>Client Timeout Limit (SLA):</label>
              <input type="number" [(ngModel)]="timeoutLimitMs" min="100" max="3000" step="100" class="custom-input" />
              <span class="unit">ms</span>
            </div>

            <div class="input-group">
              <label>Simulated Server Response Delay:</label>
              <input type="number" [(ngModel)]="serverDelayMs" min="100" max="3000" step="100" class="custom-input" />
              <span class="unit">ms</span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Timeout Limit: 1000ms</strong> and <strong>Server Delay: 400ms</strong> (Healthy SLA):
                Click <strong>▶ Run Stream</strong>. The response finishes in 400ms, beating the 1000ms deadline, so it completes with status <code>COMPLETE</code>.
              </li>
              <li>Set <strong>Timeout Limit: 500ms</strong> and <strong>Server Delay: 1500ms</strong> (Violated SLA):
                Click <strong>▶ Run Stream</strong>. At 500ms, <code>timeout</code> triggers and cuts the stream with <code>TimeoutError: Timeout has occurred</code>.
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
                <td class="code-token"><code>this.httpClient.get(...)</code></td>
                <td class="token-desc">
                  Initiates an asynchronous HTTP network request for live financial rates or mission-critical data.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>timeout(&#123; each: 2500, with: ... &#125;)</code></td>
                <td class="token-desc">
                  RxJS 7+ configuration object. <code>each: 2500</code> asserts that each emission must arrive within 2500ms. <code>with: () =&gt; fallback$</code> provides custom error manufacturing or a seamless fallback stream.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>catchError(...)</code></td>
                <td class="token-desc">
                  Graceful recovery barrier. Catches the <code>TimeoutError</code> or custom exception and safely diverts user flow to cached stale data or offline modes without crashing the application.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Guarding Against Hung Connections & Zombie Requests</h4>
          <p>
            Network interfaces on mobile or flaky corporate VPN connections can stall indefinitely without generating TCP handshake errors or RST packets.
            Without an explicit client-side timeout:
          </p>
          <ul>
            <li>Loading spinners hang forever, trapping the user in an unresponsive UI.</li>
            <li>HTTP connection pools become exhausted, queueing subsequent requests behind the blocked socket.</li>
            <li>Attaching <code>timeout(5000)</code> guarantees that users are not left on an indefinite loading screen and can fall back gracefully.</li>
          </ul>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: RxJS 7 Configuration Signature</strong>
            <p>
              In RxJS 7+, prefer the object configuration <code>timeout(&#123; each: 5000, with: () =&gt; fallback$ &#125;)</code> over the deprecated number-only signatures when needing fallback streams or custom error factories.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Strict Financial Trading / Live Quotes</h5>
              <p>
                Stock order execution and forex rates have sub-second SLA compliance requirements. If an order submission takes &gt; 1500ms, timeout immediately and invalidate to prevent executing stale prices.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Gateway Timeout Failover to Local Storage</h5>
              <p>
                In Progressive Web Apps (PWAs), timeout remote network fetches after 2000ms and seamlessly switch to IndexedDB cached records so field workers experience zero UI disruption.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Microservice Health Checks</h5>
              <p>
                Heartbeat probes across 10 downstream dependencies where each probe has a 500ms deadline. Combining <code>forkJoin</code> with per-stream <code>timeout(500)</code> identifies degraded dependencies instantly.
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
    .settings-grid { display: flex; gap: 1.5rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .input-group { display: flex; align-items: center; gap: 0.5rem; }
    .input-group label { font-size: 0.85rem; color: var(--text-dim); }
    .custom-input { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; width: 100px; }
    .unit { font-size: 0.8rem; color: var(--text-muted); }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class TimeoutExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  timeoutLimitMs = 1000;
  serverDelayMs = 400;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Enforcing SLA Deadline on RPC Call
this.httpClient.get<ApiResponse>('/api/realtime-rates').pipe(
  timeout({
    each: 2500, // Error if no response within 2.5s
    with: () => throwError(() => new GatewayTimeoutException('SLA Breached'))
  }),
  catchError(err => this.fallbackToStaleRates(err))
).subscribe();`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('timeout');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed. Deadline: ${this.timeoutLimitMs}ms (Simulated server delay: ${this.serverDelayMs}ms)`);

    const serverStream$ = of({ quoteId: 'Q-492', rate: 1.0842 }).pipe(
      delay(this.serverDelayMs),
      tap(item => this.record('next', { ...item, latencyMs: Date.now() - this.startTime }))
    );

    this.sub = serverStream$.pipe(
      timeout(this.timeoutLimitMs)
    ).subscribe({
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err) => {
        this.record('error', `Timeout breached! ${err.message}`);
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
