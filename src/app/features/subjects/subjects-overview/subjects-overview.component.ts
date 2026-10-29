import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject, Subscription, Observable } from 'rxjs';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';

export type SubjectKind = 'Subject' | 'BehaviorSubject' | 'ReplaySubject' | 'AsyncSubject';

@Component({
  selector: 'app-subjects-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, OutputConsoleComponent, CodeViewerComponent],
  template: `
    <div class="subjects-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <span class="crumb-cat">PRIMITIVES</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">RxJS Subjects & Hot Observables Lab</span>
        </div>
        <div class="title-row">
          <div>
            <h1 class="page-title">Subjects & Multicast Primitives Lab</h1>
            <p class="page-subtitle">
              Unlike cold Observables which recreate an execution context per subscriber, <strong>Subjects</strong> are Multicast Event Emitters with stateful memory capabilities.
            </p>
          </div>
          <div class="kind-selector">
            @for (kind of subjectKinds; track kind) {
              <button 
                class="kind-tab" 
                [class.active]="selectedKind === kind"
                (click)="switchKind(kind)">
                {{ kind }}
              </button>
            }
          </div>
        </div>
      </div>

      <div class="main-grid">
        <!-- Interactive Controls -->
        <div class="lab-controls glass-panel">
          <div class="subject-info-banner">
            <span class="badge badge-creation">{{ selectedKind }}</span>
            <p>{{ getSubjectDescription() }}</p>
          </div>

          <div class="action-grid">
            <div class="emit-section">
              <label>Next Emission Value:</label>
              <div class="emit-row">
                <input type="text" [(ngModel)]="nextEmitValue" class="custom-input" placeholder="Value to emit..." />
                <button class="action-btn next-btn" (click)="emitNext()">
                  📢 .next("{{ nextEmitValue }}")
                </button>
              </div>
            </div>

            <div class="terminal-actions">
              <button class="action-btn complete-btn" (click)="emitComplete()">
                🏁 .complete()
              </button>
              <button class="action-btn error-btn" (click)="emitError()">
                ❌ .error(err)
              </button>
              <button class="action-btn reset-btn" (click)="resetAll()">
                🔄 Reset Lab
              </button>
            </div>
          </div>

          <div class="subscribers-management">
            <h4>Live Consumers / Subscribers:</h4>
            <div class="subscribers-bar">
              <button class="sub-toggle-btn" [class.connected]="isSubAConnected" (click)="toggleSubA()">
                {{ isSubAConnected ? '🛑 Unsubscribe A' : '➕ Connect Consumer A (Early)' }}
              </button>
              <button class="sub-toggle-btn" [class.connected]="isSubBConnected" (click)="toggleSubB()">
                {{ isSubBConnected ? '🛑 Unsubscribe B' : '➕ Connect Consumer B (Late Subscriber)' }}
              </button>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 What to Observe & Test:</strong>
            <ol>
              @if (selectedKind === 'Subject') {
                <li>Connect Consumer A, emit values (Consumer A receives them).</li>
                <li>Connect Consumer B late: Consumer B receives <strong>nothing retroactive</strong> (Subjects do not replay past values).</li>
              } @else if (selectedKind === 'BehaviorSubject') {
                <li>Notice Consumer A receives the initial default seed value <strong>immediately upon subscribing</strong>.</li>
                <li>Emit a new value, then connect Consumer B late: Consumer B instantly receives the <strong>current latest value</strong>!</li>
              } @else if (selectedKind === 'ReplaySubject') {
                <li>Emit 3 different values while only Consumer A is connected.</li>
                <li>Connect Consumer B: Consumer B instantly replays all <strong>buffered historical emissions</strong>!</li>
              } @else if (selectedKind === 'AsyncSubject') {
                <li>Emit several values: Notice <strong>nothing emits to anyone yet</strong>!</li>
                <li>Click <code>.complete()</code>: AsyncSubject emits <strong>only the final value</strong> right before completing.</li>
              }
            </ol>
          </div>
        </div>

        <!-- Output & Architecture Code -->
        <div class="output-column">
          <div class="glass-panel console-wrapper">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-wrapper">
            <app-code-viewer [code]="getCodeSnippet()" title="TypeScript Implementation" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subjects-page { display: flex; flex-direction: column; gap: 1.75rem; }
    .nav-breadcrumbs { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 0.75rem; font-family: var(--font-mono); }
    .crumb-sep { margin: 0 0.5rem; }
    .crumb-current { color: var(--accent-cyan); font-weight: 700; }
    .title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap; }
    .page-title { font-size: 2.1rem; font-weight: 800; margin: 0 0 0.4rem; color: var(--text-main); letter-spacing: -0.03em; }
    .page-subtitle { font-size: 0.95rem; color: var(--text-muted); margin: 0; max-width: 720px; line-height: 1.55; }
    .kind-selector { display: flex; gap: 0.4rem; background: var(--bg-recessed); padding: 5px; border-radius: 9999px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); }
    .kind-tab { background: transparent; border: 1px solid transparent; color: var(--text-muted); padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 0.84rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .kind-tab:hover { color: var(--text-main); }
    .kind-tab.active { background: var(--bg-card); color: var(--accent-indigo); border: 1px solid var(--border-focus); border-top: 1px solid var(--border-specular); box-shadow: var(--shadow-sm); }
    .main-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 1.75rem; }
    @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }
    .lab-controls { display: flex; flex-direction: column; gap: 1.35rem; padding: 1.75rem; border-radius: 20px; }
    .subject-info-banner { display: flex; flex-direction: column; gap: 0.6rem; background: var(--bg-recessed); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border-subtle); }
    .subject-info-banner p { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }
    .action-grid { display: flex; flex-direction: column; gap: 1.2rem; }
    .emit-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .emit-section label { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .emit-row { display: flex; gap: 0.6rem; }
    .custom-input { flex: 1; background: var(--bg-recessed); border: 1px solid var(--border-medium); color: var(--text-main); padding: 9px 14px; border-radius: 12px; font-size: 0.88rem; outline: none; }
    .action-btn { border: none; border-radius: 10px; padding: 9px 16px; font-weight: 700; font-size: 0.84rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .next-btn { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }
    .next-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.55); }
    .terminal-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .complete-btn { background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.4); color: var(--accent-emerald); }
    .complete-btn:hover { background: rgba(52, 211, 153, 0.25); transform: translateY(-2px); }
    .error-btn { background: rgba(251, 113, 133, 0.15); border: 1px solid rgba(251, 113, 133, 0.4); color: var(--accent-rose); }
    .error-btn:hover { background: rgba(251, 113, 133, 0.25); transform: translateY(-2px); }
    .reset-btn { background: var(--bg-recessed); border: 1px solid var(--border-subtle); color: var(--text-muted); margin-left: auto; }
    .reset-btn:hover { background: var(--bg-card-hover); color: var(--text-main); }
    .subscribers-management { display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg-recessed); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border-subtle); }
    .subscribers-management h4 { margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
    .subscribers-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .sub-toggle-btn { background: var(--bg-card); border: 1px solid var(--border-medium); color: var(--text-muted); padding: 9px 16px; border-radius: 10px; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: var(--shadow-sm); }
    .sub-toggle-btn:hover { transform: translateY(-2px); color: var(--text-main); }
    .sub-toggle-btn.connected { background: rgba(56, 189, 248, 0.15); border-color: var(--accent-cyan); color: var(--accent-cyan); box-shadow: 0 0 14px rgba(56, 189, 248, 0.25); }
    .how-to-verify { font-size: 0.85rem; background: var(--bg-recessed); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .how-to-verify strong { color: var(--accent-emerald); font-weight: 800; }
    .how-to-verify ol { padding-left: 1.35rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem; margin: 0; line-height: 1.45; }
    .output-column { display: flex; flex-direction: column; gap: 1.75rem; }
    .console-wrapper { padding: 0; border: none; background: transparent; }
    .code-wrapper { padding: 0; border: none; background: transparent; }
  `]
})
export class SubjectsOverviewComponent implements OnInit, OnDestroy {
  readonly subjectKinds: SubjectKind[] = ['Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject'];
  selectedKind: SubjectKind = 'Subject';

