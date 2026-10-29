import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { LiveActivityFeedScenarioComponent } from './live-activity-feed-scenario.component';
import { provideRouter } from '@angular/router';

describe('LiveActivityFeedScenarioComponent', () => {
  let component: LiveActivityFeedScenarioComponent;
  let fixture: ComponentFixture<LiveActivityFeedScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveActivityFeedScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LiveActivityFeedScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the live activity feed component', () => {
    expect(component).toBeTruthy();
  });

  it('should micro-batch incoming events in bufferTime and accumulate with scan', fakeAsync(() => {
    component.bufferTimeWindowMs = 200;
    component.startFeedPipeline();

    // Inject burst into manual subject
    component.injectBurst();

    // Advance 250ms for bufferTime window to close and flush batch
    tick(250);

    expect(component.stats.batchesProcessed).toBeGreaterThanOrEqual(1);
    expect(component.stats.totalReceived).toBeGreaterThanOrEqual(10);
    expect(component.allEvents.length).toBeGreaterThanOrEqual(10);

    discardPeriodicTasks();
  }));

  it('should filter stream display by severity', fakeAsync(() => {
    component.bufferTimeWindowMs = 200;
    component.startFeedPipeline();

    component.injectBurst();
    tick(250);

    component.setSeverityFilter('critical');
    const criticalItems = component.filteredFeed;
    expect(criticalItems.every(i => i.severity === 'critical')).toBeTrue();

    discardPeriodicTasks();
  }));

  it('should cleanly unsubscribe stream on ngOnDestroy (takeUntil)', fakeAsync(() => {
    component.ngOnDestroy();
    // Advance time after destroy - no new events processed
    const countBefore = component.stats.totalReceived;
    tick(2000);
    expect(component.stats.totalReceived).toBe(countBefore);

    discardPeriodicTasks();
  }));
});
