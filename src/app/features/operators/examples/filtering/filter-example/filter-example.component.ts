import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-filter-example',
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
              In real-world streams, noise and invalid payloads must be eliminated at the boundary.
              <code>filter(predicate)</code> evaluates each incoming item synchronously and only passes items where the predicate returns <code>true</code>.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Predicate Mode:</strong> Choose between mathematical threshold guards, parity checks (even numbers), or non-empty string validation.</li>
              <li><strong>Threshold Value:</strong> Dynamically adjusts numerical boundary (e.g. <code>item &gt; threshold</code>).</li>
              <li><strong>Candidate Stream Values:</strong> Comma-separated test stream to observe instant filtering.</li>
            </ul>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Predicate Mode:</label>
              <select [(ngModel)]="filterMode" class="ctrl-input">
                <option value="even">Allow Even Numbers Only</option>
                <option value="threshold">Allow Numbers Greater Than Threshold</option>
                <option value="nonempty">Allow Non-Empty Strings</option>
              </select>
            </div>
            @if (filterMode === 'threshold') {
              <div class="field-group">
                <label class="field-label">Threshold Value:</label>
                <input type="number" [(ngModel)]="threshold" class="ctrl-input" />
              </div>
            }
          </div>

          <div class="field-group">
            <label class="field-label">Candidate Stream Values (comma-separated):</label>
            <input type="text" [(ngModel)]="rawCandidates" class="ctrl-input" />
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Synchronous Filtering:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Inspect event telemetry: only the values meeting the condition appear as <code>NEXT</code> events.</li>
              <li>Values failing the condition are discarded cleanly without completing or terminating the stream.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">from(items).pipe(filter(x =&gt; x &gt; threshold))</span>
              <span class="token-desc">The predicate function is executed synchronously for every emission. If it returns false, downstream operators are never invoked.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">TypeScript Type Guards</span>
              <span class="token-desc"><code>filter</code> can act as a user-defined type guard: <code>filter((user): user is AuthenticatedUser =&gt; user !== null)</code> narrows types automatically downstream.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Zero Side Effects</span>
              <span class="token-desc">Predicates should always be pure functions without asynchronous delays or mutations to avoid unpredictable stream behavior.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Guarding Downstream Workflows & API Costs</h4>
          <p>
            In Angular architecture, <code>filter</code> is crucial for preventing unnecessary API invocations. For example:
            ignoring search queries shorter than 3 characters, ignoring unauthenticated state changes, or discarding null user profiles before downstream component rendering.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Silent Stream Trap:</strong>
            <p>
              If your filter predicate drops 100% of emissions, downstream subscribers will simply never receive a <code>next</code> event. When combining with operators like <code>first()</code>, this causes an <code>EmptyError</code> if the source completes without any matching item.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Min-Character Search Guard</h5>
              <p>
                <code>filter(term =&gt; term.trim().length &gt;= 3)</code> prevents spamming backend database search queries with 1 or 2 letter words.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Router Navigation Guards</h5>
              <p>
                Filtering Angular Router events with <code>filter(event =&gt; event instanceof NavigationEnd)</code> to track page analytics only when page transition completes.
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
export class FilterExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  filterMode: 'even' | 'threshold' | 'nonempty' = 'threshold';
  threshold = 20;
  rawCandidates = '5, 12, 28, 7, 45, 19, 88';
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Filtering stream values by predicate
source$.pipe(
  filter(val => val > 20)
).subscribe(passedValue => console.log(passedValue));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('filter');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const items = this.rawCandidates.split(',').map(s => s.trim());
    this.record('subscribe', `Subscribed with filter mode: ${this.filterMode}`);

    this.sub = of(...items).pipe(
      filter(item => {
        if (this.filterMode === 'even') {
          const n = Number(item);
          return !isNaN(n) && n % 2 === 0;
        } else if (this.filterMode === 'threshold') {
          const n = Number(item);
          return !isNaN(n) && n > this.threshold;
        } else {
          return item.length > 0;
        }
      }),
      tap(val => this.record('next', val))
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
