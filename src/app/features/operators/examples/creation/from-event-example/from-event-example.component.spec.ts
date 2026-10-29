import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FromEventExampleComponent } from './from-event-example.component';
import { provideRouter } from '@angular/router';

describe('FromEventExampleComponent', () => {
  let component: FromEventExampleComponent;
  let fixture: ComponentFixture<FromEventExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromEventExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FromEventExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "from-event"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('from-event');
  });

  it('should capture mousemove events dispatched on the interactive element', () => {
    expect(component.interactiveArea).toBeTruthy();
    component.executeStream();
    const element = component.interactiveArea!.nativeElement;

    // Dispatch simulated mouse event
    const event = new MouseEvent('mousemove', { clientX: 120, clientY: 85 });
    element.dispatchEvent(event);

    expect(component.eventCount).toBe(1);
    const nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBe(1);
  });
});
