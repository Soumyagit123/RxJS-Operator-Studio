import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-distinct-until-changed-example',
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
              Forms, route params, and websocket messages often emit duplicate state values consecutively.
              <code>distinctUntilChanged()</code> filters out consecutive duplicates while preserving distinct subsequent emissions.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Stream Values Sequence:</strong> Input repeated words (e.g., "active, active, pending, active") to observe deduplication live.</li>
              <li><strong>Equality Comparator:</strong> Uses strict equality (<code>===</code>) by default, or accepts a custom comparator <code>(prev, curr) =&gt; boolean</code> for object models.</li>
              <li><strong>▶ Run Stream:</strong> Executes stream and flags ignored duplicates with telemetry badges.</li>
            </ul>
          </div>

          <div class="field-group">
            <label class="field-label">Stream Values Sequence (comma-separated):</label>
            <input type="text" [(ngModel)]="inputSequence" class="ctrl-input" />
            <span class="hint-text">Try entering duplicates right next to each other (e.g. "active, active, pending, active")</span>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Consecutive Deduplication:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Inspect the output log: consecutive identical items are dropped, logging an <span class="badge badge-utility">IGNORED DUPLICATE</span> message.</li>
              <li>Notice that if a value appears again later after a different value (e.g. <code>active ➔ pending ➔ active</code>), it is correctly allowed through.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">distinctUntilChanged()</span>
              <span class="token-desc">Stores the previous emitted value in internal state. If <code>current === previous</code>, emission is suppressed.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">distinctUntilChanged((prev, curr) =&gt; prev.id === curr.id)</span>
              <span class="token-desc">Custom comparator for objects or DTOs. Prevents re-rendering table rows when object references change but IDs are identical.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">distinct() vs distinctUntilChanged()</span>
              <span class="token-desc"><code>distinct()</code> remembers *every* past value forever (can leak memory on infinite streams). <code>distinctUntilChanged()</code> only checks the *immediate previous* value, keeping memory O(1).</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Eliminating Duplicate API Calls & Navigation Events</h4>
          <p>
            When a user presses Back/Forward or clicks the search icon twice without changing the text, <code>distinctUntilChanged()</code> prevents redundant network traffic and unnecessary component re-renders.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Object Reference Equality Trap:</strong>
            <p>
              If your stream emits newly instantiated objects (e.g., <code>&#123; status: 'active' &#125;</code>), default <code>distinctUntilChanged()</code> will NOT catch them because <code>&#123;&#125; !== &#123;&#125;</code> by reference! Always supply a key selector or custom comparator for object streams.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. NgRx / Signal Store Selector Optimization</h5>
              <p>
                Preventing child Angular components from re-rendering when parent global state changes in unrelated slices.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Route Query Param Listener</h5>
              <p>
                <code>activatedRoute.queryParams.pipe(distinctUntilChanged((a, b) =&gt; a['tab'] === b['tab']))</code> triggers tab switching only when the active tab parameter truly changes.
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
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .hint-text { font-size: 0.75rem; color: var(--text-dim); }
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
export class DistinctUntilChangedExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  inputSequence = 'active, active, pending, pending, completed, active';
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Suppress consecutive duplicate queries or status changes
statusControl.valueChanges.pipe(
  distinctUntilChanged()
).subscribe(status => this.loadStatusData(status));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('distinct-until-changed');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const items = this.inputSequence.split(',').map(s => s.trim()).filter(Boolean);
    let previousVal: string | undefined;

    this.record('subscribe', `Subscribed to evaluate ${items.length} stream entries`);

    this.sub = of(...items).pipe(
      tap(val => {
        if (val === previousVal) {
          this.record('unsubscribe', `[Ignored consecutive duplicate: "${val}"]`);
        }
        previousVal = val;
      }),
      distinctUntilChanged(),
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
