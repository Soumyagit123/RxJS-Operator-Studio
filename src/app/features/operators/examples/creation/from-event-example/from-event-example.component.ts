import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperatorCatalogService } from '../../../../../core/services/operator-catalog.service';
import { OperatorDefinition } from '../../../operator.model';
import { OperatorExampleLayoutComponent } from '../../../../../core/layout/operator-example-layout/operator-example-layout.component';
import { StreamEvent } from '../../../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-from-event-example',
  standalone: true,
  imports: [CommonModule, OperatorExampleLayoutComponent],
  template: `
    @if (operator) {
      <app-operator-example-layout
        [operator]="operator"
        [code]="codeSnippet"
        [events]="events"
        [isRunning]="isRunning"
        [isFavorite]="catalogService.isFavorite(operator.id)"
        [isCompleted]="catalogService.isCompleted(operator.id)"
        (run)="executeStream()"
        (reset)="resetStream()"
        (clearEvents)="events = []"
        (toggleFavorite)="catalogService.toggleFavorite(operator.id)"
        (toggleCompleted)="catalogService.toggleCompleted(operator.id)"
      >
        <div controls class="controls-panel">
          <div class="tutorial-instructions">
            <strong>🎯 Purpose of Interactive Controls:</strong>
            <p>
              <code>fromEvent(target, eventName)</code> bridges DOM events, Node EventEmitter instances, or custom target events into an RxJS Observable stream.
            </p>
          </div>

          <div class="interactive-surface glass-panel" #interactiveArea>
            <span class="surface-hint">🖱️ Move Mouse / Click Inside This Target Box</span>
            <div class="crosshair-telemetry">
              <span>Last Coordinate: <strong>({{ lastCoords.x }}, {{ lastCoords.y }})</strong></span>
              <span>Total Intercepted DOM Events: <strong class="counter">{{ eventCount }}</strong></span>
            </div>
          </div>

          <div class="how-to-verify">
            <strong>🔍 How to Check if it's Working:</strong>
            <ol>
              <li>Click <strong>▶ Run Stream</strong> to attach the <code>fromEvent(box, 'mousemove')</code> listener.</li>
              <li>Hover your cursor over the interactive target box above.</li>
              <li>Notice that DOM mouse events are converted directly into structured stream notifications without Angular event bindings.</li>
            </ol>
          </div>
        </div>

        <div code-description class="code-description-box">
          <table class="code-breakdown-table">
            <thead>
              <tr>
                <th>Code Construct</th>
                <th>Enterprise Role & Mechanics</th>
              </tr>
            </thead>
            <tbody>
              <tr class="breakdown-row">
                <td class="code-token"><code>fromEvent(...)</code></td>
                <td class="token-desc">
                  Attaches an <code>addEventListener</code> to the specified DOM element. On unsubscription, automatically executes <code>removeEventListener</code>, avoiding memory leaks.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>map(e =&gt; (&#123; x, y &#125;))</code></td>
                <td class="token-desc">
                  Isolates and plucks the essential coordinate properties from the bulky native DOM event object.
                </td>
              </tr>
              <tr class="breakdown-row">
                <td class="code-token"><code>takeUntilDestroyed()</code></td>
                <td class="token-desc">
                  Angular modern cleanup pattern. Binds DOM listener lifetime to component destruction so unmounted components never retain global event handlers.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div explanation>
          <h4>Enterprise Usage: Clean DOM Decoupling & Reactive Directives</h4>
          <p>
            <code>fromEvent</code> is the standard RxJS way to listen to window resizing, scroll events, keyboard shortcuts, or document-level drag operations in Angular directives and services without polluting component templates.
          </p>

          <div class="callout-warning">
            <strong>⚠️ Critical Pitfall: Listening to Global Objects (window, document)</strong>
            <p>
              When attaching <code>fromEvent(window, 'resize')</code> or <code>fromEvent(document, 'keydown')</code>, failing to unsubscribe when the component unmounts will cause the entire component instance (and its injected services) to be retained in memory permanently! Always pipe with <code>takeUntilDestroyed()</code>.
            </p>
          </div>
        </div>

        <div real-world>
          <div class="production-use-cases">
            <div class="use-case-card">
              <h5>1. Complex Drag-and-Drop Directives</h5>
              <p>
                Composing <code>fromEvent(box, 'mousedown').pipe(switchMap(() =&gt; fromEvent(document, 'mousemove').pipe(takeUntil(fromEvent(document, 'mouseup')))))</code> for smooth dragging with auto-cleanup.
              </p>
            </div>
            <div class="use-case-card">
              <h5>2. Global Keyboard Shortcut Managers</h5>
              <p>
                Listening to <code>fromEvent(window, 'keydown')</code> in a singleton shortcut service to handle <code>Ctrl+K</code> command palette triggers.
              </p>
            </div>
            <div class="use-case-card">
              <h5>3. Window Resize Responsive Layout Handlers</h5>
              <p>
                Pipelining <code>fromEvent(window, 'resize').pipe(debounceTime(150), map(() =&gt; window.innerWidth))</code> to adapt complex grid views.
              </p>
            </div>
          </div>
        </div>
      </app-operator-example-layout>
    }
  `,
  styles: [`
    .controls-panel { display: flex; flex-direction: column; gap: 1rem; }
    .tutorial-instructions { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
    .tutorial-instructions strong { color: var(--text-main); display: block; margin-bottom: 2px; }
    .interactive-surface { border: 2px dashed var(--border-subtle); border-radius: 8px; padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; background: rgba(0, 0, 0, 0.25); cursor: crosshair; transition: border-color 0.2s; min-height: 120px; }
    .interactive-surface:hover { border-color: var(--accent-indigo); }
    .surface-hint { font-size: 0.85rem; color: var(--text-muted); }
    .crosshair-telemetry { display: flex; gap: 1.5rem; font-size: 0.85rem; color: var(--text-dim); }
    .crosshair-telemetry strong { color: var(--text-main); }
    .counter { color: var(--accent-cyan); font-size: 1.1rem; }
    .how-to-verify { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .how-to-verify strong { color: var(--accent-emerald); }
    .how-to-verify ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem; }
  `]
})
export class FromEventExampleComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly catalogService = inject(OperatorCatalogService);

  @ViewChild('interactiveArea') interactiveArea?: ElementRef<HTMLDivElement>;

  operator?: OperatorDefinition;
  events: StreamEvent[] = [];
  isRunning = false;

  lastCoords = { x: 0, y: 0 };
  eventCount = 0;

  private sub?: Subscription;
  private startTime = 0;

  readonly codeSnippet = `// Reactive Window / DOM Event Listener
@ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

ngAfterViewInit(): void {
  fromEvent<MouseEvent>(this.canvas.nativeElement, 'mousemove').pipe(
    map(e => ({ x: e.offsetX, y: e.offsetY })),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(coords => this.drawBrush(coords));
}`;

  ngOnInit(): void {
    this.operator = this.catalogService.getOperatorById('from-event');
  }

  ngAfterViewInit(): void {
    // Delay binding until after initial check cycle to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.executeStream();
    }, 0);
  }

  executeStream(): void {
    this.resetStream();
    if (!this.interactiveArea) return;
    this.isRunning = true;
    this.startTime = Date.now();

    this.record('subscribe', 'Bound fromEvent(interactiveSurface, "mousemove")');

    this.sub = fromEvent<MouseEvent>(this.interactiveArea.nativeElement, 'mousemove').pipe(
      map(e => ({ x: e.offsetX, y: e.offsetY }))
    ).subscribe({
      next: (coords) => {
        this.lastCoords = coords;
        this.eventCount++;
        this.record('next', { ...coords, eventNumber: this.eventCount });
      },
      error: (err) => {
        this.record('error', err);
        this.isRunning = false;
      }
    });
  }

  resetStream(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    this.isRunning = false;
    this.eventCount = 0;
    this.lastCoords = { x: 0, y: 0 };
    this.events = [];
  }

  private record(type: any, value?: any): void {
    this.events.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now() - (this.startTime || Date.now()),
      type,
      value
    });
    // Keep max 25 events in telemetry buffer
    if (this.events.length > 25) {
      this.events.pop();
    }
  }

  ngOnDestroy(): void {
    this.resetStream();
  }
}
