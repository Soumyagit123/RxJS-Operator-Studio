import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SampleTimeExampleComponent } from './sample-time-example.component';
import { provideRouter } from '@angular/router';

describe('SampleTimeExampleComponent', () => {
  let component: SampleTimeExampleComponent;
  let fixture: ComponentFixture<SampleTimeExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleTimeExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SampleTimeExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "sample-time"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('sample-time');
  });

  it('should sample periodic values and skip intermediate emissions', fakeAsync(() => {
    component.sourceIntervalMs = 100;
    component.sampleWindowMs = 250;
    component.executeStream();

    // Advance 600ms (should produce ~2 samples)
    tick(600);

    const samples = component.events.filter(e => e.type === 'next');
    expect(samples.length).toBeGreaterThanOrEqual(2);

    // Drain remaining ticks to clean up fakeAsync
    tick(1000);
  }));
});
