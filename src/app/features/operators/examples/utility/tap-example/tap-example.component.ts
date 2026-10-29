import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { from, Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-tap-example',
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
              Developers frequently introduce bugs by mutating values or executing unintended side-effects inside <code>map()</code>.
              <code>tap</code> executes transparent side-effects (telemetry, caching, audit trails) for <code>next</code>, <code>error</code>, and <code>complete</code> without mutating stream emissions.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Enable Diagnostic Audit Tap:</strong> Toggles side-effect observation without affecting downstream calculations.</li>
              <li><strong>tap vs map:</strong> <code>map</code> transforms the payload. <code>tap</code> transparently inspects the payload and passes the original value through untouched.</li>
              <li><strong>▶ Run Stream:</strong> Executes stream pipeline and displays simultaneous side-effect logs.</li>
            </ul>
          </div>

          <div class="checkbox-container">
            <label class="custom-checkbox-label">
              <input type="checkbox" [(ngModel)]="enableAuditLogs" />
              <span>Enable Diagnostic Audit Tap (Logs telemetry side-effects)</span>
            </label>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Transparent Observation:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong> with the audit checkbox enabled.</li>
              <li>Notice that telemetry logs display audit events (<code>[Audit Telemetry Captured]</code>), while downstream calculation steps receive the exact unmodified payload.</li>
              <li>Toggle the checkbox off and re-run: data flows identically without audit log overhead.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">tap(value =&gt; console.log(value))</span>
              <span class="token-desc">Passes any next emission through to downstream operators completely unchanged. Useful for debugging mid-pipeline.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">tap(&#123; next, error, complete, subscribe, unsubscribe &#125;)</span>
              <span class="token-desc">Full Observer dictionary support: allows hook into the exact lifecycle events without subscribing or terminating the stream.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Purity Mandate</span>
              <span class="token-desc">Never mutate properties on emitted objects inside <code>tap</code> (e.g. <code>tap(user =&gt; user.role = 'Admin')</code>); keep objects immutable.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Clean Separation of Side-Effects</h4>
          <p>
            In production Angular architectures, use <code>tap</code> for logging, updating analytic counters, triggering sound/toast notifications, or saving debugging checkpoints.
            Keep projection logic strictly inside <code>map</code>, keeping side-effects isolated and pure.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Error Re-Throwing Misconception:</strong>
            <p>
              <code>tap(&#123; error: fn &#125;)</code> allows you to *observe* errors (e.g. for Datadog telemetry), but it does NOT catch or recover from them! Uncaught errors will still kill the stream unless recovered by <code>catchError()</code>.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Analytics & Telemetry Tracking</h5>
              <p>
                Sending Segment/Mixpanel analytics payloads (e.g. <code>tap(order =&gt; analytics.track('Purchase', order))</code>) without breaking component data flows.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. In-Memory Store Side-Effect Update</h5>
              <p>
                Updating local Signals store cache with fresh server responses before passing the result to route components.
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
    .checkbox-container { background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .custom-checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-size: 0.85rem; color: var(--text-main); }
    .custom-checkbox-label input { accent-color: var(--accent-indigo); width: 18px; height: 18px; }
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
export class TapExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  enableAuditLogs = true;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Diagnostic Telemetry & Auditing with tap
this.orderService.placeOrder(orderPayload).pipe(
  tap({
    subscribe: () => this.analytics.track('Order Submission Started'),
    next: (order) => this.analytics.track('Order Processed', { orderId: order.id }),
    error: (err) => this.logger.error('Order Submission Error', err),
    complete: () => this.logger.info('Pipeline finished')
  })
).subscribe();`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('tap');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', 'Subscribed to processing pipeline with tap()');

    const source$ = from([
      { sku: 'LAPTOP-PRO', price: 1299 },
      { sku: 'MOUSE-ERGONOMIC', price: 79 },
      { sku: 'MONITOR-4K', price: 499 }
    ]);

    this.sub = source$.pipe(
      tap(item => {
        if (this.enableAuditLogs) {
          this.record('subscribe', `[Audit Tap] Inspecting raw item: ${item.sku} ($${item.price})`);
        }
      }),
      map(item => ({
        ...item,
        vatInclusive: Math.round(item.price * 1.2)
      })),
      tap({
        next: (processed) => {
          if (this.enableAuditLogs) {
            this.record('next', `[Metrics Tap] Tax applied: ${processed.sku} -> Total: $${processed.vatInclusive}`);
          }
        },
        complete: () => {
          if (this.enableAuditLogs) {
            this.record('complete', '[Teardown Tap] All batch items inspected.');
          }
        }
      })
    ).subscribe({
      next: (item) => {
        this.record('next', item);
      },
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
