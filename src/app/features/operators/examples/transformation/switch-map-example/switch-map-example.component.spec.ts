import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { SwitchMapExampleComponent } from './switch-map-example.component';
import { provideRouter } from '@angular/router';

describe('SwitchMapExampleComponent', () => {
  let component: SwitchMapExampleComponent;
  let fixture: ComponentFixture<SwitchMapExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwitchMapExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchMapExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "switch-map"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('switch-map');
    expect(component.operator?.name).toBe('switchMap');
  });

  it('should cancel previous inner observable when new query arrives before delay completes', fakeAsync(() => {
    component.updateDebounce(0); // immediate dispatch without 150ms debounce
    component.mockDelayMs = 200;

    // First query
    component.onQueryInput('Term1');
    tick(50); // inner stream running

    // Second query arrives before 200ms
    component.onQueryInput('Term2');
    tick(50);

    // Check cancellation event was logged
    const unsubs = component.events.filter(e => e.type === 'unsubscribe');
    expect(unsubs.length).toBeGreaterThanOrEqual(1);

    // Let the second complete and flush zone timers
    tick(250);

    const nexts = component.events.filter(e => e.type === 'next' && typeof e.value === 'object');
    expect(nexts.length).toBe(1);
    expect(nexts[0].value.query).toBe('Term2');

    component.ngOnDestroy();
    discardPeriodicTasks();
  }));
});
