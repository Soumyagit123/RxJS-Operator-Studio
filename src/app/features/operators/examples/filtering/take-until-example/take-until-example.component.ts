import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-take-until-example',
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
              Zombie subscriptions in single-page apps keep detached DOM elements, event listeners, and services alive in memory.
              <code>takeUntil(notifier$)</code> emits values from the source until the <strong>notifier Observable emits</strong>, triggering immediate unsubscription and completion.
            </p>
            <ul class="control-purpose-list">
              <li><strong>▶ Run Stream:</strong> Starts an infinite background interval (simulating a WebSocket or sensor feed).</li>
              <li><strong>🛑 Emit Notifier Button:</strong> Dispatches a void notification into <code>destroy$</code> (simulating Angular component destruction).</li>
              <li><strong>Live Stream Status:</strong> Displays real-time connection state.</li>
            </ul>
          </div>

          <div class="teardown-control-box">
            <button class="stop-btn" (click)="triggerNotifier()" [disabled]="!isRunning">
              🛑 Emit Notifier (Simulate ngOnDestroy / Component Teardown)
            </button>
            <span class="stream-status" [class.active]="isRunning">
              {{ isRunning ? '🟢 Source Stream Live & Emitting...' : '⚪ Stream Idle / Unbound' }}
            </span>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Clean Teardown:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong> to start continuous tick emissions.</li>
              <li>While it is actively emitting, click <strong>🛑 Emit Notifier</strong>.</li>
              <li>Notice the stream stops immediately: a <span class="badge badge-filtering">COMPLETE</span> event is logged, and no further ticks emit, proving memory leak safety.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">source$.pipe(takeUntil(this.destroy$))</span>
              <span class="token-desc">Listens to the source stream. The instant <code>this.destroy$</code> emits a value, it completes the downstream subscription and calls unbind on source.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">The "Last Operator" Rule</span>
              <span class="token-desc">In operators pipelines, always place <code>takeUntil</code> near the end of the pipe so downstream operators don't hold active subscriptions.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">takeUntil vs takeUntilDestroyed</span>
              <span class="token-desc"><code>takeUntil</code> is pure RxJS. In Angular 16+, <code>takeUntilDestroyed()</code> is an Angular-specific interop utility tied to <code>DestroyRef</code> without needing a manual Subject.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Declarative Subscription Teardown</h4>
          <p>
            <code>takeUntil</code> is the canonical RxJS pattern for preventing memory leaks in components before Angular 16 introduced <code>takeUntilDestroyed</code>.
            By connecting a stream to a <code>destroy$ = new Subject&lt;void&gt;()</code> notifier fired in <code>ngOnDestroy()</code>, every active listener is cleanly closed.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Leaky Subject Trap:</strong>
            <p>
              When using <code>destroy$ = new Subject&lt;void&gt;()</code>, always call <code>this.destroy$.next(); this.destroy$.complete();</code> in <code>ngOnDestroy</code>. Failing to complete the notifier itself retains the subject instance in memory!
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Live Financial Ticker Component</h5>
              <p>
                A stock exchange price component subscribing to a global WebSocket. <code>takeUntil(this.destroy$)</code> stops ticker consumption immediately when the trader switches views.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Drag-and-Drop Event Termination</h5>
              <p>
                Listening to window <code>mousemove</code> coordinates with <code>fromEvent(window, 'mousemove').pipe(takeUntil(mouseup$))</code> to gracefully end mouse tracking.
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
    .teardown-control-box { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .stop-btn { background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
    .stop-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .stream-status { font-size: 0.85rem; color: var(--text-dim); }
    .stream-status.active { color: var(--accent-emerald); font-weight: 600; }
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
export class TakeUntilExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  private readonly notifier$ = new Subject<void>();
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Declarative Component Teardown
private readonly destroy$ = new Subject<void>();

ngOnInit(): void {
  this.sensorService.liveData$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(data => this.render(data));
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('take-until');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', 'Subscribed to continuous live stream with takeUntil(notifier$)');

    this.sub = interval(300).pipe(
      takeUntil(this.notifier$),
      tap(n => this.record('next', `Stream value #${n} at +${Date.now() - this.startTime}ms`))
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

  triggerNotifier(): void {
    if (!this.isRunning) return;
    this.record('subscribe', '[Notifier Emitted 🛑 -> Terminating source stream now]');
    this.notifier$.next();
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
    this.notifier$.next();
    this.notifier$.complete();
    this.resetStream();
  }
}
