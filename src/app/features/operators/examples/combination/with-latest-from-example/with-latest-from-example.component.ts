import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs';
import { withLatestFrom, tap } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-with-latest-from-example',
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
        (run)="triggerSubmit()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 1. Purpose of Interactive Controls:</strong>
            <p>
              When handling actions, developers often mistakenly use <code>combineLatest</code>, causing the action to run whenever background state changes.
              <code>primary$.pipe(withLatestFrom(secondary$))</code> ONLY emits when the <strong>primary source stream emits</strong>, pairing it with the most recent snapshot of secondary streams.
            </p>
            <ul class="control-purpose-list">
              <li><strong>Primary Stream (Driver):</strong> Clicking "Form Submit" drives the emission.</li>
              <li><strong>Secondary Stream (Context):</strong> Changing "Role" updates background context silently without firing submissions.</li>
              <li><strong>withLatestFrom vs combineLatest:</strong> <code>combineLatest</code> is N-to-N (fires on any change). <code>withLatestFrom</code> is 1-to-N (fires strictly on primary driver).</li>
            </ul>
          </div>

          <div class="pairing-grid">
            <div class="pair-card">
              <span class="stream-role primary-badge">PRIMARY STREAM (Driver)</span>
              <button class="trigger-btn" (click)="triggerSubmit()">
                🚀 Click Form Submit Event
              </button>
              <span class="hint-text">Emits a user submission action</span>
            </div>

            <div class="pair-card">
              <span class="stream-role secondary-badge">SECONDARY STREAM (Silent Context)</span>
              <label class="field-label">Current Authenticated User Role:</label>
              <select [(ngModel)]="currentRole" (change)="role$.next(currentRole)" class="ctrl-input">
                <option value="Viewer">Viewer (Read-only)</option>
                <option value="Editor">Editor (Write permitted)</option>
                <option value="Admin">Admin (Full privileges)</option>
              </select>
              <span class="hint-text">Changing this does NOT trigger emissions on its own!</span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check Driver-Triggered Pairing:</strong>
            <ol>
              <li>Change the Role dropdown from "Viewer" to "Admin": Notice that <strong>NO event emits</strong>.</li>
              <li>Now click <strong>🚀 Click Form Submit Event</strong>.</li>
              <li>A <span class="badge badge-combination">NEXT</span> event emits combining the submit action with the latest snapshot of the role (Admin).</li>
            </ol>
          </div>
        </div>

        <!-- Code Description & Line-by-Line Breakdown -->
        <div code-description>
          <div class="code-breakdown-table">
            <div class="breakdown-row">
              <span class="code-token">submitClick$.pipe(withLatestFrom(this.userRole$))</span>
              <span class="token-desc">The primary driver (<code>submitClick$</code>) controls timing. When it emits, RxJS samples the current synchronous value of <code>this.userRole$</code> and emits <code>[clickEvent, userRole]</code>.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Silent Secondary Updates</span>
              <span class="token-desc">Secondary streams never trigger emissions downstream, preventing accidental duplicate saves.</span>
            </div>
            <div class="breakdown-row">
              <span class="code-token">Secondary Cold Stream Warning</span>
              <span class="token-desc">Secondary streams *must* have emitted at least once before the primary stream emits. If the secondary is silent, the primary will not emit.</span>
            </div>
          </div>
        </div>

        <!-- Enterprise Deep Dive -->
        <div explanation>
          <h4>Enterprise Usage: Event-Driven Submissions with State Snapshots</h4>
          <p>
            Unlike <code>combineLatest</code> (which triggers every time any filter changes), <code>withLatestFrom</code> is used when an event (like a Save button click or window unload) needs current form state without the state changes triggering the save action themselves.
          </p>
          <div class="callout callout-warning">
            <strong>⚠️ The Missing Seed Trap:</strong>
            <p>
              If your secondary stream is a plain unseeded <code>Subject</code> that hasn't fired yet, clicking Submit will do NOTHING because <code>withLatestFrom</code> waits for each secondary stream to produce at least 1 value. Use <code>BehaviorSubject</code> or seed with <code>startWith()</code>.
            </p>
          </div>
        </div>

        <!-- Real World Enterprise Example -->
        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. NgRx / Signal Effect Action Pairing</h5>
              <p>
                When a user clicks "Checkout", sampling current <code>cartTotal$</code> and <code>couponCode$</code> from store state without triggering checkout on cart edits.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Telemetry Click Tracking with User Context</h5>
              <p>
                Sampling current user ID and active tenant metadata whenever button clicks occur across the portal.
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
    .pairing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 768px) { .pairing-grid { grid-template-columns: 1fr; } }
    .pair-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem; }
    .stream-role { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; }
    .primary-badge { color: var(--accent-cyan); }
    .secondary-badge { color: var(--accent-purple); }
    .trigger-btn { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .ctrl-input { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.5rem 0.75rem; color: var(--text-main); font-size: 0.85rem; outline: none; }
    .hint-text { font-size: 0.75rem; color: var(--text-dim); }
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
export class WithLatestFromExampleComponent implements OnInit, OnDestroy {
  readonly catalogService = inject(OperatorCatalogService);

  operator?: OperatorDefinition;
  currentRole = 'Editor';
  submitCount = 0;

  readonly submitEvent$ = new Subject<number>();
  readonly role$ = new BehaviorSubject<string>(this.currentRole);

  events: StreamEvent[] = [];
  isRunning = false;
  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Submit button taking current auth snapshot
saveButtonClick$.pipe(
  withLatestFrom(this.authService.currentUser$)
).subscribe(([clickEvent, user]) => {
  this.saveRecordWithAuthor(user.id);
});`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('with-latest-from');
    this.initStream();
  }

  private initStream(): void {
    this.startTime = Date.now();
    this.record('subscribe', 'Listening for Submit click events withLatestFrom(currentRole$)');

    this.sub = this.submitEvent$.pipe(
      withLatestFrom(this.role$),
      tap(([clickId, role]) => {
        this.record('next', {
          trigger: `Submit Action #${clickId}`,
          capturedSnapshotRole: role,
          authorized: role === 'Admin' || role === 'Editor'
        });
      })
    ).subscribe();
  }

  triggerSubmit(): void {
    this.submitCount++;
    this.submitEvent$.next(this.submitCount);
  }

  resetStream(): void {
    this.submitCount = 0;
    this.events = [];
    this.initStream();
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
