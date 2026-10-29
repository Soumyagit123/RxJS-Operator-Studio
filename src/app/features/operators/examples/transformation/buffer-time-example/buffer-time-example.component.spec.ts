import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BufferTimeExampleComponent } from './buffer-time-example.component';
import { provideRouter } from '@angular/router';

describe('BufferTimeExampleComponent', () => {
  let component: BufferTimeExampleComponent;
  let fixture: ComponentFixture<BufferTimeExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BufferTimeExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BufferTimeExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "buffer-time"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('buffer-time');
  });

  it('should group emissions into array batches over time', fakeAsync(() => {
    component.eventIntervalMs = 100;
    component.bufferWindowMs = 250;
    component.executeStream();

    // Advance 600ms
    tick(600);

    const batches = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && Array.isArray(e.value?.batchValues));
    expect(batches.length).toBeGreaterThanOrEqual(2);

    // Drain remaining
    tick(1000);
  }));
});
