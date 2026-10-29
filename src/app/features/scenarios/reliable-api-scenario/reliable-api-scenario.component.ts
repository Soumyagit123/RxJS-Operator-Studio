import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, timer, throwError, of } from 'rxjs';
import { retry, timeout, catchError, tap, finalize } from 'rxjs/operators';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

export interface ResilientPayload {
  requestId: string;
  attemptNumber: number;
  data: string;
  resolvedAt: string;
}

@Component({
  selector: 'app-resilient-api-scenario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario D: Reliable API Client</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO D • NETWORK RESILIENCE</span>
            <h1 class="scenario-title">Reliable API Client with Bounded Retries</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>transient 503 outage simulation</strong>, <strong>bounded exponential backoff retries</strong>, strict <strong>SLA deadline timeouts</strong>, and <strong>lifecycle tracking (finalize)</strong>.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip">timeout({{ timeoutMs }}ms)</span>
            <span class="op-chip">retry({{ maxRetries }})</span>
            <span class="op-chip">catchError()</span>
            <span class="op-chip">tap()</span>
            <span class="op-chip">finalize()</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Interactive Controls -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>⚡ Fault Injection & SLA Client Dashboard</h3>
            <span class="client-status" [class.healthy]="!isCalling && !hasFailed" [class.failed]="hasFailed" [class.running]="isCalling">
              {{ isCalling ? '● Request In-Flight' : (hasFailed ? '● SLA Breached / Failed' : '● Client Idle / Healthy') }}
            </span>
          </div>

          <div class="config-panel">
            <div class="form-row">
              <div class="form-group">
                <label>Maximum Retry Attempts</label>
                <input type="number" [(ngModel)]="maxRetries" min="1" max="5" class="ctrl-input" />
              </div>
              <div class="form-group">
                <label>SLA Timeout Limit (ms)</label>
                <input type="number" [(ngModel)]="timeoutMs" min="500" max="5000" step="500" class="ctrl-input" />
              </div>
              <div class="form-group">
                <label>Simulated Server Delay (ms)</label>
                <input type="number" [(ngModel)]="simulatedDelayMs" min="100" max="4000" step="100" class="ctrl-input" />
              </div>
            </div>

            <div class="form-row fault-options">
              <label class="toggle-option">
                <input type="checkbox" [(ngModel)]="failInitialAttempts" />
                <span>Fail first 2 requests (503 Service Unavailable)</span>
              </label>
              <label class="toggle-option">
                <input type="checkbox" [(ngModel)]="failPermanently" />
                <span>Fail All Requests Permanently</span>
              </label>
            </div>

            <div class="action-buttons">
              <button 
                type="button" 
                class="btn-dispatch" 
                [disabled]="isCalling"
                (click)="dispatchRequest()"
              >
                @if (isCalling) {
                  <span>⏳ Executing Request (Attempt {{ currentAttempt }} of {{ maxRetries + 1 }})...</span>
                } @else {
                  <span>🚀 Send Resilient API Request</span>
                }
              </button>
            </div>
          </div>

          <!-- Real-Time Metrics -->
          <div class="metrics-grid">
            <div class="metric-box">
              <span class="metric-num">{{ totalDispatched }}</span>
              <span class="metric-tag">Total Dispatched</span>
            </div>
            <div class="metric-box">
              <span class="metric-num retry-num">{{ totalRetriesTriggered }}</span>
              <span class="metric-tag">Retries Triggered</span>
            </div>
            <div class="metric-box">
              <span class="metric-num success-num">{{ successfulDeliveries }}</span>
              <span class="metric-tag">Delivered Successfully</span>
            </div>
            <div class="metric-box">
              <span class="metric-num error-num">{{ terminalFailures }}</span>
              <span class="metric-tag">Terminal Failures</span>
            </div>
          </div>

          <!-- Received Response Card -->
          @if (latestResponse) {
            <div class="response-card success-card">
              <div class="resp-header">
                <strong>✅ Request Resolved Successfully</strong>
                <span>{{ latestResponse.resolvedAt }}</span>
              </div>
              <div class="resp-body">
                <div><strong>Request ID:</strong> <code>{{ latestResponse.requestId }}</code></div>
                <div><strong>Resolved on Attempt:</strong> {{ latestResponse.attemptNumber }}</div>
                <div><strong>Data:</strong> {{ latestResponse.data }}</div>
              </div>
            </div>
          } @else if (terminalError) {
            <div class="response-card error-card">
              <div class="resp-header">
                <strong>❌ Terminal Failure (Retries Exhausted / SLA Timeout)</strong>
              </div>
              <div class="resp-body">
                <div><strong>Error Details:</strong> {{ terminalError }}</div>
                <div class="resp-hint">Fallback degradation triggered. Application state preserved.</div>
              </div>
            </div>
          }

          <div class="verification-guide">
            <strong>🎯 Purpose of Interactive Controls:</strong>
            <p style="margin: 0.25rem 0 0.5rem; color: var(--text-muted); font-size: 0.8rem; line-height: 1.4;">
              In production cloud environments, network glitches, gateway timeouts (504), and temporary downstream microservice overload (503) are common.
              These controls let you inject chaos and verify automated recovery policies:
            </p>
            <ul style="margin: 0 0 0.5rem 0; padding-left: 1.25rem; font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem;">
              <li><strong>Maximum Retry Attempts:</strong> Bounds the retry loop so failing servers aren't attacked with infinite loops.</li>
              <li><strong>SLA Timeout Limit:</strong> Enforces an absolute deadline (e.g., 1500ms). If the server doesn't respond in time, <code>TimeoutError</code> is thrown immediately.</li>
              <li><strong>Fail First 2 Requests:</strong> Simulates transient 503 outage where attempts 1 and 2 fail, but attempt 3 recovers successfully via backoff.</li>
              <li><strong>Fail All Permanently:</strong> Demonstrates graceful degradation when all retry attempts are exhausted and <code>catchError</code> intercepts.</li>
            </ul>
          </div>

          <div class="verification-guide">
            <strong>🛡️ Enterprise Resilience Rules:</strong>
            <ol>
              <li><strong>Bounded Exponential Backoff:</strong> Unbounded retries create a "thundering herd" attack on failing servers. Always bound <code>retry()</code> count and add jittered delays.</li>
              <li><strong>Timeout with SLA Enforcement:</strong> Always pair long-running HTTP calls with <code>timeout(deadline)</code> so hanging connections don't pin user interfaces indefinitely.</li>
              <li><strong>Idempotency Consideration:</strong> Only retry operations that are strictly safe and idempotent (like <code>GET</code> or <code>PUT</code> with idempotency keys). <em>Never blindly retry non-idempotent POST payments!</em></li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="Resilient HTTP Client Pipeline" />

            <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <strong style="color: var(--text-main); font-size: 0.85rem;">Pipeline Line-by-Line Breakdown:</strong>
              <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                <span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 600;">1. timeout(1500)</span>
                <span style="color: var(--text-muted);">Enforces SLA deadline. If the server does not respond within 1.5 seconds, raises <code>TimeoutError</code> immediately.</span>
              </div>
              <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                <span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 600;">2. retry(&#123; count: 3, delay: (err, count) =&gt; timer(count * 500) &#125;)</span>
                <span style="color: var(--text-muted);">Bounded exponential backoff. Resubscribes upstream with linear/exponential backoff to allow downstream services to recover.</span>
              </div>
              <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                <span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 600;">3. catchError(err =&gt; of(cachedDegradedData))</span>
                <span style="color: var(--text-muted);">Fallback degradation boundary. Catches failures when all retry attempts are exhausted, preventing application crash.</span>
              </div>
              <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                <span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 600;">4. finalize(() =&gt; this.loading = false)</span>
                <span style="color: var(--text-muted);">Guaranteed teardown. Resets spinners, unlocks buttons, and clears memory whether the stream succeeds, errors, or is cancelled.</span>
              </div>
            </div>
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
    .client-status { font-size: 0.8rem; font-weight: 600; font-family: var(--font-mono); }
    .client-status.healthy { color: var(--accent-emerald); }
    .client-status.running { color: var(--accent-amber); }
    .client-status.failed { color: #f43f5e; }
    .config-panel { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .form-group { flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    .ctrl-input { background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; }
    .fault-options { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .toggle-option { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); cursor: pointer; }
    .toggle-option input { accent-color: #f43f5e; }
    .btn-dispatch { width: 100%; background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: #0f172a; border: none; padding: 12px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.95rem; }
    .btn-dispatch:disabled { opacity: 0.5; cursor: not-allowed; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
    .metric-box { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem; text-align: center; display: flex; flex-direction: column; gap: 0.2rem; }
    .metric-num { font-size: 1.4rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); }
    .retry-num { color: var(--accent-amber); }
    .success-num { color: var(--accent-emerald); }
    .error-num { color: #f43f5e; }
    .metric-tag { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; }
    .response-card { border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .success-card { background: rgba(16, 185, 129, 0.08); border: 1px solid var(--accent-emerald); }
    .error-card { background: rgba(244, 63, 94, 0.1); border: 1px solid #f43f5e; }
    .resp-header { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-main); }
    .resp-body { font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
    .resp-hint { font-size: 0.75rem; color: #f43f5e; margin-top: 0.25rem; font-style: italic; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class ResilientApiScenarioComponent implements OnInit, OnDestroy {
  maxRetries = 2;
  timeoutMs = 1500;
  simulatedDelayMs = 400;
  failInitialAttempts = false;
  failPermanently = false;

  isCalling = false;
  hasFailed = false;
  currentAttempt = 0;
  totalDispatched = 0;
  totalRetriesTriggered = 0;
  successfulDeliveries = 0;
  terminalFailures = 0;

  latestResponse: ResilientPayload | null = null;
  terminalError: string | null = null;
  events: StreamEvent[] = [];

  private sub?: Subscription;
  private startTime = Date.now();
  private transientFailCounter = 0;

  readonly codeSnippet = `// Enterprise Resilient HTTP Client Pipeline
this.http.get<Data>('/api/resource').pipe(
  timeout(1500),                          // 1. Enforce strict SLA deadline
  retry({                                 // 2. Bounded exponential backoff policy
    count: 3,
    delay: (error, retryCount) => {
      this.logger.warn(\`Transient failure, retry attempt #\${retryCount}\`);
      return timer(retryCount * 500);     // Linear or exponential backoff
    }
  }),
  catchError(err => {                     // 3. Graceful degradation fallback
    this.telemetry.recordFailure(err);
    return of(FALLBACK_CACHE);
  }),
  finalize(() => this.loading.set(false)) // 4. Guaranteed spinner teardown
);`;

  ngOnInit(): void {
    this.record('subscribe', 'Resilient API Client initialized with bounded retries and timeout SLA');
  }

  dispatchRequest(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.isCalling = true;
    this.hasFailed = false;
    this.latestResponse = null;
    this.terminalError = null;
    this.currentAttempt = 0;
    this.transientFailCounter = 0;
    this.totalDispatched++;

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    this.record('subscribe', `[Client Dispatch] ${reqId} SLA Timeout: ${this.timeoutMs}ms, Max Retries: ${this.maxRetries}`);

    this.sub = this.createMockApiCall(reqId).pipe(
      tap(() => {
        this.currentAttempt++;
        this.record('subscribe', `[HTTP Attempt #${this.currentAttempt}] Dispatched to network gateway`);
      }),
      timeout(this.timeoutMs),
      retry({
        count: this.maxRetries,
        delay: (err, retryIndex) => {
          this.totalRetriesTriggered++;
          const backoffDelay = retryIndex * 200;
          this.record('error', `[Transient Error] Attempt #${retryIndex} failed: "${err.message}". Retrying in ${backoffDelay}ms...`);
          return timer(backoffDelay);
        }
      }),
      catchError(err => {
        this.hasFailed = true;
        this.terminalFailures++;
        this.terminalError = err.name === 'TimeoutError'
          ? `SLA Deadline Exceeded: Request timed out after ${this.timeoutMs}ms`
          : `All ${this.maxRetries} Retries Exhausted: ${err.message}`;
        this.record('error', `[Terminal Boundary] ${this.terminalError}`);
        return of(null as unknown as ResilientPayload);
      }),
      finalize(() => {
        this.isCalling = false;
        this.record('complete', `[finalize] Request lifecycle terminated. isCalling = false`);
      })
    ).subscribe({
      next: (payload: ResilientPayload | null) => {
        if (payload) {
          this.latestResponse = payload;
          this.successfulDeliveries++;
          this.record('next', { id: payload.requestId, attempt: payload.attemptNumber, status: '200 OK' });
        }
      }
    });
  }

  private createMockApiCall(reqId: string): Observable<ResilientPayload> {
    return new Observable<ResilientPayload>(subscriber => {
      const isPermanentFail = this.failPermanently;
      const isTransientFail = this.failInitialAttempts && this.transientFailCounter < 2;

      const t = setTimeout(() => {
        if (isPermanentFail) {
          subscriber.error(new Error('Gateway 503 Service Unavailable'));
        } else if (isTransientFail) {
          this.transientFailCounter++;
          subscriber.error(new Error(`Upstream Database Connection Lost (503) [fail #${this.transientFailCounter}]`));
        } else {
          subscriber.next({
            requestId: reqId,
            attemptNumber: this.currentAttempt + 1,
            data: `Enterprise Payload for ${reqId}`,
            resolvedAt: new Date().toLocaleTimeString()
          });
          subscriber.complete();
        }
      }, this.simulatedDelayMs);

      return () => clearTimeout(t);
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
