import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TapExampleComponent } from './tap-example.component';
import { provideRouter } from '@angular/router';

describe('TapExampleComponent', () => {
  let component: TapExampleComponent;
  let fixture: ComponentFixture<TapExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TapExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TapExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "tap"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('tap');
  });

  it('should execute side effects without mutating stream values', () => {
    component.enableAuditLogs = true;
    component.executeStream();

    const items = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && e.value?.sku);
    expect(items.length).toBe(3);
    expect(items[0].value.sku).toBe('MONITOR-4K');

    // Audit logs should be recorded alongside
    const auditLogs = component.events.filter(e => typeof e.value === 'string' && e.value.includes('[Audit Tap]'));
    expect(auditLogs.length).toBe(3);
  });
});
