import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombineLatestExampleComponent } from './combine-latest-example.component';
import { provideRouter } from '@angular/router';

describe('CombineLatestExampleComponent', () => {
  let component: CombineLatestExampleComponent;
  let fixture: ComponentFixture<CombineLatestExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombineLatestExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CombineLatestExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "combine-latest"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('combine-latest');
  });

  it('should emit consolidated latest state whenever any individual stream changes', () => {
    const initialCount = component.events.filter(e => e.type === 'next').length;
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Update keyword only
    component.searchKeyword$.next('Senior Engineer');
    const afterKeyword = component.events.filter(e => e.type === 'next');
    expect(afterKeyword[0].value.latestState.keyword).toBe('Senior Engineer');
    expect(afterKeyword[0].value.latestState.dept).toBe('Engineering');

    // Update page number only
    component.pageNumber$.next(2);
    const afterPage = component.events.filter(e => e.type === 'next');
    expect(afterPage[0].value.latestState.page).toBe(2);
    expect(afterPage[0].value.latestState.keyword).toBe('Senior Engineer');
  });
});
