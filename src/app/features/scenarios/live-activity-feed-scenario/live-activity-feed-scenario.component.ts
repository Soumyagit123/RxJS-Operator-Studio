import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, interval, merge } from 'rxjs';
import { scan, bufferTime, filter, map, share, takeUntil, tap } from 'rxjs/operators';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

export interface FeedEvent {
  id: string;
  type: 'Security' | 'Deployment' | 'User' | 'Telemetry';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

export interface FeedStatistics {
  totalReceived: number;
  criticalCount: number;
  batchesProcessed: number;
  eventsPerMinute: number;
}

@Component({
  selector: 'app-live-activity-feed-scenario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario E: Live Real-Time Activity Feed</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO E • EVENT STREAMING</span>
            <h1 class="scenario-title">Live Real-time Activity Feed & Windowing</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>multi-stream event merging (merge)</strong>, <strong>state aggregation (scan)</strong>, <strong>high-frequency burst micro-batching (bufferTime)</strong>, and <strong>declarative teardown unsubscription (takeUntil)</strong>.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip">merge()</span>
            <span class="op-chip">scan()</span>
            <span class="op-chip">bufferTime(1000ms)</span>
            <span class="op-chip">filter()</span>
            <span class="op-chip">share()</span>
            <span class="op-chip">takeUntil(destroy$)</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Live Activity Display -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>📡 Real-time SOC & Operations Telemetry Feed</h3>
            <div class="feed-controls">
              <button 
                type="button" 
                class="feed-toggle-btn"
                [class.active-feed]="isStreaming"
                (click)="toggleFeed()"
              >
                {{ isStreaming ? '⏸ Pause Stream' : '▶ Resume Stream' }}
              </button>
              <button type="button" class="burst-btn" (click)="injectBurst()">
                💥 Inject Burst (10 Events)
              </button>
            </div>
          </div>

          <!-- Aggregated Stats (via scan) -->
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-num">{{ stats.totalReceived }}</span>
              <span class="stat-lbl">Events Accumulated</span>
            </div>
            <div class="stat-card">
              <span class="stat-num critical">{{ stats.criticalCount }}</span>
              <span class="stat-lbl">Critical Alerts</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">{{ stats.batchesProcessed }}</span>
              <span class="stat-lbl">Batches Flushed</span>
            </div>
            <div class="stat-card">
              <span class="stat-num rate">{{ stats.eventsPerMinute }}</span>
              <span class="stat-lbl">Avg Events / Min</span>
            </div>
          </div>

          <!-- Filtering Toolbar -->
          <div class="filter-toolbar">
            <label>Filter Stream Severity:</label>
            <div class="filter-badges">
              <button 
                type="button" 
                class="badge-filter" 
                [class.active]="selectedSeverity === 'all'"
                (click)="setSeverityFilter('all')"
              >
                All Events
              </button>
              <button 
                type="button" 
                class="badge-filter info" 
                [class.active]="selectedSeverity === 'info'"
                (click)="setSeverityFilter('info')"
              >
                Info
              </button>
              <button 
                type="button" 
                class="badge-filter warning" 
                [class.active]="selectedSeverity === 'warning'"
                (click)="setSeverityFilter('warning')"
              >
                Warning
              </button>
              <button 
                type="button" 
                class="badge-filter critical" 
                [class.active]="selectedSeverity === 'critical'"
                (click)="setSeverityFilter('critical')"
              >
                Critical
              </button>
            </div>
          </div>

          <!-- Live Feed Ticker -->
          <div class="feed-container">
            <div class="feed-header">
              <span>Live Event Stream (Showing Latest 15)</span>
              <span class="feed-status">{{ isStreaming ? '🟢 Connected (SSE/WebSocket)' : '🔴 Disconnected' }}</span>
            </div>
            <div class="feed-list">
              @for (evt of filteredFeed; track evt.id) {
                <div class="feed-item" [ngClass]="evt.severity">
                  <div class="feed-item-top">
                    <span class="event-type">[{{ evt.type }}]</span>
                    <span class="event-time">{{ evt.timestamp }}</span>
                  </div>
                  <div class="event-msg">{{ evt.message }}</div>
                </div>
              }
            </div>
          </div>

          <div class="verification-guide">
            <strong>📊 Enterprise Stream Patterns Demonstrated:</strong>
            <ol>
              <li><strong>merge():</strong> Combines independent telemetry sources (WebSockets, mock heartbeats, manual bursts) into one unified observable.</li>
              <li><strong>bufferTime():</strong> Batches rapid event bursts into periodic array chunks (every 1s) to eliminate high-frequency Angular change detection lag.</li>
              <li><strong>scan():</strong> Accumulates total count, alert severities, and throughput statistics over time without needing an external state store.</li>
              <li><strong>takeUntil():</strong> Declaratively tears down all stream connections on page exit to prevent detached memory leaks.</li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="Live Event Feed Pipeline" />
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
    .feed-controls { display: flex; gap: 0.5rem; }
    .feed-toggle-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .feed-toggle-btn.active-feed { background: rgba(16, 185, 129, 0.15); border-color: var(--accent-emerald); color: var(--accent-emerald); }
    .burst-btn { background: rgba(245, 158, 11, 0.15); border: 1px solid var(--accent-amber); color: var(--accent-amber); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .stat-card { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; text-align: center; display: flex; flex-direction: column; gap: 0.2rem; }
    .stat-num { font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); }
    .stat-num.critical { color: #f43f5e; }
    .stat-num.rate { color: var(--accent-cyan); }
    .stat-lbl { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; }
    .filter-toolbar { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap; }
    .filter-badges { display: flex; gap: 0.4rem; }
    .badge-filter { background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-subtle); color: var(--text-muted); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .badge-filter.active { background: var(--accent-indigo); color: #fff; border-color: var(--accent-indigo); }
    .badge-filter.info.active { background: var(--accent-cyan); color: #0f172a; border-color: var(--accent-cyan); }
    .badge-filter.warning.active { background: var(--accent-amber); color: #0f172a; border-color: var(--accent-amber); }
    .badge-filter.critical.active { background: #f43f5e; color: #fff; border-color: #f43f5e; }
    .feed-container { background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .feed-header { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    .feed-status { font-family: var(--font-mono); font-size: 0.75rem; }
    .feed-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 240px; overflow-y: auto; }
    .feed-item { background: rgba(255, 255, 255, 0.02); border-left: 3px solid var(--border-subtle); padding: 6px 10px; border-radius: 4px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .feed-item.info { border-left-color: var(--accent-cyan); }
    .feed-item.warning { border-left-color: var(--accent-amber); }
    .feed-item.critical { border-left-color: #f43f5e; background: rgba(244, 63, 94, 0.05); }
    .feed-item-top { display: flex; justify-content: space-between; font-size: 0.7rem; }
    .event-type { font-weight: 700; font-family: var(--font-mono); color: var(--text-dim); }
    .event-time { color: var(--text-dim); }
    .event-msg { color: var(--text-main); line-height: 1.3; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class LiveActivityFeedScenarioComponent implements OnInit, OnDestroy {
  isStreaming = true;
  selectedSeverity: 'all' | 'info' | 'warning' | 'critical' = 'all';

  stats: FeedStatistics = {
    totalReceived: 0,
    criticalCount: 0,
    batchesProcessed: 0,
    eventsPerMinute: 60
  };

  allEvents: FeedEvent[] = [];
  events: StreamEvent[] = [];

  readonly manualBurst$ = new Subject<FeedEvent>();
  readonly destroy$ = new Subject<void>();
  bufferTimeWindowMs = 1000;
  private sub?: Subscription;
  private startTime = Date.now();

  readonly codeSnippet = `// Enterprise Real-Time Activity Feed Pipeline
merge(
  this.webSocketFeed$,                    // 1. High-frequency live socket source
  this.heartbeatTicker$,                  // 2. Periodic heartbeat generator
  this.manualBurst$                       // 3. User-injected manual bursts
).pipe(
  bufferTime(1000),                       // 4. Batch high-frequency microbursts every second
  filter(batch => batch.length > 0),      // 5. Ignore silent windows
  tap(batch => this.batchesCount++),
  scan((accum, batch) => [                // 6. Accumulate running ledger state
    ...batch,
    ...accum
  ].slice(0, 100), []),
  takeUntil(this.destroy$),               // 7. Declarative component teardown
  share()                                 // 8. Single shared subscription for multiple consumers
).subscribe(feed => this.feed.set(feed));`;

  ngOnInit(): void {
    this.startFeedPipeline();
  }

  toggleFeed(): void {
    this.isStreaming = !this.isStreaming;
    if (this.isStreaming) {
      this.startFeedPipeline();
      this.record('subscribe', 'Feed resumed (merge stream reconnected)');
    } else {
      if (this.sub) {
        this.sub.unsubscribe();
        this.sub = undefined;
      }
      this.record('unsubscribe', 'Feed paused (all stream listeners detached)');
    }
  }

  injectBurst(): void {
    const severities: ('info' | 'warning' | 'critical')[] = ['info', 'warning', 'critical', 'info'];
    const types: ('Security' | 'Deployment' | 'User' | 'Telemetry')[] = ['Security', 'Deployment', 'Telemetry', 'User'];

    for (let i = 0; i < 10; i++) {
      const sev = severities[i % severities.length];
      const typ = types[i % types.length];
      this.manualBurst$.next({
        id: `BURST-${Date.now()}-${i}`,
        type: typ,
        severity: sev,
        message: `High-frequency burst notification #${i + 1} (${typ})`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    this.record('next', 'Burst of 10 events injected into manualBurst$ subject');
  }

  setSeverityFilter(sev: 'all' | 'info' | 'warning' | 'critical'): void {
    this.selectedSeverity = sev;
  }

  get filteredFeed(): FeedEvent[] {
    if (this.selectedSeverity === 'all') {
      return this.allEvents.slice(0, 15);
    }
    return this.allEvents.filter(e => e.severity === this.selectedSeverity).slice(0, 15);
  }

  startFeedPipeline(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    const periodicFeed$ = interval(800).pipe(
      map(i => {
        const isCritical = i % 7 === 0;
        const isWarning = i % 3 === 0;
        const severity: 'info' | 'warning' | 'critical' = isCritical ? 'critical' : (isWarning ? 'warning' : 'info');
        const types: ('Security' | 'Deployment' | 'User' | 'Telemetry')[] = ['Security', 'Deployment', 'User', 'Telemetry'];
        return {
          id: `EVT-${Date.now()}-${i}`,
          type: types[i % types.length],
          severity,
          message: isCritical 
            ? 'CRITICAL: Multiple failed authentication attempts detected from 192.168.1.104'
            : (isWarning ? 'WARNING: Worker pool CPU usage elevated (> 85%)' : `Service container #${i + 1} report: healthy`),
          timestamp: new Date().toLocaleTimeString()
        } as FeedEvent;
      })
    );

    // Merge automated stream and manual burst subject
    const combined$ = merge(periodicFeed$, this.manualBurst$).pipe(
      share()
    );

    // Batch incoming events by time windows to protect DOM rendering performance
    this.sub = combined$.pipe(
      bufferTime(this.bufferTimeWindowMs),
      filter((batch: FeedEvent[]) => batch.length > 0),
      tap((batch: FeedEvent[]) => {
        this.stats.batchesProcessed++;
        this.record('next', `[bufferTime window flushed] Received batch of ${batch.length} event(s)`);
      }),
      scan((accum: FeedEvent[], batch: FeedEvent[]) => {
        // Accumulate stats
        this.stats.totalReceived += batch.length;
        this.stats.criticalCount += batch.filter(e => e.severity === 'critical').length;
        return [...batch, ...accum].slice(0, 50);
      }, []),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (accumulatedFeed: FeedEvent[]) => {
        this.allEvents = accumulatedFeed;
      }
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
    this.destroy$.next();
    this.destroy$.complete();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
