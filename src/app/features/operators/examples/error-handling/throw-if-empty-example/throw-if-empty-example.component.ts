import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, EMPTY, Subscription } from 'rxjs';
import { throwIfEmpty, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-throw-if-empty-example',
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
              <code>throwIfEmpty()</code> issues an error if the source stream completes without emitting any values.
              This converts silent <code>EMPTY</code> streams into explicit, actionable domain errors (such as <code>EntityNotFoundException</code>).
            </p>
          </div>

          <div class="mode-selector-grid">
            <label class="mode-card" [class.selected]="streamType === 'populated'">
              <input type="radio" [(ngModel)]="streamType" value="populated" name="stype" />
              <div class="mode-info">
                <strong>Populated Stream (Emits Record)</strong>
                <span>Source emits an entity before completing. <code>throwIfEmpty</code> passes it through cleanly.</span>
              </div>
            </label>

            <label class="mode-card" [class.selected]="streamType === 'empty'">
              <input type="radio" [(ngModel)]="streamType" value="empty" name="stype" />
              <div class="mode-info">
                <strong>Empty Stream (Silent Complete)</strong>
                <span>Source completes immediately with 0 emissions. <code>throwIfEmpty</code> intercepts and throws error.</span>
              </div>
            </label>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Select <strong>Populated Stream</strong> and click <strong>▶ Run Stream</strong>:
                Notice the entity is emitted, followed by a clean <code>COMPLETE</code> event.
              </li>
              <li>Select <strong>Empty Stream</strong> and click <strong>▶ Run Stream</strong>:
                Notice that because no value was emitted before completion, <code>throwIfEmpty</code> throws an <code>EmptyError / EntityNotFoundException</code>.
              </li>
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
                <td class="code-token"><code>this.http.get(...)</code></td>
                <td class="token-desc">
                  Initiates an HTTP GET request for a specific order resource by ID.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>filter(order =&gt; order !== null)</code></td>
                <td class="token-desc">
                  Filters out null bodies returned by APIs or caches that represent non-existent entities.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>throwIfEmpty(() =&gt; new Error(...))</code></td>
                <td class="token-desc">
                  Domain invariant barrier. If the upstream completes without a single valid item, produces a strongly-typed domain error instead of letting the consumer hang or silently complete.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>error: (err) =&gt; ...</code></td>
                <td class="token-desc">
                  Downstream observer receives the <code>EmptyError</code> and transitions the UI to a friendly 404 / "Not Found" state.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Enforcing API Contract Invariants & Avoiding Silent Failures</h4>
          <p>
            When querying resources by unique identifiers (e.g., <code>GET /api/users/:id</code>), an empty response should typically trigger a 404 or an explicit error handler rather than silently doing nothing.
            Without <code>throwIfEmpty</code>:
          </p>
          <ul>
            <li>Subscribers waiting on a stream via <code>take(1)</code> or <code>last()</code> will complete without invoking <code>next()</code>, causing downstream business logic to be silently bypassed.</li>
            <li>Forms and view states remain unpopulated, confusing end users because no error banner is displayed.</li>
          </ul>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Default Error Type</strong>
            <p>
              If called without arguments (<code>throwIfEmpty()</code>), it throws a generic <code>EmptyError</code> from RxJS. In enterprise architectures, always supply an error factory function: <code>throwIfEmpty(() =&gt; new NotFoundException('Order missing'))</code> so error interceptors can map to HTTP status codes.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Angular Route Resolvers</h5>
              <p>
                In <code>ResolveFn</code> guards, throw an error if an essential detail entity is missing from the API so the router navigation can redirect to an error or 404 page before rendering the component.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Cache Hydration Verification</h5>
              <p>
                When querying local offline caches (IndexedDB / SQLite), verify that the required schema or user profile is present; otherwise, fail over to a network fetch.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Single-Result Business Constraints</h5>
              <p>
                When searching an inventory collection for an exact SKU match with <code>find()</code> or <code>filter()</code>, ensure that no match translates into a visible "Out of Stock" error event.
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
    .mode-selector-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem; }
    .mode-card { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem; border-radius: 8px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); cursor: pointer; transition: all 0.2s ease; }
    .mode-card:hover { border-color: var(--accent-indigo); }
    .mode-card.selected { border-color: var(--accent-indigo); background: rgba(99, 102, 241, 0.08); }
    .mode-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .mode-info strong { font-size: 0.85rem; color: var(--text-main); }
    .mode-info span { font-size: 0.75rem; color: var(--text-dim); }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class ThrowIfEmptyExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  streamType: 'populated' | 'empty' = 'populated';
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Enforcing Resource Existence Guard
this.http.get<Order | null>('/api/orders/order_1002').pipe(
  filter(order => order !== null),
  throwIfEmpty(() => new Error('EntityNotFound: Order #1002 was not found in catalog.'))
).subscribe({
  next: (order) => this.displayOrder(order),
  error: (err) => this.showNotFoundMessage(err.message)
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('throw-if-empty');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribing to ${this.streamType} stream with throwIfEmpty()`);

    const source$ = this.streamType === 'populated'
      ? of({ id: 'ORD-9824', total: 249.99, status: 'CONFIRMED' })
      : EMPTY;

    this.sub = source$.pipe(
      tap(item => this.record('next', item)),
      throwIfEmpty(() => new Error('EntityNotFoundException: Stream completed with 0 values emitted.'))
    ).subscribe({
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err) => {
        this.record('error', err.message);
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
