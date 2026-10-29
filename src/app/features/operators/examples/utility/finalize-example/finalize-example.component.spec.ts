import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinalizeExampleComponent } from './finalize-example.component';
import { provideRouter } from '@angular/router';

describe('FinalizeExampleComponent', () => {
  let component: FinalizeExampleComponent;
  let fixture: ComponentFixture<FinalizeExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalizeExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FinalizeExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "finalize"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('finalize');
  });

  it('should execute finalize callback and reset isLoading on success completion', () => {
    component.terminationScenario = 'success';
    component.executeStream();

    expect(component.isLoading).toBeFalse();
    expect(component.finalizeTriggered).toBeTrue();
    const finalizeEvents = component.events.filter(e => typeof e.value === 'string' && e.value.includes('[finalize Callback Executed]'));
    expect(finalizeEvents.length).toBe(1);
  });

  it('should execute finalize callback and reset isLoading even on unhandled error', () => {
    component.terminationScenario = 'error';
    component.executeStream();

    expect(component.isLoading).toBeFalse();
    expect(component.finalizeTriggered).toBeTrue();
    const errorEvents = component.events.filter(e => e.type === 'error');
    expect(errorEvents.length).toBe(1);
  });
});