  nextEmitValue = 'Action Payload #1';
  events: StreamEvent[] = [];

  isSubAConnected = false;
  isSubBConnected = false;

  private currentSubject!: Subject<any>;
  private subA?: Subscription;
  private subB?: Subscription;
  private startTime = Date.now();
  private emitCounter = 1;

  ngOnInit(): void {
    this.initSubject();
  }

  switchKind(kind: SubjectKind): void {
    this.selectedKind = kind;
    this.resetAll();
  }

  private initSubject(): void {
    this.startTime = Date.now();
    switch (this.selectedKind) {
      case 'Subject':
        this.currentSubject = new Subject<string>();
        break;
      case 'BehaviorSubject':
        this.currentSubject = new BehaviorSubject<string>('Initial State (Default Seed)');
        break;
      case 'ReplaySubject':
        this.currentSubject = new ReplaySubject<string>(3);
        break;
      case 'AsyncSubject':
        this.currentSubject = new AsyncSubject<string>();
        break;
    }
    this.record('subscribe', `Initialized fresh [${this.selectedKind}]`);
  }

  emitNext(): void {
    const val = this.nextEmitValue;
    this.record('subscribe', `Dispatched: .next("${val}") on ${this.selectedKind}`);
    this.currentSubject.next(val);
    this.emitCounter++;
    this.nextEmitValue = `Action Payload #${this.emitCounter}`;
  }

