import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorCatalogService } from '../../../core/services/operator-catalog.service';
import { OperatorCardComponent } from '../../../shared/components/operator-card/operator-card.component';
import { OperatorCategory, OperatorDifficulty, OperatorStatus } from '../operator.model';

@Component({
  selector: 'app-operator-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, OperatorCardComponent],
  template: `
    <div class="catalog-page">
      <div class="catalog-header">
        <div>
          <h1 class="page-title">Operator Explorer & Catalogue</h1>
          <p class="page-sub">
            Showing {{ catalogService.filteredOperators().length }} of {{ catalogService.allOperators().length }} covered RxJS operators.
          </p>
        </div>

        <button class="reset-btn" (click)="catalogService.resetFilters()">
          Reset Filters
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="filter-panel glass-panel">
        <div class="filter-group">
          <label class="filter-label">Search</label>
          <input 
            type="text" 
            placeholder="Search by operator or use case..." 
            [ngModel]="catalogService.searchQuery()" 
            (ngModelChange)="onSearchChange($event)"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Category</label>
          <select 
            [ngModel]="catalogService.selectedCategory()" 
            (ngModelChange)="onCategoryChange($event)"
            class="filter-select">
            <option value="all">All Categories</option>
            <option value="creation">Creation</option>
            <option value="transformation">Transformation & Flattening</option>
            <option value="filtering">Filtering & Selection</option>
            <option value="combination">Combination</option>
            <option value="error-handling">Error Handling</option>
            <option value="utility">Utility & Lifecycle</option>
            <option value="multicasting">Multicasting & Sharing</option>
            <option value="time-based">Time-Based</option>
            <option value="legacy">Legacy / Deprecated</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Difficulty</label>
          <select 
            [ngModel]="catalogService.selectedDifficulty()" 
            (ngModelChange)="onDifficultyChange($event)"
            class="filter-select">
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select 
            [ngModel]="catalogService.selectedStatus()" 
            (ngModelChange)="onStatusChange($event)"
            class="filter-select">
            <option value="all">All Statuses</option>
            <option value="recommended">Recommended</option>
            <option value="specialized">Specialized</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      <!-- Operator Grid -->
      @if (catalogService.filteredOperators().length === 0) {
        <div class="empty-results glass-panel">
          <span class="empty-icon">🔍</span>
          <h3>No operators match your filter criteria</h3>
          <p>Try clearing your query or adjusting the category selection.</p>
          <button class="primary-btn" (click)="catalogService.resetFilters()">Reset All Filters</button>
        </div>
      } @else {
        <div class="operator-grid">
          @for (op of catalogService.filteredOperators(); track op.id) {
            <app-operator-card 
              [operator]="op"
              [isCompleted]="catalogService.isCompleted(op.id)"
              [isFavorite]="catalogService.isFavorite(op.id)"
              (toggleCompleted)="catalogService.toggleCompleted($event)"
              (toggleFavorite)="catalogService.toggleFavorite($event)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .catalog-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .catalog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .page-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.03em;
    }
    .page-sub {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .reset-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-top: 1px solid var(--border-specular);
      color: var(--text-muted);
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reset-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
      border-color: var(--border-focus);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .filter-panel {
      padding: 1.5rem;
      border-radius: 20px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1.25rem;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-md);
    }
    @media (max-width: 900px) {
      .filter-panel {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 600px) {
      .filter-panel {
        grid-template-columns: 1fr;
      }
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .filter-label {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .filter-input, .filter-select {
      background: var(--bg-recessed);
      border: 1px solid var(--border-medium);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      color: var(--text-main);
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    .filter-input:focus, .filter-select:focus {
      border-color: var(--border-focus);
      background: var(--bg-card);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .operator-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.35rem;
    }
    .empty-results {
      padding: 3.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      border-radius: 20px;
    }
    .empty-icon {
      font-size: 3rem;
      filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
    }
    .primary-btn {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      border: none;
      padding: 0.75rem 1.6rem;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.55);
    }
  `]
})
export class OperatorCatalogComponent {
  readonly catalogService = inject(OperatorCatalogService);

  onSearchChange(query: string): void {
    this.catalogService.setFilters({ query });
  }

  onCategoryChange(category: OperatorCategory | 'all'): void {
    this.catalogService.setFilters({ category });
  }

  onDifficultyChange(difficulty: OperatorDifficulty | 'all'): void {
    this.catalogService.setFilters({ difficulty });
  }

  onStatusChange(status: OperatorStatus | 'all'): void {
    this.catalogService.setFilters({ status });
  }
}
