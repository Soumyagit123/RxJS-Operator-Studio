import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, BehaviorSubject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-combine-latest-example',
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
        (run)="triggerCoordinatedUpdate()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              In complex interfaces, state is split across disparate UI controls (inputs, dropdowns, pagination buttons).
              <code>combineLatest([a$, b$, c$])</code> waits until <em>every</em> input stream has emitted at least once, and then emits a unified tuple or object with the <strong>most recent values from each stream</strong> whenever ANY input stream emits.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Search Keyword Input (Stream A):</strong> Typing updates stream A.</li>
              <li><strong>Department Select (Stream B):</strong> Changing selection updates stream B.</li>
              <li><strong>Pagination Page (Stream C):</strong> Number change updates stream C.</li>
              <li><strong>Reactive Coordination:</strong> Editing ANY single control causes <code>combineLatest</code> to immediately re-evaluate and emit with the current snapshot of all 3.</li>
            </ul>
          </div>

          <div class="inputs-grid">
            <div class="input-card">
              <label class="field-label">Stream A: Search Keyword</label>
              <input type="text" [(ngModel)]="searchKeyword" (ngModelChange)="searchKeyword$.next($event)" class="ctrl-input" />
            </div>

            <div class="input-card">
              <label class="field-label">Stream B: Selected Department</label>
              <select [(ngModel)]="department" (ngModelChange)="department$.next($event)" class="ctrl-input">
                <option value="Engineering">Engineering</option>
                <option value="DevOps">DevOps</option>
                <option value="Security">Security</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div class="input-card">
              <label class="field-label">Stream C: Pagination Page</label>
              <input type="number" [(ngModel)]="pageNumber" min="1" max="100" (ngModelChange)="pageNumber$.next($event)" class="ctrl-input" />
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Reactive Coordination:</strong>
            <ol>
              <li>Notice the initial emission in the console combining all 3 default values.</li>
              <li>Change <em>either</em> the keyword, the department, or the page number.</li>
              <li>Observe that whenever ANY individual input changes, <code>combineLatest</code> immediately emits an updated unified object combining the latest value of all three.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">combineLatest([query$, dept$, page$])</span>
              <span class="token-desc">Listens to all 3 independent sources. Requires each source to emit at least 1 value before producing its first emission.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">N-to-1 Reactive Sync</span>
              <span class="token-desc">Whenever source A, B, or C fires a new value, the downstream operator receives an updated 3-tuple instantly without polling.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Glitch Avoidance</span>
              <span class="token-desc">If multiple streams update synchronously in the same microtask, consider pairing with <code>debounceTime(0)</code> to avoid duplicate intermediary emissions.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Multi-Filter Grid & Table Coordination</h4>
          <p>
            This is the standard architectural pattern for Angular data tables: search text, sorting criteria, pagination indexes, and active facet filters are each represented as reactive streams.
            Combining them with <code>combineLatest</code> ensures table queries always reflect the complete coordinated UI state.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The "Initial Emission Gate" Trap:</strong>
            <p>
              If even one stream in <code>combineLatest</code> has not emitted its first value (e.g. an unseeded Subject), the entire pipeline remains completely silent! Always initialize streams with <code>startWith(...)</code> or use <code>BehaviorSubject</code>.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Enterprise Data Grid Filtering</h5>
              <p>
                Synchronizing column filters, sort direction, page size, and search term before querying the backend database.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Multi-Store State Derivation (Signals / NgRx)</h5>
              <p>
                Deriving shopping cart checkout eligibility by combining <code>cartItems$</code>, <code>currentUser$</code>, and <code>deliveryZone$</code>.
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
    .inputs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    @media (max-width: 768px) { .inputs-grid { grid-template-columns: 1fr; } }
    .input-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.45rem 0.65rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
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
export class CombineLatestExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  searchKeyword = 'Architect';
  department = 'Engineering';
  pageNumber = 1;

  readonly searchKeyword$ = new BehaviorSubject<string>(this.searchKeyword);
  readonly department$ = new BehaviorSubject<string>(this.department);
  readonly pageNumber$ = new BehaviorSubject<number>(this.pageNumber);

  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Coordinated Filter Query Stream
combineLatest({
  keyword: this.searchControl.valueChanges.pipe(startWith('')),
  department: this.departmentControl.valueChanges.pipe(startWith('Engineering')),
  page: this.pageIndex$.pipe(startWith(1))
}).pipe(
  switchMap(filters => this.api.queryEmployees(filters))
).subscribe(results => this.renderTable(results));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('combine-latest');
    this.initStream();
  }

  private initStream(): void {
    this.startTime = Date.now();
    this.record('subscribe', 'Coordinated combineLatest stream active: listening for filter changes');

    this.sub = combineLatest({
      keyword: this.searchKeyword$,
      dept: this.department$,
      page: this.pageNumber$
    }).pipe(
      tap(state => {
        this.record('next', {
          queryFilter: `keyword="${state.keyword}" & dept="${state.dept}" & page=${state.page}`,
          latestState: state
        });
      })
    ).subscribe();
  }

  triggerCoordinatedUpdate(): void {
    this.pageNumber++;
    this.pageNumber$.next(this.pageNumber);
  }

  resetStream(): void {
    this.searchKeyword = 'Architect';
    this.department = 'Engineering';
    this.pageNumber = 1;
    this.events = [];
    this.searchKeyword$.next(this.searchKeyword);
    this.department$.next(this.department);
    this.pageNumber$.next(this.pageNumber);
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
