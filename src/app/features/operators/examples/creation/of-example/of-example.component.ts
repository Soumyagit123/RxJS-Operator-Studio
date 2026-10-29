import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-of-example',
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
        <!-- Interactive Controls -->
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              In RxJS, <code>of(...)</code> creates a Cold Observable that emits each supplied argument synchronously in sequence and then calls <code>complete()</code> immediately.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Stream Arguments:</strong> Type comma-separated strings or values to observe how each individual item becomes a synchronous <code>NEXT</code> emission without delay.</li>
              <li><strong>Evaluating Stream Preview:</strong> Confirms how the input maps directly to arguments passed to <code>of(...)</code>.</li>
              <li><strong>▶ Run Stream:</strong> Subscribes to the stream and records telemetry timestamps.</li>
            </ul>
          </div>

          <div class="field-group">
            <label class="field-label">Stream Arguments (comma-separated):</label>
            <input 
              type="text" 
              [(ngModel)]="inputValues" 
              class="ctrl-input" 
              placeholder="e.g. Production, Staging, Development"
            />
          </div>

          <div class="param-summary">
            <span>Evaluating stream: <code>of({{ inputValues }})</code></span>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Synchronous Emission:</strong>
            <ol>
              <li>Click the blue <strong>▶ Run Stream</strong> button.</li>
              <li>Check the <strong>Telemetry Output Console</strong>: notice all items emit at exact millisecond <code>+0ms</code>, followed immediately by <code>COMPLETE</code>.</li>
              <li>No tick or event-loop deferral occurs; <code>of</code> is completely synchronous by default.</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">of(...values)</span>
              <span class="token-desc">Accepts variable arguments (not an array, unless you want the array itself emitted as a single item).</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">pipe(tap(log), ...)</span>
              <span class="token-desc">Passes synchronous emissions immediately downstream without introducing any macro/micro task delay.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Immediate Completion</span>
              <span class="token-desc">Calls <code>observer.complete()</code> synchronously after the last argument. Never leaves subscriptions open.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Explanation -->
        <div explanation>
          <h4>Why <code>of</code> is Essential in Enterprise Angular</h4>
          <p>
            <code>of</code> delivers synchronous, sequential emissions of provided arguments and <strong>immediately completes</strong>.
            Unlike <code>from</code>, <code>of</code> treats an array as a single emission unless spread.
          </p>
          <div class="callout callout-info">
            <strong>Key Enterprise Patterns:</strong>
            <ul>
              <li><strong>Fallback recovery in <code>catchError</code>:</strong> Returning <code>of([])</code> or <code>of(defaultConfig)</code> keeps consumers alive when remote network calls fail.</li>
              <li><strong>Mocking services in Jasmine/Karma specs:</strong> Easily return typed mock DTOs synchronously via <code>spyOn(service, 'getUser').and.returnValue(of(mockUser))</code>.</li>
              <li><strong>Synchronous guards and resolvers:</strong> Instantly satisfy Observable interfaces when local cached data is ready.</li>
            </ul>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Safe Fallback in catchError</h5>
              <p>
                When an API returns 500, return <code>of(fallbackUserConfig)</code> to provide a resilient offline configuration without throwing uncaught UI exceptions.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. In-Memory Cache Resolver</h5>
              <p>
                If a state store already holds user profile data, return <code>of(cachedProfile)</code> immediately without making a redundant HTTP request.
              </p>
            </div>
          </div>
        </div>
      </app-operator-example-layout>
    }
  `,
  styles: [`
    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .ctrl-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
    }
    .ctrl-input:focus {
      border-color: var(--border-focus);
    }
    .param-summary {
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-family: var(--font-mono);
    }
    .tutorial-instructions {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .tutorial-instructions strong {
      color: var(--text-main);
      display: block;
      margin-bottom: 2px;
    }
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
    .code-breakdown-table { display: flex; flex-direction: column; gap: 0.5rem; }
    .breakdown-row { display: flex; flex-direction: column; gap: 0.2rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; }
    .code-token { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600; }
    .token-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .production-use-cases { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    @media (max-width: 640px) { .production-use-cases { grid-template-columns: 1fr; } }
    .use-case-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.75rem; }
    .use-case-card h5 { margin: 0 0 0.35rem 0; font-size: 0.85rem; color: #38bdf8; font-weight: 600; }
    .use-case-card p { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .how-to-verify {
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border-subtle);
      border-radius: 6px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .how-to-verify strong {
      color: var(--accent-emerald);
    }
    .how-to-verify ol {
      padding-left: 1.25rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .callout {
      padding: 0.85rem;
      border-radius: 6px;
      background: rgba(6, 182, 212, 0.08);
      border-left: 3px solid var(--accent-cyan);
      font-size: 0.85rem;
    }
    .callout ul {
      margin-top: 0.5rem;
      padding-left: 1.25rem;
    }
    .callout li {
      margin-bottom: 0.25rem;
    }
  `]
})
export class OfExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);
  
  operator?: OperatorDefinition;
  inputValues = 'Config Loaded, 200 OK, FeatureFlags: Active';
  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;

  readonly codeSnippet = `// 1. Creation using of(...)
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

const config$ = of(
  'Config Loaded', 
  '200 OK', 
  'FeatureFlags: Active'
).pipe(
  tap(value => console.log('Emitted:', value))
);

// 2. Subscription execution
config$.subscribe({
  next: (val) => recordEvent('next', val),
  error: (err) => recordEvent('error', err),
  complete: () => recordEvent('complete')
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('of');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    const startTime = Date.now();

    const items = this.inputValues.split(',').map(s => s.trim()).filter(Boolean);

    this.events.push({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: 0,
      type: 'subscribe'
    });

    // Execute real RxJS of operator
    this.sub = of(...items).pipe(
      tap(item => {
        this.events.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now() - startTime,
          type: 'next',
          value: item
        });
      })
    ).subscribe({
      complete: () => {
        this.events.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now() - startTime,
          type: 'complete'
        });
        this.isRunning = false;
      },
      error: (err) => {
        this.events.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now() - startTime,
          type: 'error',
          value: err
        });
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

  ngOnDestroy(): void {
    this.resetStream();
  }
}
