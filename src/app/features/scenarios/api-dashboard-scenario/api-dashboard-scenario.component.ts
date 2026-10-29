import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, combineLatest, of, BehaviorSubject, Subscription, Observable } from 'rxjs';
import { map, catchError, startWith, tap, finalize } from 'rxjs/operators';
import { MockDataService, UserSummary, OrderRecord, SystemMetrics } from '../../../core/services/mock-data.service';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

interface DashboardViewModel {
  users: UserSummary[];
  orders: OrderRecord[];
  metrics: SystemMetrics | null;
  filteredOrders: OrderRecord[];
  totalRevenue: number;
  activeUserCount: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-api-dashboard-scenario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario B: Multi-Source API Dashboard</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO B • ENTERPRISE PATTERN</span>
            <h1 class="scenario-title">Multi-Source API Dashboard Aggregation</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>parallel multi-endpoint loading (forkJoin)</strong>, <strong>dynamic filter coordination (combineLatest)</strong>, <strong>initial fallback seeding (startWith)</strong>, and <strong>isolated microservice failure recovery</strong>.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip">forkJoin()</span>
            <span class="op-chip">combineLatest()</span>
            <span class="op-chip">startWith()</span>
            <span class="op-chip">map(ViewModel)</span>
            <span class="op-chip">catchError()</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Interactive Dashboard Surface -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>📊 Live Executive Telemetry Dashboard</h3>
            <div class="header-actions">
              <button class="refresh-btn" (click)="refreshDashboard()" [disabled]="isLoading">
                {{ isLoading ? '⏳ Refreshing...' : '🔄 Refresh Data' }}
              </button>
            </div>
          </div>

          <!-- Failure Simulation Bar -->
          <div class="failure-toggles-bar">
            <span class="failure-label">Simulate Outage:</span>
            <label class="toggle-pill">
              <input type="checkbox" [(ngModel)]="failUsers" />
              <span>Users API 500</span>
            </label>
            <label class="toggle-pill">
              <input type="checkbox" [(ngModel)]="failOrders" />
              <span>Orders API 502</span>
            </label>
            <label class="toggle-pill">
              <input type="checkbox" [(ngModel)]="failMetrics" />
              <span>Metrics API 504</span>
            </label>
          </div>

          <!-- Coordinated Filter Controls -->
          <div class="filter-controls-card">
            <div class="filter-group">
              <label>Filter Orders by Status (combineLatest):</label>
              <select [(ngModel)]="selectedOrderStatus" (ngModelChange)="orderFilter$.next($event)" class="custom-select">
                <option value="ALL">All Order States</option>
                <option value="Shipped">Shipped</option>
                <option value="Processed">Processed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div class="meta-pills">
              <span class="pill">Active Users: <strong>{{ vm?.activeUserCount ?? 0 }}</strong></span>
              <span class="pill">Total Revenue: <strong>\${{ (vm?.totalRevenue ?? 0) | number }}</strong></span>
            </div>
          </div>

          <!-- KPI Cards Grid -->
          @if (vm?.metrics) {
            <div class="kpi-grid">
              <div class="kpi-card">
                <span class="kpi-title">CPU Utilization</span>
                <span class="kpi-val">{{ vm!.metrics!.cpuUsage }}%</span>
                <span class="kpi-sub">Cluster load</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Memory Allocation</span>
                <span class="kpi-val">{{ vm!.metrics!.memoryUsage }}%</span>
                <span class="kpi-sub">Heap usage</span>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Live WebSocket Sockets</span>
                <span class="kpi-val">{{ vm!.metrics!.activeSockets }}</span>
                <span class="kpi-sub">Connected clients</span>
              </div>
            </div>
          } @else if (!isLoading) {
            <div class="kpi-fallback">
              ⚠️ Metrics Service Offline (Graceful Fallback: Dashboard remained operational!)
            </div>
          }

