import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iif, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-iif-example',
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
              <code>iif(() =&gt; condition, trueSource$, falseSource$)</code> decides <strong>at subscription time</strong> which Observable to subscribe to based on a predicate condition function.
            </p>
          </div>

          <div class="condition-toggle-box">
            <label class="toggle-label">
              <input type="checkbox" [(ngModel)]="isAuthenticated" />
              <span>User Authentication State: <strong>{{ isAuthenticated ? '🟢 Authenticated' : '🔴 Anonymous Guest' }}</strong></span>
            </label>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>With checkbox checked (Authenticated), click <strong>▶ Run Stream</strong>:
                Notice <code>iif</code> subscribes to the true branch and emits <code>User Profile Dashboard Data</code>.
              </li>
              <li>Uncheck the box (Anonymous Guest) and click <strong>▶ Run Stream</strong>:
                Notice <code>iif</code> dynamically shifts to the false branch and emits <code>Public Guest Landing Content</code>.
              </li>
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
                <td class="code-token"><code>() =&gt; this.authService.isLoggedIn()</code></td>
                <td class="token-desc">
                  Condition predicate evaluated lazily at the moment of subscription, ensuring that recent login/logout actions are accurately reflected.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>this.http.get('/api/user/private-profile')</code></td>
                <td class="token-desc">
                  True branch. Only subscribed to if predicate returns <code>true</code>.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>of(DEFAULT_GUEST_PROFILE)</code></td>
                <td class="token-desc">
                  False branch fallback. Only subscribed to if predicate returns <code>false</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Conditional Route & Feature Toggles</h4>
          <p>
            Instead of imperative <code>if/else</code> statements inside services that return different types, <code>iif()</code> provides a clean, declarative conditional stream switch.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Subscription-Time vs. Pipeline Creation Evaluation</strong>
            <p>
              Remember: <code>iif</code> evaluates the condition function <strong>only once per subscription</strong>.
              If the condition changes after a subscription is already open, <code>iif</code> will NOT automatically switch streams.
              If you need dynamic switching during an active stream, use a Subject / Signal with <code>switchMap</code> instead.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Authenticated vs. Anonymous Data Fetching</h5>
              <p>
                Routing to secure private endpoints or returning public guest stubs transparently in header components.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Feature Flag Dynamic Routing</h5>
              <p>
                Checking dynamic LaunchDarkly / Unleash flags to route requests to either legacy REST endpoints or new GraphQL microservices.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Offline Fallback Switch</h5>
              <p>
                Querying remote server when <code>navigator.onLine</code> is true, or seamlessly subscribing to offline IndexedDB storage when offline.
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
    .condition-toggle-box { background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .toggle-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; color: var(--text-main); cursor: pointer; }
    .toggle-label input { width: 18px; height: 18px; accent-color: var(--accent-indigo); }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class IifExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  isAuthenticated = true;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Dynamic Subscription Branching
iif(
  () => this.authService.isLoggedIn(),
  this.http.get<Profile>('/api/user/private-profile'),
  of(DEFAULT_GUEST_PROFILE)
).subscribe(profile => this.renderHeader(profile));`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('iif');
  }

  executeStream(): void {
    this.resetStream();
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', `Subscribing to iif(() => isAuthenticated === ${this.isAuthenticated})`);

    const trueBranch$ = of({ role: 'ADMIN', view: 'Dashboard Analytics', accessLevel: 'FULL' }).pipe(
      tap(() => this.record('subscribe', '[iif] Condition TRUE -> Subscribed to Private Authenticated Branch'))
    );

    const falseBranch$ = of({ role: 'GUEST', view: 'Public Landing Page', accessLevel: 'PUBLIC' }).pipe(
      tap(() => this.record('subscribe', '[iif] Condition FALSE -> Subscribed to Guest Fallback Branch'))
    );

    this.sub = iif(
      () => this.isAuthenticated,
      trueBranch$,
      falseBranch$
    ).subscribe({
      next: (val) => this.record('next', val),
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
