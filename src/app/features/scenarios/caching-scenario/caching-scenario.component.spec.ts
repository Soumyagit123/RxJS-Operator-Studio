import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CachingScenarioComponent } from './caching-scenario.component';
import { provideRouter } from '@angular/router';

describe('CachingScenarioComponent', () => {
  let component: CachingScenarioComponent;
  let fixture: ComponentFixture<CachingScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CachingScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CachingScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the caching scenario component', () => {
    expect(component).toBeTruthy();
  });

  it('should deduplicate simultaneous requests into a single physical network call via shareReplay', fakeAsync(() => {
    // 3 concurrent consumers request at once
    component.requestAllSimultaneously();

    // Advance timer(200) network latency
    tick(200);

    expect(component.totalConsumerRequests).toBe(3);
    expect(component.physicalNetworkCalls).toBe(1); // Only 1 physical HTTP request!
    expect(component.consumerAData).toBeTruthy();
    expect(component.consumerBData).toBeTruthy();
    expect(component.consumerCData).toBeTruthy();
  }));

  it('should serve subsequent requests from cache within TTL window', fakeAsync(() => {
    component.ttlSeconds = 5;

    // First request: hits network
    component.requestData('Consumer A');
    tick(200);
    expect(component.physicalNetworkCalls).toBe(1);

    // Second request after 1 second (within 5s TTL): hits cache!
    tick(1000);
    component.requestData('Consumer B');
    tick(200);

    expect(component.physicalNetworkCalls).toBe(1);
    expect(component.cacheHits).toBe(1);
  }));

  it('should re-fetch from network when cache is explicitly invalidated', fakeAsync(() => {
    component.requestData('Consumer A');
    tick(200);
    expect(component.physicalNetworkCalls).toBe(1);

    // Invalidate
    component.invalidateCache();
    expect(component.isCacheValid()).toBeFalse();

    // Next request triggers new physical HTTP call
    component.requestData('Consumer B');
    tick(200);
    expect(component.physicalNetworkCalls).toBe(2);
  }));
});
