import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IntervalExampleComponent } from './interval-example.component';
import { provideRouter } from '@angular/router';

describe('IntervalExampleComponent', () => {
  let component: IntervalExampleComponent;
  let fixture: ComponentFixture<IntervalExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntervalExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(IntervalExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "interval"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('interval');
  });

  it('should emit at periodic intervals and complete after take limit', fakeAsync(() => {
    component.periodMs = 100;
    component.takeCount = 3;
    component.executeStream();

    expect(component.isRunning).toBeTrue();
    tick(100);
    expect(component.events.some(e => e.type === 'next' && e.value.includes('tick #0'))).toBeTrue();

    tick(200);
    expect(component.events.some(e => e.type === 'complete')).toBeTrue();
    expect(component.isRunning).toBeFalse();

    component.ngOnDestroy();
  }));
});
