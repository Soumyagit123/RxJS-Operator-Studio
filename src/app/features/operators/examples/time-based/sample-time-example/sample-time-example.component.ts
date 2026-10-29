import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { sampleTime, tap, take } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-sample-time-example',
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
              <code>sampleTime(period)</code> periodically samples the source Observable and emits the <strong>most recent value</strong> produced within that window.
              If the source did not emit anything during the period, nothing is emitted.
            </p>
          </div>

          <div class="settings-grid">
            <div class="input-group">
              <label>Source Emission Interval (High Frequency):</label>
              <input type="number" [(ngModel)]="sourceIntervalMs" min="50" max="300" step="50" class="custom-input" />
              <span class="unit">ms</span>
            </div>

            <div class="input-group">
              <label>Sample Periodic Window:</label>
              <input type="number" [(ngModel)]="sampleWindowMs" min="200" max="1000" step="100" class="custom-input" />
              <span class="unit">ms</span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>With <strong>Source: 100ms</strong> and <strong>Sample: 500ms</strong>, click <strong>▶ Run Stream</strong>.</li>
              <li>Observe that while the source emits values #0, #1, #2, #3, #4, <code>sampleTime</code> only captures the <strong>latest value</strong> at each 500ms boundary (e.g. #4, #9).</li>
              <li>Intermediate rapid emissions are discarded, reducing telemetry load on UI components.</li>
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
                <td class="code-token"><code>fromEvent(document, 'mousemove')</code></td>
                <td class="token-desc">
                  Ultra-high-frequency DOM event stream producing 120-240 events per second on modern gaming/retina displays.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>sampleTime(16)</code></td>
                <td class="token-desc">
                  Clock-driven downsampler. Synchronizes stream consumption to roughly 60 frames per second (16.6ms intervals), shedding 80%+ of intermediate events.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>map(e =&gt; (&#123; x, y &#125;))</code></td>
                <td class="token-desc">
                  Lightweight projection extracting only the coordinates needed for rendering, keeping garbage collection minimal.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: High-Frequency Sensor & Canvas Sampling (60 FPS Budget)</h4>
          <p>
            When tracking mouse moves, multi-touch gestures, WebGL camera updates, or high-throughput IoT sensor streams, triggering Angular change detection on every raw event exhausts CPU and drops animation frames.
            <code>sampleTime(16)</code> locks rendering to a clean 60 FPS budget.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Silence on Quiet Windows</strong>
            <p>
              Unlike <code>interval()</code>, <code>sampleTime()</code> will NOT emit anything if the source was silent during the period. It only emits if at least one new value arrived since the previous sample check.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Real-Time Collaborative Canvas / Whiteboard</h5>
              <p>
                Sampling cursor coordinates from multiple remote team members at 30ms intervals to broadcast lightweight coordinate deltas over WebRTC data channels.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Scroll Progress Bar & Parallax Layouts</h5>
              <p>
                Sampling scroll offset updates to animate sticky header transformations and reading progress bars without triggering main-thread layout thrashing.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Automotive & Industrial Telemetry Gauges</h5>
              <p>
                Downsampling high-volume CAN bus engine RPM feeds (1000 messages/sec) into human-readable 10Hz dashboard speedometer updates.
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
export class SampleTimeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  sourceIntervalMs = 100;
  sampleWindowMs = 500;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// High-Frequency Mouse / Scroll Sampling (60 FPS Guard)
fromEvent<MouseEvent>(document, 'mousemove').pipe(
  sampleTime(16), // Sample at 60 FPS (~16ms)
  map(e => ({ x: e.clientX, y: e.clientY }))
).subscribe(coords => this.updateCursorPointer(coords));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('sample-time');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed: Source tick every ${this.sourceIntervalMs}ms, sampled every ${this.sampleWindowMs}ms (Takes 12 raw events)`);

    // Emit 12 fast ticks, sampling every sampleWindowMs
    this.sub = interval(this.sourceIntervalMs).pipe(
      take(12),
      tap(n => this.record('subscribe', `[Raw Source Emission #${n}] at +${Date.now() - this.startTime}ms`)),
      sampleTime(this.sampleWindowMs)
    ).subscribe({
      next: (val) => {
        this.record('next', { sampledValue: val, capturedAtMs: Date.now() - this.startTime });
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
