import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { OperatorCatalogService } from '../../services/operator-catalog.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <header class="app-header glass-panel">
      <div class="header-left">
        <a routerLink="/" class="brand">
          <div class="brand-logo">Rx</div>
          <div class="brand-text">
            <span class="brand-title">RxJS Operator Studio</span>
            <span class="brand-subtitle">Interactive Stream Lab & Architecture Playbook</span>
          </div>
        </a>
      </div>

      <div class="header-center">
        <div class="global-search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search 40+ operators, scenarios, concepts (e.g. switchMap, debounce, cache)..." 
            [ngModel]="catalogService.searchQuery()"
            (ngModelChange)="onSearchInput($event)"
            class="search-input"
          />
          @if (catalogService.searchQuery()) {
            <button class="clear-search-btn" (click)="clearSearch()">✕</button>
          }
        </div>
      </div>

      <div class="header-right">
        <!-- Progress Counter -->
        <div class="progress-pill" title="Completed learning examples">
          <span class="progress-label">Progress:</span>
          <span class="progress-val">{{ catalogService.progressStats().completed }} / {{ catalogService.progressStats().total }}</span>
          <div class="mini-bar">
            <div class="mini-bar-fill" [style.width.%]="catalogService.progressStats().percentage"></div>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button class="theme-toggle-btn" (click)="themeService.toggleTheme()" [title]="'Current theme: ' + themeService.theme()">
          {{ themeService.theme() === 'dark' ? '🌙' : '☀️' }}
        </button>

        <!-- Auth Section -->
        @if (authService.user$ | async; as user) {
          <div class="user-pill glass-pill" title="Signed in with Google">
            @if (user.user_metadata['avatar_url']) {
              <img [src]="user.user_metadata['avatar_url']" alt="Avatar" class="user-avatar" />
            } @else {
              <div class="user-avatar-fallback">
                {{ user.email?.[0]?.toUpperCase() || 'U' }}
              </div>
            }
            <span class="user-name">{{ user.user_metadata['full_name'] || user.email?.split('@')?.[0] || 'User' }}</span>
            <button class="sign-out-btn" (click)="signOut()" title="Sign out">
              ✕
            </button>
          </div>
        } @else {
          <button class="google-login-btn" (click)="signInWithGoogle()" [disabled]="authService.isLoading$ | async">
            <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        }

        <a href="https://rxjs.dev" target="_blank" rel="noopener noreferrer" class="docs-btn">
          Official Docs ↗
        </a>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 68px;
      min-height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.75rem;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 1000;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur-nav);
      -webkit-backdrop-filter: var(--glass-blur-nav);
      border-bottom: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }
    .header-left {
      display: flex;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      color: var(--text-main);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .brand:hover {
      transform: scale(1.02);
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #e11d48, #9333ea);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.15rem;
      color: white;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-weight: 800;
      font-size: 1.05rem;
      letter-spacing: -0.025em;
      color: var(--text-main);
    }
    .brand-subtitle {
      font-size: 0.72rem;
      color: var(--text-dim);
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .header-center {
      flex: 1;
      max-width: 580px;
      margin: 0 2rem;
    }
    .global-search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      font-size: 0.9rem;
      color: var(--text-dim);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      height: 42px;
      padding: 0 36px 0 42px;
      background: var(--bg-recessed);
      border: 1px solid var(--border-medium);
      border-radius: 9999px;
      color: var(--text-main);
      font-size: 0.88rem;
      outline: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    }
    .search-input::placeholder {
      color: var(--text-dim);
    }
    .search-input:focus {
      border-color: var(--border-focus);
      background: var(--bg-card);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25), var(--shadow-sm);
    }
    .clear-search-btn {
      position: absolute;
      right: 12px;
      background: var(--border-subtle);
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 0.75rem;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .clear-search-btn:hover {
      background: var(--border-focus);
      color: var(--text-main);
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .progress-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 6px 14px;
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      border-radius: 9999px;
      font-size: 0.78rem;
      box-shadow: var(--shadow-sm);
    }
    .progress-label {
      color: var(--text-dim);
      font-weight: 600;
    }
    .progress-val {
      font-weight: 800;
      color: var(--accent-emerald);
      font-family: var(--font-mono);
    }
    .mini-bar {
      width: 54px;
      height: 6px;
      background: var(--border-subtle);
      border-radius: 9999px;
      overflow: hidden;
    }
    .mini-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-emerald), #10b981);
      border-radius: 9999px;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .theme-toggle-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      color: var(--text-main);
      width: 40px;
      height: 40px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .theme-toggle-btn:hover {
      transform: translateY(-2px) scale(1.05);
      background: var(--bg-card-hover);
      border-color: var(--border-focus);
      box-shadow: var(--shadow-md);
    }
    .docs-btn {
      font-size: 0.82rem;
      color: var(--accent-cyan);
      text-decoration: none;
      padding: 8px 14px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 10px;
      font-weight: 600;
      letter-spacing: -0.01em;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-sm);
    }
    .docs-btn:hover {
      background: rgba(56, 189, 248, 0.2);
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow-cyan);
    }
    .google-login-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-top: 1px solid var(--border-specular);
      color: var(--text-main);
      padding: 7px 14px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .google-login-btn:hover:not(:disabled) {
      background: var(--bg-card-hover);
      border-color: var(--border-focus);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .google-login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 4px 10px 4px 5px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      border-radius: 9999px;
      box-shadow: var(--shadow-sm);
    }
    .user-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid var(--border-subtle);
    }
    .user-avatar-fallback {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.75rem;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-main);
      max-width: 110px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sign-out-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 0.75rem;
      padding: 2px 4px;
      border-radius: 50%;
      transition: color 0.15s;
    }
    .sign-out-btn:hover {
      color: var(--accent-rose);
    }
    @media (max-width: 900px) {
      .brand-subtitle { display: none; }
      .docs-btn { display: none; }
      .header-center { margin: 0 0.75rem; }
    }
    @media (max-width: 600px) {
      .app-header { padding: 0 1rem; }
      .progress-pill { display: none; }
      .header-center { margin: 0 0.5rem; }
      .user-name { display: none; }
    }
  `]
})
export class AppHeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly catalogService = inject(OperatorCatalogService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSearchInput(query: string): void {
    this.catalogService.setFilters({ query });
    if (query && !this.router.url.startsWith('/catalog')) {
      this.router.navigate(['/catalog']);
    }
  }

  clearSearch(): void {
    this.catalogService.setFilters({ query: '' });
  }

  signInWithGoogle(): void {
    this.authService.signInWithGoogle().catch(err => {
      console.error('Google sign-in error:', err);
    });
  }

  signOut(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    }).catch(err => {
      console.error('Sign-out error:', err);
    });
  }
}
