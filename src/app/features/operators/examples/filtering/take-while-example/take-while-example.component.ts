import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-take-while-example',
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
              <code>takeWhile(predicate, inclusive?)</code> emits source values as long as each value satisfies the predicate.
              <strong>The moment the predicate returns false</strong>, it immediately completes the stream.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Inclusive Flag:</strong> If enabled (<code>inclusive: true</code>), also emits the first failing item before completing.</li>
              <li><strong>Cutoff Condition:</strong> Maximum value threshold (e.g. <code>val &lt; cutoff</code>).</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Predicate Cutoff (Emit while value &lt; N):</label>
              <input type="number" [(ngModel)]="cutoff" min="2" max="10" (change)="updateSnippet()" class="ctrl-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Inclusive Mode:</label>
              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="inclusive" (change)="updateSnippet()" />
                <span>{{ inclusive ? 'Inclusive (Emits failing cutoff item)' : 'Exclusive (Drops cutoff item)' }}</span>
              </label>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Cutoff: 4</strong> with Exclusive mode and click <strong>▶ Run Stream</strong>:
                Notice it emits <code>0, 1, 2, 3</code>, and completes right when <code>4</code> is reached.
              </li>
              <li>Toggle <strong>Inclusive Mode ON</strong> and run again:
                Notice it emits <code>0, 1, 2, 3, 4</code> (including the failing value 4) before completing.
              </li>
              <li>Contrast with <code>filter()</code>: <code>filter()</code> keeps the stream alive forever; <code>takeWhile()</code> <strong>terminates</strong> the entire stream.</li>
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
                <td class="code-token"><code>interval(250)</code></td>
                <td class="token-desc">
                  Infinite sequential counter emitting incremental values.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>takeWhile(n =&gt; n &lt; 4, inclusive)</code></td>
                <td class="token-desc">
                  Evaluates each item. As long as true, emits value. As soon as condition is false, completes the Observable and unbinds upstream.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Polling While Pending & Sequential Termination</h4>
          <p>
            <code>takeWhile</code> is standard in enterprise applications for polling tasks (e.g., waiting for asynchronous report generation, file conversions, or payment settlements):
            <code>pollJobStatus().pipe(takeWhile(job =&gt; job.status !== 'COMPLETE', true))</code>.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: takeWhile vs. filter</strong>
            <p>
              <code>filter(predicate)</code> continues listening to future values even if the current value fails the predicate.
              <code>takeWhile(predicate)</code> permanently completes on the very first failure! If your stream might emit an invalid value followed by a valid one, use <code>filter()</code> instead.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. File Export Progress Bar</h5>
              <p>
                Emitting percentage updates: <code>progress$.pipe(takeWhile(pct =&gt; pct &lt; 100, true))</code> to automatically terminate the progress subscription upon reaching 100%.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Cloud Provisioning Poller</h5>
              <p>
                Polling server status while state is <code>PROVISIONING</code>, cleanly completing when state transitions to <code>READY</code>.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Reading Paginated Stream Until HasNext is False</h5>
              <p>
                Reading pages sequentially with <code>takeWhile(page =&gt; page.hasMorePages, true)</code>.
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
export class TakeWhileExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  cutoff = 4;
  inclusive = false;

  private sub?: Subscription;
  private startTime = 0;

  codeSnippet = '';

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('take-while');
    this.updateSnippet();
  }

  updateSnippet(): void {
    this.codeSnippet = `// Emits while condition holds true, completes on first false\ninterval(250).pipe(\n  takeWhile(n => n < ${this.cutoff}${this.inclusive ? ', true' : ''})\n).subscribe({\n  next: val => console.log('Emitted:', val),\n  complete: () => console.log('Terminated')\n});`;
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribed: emitting while value < ${this.cutoff} (inclusive: ${this.inclusive})`);

    this.sub = interval(250).pipe(
      takeWhile(n => n < this.cutoff, this.inclusive),
      tap(n => this.record('next', { value: n, satisfiesCondition: n < this.cutoff }))
    ).subscribe({
      complete: () => {
        this.record('complete', `Predicate condition failed. Stream automatically terminated.`);
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
