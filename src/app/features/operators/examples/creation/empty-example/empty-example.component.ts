import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY, Subscription } from 'rxjs';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-empty-example',
  standalone: true,
  imports: [CommonModule, OperatorExampleLayoutComponent],
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
              <code>EMPTY</code> emits <strong>zero items</strong> to the Observer and immediately fires a <code>complete</code> notification.
              It is the canonical representation of an already-satisfied, clean stream with no values.
            </p>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>: Notice it emits <code>SUBSCRIBE</code> at +0ms and immediately emits <code>COMPLETE</code> at +0ms.</li>
              <li>Observe that no <code>next</code> values are ever emitted and no errors are raised.</li>
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
                <td class="code-token"><code>catchError(() =&gt; EMPTY)</code></td>
                <td class="token-desc">
                  Silent suppression idiom. Catches non-critical HTTP errors and returns an empty completed observable so the outer stream stays alive.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>EMPTY</code></td>
                <td class="token-desc">
                  Singleton constant instance of an already completed Observable. Avoids allocating garbage collection objects compared to calling a factory.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Graceful Stream Termination & Non-Critical Degradation</h4>
          <p>
            <code>EMPTY</code> is commonly returned inside <code>catchError</code> when an error should be swallowed silently without breaking outer streams (such as an optional marketing announcement or telemetry widget), or as the fallback branch in an <code>iif()</code> conditional observable.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: EMPTY vs. NEVER</strong>
            <p>
              <code>EMPTY</code> completes immediately. <code>NEVER</code> never emits AND never completes.
              If an outer operator expects completion to proceed (like <code>forkJoin</code> or <code>concat</code>), returning <code>NEVER</code> will cause the outer stream to hang indefinitely, whereas <code>EMPTY</code> allows it to finish.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Non-Fatal Ad / Notification Banner Loading</h5>
              <p>
                Suppressing failed ad-blocker network requests without throwing red errors to the console or disrupting the primary page layout.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Cancelling Operations in switchMap</h5>
              <p>
                Returning <code>EMPTY</code> inside a <code>switchMap</code> based on a condition (e.g. search query length &lt; 3 characters) to cancel any pending request without making an API call.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Route Guards Bailing Out</h5>
              <p>
                In router guards or interceptors, halting navigation or request pipelines cleanly without erroring.
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
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class EmptyExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Silent Fallback in Error Handling
this.http.get('/api/optional-banner').pipe(
  catchError(() => EMPTY) // Swallow error silently, completing cleanly
).subscribe(banner => this.displayBanner(banner));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('empty');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', 'Subscribing to EMPTY constant Observable');

    this.sub = EMPTY.subscribe({
      next: (val) => this.record('next', val),
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
