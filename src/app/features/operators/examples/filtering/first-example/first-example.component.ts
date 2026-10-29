import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { from, Subscription, EMPTY } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-first-example',
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
              <code>first(predicate?, defaultValue?)</code> emits <strong>only the very first item</strong> (or the first item satisfying a predicate condition), then <strong>immediately unsubscribes and completes</strong>.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Filter Condition:</strong> Toggle between matching the raw first item, the first even number, or an impossible condition that triggers <code>EmptyError</code>.</li>
              <li><strong>Source Stream:</strong> Comma-separated array of items to emit into the pipeline.</li>
              <li><strong>Provide Default Value:</strong> If enabled, emits fallback value instead of throwing <code>EmptyError</code>.</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Selection Predicate:</label>
              <select [(ngModel)]="mode" (change)="updateSnippet()" class="ctrl-input">
                <option value="raw">Raw First Item (first())</option>
                <option value="even">First Even Number (first(n => n % 2 === 0))</option>
                <option value="gt100">First Number &gt; 100 (Unmatched Condition)</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Use Fallback Default Value?</label>
              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="useDefaultValue" (change)="updateSnippet()" />
                <span>{{ useDefaultValue ? 'Fallback: -1 (No Error)' : 'No Fallback (Throws EmptyError)' }}</span>
              </label>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Source Stream Items (comma-separated):</label>
            <input type="text" [(ngModel)]="streamInput" (change)="updateSnippet()" class="ctrl-input" />
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Select <strong>Raw First Item</strong> and click <strong>▶ Run Stream</strong>:
                Notice it emits the first item (<code>{{ getItems()[0] }}</code>) and <strong>immediately completes</strong>, ignoring all remaining items.
              </li>
              <li>Select <strong>First Even Number</strong>:
                Notice items are inspected in sequence until the first even number is found, then completes immediately.
              </li>
              <li>Select <strong>First Number &gt; 100</strong> with Fallback OFF:
                Observe that when the stream completes without finding any match, <code>first()</code> throws an <code>EmptyError</code>.
              </li>
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
                <td class="code-token"><code>from(items$)</code></td>
                <td class="token-desc">
                  Upstream source observable emitting sequential data items.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>first(predicate?, defaultValue?)</code></td>
                <td class="token-desc">
                  Emits the first matched value and <strong>immediately triggers teardown</strong> (unsubscribes upstream).
                  Unlike <code>take(1)</code>, if the upstream completes with 0 matches and no default is provided, <code>first()</code> throws <code>EmptyError</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: <code>first()</code> vs <code>take(1)</code> Architecture Decision</h4>
          <p>
            One of the most critical enterprise nuances in RxJS is choosing between <code>first()</code> and <code>take(1)</code>:
          </p>
          <ul>
            <li><strong>Use <code>take(1)</code> for Optional / Nullable Streams:</strong> If a stream might complete empty without an error being a failure (e.g., closing an optional dialog, reading an optional query param).</li>
            <li><strong>Use <code>first()</code> for Strict Invariants:</strong> If receiving 0 items violates business logic (e.g. "Every order must have a valid customer profile"). Throwing <code>EmptyError</code> forces developers to handle the missing invariant.</li>
          </ul>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Silent Errors vs. Unhandled EmptyError</strong>
            <p>
              If the upstream completes without satisfying the predicate, <code>first()</code> raises <code>EmptyError: no elements in sequence</code>.
              Always supply a default value <code>first(predicate, fallbackValue)</code> or handle errors with <code>catchError()</code> if the stream could complete empty.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Authentication State Guard</h5>
              <p>
                Reading the current token from an auth service: <code>authService.currentUser$.pipe(first(user =&gt; user !== null))</code> to wait for initial login bootstrap before allowing route navigation.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Guaranteed Single HTTP Request Execution</h5>
              <p>
                Wrapping an Observable service call in an Angular resolver to ensure the resolver completes as soon as the first payload arrives.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. WebSocket Initial Handshake Acknowledgment</h5>
              <p>
                Waiting for the first <code>ACK</code> frame from a websocket connection before transitioning the UI to connected mode.
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
    .toggle-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-main); cursor: pointer; padding-top: 0.25rem; }
    .toggle-label input { width: 16px; height: 16px; accent-color: var(--accent-indigo); }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class FirstExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  mode: 'raw' | 'even' | 'gt100' = 'raw';
  useDefaultValue = false;
  streamInput = '3, 7, 8, 11, 14';

  private sub?: Subscription;
  private startTime = 0;

  codeSnippet = '';

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('first');
    this.updateSnippet();
  }

  getItems(): number[] {
    return this.streamInput
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));
  }

  updateSnippet(): void {
    if (this.mode === 'raw') {
      this.codeSnippet = `// Emits first element and immediately completes\nfrom([${this.streamInput}]).pipe(\n  first(${this.useDefaultValue ? 'undefined, -1' : ''})\n).subscribe({\n  next: val => console.log('First:', val),\n  complete: () => console.log('Complete')\n});`;
    } else if (this.mode === 'even') {
      this.codeSnippet = `// Emits first element satisfying condition\nfrom([${this.streamInput}]).pipe(\n  first(n => n % 2 === 0${this.useDefaultValue ? ', -1' : ''})\n).subscribe({\n  next: val => console.log('First Even:', val),\n  complete: () => console.log('Complete')\n});`;
    } else {
      this.codeSnippet = `// Throws EmptyError if no element matches (unless defaultValue supplied)\nfrom([${this.streamInput}]).pipe(\n  first(n => n > 100${this.useDefaultValue ? ', -1' : ''})\n).subscribe({\n  next: val => console.log('Matched:', val),\n  error: err => console.error(err) // EmptyError\n});`;
    }
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const items = this.getItems();
    this.record('subscribe', `Subscribed to stream with ${items.length} items`);

    let stream$: any;
    if (this.mode === 'raw') {
      stream$ = this.useDefaultValue
        ? from(items).pipe(first(undefined, -1))
        : from(items).pipe(first());
    } else if (this.mode === 'even') {
      stream$ = this.useDefaultValue
        ? from(items).pipe(first(n => n % 2 === 0, -1))
        : from(items).pipe(first(n => n % 2 === 0));
    } else {
      stream$ = this.useDefaultValue
        ? from(items).pipe(first(n => n > 100, -1))
        : from(items).pipe(first(n => n > 100));
    }

    this.sub = stream$.subscribe({
      next: (val: any) => {
        this.record('next', { emitted: val, note: 'Emitted by first() operator' });
      },
      complete: () => {
        this.record('complete', 'Stream completed cleanly after single item');
        this.isRunning = false;
      },
      error: (err: any) => {
        this.record('error', err?.message || String(err));
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
