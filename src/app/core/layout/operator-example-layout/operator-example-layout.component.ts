import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OperatorDefinition } from '../../../features/operators/operator.model';
import { OperatorCatalogService } from '../../services/operator-catalog.service';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { EventTimelineComponent } from '../../../shared/components/event-timeline/event-timeline.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-operator-example-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CodeViewerComponent,
    OutputConsoleComponent,
    EventTimelineComponent
  ],
  template: `
    <div class="example-layout">
      <!-- Breadcrumbs & Header -->
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/catalog" class="crumb-link">Operators</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-cat">{{ operator.category }}</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">{{ operator.name }}</span>
        </div>

        <div class="title-row">
          <div class="title-left">
            <h1 class="operator-title">
              <code>{{ operator.name }}</code>
            </h1>
            <div class="meta-tags">
              <span class="badge" [ngClass]="'badge-' + operator.category">{{ operator.category }}</span>
              <span class="badge badge-creation">{{ operator.difficulty | uppercase }}</span>
              @if (operator.status === 'deprecated') {
                <span class="badge badge-error-handling">DEPRECATED</span>
              }
            </div>
          </div>

          <div class="title-actions">
            <button 
              class="action-btn" 
              [class.active]="isFavorite" 
              (click)="toggleFavorite.emit()">
              {{ isFavorite ? '★ Favorited' : '☆ Favorite' }}
            </button>
            <button 
              class="action-btn success-btn" 
              [class.active]="isCompleted" 
              (click)="toggleCompleted.emit()">
              {{ isCompleted ? '✓ Completed' : 'Mark Completed' }}
            </button>
            <a [href]="operator.officialDocsUrl" target="_blank" rel="noopener noreferrer" class="action-btn link-btn">
              Official Docs ↗
            </a>
          </div>
        </div>

        <p class="operator-desc">{{ operator.description }}</p>

        <!-- Tutorial Guide & Instructions -->
        <div class="tutorial-guide">
          <div class="guide-header">
            <span class="guide-icon">📖</span>
            <strong>How to Use This Lab & Verify Operator Behavior</strong>
          </div>
          <div class="guide-steps">
            <div class="step-card">
              <span class="step-num">1</span>
              <div>
                <strong>Interactive Controls</strong>
                <p>Adjust inputs, delays, or debouncing parameters below to customize the source Observable stream.</p>
              </div>
            </div>
            <div class="step-card">
              <span class="step-num">2</span>
              <div>
                <strong>Run & Execute</strong>
                <p>Click <span class="badge badge-creation">▶ Run Stream</span> or type in the input. The actual TypeScript pipeline executes in real time.</p>
              </div>
            </div>
            <div class="step-card">
              <span class="step-num">3</span>
              <div>
                <strong>Verify Telemetry</strong>
                <p>Check the <em>Event Timeline</em> and <em>Telemetry Console</em> to verify emitted values, cancellation, errors, and unsubscription lifecycles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Playground Container -->
      <div class="playground-grid">
        <!-- Left: Interactive Controls and Scenario Content -->
        <div class="left-col">
          <div class="control-box glass-panel">
            <div class="box-header">
              <h3 class="box-title">Interactive Controls</h3>
              <div class="run-actions">
                <button class="run-btn" (click)="run.emit()" [disabled]="isRunning">
                  {{ isRunning ? '⚡ Running...' : '▶ Run Stream' }}
                </button>
                <button class="reset-btn" (click)="reset.emit()" [disabled]="isRunning">
                  Reset
                </button>
              </div>
            </div>
            <div class="box-body">
              <ng-content select="[controls]"></ng-content>
            </div>
          </div>

          <!-- Code View -->
          <app-code-viewer [code]="code" [title]="operator.name + ' Executable Pipeline'" />

          <!-- Code Description & Line-by-Line Breakdown Slot -->
          <div class="code-breakdown-box glass-panel slot-wrapper">
            <div class="section-badge-header">
              <span class="badge badge-creation">CODE WALKTHROUGH</span>
              <h3 class="box-title">Pipeline Architecture & Logic Breakdown</h3>
            </div>
            <div class="breakdown-body">
              <ng-content select="[code-description]"></ng-content>
            </div>
          </div>

          <!-- Deep-dive Explanation Section -->
          <div class="explanation-box glass-panel">
            <div class="section-badge-header">
              <span class="badge badge-transformation">ENTERPRISE ARCHITECTURE</span>
              <h3 class="box-title">Deep-Dive & Production Resilience</h3>
            </div>
            <div class="explanation-body">
              <ng-content select="[explanation]"></ng-content>
            </div>
          </div>

          <!-- Real World Enterprise Example Slot -->
          <div class="real-world-box glass-panel slot-wrapper">
            <div class="section-badge-header">
              <span class="badge badge-utility">PRODUCTION EXAMPLE</span>
              <h3 class="box-title">Real-World Enterprise Pattern & Topology</h3>
            </div>
            <div class="real-world-body">
              <ng-content select="[real-world]"></ng-content>
            </div>
          </div>
        </div>

        <!-- Right: Execution Feedback (Console & Timeline) -->
        <div class="right-col">
          <app-event-timeline [events]="events" />
          <app-output-console 
            [events]="events" 
            [isRunning]="isRunning" 
            (clear)="clearEvents.emit()" 
          />

          <!-- Common Pitfalls & Related Operators -->
          <div class="related-box glass-panel">
            <h4 class="box-title">Related Operators & Comparisons</h4>
            <div class="related-tags">
              @for (rel of operator.relatedOperators; track rel) {
                <a [routerLink]="['/operators', resolveRelatedId(rel)]" class="rel-tag">
                  {{ resolveRelatedName(rel) }} →
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-layout {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .header-card {
      padding: 1.85rem;
      border-radius: 22px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-lg);
    }
    .nav-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.84rem;
      color: var(--text-dim);
    }
    .crumb-link {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s;
    }
    .crumb-link:hover { color: var(--accent-cyan); }
    .crumb-current { color: var(--text-main); font-weight: 700; }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .title-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .operator-title {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0;
      color: var(--text-main);
    }
    .operator-title code {
      color: var(--accent-cyan);
      text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
    }
    .meta-tags {
      display: flex;
      gap: 0.5rem;
    }
    .title-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }
    .action-btn {
      background: var(--bg-recessed);
      border: 1px solid var(--border-medium);
      border-top: 1px solid var(--border-specular);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .action-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .action-btn.active {
      color: var(--accent-amber);
      border-color: rgba(251, 191, 36, 0.5);
      background: rgba(251, 191, 36, 0.12);
    }
    .success-btn.active {
      background: rgba(52, 211, 153, 0.15);
      color: var(--accent-emerald);
      border-color: rgba(52, 211, 153, 0.5);
    }
    .link-btn {
      color: var(--accent-cyan);
      border-color: rgba(56, 189, 248, 0.4);
      background: rgba(56, 189, 248, 0.08);
    }
    .link-btn:hover {
      background: rgba(56, 189, 248, 0.18);
      color: var(--accent-cyan);
    }
    .operator-desc {
      font-size: 1rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
    }
    .tutorial-guide {
      margin-top: 0.5rem;
      padding: 1.1rem 1.35rem;
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .guide-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--accent-indigo);
    }
    .guide-steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    @media (max-width: 768px) {
      .guide-steps { grid-template-columns: 1fr; }
    }
    .step-card {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      background: var(--bg-card);
      padding: 0.85rem 1rem;
      border-radius: 12px;
      font-size: 0.82rem;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }
    .step-num {
      width: 24px;
      height: 24px;
      min-width: 24px;
      border-radius: 50%;
      background: var(--accent-indigo);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .step-card strong {
      color: var(--text-main);
      display: block;
      margin-bottom: 2px;
      font-weight: 700;
    }
    .step-card p {
      color: var(--text-muted);
      line-height: 1.45;
      margin: 0;
    }
    .playground-grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 1024px) {
      .playground-grid {
        grid-template-columns: 1fr;
      }
    }
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: sticky;
      top: 1rem;
      align-self: flex-start;
      height: fit-content;
    }
    .control-box, .explanation-box, .code-breakdown-box, .real-world-box, .related-box {
      padding: 1.5rem;
      border-radius: 18px;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-md);
    }
    .section-badge-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .breakdown-body, .real-world-body, .explanation-body {
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.65;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .slot-wrapper:has(.breakdown-body:empty), .slot-wrapper:has(.real-world-body:empty) {
      display: none;
    }
    .box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .box-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.015em;
      margin: 0;
    }
    .run-actions {
      display: flex;
      gap: 0.6rem;
    }
    .run-btn {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-theme="dark"] .run-btn {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
    }
    .run-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
    }
    .run-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .reset-btn {
      background: var(--bg-recessed);
      border: 1px solid var(--border-medium);
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reset-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
      border-color: var(--border-focus);
    }
    .related-tags {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }
    .rel-tag {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-decoration: none;
      padding: 6px 12px;
      background: rgba(56, 189, 248, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .rel-tag:hover {
      background: rgba(56, 189, 248, 0.2);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
  `]
})
export class OperatorExampleLayoutComponent {
  private readonly catalogService = inject(OperatorCatalogService);

  @Input({ required: true }) operator!: OperatorDefinition;
  @Input() code = '';
  @Input() events: StreamEvent[] = [];
  @Input() isRunning = false;
  @Input() isFavorite = false;
  @Input() isCompleted = false;

  @Output() run = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() clearEvents = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() toggleCompleted = new EventEmitter<void>();

  resolveRelatedId(nameOrId: string): string {
    const found = this.catalogService.getOperatorById(nameOrId);
    return found ? found.id : nameOrId;
  }

  resolveRelatedName(nameOrId: string): string {
    const found = this.catalogService.getOperatorById(nameOrId);
    return found ? found.name : nameOrId;
  }
}
