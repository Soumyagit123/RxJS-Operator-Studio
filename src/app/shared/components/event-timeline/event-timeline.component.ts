import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamEvent } from '../output-console/stream-event.model';

@Component({
  selector: 'app-event-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container glass-panel">
      <div class="timeline-header">
        <span class="timeline-title">Event Timeline (Virtual / Clock Time)</span>
        <span class="timeline-sub">0ms ───────────────► t</span>
      </div>
      
      <div class="timeline-track">
        @if (events.length === 0) {
          <div class="no-events-line">Stream idle</div>
        } @else {
          <div class="axis-line"></div>
          <div class="nodes-wrapper">
            @for (event of events; track event.id) {
              <div class="timeline-node" [ngClass]="'node-' + event.type" [title]="getTooltip(event)">
                <div class="node-icon">
                  @if (event.type === 'next') { ● }
                  @else if (event.type === 'complete') { | }
                  @else if (event.type === 'error') { ✕ }
                  @else if (event.type === 'subscribe') { ▷ }
                  @else if (event.type === 'unsubscribe') { ◁ }
                </div>
                <div class="node-label">
                  @if (event.type === 'next') {
                    {{ formatShort(event.value) }}
                  } @else {
                    {{ event.type }}
                  }
                </div>
                <div class="node-time">{{ event.timestamp }}ms</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      margin: 0;
      width: 100%;
      padding: 1.1rem 1.4rem;
      border-radius: 18px;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      box-shadow: var(--shadow-md);
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      font-size: 0.82rem;
      color: var(--text-dim);
    }
    .timeline-title {
      font-weight: 700;
      color: var(--text-main);
    }
    .timeline-sub {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    .timeline-track {
      position: relative;
      min-height: 80px;
      display: flex;
      align-items: center;
      overflow-x: auto;
      padding: 12px 0;
      background: var(--bg-recessed);
      border-radius: 14px;
      border: 1px solid var(--border-subtle);
    }
    .axis-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-indigo), transparent);
      top: 28px;
      z-index: 1;
    }
    .nodes-wrapper {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      position: relative;
      z-index: 2;
      padding: 0 1.25rem;
    }
    .timeline-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: default;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .timeline-node:hover {
      transform: translateY(-3px) scale(1.08);
    }
    .node-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      border: 2px solid var(--border-subtle);
      font-weight: 800;
      box-shadow: var(--shadow-sm);
    }
    .node-next .node-icon {
      background: rgba(56, 189, 248, 0.2);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
    }
    .node-complete .node-icon {
      background: rgba(52, 211, 153, 0.2);
      border-color: var(--accent-emerald);
      color: var(--accent-emerald);
      border-radius: 8px;
      box-shadow: 0 0 12px rgba(52, 211, 153, 0.3);
    }
    .node-error .node-icon {
      background: rgba(251, 113, 133, 0.2);
      border-color: var(--accent-rose);
      color: var(--accent-rose);
      box-shadow: 0 0 12px rgba(251, 113, 133, 0.3);
    }
    .node-subscribe .node-icon {
      background: rgba(129, 140, 248, 0.2);
      border-color: var(--accent-indigo);
      color: var(--accent-indigo);
      box-shadow: 0 0 12px rgba(129, 140, 248, 0.3);
    }
    .node-unsubscribe .node-icon {
      background: rgba(251, 191, 36, 0.2);
      border-color: var(--accent-amber);
      color: var(--accent-amber);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
    }
    .node-label {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 700;
      margin-top: 6px;
      color: var(--text-main);
      max-width: 68px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .node-time {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-dim);
      font-family: var(--font-mono);
    }
    .no-events-line {
      width: 100%;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-dim);
      font-weight: 600;
    }
  `]
})
export class EventTimelineComponent {
  @Input() events: StreamEvent[] = [];

  formatShort(value: any): string {
    if (value === undefined) return 'undef';
    if (value === null) return 'null';
    if (typeof value === 'object') return '{..}';
    const str = String(value);
    return str.length > 8 ? str.slice(0, 7) + '…' : str;
  }

  getTooltip(event: StreamEvent): string {
    return `${event.type.toUpperCase()} at +${event.timestamp}ms: ${JSON.stringify(event.value ?? '')}`;
  }
}
