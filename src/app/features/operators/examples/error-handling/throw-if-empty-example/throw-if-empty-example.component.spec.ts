import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThrowIfEmptyExampleComponent } from './throw-if-empty-example.component';
import { provideRouter } from '@angular/router';

describe('ThrowIfEmptyExampleComponent', () => {
  let component: ThrowIfEmptyExampleComponent;
  let fixture: ComponentFixture<ThrowIfEmptyExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThrowIfEmptyExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ThrowIfEmptyExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "throw-if-empty"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('throw-if-empty');
  });

  it('should pass value through cleanly and complete when stream is populated', () => {
    component.streamType = 'populated';
    component.executeStream();

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);

    const values = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && e.value?.id === 'ORD-9824');
    expect(values.length).toBe(1);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBe(0);
  });

  it('should emit error when stream completes without emissions', () => {
    component.streamType = 'empty';
    component.executeStream();

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(0);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBe(1);
    expect(String(errors[0].value)).toContain('EntityNotFoundException');
  });
});
