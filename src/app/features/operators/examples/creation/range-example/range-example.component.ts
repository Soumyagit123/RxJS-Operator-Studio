import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { range, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-range-example',
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
              <code>range(start, count)</code> emits a sequential range of integers synchronously starting from <code>start</code> for <code>count</code> iterations, then completes immediately.
            </p>
          </div>

          <div class="settings-grid">
            <div class="input-group">
              <label>Start Number:</label>
              <input type="number" [(ngModel)]="startNumber" class="custom-input" />
            </div>

            <div class="input-group">
              <label>Count of Numbers:</label>
              <input type="number" [(ngModel)]="countNumbers" min="1" max="20" class="custom-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Set <strong>Start: 10</strong> and <strong>Count: 5</strong>: Click <strong>▶ Run Stream</strong>.</li>
              <li>Observe that values <code>10, 11, 12, 13, 14</code> are emitted in exact order and the stream completes cleanly.</li>
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
                <td class="code-token"><code>range(1, totalPages)</code></td>
                <td class="token-desc">
                  Generates synchronous sequence of 1-based page numbers from 1 to <code>totalPages</code>.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>concatMap(page =&gt; ...)</code></td>
                <td class="token-desc">
                  Preserves strict sequential order. Fetches page 1, waits for completion, then fetches page 2, preventing out-of-order data assembly.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>subscribe(pageData =&gt; ...)</code></td>
                <td class="token-desc">
                  Appends incoming page data chunks to export buffers or report generators.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Deterministic Pagination & Batch Indexing</h4>
          <p>
            <code>range</code> is commonly used to generate page index buttons in pagination components, or to dispatch indexed concurrent API calls for batch migrations (e.g. <code>range(1, totalPages).pipe(concatMap(page =&gt; fetchPage(page)))</code>).
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Count vs. End Argument</strong>
            <p>
              The second parameter to <code>range(start, count)</code> is the <strong>total count</strong> of items, NOT the ending number!
              For example, <code>range(5, 3)</code> produces <code>5, 6, 7</code> (3 numbers), NOT <code>5, 4, 3</code>.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Sequential CSV / PDF Multi-Page Export</h5>
              <p>
                Querying 10 consecutive pages from a paginated REST endpoint using <code>range(1, 10).pipe(concatMap(fetchPage))</code> to compile a complete accounting statement.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Dynamic Pagination Bar Rendering</h5>
              <p>
                Calculating dynamic window sliders for pagination buttons: <code>range(currentPage - 2, 5)</code>.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Test Harness Seed Data Generation</h5>
              <p>
                Quickly provisioning mock datasets in unit tests: <code>range(1, 100).pipe(map(id =&gt; createMockUser(id)))</code>.
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
    .settings-grid { display: flex; gap: 1.5rem; flex-wrap: wrap; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .input-group { display: flex; align-items: center; gap: 0.5rem; }
    .input-group label { font-size: 0.85rem; color: var(--text-dim); }
    .custom-input { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; width: 90px; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class RangeExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  startNumber = 1;
  countNumbers = 5;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Sequential Page Fetching Pipeline
range(1, totalPages).pipe(
  concatMap(pageIndex => this.api.fetchPage(pageIndex))
).subscribe(pageData => this.processPage(pageData));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('range');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribing to range(${this.startNumber}, ${this.countNumbers})`);

    this.sub = range(this.startNumber, this.countNumbers).pipe(
      tap(n => this.record('next', n))
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
