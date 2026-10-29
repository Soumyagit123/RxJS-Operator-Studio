import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TakeUntilExampleComponent } from './take-until-example.component';
import { provideRouter } from '@angular/router';

describe('TakeUntilExampleComponent', () => {
  let component: TakeUntilExampleComponent;
  let fixture: ComponentFixture<TakeUntilExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeUntilExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TakeUntilExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "take-until"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('take-until');
  });

  it('should emit continuous ticks until notifier is triggered, then complete', fakeAsync(() => {
    component.executeStream();
    expect(component.isRunning).toBeTrue();

    tick(350); // 1 tick emitted
    expect(component.events.some(e => e.type === 'next')).toBeTrue();

    // Trigger teardown notifier
    component.triggerNotifier();
    expect(component.events.some(e => e.type === 'complete')).toBeTrue();
    expect(component.isRunning).toBeFalse();

    // Advancing clock further should emit zero extra ticks
    const eventCount = component.events.length;
    tick(600);
    expect(component.events.length).toBe(eventCount);

    component.ngOnDestroy();
  }));
});
