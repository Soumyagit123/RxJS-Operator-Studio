import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-interval-example',
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
              <code>interval(period)</code> produces an infinite stream of sequential integers (0, 1, 2, ...) every <em>period</em> milliseconds.
              Configure the tick frequency and the safety boundary below to watch clock-driven emissions.
            </p>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Period Interval (ms):</label>
              <input type="number" [(ngModel)]="periodMs" min="100" max="2000" step="100" class="ctrl-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Safety Take Limit (Emissions):</label>
              <input type="number" [(ngModel)]="takeCount" min="1" max="20" class="ctrl-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Observe the active green pulse indicator: every {{ periodMs }}ms a new sequential number (0, 1, 2...) is logged with an updated timestamp delta.</li>
              <li>Watch the stream automatically complete once reaching the take count ({{ takeCount }}), cleanly ending the timer interval without memory leaks.</li>
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
                <td class="code-token"><code>interval(1000)</code></td>
                <td class="token-desc">
                  Infinite ticker using <code>setInterval</code> under the hood. Starts emitting from <code>0</code> after the first 1000ms period has elapsed.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>take(5)</code></td>
                <td class="token-desc">
                  Lifecycle termination safety guard. Takes the first 5 emissions and immediately completes the stream, causing the underlying interval timer to be cleared.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>tap(...)</code></td>
                <td class="token-desc">
                  Side effect logger recording ping telemetry.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Heartbeats, Polling & Memory Leak Hazards</h4>
          <p>
            <code>interval</code> is widely used in Angular for session keepalive pings, auto-refreshing metrics counters, and token refresh checks.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: interval Never Completes on its Own!</strong>
            <p>
              Unless you pipe it through <code>takeUntilDestroyed()</code> or a completion operator such as <code>take(n)</code> or <code>takeUntil(destroy$)</code>, the timer continues running indefinitely in the background even after navigating away from the component, leaking memory and CPU cycles.
              Also note: <code>interval(1000)</code> waits a full 1000ms before emitting its very first item. If you need an immediate first tick, use <code>timer(0, 1000)</code> instead.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Session Keepalive / Token Ping</h5>
              <p>
                Periodically pinging an auth gateway every 4 minutes (<code>interval(4 * 60 * 1000)</code>) to prevent silent OAuth session timeouts while the tab is active.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Countdown Timers & Timeouts</h5>
              <p>
                Driving OTP countdown displays ("Code expires in 45 seconds") by piping <code>interval(1000).pipe(scan(acc =&gt; acc - 1, 60), takeWhile(s =&gt; s &gt;= 0))</code>.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Polling for Asynchronous Job Status</h5>
              <p>
                Querying long-running video rendering or report generation jobs every 3 seconds until status equals <code>COMPLETED</code>.
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
    .field-row { display: flex; gap: 1rem; }
    .field-group { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
    .callout { padding: 0.85rem; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); font-size: 0.85rem; margin-top: 0.75rem; }
  `]
})
export class IntervalExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  periodMs = 500;
  takeCount = 4;
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Periodic Polling / Heartbeat
interval(1000).pipe(
  take(5), // Prevent memory leaks
  tap(tick => console.log('Ping:', tick))
).subscribe();`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('interval');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed to interval(${this.periodMs}ms). Safe take: ${this.takeCount}`);

    this.sub = interval(this.periodMs).pipe(
      take(this.takeCount),
      tap(n => this.record('next', `Heartbeat tick #${n}`))
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
