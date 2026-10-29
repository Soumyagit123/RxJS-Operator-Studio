import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThrottleTimeExampleComponent } from './throttle-time-example.component';
import { provideRouter } from '@angular/router';

describe('ThrottleTimeExampleComponent', () => {
  let component: ThrottleTimeExampleComponent;
  let fixture: ComponentFixture<ThrottleTimeExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThrottleTimeExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ThrottleTimeExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "throttle-time"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('throttle-time');
  });

  it('should emit immediately on leading edge and ignore subsequent emissions during cooldown', fakeAsync(() => {
    component.throttleMs = 300;
    component.initStream();

    // First click emits immediately
    component.onButtonClick();
    let nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(1);

    // Clicks during the 300ms window are throttled
    tick(100);
    component.onButtonClick();
    tick(100);
    component.onButtonClick();
    nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(1); // Still 1

    // After 300ms passes, new click is allowed
    tick(150);
    component.onButtonClick();
    nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(2);

    component.ngOnDestroy();
  }));
});
