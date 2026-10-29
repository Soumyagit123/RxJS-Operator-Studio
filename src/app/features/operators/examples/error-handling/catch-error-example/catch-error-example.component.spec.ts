import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatchErrorExampleComponent } from './catch-error-example.component';
import { provideRouter } from '@angular/router';

describe('CatchErrorExampleComponent', () => {
  let component: CatchErrorExampleComponent;
  let fixture: ComponentFixture<CatchErrorExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatchErrorExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CatchErrorExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "catch-error"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('catch-error');
  });

  it('should gracefully recover with fallback value and complete stream without error when strategy is fallback', () => {
    component.recoveryStrategy = 'fallback';
    component.executeStream();

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);

    const fallbacks = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && e.value?.cached);
    expect(fallbacks.length).toBe(1);
    expect(fallbacks[0].value.offlineMode).toBeTrue();
  });

  it('should propagate transformed domain error when strategy is rethrow', () => {
    component.recoveryStrategy = 'rethrow';
    component.executeStream();

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBeGreaterThan(0);
    const hasDomainError = errors.some(e => String(e.value).includes('DomainException'));
    expect(hasDomainError).toBeTrue();
  });
});
