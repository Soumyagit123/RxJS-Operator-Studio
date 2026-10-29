import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Subscription } from 'rxjs';
import { retry, delay, tap, mergeMap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-retry-example',
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
              <code>retry(config)</code> resubscribes to the upstream Observable when an error occurs up to a specified count, optionally with exponential or custom delay backoff.
            </p>
          </div>

          <div class="settings-grid">
            <div class="input-group">
              <label>Max Retry Attempts:</label>
              <input type="number" [(ngModel)]="maxRetries" min="1" max="5" class="custom-input" />
            </div>

            <div class="input-group">
              <label>Simulated Server Success After:</label>
              <select [(ngModel)]="failTimes" class="custom-select">
                <option [ngValue]="1">Succeeds on Attempt #2 (1 failure)</option>
                <option [ngValue]="2">Succeeds on Attempt #3 (2 failures)</option>
                <option [ngValue]="99">Never succeeds (Exhausts all retries)</option>
              </select>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Max Retry Attempts: 3</strong> and <strong>Succeeds on Attempt #2</strong>.</li>
              <li>Click <strong>▶ Run Stream</strong>:
                Notice Attempt #1 fails with <code>503 Service Unavailable</code>, RxJS automatically triggers retry, and Attempt #2 succeeds, logging a <code>200 OK</code> payload and completing cleanly.
              </li>
              <li>Change to <strong>Never succeeds</strong> and run again:
                Notice it retries 3 times and then, once exhausted, finally terminates with an <code>ERROR</code> event.
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
                <td class="code-token"><code>retry(&#123; count: 3, ... &#125;)</code></td>
                <td class="token-desc">
                  Restricts maximum resubscriptions to 3 attempts. Prevents runaway infinite loops against completely down backends.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>delay: (error, retryCount) =&gt; ...</code></td>
                <td class="token-desc">
                  Exponential backoff scheduling function. Computes exponential wait intervals (500ms, 1000ms, 2000ms) to give struggling backends breathing room.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>resetOnSuccess: true</code></td>
                <td class="token-desc">
                  Resets the retry counter back to zero if an emission successfully passes through. Vital for long-lived streams (like SSE or WebSocket reconnects) so subsequent blips still get a fresh quota of retries.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Resilient HTTP Clients & Idempotency Rules</h4>
          <p>
            Automatic retries can save user flows from transient microservice blips (DNS timeouts, pod restarts, load balancer 503s). However, strict rules must govern retry policies:
          </p>
          <ul>
            <li><strong>Idempotency Principle:</strong> Only retry safe, idempotent operations (<code>GET</code>, <code>HEAD</code>, <code>PUT</code>, or requests with an <code>Idempotency-Key</code> header). Retrying raw non-idempotent <code>POST /checkout</code> calls risks double billing.</li>
            <li><strong>Full Jitter Algorithm:</strong> In high-throughput fleets, always add randomized jitter (e.g. <code>backoff * Math.random()</code>) to prevent the "Thundering Herd" problem, where thousands of client apps retry at identical millisecond boundaries.</li>
          </ul>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: 4xx Client Errors vs. 5xx Server Errors</strong>
            <p>
              Never blindly retry 4xx errors (such as <code>400 Bad Request</code> or <code>401 Unauthorized</code> or <code>404 Not Found</code>). Retrying bad syntax will never succeed. Always inspect <code>error.status</code> inside the retry delay factory.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Resilient Telemetry and Metric Dispatch</h5>
              <p>
                Client analytics logs dispatched via HTTP beacon can fail during network handovers (Wi-Fi to 5G). Pipelining with <code>retry(&#123; count: 3, delay: 1000 &#125;)</code> prevents losing telemetry data.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. JWT Token Refresh and Request Replay</h5>
              <p>
                In an HTTP Interceptor, catching a <code>401</code>, dispatching a refresh token observable, and retrying the original request pipeline transparently saves the user from being logged out.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Remote Microfrontend Configuration Loading</h5>
              <p>
                At application bootstrap, federated modules fetch remote schema configs. Retrying with exponential backoff guarantees bootstrap reliability in multi-cloud enterprise deployments.
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
    .settings-grid { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .input-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .input-group label { font-size: 0.8rem; color: var(--text-dim); }
    .custom-input { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; width: 100px; }
    .custom-select { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class RetryExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  maxRetries = 3;
  failTimes = 1;
  attemptCount = 0;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Enterprise Resilient HTTP with Backoff
this.httpClient.get<DashboardMetrics>('/api/telemetry').pipe(
  retry({
    count: 3,
    delay: (error, retryCount) => {
      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const backoffMs = Math.pow(2, retryCount - 1) * 500;
      return timer(backoffMs);
    },
    resetOnSuccess: true
  })
).subscribe({
  next: (metrics) => this.renderMetrics(metrics),
  error: (err) => this.showFatalBanner(err)
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('retry');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();
    this.attemptCount = 0;

    this.record('subscribe', `Subscribing with retry({ count: ${this.maxRetries} })`);

    // Stream factory simulating remote service with transient failure
    const request$ = of(null).pipe(
      mergeMap(() => {
        this.attemptCount++;
        const currentAttempt = this.attemptCount;
        this.record('next', `Dispatching Network Request [Attempt #${currentAttempt}]`);

        if (currentAttempt <= this.failTimes) {
          return throwError(() => new Error(`503 Service Unavailable (Attempt #${currentAttempt})`));
        }
        return of({ status: 200, message: 'Payload synced successfully', attempt: currentAttempt });
      })
    );

    this.sub = request$.pipe(
      retry({
        count: this.maxRetries,
        delay: 200
      })
    ).subscribe({
      next: (res) => {
        this.record('next', res);
      },
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err) => {
        this.record('error', `All ${this.maxRetries} retries exhausted: ${err.message}`);
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
    this.attemptCount = 0;
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
