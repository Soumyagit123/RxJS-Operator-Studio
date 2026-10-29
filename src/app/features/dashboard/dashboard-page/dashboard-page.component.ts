import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OperatorCatalogService } from '../../../core/services/operator-catalog.service';
import { OperatorCardComponent } from '../../../shared/components/operator-card/operator-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, OperatorCardComponent],
  template: `
    <div class="dashboard-page">
      <!-- Hero Section -->
      <section class="hero-banner glass-panel">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge badge-creation">Angular 17+ & RxJS 7.8 Architecture</span>
          </div>
          <h1 class="hero-title">
            <span class="gradient-text">RxJS Operator Studio</span>
          </h1>
          <p class="hero-desc">
            Deep dive into reactive streaming patterns, concurrency control, stream cancellation, 
            deterministic virtual-time testing, and real-world enterprise architectures.
          </p>
          <div class="hero-actions">
            <a routerLink="/catalog" class="primary-btn">
              Explore Operator Lab ({{ catalogService.allOperators().length }} Operators)
            </a>
            <a routerLink="/scenarios" class="secondary-btn">
              View Enterprise Scenarios →
            </a>
          </div>
        </div>

        <div class="hero-metrics">
          <div class="metric-card">
            <span class="metric-val">{{ catalogService.allOperators().length }}</span>
            <span class="metric-label">Covered Operators</span>
          </div>
          <div class="metric-card">
            <span class="metric-val">7</span>
            <span class="metric-label">Enterprise Scenarios</span>
          </div>
          <div class="metric-card">
            <span class="metric-val">{{ catalogService.progressStats().percentage }}%</span>
            <span class="metric-label">Mastery Completed</span>
          </div>
        </div>
      </section>

      <!-- Flattening Operators Highlight -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">The Concurrency Four (Flattening Matrix)</h2>
            <p class="section-sub">Understand the crucial semantic and timing differences between the four core flattening strategies.</p>
          </div>
          <a routerLink="/catalog" class="view-all-link">Browse All →</a>
        </div>

        <div class="operator-grid">
          @for (op of flatteningOperators; track op.id) {
            <app-operator-card 
              [operator]="op"
              [isCompleted]="catalogService.isCompleted(op.id)"
              [isFavorite]="catalogService.isFavorite(op.id)"
              (toggleCompleted)="catalogService.toggleCompleted($event)"
              (toggleFavorite)="catalogService.toggleFavorite($event)"
            />
          }
        </div>
      </section>

      <!-- Category Quick Filter Matrix -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Operator Catalogue by Category</h2>
            <p class="section-sub">Select any domain to inspect specialized operators and interactive runtimes.</p>
          </div>
        </div>

        <div class="category-grid">
          @for (cat of catalogService.categories(); track cat.category) {
            <div class="cat-card glass-panel" (click)="goToCategory(cat.category)">
              <div class="cat-card-header">
                <span class="badge" [ngClass]="'badge-' + cat.category">{{ cat.category }}</span>
                <span class="count-pill">{{ cat.count }}</span>
              </div>
              <p class="cat-card-desc">{{ getCategorySummary(cat.category) }}</p>
              <span class="card-arrow">Open Category →</span>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
    .hero-banner {
      padding: 2.75rem;
      border-radius: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2.5rem;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }
    .hero-banner::after {
      content: '';
      position: absolute;
      top: -70px;
      right: -70px;
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.22), transparent 70%);
      pointer-events: none;
    }
    .hero-content {
      max-width: 680px;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      z-index: 2;
    }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.035em;
      color: var(--text-main);
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-desc {
      font-size: 1.05rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    .primary-btn {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      padding: 0.8rem 1.6rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.92rem;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .primary-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.55);
    }
    .secondary-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-top: 1px solid var(--border-specular);
      color: var(--text-main);
      padding: 0.8rem 1.6rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.92rem;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-sm);
    }
    .secondary-btn:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-focus);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .hero-metrics {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 190px;
      z-index: 2;
    }
    .metric-card {
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      border-radius: 16px;
      padding: 1rem 1.4rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .metric-card:hover {
      transform: scale(1.03);
    }
    .metric-val {
      font-size: 2rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--accent-cyan);
      letter-spacing: -0.02em;
    }
    .metric-label {
      font-size: 0.72rem;
      color: var(--text-dim);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 2px;
    }
    .section-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .section-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .section-sub {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .view-all-link {
      font-size: 0.88rem;
      color: var(--accent-cyan);
      text-decoration: none;
      font-weight: 700;
      transition: transform 0.15s;
    }
    .view-all-link:hover {
      transform: translateX(3px);
    }
    .operator-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.35rem;
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.35rem;
    }
    .cat-card {
      padding: 1.4rem;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      cursor: pointer;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-md);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cat-card:hover {
      transform: translateY(-4px) scale(1.01);
      border-color: var(--border-focus);
      background: var(--bg-card-hover);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
    }
    .cat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .count-pill {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      padding: 2px 10px;
      border-radius: 9999px;
    }
    .cat-card-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
      flex: 1;
    }
    .card-arrow {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--accent-indigo);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: transform 0.2s;
    }
    .cat-card:hover .card-arrow {
      transform: translateX(4px);
    }
    @media (max-width: 900px) {
      .hero-banner {
        flex-direction: column;
        align-items: flex-start;
        padding: 2rem;
      }
      .hero-metrics {
        flex-direction: row;
        width: 100%;
      }
      .metric-card {
        flex: 1;
      }
    }
  `]
})
export class DashboardPageComponent {
  readonly catalogService = inject(OperatorCatalogService);

  readonly flatteningOperators = [
    this.catalogService.getOperatorById('switch-map')!,
    this.catalogService.getOperatorById('merge-map')!,
    this.catalogService.getOperatorById('concat-map')!,
    this.catalogService.getOperatorById('exhaust-map')!
  ].filter(Boolean);

  goToCategory(category: any): void {
    this.catalogService.setFilters({ category });
  }

  getCategorySummary(category: string): string {
    switch (category) {
      case 'creation': return 'Create observables from static values, events, timers, iterables, and factories.';
      case 'transformation': return 'Transform stream values and project inner observables with distinct flattening policies.';
      case 'filtering': return 'Select, debounce, throttle, and sample emissions based on predicates or time.';
      case 'combination': return 'Join, zip, race, and merge independent streams into unified reactive flows.';
      case 'error-handling': return 'Resiliently catch, fallback, and retry failed operations with exponential backoff.';
      case 'utility': return 'Inspect notifications with tap, manage lifecycle with finalize, and enforce timeouts.';
      case 'multicasting': return 'Share expensive pipeline executions across multiple subscribers with share and shareReplay.';
      case 'time-based': return 'Coordinate timing, sample rates, intervals, and temporal windowing.';
      case 'legacy': return 'Reference and migration paths for deprecated or removed APIs.';
      default: return 'RxJS operators catalog.';
    }
  }
}
