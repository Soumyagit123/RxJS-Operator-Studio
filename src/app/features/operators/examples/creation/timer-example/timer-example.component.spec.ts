import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerExampleComponent } from './timer-example.component';
import { provideRouter } from '@angular/router';

describe('TimerExampleComponent', () => {
  let component: TimerExampleComponent;
  let fixture: ComponentFixture<TimerExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TimerExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "timer"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('timer');
  });

  it('should emit once and complete when period is 0 (one-shot)', fakeAsync(() => {
    component.dueTimeMs = 300;
    component.periodMs = 0;
    component.executeStream();

    tick(150);
    expect(component.events.filter(e => e.type === 'next').length).toBe(0);

    tick(200);
    expect(component.events.filter(e => e.type === 'next').length).toBe(1);
    expect(component.events.filter(e => e.type === 'complete').length).toBe(1);
    expect(component.isRunning).toBeFalse();
  }));

  it('should emit periodically when period is greater than 0', fakeAsync(() => {
    component.dueTimeMs = 200;
    component.periodMs = 100;
    component.executeStream();

    // Advance 550ms: 200ms initial + 3 intervals of 100ms = 4 emissions
    tick(550);
    const nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBeGreaterThanOrEqual(3);

    // Drain remaining ticks for fakeAsync
    tick(500);
  }));
});
