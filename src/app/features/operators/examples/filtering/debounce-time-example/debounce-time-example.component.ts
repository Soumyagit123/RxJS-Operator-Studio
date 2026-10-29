import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-debounce-time-example',
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
        (run)="simulateBurst()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              High-frequency user inputs (typing, resizing, scrolling) flood systems if passed directly to backends.
              <code>debounceTime(dueTime)</code> suppresses emissions until <em>dueTime</em> milliseconds of total silence have elapsed since the last emission.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Interactive Keystroke Input:</strong> Type letters in rapid succession to observe intermediate characters getting discarded.</li>
              <li><strong>Debounce Window Slider:</strong> Configure silence duration threshold (e.g. 300ms). Notice that increasing this value creates a longer pause before emissions pass downstream.</li>
              <li><strong>⚡ Fast Keystroke Burst:</strong> Dispatches 3 letters spaced 100ms apart, proving only the last character survives the silence timer.</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Interactive Keystroke Input:</label>
              <input 
                type="text" 
                [(ngModel)]="inputText" 
                (ngModelChange)="onInputChange($event)"
                class="ctrl-input" 
                placeholder="Type quickly here..."
              />
            </div>
            <div class="field-group">
              <label class="field-label">Debounce Window (ms):</label>
              <input type="number" [(ngModel)]="debounceMs" min="100" max="1500" step="50" (change)="initStream()" class="ctrl-input" />
            </div>
          </div>

          <div class="sim-actions">
            <button class="sim-btn" (click)="simulateBurst()">
              ⚡ Simulate 3 Keystrokes with 100ms pauses (Only last should survive)
            </button>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Silence Window Stabilization:</strong>
            <ol>
              <li>Type multiple characters rapidly (e.g. "a", "b", "c").</li>
              <li>Observe that raw keystrokes are received by the Subject, but NO output value emits until you stop typing for {{ debounceMs }}ms.</li>
              <li>Once the silence threshold is reached, a single <span class="badge badge-filtering">NEXT</span> event emits with the final query.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">input$.pipe(debounceTime(300))</span>
              <span class="token-desc">Resets its internal timer every time a new event arrives. Only emits when the timer reaches 300ms without new events.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">distinctUntilChanged() Pairing</span>
              <span class="token-desc">Always pair with <code>distinctUntilChanged()</code> in search boxes so users who type a character and delete it do not trigger duplicate queries.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">debounceTime vs throttleTime</span>
              <span class="token-desc"><code>debounceTime</code> emits *after* activity ceases (trailing edge). <code>throttleTime</code> emits *immediately* on first click and ignores subsequent events for a duration (leading edge).</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Search Inputs & Form Autosave</h4>
          <p>
            Without <code>debounceTime</code>, typing a 10-character search term dispatches 10 individual HTTP requests.
            By adding a 300ms debounce, only 1 request is dispatched after the user finishes typing, saving server compute and bandwidth.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The "Form Submit on Enter" Trap:</strong>
            <p>
              If a user presses "Enter" immediately after typing, <code>debounceTime(300)</code> will delay the value by 300ms. In enterprise forms, listen to both the debounced stream and immediate form submit events to avoid missing final characters!
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Draft Document Autosave</h5>
              <p>
                In rich-text editors (like Google Docs or Jira descriptions), saving content to cloud storage 1000ms after the author pauses typing.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Responsive Window Resize Calculation</h5>
              <p>
                Recalculating SVG charts or complex canvas layouts only after the user has finished dragging the browser window dimensions.
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
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .sim-btn { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
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
export class DebounceTimeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  inputText = '';
  debounceMs = 300;
  events: StreamEvent[] = [];
  isRunning = false;

  private readonly inputSubject$ = new Subject<string>();
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Debouncing search keystrokes
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(query => this.dispatchSearch(query));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('debounce-time');
    this.initStream();
  }

  initStream(): void {
    if (this.sub) this.sub.unsubscribe();
    this.startTime = Date.now();

    this.sub = this.inputSubject$.pipe(
      tap(val => this.record('subscribe', `[Raw keystroke received: "${val}" -> Resetting ${this.debounceMs}ms silence timer]`)),
      debounceTime(this.debounceMs),
      tap(val => {
        this.record('next', `Debounce satisfied! Emitted stabilized query: "${val}"`);
        this.isRunning = false;
      })
    ).subscribe();
  }

  onInputChange(val: string): void {
    this.isRunning = true;
    this.inputSubject$.next(val);
  }

  simulateBurst(): void {
    const sequence = ['D', 'De', 'Dev'];
    sequence.forEach((txt, idx) => {
      setTimeout(() => {
        this.inputText = txt;
        this.onInputChange(txt);
      }, idx * 100);
    });
  }

  resetStream(): void {
    this.inputText = '';
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
