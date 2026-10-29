import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ApiDashboardScenarioComponent } from './api-dashboard-scenario.component';
import { provideRouter } from '@angular/router';

describe('ApiDashboardScenarioComponent', () => {
  let component: ApiDashboardScenarioComponent;
  let fixture: ComponentFixture<ApiDashboardScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiDashboardScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ApiDashboardScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the api dashboard scenario component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users, orders, and metrics concurrently via forkJoin', fakeAsync(() => {
    component.refreshDashboard();
    tick(500);

    expect(component.vm).toBeTruthy();
    expect(component.vm!.users.length).toBeGreaterThan(0);
    expect(component.vm!.orders.length).toBeGreaterThan(0);
    expect(component.vm!.metrics).toBeTruthy();
    expect(component.vm!.totalRevenue).toBeGreaterThan(0);
  }));

  it('should filter orders in-memory when filter changes without re-fetching network', fakeAsync(() => {
    component.refreshDashboard();
    tick(500);

    const totalOrdersCount = component.vm!.orders.length;

    // Filter to 'Shipped' only
    component.orderFilter$.next('Shipped');
    tick(50);

    expect(component.vm!.filteredOrders.length).toBeLessThanOrEqual(totalOrdersCount);
    expect(component.vm!.filteredOrders.every(o => o.status === 'Shipped')).toBeTrue();
  }));

  it('should isolate failure of metrics service and keep users & orders functional', fakeAsync(() => {
    component.failMetrics = true;
    component.refreshDashboard();
    tick(500);

    // Metrics failed and fell back gracefully to null
    expect(component.vm!.metrics).toBeNull();
    // But Users and Orders still loaded!
    expect(component.vm!.users.length).toBeGreaterThan(0);
    expect(component.vm!.orders.length).toBeGreaterThan(0);
  }));
});
