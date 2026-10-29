import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError, finalize, tap } from 'rxjs/operators';
import { MockDataService, SearchResultItem } from '../../../core/services/mock-data.service';
import { CodeViewerComponent } from '../../../shared/components/code-viewer/code-viewer.component';
import { OutputConsoleComponent } from '../../../shared/components/output-console/output-console.component';
import { StreamEvent } from '../../../shared/components/output-console/stream-event.model';

@Component({
  selector: 'app-search-autocomplete-scenario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, CodeViewerComponent, OutputConsoleComponent],
  template: `
    <div class="scenario-page">
      <div class="header-card glass-panel">
        <div class="nav-breadcrumbs">
          <a routerLink="/scenarios" class="crumb-link">Enterprise Scenarios</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Scenario A: Search Autocomplete</span>
        </div>
        <div class="header-content">
          <div class="title-section">
            <span class="badge badge-scenario">SCENARIO A • ENTERPRISE PATTERN</span>
            <h1 class="scenario-title">Debounced Search & Typeahead Autocomplete</h1>
            <p class="scenario-subtitle">
              Demonstrates <strong>keystroke debouncing</strong>, <strong>duplicate term suppression</strong>, <strong>in-flight request cancellation (switchMap)</strong>, <strong>isolated catchError</strong>, and guaranteed <strong>loading state teardown (finalize)</strong>.
            </p>
          </div>
          <div class="operators-chips">
            <span class="op-chip">debounceTime(300)</span>
            <span class="op-chip">distinctUntilChanged()</span>
            <span class="op-chip">filter(min 2 chars)</span>
            <span class="op-chip">switchMap()</span>
            <span class="op-chip">catchError()</span>
            <span class="op-chip">finalize()</span>
          </div>
        </div>
      </div>

      <div class="workspace-grid">
        <!-- Live Interactive Component -->
        <div class="live-surface glass-panel">
          <div class="surface-header">
            <h3>🔎 Live Autocomplete Widget</h3>
            <div class="controls-toggles">
              <label class="toggle-option">
                <input type="checkbox" [(ngModel)]="simulateServerDown" />
                <span>Simulate Remote 503 Outage</span>
              </label>
            </div>
          </div>

          <div class="search-input-wrapper">
            <input 
              type="text" 
              [formControl]="searchControl" 
              class="search-box" 
              placeholder="Type to search (e.g., 'switchMap', 'stream', 'cache')..."
            />
            @if (isLoading) {
              <div class="spinner-inline">⏳ Searching...</div>
            }
          </div>

          @if (errorMessage) {
            <div class="error-banner">
              ⚠️ {{ errorMessage }} (Isolated: future searches still work!)
            </div>
          }

          <div class="results-container">
            <div class="results-meta">
              <span>Matching Articles: <strong>{{ results.length }}</strong></span>
              <span>Cancelled In-Flight Queries: <strong class="cancel-count">{{ cancelledCount }}</strong></span>
            </div>

            @if (results.length > 0) {
              <div class="results-list">
                @for (item of results; track item.id) {
                  <div class="result-card">
                    <div class="result-top">
                      <span class="result-category">{{ item.category }}</span>
                      <span class="match-score">{{ item.matchScore }}% match</span>
                    </div>
                    <h4 class="result-title">{{ item.title }}</h4>
                    <p class="result-snippet">{{ item.snippet }}</p>
                  </div>
                }
              </div>
            } @else if (searchControl.value && searchControl.value.length >= 2 && !isLoading && !errorMessage) {
              <div class="empty-state">
                No matching articles found for "{{ searchControl.value }}".
              </div>
            }
          </div>

          <div class="verification-guide">
            <strong>🔍 How to Verify Enterprise Guarantees:</strong>
            <ol>
              <li><strong>Debounce & Min Length:</strong> Type single letters quickly; notice requests are held back until 300ms of inactivity passes and query is &ge; 2 characters.</li>
              <li><strong>Cancellation (Latest-Wins):</strong> Type "sw", then quickly type "stream". In the telemetry console, notice the first HTTP call is <strong>cancelled mid-flight</strong> by <code>switchMap</code> without UI race conditions!</li>
              <li><strong>Resilient Isolation:</strong> Check <em>"Simulate Remote 503 Outage"</em> and search. The error is displayed, but subsequent searches still execute cleanly because <code>catchError</code> is inside the <code>switchMap</code>!</li>
            </ol>
          </div>
        </div>

        <!-- Telemetry & Code -->
        <div class="telemetry-column">
          <div class="glass-panel console-container">
            <app-output-console [events]="events" (clear)="events = []" />
          </div>

          <div class="glass-panel code-container">
            <app-code-viewer [code]="codeSnippet" title="Enterprise Typeahead Pipeline" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scenario-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; }
    .nav-breadcrumbs { font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.75rem; font-family: var(--font-mono); }
    .crumb-link { color: var(--text-muted); text-decoration: none; }
    .crumb-link:hover { color: #38bdf8; }
    .crumb-sep { margin: 0 0.5rem; }
    .crumb-current { color: #38bdf8; font-weight: 600; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .badge-scenario { background: rgba(99, 102, 241, 0.15); border: 1px solid var(--accent-indigo); color: var(--accent-indigo); font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-weight: 700; margin-bottom: 0.5rem; display: inline-block; }
    .scenario-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 0.4rem; color: var(--text-main); }
    .scenario-subtitle { font-size: 0.9rem; color: var(--text-muted); margin: 0; max-width: 750px; line-height: 1.5; }
    .operators-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; max-width: 320px; }
    .op-chip { font-family: var(--font-mono); font-size: 0.75rem; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--accent-cyan); padding: 3px 8px; border-radius: 4px; }
    .workspace-grid { display: grid; grid-template-columns: 1fr 1.05fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .workspace-grid { grid-template-columns: 1fr; } }
    .live-surface { display: flex; flex-direction: column; gap: 1rem; }
    .surface-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .surface-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
    .toggle-option { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); cursor: pointer; }
    .toggle-option input { accent-color: #f43f5e; }
    .search-input-wrapper { position: relative; width: 100%; }
    .search-box { width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 12px 16px; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; }
    .search-box:focus { outline: none; border-color: var(--accent-indigo); }
    .spinner-inline { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--accent-amber); }
    .error-banner { background: rgba(244, 63, 94, 0.1); border: 1px solid #f43f5e; color: #f43f5e; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.85rem; }
    .results-meta { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-dim); }
    .cancel-count { color: #f43f5e; }
    .results-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 340px; overflow-y: auto; padding-right: 4px; }
    .result-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.85rem 1rem; transition: border-color 0.2s; }
    .result-card:hover { border-color: var(--accent-indigo); }
    .result-top { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem; }
    .result-category { color: var(--accent-cyan); font-weight: 600; text-transform: uppercase; font-family: var(--font-mono); }
    .match-score { color: var(--accent-emerald); }
    .result-title { margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--text-main); }
    .result-snippet { margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }
    .empty-state { text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.85rem; }
    .verification-guide { font-size: 0.8rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-subtle); border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .verification-guide strong { color: var(--accent-emerald); }
    .verification-guide ol { padding-left: 1.25rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin: 0; }
    .telemetry-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .console-container, .code-container { padding: 1rem; }
  `]
})
export class SearchAutocompleteScenarioComponent implements OnInit, OnDestroy {
  private readonly mockData = inject(MockDataService);

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  results: SearchResultItem[] = [];
  events: StreamEvent[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  cancelledCount = 0;
  simulateServerDown = false;
  debounceTimeMs = 300;

  private sub?: Subscription;
  private startTime = Date.now();
  private inFlightQuery?: string;

  readonly codeSnippet = `// Production Typeahead Autocomplete Pipeline
this.searchControl.valueChanges.pipe(
  debounceTime(300),                      // 1. Wait for quiet typing window
  distinctUntilChanged(),                 // 2. Ignore duplicate terms (arrow keys, etc.)
  filter(query => query.trim().length >= 2), // 3. Enforce query threshold
  tap(query => {
    this.isLoading.set(true);
    this.errorMessage.set(null);
  }),
  switchMap(query =>                      // 4. Cancel in-flight request when new term arrives!
    this.api.search(query).pipe(
      catchError(err => {                 // 5. CRITICAL: Catch INSIDE switchMap to isolate outer stream
        this.errorMessage.set(err.message);
        return of([]);                    // Return empty fallback array
      }),
      finalize(() => this.isLoading.set(false)) // 6. Guaranteed loading indicator teardown
    )
  )
).subscribe(results => this.results.set(results));`;

  ngOnInit(): void {
    this.bindSearchPipeline();
  }

  bindSearchPipeline(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.record('subscribe', 'Typeahead stream listening to searchControl.valueChanges');

    this.sub = this.searchControl.valueChanges.pipe(
      tap(text => this.record('subscribe', `Keystroke detected: "${text}"`)),
      debounceTime(this.debounceTimeMs),
      distinctUntilChanged(),
      filter(query => {
        const isValid = query.trim().length >= 2;
        if (!isValid && query.trim().length > 0) {
          this.record('subscribe', `[filter dropped] Query "${query}" < 2 characters threshold`);
        }
        return isValid;
      }),
      tap(query => {
        this.isLoading = true;
        this.errorMessage = null;
        this.record('subscribe', `[HTTP Dispatched] GET /api/articles?q=${encodeURIComponent(query)}`);
      }),
      switchMap((query: string) =>
        this.mockData.searchArticles(query, this.simulateServerDown).pipe(
          tap({
            unsubscribe: () => {
              this.cancelledCount++;
              this.record('unsubscribe', `[switchMap CANCELLED in-flight query: "${query}"]`);
            }
          }),
          catchError((err: Error) => {
            this.errorMessage = err.message;
            this.record('error', `[catchError isolated] ${err.message}`);
            return of([] as SearchResultItem[]);
          }),
          finalize(() => {
            this.isLoading = false;
            this.record('complete', '[finalize] Loading indicator reset (isLoading = false)');
          })
        )
      )
    ).subscribe({
      next: (items: SearchResultItem[]) => {
        this.results = items;
        this.record('next', { count: items.length, articles: items.map((i: SearchResultItem) => i.title) });
      },
      error: (err: Error) => {
        this.record('error', `Outer stream died (Fatal): ${err?.message || err}`);
      }
    });
  }

  private record(type: any, value?: any): void {
    this.events.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now() - this.startTime,
      type,
      value
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
