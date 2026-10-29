import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistinctUntilChangedExampleComponent } from './distinct-until-changed-example.component';
import { provideRouter } from '@angular/router';

describe('DistinctUntilChangedExampleComponent', () => {
  let component: DistinctUntilChangedExampleComponent;
  let fixture: ComponentFixture<DistinctUntilChangedExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistinctUntilChangedExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DistinctUntilChangedExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "distinct-until-changed"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('distinct-until-changed');
  });

  it('should suppress consecutive duplicates but allow non-consecutive duplicates', () => {
    component.inputSequence = 'A, A, B, B, A';
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    // Expected order: 'A', 'B', 'A' (total 3)
    expect(nexts.length).toBe(3);
    expect(nexts[2].value).toBe('A');
    expect(nexts[1].value).toBe('B');
    expect(nexts[0].value).toBe('A');

    const duplicates = component.events.filter(e => e.type === 'unsubscribe');
    expect(duplicates.length).toBe(2);
  });
});
