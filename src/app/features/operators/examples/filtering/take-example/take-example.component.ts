import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-take-example',
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
              <code>take(count)</code> captures only the first <strong>count</strong> emissions from an Observable stream and then <strong>immediately completes</strong>, cleanly disposing of upstream timers, sockets, or listeners.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Take Count (N):</strong> Defines how many items to emit before cutting off the stream.</li>
              <li><strong>Ticker Speed:</strong> How fast the infinite source emits (in milliseconds).</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Items to Take (Count N):</label>
              <input type="number" [(ngModel)]="takeCount" min="1" max="10" (change)="updateSnippet()" class="ctrl-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Source Interval Tick (ms):</label>
              <input type="number" [(ngModel)]="intervalSpeed" min="100" max="1000" step="100" (change)="updateSnippet()" class="ctrl-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Items to Take: 3</strong> and click <strong>▶ Run Stream</strong>.</li>
              <li>Watch the live ticker emit <code>#0, #1, #2</code>.</li>
              <li>Notice that right after the 3rd item emits, the stream immediately fires <code>COMPLETE</code> and terminates the timer, preventing memory leaks.</li>
            </ol>
          </div>
        </div>

        <div code-description class="code-description-box">
          <table class="code-breakdown-table">
            <thead>
              <tr>
                <th>Code Token</th>
                <th>Enterprise Semantics & Lifecycle Mechanics</th>
              </tr>
            </thead>
            <tbody>
              <tr class="breakdown-row">
                <td class="code-token"><code>interval(300)</code></td>
                <td class="token-desc">
                  Infinite ticker source that would run perpetually without a termination operator.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>take(3)</code></td>
                <td class="token-desc">
                  Maintains an internal count. Pushes each value downstream. When count reaches 3, sends a <code>complete</code> notification and unsubscribes from the interval.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Bounding Infinite Streams & Single-Shot Reads</h4>
          <p>
            <code>take(1)</code> is widely used across Angular apps for reading a snapshot from a <code>BehaviorSubject</code> or Store without retaining a long-lived subscription.
            For numbers &gt; 1, <code>take(n)</code> provides deterministic pagination and batch chunk limits.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: take(0) Completes Instantly</strong>
            <p>
              Passing <code>take(0)</code> causes the operator to immediately complete without subscribing to the source at all.
              Always validate that dynamic bounds passed to <code>take()</code> are positive integers.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. NgRx / Akita State Snapshot Read</h5>
              <p>
                Reading the current user permissions snapshot once on component init: <code>store.select(selectPermissions).pipe(take(1))</code> without needing manual unsubscribe in ngOnDestroy.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Limited Event Sampling</h5>
              <p>
                Capturing the first 5 interactions during an onboarding walkthrough tour before disabling the guide overlay.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. WebSocket Pings with Auto-Teardown</h5>
              <p>
                Transmitting a bounded batch of 3 handshake ping packets before opening full duplex communications.
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
    .control-purpose-list { margin: 0.4rem 0 0 1.25rem; padding: 0; color: var(--text-dim); font-size: 0.8rem; }
    .field-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .field-group { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class TakeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  takeCount = 3;
  intervalSpeed = 300;

  private sub?: Subscription;
  private startTime = 0;

  codeSnippet = '';

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('take');
    this.updateSnippet();
  }

  updateSnippet(): void {
    this.codeSnippet = `// Bounding an infinite stream to ${this.takeCount} items\ninterval(${this.intervalSpeed}).pipe(\n  take(${this.takeCount})\n).subscribe({\n  next: tick => console.log('Tick:', tick),\n  complete: () => console.log('Clean Teardown Complete')\n});`;
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed to infinite interval(${this.intervalSpeed}ms) with take(${this.takeCount})`);

    this.sub = interval(this.intervalSpeed).pipe(
      take(this.takeCount),
      tap(n => this.record('next', { tick: n, count: `${n + 1} of ${this.takeCount}` }))
    ).subscribe({
      complete: () => {
        this.record('complete', `Reached take limit (${this.takeCount}). Auto-unsubscribed from interval.`);
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
