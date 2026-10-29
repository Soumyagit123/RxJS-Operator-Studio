import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstExampleComponent } from './first-example.component';
import { provideRouter } from '@angular/router';

describe('FirstExampleComponent', () => {
  let component: FirstExampleComponent;
  let fixture: ComponentFixture<FirstExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FirstExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and execute stream with first() operator', () => {
    expect(component).toBeTruthy();
    expect(component.events.length).toBe(0);

    component.executeStream();

    expect(component.events.length).toBeGreaterThan(0);
    const nextEvent = component.events.find(e => e.type === 'next');
    expect(nextEvent).toBeTruthy();
    expect(nextEvent?.value?.emitted).toBe(3); // First item in default stream "3, 7, 8, 11, 14"
  });

  it('should support predicate mode for even numbers', () => {
    component.mode = 'even';
    component.streamInput = '3, 7, 8, 11, 14';
    component.executeStream();

    const nextEvent = component.events.find(e => e.type === 'next');
    expect(nextEvent).toBeTruthy();
    expect(nextEvent?.value?.emitted).toBe(8); // First even number
  });
});
