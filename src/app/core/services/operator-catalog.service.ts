import { Injectable, signal, computed } from '@angular/core';
import { OPERATOR_CATALOG } from '../../features/operators/operator-registry';
import { OperatorDefinition, OperatorFilter, OperatorCategory, OperatorDifficulty, OperatorStatus } from '../../features/operators/operator.model';

@Injectable({
  providedIn: 'root'
})
export class OperatorCatalogService {
  private readonly catalog = signal<OperatorDefinition[]>(OPERATOR_CATALOG);
  
  // Filter state signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<OperatorCategory | 'all'>('all');
  readonly selectedDifficulty = signal<OperatorDifficulty | 'all'>('all');
  readonly selectedStatus = signal<OperatorStatus | 'all'>('all');

  // Favorites & Completion tracking (persisted in localStorage)
  private readonly completedIds = signal<Set<string>>(this.loadStoredSet('rxjs_completed_operators'));
  private readonly favoriteIds = signal<Set<string>>(this.loadStoredSet('rxjs_favorite_operators'));

  readonly allOperators = computed(() => this.catalog());

  readonly filteredOperators = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    const difficulty = this.selectedDifficulty();
    const status = this.selectedStatus();

    return this.catalog().filter(op => {
      const matchesQuery = !query || 
        op.name.toLowerCase().includes(query) ||
        op.description.toLowerCase().includes(query) ||
        op.useCases.some((uc: string) => uc.toLowerCase().includes(query));

      const matchesCat = category === 'all' || op.category === category;
      const matchesDiff = difficulty === 'all' || op.difficulty === difficulty;
      const matchesStat = status === 'all' || op.status === status;

      return matchesQuery && matchesCat && matchesDiff && matchesStat;
    });
  });

  readonly categories = computed(() => {
    const counts = new Map<string, number>();
    for (const op of this.catalog()) {
      counts.set(op.category, (counts.get(op.category) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([category, count]) => ({
      category: category as OperatorCategory,
      count
    }));
  });

  readonly progressStats = computed(() => {
    const total = this.catalog().length;
    const completed = this.completedIds().size;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  });

  getOperatorById(idOrName: string): OperatorDefinition | undefined {
    if (!idOrName) return undefined;
    const clean = idOrName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.catalog().find(op => 
      op.id === idOrName || 
      op.name.toLowerCase() === idOrName.toLowerCase() ||
      op.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      op.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
    );
  }

  isCompleted(id: string): boolean {
    return this.completedIds().has(id);
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds().has(id);
  }

  toggleCompleted(id: string): void {
    const current = new Set(this.completedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.completedIds.set(current);
    this.saveStoredSet('rxjs_completed_operators', current);
  }

  toggleFavorite(id: string): void {
    const current = new Set(this.favoriteIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.favoriteIds.set(current);
    this.saveStoredSet('rxjs_favorite_operators', current);
  }

  setFilters(filter: OperatorFilter): void {
    if (filter.query !== undefined) this.searchQuery.set(filter.query);
    if (filter.category !== undefined) this.selectedCategory.set(filter.category);
    if (filter.difficulty !== undefined) this.selectedDifficulty.set(filter.difficulty);
    if (filter.status !== undefined) this.selectedStatus.set(filter.status);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.selectedDifficulty.set('all');
    this.selectedStatus.set('all');
  }

  private loadStoredSet(key: string): Set<string> {
    try {
      const data = localStorage.getItem(key);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveStoredSet(key: string, set: Set<string>): void {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }
}
