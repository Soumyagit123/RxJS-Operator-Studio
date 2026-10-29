import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RangeExampleComponent } from './range-example.component';
import { provideRouter } from '@angular/router';

describe('RangeExampleComponent', () => {
  let component: RangeExampleComponent;
  let fixture: ComponentFixture<RangeExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RangeExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "range"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('range');
  });

  it('should emit exact count of numbers starting from specified startNumber', () => {
    component.startNumber = 10;
    component.countNumbers = 4;
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(4);
    // Reversed in console display unshift
    expect(nexts[3].value).toBe(10);
    expect(nexts[2].value).toBe(11);
    expect(nexts[1].value).toBe(12);
    expect(nexts[0].value).toBe(13);

    const completes = component.events.filter(e => e.type === 'complete');
    expect(completes.length).toBe(1);
  });
});
