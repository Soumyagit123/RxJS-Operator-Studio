import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyExampleComponent } from './empty-example.component';
import { provideRouter } from '@angular/router';

describe('EmptyExampleComponent', () => {
  let component: EmptyExampleComponent;
  let fixture: ComponentFixture<EmptyExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "empty"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('empty');
  });

  it('should complete synchronously with 0 next values and 0 errors', () => {
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(0);

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);

    const errors = component.events.filter(e => e.type === 'error');
    expect(errors.length).toBe(0);
  });
});
