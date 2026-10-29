import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { bufferTime, tap, take } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-buffer-time-example',
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
              <code>bufferTime(bufferDurationMs)</code> collects incoming stream values for a specified time window, then emits them <strong>as an array batch</strong>.
              This allows applications to convert chatty high-frequency streams into efficient micro-batches.
            </p>
          </div>

          <div class="settings-grid">
            <div class="input-group">
              <label>Log Generation Interval:</label>
              <input type="number" [(ngModel)]="eventIntervalMs" min="50" max="250" step="50" class="custom-input" />
              <span class="unit">ms</span>
            </div>

            <div class="input-group">
              <label>Batch Buffer Window:</label>
              <input type="number" [(ngModel)]="bufferWindowMs" min="200" max="1000" step="100" class="custom-input" />
              <span class="unit">ms</span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Log Interval: 100ms</strong> and <strong>Buffer Window: 400ms</strong>, then click <strong>▶ Run Stream</strong>.</li>
              <li>Notice that instead of emitting 1-by-1, the stream periodically emits <strong>array chunks</strong> containing ~4 items per batch (e.g. <code>[0, 1, 2, 3]</code>).</li>
              <li>This demonstrates micro-batching for bulk database inserts or telemetry dispatching.</li>
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
                <td class="code-token"><code>this.auditLogService.rawLogs$</code></td>
                <td class="token-desc">
                  Chatty stream of client actions, click events, or console errors emitted spontaneously throughout user session.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>bufferTime(2000)</code></td>
                <td class="token-desc">
                  Micro-batching aggregator. Collects items over 2000ms sliding or tumbling windows and emits a consolidated JavaScript array.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>filter(batch =&gt; batch.length &gt; 0)</code></td>
                <td class="token-desc">
                  Crucial hygiene check. By default, <code>bufferTime</code> emits empty arrays <code>[]</code> if no items arrived during the window. Filtering prevents pointless empty HTTP POST calls.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Telemetry Burst Batching & Micro-Chunking</h4>
          <p>
            Sending an HTTP POST for every individual user action or diagnostic log overwhelms backend APIs and exhausts HTTP connection pools.
            <code>bufferTime(2000)</code> groups events every 2 seconds into a single consolidated bulk payload, reducing network overhead by over 90%.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Empty Array Emissions & Memory Buffering</strong>
            <p>
              Remember that <code>bufferTime()</code> periodically emits an empty array <code>[]</code> if zero events arrived during that window! Always chain <code>filter(chunk =&gt; chunk.length &gt; 0)</code> before making network calls.
              Also consider capping maximum batch size via <code>bufferTime(bufferTimeSpan, bufferCreationInterval, maxBufferSize)</code> to prevent Out-Of-Memory spikes under massive bursts.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Bulk Audit Trail Ingestion</h5>
              <p>
                Collecting user audit actions across a microfrontend and dispatching them every 5 seconds to Elasticsearch or Datadog in NDJSON format.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. High-Speed Drag-and-Drop / Canvas Batch History</h5>
              <p>
                Buffering stroke points in vector graphic editors to create single undo/redo transaction steps rather than thousands of atomic point events.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Bulk IndexedDB Writes</h5>
              <p>
                Grouping incoming WebSocket entity updates to perform transactional multi-record <code>put()</code> operations into client IndexedDB storage.
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
export class BufferTimeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  eventIntervalMs = 100;
  bufferWindowMs = 400;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Micro-Batching High-Frequency Client Logs
this.auditLogService.rawLogs$.pipe(
  bufferTime(2000), // Collect logs over 2-second windows
  filter(batch => batch.length > 0) // Only send non-empty batches
).subscribe(batch => this.http.post('/api/logs/bulk', { logs: batch }).subscribe());`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('buffer-time');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed: Emitting log every ${this.eventIntervalMs}ms, buffered into ${this.bufferWindowMs}ms batches (Takes 12 items)`);

    this.sub = interval(this.eventIntervalMs).pipe(
      take(12),
      tap(n => this.record('subscribe', `[Raw Log Event #${n}] generated at +${Date.now() - this.startTime}ms`)),
      bufferTime(this.bufferWindowMs)
    ).subscribe({
      next: (batch) => {
        this.record('next', { batchSize: batch.length, batchValues: batch, emittedAtMs: Date.now() - this.startTime });
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
