import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RetryExampleComponent } from './retry-example.component';
import { provideRouter } from '@angular/router';

describe('RetryExampleComponent', () => {
  let component: RetryExampleComponent;
  let fixture: ComponentFixture<RetryExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetryExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RetryExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "retry"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('retry');
  });

  it('should recover after transient failure and succeed', fakeAsync(() => {
    component.maxRetries = 2;
    component.failTimes = 1; // Fails on 1, succeeds on 2
    component.executeStream();

    // Advance virtual time for delay between retries
    tick(300);

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);

    const successes = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && e.value?.status === 200);
    expect(successes.length).toBe(1);
    expect(successes[0].value.attempt).toBe(2);
  }));

  it('should emit error when failure count exceeds maximum allowed retries', fakeAsync(() => {
    component.maxRetries = 1;
    component.failTimes = 99; // Always fails
    component.executeStream();

    tick(500);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBeGreaterThan(0);
    const exhaustedMsg = errors.some(e => String(e.value).includes('exhausted'));
    expect(exhaustedMsg).toBeTrue();
  }));
});
