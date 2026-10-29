import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { exhaustMap, concatMap, switchMap, mergeMap, catchError, finalize, tap } from 'rxjs/operators';
import { MockDataService, OrderRecord } from '../../../core/services/mock-data.service';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

export type FlatteningMode = 'exhaustMap' | 'concatMap' | 'switchMap' | 'mergeMap';

@Component({
  selector: 'app-order-workflow-scenario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario C: Order Submission Workflow</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO C • CONCURRENCY & INTEGRITY</span>
            <h1 class="scenario-title">Order Submission & Flattening Comparison</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>double-click prevention (exhaustMap)</strong>, <strong>transaction queueing (concatMap)</strong>, and explains why <strong>client-side cancellation (switchMap) does NOT roll back server transactions</strong>.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip" [class.active-chip]="selectedMode === 'exhaustMap'">exhaustMap()</span>
            <span class="op-chip" [class.active-chip]="selectedMode === 'concatMap'">concatMap()</span>
            <span class="op-chip" [class.active-chip]="selectedMode === 'switchMap'">switchMap()</span>
            <span class="op-chip" [class.active-chip]="selectedMode === 'mergeMap'">mergeMap()</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Interactive Order Terminal -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>💳 Live Checkout & Submission Terminal</h3>
            <div class="mode-selector">
              <label>Strategy: </label>
              <select [(ngModel)]="selectedMode" (ngModelChange)="onModeChange($event)" class="dropdown-mode">
                <option value="exhaustMap">exhaustMap (Safe Double-Click Drop)</option>
                <option value="concatMap">concatMap (Ordered Queue Pipeline)</option>
                <option value="switchMap">switchMap (DANGEROUS: Zombie Server Writes)</option>
                <option value="mergeMap">mergeMap (Uncontrolled Parallel Writes)</option>
              </select>
            </div>
          </div>

          <!-- Strategy Explanation Callout -->
          <div class="strategy-banner" [ngClass]="getBannerClass()">
            <div class="strategy-badge">{{ selectedMode }} Behavior</div>
            <p class="strategy-text">{{ getModeDescription() }}</p>
          </div>

          <div class="order-form">
            <div class="form-row">
              <div class="form-group">
                <label>Customer Name</label>
                <input type="text" [(ngModel)]="customer" class="ctrl-input" />
              </div>
              <div class="form-group">
                <label>Order Amount ($ USD)</label>
                <input type="number" [(ngModel)]="amount" class="ctrl-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Simulated Gateway Latency: {{ latencyMs }}ms</label>
                <input type="range" min="200" max="1500" step="100" [(ngModel)]="latencyMs" class="range-slider" />
              </div>
              <div class="toggle-group">
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="simulateFail" />
                  <span>Reject Payment (HTTP 402)</span>
                </label>
              </div>
            </div>

            <div class="actions-bar">
              <button 
                type="button" 
                class="btn-submit"
                [disabled]="selectedMode === 'exhaustMap' && inFlightCount > 0"
                (click)="triggerSubmit()"
              >
                @if (inFlightCount > 0) {
                  <span class="spinner">⏳ Processing Order (In-Flight: {{ inFlightCount }})...</span>
                } @else {
                  <span>🚀 Place Order ({{ amount | currency:'USD' }})</span>
                }
              </button>

              <button type="button" class="btn-spam" (click)="simulateSpamClicks()">
                ⚡ Rapid 3x Click Spam
              </button>
            </div>
          </div>

          <!-- Transaction Statistics -->
          <div class="stats-row">
            <div class="stat-card">
              <span class="stat-val">{{ submittedCount }}</span>
              <span class="stat-lbl">Clicks Attempted</span>
            </div>
            <div class="stat-card">
              <span class="stat-val dropped">{{ droppedCount }}</span>
              <span class="stat-lbl">Duplicate Clicks Dropped</span>
            </div>
            <div class="stat-card">
              <span class="stat-val in-flight">{{ inFlightCount }}</span>
              <span class="stat-lbl">Active In-Flight</span>
            </div>
            <div class="stat-card">
              <span class="stat-val success">{{ processedOrders.length }}</span>
              <span class="stat-lbl">Server Orders Committed</span>
            </div>
          </div>

          <!-- Processed Orders Ledger -->
          <div class="ledger-box">
            <div class="ledger-header">
              <span>🧾 Committed Server Orders Ledger</span>
              <button class="clear-btn" (click)="processedOrders = []">Clear Ledger</button>
            </div>
            @if (processedOrders.length > 0) {
              <div class="ledger-list">
                @for (item of processedOrders; track item.id) {
                  <div class="ledger-item">
                    <span class="order-id">{{ item.id }}</span>
                    <span class="order-customer">{{ item.customer }}</span>
                    <span class="order-amount">{{ item.amount | currency:'USD' }}</span>
                    <span class="badge-status">{{ item.status }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="ledger-empty">No orders submitted yet. Click above to test concurrency.</div>
            }
          </div>

          <div class="verification-guide">
            <strong>⚠️ Enterprise Concurrency Takeaways:</strong>
            <ol>
              <li><strong>Why exhaustMap is Standard for Checkouts:</strong> When a user double-clicks the checkout button, <code>exhaustMap</code> ignores all subsequent click events until the active payment call resolves.</li>
              <li><strong>The Dangers of switchMap on Writes:</strong> <code>switchMap</code> cancels the frontend HTTP subscription on new emissions. <em>However, HTTP server processing continues in the background!</em> The user may get charged twice while the UI only shows one order.</li>
              <li><strong>When to Use concatMap:</strong> Use <code>concatMap</code> when order transactions must all succeed in strictly serialized sequential FIFO order (e.g., balance updates).</li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="Order Submission Concurrency Strategies" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scenario-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; }
    .nav-breadcrumbs { font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.75rem; font-family: var(--font-mono); }
    .crumb-link { color: var(--text-muted); text-decoration: none; }
    .crumb-link:hover { color: #38bdf8; }
    .crumb-sep { margin: 0 0.5rem; }
    .crumb-current { color: #38bdf8; font-weight: 600; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .badge-scenario { background: rgba(99, 102, 241, 0.15); border: 1px solid var(--accent-indigo); color: var(--accent-indigo); font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-weight: 700; margin-bottom: 0.5rem; display: inline-block; }
    .scenario-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.4rem; color: var(--text-main); }
    .scenario-subtitle { font-size: 0.9rem; color: var(--text-muted); margin: 0; max-width: 750px; line-height: 1.5; }
    .operators-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; max-width: 320px; }
    .op-chip { font-family: var(--font-mono); font-size: 0.75rem; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--text-dim); padding: 3px 8px; border-radius: 4px; }
    .active-chip { border-color: var(--accent-indigo); color: var(--accent-cyan); font-weight: 700; background: rgba(99, 102, 241, 0.1); }
    .workspace-grid { display: grid; grid-template-columns: 1fr 1.05fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .workspace-grid { grid-template-columns: 1fr; } }
    .live-surface { display: flex; flex-direction: column; gap: 1.25rem; }
    .surface-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .surface-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
    .mode-selector { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
    .dropdown-mode { background: #0f172a; border: 1px solid var(--accent-indigo); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; }
    .strategy-banner { border-radius: 8px; padding: 0.85rem 1rem; border-left: 4px solid; display: flex; flex-direction: column; gap: 0.25rem; }
    .strategy-recommended { background: rgba(16, 185, 129, 0.08); border-color: var(--accent-emerald); }
    .strategy-caution { background: rgba(245, 158, 11, 0.08); border-color: var(--accent-amber); }
    .strategy-danger { background: rgba(244, 63, 94, 0.1); border-color: #f43f5e; }
    .strategy-badge { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-mono); }
    .strategy-recommended .strategy-badge { color: var(--accent-emerald); }
    .strategy-caution .strategy-badge { color: var(--accent-amber); }
    .strategy-danger .strategy-badge { color: #f43f5e; }
    .strategy-text { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
    .order-form { display: flex; flex-direction: column; gap: 0.85rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.25rem; }
    .form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .form-group { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    .ctrl-input { background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; }
    .range-slider { accent-color: var(--accent-indigo); }
    .toggle-group { display: flex; align-items: flex-end; padding-bottom: 6px; }
    .toggle-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #f43f5e; cursor: pointer; }
    .toggle-label input { accent-color: #f43f5e; }
    .actions-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }
    .btn-submit { flex: 2; min-width: 180px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-spam { flex: 1; min-width: 140px; background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); border: 1px solid var(--accent-amber); padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .stat-card { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; text-align: center; display: flex; flex-direction: column; gap: 0.2rem; }
    .stat-val { font-size: 1.4rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); }
    .stat-val.dropped { color: #f43f5e; }
    .stat-val.in-flight { color: var(--accent-amber); }
    .stat-val.success { color: var(--accent-emerald); }
    .stat-lbl { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; }
    .ledger-box { background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .ledger-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .clear-btn { background: none; border: none; color: var(--text-dim); font-size: 0.75rem; cursor: pointer; text-decoration: underline; }
    .ledger-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto; }
    .ledger-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 6px 10px; border-radius: 4px; font-size: 0.8rem; }
    .order-id { font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 600; }
    .order-customer { color: var(--text-main); }
    .order-amount { font-weight: 700; color: var(--accent-emerald); font-family: var(--font-mono); }
    .badge-status { font-size: 0.7rem; background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); padding: 2px 6px; border-radius: 4px; }
    .ledger-empty { font-size: 0.8rem; color: var(--text-dim); text-align: center; padding: 1rem; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class OrderWorkflowScenarioComponent implements OnInit, OnDestroy {
  private readonly mockData = inject(MockDataService);

  customer = 'Acme Corporation';
  amount = 2490;
  latencyMs = 600;
  simulateFail = false;
  selectedMode: FlatteningMode = 'exhaustMap';

  submittedCount = 0;
  droppedCount = 0;
  inFlightCount = 0;
  processedOrders: OrderRecord[] = [];
  events: StreamEvent[] = [];

  readonly submitSubject$ = new Subject<{ customer: string; amount: number; itemsCount: number }>();
  private sub?: Subscription;
  private startTime = Date.now();

  readonly codeSnippet = `// 1. Double-click safe (Recommended for writes/checkouts)
orderClicks$.pipe(
  exhaustMap(order => this.api.submitOrder(order)) // Ignores duplicate clicks while in-flight!
);

// 2. Strict FIFO Queue (Ensures operations happen sequentially)
orderClicks$.pipe(
  concatMap(order => this.api.submitOrder(order))  // Queues submissions in order
);

// 3. DANGEROUS on state changes (HTTP cancellation != Server Rollback)
orderClicks$.pipe(
  switchMap(order => this.api.submitOrder(order))  // Frontend unsubs, but backend already committed write!
);`;

  ngOnInit(): void {
    this.bindPipeline();
  }

  onModeChange(mode: FlatteningMode): void {
    this.selectedMode = mode;
    this.bindPipeline();
  }

  triggerSubmit(): void {
    this.submittedCount++;
    if (this.selectedMode === 'exhaustMap' && this.inFlightCount > 0) {
      this.droppedCount++;
      this.record('unsubscribe', `[exhaustMap DROPPED] Submission click ignored because active request is in-flight!`);
      return;
    }
    this.record('next', `User clicked Submit Order: ${this.customer} ($${this.amount})`);
    this.submitSubject$.next({ customer: this.customer, amount: this.amount, itemsCount: 1 });
  }

  simulateSpamClicks(): void {
    this.triggerSubmit();
    setTimeout(() => this.triggerSubmit(), 50);
    setTimeout(() => this.triggerSubmit(), 120);
  }

  bindPipeline(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.record('subscribe', `Configuring pipeline with strategy: [${this.selectedMode}]`);

    const stream$ = this.submitSubject$.pipe(
      tap(() => {
        this.inFlightCount++;
      })
    );

    let piped$;
    if (this.selectedMode === 'exhaustMap') {
      piped$ = stream$.pipe(
        exhaustMap(order => this.executeCall(order))
      );
    } else if (this.selectedMode === 'concatMap') {
      piped$ = stream$.pipe(
        concatMap(order => this.executeCall(order))
      );
    } else if (this.selectedMode === 'switchMap') {
      piped$ = stream$.pipe(
        switchMap(order => this.executeCall(order))
      );
    } else {
      piped$ = stream$.pipe(
        mergeMap(order => this.executeCall(order))
      );
    }

    this.sub = piped$.subscribe({
      next: (record: OrderRecord | null) => {
        if (record) {
          this.processedOrders.unshift(record);
          this.record('next', `Order Confirmed by Gateway: [${record.id}] for ${record.customer} ($${record.amount})`);
        }
      },
      error: (err) => {
        this.record('error', `Outer Pipeline Failed: ${err.message}`);
      }
    });
  }

  private executeCall(order: { customer: string; amount: number; itemsCount: number }) {
    this.record('subscribe', `[HTTP Request Sent] POST /api/orders/checkout ($${order.amount})`);
    return this.mockData.submitOrder(order, this.latencyMs, this.simulateFail).pipe(
      catchError(err => {
        this.record('error', `[HTTP Rejected] ${err.message}`);
        return of(null as unknown as OrderRecord);
      }),
      finalize(() => {
        this.inFlightCount = Math.max(0, this.inFlightCount - 1);
        this.record('complete', `[HTTP Completed] inFlightCount = ${this.inFlightCount}`);
      })
    );
  }

  getBannerClass(): string {
    switch (this.selectedMode) {
      case 'exhaustMap': return 'strategy-recommended';
      case 'concatMap': return 'strategy-caution';
      case 'switchMap': return 'strategy-danger';
      case 'mergeMap': return 'strategy-caution';
    }
  }

  getModeDescription(): string {
    switch (this.selectedMode) {
      case 'exhaustMap':
        return 'Standard for Payment & Checkout Buttons. Ignores all duplicate clicks while an active request is in-flight, preventing accidental double billing.';
      case 'concatMap':
        return 'FIFO Sequential Queue. Submissions are queued in strict chronological order and executed one after another without dropping.';
      case 'switchMap':
        return 'CRITICAL ANTI-PATTERN FOR MUTATIONS. Unsubscribes previous request in frontend, but backend server still processes the charge! Leads to phantom duplicate orders.';
      case 'mergeMap':
        return 'Concurrent Writes. Dispatches all order submissions in parallel with no rate limit or queueing. Can lead to race conditions.';
    }
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
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
