import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Observable, Subscription } from 'rxjs';
import { share, tap, take } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-share-example',
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
              <code>share()</code> multicasts a single underlying execution across multiple active subscribers using reference counting.
              When the first subscriber connects, the source starts. When all subscribers disconnect, the source unbinds.
            </p>
          </div>

          <div class="subscribers-bar">
            <button class="subscriber-btn" (click)="toggleSubscriberA()">
              {{ isSubscribedA ? '🛑 Disconnect Consumer A' : '➕ Connect Consumer A' }}
            </button>
            <button class="subscriber-btn" (click)="toggleSubscriberB()">
              {{ isSubscribedB ? '🛑 Disconnect Consumer B' : '➕ Connect Consumer B' }}
            </button>
          </div>

          <div class="telemetry-box">
            <div class="stat-pill">
              Active RefCount: <strong>{{ activeSubscriberCount }}</strong>
            </div>
            <div class="stat-pill">
              Producer Execution Ticks: <strong class="producer-tick">{{ producerExecutionCount }}</strong>
            </div>
            <div class="status-indicator" [class.live]="activeSubscriberCount > 0">
              {{ activeSubscriberCount > 0 ? '🟢 Upstream Producer RUNNING' : '⚪ Upstream Producer TEARDOWN / IDLE' }}
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>➕ Connect Consumer A</strong>:
                Notice the upstream producer starts ticking (RefCount: 1).
              </li>
              <li>Click <strong>➕ Connect Consumer B</strong>:
                Notice Consumer B receives the exact same ticks in real time without creating a second producer timer!
              </li>
              <li>Disconnect both consumers:
                When RefCount reaches 0, the shared stream automatically unsubscribes upstream, conserving resources.
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
                <td class="code-token"><code>this.hardwareService.readMetrics()</code></td>
                <td class="token-desc">
                  Cold, resource-heavy upstream producer. If left unshared, each subscriber would establish an independent sensor poll loop or WebSocket connection.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>tap(...)</code></td>
                <td class="token-desc">
                  Demonstrates producer execution frequency. Notice in the console that despite having multiple subscribers, this tap callback fires only ONCE per hardware tick.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>share()</code></td>
                <td class="token-desc">
                  RxJS 7 multicast operator with automatic refCount. Connects to upstream when subscribers &gt; 0, and unbinds upstream when subscribers drop to 0. Does NOT replay past values to late subscribers.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Live Streams vs. Replayed State</h4>
          <p>
            Understanding the distinction between <code>share()</code> and <code>shareReplay()</code> is one of the most critical reactive architecture concepts in Angular:
          </p>
          <ul>
            <li><strong>Use <code>share()</code> for Live Ephemeral Events:</strong> Real-time feeds (mouse movements, window resize ticks, live WebSocket ticks) where late subscribers only care about what happens <em>from the moment they subscribe onwards</em>.</li>
            <li><strong>Use <code>shareReplay(1)</code> for State & HTTP Queries:</strong> User profile queries, permissions, or auth tokens where late subscribers must immediately receive the latest cached record.</li>
          </ul>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Late Subscribers Receive Nothing Until the Next Tick</strong>
            <p>
              Unlike <code>shareReplay(&#123; bufferSize: 1, refCount: true &#125;)</code>, <code>share()</code> does NOT hold a buffer. If an event fired 5 milliseconds before a subscriber attached, that subscriber will miss it completely and wait for the subsequent event.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Shared WebSocket Ticker Bus</h5>
              <p>
                A single WebSocket connection multiplexed to 15 different dashboard widgets. <code>share()</code> ensures only 1 socket listener is open, cleanly closing the socket when all widgets unmount.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Window Resize & Scroll Observers</h5>
              <p>
                Debounced global window resize listeners shared among grids, header bars, and navigation drawers without binding 20 redundant DOM listeners.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Heartbeat / Activity Monitors</h5>
              <p>
                Session timeout managers listening to shared user click/keypress streams to refresh JWT idle timers across multiple browser microfrontends.
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
    .subscribers-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .subscriber-btn { background: rgba(99, 102, 241, 0.15); border: 1px solid var(--accent-indigo); color: var(--text-main); padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .subscriber-btn:hover { background: rgba(99, 102, 241, 0.25); }
    .telemetry-box { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .stat-pill { font-size: 0.85rem; color: var(--text-muted); }
    .stat-pill strong { color: var(--text-main); }
    .producer-tick { color: var(--accent-cyan); font-size: 1.1rem; }
    .status-indicator { font-size: 0.85rem; color: var(--text-dim); margin-left: auto; }
    .status-indicator.live { color: var(--accent-emerald); font-weight: 600; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class ShareExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  producerExecutionCount = 0;
  isSubscribedA = false;
  isSubscribedB = false;

  private sharedStream$?: Observable<number>;
  private subA?: Subscription;
  private subB?: Subscription;
  private startTime = 0;

  get activeSubscriberCount(): number {
    return (this.isSubscribedA ? 1 : 0) + (this.isSubscribedB ? 1 : 0);
  }

  readonly codeSnippet = `// Multicasting a Single Upstream Live Sensor Stream
readonly liveSensor$ = this.hardwareService.readMetrics().pipe(
  tap(raw => console.log('Upstream sensor read: ', raw)),
  share() // Automatically connects on 1st subscriber, unbinds when 0
);

// Component A
this.liveSensor$.subscribe(data => this.renderGauge(data));

// Component B
this.liveSensor$.subscribe(data => this.renderGraph(data));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('share');
    this.initSharedStream();
  }

  initSharedStream(): void {
    this.producerExecutionCount = 0;
    this.sharedStream$ = interval(300).pipe(
      tap(n => {
        this.producerExecutionCount++;
        this.record('subscribe', `[Shared Upstream Producer] Emitted tick #${n} (Total ticks: ${this.producerExecutionCount})`);
      }),
      share()
    );
  }

  executeStream(): void {
    this.resetStream();
    this.initSharedStream();
    this.toggleSubscriberA();
  }

  toggleSubscriberA(): void {
    if (this.isSubscribedA) {
      if (this.subA) this.subA.unsubscribe();
      this.subA = undefined;
      this.isSubscribedA = false;
      this.record('unsubscribe', 'Consumer A disconnected');
      this.checkRunningState();
      return;
    }

    if (!this.sharedStream$) this.initSharedStream();
    this.isRunning = true;
    this.isSubscribedA = true;
    this.startTime = this.startTime || Date.now();
    this.record('subscribe', 'Consumer A connected (RefCount +1)');

    this.subA = this.sharedStream$!.subscribe(n => {
      this.record('next', { consumer: 'Consumer A', value: n });
    });
  }

  toggleSubscriberB(): void {
    if (this.isSubscribedB) {
      if (this.subB) this.subB.unsubscribe();
      this.subB = undefined;
      this.isSubscribedB = false;
      this.record('unsubscribe', 'Consumer B disconnected');
      this.checkRunningState();
      return;
    }

    if (!this.sharedStream$) this.initSharedStream();
    this.isRunning = true;
    this.isSubscribedB = true;
    this.startTime = this.startTime || Date.now();
    this.record('subscribe', 'Consumer B connected (RefCount +1)');

    this.subB = this.sharedStream$!.subscribe(n => {
      this.record('next', { consumer: 'Consumer B', value: n });
    });
  }

  private checkRunningState(): void {
    if (this.activeSubscriberCount === 0) {
      this.isRunning = false;
      this.record('unsubscribe', '[RefCount = 0] Upstream producer automatically torn down');
    }
  }

  resetStream(): void {
    if (this.subA) {
      this.subA.unsubscribe();
      this.subA = undefined;
    }
    if (this.subB) {
      this.subB.unsubscribe();
      this.subB = undefined;
    }
    this.isSubscribedA = false;
    this.isSubscribedB = false;
    this.isRunning = false;
    this.producerExecutionCount = 0;
  }

  private record(type: any, value?: any): void {
    this.events.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now() - (this.startTime || Date.now()),
      type,
      value
    });
  }

  ngOnDestroy(): void {
    this.resetStream();
  }
}
