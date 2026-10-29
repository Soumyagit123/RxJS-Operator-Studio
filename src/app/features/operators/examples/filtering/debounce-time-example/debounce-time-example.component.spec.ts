import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebounceTimeExampleComponent } from './debounce-time-example.component';
import { provideRouter } from '@angular/router';

describe('DebounceTimeExampleComponent', () => {
  let component: DebounceTimeExampleComponent;
  let fixture: ComponentFixture<DebounceTimeExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebounceTimeExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DebounceTimeExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "debounce-time"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('debounce-time');
  });

  it('should debounce rapid inputs and emit only after silence period', fakeAsync(() => {
    component.debounceMs = 200;
    component.initStream();

    // 3 rapid inputs 50ms apart
    component.onInputChange('a');
    tick(50);
    component.onInputChange('ab');
    tick(50);
    component.onInputChange('abc');
    tick(50);

    // No next emissions yet because silence has not reached 200ms
    const intermediate = component.events.filter(e => e.type === 'next');
    expect(intermediate.length).toBe(0);

    // Advance clock past 200ms of silence
    tick(220);
    const finalNexts = component.events.filter(e => e.type === 'next');
    expect(finalNexts.length).toBe(1);
    expect(finalNexts[0].value.includes('abc')).toBeTrue();

    component.ngOnDestroy();
  }));
});
