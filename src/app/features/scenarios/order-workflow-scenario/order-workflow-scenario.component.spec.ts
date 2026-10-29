import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderWorkflowScenarioComponent } from './order-workflow-scenario.component';
import { provideRouter } from '@angular/router';

describe('OrderWorkflowScenarioComponent', () => {
  let component: OrderWorkflowScenarioComponent;
  let fixture: ComponentFixture<OrderWorkflowScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderWorkflowScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderWorkflowScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the order workflow component', () => {
    expect(component).toBeTruthy();
  });

  it('should safely drop duplicate submissions in exhaustMap mode while in-flight', fakeAsync(() => {
    component.selectedMode = 'exhaustMap';
    component.bindPipeline();
    component.latencyMs = 300;

    // First click: Dispatches order
    component.triggerSubmit();
    expect(component.inFlightCount).toBe(1);

    // Second rapid click while first is in-flight: Dropped!
    component.triggerSubmit();
    expect(component.droppedCount).toBe(1);

    // Advance 300ms to complete first order
    tick(300);

    expect(component.processedOrders.length).toBe(1);
    expect(component.inFlightCount).toBe(0);

    // Subsequent click after completion: Works!
    component.triggerSubmit();
    tick(300);

    expect(component.processedOrders.length).toBe(2);
  }));

  it('should queue sequential requests in concatMap mode without dropping', fakeAsync(() => {
    component.selectedMode = 'concatMap';
    component.bindPipeline();
    component.latencyMs = 200;

    // Dispatch two orders rapidly
    component.triggerSubmit();
    component.triggerSubmit();

    expect(component.droppedCount).toBe(0);

    // After 200ms, only 1st order finishes
    tick(200);
    expect(component.processedOrders.length).toBe(1);

    // After next 200ms, 2nd order finishes
    tick(200);
    expect(component.processedOrders.length).toBe(2);
  }));

  it('should isolate payment rejection errors without breaking subsequent orders', fakeAsync(() => {
    component.simulateFail = true;
    component.latencyMs = 150;
    component.triggerSubmit();

    tick(150);
    // Order was rejected, no committed order added
    expect(component.processedOrders.length).toBe(0);

    // Now fix failure and place order again
    component.simulateFail = false;
    component.triggerSubmit();
    tick(150);

    expect(component.processedOrders.length).toBe(1);
  }));
});
