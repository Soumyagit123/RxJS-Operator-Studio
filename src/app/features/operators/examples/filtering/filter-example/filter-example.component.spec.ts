import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterExampleComponent } from './filter-example.component';
import { provideRouter } from '@angular/router';

describe('FilterExampleComponent', () => {
  let component: FilterExampleComponent;
  let fixture: ComponentFixture<FilterExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "filter"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('filter');
  });

  it('should filter numbers greater than threshold', () => {
    component.filterMode = 'threshold';
    component.threshold = 25;
    component.rawCandidates = '10, 30, 15, 50';
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(2);
    expect(nexts[1].value).toBe('30');
    expect(nexts[0].value).toBe('50');
  });

  it('should filter even numbers only', () => {
    component.filterMode = 'even';
    component.rawCandidates = '1, 2, 3, 4, 5, 6';
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(3);
    expect(nexts[2].value).toBe('2');
    expect(nexts[1].value).toBe('4');
    expect(nexts[0].value).toBe('6');
  });
});
