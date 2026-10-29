import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DelayExampleComponent } from './delay-example.component';
import { provideRouter } from '@angular/router';

describe('DelayExampleComponent', () => {
  let component: DelayExampleComponent;
  let fixture: ComponentFixture<DelayExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelayExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DelayExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "delay"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('delay');
  });

  it('should delay emission by the configured duration', fakeAsync(() => {
    component.delayDurationMs = 400;
    component.executeStream();

    // At 200ms, not emitted yet
    tick(200);
    const midEmits = component.events.filter(e => e.type === 'next');
    expect(midEmits.length).toBe(0);

    // At 400ms+, it emits and completes
    tick(250);
    const finalEmits = component.events.filter(e => e.type === 'next');
    expect(finalEmits.length).toBe(1);

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);
  }));
});
