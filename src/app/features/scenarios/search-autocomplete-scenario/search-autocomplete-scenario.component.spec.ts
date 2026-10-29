import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchAutocompleteScenarioComponent } from './search-autocomplete-scenario.component';
import { provideRouter } from '@angular/router';

describe('SearchAutocompleteScenarioComponent', () => {
  let component: SearchAutocompleteScenarioComponent;
  let fixture: ComponentFixture<SearchAutocompleteScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAutocompleteScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchAutocompleteScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the search autocomplete component', () => {
    expect(component).toBeTruthy();
  });

  it('should debounce input and fetch articles after 300ms', fakeAsync(() => {
    component.searchControl.setValue('switchMap');

    // 100ms: Still debouncing
    tick(100);
    expect(component.results.length).toBe(0);

    // Advance 300ms (debounce) + 300ms (mock network delay)
    tick(600);

    expect(component.results.length).toBeGreaterThan(0);
    const hasMatch = component.results.some(r => r.title.includes('switchMap') || r.snippet.includes('switchMap'));
    expect(hasMatch).toBeTrue();
    expect(component.isLoading).toBeFalse();
  }));

  it('should cancel in-flight request when user continues typing (switchMap)', fakeAsync(() => {
    // Disable debounce delay so queries dispatch immediately
    component.debounceTimeMs = 0;
    component.bindSearchPipeline();

    // 1. Initial query starts mockData.searchArticles delay(300)
    component.searchControl.setValue('sw');
    tick(50); // In-flight at 50ms (delay is 300ms)

    // 2. Second query arrives before first finishes (50ms < 300ms)
    component.searchControl.setValue('switchMap');
    tick(10); // switchMap immediately cancels 'sw'

    expect(component.cancelledCount).toBeGreaterThan(0);

    // 3. Complete the second request (300ms)
    tick(350);
    expect(component.results.length).toBeGreaterThan(0);
  }));

  it('should gracefully handle errors without breaking future searches', fakeAsync(() => {
    component.simulateServerDown = true;
    component.searchControl.setValue('stream');

    tick(650);

    // Error caught inside switchMap
    expect(component.errorMessage).toContain('Remote Search Cluster Unavailable');
    expect(component.results.length).toBe(0);
    expect(component.isLoading).toBeFalse();

    // Now restore server and type new term
    component.simulateServerDown = false;
    component.searchControl.setValue('cache');
    tick(650);

    // Stream is still alive and successfully receives results!
    expect(component.errorMessage).toBeNull();
    expect(component.results.length).toBeGreaterThan(0);
  }));
});
