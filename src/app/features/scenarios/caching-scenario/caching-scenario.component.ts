import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, timer, defer, of } from 'rxjs';
import { shareReplay, tap, finalize, switchMap } from 'rxjs/operators';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

export interface CachedCatalogItem {
  id: string;
  name: string;
  version: string;
  fetchedAt: string;
}

@Component({
  selector: 'app-caching-scenario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario F: Client-Side Multi-Subscriber Cache</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO F • PERFORMANCE & CACHING</span>
            <h1 class="scenario-title">Client-Side Multi-Subscriber Cache & TTL</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>shareReplay(bufferSize, refCount: true)</strong>, <strong>TTL cache invalidation policies</strong>, <strong>HTTP call deduplication across concurrent subscribers</strong>, and clarifies why <code>shareReplay</code> alone is not an entire cache solution.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip">shareReplay({{ '{' }} bufferSize: 1, refCount: true {{ '}' }})</span>
            <span class="op-chip">defer()</span>
            <span class="op-chip">tap()</span>
            <span class="op-chip">finalize()</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Live Cache Lab -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>🗄️ Multi-Subscriber Cache Inspection Station</h3>
            <div class="cache-controls">
              <button type="button" class="btn-invalidate" (click)="invalidateCache()">
                🗑️ Invalidate Cache Now
              </button>
            </div>
          </div>

          <div class="ttl-settings-bar">
            <div class="setting-item">
              <label>Configured TTL Window: <strong>{{ ttlSeconds }}s</strong></label>
              <input type="range" min="3" max="15" [(ngModel)]="ttlSeconds" class="slider-ttl" />
            </div>
            <div class="cache-status-pill" [class.cache-valid]="isCacheValid()" [class.cache-expired]="!isCacheValid()">
              {{ isCacheValid() ? '🟢 Cache Status: FRESH & VALID' : '🔴 Cache Status: EXPIRED / EMPTY' }}
            </div>
          </div>

          <!-- Subscriber Nodes Simulation -->
          <div class="subscribers-station">
            <div class="station-header">
              <span>Concurrent UI Consumers (Components demanding catalog data)</span>
            </div>
            <div class="consumers-row">
              <div class="consumer-node glass-panel">
                <div class="node-title">Widget A: Sidebar Menu</div>
                <div class="node-state">
                  @if (consumerAData) {
                    <span class="badge-fresh">Fetched {{ consumerAData.fetchedAt }}</span>
                  } @else {
                    <span class="badge-dormant">Unsubscribed</span>
                  }
                </div>
                <button type="button" class="btn-fetch" (click)="requestData('Consumer A')">
                  Request Data (A)
                </button>
              </div>

              <div class="consumer-node glass-panel">
                <div class="node-title">Widget B: User Dropdown</div>
                <div class="node-state">
                  @if (consumerBData) {
                    <span class="badge-fresh">Fetched {{ consumerBData.fetchedAt }}</span>
                  } @else {
                    <span class="badge-dormant">Unsubscribed</span>
                  }
                </div>
                <button type="button" class="btn-fetch" (click)="requestData('Consumer B')">
                  Request Data (B)
                </button>
              </div>

              <div class="consumer-node glass-panel">
                <div class="node-title">Widget C: Main Table</div>
                <div class="node-state">
                  @if (consumerCData) {
                    <span class="badge-fresh">Fetched {{ consumerCData.fetchedAt }}</span>
                  } @else {
                    <span class="badge-dormant">Unsubscribed</span>
                  }
                </div>
                <button type="button" class="btn-fetch" (click)="requestData('Consumer C')">
                  Request Data (C)
                </button>
              </div>
            </div>

            <div class="burst-fetch-row">
              <button type="button" class="btn-burst" (click)="requestAllSimultaneously()">
                ⚡ Trigger All 3 Consumers Simultaneously (Deduplication Proof)
              </button>
            </div>
          </div>

          <!-- Telemetry Counters -->
          <div class="counters-grid">
            <div class="counter-box">
              <span class="counter-num">{{ totalConsumerRequests }}</span>
              <span class="counter-label">Consumer Requests</span>
            </div>
            <div class="counter-box">
              <span class="counter-num server-num">{{ physicalNetworkCalls }}</span>
              <span class="counter-label">Physical HTTP Requests</span>
            </div>
            <div class="counter-box">
              <span class="counter-num cache-num">{{ cacheHits }}</span>
              <span class="counter-label">Replay Cache Hits</span>
            </div>
            <div class="counter-box">
              <span class="counter-num savings-num">{{ getSavingsPercent() }}%</span>
              <span class="counter-label">Bandwidth Savings</span>
            </div>
          </div>

          <div class="verification-guide">
            <strong>💡 Cache Invalidation & shareReplay Rules:</strong>
            <ol>
              <li><strong>Concurrent Request Deduplication:</strong> Click <em>"Trigger All 3 Simultaneously"</em>. Even though 3 components subscribe at the same time, <strong>only 1 physical HTTP request is sent</strong> over the wire!</li>
              <li><strong>Why refCount: true Matters:</strong> Without <code>refCount: true</code>, unsubscription does not disconnect the upstream source, causing memory leaks in long-running applications.</li>
              <li><strong>shareReplay is NOT a Cache Store:</strong> <code>shareReplay</code> has no built-in TTL invalidation or mutation eviction. In enterprise Angular, pair it with a timestamp check or a dedicated caching service!</li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="Enterprise Multi-Subscriber Cache Pipeline" />
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
    .surface-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .surface-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
    .btn-invalidate { background: rgba(244, 63, 94, 0.15); border: 1px solid #f43f5e; color: #f43f5e; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .ttl-settings-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 0.75rem; }
    .setting-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-muted); }
    .slider-ttl { accent-color: var(--accent-indigo); }
    .cache-status-pill { font-size: 0.75rem; font-weight: 700; font-family: var(--font-mono); padding: 4px 10px; border-radius: 4px; }
    .cache-valid { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border: 1px solid var(--accent-emerald); }
    .cache-expired { background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid #f43f5e; }
    .subscribers-station { display: flex; flex-direction: column; gap: 0.75rem; }
    .station-header { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .consumers-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .consumer-node { padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem; text-align: center; }
    .node-title { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .node-state { min-height: 22px; font-size: 0.75rem; }
    .badge-fresh { color: var(--accent-emerald); }
    .badge-dormant { color: var(--text-dim); }
    .btn-fetch { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .btn-burst { width: 100%; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
    .counters-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .counter-box { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; text-align: center; display: flex; flex-direction: column; gap: 0.2rem; }
    .counter-num { font-size: 1.4rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); }
    .server-num { color: #f43f5e; }
    .cache-num { color: var(--accent-emerald); }
    .savings-num { color: var(--accent-cyan); }
    .counter-label { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class CachingScenarioComponent implements OnInit, OnDestroy {
  ttlSeconds = 5;
  totalConsumerRequests = 0;
  physicalNetworkCalls = 0;
  cacheHits = 0;

  consumerAData: CachedCatalogItem | null = null;
  consumerBData: CachedCatalogItem | null = null;
  consumerCData: CachedCatalogItem | null = null;
  events: StreamEvent[] = [];

  private cachedObservable$?: Observable<CachedCatalogItem>;
  private cacheTimestamp = 0;
  private startTime = Date.now();

  readonly codeSnippet = `// Enterprise Invalidation + shareReplay Pipeline
private cache$?: Observable<Catalog>;
private lastFetch = 0;

getCatalog(): Observable<Catalog> {
  const isExpired = Date.now() - this.lastFetch > (this.ttlSeconds * 1000);

  if (!this.cache$ || isExpired) {
    this.lastFetch = Date.now();
    this.cache$ = defer(() => this.http.get<Catalog>('/api/catalog')).pipe(
      tap(() => this.physicalNetworkCalls++),
      shareReplay({ bufferSize: 1, refCount: true }) // Deduplicates concurrent subscribers
    );
  } else {
    this.cacheHits++; // Replayed from memory without network roundtrip
  }

  return this.cache$;
}`;

  ngOnInit(): void {
    this.record('subscribe', 'Caching station ready. TTL window set to ' + this.ttlSeconds + 's');
  }

  isCacheValid(): boolean {
    if (!this.cachedObservable$ || this.cacheTimestamp === 0) return false;
    return Date.now() - this.cacheTimestamp < this.ttlSeconds * 1000;
  }

  invalidateCache(): void {
    this.cachedObservable$ = undefined;
    this.cacheTimestamp = 0;
    this.record('unsubscribe', 'Cache explicitly invalidated. Subsequent requests will hit network.');
  }

  requestData(consumerName: string): void {
    this.totalConsumerRequests++;
    this.record('next', `[${consumerName}] requested catalog data`);

    this.getDataStream().subscribe(item => {
      if (consumerName === 'Consumer A') this.consumerAData = item;
      if (consumerName === 'Consumer B') this.consumerBData = item;
      if (consumerName === 'Consumer C') this.consumerCData = item;
      this.record('next', `[${consumerName}] received payload (${item.name} v${item.version})`);
    });
  }

  requestAllSimultaneously(): void {
    this.requestData('Consumer A');
    this.requestData('Consumer B');
    this.requestData('Consumer C');
  }

  getDataStream(): Observable<CachedCatalogItem> {
    const isExpired = !this.isCacheValid();

    if (!this.cachedObservable$ || isExpired) {
      this.cacheTimestamp = Date.now();
      this.record('subscribe', `Cache miss or expired! Initializing fresh physical HTTP request...`);

      this.cachedObservable$ = defer(() => {
        this.physicalNetworkCalls++;
        return timer(200).pipe(
          tap(() => {
            this.record('next', `>>> [PHYSICAL HTTP 200 OK] Fetched payload over the wire <<<`);
          }),
          switchMap(() => of({
            id: 'CAT-ENTERPRISE-1',
            name: 'Global Microservice Catalog',
            version: `${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9)}`,
            fetchedAt: new Date().toLocaleTimeString()
          }))
        );
      }).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
    } else {
      this.cacheHits++;
      this.record('subscribe', `Cache hit! Replaying existing response buffer from memory.`);
    }

    return this.cachedObservable$;
  }

  getSavingsPercent(): number {
    if (this.totalConsumerRequests === 0) return 0;
    return Math.round((this.cacheHits / this.totalConsumerRequests) * 100);
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
    this.cachedObservable$ = undefined;
  }
}
