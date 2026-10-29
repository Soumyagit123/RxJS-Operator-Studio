import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { OperatorCatalogService } from '../../services/operator-catalog.service';

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
    @media (max-width: 900px) {
      .brand-subtitle { display: none; }
      .docs-btn { display: none; }
      .header-center { margin: 0 0.75rem; }
    }
    @media (max-width: 600px) {
      .app-header { padding: 0 1rem; }
      .progress-pill { display: none; }
      .header-center { margin: 0 0.5rem; }
    }
  `]
})
export class AppHeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly catalogService = inject(OperatorCatalogService);
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
}
