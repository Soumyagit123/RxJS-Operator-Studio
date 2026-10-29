import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { throttleTime, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-throttle-time-example',
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
        (run)="simulateRapidClicks()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              Users expect instantaneous UI response on initial interaction, but subsequent rapid spamming must be rate-limited.
              <code>throttleTime(duration)</code> emits the <strong>first value immediately</strong> (leading edge), then ignores all subsequent values for <em>duration</em> milliseconds.
            </p>
            <ul class="control-purpose-list">
              <li><strong>🖱️ Click Rapidly Button:</strong> Click repeatedly in under 500ms. Notice the 1st click registers with zero delay, while rapid follow-up clicks are suppressed.</li>
              <li><strong>Throttle Window Slider:</strong> Adjust the quiet cooldown window before another click is permitted through.</li>
              <li><strong>throttleTime vs debounceTime:</strong> <code>debounceTime</code> delays until the user pauses. <code>throttleTime</code> acts on the leading edge immediately.</li>
            </ul>
          </div>

          <div class="action-row">
            <button class="throttle-btn" (click)="onButtonClick()">
              🖱️ Click Rapidly (Clicks registered: {{ totalClicks }})
            </button>
            <div class="field-group duration-group">
              <label class="field-label">Throttle Window (ms):</label>
              <input type="number" [(ngModel)]="throttleMs" min="200" max="2000" step="100" (change)="initStream()" class="ctrl-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Leading-Edge Rate Limiting:</strong>
            <ol>
              <li>Click <strong>Click Rapidly</strong> 5 times in 1 second.</li>
              <li>Observe: the very 1st click emits <strong>instantly at 0ms</strong>.</li>
              <li>Clicks 2, 3, and 4 are suppressed without emission during the {{ throttleMs }}ms throttle cooldown window.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">throttleTime(100)</span>
              <span class="token-desc">Passes the leading emission immediately. Drops all emissions occurring within the following 100ms window.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">throttleTime(..., asyncScheduler, &#123; leading: true, trailing: true &#125;)</span>
              <span class="token-desc">By default, only <code>leading: true</code> is active. Enabling <code>trailing: true</code> ensures the final emission during a burst also executes at the end of the window.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Performance Safeguard</span>
              <span class="token-desc">Essential for 60fps animations, scroll position listeners, and gaming canvas input sampling without overloading the browser thread.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Window Scroll & Button Click Rate Limiting</h4>
          <p>
            Common in infinite scrolling components, resize listeners, or button taps: users expect immediate UI feedback without triggering hundreds of redundant operations per second.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Lost Trailing Value Trap:</strong>
            <p>
              By default, <code>throttleTime</code> only emits on the *leading edge*. If a user scrolls to the bottom of the page and stops abruptly inside the cooldown window, the final scroll position might be dropped! Use <code>&#123; leading: true, trailing: true &#125;</code> to guarantee the final state is captured.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Infinite Scroll Dynamic Page Loading</h5>
              <p>
                Throttling window scroll events to 150ms intervals to check if the viewport has reached the threshold distance from the bottom.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Like / Bookmark Button Debouncing</h5>
              <p>
                Allowing an immediate heart/like animation on first tap, but ignoring rapid taps for 1000ms to protect backend counters.
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
    .action-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .throttle-btn { background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
    .duration-group { max-width: 160px; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.25rem; }
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
    .callout { padding: 0.85rem; border-radius: 6px; font-size: 0.85rem; line-height: 1.5; }
    .callout-warning { background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-amber); color: var(--text-main); margin-top: 0.5rem; }
  `]
})
export class ThrottleTimeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  totalClicks = 0;
  throttleMs = 500;
  events: StreamEvent[] = [];
  isRunning = false;

  private readonly clickSubject$ = new Subject<number>();
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Throttling window scroll or button events
fromEvent(window, 'scroll').pipe(
  throttleTime(100) // Emit once every 100ms maximum
).subscribe(() => this.updateScrollPosition());`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('throttle-time');
    this.initStream();
  }

  initStream(): void {
    if (this.sub) this.sub.unsubscribe();
    this.startTime = Date.now();

    this.sub = this.clickSubject$.pipe(
      throttleTime(this.throttleMs),
      tap(clickNum => {
        this.record('next', `[Allowed through: Click #${clickNum} - Cooldown active for ${this.throttleMs}ms]`);
      })
    ).subscribe();
  }

  onButtonClick(): void {
    this.totalClicks++;
    this.record('subscribe', `Raw click event #${this.totalClicks} triggered`);
    this.clickSubject$.next(this.totalClicks);
  }

  simulateRapidClicks(): void {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.onButtonClick(), i * 100);
    }
  }

  resetStream(): void {
    this.totalClicks = 0;
    this.events = [];
    this.isRunning = false;
    this.initStream();
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
    if (this.sub) this.sub.unsubscribe();
  }
}
