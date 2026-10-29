import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamEvent } from './stream-event.model';

@Component({
  selector: 'app-output-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="console-card glass-panel">
      <div class="console-header">
        <div class="console-title">
          <span class="status-indicator" [class.active]="isRunning"></span>
          <span>Stream Output & Telemetry</span>
          <span class="event-count badge badge-creation">{{ events.length }} events</span>
        </div>
        <div class="console-actions">
          <button class="clear-btn" (click)="clear.emit()" [disabled]="events.length === 0">
            Clear Output
          </button>
        </div>
      </div>

      <div class="console-body">
        @if (events.length === 0) {
          <div class="empty-state">
            <span class="empty-icon">⏳</span>
            <p>No stream events yet. Click Run or trigger an action to execute the observable pipeline.</p>
          </div>
        } @else {
          <div class="event-list">
            @for (item of events; track item.id; let idx = $index) {
              <div class="event-row" [ngClass]="'type-' + item.type">
                <span class="event-idx">#{{ idx + 1 }}</span>
                <span class="event-time">+{{ item.timestamp }}ms</span>
                <span class="event-badge badge" [ngClass]="getBadgeClass(item.type)">
                  {{ item.type | uppercase }}
                </span>
                <span class="event-content">
                  @if (item.type === 'next') {
                    <code>{{ formatValue(item.value) }}</code>
                  } @else if (item.type === 'error') {
                    <span class="error-text">❌ {{ item.value?.message || item.value || 'Stream Error' }}</span>
                  } @else if (item.type === 'complete') {
                    <span class="complete-text">🏁 Stream Completed</span>
                  } @else if (item.type === 'subscribe') {
                    <span class="lifecycle-text">🟢 Subscribed</span>
                  } @else if (item.type === 'unsubscribe') {
                    <span class="lifecycle-text">🔴 Unsubscribed / Teardown</span>
                  }
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .console-card {
      margin: 0;
      width: 100%;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      box-shadow: var(--shadow-md);
    }
    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 1.25rem;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid var(--border-subtle);
    }
    .console-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .status-indicator {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--text-dim);
      transition: all 0.25s;
    }
    .status-indicator.active {
      background: var(--accent-emerald);
      box-shadow: 0 0 10px var(--accent-emerald);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }
    .clear-btn {
      background: var(--bg-recessed);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .clear-btn:hover:not(:disabled) {
      background: rgba(244, 63, 94, 0.15);
      color: var(--accent-rose);
      border-color: rgba(244, 63, 94, 0.35);
      transform: scale(1.04);
    }
    .clear-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .console-body {
      padding: 1rem 1.25rem;
      min-height: 220px;
      max-height: 400px;
      overflow-y: auto;
      font-family: var(--font-mono);
      font-size: 0.86rem;
      background: var(--bg-recessed);
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-dim);
      padding: 3rem 1.5rem;
      text-align: center;
      font-family: var(--font-sans);
      gap: 0.6rem;
      min-height: 180px;
    }
    .empty-icon {
      font-size: 1.8rem;
    }
    .event-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .event-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-left: 4px solid transparent;
      box-shadow: var(--shadow-sm);
    }
    .event-row.type-next { border-left-color: var(--accent-cyan); }
    .event-row.type-complete { border-left-color: var(--accent-emerald); }
    .event-row.type-error { border-left-color: var(--accent-rose); background: rgba(244, 63, 94, 0.08); }
    .event-row.type-subscribe { border-left-color: var(--accent-indigo); }
    .event-row.type-unsubscribe { border-left-color: var(--accent-amber); }

    .event-idx { color: var(--text-dim); font-size: 0.75rem; width: 28px; font-weight: 700; }
    .event-time { color: var(--text-dim); font-size: 0.75rem; width: 68px; font-weight: 600; }
    .event-content { flex: 1; word-break: break-all; color: var(--text-main); font-weight: 600; }
    .event-content code { color: var(--accent-cyan); }
    .error-text { color: var(--accent-rose); font-weight: 700; }
    .complete-text { color: var(--accent-emerald); font-weight: 700; }
    .lifecycle-text { color: var(--text-muted); font-weight: 600; }
  `]
})
export class OutputConsoleComponent {
  @Input() events: StreamEvent[] = [];
  @Input() isRunning = false;
  @Output() clear = new EventEmitter<void>();

  getBadgeClass(type: string): string {
    switch (type) {
      case 'next': return 'badge-creation';
      case 'complete': return 'badge-filtering';
      case 'error': return 'badge-error-handling';
      case 'subscribe': return 'badge-transformation';
      case 'unsubscribe': return 'badge-utility';
      default: return 'badge-legacy';
    }
  }

  formatValue(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }
}
