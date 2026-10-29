import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OperatorDefinition } from '../../../features/operators/operator.model';

@Component({
  selector: 'app-operator-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="op-card glass-panel" [class.is-completed]="isCompleted">
      <div class="card-top">
        <div class="name-status">
          <a [routerLink]="['/operators', operator.id]" class="op-name">
            {{ operator.name }}
          </a>
          <span class="badge" [ngClass]="'badge-' + operator.category">
            {{ operator.category }}
          </span>
          @if (operator.status === 'deprecated') {
            <span class="badge badge-error-handling">Deprecated</span>
          }
        </div>
        <div class="actions">
          <button 
            class="icon-btn favorite-btn" 
            [class.active]="isFavorite" 
            (click)="toggleFavorite.emit(operator.id)"
            [title]="isFavorite ? 'Remove from favorites' : 'Add to favorites'">
            {{ isFavorite ? '★' : '☆' }}
          </button>
          <button 
            class="icon-btn complete-btn" 
            [class.active]="isCompleted" 
            (click)="toggleCompleted.emit(operator.id)"
            [title]="isCompleted ? 'Completed' : 'Mark as learned'">
            {{ isCompleted ? '✓' : '○' }}
          </button>
        </div>
      </div>

      <p class="op-desc">{{ operator.description }}</p>

      <div class="use-cases">
        @for (uc of operator.useCases.slice(0, 2); track uc) {
          <span class="use-case-tag">✦ {{ uc }}</span>
        }
      </div>

      <div class="card-footer">
        <span class="difficulty-tag" [ngClass]="'diff-' + operator.difficulty">
          {{ operator.difficulty | titlecase }}
        </span>
        <a [routerLink]="['/operators', operator.id]" class="explore-link">
          Explore Lab →
        </a>
      </div>
    </div>
  `,
  styles: [`
    .op-card {
      padding: 1.4rem;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), 
                  border-color 0.25s ease, 
                  box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                  background 0.25s ease;
      position: relative;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-md);
    }
    .op-card:hover {
      transform: translateY(-4px) scale(1.008);
      border-color: var(--border-focus);
      background: var(--bg-card-hover);
      box-shadow: var(--shadow-lg), var(--shadow-glow);
    }
    .op-card.is-completed {
      border-left: 4px solid var(--accent-emerald);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .name-status {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .op-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
      text-decoration: none;
      font-family: var(--font-mono);
      letter-spacing: -0.02em;
      transition: color 0.15s;
    }
    .op-name:hover {
      color: var(--accent-cyan);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .icon-btn {
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      font-size: 0.95rem;
      color: var(--text-dim);
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .icon-btn:hover {
      transform: scale(1.1);
      background: var(--bg-card-hover);
      color: var(--text-main);
      border-color: var(--border-medium);
      box-shadow: var(--shadow-sm);
    }
    .favorite-btn.active {
      color: var(--accent-amber);
      background: rgba(251, 191, 36, 0.12);
      border-color: rgba(251, 191, 36, 0.4);
    }
    .complete-btn.active {
      color: var(--accent-emerald);
      background: rgba(52, 211, 153, 0.12);
      border-color: rgba(52, 211, 153, 0.4);
      font-weight: bold;
    }
    .op-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.5;
      flex: 1;
      margin: 0;
    }
    .use-cases {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .use-case-tag {
      font-size: 0.78rem;
      color: var(--text-dim);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-subtle);
    }
    .difficulty-tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .diff-beginner { color: var(--accent-emerald); }
    .diff-intermediate { color: var(--accent-amber); }
    .diff-advanced { color: var(--accent-purple); }
    .explore-link {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .explore-link:hover {
      transform: translateX(4px);
      text-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
    }
  `]
})
export class OperatorCardComponent {
  @Input({ required: true }) operator!: OperatorDefinition;
  @Input() isCompleted = false;
  @Input() isFavorite = false;
  @Output() toggleCompleted = new EventEmitter<string>();
  @Output() toggleFavorite = new EventEmitter<string>();
}
