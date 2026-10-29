import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThrowErrorExampleComponent } from './throw-error-example.component';
import { provideRouter } from '@angular/router';

describe('ThrowErrorExampleComponent', () => {
  let component: ThrowErrorExampleComponent;
  let fixture: ComponentFixture<ThrowErrorExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThrowErrorExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ThrowErrorExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "throw-error"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('throw-error');
  });

  it('should immediately terminate with error notification and zero next emissions', () => {
    component.customErrorMessage = 'CustomTestError';
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(0);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBe(1);
    expect(String(errors[0].value)).toContain('CustomTestError');
  });
});
