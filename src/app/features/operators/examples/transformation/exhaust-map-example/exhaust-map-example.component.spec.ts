import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExhaustMapExampleComponent } from './exhaust-map-example.component';
import { provideRouter } from '@angular/router';

describe('ExhaustMapExampleComponent', () => {
  let component: ExhaustMapExampleComponent;
  let fixture: ComponentFixture<ExhaustMapExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExhaustMapExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ExhaustMapExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "exhaust-map"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('exhaust-map');
  });

  it('should process first click and ignore rapid subsequent clicks while running', fakeAsync(() => {
    // Click 1 (starts 600ms transaction)
    component.onSubmitClick();
    expect(component.isRunning).toBeTrue();
    tick(100);

    // Click 2 and 3 happen while Click 1 is active
    component.onSubmitClick();
    component.onSubmitClick();
    tick(100);

    // Total 200ms elapsed. Check that clicks were recorded as ignored
    const ignored = component.events.filter(e => e.type === 'unsubscribe' && e.value.includes('Ignored click'));
    expect(ignored.length).toBe(2);

    // Let the first click complete (600ms total)
    tick(450);
    expect(component.isRunning).toBeFalse();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(1);
    expect(nexts[0].value.clickId).toBe(1);

    component.ngOnDestroy();
  }));
});