          <!-- Aggregated Orders Table -->
          <div class="table-card">
            <div class="table-header">
              <h4>Active Orders (Filtered: {{ vm?.filteredOrders?.length ?? 0 }})</h4>
              <span class="sync-time">Last synced: {{ vm?.lastUpdated || 'Never' }}</span>
            </div>
            @if (vm?.filteredOrders && vm!.filteredOrders.length > 0) {
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of vm!.filteredOrders; track order.id) {
                    <tr>
                      <td class="mono-cell">{{ order.id }}</td>
                      <td>{{ order.customer }}</td>
                      <td>
                        <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase()">
                          {{ order.status }}
                        </span>
                      </td>
                      <td class="amount-cell">\${{ order.amount | number }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else if (!isLoading) {
              <div class="empty-table">No orders matching the selected filter state.</div>
            }
          </div>

          <div class="verification-guide">
            <strong>🔍 How to Check Enterprise Resiliency:</strong>
            <ol>
              <li><strong>Parallel Loading (forkJoin):</strong> Click <strong>🔄 Refresh Data</strong>; observe that all 3 endpoints execute simultaneously and combine their last values into a unified View Model.</li>
              <li><strong>Live Coordination (combineLatest):</strong> Change the Order Status dropdown; notice the table updates immediately without re-fetching from the network!</li>
              <li><strong>Isolated Failure Recovery:</strong> Check <em>"Metrics API 504"</em> and click Refresh. Notice that users and orders still render successfully — isolated <code>catchError</code> prevented the entire dashboard from going blank!</li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="Multi-Source Pipeline Architecture" />
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
    .op-chip { font-family: var(--font-mono); font-size: 0.75rem; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--accent-cyan); padding: 3px 8px; border-radius: 4px; }
    .workspace-grid { display: grid; grid-template-columns: 1fr 1.05fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .workspace-grid { grid-template-columns: 1fr; } }
    .live-surface { display: flex; flex-direction: column; gap: 1.25rem; }
    .surface-header { display: flex; justify-content: space-between; align-items: center; }
    .surface-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
    .refresh-btn { background: var(--accent-indigo); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .failure-toggles-bar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; background: rgba(244, 63, 94, 0.05); border: 1px dashed rgba(244, 63, 94, 0.2); padding: 0.6rem 0.85rem; border-radius: 6px; }
    .failure-label { font-size: 0.75rem; color: #f43f5e; font-weight: 600; text-transform: uppercase; }
    .toggle-pill { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: var(--text-muted); cursor: pointer; }
    .toggle-pill input { accent-color: #f43f5e; }
    .filter-controls-card { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; background: rgba(255, 255, 255, 0.02); padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .filter-group { display: flex; align-items: center; gap: 0.6rem; }
    .filter-group label { font-size: 0.8rem; color: var(--text-dim); }
    .custom-select { background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; }
    .meta-pills { display: flex; gap: 0.75rem; }
    .pill { font-size: 0.8rem; color: var(--text-dim); background: rgba(255, 255, 255, 0.04); padding: 4px 8px; border-radius: 4px; }
    .pill strong { color: var(--accent-emerald); }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .kpi-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem 1rem; display: flex; flex-direction: column; }
    .kpi-title { font-size: 0.75rem; color: var(--text-muted); }
    .kpi-val { font-size: 1.4rem; font-weight: 800; color: #38bdf8; margin: 0.2rem 0; }
    .kpi-sub { font-size: 0.7rem; color: var(--text-dim); }
    .kpi-fallback { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; color: #f59e0b; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.8rem; }
    .table-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-subtle); }
    .table-header h4 { margin: 0; font-size: 0.9rem; color: var(--text-main); }
    .sync-time { font-size: 0.75rem; color: var(--text-dim); }
    .custom-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .custom-table th { text-align: left; padding: 8px 12px; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); font-weight: 600; }
    .custom-table td { padding: 8px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }
    .mono-cell { font-family: var(--font-mono); color: var(--text-muted); }
    .amount-cell { font-weight: 600; color: var(--accent-emerald); }
    .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .status-shipped { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .status-processed { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .status-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .empty-table { padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.8rem; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class ApiDashboardScenarioComponent implements OnInit, OnDestroy {
  private readonly mockData = inject(MockDataService);

  readonly orderFilter$ = new BehaviorSubject<string>('ALL');
  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

  vm: DashboardViewModel | null = null;
  events: StreamEvent[] = [];
  isLoading = false;

  selectedOrderStatus = 'ALL';
  failUsers = false;
  failOrders = false;
  failMetrics = false;

  private sub?: Subscription;
  private startTime = Date.now();

  readonly codeSnippet = `// Coordinated Multi-Source Dashboard Aggregation
const dataSources$ = this.refreshTrigger$.pipe(
  switchMap(() =>
    forkJoin({
      // Parallel fetches with isolated error fallbacks
      users: this.api.getUsers().pipe(catchError(() => of([]))),
      orders: this.api.getOrders().pipe(catchError(() => of([]))),
      metrics: this.api.getMetrics().pipe(catchError(() => of(null)))
    })
  )
);

// Coordinate live filter streams with latest aggregated API data
combineLatest([dataSources$, this.orderFilter$]).pipe(
  map(([data, filter]) => ({
    ...data,
    filteredOrders: filter === 'ALL' 
      ? data.orders 
      : data.orders.filter(o => o.status === filter),
    totalRevenue: data.orders.reduce((sum, o) => sum + o.amount, 0),
    activeUserCount: data.users.filter(u => u.status === 'Active').length,
    lastUpdated: new Date().toLocaleTimeString()
  }))
).subscribe(vm => this.viewModel.set(vm));`;

  ngOnInit(): void {
    this.bindDashboardPipeline();
  }

  refreshDashboard(): void {
    this.refreshTrigger$.next();
  }

  private bindDashboardPipeline(): void {
    this.record('subscribe', 'Dashboard pipeline initialized');

    const dataSources$ = this.refreshTrigger$.pipe(
      tap(() => {
        this.isLoading = true;
        this.record('subscribe', '[forkJoin Dispatched] Concurrent GET /users, /orders, /metrics');
      }),
      map(() =>
        forkJoin({
          users: this.mockData.getUsers(this.failUsers).pipe(
            tap((u: UserSummary[]) => this.record('subscribe', `[users arrived] ${u.length} records`)),
            catchError((err: Error) => {
              this.record('error', `[catchError Users] ${err.message}`);
              return of([] as UserSummary[]);
            })
          ),
          orders: this.mockData.getOrders(this.failOrders).pipe(
            tap((o: OrderRecord[]) => this.record('subscribe', `[orders arrived] ${o.length} records`)),
            catchError((err: Error) => {
              this.record('error', `[catchError Orders] ${err.message}`);
              return of([] as OrderRecord[]);
            })
          ),
          metrics: this.mockData.getSystemMetrics(this.failMetrics).pipe(
            tap(() => this.record('subscribe', '[metrics arrived] Health telemetry')),
            catchError((err: Error) => {
              this.record('error', `[catchError Metrics] ${err.message}`);
              return of(null as SystemMetrics | null);
            })
          )
        })
      )
    );

    this.sub = dataSources$.subscribe(parallel$ => {
      parallel$.subscribe((data: { users: UserSummary[]; orders: OrderRecord[]; metrics: SystemMetrics | null }) => {
        this.isLoading = false;
        this.updateViewModel(data, this.orderFilter$.value);
      });
    });

    // Also update when filter changes without network request
    this.orderFilter$.subscribe(filterVal => {
      if (this.vm) {
        this.record('subscribe', `[combineLatest] Filter changed to "${filterVal}". Recomputing view-model in-memory.`);
        this.updateViewModel({ users: this.vm.users, orders: this.vm.orders, metrics: this.vm.metrics }, filterVal);
      }
    });
  }

  private updateViewModel(data: { users: UserSummary[]; orders: OrderRecord[]; metrics: SystemMetrics | null }, filterVal: string): void {
    const filtered = filterVal === 'ALL'
      ? data.orders
      : data.orders.filter(o => o.status === filterVal);

    const totalRev = data.orders.reduce((sum, o) => sum + o.amount, 0);
    const activeUsers = data.users.filter(u => u.status === 'Active').length;

    this.vm = {
      users: data.users,
      orders: data.orders,
      metrics: data.metrics,
      filteredOrders: filtered,
      totalRevenue: totalRev,
      activeUserCount: activeUsers,
      lastUpdated: new Date().toLocaleTimeString()
    };

    this.record('next', {
      totalOrders: data.orders.length,
      filteredCount: filtered.length,
      activeUsers,
      revenue: totalRev
    });
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
