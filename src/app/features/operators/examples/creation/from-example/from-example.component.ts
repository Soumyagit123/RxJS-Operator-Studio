import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { from, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-from-example',
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
              <code>from(...)</code> converts an <strong>Iterable (Array, Set, Map)</strong> or a <strong>JavaScript Promise</strong> into an Observable stream that emits each entry individually.
              Select the source type below to observe how different JavaScript data structures flatten into stream emissions.
            </p>
          </div>

          <div class="field-group">
            <label class="field-label">Source Data Type to Convert:</label>
            <div class="type-selector">
              <label class="radio-label">
                <input type="radio" [(ngModel)]="sourceType" value="array" (change)="onSourceTypeChange()" />
                Array / Iterable
              </label>
              <label class="radio-label">
                <input type="radio" [(ngModel)]="sourceType" value="promise" (change)="onSourceTypeChange()" />
                Promise (Simulated Async Fetch)
              </label>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">{{ sourceType === 'array' ? 'Array Elements (comma-separated):' : 'Promise Resolution Value:' }}</label>
            <input 
              type="text" 
              [(ngModel)]="inputValue" 
              class="ctrl-input" 
              [placeholder]="sourceType === 'array' ? 'e.g. User #1, User #2, User #3' : 'e.g. Async DTO Loaded'"
            />
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Observe in the console how an Array produces <em>multiple individual NEXT events</em> (unlike <code>of([1,2,3])</code> which produces 1 array emission).</li>
              <li>When selecting <strong>Promise</strong>, watch the timestamp: the emission occurs after the promise resolves asynchronously.</li>
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
                <td class="code-token"><code>from(['User #1', ...])</code></td>
                <td class="token-desc">
                  Iterates over iterable data collections and pushes each element as a distinct <code>next</code> notification before completing.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>from(promise)</code></td>
                <td class="token-desc">
                  Bridges existing Promise-based APIs into the RxJS reactive paradigm. If the Promise resolves, it emits the resolved value and completes; if rejected, it emits an <code>error</code> notification.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>subscribe(user =&gt; ...)</code></td>
                <td class="token-desc">
                  Subscribes consumer logic, triggering immediate synchronous iteration for Arrays or async resolution for Promises.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: <code>from</code> vs <code>of</code> Mechanics</h4>
          <p>
            One of the most common beginner mistakes in Angular is using <code>of(itemsArray)</code> and expecting to receive individual elements in the pipeline.
            <code>from(itemsArray)</code> unpacks the collection and emits items one by one.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Promises are Eager, Observables are Cold</strong>
            <p>
              When passing a Promise to <code>from(fetchDataPromise)</code>, remember that Promises begin executing <strong>immediately upon creation</strong>, even before <code>subscribe()</code> is called.
              To make promise execution lazy (so the network call only fires upon subscription), wrap it with <code>defer(() =&gt; from(fetchDataPromise()))</code>.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Bridging Third-Party SDKs (Stripe / Firebase)</h5>
              <p>
                Converting Promise-based payments (e.g. <code>stripe.createToken()</code>) into an Observable to chain with <code>timeout(5000)</code> and <code>retry(2)</code> before dispatching backend confirmations.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Batch Queue Processing</h5>
              <p>
                Converting an array of 50 pending file uploads via <code>from(files).pipe(mergeMap(upload, 3))</code> to achieve controlled concurrency without swamping network sockets.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Browser Native Async APIs</h5>
              <p>
                Wrapping modern browser APIs such as <code>navigator.clipboard.readText()</code> or <code>navigator.storage.estimate()</code> into reactive pipelines.
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
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .type-selector { display: flex; gap: 1.5rem; margin: 0.25rem 0; }
    .radio-label { font-size: 0.85rem; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem; cursor: pointer; }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .ctrl-input:focus { border-color: var(--border-focus); }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
    .callout { padding: 0.85rem; border-radius: 6px; background: rgba(6, 182, 212, 0.08); border-left: 3px solid var(--accent-cyan); font-size: 0.85rem; margin-top: 0.75rem; }
    .callout ul { margin-top: 0.5rem; padding-left: 1.25rem; }
    .callout li { margin-bottom: 0.25rem; }
  `]
})
export class FromExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  sourceType: 'array' | 'promise' = 'array';
  inputValue = 'User #1, User #2, User #3';
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  codeSnippet = `// 1. Array conversion
from(['User #1', 'User #2', 'User #3']).subscribe(user => console.log(user));

// 2. Promise conversion
from(fetchUserProfilePromise).subscribe(profile => console.log(profile));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('from');
  }

  onSourceTypeChange(): void {
    if (this.sourceType === 'array') {
      this.inputValue = 'User #1, User #2, User #3';
      this.codeSnippet = `// Array conversion emits each item individually\nfrom(['User #1', 'User #2', 'User #3']).subscribe(user => console.log(user));`;
    } else {
      this.inputValue = 'Async User Profile Payload (200 OK)';
      this.codeSnippet = `// Promise conversion awaits resolution then completes\nconst asyncTask = new Promise(resolve => setTimeout(() => resolve('Async Payload'), 400));\nfrom(asyncTask).subscribe(val => console.log(val));`;
    }
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed to from(${this.sourceType})`);

    let source$: any;
    if (this.sourceType === 'array') {
      const items = this.inputValue.split(',').map(s => s.trim()).filter(Boolean);
      source$ = from(items);
    } else {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve(this.inputValue), 400);
      });
      source$ = from(promise);
    }

    this.sub = source$.pipe(
      tap((val: any) => this.record('next', val))
    ).subscribe({
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err: any) => {
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
