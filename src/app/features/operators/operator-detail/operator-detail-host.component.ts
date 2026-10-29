import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OperatorCatalogService } from '../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../operator.model';
import { OfExampleComponent } from '../examples/creation/of-example/of-example.component';
import { FromExampleComponent } from '../examples/creation/from-example/from-example.component';
import { IntervalExampleComponent } from '../examples/creation/interval-example/interval-example.component';
import { FromEventExampleComponent } from '../examples/creation/from-event-example/from-event-example.component';
import { TimerExampleComponent } from '../examples/creation/timer-example/timer-example.component';
import { DeferExampleComponent } from '../examples/creation/defer-example/defer-example.component';
import { RangeExampleComponent } from '../examples/creation/range-example/range-example.component';
import { ThrowErrorExampleComponent } from '../examples/creation/throw-error-example/throw-error-example.component';
import { EmptyExampleComponent } from '../examples/creation/empty-example/empty-example.component';
import { IifExampleComponent } from '../examples/creation/iif-example/iif-example.component';
import { SwitchMapExampleComponent } from '../examples/transformation/switch-map-example/switch-map-example.component';
import { MergeMapExampleComponent } from '../examples/transformation/merge-map-example/merge-map-example.component';
import { ConcatMapExampleComponent } from '../examples/transformation/concat-map-example/concat-map-example.component';
import { ExhaustMapExampleComponent } from '../examples/transformation/exhaust-map-example/exhaust-map-example.component';
import { MapExampleComponent } from '../examples/transformation/map-example/map-example.component';
import { FilterExampleComponent } from '../examples/filtering/filter-example/filter-example.component';
import { TakeUntilExampleComponent } from '../examples/filtering/take-until-example/take-until-example.component';
import { DebounceTimeExampleComponent } from '../examples/filtering/debounce-time-example/debounce-time-example.component';
import { ThrottleTimeExampleComponent } from '../examples/filtering/throttle-time-example/throttle-time-example.component';
import { DistinctUntilChangedExampleComponent } from '../examples/filtering/distinct-until-changed-example/distinct-until-changed-example.component';
import { ForkJoinExampleComponent } from '../examples/combination/fork-join-example/fork-join-example.component';
import { CombineLatestExampleComponent } from '../examples/combination/combine-latest-example/combine-latest-example.component';
import { WithLatestFromExampleComponent } from '../examples/combination/with-latest-from-example/with-latest-from-example.component';
import { CatchErrorExampleComponent } from '../examples/error-handling/catch-error-example/catch-error-example.component';
import { RetryExampleComponent } from '../examples/error-handling/retry-example/retry-example.component';
import { ThrowIfEmptyExampleComponent } from '../examples/error-handling/throw-if-empty-example/throw-if-empty-example.component';
import { TapExampleComponent } from '../examples/utility/tap-example/tap-example.component';
import { FinalizeExampleComponent } from '../examples/utility/finalize-example/finalize-example.component';
import { DelayExampleComponent } from '../examples/utility/delay-example/delay-example.component';
import { TimeoutExampleComponent } from '../examples/utility/timeout-example/timeout-example.component';
import { ShareReplayExampleComponent } from '../examples/multicasting/share-replay-example/share-replay-example.component';
import { ShareExampleComponent } from '../examples/multicasting/share-example/share-example.component';
import { SampleTimeExampleComponent } from '../examples/time-based/sample-time-example/sample-time-example.component';
import { BufferTimeExampleComponent } from '../examples/transformation/buffer-time-example/buffer-time-example.component';
import { FirstExampleComponent } from '../examples/filtering/first-example/first-example.component';
import { LastExampleComponent } from '../examples/filtering/last-example/last-example.component';
import { TakeExampleComponent } from '../examples/filtering/take-example/take-example.component';
import { TakeWhileExampleComponent } from '../examples/filtering/take-while-example/take-while-example.component';
import { OperatorExampleLayoutComponent } from '../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-operator-detail-host',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule, 
    OfExampleComponent, 
    SwitchMapExampleComponent,
    MergeMapExampleComponent,
    ConcatMapExampleComponent,
    ExhaustMapExampleComponent,
    FromExampleComponent,
    IntervalExampleComponent,
    FromEventExampleComponent,
    TimerExampleComponent,
    DeferExampleComponent,
    RangeExampleComponent,
    ThrowErrorExampleComponent,
    EmptyExampleComponent,
    IifExampleComponent,
    MapExampleComponent,
    FilterExampleComponent,
    TakeUntilExampleComponent,
    DebounceTimeExampleComponent,
    ThrottleTimeExampleComponent,
    DistinctUntilChangedExampleComponent,
    FirstExampleComponent,
    LastExampleComponent,
    TakeExampleComponent,
    TakeWhileExampleComponent,
    ForkJoinExampleComponent,
    CombineLatestExampleComponent,
    WithLatestFromExampleComponent,
    CatchErrorExampleComponent,
    RetryExampleComponent,
    ThrowIfEmptyExampleComponent,
    TapExampleComponent,
    FinalizeExampleComponent,
    DelayExampleComponent,
    TimeoutExampleComponent,
    ShareReplayExampleComponent,
    ShareExampleComponent,
    SampleTimeExampleComponent,
    BufferTimeExampleComponent,
    OperatorExampleLayoutComponent
  ],
  template: `
    @if (operator) {
      @switch (operator.id) {
        @case ('of') {
          <app-of-example />
        }
        @case ('from') {
          <app-from-example />
        }
        @case ('interval') {
          <app-interval-example />
        }
        @case ('from-event') {
          <app-from-event-example />
        }
        @case ('timer') {
          <app-timer-example />
        }
        @case ('defer') {
          <app-defer-example />
        }
        @case ('range') {
          <app-range-example />
        }
        @case ('throw-error') {
          <app-throw-error-example />
        }
        @case ('empty') {
          <app-empty-example />
        }
        @case ('iif') {
          <app-iif-example />
        }
        @case ('switch-map') {
          <app-switch-map-example />
        }
        @case ('merge-map') {
          <app-merge-map-example />
        }
        @case ('concat-map') {
          <app-concat-map-example />
        }
        @case ('exhaust-map') {
          <app-exhaust-map-example />
        }
        @case ('map') {
          <app-map-example />
        }
        @case ('filter') {
          <app-filter-example />
        }
        @case ('take-until') {
          <app-take-until-example />
        }
        @case ('debounce-time') {
          <app-debounce-time-example />
        }
        @case ('throttle-time') {
          <app-throttle-time-example />
        }
        @case ('distinct-until-changed') {
          <app-distinct-until-changed-example />
        }
        @case ('first') {
          <app-first-example />
        }
        @case ('last') {
          <app-last-example />
        }
        @case ('take') {
          <app-take-example />
        }
        @case ('take-while') {
          <app-take-while-example />
        }
        @case ('fork-join') {
          <app-fork-join-example />
        }
        @case ('combine-latest') {
          <app-combine-latest-example />
        }
        @case ('with-latest-from') {
          <app-with-latest-from-example />
        }
        @case ('catch-error') {
          <app-catch-error-example />
        }
        @case ('retry') {
          <app-retry-example />
        }
        @case ('throw-if-empty') {
          <app-throw-if-empty-example />
        }
        @case ('tap') {
          <app-tap-example />
        }
        @case ('finalize') {
          <app-finalize-example />
        }
        @case ('delay') {
          <app-delay-example />
        }
        @case ('timeout') {
          <app-timeout-example />
        }
        @case ('share-replay') {
          <app-share-replay-example />
        }
        @case ('share') {
          <app-share-example />
        }
        @case ('sample-time') {
          <app-sample-time-example />
        }
        @case ('buffer-time') {
          <app-buffer-time-example />
        }
        @default {
          <!-- Standard layout for all operators with dynamic live runner -->
          <app-operator-example-layout
            [operator]="operator"
            [code]="getDefaultSnippet(operator)"
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
                  In real-world web apps, asynchronous streams execute with fluctuating delay and event frequency.
                  These interactive controls let you manipulate source event timing, payload batches, and dispatch frequency to observe how <code>{{ operator.name }}</code> behaves in production pipelines.
                </p>
                <ul class="control-purpose-list">
                  <li><strong>Interactive Trigger:</strong> Emits customized mock payloads into the <code>{{ operator.name }}</code> pipeline.</li>
                  <li><strong>Simulated Latency:</strong> Adjusts simulated backend/network delay before stream emissions.</li>
                  <li><strong>Batch Size:</strong> Configures the number of concurrent emissions processed in the pipeline.</li>
                  <li><strong>⚡ Fast Burst Simulation:</strong> Triggers rapid sequential emissions to test buffering, transformation, and stream completion.</li>
                </ul>
              </div>

              <div class="field-group">
                <label class="field-label">Interactive Source Input Payload:</label>
                <div class="search-input-wrap">
                  <input 
                    type="text" 
                    [(ngModel)]="customPayload" 
                    class="ctrl-input" 
                    placeholder="Enter test payload: e.g. Event #1, tenant-42, metrics..."
                  />
                  <span class="active-badge" *ngIf="isRunning">
                    In-flight: 1
                  </span>
                </div>
                <span class="hint-text">Type custom data and click Execute or Run Stream to dispatch through {{ operator.name }}.</span>
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">Simulated Processing Delay (ms):</label>
                  <input type="number" [(ngModel)]="mockDelay" min="50" max="2000" step="50" class="ctrl-input num-input" />
                </div>
                <div class="field-group">
                  <label class="field-label">Emission Count (Items):</label>
                  <input type="number" [(ngModel)]="batchCount" min="1" max="10" step="1" class="ctrl-input num-input" />
                </div>
              </div>

              <div class="quick-sim-buttons">
                <button class="sim-btn" (click)="simulateBurst()" [disabled]="isRunning">
                  ⚡ Simulate Fast Burst Emission (3 Sequential Events)
                </button>
              </div>

              <div class="how-to-verify">
                <strong>🔍 How to Experiment & Check Live Telemetry:</strong>
                <ol>
                  <li>Click <strong>⚡ Simulate Fast Burst Emission</strong> or <strong>▶ Run Stream</strong> above.</li>
                  <li>Watch the <strong>Event Timeline</strong> on the right: verify lifecycle progression from <code>subscribe</code> through <code>next</code> to <code>complete</code>.</li>
                  <li>Inspect the <strong>Stream Output & Telemetry</strong> console to review payload data and precise timestamp offsets.</li>
                </ol>
              </div>
            </div>

            <!-- Code Description & Line-by-Line Breakdown -->
            <div code-description>
              <div class="code-breakdown-table">
                <div class="breakdown-row">
                  <span class="code-token">import &#123; {{ operator.name }} &#125; from 'rxjs/operators'</span>
                  <span class="token-desc">Official ES Module import for RxJS <strong>{{ operator.category | uppercase }}</strong> pipeline.</span>
                </div>
                <div class="breakdown-row">
                  <span class="code-token">.pipe({{ operator.name }}(...))</span>
                  <span class="token-desc">{{ operator.description }}</span>
                </div>
                <div class="breakdown-row">
                  <span class="code-token">Enterprise Resilience Mechanics</span>
                  <span class="token-desc">Guarantees deterministic lifecycle handling, memory cleanup on unsubscription, and error boundary isolation.</span>
                </div>
              </div>
            </div>

            <!-- Deep-dive Explanation Section -->
            <div explanation>
              <h4>Enterprise Architecture: Production Semantics & Resilient Design</h4>
              <p>
                In high-scale enterprise architectures, <code>{{ operator.name }}</code> ensures resilient, predictable stream flow.
                {{ operator.description }}
              </p>
              <div class="callout callout-warning">
                <strong>Critical Architectural Fact:</strong>
                <p>
                  Always consider unsubscription semantics and error propagation. Pair with error handling operators (such as <code>catchError</code>) inside inner observable projections to prevent accidental pipeline termination.
                </p>
              </div>

              <div class="callout callout-info" *ngIf="operator.relatedOperators?.length">
                <strong>Related & Complementary Operators:</strong>
                <p>
                  Explore similar operators in the catalog: <strong>{{ operator.relatedOperators.join(', ') }}</strong>.
                </p>
              </div>
            </div>

            <!-- Real World Enterprise Example -->
            <div real-world>
              <div class="production-use-cases">
                @for (uc of operator.useCases; track uc; let idx = $index) {
                  <div class="use-case-card">
                    <h5>{{ idx + 1 }}. {{ uc }}</h5>
                    <p>
                      Production scenario leveraging <code>{{ operator.name }}</code> for deterministic stream processing, state management, and real-time frontend coordination.
                    </p>
                  </div>
                }
              </div>
            </div>
          </app-operator-example-layout>
        }
      }
    } @else {
      <div class="not-found glass-panel">
        <h2>Operator Not Found</h2>
        <p>The requested operator identifier does not exist in the catalogue.</p>
        <a routerLink="/catalog" class="back-link">← Return to Operator Explorer</a>
      </div>
    }
  `,
  styles: [`
    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .tutorial-instructions {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .tutorial-instructions strong {
      color: var(--text-main);
      display: block;
      margin-bottom: 4px;
    }
    .phase-desc {
      color: var(--text-muted);
      margin: 0.35rem 0 0.5rem 0;
      font-size: 0.85rem;
      line-height: 1.45;
    }
    .control-purpose-list {
      margin: 0.4rem 0 0 0;
      padding-left: 1.25rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .control-purpose-list strong {
      display: inline;
      color: var(--accent-cyan);
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .use-case-badges {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .use-case-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.4rem 0.65rem;
    }
    .pill-bullet {
      color: var(--accent-emerald);
      font-size: 0.75rem;
    }
    .quick-sim-buttons {
      margin-top: 0.25rem;
    }
    .sim-btn {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .sim-btn:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.25);
    }
    .sim-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .how-to-verify {
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border-subtle);
      border-radius: 6px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .how-to-verify strong {
      color: var(--accent-emerald);
    }
    .how-to-verify ol {
      padding-left: 1.25rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .field-row {
      display: flex;
      gap: 1rem;
    }
    .num-input {
      max-width: 140px;
    }
    .search-input-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .ctrl-input {
      flex: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
    }
    .ctrl-input:focus {
      border-color: var(--border-focus);
    }
    .hint-text {
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    .active-badge {
      background: rgba(245, 158, 11, 0.2);
      color: var(--accent-amber);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .code-breakdown-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .breakdown-row {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
    }
    .code-token {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }
    .token-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .callout {
      padding: 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    .callout-warning {
      background: rgba(245, 158, 11, 0.08);
      border-left: 3px solid var(--accent-amber);
      color: var(--text-main);
    }
    .callout-info {
      background: rgba(6, 182, 212, 0.08);
      border-left: 3px solid var(--accent-cyan);
      color: var(--text-main);
      margin-top: 0.5rem;
    }
    .production-use-cases {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    @media (max-width: 640px) {
      .production-use-cases { grid-template-columns: 1fr; }
    }
    .use-case-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.75rem;
    }
    .use-case-card h5 {
      margin: 0 0 0.35rem 0;
      font-size: 0.85rem;
      color: #38bdf8;
      font-weight: 600;
    }
    .use-case-card p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .not-found {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .back-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class OperatorDetailHostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;
  customPayload = 'Telemetry-Event-Alpha';
  mockDelay = 300;
  batchCount = 3;
  private startTime = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.operator = this.catalogService.getOperatorById(id);
        this.resetStream();
      }
    });
  }

  simulateBurst(): void {
    if (!this.operator) return;
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed to ${this.operator.name} pipeline with burst batching (${this.batchCount} events)`);

    for (let i = 1; i <= this.batchCount; i++) {
      setTimeout(() => {
        this.record('next', {
          operator: this.operator?.name,
          batchIndex: `${i}/${this.batchCount}`,
          payload: `${this.customPayload || 'Event'} #${i}`,
          latencyMs: `${this.mockDelay}ms`
        });
      }, i * Math.max(100, this.mockDelay / 2));
    }

    setTimeout(() => {
      this.record('complete', `${this.operator?.name} burst pipeline completed cleanly`);
      this.isRunning = false;
    }, (this.batchCount + 1) * Math.max(100, this.mockDelay / 2));
  }

  executeStream(): void {
    if (!this.operator) return;
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed to ${this.operator.name} pipeline`);

    setTimeout(() => {
      this.record('next', {
        operator: this.operator?.name,
        category: this.operator?.category,
        payload: this.customPayload || 'Active Payload',
        delay: `${this.mockDelay}ms`,
        lifecycle: 'In-flight execution'
      });
    }, this.mockDelay);

    setTimeout(() => {
      this.record('next', {
        operator: this.operator?.name,
        lifecycle: 'Pipeline transformed output',
        status: 200
      });
    }, this.mockDelay + 250);

    setTimeout(() => {
      this.record('complete', `${this.operator?.name} execution completed successfully`);
      this.isRunning = false;
    }, this.mockDelay + 400);
  }

  resetStream(): void {
    this.events = [];
    this.isRunning = false;
  }

  private record(type: any, value?: any): void {
    this.events.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now() - (this.startTime || Date.now()),
      type,
      value
    });
  }

  getDefaultSnippet(op: OperatorDefinition): string {
    return `// ${op.name} Enterprise Pipeline
import { of } from 'rxjs';
import { ${op.name} } from 'rxjs/operators';

// Category: ${op.category}
// Recommended: ${op.status}
// Use Cases: ${op.useCases.join('; ')}

of({ status: 'ACTIVE', timestamp: Date.now() }).pipe(
  // Applies ${op.name} operator
).subscribe({
  next: data => console.log('Emitted:', data),
  complete: () => console.log('Complete')
});`;
  }
}
