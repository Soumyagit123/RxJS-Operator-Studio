import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription, timer } from 'rxjs';
import { concatMap, tap, map } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-concat-map-example',
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
              In transactional flows, concurrent operations cause database deadlocks and out-of-order state mutations.
              <code>concatMap</code> forces inner Observables into a strict <strong>First-In, First-Out (FIFO)</strong> sequential queue.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Sequential Stage Pipeline:</strong> Visualizes the multi-step dependent workflow (Customer &rarr; Payment &rarr; Email).</li>
              <li><strong>▶ Run Stream Button:</strong> Kicks off the stream with 3 queued asynchronous tasks.</li>
              <li><strong>Telemetry Observer:</strong> Shows the exact millisecond timestamps proving Step 2 never begins until Step 1 completely finishes.</li>
            </ul>
          </div>

          <div class="field-group">
            <label class="field-label">Sequential Queue Pipeline:</label>
            <div class="queue-preview">
              <span class="step-chip">Step 1: Save Customer Record (300ms)</span>
              <span class="arrow-chip">➔</span>
              <span class="step-chip">Step 2: Charge Payment (400ms)</span>
              <span class="arrow-chip">➔</span>
              <span class="step-chip">Step 3: Send Confirmation Email (200ms)</span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Live Serialization:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Watch the telemetry console: Step 2's subscription does NOT start until Step 1 delivers its completion event.</li>
              <li>Observe cumulative timing: Step 1 (300ms) &rarr; Step 2 (700ms) &rarr; Step 3 (900ms). Execution order is 100% deterministic.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">of(...sequence)</span>
              <span class="token-desc">The source Observable emits multiple items into the pipeline in sequence.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">concatMap(stage =&gt; timer(stage.duration)...)</span>
              <span class="token-desc"><strong>FIFO Serialization:</strong> Takes each item and subscribes to its inner observable. If an inner operation is running, subsequent emissions are buffered in memory and held in queue.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Memory / Backpressure Awareness</span>
              <span class="token-desc">If the outer stream emits faster than inner tasks can finish, memory usage will grow. Use <code>concatMap</code> only when sequential execution is an absolute business requirement.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Sequential Database Writes & Payments</h4>
          <p>
            Never use <code>switchMap</code> or <code>mergeMap</code> for operations where order matters or where race conditions could corrupt data (e.g. creating an account before charging a card, or appending to an audit log).
            <code>concatMap</code> guarantees order of execution.
          </p>
          <div class="callout callout-warning">
            <strong>When NOT to Use concatMap:</strong>
            <p>
              Avoid <code>concatMap</code> for high-frequency user interactions (like search boxes or drag events). 
              A slow network response will bottleneck the entire stream and build up an unbounded queue in browser memory!
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Transactional Order Processing</h5>
              <p>
                E-commerce checkout pipelines that must validate inventory, authorize credit card transaction, and generate an invoice in exact chronological sequence.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Offline Action Synchronization (IndexedDB &rarr; API)</h5>
              <p>
                Service worker sync where offline user changes (Create Doc &rarr; Update Doc &rarr; Delete Doc) must be replayed against the cloud backend in original order.
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
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .queue-preview { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .step-chip { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 0.8rem; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .arrow-chip { color: var(--text-dim); }
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
    .code-breakdown-table { display: flex; flex-direction: column; gap: 0.5rem; }
    .breakdown-row { display: flex; flex-direction: column; gap: 0.2rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; }
    .code-token { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600; }
    .token-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .production-use-cases { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    @media (max-width: 640px) { .production-use-cases { grid-template-columns: 1fr; } }
    .use-case-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.75rem; }
    .use-case-card h5 { margin: 0 0 0.35rem 0; font-size: 0.85rem; color: #38bdf8; font-weight: 600; }
    .use-case-card p { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .callout { padding: 0.85rem; border-radius: 6px; font-size: 0.85rem; line-height: 1.5; }
    .callout-warning { background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); color: var(--text-main); }
  `]
})
export class ConcatMapExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Strict FIFO Queueing
actions$.pipe(
  concatMap(action => this.http.post('/api/execute', action))
).subscribe(result => console.log('Sequentially executed:', result));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('concat-map');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const sequence = [
      { name: 'Step 1: Save Customer Record', duration: 300 },
      { name: 'Step 2: Charge Payment', duration: 400 },
      { name: 'Step 3: Send Confirmation Email', duration: 200 }
    ];

    this.record('subscribe', 'Pipeline started: Queueing 3 sequential asynchronous stages');

    this.sub = of(...sequence).pipe(
      concatMap(stage => {
        this.record('subscribe', `[Started: ${stage.name} (Waiting ${stage.duration}ms to complete before next step)]`);
        return timer(stage.duration).pipe(
          map(() => ({ step: stage.name, completedAt: `+${Date.now() - this.startTime}ms` }))
        );
      }),
      tap(result => this.record('next', result))
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
