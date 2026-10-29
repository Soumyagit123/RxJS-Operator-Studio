import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OperatorCatalogService } from '../../services/operator-catalog.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="app-sidebar">
      <div class="sidebar-section">
        <div class="section-title">NAVIGATION</div>
        <nav class="nav-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/catalog" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔬</span>
            <span>Operator Explorer</span>
            <span class="nav-counter">{{ catalogService.allOperators().length }}</span>
          </a>
          <a routerLink="/scenarios" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏢</span>
            <span>Enterprise Scenarios</span>
            <span class="nav-counter badge badge-utility">7</span>
          </a>
          <a routerLink="/subjects" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚡</span>
            <span>Subjects & Primitives</span>
            <span class="nav-counter badge badge-creation">4</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-section">
        <div class="section-title">OPERATOR CATEGORIES</div>
        <div class="category-list">
          <button 
            class="cat-item" 
            [class.active]="catalogService.selectedCategory() === 'all'"
            (click)="selectCategory('all')">
            <span class="cat-bullet bullet-all">●</span>
            <span class="cat-name">All Categories</span>
            <span class="cat-count">{{ catalogService.allOperators().length }}</span>
          </button>

          @for (cat of catalogService.categories(); track cat.category) {
            <button 
              class="cat-item" 
              [class.active]="catalogService.selectedCategory() === cat.category"
              (click)="selectCategory(cat.category)">
              <span class="cat-bullet" [ngClass]="'bullet-' + cat.category">●</span>
              <span class="cat-name">{{ cat.category | titlecase }}</span>
              <span class="cat-count">{{ cat.count }}</span>
            </button>
          }
        </div>
      </div>

      <div class="sidebar-section">
        <div class="section-title">FEATURED LABS</div>
        <div class="featured-list">
          <a [routerLink]="['/operators', 'switch-map']" routerLinkActive="active" class="sub-link">
            ⚡ switchMap (Search/Cancel)
          </a>
          <a [routerLink]="['/operators', 'merge-map']" routerLinkActive="active" class="sub-link">
            🔀 mergeMap (Parallel Jobs)
          </a>
          <a [routerLink]="['/operators', 'concat-map']" routerLinkActive="active" class="sub-link">
            ⛓️ concatMap (Serialized Queue)
          </a>
          <a [routerLink]="['/operators', 'exhaust-map']" routerLinkActive="active" class="sub-link">
            🛡️ exhaustMap (Submit Guard)
          </a>
          <a [routerLink]="['/operators', 'share-replay']" routerLinkActive="active" class="sub-link">
            💾 shareReplay (Cache/TTL)
          </a>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur-nav);
      -webkit-backdrop-filter: var(--glass-blur-nav);
      border-right: 1px solid var(--border-subtle);
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      gap: 1.75rem;
    }
    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .section-title {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      padding: 0 0.85rem 0.35rem;
    }
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.85rem;
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid transparent;
    }
    .nav-item:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
      transform: translateX(3px);
      border-color: var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }
    .nav-item.active {
      background: var(--bg-glass-elevated);
      color: var(--accent-indigo);
      border: 1px solid var(--border-focus);
      border-top: 1px solid var(--border-specular);
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }
    .nav-icon {
      font-size: 1.05rem;
    }
    .nav-counter {
      margin-left: auto;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      border-radius: 9999px;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }
    .nav-item.active .nav-counter {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-indigo);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .cat-item {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.55rem 0.85rem;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      width: 100%;
      text-align: left;
      font-size: 0.84rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cat-item:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
      transform: translateX(3px);
      border-color: var(--border-subtle);
    }
    .cat-item.active {
      background: var(--bg-glass-elevated);
      color: var(--text-main);
      border: 1px solid var(--border-focus);
      border-top: 1px solid var(--border-specular);
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }
    .cat-bullet { font-size: 0.8rem; }
    .bullet-all { color: var(--text-dim); }
    .bullet-creation { color: var(--accent-cyan); }
    .bullet-transformation { color: var(--accent-indigo); }
    .bullet-filtering { color: var(--accent-emerald); }
    .bullet-combination { color: var(--accent-purple); }
    .bullet-error-handling { color: var(--accent-rose); }
    .bullet-utility { color: var(--accent-amber); }
    .bullet-multicasting { color: #ec4899; }
    .bullet-time-based { color: #3b82f6; }
    .bullet-legacy { color: var(--text-dim); }

    .cat-name { flex: 1; }
    .cat-count {
      font-size: 0.72rem;
      color: var(--text-dim);
      font-weight: 600;
      font-family: var(--font-mono);
      background: var(--bg-recessed);
      padding: 1px 6px;
      border-radius: 9999px;
      border: 1px solid var(--border-subtle);
    }
    .cat-item.active .cat-count {
      color: var(--accent-indigo);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .featured-list {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .sub-link {
      padding: 0.5rem 0.85rem;
      font-size: 0.82rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border: 1px solid transparent;
    }
    .sub-link:hover {
      background: var(--bg-card-hover);
      color: var(--accent-cyan);
      transform: translateX(3px);
      border-color: var(--border-subtle);
    }
    .sub-link.active {
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent-cyan);
      font-weight: 700;
      border: 1px solid rgba(56, 189, 248, 0.3);
      box-shadow: var(--shadow-sm);
    }
  `]
})
export class AppSidebarComponent {
  readonly catalogService = inject(OperatorCatalogService);
  private readonly router = inject(Router);

  selectCategory(category: any): void {
    this.catalogService.setFilters({ category });
    if (!this.router.url.startsWith('/catalog')) {
      this.router.navigate(['/catalog']);
    }
  }
}
