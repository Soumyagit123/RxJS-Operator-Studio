import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfExampleComponent } from './of-example.component';
import { provideRouter } from '@angular/router';

describe('OfExampleComponent', () => {
  let component: OfExampleComponent;
  let fixture: ComponentFixture<OfExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OfExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "of"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('of');
    expect(component.operator?.name).toBe('of');
  });

  it('should execute real RxJS of stream and record events synchronously', () => {
    component.inputValues = 'Alpha, Beta, Gamma';
    component.executeStream();

    expect(component.events.length).toBe(5); // subscribe, 3 next items, complete
    expect(component.events[0].type).toBe('subscribe');
    expect(component.events[1].value).toBe('Alpha');
    expect(component.events[2].value).toBe('Beta');
    expect(component.events[3].value).toBe('Gamma');
    expect(component.events[4].type).toBe('complete');
    expect(component.isRunning).toBeFalse();
  });

  it('should reset stream and clean event array on reset', () => {
    component.executeStream();
    expect(component.events.length).toBeGreaterThan(0);

    component.resetStream();
    expect(component.events.length).toBe(0);
    expect(component.isRunning).toBeFalse();
  });
});
