import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-map-example',
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
              Backend APIs provide raw server DTOs that rarely match UI component templates directly.
              <code>map(project)</code> synchronously projects each source value to a transformed output value, maintaining a 1-to-1 ratio between source inputs and emitted outputs.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Transformation Projection:</strong> Select uppercase string normalization, DTO view-model synthesis, or numerical calculation.</li>
              <li><strong>Sample Input Values:</strong> Customize test input data to observe instant transformation downstream.</li>
              <li><strong>map vs switchMap/mergeMap:</strong> <code>map</code> projects synchronous values. If your projection returns an Observable or Promise, you get a higher-order Observable (<code>Observable&lt;Observable&lt;T&gt;&gt;</code>) instead of unwrapped data!</li>
            </ul>
          </div>

          <div class="field-group">
            <label class="field-label">Transformation Projection:</label>
            <select [(ngModel)]="selectedTransform" (change)="updateSnippet()" class="ctrl-input">
              <option value="uppercase">String to UPPERCASE</option>
              <option value="dto">DTO View Model Mapping</option>
              <option value="math">Number Math Calculation (x * 2.5 + 10)</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Sample Input Values (comma-separated):</label>
            <input type="text" [(ngModel)]="inputRaw" class="ctrl-input" />
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Synchronous Transformation:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>.</li>
              <li>Inspect Output Console: each input item is logged in its newly transformed shape with exact 1-to-1 correspondence.</li>
              <li>No asynchronous queuing or cancellation occurs; <code>map</code> executes synchronously as items pass through.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">http.get&lt;UserDTO&gt;().pipe(map(dto =&gt; toViewModel(dto)))</span>
              <span class="token-desc">Projects a backend data transfer object into a component-friendly view model, stripping sensitive fields and formatting timestamps.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Pure Projection Function</span>
              <span class="token-desc">The projector function should be pure without side-effects. For side effects (logging, triggering global spinners), use <code>tap</code> instead.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">TypeScript Type Transformation</span>
              <span class="token-desc">Transforms the stream signature from <code>Observable&lt;T&gt;</code> to <code>Observable&lt;R&gt;</code> with complete strict typing guarantees.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: View-Model Projection & Separation of Concerns</h4>
          <p>
            In production Angular services, <code>map</code> is routinely used to filter out sensitive backend fields, format date stamps, calculate aggregated cart totals, or map raw HTTP DTOs to UI models before components consume them.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Nested Observable Anti-Pattern:</strong>
            <p>
              Returning an Observable from <code>map</code> (e.g. <code>map(id =&gt; this.http.get(...))</code>) emits an un-subscribed Observable object into your stream! Always use flattening operators (<code>switchMap</code>, <code>concatMap</code>, <code>mergeMap</code>) when mapping to async work.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Currency & Date Normalization</h5>
              <p>
                Transforming UTC ISO strings and raw integer cent amounts from Stripe into localized currency strings ($19.99) and human-friendly relative timestamps.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Sensitive Field Stripping</h5>
              <p>
                Sanitizing API responses in the Angular data layer before passing state to template components (e.g., removing internal tenant hash IDs or database internal fields).
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
export class MapExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  selectedTransform: 'uppercase' | 'dto' | 'math' = 'uppercase';
  inputRaw = 'john doe, jane smith, admin user';
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  codeSnippet = `// String to uppercase view model projection
source$.pipe(
  map(user => user.trim().toUpperCase())
).subscribe();`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('map');
  }

  updateSnippet(): void {
    if (this.selectedTransform === 'uppercase') {
      this.inputRaw = 'john doe, jane smith, admin user';
      this.codeSnippet = `source$.pipe(\n  map(name => name.trim().toUpperCase())\n).subscribe();`;
    } else if (this.selectedTransform === 'dto') {
      this.inputRaw = 'Alpha, Beta, Gamma';
      this.codeSnippet = `source$.pipe(\n  map((title, id) => ({ id: id + 1, title, active: true, loadedAt: new Date().toISOString() }))\n).subscribe();`;
    } else {
      this.inputRaw = '10, 25, 42, 100';
      this.codeSnippet = `source$.pipe(\n  map(val => Number(val) * 2.5 + 10)\n).subscribe();`;
    }
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    const items = this.inputRaw.split(',').map(s => s.trim()).filter(Boolean);
    this.record('subscribe', `Subscribed with transformation: ${this.selectedTransform}`);

    this.sub = of(...items).pipe(
      map((item, idx) => {
        if (this.selectedTransform === 'uppercase') {
          return item.toUpperCase();
        } else if (this.selectedTransform === 'dto') {
          return { id: idx + 1, name: item, active: true, formatted: `Item #${idx + 1}: ${item}` };
        } else {
          const num = parseFloat(item) || 0;
          return { original: num, computed: num * 2.5 + 10 };
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
