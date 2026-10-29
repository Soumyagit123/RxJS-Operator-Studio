import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimeoutExampleComponent } from './timeout-example.component';
import { provideRouter } from '@angular/router';

describe('TimeoutExampleComponent', () => {
  let component: TimeoutExampleComponent;
  let fixture: ComponentFixture<TimeoutExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeoutExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeoutExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "timeout"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('timeout');
  });

  it('should complete successfully when server responds before timeout deadline', fakeAsync(() => {
    component.timeoutLimitMs = 1000;
    component.serverDelayMs = 300;
    component.executeStream();

    tick(350);

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBe(0);
  }));

  it('should error when server response exceeds timeout deadline', fakeAsync(() => {
    component.timeoutLimitMs = 400;
    component.serverDelayMs = 1200;
    component.executeStream();

    // Fast-forward past timeout limit
    tick(450);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBe(1);
    expect(String(errors[0].value)).toContain('Timeout');

    // Flush remaining server delay to avoid leak in fakeAsync
    tick(1000);
  }));
});
