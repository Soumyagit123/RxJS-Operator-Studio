import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResilientApiScenarioComponent } from './reliable-api-scenario.component';
import { provideRouter } from '@angular/router';

describe('ResilientApiScenarioComponent', () => {
  let component: ResilientApiScenarioComponent;
  let fixture: ComponentFixture<ResilientApiScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResilientApiScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ResilientApiScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the resilient api scenario component', () => {
    expect(component).toBeTruthy();
  });

  it('should deliver payload successfully on healthy network', fakeAsync(() => {
    component.simulatedDelayMs = 200;
    component.timeoutMs = 1000;
    component.dispatchRequest();

    tick(200);

    expect(component.successfulDeliveries).toBe(1);
    expect(component.latestResponse).toBeTruthy();
    expect(component.isCalling).toBeFalse();
  }));

  it('should retry transient failures and recover successfully', fakeAsync(() => {
    component.failInitialAttempts = true; // Fails first 2 attempts
    component.maxRetries = 2;
    component.simulatedDelayMs = 100;
    component.timeoutMs = 1500;

    component.dispatchRequest();

    // Attempt 1: 100ms -> fails -> backoff delay 1 * 200 = 200ms
    tick(300);
    expect(component.totalRetriesTriggered).toBeGreaterThanOrEqual(1);

    // Attempt 2: 100ms -> fails -> backoff delay 2 * 200 = 400ms
    tick(500);

    // Attempt 3: 100ms -> succeeds!
    tick(100);

    expect(component.successfulDeliveries).toBe(1);
    expect(component.hasFailed).toBeFalse();
    expect(component.latestResponse).toBeTruthy();
  }));

  it('should trigger SLA deadline timeout if server delay exceeds timeoutMs', fakeAsync(() => {
    component.simulatedDelayMs = 1500;
    component.timeoutMs = 400; // SLA deadline 400ms
    component.maxRetries = 0;

    component.dispatchRequest();
    tick(400);

    expect(component.hasFailed).toBeTrue();
    expect(component.terminalFailures).toBe(1);
    expect(component.terminalError).toContain('SLA Deadline Exceeded');
  }));
});
