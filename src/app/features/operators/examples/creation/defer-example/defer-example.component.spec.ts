import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeferExampleComponent } from './defer-example.component';
import { provideRouter } from '@angular/router';

describe('DeferExampleComponent', () => {
  let component: DeferExampleComponent;
  let fixture: ComponentFixture<DeferExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeferExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DeferExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "defer"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('defer');
  });

  it('should evaluate factory on every subscription with defer', () => {
    component.testLazyDefer();
    const firstEmits = component.events.filter(e => e.type === 'next');
    expect(firstEmits.length).toBe(1);
    expect(firstEmits[0].value.source).toContain('defer()');

    component.testLazyDefer();
    const secondEmits = component.events.filter(e => e.type === 'next');
    expect(secondEmits.length).toBe(2);
  });
});