  emitComplete(): void {
    this.record('complete', `Dispatched: .complete() on ${this.selectedKind}`);
    this.currentSubject.complete();
  }

  emitError(): void {
    this.record('error', `Dispatched: .error() on ${this.selectedKind}`);
    this.currentSubject.error(new Error(`Simulated Error in ${this.selectedKind}`));
  }

  toggleSubA(): void {
    if (this.isSubAConnected) {
      if (this.subA) this.subA.unsubscribe();
      this.subA = undefined;
      this.isSubAConnected = false;
      this.record('unsubscribe', 'Consumer A disconnected');
      return;
    }

    this.isSubAConnected = true;
    this.record('subscribe', 'Consumer A Subscribed (Listening to stream)');
    this.subA = this.currentSubject.subscribe({
      next: (val) => this.record('next', { consumer: 'Consumer A', value: val }),
      complete: () => this.record('complete', 'Consumer A received COMPLETE notification'),
      error: (err) => this.record('error', `Consumer A received ERROR: ${err?.message || err}`)
    });
  }

  toggleSubB(): void {
    if (this.isSubBConnected) {
      if (this.subB) this.subB.unsubscribe();
      this.subB = undefined;
      this.isSubBConnected = false;
      this.record('unsubscribe', 'Consumer B disconnected');
      return;
    }

    this.isSubBConnected = true;
    this.record('subscribe', 'Consumer B (Late Subscriber) Subscribed');
    this.subB = this.currentSubject.subscribe({
      next: (val) => this.record('next', { consumer: 'Consumer B (Late)', value: val }),
      complete: () => this.record('complete', 'Consumer B received COMPLETE notification'),
      error: (err) => this.record('error', `Consumer B received ERROR: ${err?.message || err}`)
    });
  }

  resetAll(): void {
    if (this.subA) this.subA.unsubscribe();
    if (this.subB) this.subB.unsubscribe();
    this.subA = undefined;
    this.subB = undefined;
    this.isSubAConnected = false;
    this.isSubBConnected = false;
    this.emitCounter = 1;
    this.nextEmitValue = 'Action Payload #1';
    this.events = [];
    this.initSubject();
  }

  getSubjectDescription(): string {
    switch (this.selectedKind) {
      case 'Subject':
        return 'Standard multicast observable with no initial value and no replay memory. Subscribers only receive events emitted strictly after they subscribe.';
      case 'BehaviorSubject':
        return 'Requires an initial seed value. Stores the single most recent emission in memory and synchronously delivers it to any new subscriber immediately upon connection.';
      case 'ReplaySubject':
        return 'Buffers a configurable number of historical emissions (e.g. bufferSize = 3) and replays them to every new subscriber regardless of when they join.';
      case 'AsyncSubject':
        return 'Emits ONLY the final value of the stream, and strictly upon completion. If completed without values or errored, it completes/errors.';
    }
  }

  getCodeSnippet(): string {
    switch (this.selectedKind) {
      case 'Subject':
        return `// Standard Event Bus
private readonly eventBus$ = new Subject<UserEvent>();

dispatch(event: UserEvent): void {
  this.eventBus$.next(event);
}

// Only receives events that occur AFTER subscription
readonly events$ = this.eventBus$.asObservable();`;

      case 'BehaviorSubject':
        return `// Enterprise State Store with Default Seed
private readonly authState$ = new BehaviorSubject<AuthState>({ authenticated: false, user: null });

// Late subscribers immediately get current state
readonly currentAuth$ = this.authState$.asObservable();

login(user: User): void {
  this.authState$.next({ authenticated: true, user });
}

get snapshot(): AuthState {
  return this.authState$.getValue();
}`;

      case 'ReplaySubject':
        return `// Historical Buffer of Last 3 Transactions
private readonly recentTransactions$ = new ReplaySubject<Transaction>(3);

recordTransaction(tx: Transaction): void {
  this.recentTransactions$.next(tx);
}

// Late joining UI widgets immediately receive the last 3 transactions!
readonly history$ = this.recentTransactions$.asObservable();`;

      case 'AsyncSubject':
        return `// Single Final Result Calculation upon Completion
private readonly computeTask$ = new AsyncSubject<CalculationSummary>();

executeTask(): void {
  this.computeTask$.next(partialResult1);
  this.computeTask$.next(partialResult2);
  this.computeTask$.next(finalSummary); // Only this will emit!
  this.computeTask$.complete();
}`;
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
    if (this.subA) this.subA.unsubscribe();
    if (this.subB) this.subB.unsubscribe();
  }
}
