import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { from, Subscription } from 'rxjs';
import { last, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-last-example',
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
              <code>last(predicate?, defaultValue?)</code> waits for the source Observable to <strong>completely finish (complete notification)</strong>, and then emits <strong>only the very last item</strong> (or the last item satisfying a predicate) before completing.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Selection Mode:</strong> Select whether to pick the absolute last item, the last even number, or test an unmatched condition.</li>
              <li><strong>Source Stream:</strong> Comma-separated array representing a finite stream of events.</li>
              <li><strong>Provide Default Value:</strong> If enabled, emits fallback instead of throwing <code>EmptyError</code> if no item matches.</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Predicate Mode:</label>
              <select [(ngModel)]="mode" (change)="updateSnippet()" class="ctrl-input">
                <option value="raw">Absolute Last Item (last())</option>
                <option value="even">Last Even Number (last(n => n % 2 === 0))</option>
                <option value="gt100">Last Number &gt; 100 (Unmatched Predicate)</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Use Fallback Default Value?</label>
              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="useDefaultValue" (change)="updateSnippet()" />
                <span>{{ useDefaultValue ? 'Fallback: -1 (Safe Default)' : 'No Fallback (Throws EmptyError)' }}</span>
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
              <li>Select <strong>Absolute Last Item</strong> and click <strong>▶ Run Stream</strong>:
                Notice it iterates through items <code>[10, 20, 30, 42, 55]</code> and emits ONLY <code>55</code> at the exact moment of stream completion.
              </li>
              <li>Select <strong>Last Even Number</strong>:
                Notice that even though <code>10, 20, 30, 42</code> are all even, <code>last()</code> waits for completion and emits strictly the <strong>last</strong> even item: <code>42</code>.
              </li>
              <li>Select <strong>Last Number &gt; 100</strong> without Fallback:
                Notice that because no item matched, <code>last()</code> throws an <code>EmptyError</code> upon stream completion.
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
                  Finite source Observable emitting sequential chunks.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>last(predicate?, defaultValue?)</code></td>
                <td class="token-desc">
                  Buffers the most recent candidate match. <strong>Does NOT emit until the source fires a <code>complete</code> event</strong>.
                  If the source never completes (e.g. infinite <code>interval</code>), <code>last()</code> will never emit!
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Terminal Aggregates & Completion Requirements</h4>
          <p>
            <code>last()</code> requires that the source stream is <strong>finite and completes</strong>.
            If the source Observable never completes (like an active WebSocket, router event stream, or continuous timer), <code>last()</code> will hold memory indefinitely and never emit anything downstream.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Infinite Streams Hanging</strong>
            <p>
              Never pipe <code>last()</code> directly onto an infinite stream (like <code>fromEvent()</code> or <code>Subject</code>) without a terminating operator like <code>takeUntil()</code>.
              Because <code>last()</code> must wait for the final item before emission, infinite streams cause silent subscriber hanging.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Chunked File Upload Final Hash Validation</h5>
              <p>
                When uploading 100 binary chunks sequentially, <code>last()</code> extracts the final chunk server acknowledgment containing the calculated MD5 checksum to verify overall upload integrity.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Multi-Step Migration Terminal State</h5>
              <p>
                In a data migration pipeline that emits progress snapshots (10%, 25%, 50%, 100%), <code>last()</code> isolates the final summary report for the user.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Terminal Form State Validation</h5>
              <p>
                Inspecting the final resolved validity status from a sequence of multi-step wizard step validations.
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
export class LastExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  mode: 'raw' | 'even' | 'gt100' = 'raw';
  useDefaultValue = false;
  streamInput = '10, 20, 30, 42, 55';

  private sub?: Subscription;
  private startTime = 0;

  codeSnippet = '';

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('last');
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
      this.codeSnippet = `// Waits for stream completion, then emits strictly the last item\nfrom([${this.streamInput}]).pipe(\n  last(${this.useDefaultValue ? 'undefined, -1' : ''})\n).subscribe({\n  next: val => console.log('Last item:', val),\n  complete: () => console.log('Complete')\n});`;
    } else if (this.mode === 'even') {
      this.codeSnippet = `// Waits for completion and emits the last item matching condition\nfrom([${this.streamInput}]).pipe(\n  last(n => n % 2 === 0${this.useDefaultValue ? ', -1' : ''})\n).subscribe({\n  next: val => console.log('Last Even:', val),\n  complete: () => console.log('Complete')\n});`;
    } else {
      this.codeSnippet = `// Throws EmptyError if stream completes without any match\nfrom([${this.streamInput}]).pipe(\n  last(n => n > 100${this.useDefaultValue ? ', -1' : ''})\n).subscribe({\n  next: val => console.log('Matched:', val),\n  error: err => console.error(err) // EmptyError\n});`;
    }
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const items = this.getItems();
    this.record('subscribe', `Subscribed to stream with ${items.length} items. Waiting for completion...`);

    let stream$: any;
    if (this.mode === 'raw') {
      stream$ = this.useDefaultValue
        ? from(items).pipe(last(undefined, -1))
        : from(items).pipe(last());
    } else if (this.mode === 'even') {
      stream$ = this.useDefaultValue
        ? from(items).pipe(last(n => n % 2 === 0, -1))
        : from(items).pipe(last(n => n % 2 === 0));
    } else {
      stream$ = this.useDefaultValue
        ? from(items).pipe(last(n => n > 100, -1))
        : from(items).pipe(last(n => n > 100));
    }

    this.sub = stream$.subscribe({
      next: (val: any) => {
        this.record('next', { emitted: val, note: 'Emitted by last() on upstream completion' });
      },
      complete: () => {
        this.record('complete', 'Stream completed cleanly after last item');
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
