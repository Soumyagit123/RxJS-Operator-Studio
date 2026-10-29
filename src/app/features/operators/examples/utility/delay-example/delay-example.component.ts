import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-delay-example',
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
              <code>delay(ms)</code> shifts every emission from the source Observable forward in time by a specified duration, without altering the order of items.
            </p>
          </div>

          <div class="delay-slider-box">
            <label class="slider-label">
              <span>Configured Shift Delay: <strong>{{ delayDurationMs }}ms</strong></span>
              <input type="range" [(ngModel)]="delayDurationMs" min="100" max="2000" step="100" class="custom-range" />
            </label>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Delay: 800ms</strong> and click <strong>▶ Run Stream</strong>.</li>
              <li>Observe the output timeline: <code>Subscribed</code> is logged at <code>+0ms</code>, and the delayed item arrives at roughly <code>+800ms</code>.</li>
              <li>Notice that unlike <code>debounceTime</code>, <code>delay</code> does NOT drop values; every emission is faithfully preserved and shifted forward in time.</li>
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
                <td class="code-token"><code>of(MOCK_ACCOUNT_DATA)</code></td>
                <td class="token-desc">
                  Synchronous source emission. Emits mock financial data immediately upon subscription.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>delay(500)</code></td>
                <td class="token-desc">
                  Temporal shift operator. Schedules each next notification onto the <code>asyncScheduler</code>, postponing downstream emission by exactly 500ms while preserving order.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>tap(data =&gt; ...)</code></td>
                <td class="token-desc">
                  Downstream spy. Logs the receipt of the shifted payload without mutating the underlying data structure.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Network Simulation & UX Choreography</h4>
          <p>
            <code>delay</code> is invaluable in enterprise development for both testing and user experience tuning:
          </p>
          <ul>
            <li><strong>Mocking Network Realism:</strong> Immediate mock responses can mask race conditions and layout shifts in development. Injecting realistic 300-800ms delays exposes flash-of-unstyled-content (FOUC) and spinner glitches before production.</li>
            <li><strong>Preventing Flash-of-Loading-State:</strong> Microsecond requests can make spinners flicker jarringly. Coordinating <code>delay</code> with minimal loading duration timers ensures smooth, human-friendly animations.</li>
          </ul>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Error Notifications are NOT Delayed by Default</strong>
            <p>
              By default, <code>delay(duration)</code> delays <code>next</code> and <code>complete</code> notifications, but if the source emits an <code>error</code>, the error notification is emitted <strong>immediately</strong> without delay.
              To delay errors as well, pass a custom date or scheduler configuration.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Offline/Dev Mock Interceptors</h5>
              <p>
                In local microfrontend development where backend services are unavailable, HTTP interceptors use <code>delay(randomBetween(200, 600))</code> to simulate realistic 4G/LTE roundtrips.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Auto-Dismiss Toast Notifications</h5>
              <p>
                Pipelining a banner event with <code>of(bannerId).pipe(delay(4000))</code> allows seamless automatic dismiss dispatching without managing raw <code>setTimeout</code> IDs.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Sequential UI Staggering</h5>
              <p>
                Revealing multiple cards or onboarding steps sequentially by mapping list items with staggered delays: <code>index * 150ms</code>.
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
    .delay-slider-box { background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .slider-label { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: var(--text-main); }
    .custom-range { accent-color: var(--accent-indigo); width: 100%; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class DelayExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  delayDurationMs = 500;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Simulating Realistic API Response Latency
return of(MOCK_ACCOUNT_DATA).pipe(
  delay(500), // Shift emissions forward by 500ms
  tap(data => this.logger.debug('Delayed mock data ready', data))
);`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('delay');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed at +0ms. Shifting downstream by ${this.delayDurationMs}ms...`);

    this.sub = of({ message: 'Payload Delivered', dispatchedAt: 0 }).pipe(
      delay(this.delayDurationMs),
      tap(item => this.record('next', { ...item, arrivedAtMs: Date.now() - this.startTime }))
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
