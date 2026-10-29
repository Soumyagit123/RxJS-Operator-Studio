import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, of, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, first, tap } from 'rxjs/operators';
import { MockDataService } from '../../../core/services/mock-data.service';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-reactive-form-scenario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario G: Reactive Form Async Validation</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO G • REACTIVE FORMS</span>
            <h1 class="scenario-title">Reactive Form Async Server Validation</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>asynchronous server uniqueness checks</strong>, <strong>keystroke debouncing</strong>, <strong>race-condition prevention (switchMap)</strong>, and <strong>pending validation UI feedback</strong>.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip">valueChanges</span>
            <span class="op-chip">debounceTime(400ms)</span>
            <span class="op-chip">distinctUntilChanged()</span>
            <span class="op-chip">switchMap()</span>
            <span class="op-chip">first()</span>
            <span class="op-chip">catchError()</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Live Reactive Form Surface -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>👤 User Account Onboarding Form</h3>
            <span class="form-status" [ngClass]="signupForm.status.toLowerCase()">
              Status: {{ signupForm.status }}
            </span>
          </div>

          <form [formGroup]="signupForm" class="registration-form" (ngSubmit)="onSubmit()">
            <!-- Username with Async Server Validator -->
            <div class="form-field">
              <label for="username">
                Username / Handle:
                @if (signupForm.get('username')?.pending) {
                  <span class="pending-pill">⏳ Checking server availability...</span>
                }
              </label>

              <div class="input-wrapper">
                <input 
                  id="username"
                  type="text" 
                  formControlName="username" 
                  class="text-input"
                  [class.is-invalid]="signupForm.get('username')?.invalid && signupForm.get('username')?.touched"
                  [class.is-valid]="signupForm.get('username')?.valid && signupForm.get('username')?.touched"
                  placeholder="Try 'admin' or 'sarah.chen' or 'angular'..."
                />
                @if (signupForm.get('username')?.pending) {
                  <span class="spinner-icon">🔄</span>
                } @else if (signupForm.get('username')?.valid && signupForm.get('username')?.touched) {
                  <span class="valid-icon">✅</span>
                } @else if (signupForm.get('username')?.invalid && signupForm.get('username')?.touched) {
                  <span class="invalid-icon">❌</span>
                }
              </div>

              <!-- Error Messages -->
              @if (signupForm.get('username')?.hasError('required') && signupForm.get('username')?.touched) {
                <span class="field-error">Username is required.</span>
              }
              @if (signupForm.get('username')?.hasError('minlength')) {
                <span class="field-error">Minimum 3 characters required.</span>
              }
              @if (signupForm.get('username')?.hasError('usernameTaken')) {
                <span class="field-error server-error">
                  🚫 {{ signupForm.get('username')?.getError('usernameTaken') }}
                </span>
              }
              @if (signupForm.get('username')?.valid && signupForm.get('username')?.touched) {
                <span class="field-success">🎉 Username is available!</span>
              }
            </div>

            <!-- Full Name (Synchronous) -->
            <div class="form-field">
              <label for="fullName">Full Name:</label>
              <input id="fullName" type="text" formControlName="fullName" class="text-input" placeholder="e.g. Jane Doe" />
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn-submit" 
                [disabled]="signupForm.invalid || signupForm.pending"
              >
                @if (signupForm.pending) {
                  <span>Validating Credentials...</span>
                } @else {
                  <span>Create Account</span>
                }
              </button>
              <button type="button" class="btn-preset" (click)="testReservedName()">
                Fill Reserved Name ('admin')
              </button>
            </div>
          </form>

          @if (formSubmitted) {
            <div class="success-banner">
              ✅ Account registration submitted successfully for <strong>{{ signupForm.value.username }}</strong>!
            </div>
          }

          <div class="verification-guide">
            <strong>🛡️ Why RxJS Async Validators Prevent Bugs:</strong>
            <ol>
              <li><strong>Keystroke Debouncing:</strong> Typing 10 letters rapidly doesn't trigger 10 server queries. <code>debounceTime(400)</code> waits until user pauses.</li>
              <li><strong>Race Condition Prevention:</strong> <code>switchMap</code> automatically discards in-flight responses for stale keystrokes, ensuring slow network packets never overwrite fresh validation states!</li>
              <li><strong>first() Operator Guarantee:</strong> Angular async validators require the returned Observable to complete. Using <code>first()</code> ensures the validator stream completes immediately after emitting.</li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="RxJS Async Validator Factory" />
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
    .form-status { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
    .form-status.valid { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
    .form-status.invalid { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }
    .form-status.pending { background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); }
    .registration-form { display: flex; flex-direction: column; gap: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.25rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-field label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; }
    .pending-pill { font-size: 0.7rem; color: var(--accent-amber); font-weight: normal; }
    .input-wrapper { position: relative; }
    .text-input { width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 9px 36px 9px 12px; border-radius: 6px; font-size: 0.9rem; }
    .text-input.is-invalid { border-color: #f43f5e; }
    .text-input.is-valid { border-color: var(--accent-emerald); }
    .spinner-icon, .valid-icon, .invalid-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; }
    .field-error { font-size: 0.75rem; color: #f43f5e; }
    .server-error { font-weight: 600; }
    .field-success { font-size: 0.75rem; color: var(--accent-emerald); }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .btn-submit { flex: 2; min-width: 160px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-preset { flex: 1; min-width: 140px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .success-banner { background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.85rem; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class ReactiveFormScenarioComponent implements OnInit, OnDestroy {
  private readonly mockData = inject(MockDataService);

  signupForm!: FormGroup;
  formSubmitted = false;
  events: StreamEvent[] = [];
  private startTime = Date.now();
  private telemetrySub?: Subscription;

  readonly codeSnippet = `// Async Validator Factory with Debounce & switchMap
export function usernameAsyncValidator(api: MockDataService) {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.length < 3) {
      return of(null); // Delegate to sync validators
    }

    return timer(400).pipe( // 1. Debounce async network calls
      switchMap(() => api.checkUsernameAvailable(control.value)), // 2. Cancel in-flight check on new keystroke
      map(res => res.available ? null : { usernameTaken: res.reason }),
      catchError(() => of(null)), // 3. Network failure gracefully passes validation
      first() // 4. MUST complete for Angular validator lifecycle!
    );
  };
}`;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signupForm = new FormGroup({
      username: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [this.createUsernameValidator()],
        updateOn: 'change'
      }),
      fullName: new FormControl('Devon Miles', [Validators.required])
    });

    this.telemetrySub = this.signupForm.get('username')?.valueChanges.pipe(
      tap(val => this.record('next', `Username field changed to "${val}"`))
    ).subscribe();
  }

  createUsernameValidator() {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const val = control.value?.trim();
      if (!val || val.length < 3) {
        return of(null);
      }

      this.record('subscribe', `[Async Validator Started] Checking server uniqueness for "${val}"...`);

      return timer(350).pipe(
        switchMap(() => this.mockData.checkUsernameAvailable(val, 200)),
        map(res => {
          if (!res.available) {
            this.record('error', `[Validation Failed] ${res.reason}`);
            return { usernameTaken: res.reason };
          }
          this.record('next', `[Validation Passed] Username "${val}" is available.`);
          return null;
        }),
        catchError(() => of(null)),
        first()
      );
    };
  }

  testReservedName(): void {
    this.signupForm.get('username')?.setValue('admin');
    this.signupForm.get('username')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.formSubmitted = true;
      this.record('next', `Form submitted with: ${JSON.stringify(this.signupForm.value)}`);
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
    if (this.telemetrySub) {
      this.telemetrySub.unsubscribe();
    }
  }
}
