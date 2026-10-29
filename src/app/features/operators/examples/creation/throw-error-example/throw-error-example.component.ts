import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { throwError, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-throw-error-example',
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
              <code>throwError(() =&gt; new Error(...))</code> creates an Observable that emits <strong>zero items</strong> and immediately terminates with an error notification.
              Always pass an error factory function in modern RxJS to preserve fresh stack traces per subscription.
            </p>
          </div>

          <div class="input-row">
            <label>Error Message to Propagate:</label>
            <input type="text" [(ngModel)]="customErrorMessage" class="custom-input" />
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong>:
                Notice the stream subscribes and terminates synchronously with an <code>ERROR</code> notification containing your custom message.
              </li>
              <li>Notice that no <code>next</code> or <code>complete</code> events are emitted, only the error notification.</li>
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
                <td class="code-token"><code>throwError(() =&gt; new HttpErrorResponse(...))</code></td>
                <td class="token-desc">
                  RxJS 7+ factory syntax. Instantiates the error object strictly at subscription time so the JavaScript call stack trace accurately points to the point of failure.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>status: 401, statusText: 'Unauthorized'</code></td>
                <td class="token-desc">
                  Simulates standard HTTP RFC semantics allowing downstream global error interceptors to handle redirection or logout flows.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Propagating Domain Exceptions in Interceptors</h4>
          <p>
            When an Angular HTTP Interceptor encounters an unauthorized 401 response, validation barrier, or corrupted payload, <code>throwError(() =&gt; new DomainException())</code> re-throws a typed error downstream to halt the chain.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Deprecated throwError(new Error()) Syntax</strong>
            <p>
              Passing a static instance: <code>throwError(new Error())</code> was deprecated in RxJS 7 and is removed in RxJS 8. If an Observable is retried via <code>retry()</code>, the static instance shares a single mutated stack trace across all attempts! Always pass a factory function: <code>throwError(() =&gt; new Error())</code>.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Angular HTTP Interceptor Error Re-Throw</h5>
              <p>
                Logging the failed request to an observability platform in <code>catchError()</code>, and then using <code>throwError(() =&gt; error)</code> to re-propagate the error to the calling component.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Pre-Flight Validation Barriers</h5>
              <p>
                Validating form payloads before hitting the wire: <code>if (!token) return throwError(() =&gt; new MissingTokenError())</code>.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Mock API Gateway Error Simulations</h5>
              <p>
                Injecting deterministic 500 internal server errors into unit test suites to assert UI error boundaries.
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
    .input-row { display: flex; flex-direction: column; gap: 0.35rem; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .input-row label { font-size: 0.85rem; color: var(--text-dim); }
    .custom-input { background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class ThrowErrorExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  customErrorMessage = 'PaymentDeclinedException: Insufficient balance on account';

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Factory Syntax for Fresh Stack Trace per Subscription
return throwError(() => new HttpErrorResponse({
  error: 'Session Timed Out',
  status: 401,
  statusText: 'Unauthorized'
}));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('throw-error');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribing to throwError(() => new Error("${this.customErrorMessage}"))`);

    this.sub = throwError(() => new Error(this.customErrorMessage)).subscribe({
      next: (val) => this.record('next', val),
      complete: () => {
        this.record('complete');
        this.isRunning = false;
      },
      error: (err: Error) => {
        this.record('error', err?.message || err);
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
