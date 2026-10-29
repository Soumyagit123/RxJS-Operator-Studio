import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LastExampleComponent } from './last-example.component';
import { provideRouter } from '@angular/router';

describe('LastExampleComponent', () => {
  let component: LastExampleComponent;
  let fixture: ComponentFixture<LastExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LastExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and execute stream with last() operator', () => {
    expect(component).toBeTruthy();
    expect(component.events.length).toBe(0);

    component.executeStream();

    expect(component.events.length).toBeGreaterThan(0);
    const nextEvent = component.events.find(e => e.type === 'next');
    expect(nextEvent).toBeTruthy();
    expect(nextEvent?.value?.emitted).toBe(55); // Last item in default stream "10, 20, 30, 42, 55"
  });

  it('should support predicate mode for last even number', () => {
    component.mode = 'even';
    component.streamInput = '10, 20, 30, 42, 55';
    component.executeStream();

    const nextEvent = component.events.find(e => e.type === 'next');
    expect(nextEvent).toBeTruthy();
    expect(nextEvent?.value?.emitted).toBe(42); // Last even number
  });
});
