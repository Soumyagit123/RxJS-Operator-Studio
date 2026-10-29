import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="ambient-glow"></div>
      
      <div class="login-card glass-panel">
        <div class="card-header">
          <div class="brand-logo">Rx</div>
          <h1 class="brand-title">RxJS Operator Studio</h1>
          <p class="brand-tagline">Spatial Visual Laboratory & Architecture Playbook</p>
        </div>

        <!-- Mode Toggle (Sign In vs Sign Up) -->
        <div class="mode-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="isLoginMode" 
            (click)="isLoginMode = true; errorMessage = ''; successMessage = ''">
            Sign In
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="!isLoginMode" 
            (click)="isLoginMode = false; errorMessage = ''; successMessage = ''">
            Sign Up
          </button>
        </div>

        @if (errorMessage) {
          <div class="feedback-alert error-alert">
            <span class="alert-icon">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>
        }

        @if (successMessage) {
          <div class="feedback-alert success-alert">
            <span class="alert-icon">✓</span>
            <span>{{ successMessage }}</span>
          </div>
        }

        <!-- 1-Click Google OAuth (PKCE) -->
        <button 
          type="button" 
          class="google-auth-btn" 
          (click)="onGoogleSignIn()" 
          [disabled]="isLoading">
          <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">or with email</span>
          <span class="divider-line"></span>
        </div>

        <!-- Email & Password Form -->
        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="input-field">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              [(ngModel)]="email" 
              placeholder="you@domain.com" 
              required 
              autocomplete="email"
            />
          </div>

          <div class="input-field">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              [(ngModel)]="password" 
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            class="submit-auth-btn" 
            [disabled]="isLoading || !email || !password">
            {{ isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account') }}
          </button>
        </form>

        <div class="card-footer">
          <p class="terms-text">
            Enterprise Spatial Sandbox with Supabase OAuth & PKCE security.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }
    .ambient-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(56, 189, 248, 0.1) 45%, transparent 70%);
      pointer-events: none;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem 2.25rem;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-lg);
      position: relative;
      z-index: 2;
    }
    .card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
    }
    .brand-logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #e11d48, #9333ea);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.4rem;
      color: white;
      box-shadow: 0 4px 18px rgba(225, 29, 72, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .brand-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.03em;
      margin: 0;
    }
    .brand-tagline {
      font-size: 0.85rem;
      color: var(--text-dim);
      margin: 0;
    }
    .mode-tabs {
      display: flex;
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }
    .tab-btn {
      flex: 1;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 8px 12px;
      border-radius: 9px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tab-btn.active {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-sm);
    }
    .google-auth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-top: 1px solid var(--border-specular);
      color: var(--text-main);
      padding: 12px;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-sm);
    }
    .google-auth-btn:hover:not(:disabled) {
      background: var(--bg-card-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-focus);
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: var(--border-subtle);
    }
    .divider-text {
      font-size: 0.78rem;
      color: var(--text-dim);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    .input-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .input-field label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .input-field input {
      padding: 10px 14px;
      font-size: 0.92rem;
    }
    .submit-auth-btn {
      margin-top: 0.4rem;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 11px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .submit-auth-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.55);
    }
    .submit-auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .feedback-alert {
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 600;
    }
    .error-alert {
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: var(--accent-rose);
    }
    .success-alert {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-emerald);
    }
    .card-footer {
      text-align: center;
    }
    .terms-text {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin: 0;
      line-height: 1.4;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoginMode = true;
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  async onGoogleSignIn(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.signInWithGoogle();
    } catch (err: any) {
      this.isLoading = false;
      this.errorMessage = err.message || 'Google authentication failed';
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (this.isLoginMode) {
        await this.authService.signInWithEmail(this.email, this.password);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      } else {
        await this.authService.signUpWithEmail(this.email, this.password);
        this.successMessage = 'Account created successfully! Check your email if verification is required, or sign in now.';
        this.isLoginMode = true;
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Authentication error. Please check your credentials.';
    } finally {
      this.isLoading = false;
    }
  }
}
