import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForkJoinExampleComponent } from './fork-join-example.component';
import { provideRouter } from '@angular/router';

describe('ForkJoinExampleComponent', () => {
  let component: ForkJoinExampleComponent;
  let fixture: ComponentFixture<ForkJoinExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForkJoinExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ForkJoinExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "fork-join"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('fork-join');
  });

  it('should wait for all inner streams and emit consolidated dictionary', fakeAsync(() => {
    component.userDelay = 100;
    component.ordersDelay = 300;
    component.settingsDelay = 50;
    component.executeStream();

    expect(component.isRunning).toBeTrue();
    tick(150); // user & settings done, orders still in flight
    expect(component.events.some(e => e.type === 'next')).toBeFalse();

    tick(200); // 350ms total, orders finishes
    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(1);
    expect(nexts[0].value.profile.name).toBe('Dev Lead');
    expect(nexts[0].value.orders.length).toBe(1);
    expect(component.isRunning).toBeFalse();

    component.ngOnDestroy();
  }));
});
