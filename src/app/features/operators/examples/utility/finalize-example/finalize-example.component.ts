import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Subscription } from 'rxjs';
import { finalize, delay, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-finalize-example',
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
              <code>finalize(callback)</code> executes a teardown callback function whenever the source Observable terminates — whether by <strong>success completion</strong>, <strong>error failure</strong>, or explicit <strong>early unsubscription/cancellation</strong>.
            </p>
          </div>

          <div class="termination-scenario-grid">
            <label class="scenario-card" [class.selected]="terminationScenario === 'success'">
              <input type="radio" [(ngModel)]="terminationScenario" value="success" name="scen" />
              <div class="scenario-info">
                <strong>Natural Success Completion</strong>
                <span>Stream emits values and completes normally.</span>
              </div>
            </label>

            <label class="scenario-card" [class.selected]="terminationScenario === 'error'">
              <input type="radio" [(ngModel)]="terminationScenario" value="error" name="scen" />
              <div class="scenario-info">
                <strong>Upstream Error</strong>
                <span>Stream fails with an unhandled exception.</span>
              </div>
            </label>

            <label class="scenario-card" [class.selected]="terminationScenario === 'cancel'">
              <input type="radio" [(ngModel)]="terminationScenario" value="cancel" name="scen" />
              <div class="scenario-info">
                <strong>Premature Cancellation / Teardown</strong>
                <span>User navigates away or cancels mid-flight.</span>
              </div>
            </label>
          </div>

          <div class="loading-state-badge">
            <span class="indicator" [class.loading]="isLoading"></span>
            <strong>Loading Indicator State:</strong>
            <span [class.active-loading]="isLoading">
              {{ isLoading ? '⏳ true (Spinner Active / Submit Disabled)' : '✅ false (Spinner Cleared by finalize)' }}
            </span>
            @if (terminationScenario === 'cancel' && isRunning) {
              <button class="cancel-btn" (click)="cancelMidFlight()">🛑 Cancel Mid-Flight Now</button>
            }
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Select <strong>Natural Success</strong> and click <strong>▶ Run Stream</strong>:
                Notice <code>isLoading</code> turns <code>true</code>, emits, completes, and <code>finalize</code> resets <code>isLoading = false</code>.
              </li>
              <li>Select <strong>Upstream Error</strong> and click <strong>▶ Run Stream</strong>:
                Notice that even on failure, <code>finalize</code> still fires and resets <code>isLoading = false</code>.
              </li>
              <li>Select <strong>Premature Cancellation</strong>, click <strong>▶ Run Stream</strong>, and immediately click <strong>🛑 Cancel Mid-Flight Now</strong>:
                Notice <code>finalize</code> runs during teardown, preventing stuck loading spinners.
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
                <td class="code-token"><code>this.isLoading.set(true)</code></td>
                <td class="token-desc">
                  Sets the reactive signal / state flag before dispatching the async action to trigger UI feedback (spinners, skeleton screens, disabling submit buttons).
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>finalize(() =&gt; &#123; ... &#125;)</code></td>
                <td class="token-desc">
                  RxJS teardown interceptor. Attaches directly to the Subscription lifecycle. Invoked exactly once when the stream is completely disposed, regardless of whether it was clean or aborted.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>this.isLoading.set(false)</code></td>
                <td class="token-desc">
                  Guaranteed state clearing. Placing this inside <code>finalize()</code> guarantees the UI will never be left frozen in a perpetual loading state even if network errors or router cancellations occur.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>this.analytics.track(...)</code></td>
                <td class="token-desc">
                  Safe telemetry closure. Emits metric logging when the request lifecycle ends without having to duplicate metric calls across both <code>complete</code> and <code>error</code> handlers.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Guaranteed Loading & Resource Cleanup</h4>
          <p>
            In production Angular apps, never reset loading spinners solely inside the <code>complete</code> or <code>error</code> callbacks of a <code>subscribe()</code>.
            If a component unmounts, a user navigates to another page, or a parent <code>switchMap</code> / <code>takeUntilDestroyed</code> cancels the request, neither <code>complete</code> nor <code>error</code> will ever fire.
            <strong><code>finalize</code> is the only hook guaranteed to execute upon stream teardown.</strong>
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: finalize Does NOT Receive Emitted Values or Error Objects</strong>
            <p>
              <code>finalize</code> takes a parameterless callback: <code>() =&gt; void</code>. It is strictly a cleanup hook (like a JavaScript <code>finally</code> block).
              If you need to inspect error payloads or perform conditional error recovery, use <code>catchError()</code> or <code>tap(&#123; error: ... &#125;)</code> before <code>finalize()</code>.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Idempotent HTTP Spinner Management</h5>
              <p>
                In HTTP interceptors or stateful facade services, toggle an active request counter or signal. <code>finalize()</code> decrements the active request counter guaranteed, preventing deadlock spinners.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. WebWorker and WebSocket Connection Disposal</h5>
              <p>
                When wrapping browser APIs, WebRTC channels, or IndexedDB transactions in Observables, placing cleanup logic (e.g. <code>worker.terminate()</code> or <code>db.close()</code>) inside <code>finalize()</code> ensures no lingering memory leaks on component unmount.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. File Upload / Camera Stream Releasing</h5>
              <p>
                Releasing hardware locks (e.g., stopping camera media tracks via <code>stream.getTracks().forEach(t =&gt; t.stop())</code>) inside <code>finalize()</code> guarantees media hardware releases even if upload fails midway.
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
    .termination-scenario-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 0.75rem; }
    .scenario-card { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem; border-radius: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); cursor: pointer; transition: all 0.2s ease; }
    .scenario-card:hover { border-color: var(--accent-indigo); }
    .scenario-card.selected { border-color: var(--accent-indigo); background: rgba(99, 102, 241, 0.08); }
    .scenario-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .scenario-info strong { font-size: 0.85rem; color: var(--text-main); }
    .scenario-info span { font-size: 0.75rem; color: var(--text-dim); }
    .loading-state-badge { display: flex; align-items: center; gap: 0.75rem; background: rgba(255, 255, 255, 0.02); padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 0.85rem; flex-wrap: wrap; }
    .indicator { width: 10px; height: 10px; border-radius: 50%; background: #10b981; }
    .indicator.loading { background: #f59e0b; animation: pulse 1s infinite alternate; }
    .active-loading { color: #f59e0b; font-weight: 600; }
    .cancel-btn { background: #e11d48; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; margin-left: auto; }
    @keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class FinalizeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;
  isLoading = false;

  terminationScenario: 'success' | 'error' | 'cancel' = 'success';
  finalizeTriggered = false;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Guaranteed Loading Indicator Reset
this.isLoading.set(true);

this.customerService.saveCustomer(profile).pipe(
  finalize(() => {
    // Guaranteed to run on Complete, Error, or Unsubscription!
    this.isLoading.set(false);
    this.analytics.track('Request Ended');
  })
).subscribe({
  next: (res) => this.notification.success('Saved!'),
  error: (err) => this.notification.error('Save failed')
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('finalize');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.isLoading = true;
    this.finalizeTriggered = false;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed to stream (Scenario: ${this.terminationScenario}). isLoading = true`);

    let stream$: import('rxjs').Observable<unknown>;
    if (this.terminationScenario === 'success') {
      stream$ = of({ id: 'REP-101', report: 'Monthly Audit Complete' });
    } else if (this.terminationScenario === 'error') {
      stream$ = throwError(() => new Error('504 Gateway Timeout'));
    } else {
      // Long-running delayed stream for user cancellation test
      stream$ = of('Deferred Payload').pipe(delay(5000));
    }

    this.sub = stream$.pipe(
      finalize(() => {
        this.isLoading = false;
        this.finalizeTriggered = true;
        this.record('complete', '[finalize Callback Executed] Guaranteed teardown: isLoading = false');
      })
    ).subscribe({
      next: (val: unknown) => {
        this.record('next', val);
      },
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err: Error) => {
        this.record('error', err?.message || err);
        this.isRunning = false;
      }
    });
  }

  cancelMidFlight(): void {
    if (!this.isRunning) return;
    this.record('unsubscribe', 'Manual cancellation triggered by user (Unsubscribing)');
    this.resetStream();
  }

  resetStream(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    this.isRunning = false;
    this.isLoading = false;
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
