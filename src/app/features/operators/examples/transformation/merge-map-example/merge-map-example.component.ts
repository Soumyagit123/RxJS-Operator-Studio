import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription, timer } from 'rxjs';
import { mergeMap, tap, map } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-merge-map-example',
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
              In batch or multi-resource operations, blocking the UI with sequential requests creates sluggish user experiences.
              <code>mergeMap</code> projects each source value to an inner Observable and merges all inner Observables <strong>concurrently</strong>.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Parallel Item Pipeline:</strong> Configures multiple asynchronous tasks with varied completion durations (Fast 150ms vs Medium 350ms vs Slow 600ms).</li>
              <li><strong>Concurrency Limit Parameter:</strong> RxJS accepts an optional 2nd argument <code>concurrent</code>. This controls the maximum number of simultaneous active inner subscriptions to prevent socket starvation.</li>
              <li><strong>▶ Run Stream:</strong> Executes all tasks in parallel to observe race conditions and out-of-order completions.</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Items to Download/Process (Parallel):</label>
              <input type="text" [(ngModel)]="itemsInput" class="ctrl-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Concurrency Limit (Optional):</label>
              <input type="number" [(ngModel)]="concurrencyLimit" min="1" max="10" class="ctrl-input num-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Live Concurrency:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Notice that all 3 tasks enter the <span class="badge badge-transformation">SUBSCRIBE</span> state in parallel immediately at <code>+0ms</code>.</li>
              <li>Observe output order: <code>Doc-B (Fast 150ms)</code> emits first, followed by <code>Doc-C (350ms)</code>, and finally <code>Doc-A (600ms)</code>. Faster inner streams complete first regardless of emission order!</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">from(fileIds)</span>
              <span class="token-desc">Streams each document ID into the outer pipeline as an independent event.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">mergeMap(id =&gt; http.get(...), 3)</span>
              <span class="token-desc"><strong>Concurrent Flattening:</strong> Subscribes up to 3 inner HTTP Observables concurrently. Values are forwarded immediately to downstream subscribers as soon as any inner stream emits.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Concurrency Windowing</span>
              <span class="token-desc">When limit is set to 3, if a 4th item arrives, it waits in an internal queue until one of the active 3 inner Observables completes.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Concurrent Independent Operations</h4>
          <p>
            Use <code>mergeMap</code> when you have multiple independent tasks that should not block one another and where order of completion does not matter.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ Concurrency Overload Risk:</strong>
            <p>
              If your source emits thousands of values rapidly, <code>mergeMap</code> without a concurrency limit will initiate thousands of simultaneous HTTP connections, overwhelming browsers and backend servers. Always supply a concurrency limit (e.g., <code>mergeMap(project, 4)</code>) in production.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Multi-File Chunked Uploads</h5>
              <p>
                Uploading an album of 20 images to Amazon S3. <code>mergeMap(uploadFile, 3)</code> uploads 3 images concurrently without freezing browser thread or socket pool.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Independent Microservice Metric Polling</h5>
              <p>
                Querying health check endpoints across 8 microservices simultaneously when opening an operations monitor dashboard.
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
    .field-row { display: flex; gap: 1rem; }
    .field-group { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
    .num-input { max-width: 140px; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
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
    .callout { padding: 0.85rem; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); font-size: 0.85rem; margin-top: 0.75rem; }
  `]
})
export class MergeMapExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  itemsInput = 'Doc-A (Slow 600ms), Doc-B (Fast 150ms), Doc-C (Medium 350ms)';
  concurrencyLimit = 3;
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Concurrent Independent Requests
from(fileIds).pipe(
  mergeMap(id => this.http.get('/api/files/' + id), 3) // Concurrency limit
).subscribe(file => console.log('Downloaded:', file));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('merge-map');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const tasks = [
      { id: 'Doc-A', delay: 600 },
      { id: 'Doc-B', delay: 150 },
      { id: 'Doc-C', delay: 350 }
    ];

    this.record('subscribe', `Dispatched ${tasks.length} tasks concurrently via mergeMap (concurrency limit: ${this.concurrencyLimit})`);

    this.sub = of(...tasks).pipe(
      mergeMap(task => {
        this.record('subscribe', `[Started parallel request for ${task.id} (duration ${task.delay}ms)]`);
        return timer(task.delay).pipe(
          map(() => ({ id: task.id, status: 'PROCESSED', timestamp: new Date().toLocaleTimeString() }))
        );
      }, this.concurrencyLimit),
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
