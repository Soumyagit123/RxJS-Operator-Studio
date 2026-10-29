import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FromExampleComponent } from './from-example.component';
import { provideRouter } from '@angular/router';

describe('FromExampleComponent', () => {
  let component: FromExampleComponent;
  let fixture: ComponentFixture<FromExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(FromExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "from"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('from');
    expect(component.operator?.name).toBe('from');
  });

  it('should convert array into individual next emissions', () => {
    component.sourceType = 'array';
    component.inputValue = 'Item1, Item2';
    component.executeStream();

    const nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBe(2);
    expect(nextEvents[1].value).toBe('Item1');
    expect(nextEvents[0].value).toBe('Item2');
    expect(component.events.some(e => e.type === 'complete')).toBeTrue();
  });

  it('should convert promise and emit after resolution', fakeAsync(() => {
    component.sourceType = 'promise';
    component.inputValue = 'Resolved DTO';
    component.executeStream();

    expect(component.isRunning).toBeTrue();
    tick(450);

    const nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBe(1);
    expect(nextEvents[0].value).toBe('Resolved DTO');
    expect(component.isRunning).toBeFalse();
  }));
});
