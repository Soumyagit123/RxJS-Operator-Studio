import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timer, Subscription } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-timer-example',
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
              <code>timer(dueTime, period)</code> starts emitting after an <strong>initial delay (dueTime)</strong>, and optionally emits periodic sequential numbers every <strong>period ms</strong> thereafter.
              If no period is specified, it emits a single value <code>0</code> and completes (one-shot delayed execution).
            </p>
          </div>

          <div class="settings-grid">
            <div class="input-group">
              <label>Initial Due Time Delay:</label>
              <input type="number" [(ngModel)]="dueTimeMs" min="100" max="2000" step="100" class="custom-input" />
              <span class="unit">ms</span>
            </div>

            <div class="input-group">
              <label>Recurring Period (0 for One-Shot):</label>
              <input type="number" [(ngModel)]="periodMs" min="0" max="1000" step="100" class="custom-input" />
              <span class="unit">ms</span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Due Time: 600ms</strong> and <strong>Period: 0 (One-Shot)</strong>: Click <strong>▶ Run Stream</strong>.
                Notice it waits 600ms before emitting <code>0</code>, then completes immediately.
              </li>
              <li>Set <strong>Due Time: 500ms</strong> and <strong>Period: 300ms</strong>: Click <strong>▶ Run Stream</strong>.
                Notice tick #0 emits at +500ms, followed by continuous intervals every 300ms.
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
                <td class="code-token"><code>timer(0, 5000)</code></td>
                <td class="token-desc">
                  Two-argument timer. First argument (<code>0</code>) fires immediately upon subscription without waiting. Second argument (<code>5000</code>) schedules repeating ticks every 5 seconds.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>switchMap(() =&gt; ...)</code></td>
                <td class="token-desc">
                  Dispatches HTTP health status query on each tick, cleanly canceling any previous in-flight probe if the server is lagging.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>subscribe(...)</code></td>
                <td class="token-desc">
                  Attaches consumer UI updates to live status badge.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Delayed Polling & Scheduled Notifications</h4>
          <p>
            Unlike <code>interval</code> which requires waiting one full interval before the first emission, <code>timer(0, 5000)</code> triggers an <strong>immediate initial fetch</strong> at 0ms, followed by 5s periodic polling — the standard enterprise polling pattern.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: One-Shot vs. Infinite Stream</strong>
            <p>
              <code>timer(1000)</code> (single argument) is a <strong>finite stream</strong> that emits once and completes.
              <code>timer(1000, 2000)</code> (two arguments) is an <strong>infinite stream</strong> that never completes on its own.
              Always use <code>takeUntilDestroyed()</code> in Angular components when providing a second argument.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Immediate + Periodic Polling (Dashboard Widgets)</h5>
              <p>
                Querying backend health statuses or stock prices immediately when the user lands on the page (0ms delay), then continuing to poll every 10 seconds.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Auto-Dismiss Banners & Modals</h5>
              <p>
                Using <code>timer(5000).subscribe(() =&gt; this.dismissAlert())</code> as a declarative replacement for <code>setTimeout</code>, guaranteed to be cleaned up if the user manually closes the alert early.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Debounced Exponential Backoff Generator</h5>
              <p>
                Generating dynamic retry intervals: <code>retryWhen(errors =&gt; errors.pipe(switchMap((_, i) =&gt; timer(Math.pow(2, i) * 1000))))</code>.
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
    .custom-input { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; width: 90px; }
    .unit { font-size: 0.8rem; color: var(--text-muted); }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class TimerExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  dueTimeMs = 500;
  periodMs = 0; // 0 indicates one-shot timer

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Immediate First Fetch with 5s Polling Interval
timer(0, 5000).pipe(
  switchMap(() => this.http.get<HealthStatus>('/api/health'))
).subscribe(status => this.updateStatusBadge(status));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('timer');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const isRecurring = this.periodMs > 0;
    this.record('subscribe', `timer(${this.dueTimeMs}${isRecurring ? `, ${this.periodMs}` : ''}) subscribed at +0ms`);

    const timer$ = isRecurring 
      ? timer(this.dueTimeMs, this.periodMs).pipe(take(5))
      : timer(this.dueTimeMs);

    this.sub = timer$.pipe(
      tap(n => this.record('next', { tick: n, elapsedMs: Date.now() - this.startTime }))
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
