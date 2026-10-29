import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConcatMapExampleComponent } from './concat-map-example.component';
import { provideRouter } from '@angular/router';

describe('ConcatMapExampleComponent', () => {
  let component: ConcatMapExampleComponent;
  let fixture: ComponentFixture<ConcatMapExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcatMapExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ConcatMapExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "concat-map"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('concat-map');
  });

  it('should execute tasks strictly in serialized order waiting for each to finish', fakeAsync(() => {
    component.executeStream();
    expect(component.isRunning).toBeTrue();

    // After 300ms, only step 1 should have emitted
    tick(350);
    const step1 = component.events.filter(e => e.type === 'next' && e.value.step.includes('Step 1'));
    expect(step1.length).toBe(1);

    // After another 400ms (750ms total), step 2 emits
    tick(400);
    const step2 = component.events.filter(e => e.type === 'next' && e.value.step.includes('Step 2'));
    expect(step2.length).toBe(1);

    // After another 200ms (950ms total), step 3 emits and completes
    tick(250);
    const step3 = component.events.filter(e => e.type === 'next' && e.value.step.includes('Step 3'));
    expect(step3.length).toBe(1);
    expect(component.isRunning).toBeFalse();

    component.ngOnDestroy();
  }));
});
