import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithLatestFromExampleComponent } from './with-latest-from-example.component';
import { provideRouter } from '@angular/router';

describe('WithLatestFromExampleComponent', () => {
  let component: WithLatestFromExampleComponent;
  let fixture: ComponentFixture<WithLatestFromExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithLatestFromExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(WithLatestFromExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "with-latest-from"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('with-latest-from');
  });

  it('should emit only when primary stream triggers, pairing with latest secondary state', () => {
    // Changing secondary role should NOT emit
    component.role$.next('Admin');
    const initialNexts = component.events.filter(e => e.type === 'next');
    expect(initialNexts.length).toBe(0);

    // Primary submit trigger should emit pairing with 'Admin'
    component.triggerSubmit();
    const afterFirstSubmit = component.events.filter(e => e.type === 'next');
    expect(afterFirstSubmit.length).toBe(1);
    expect(afterFirstSubmit[0].value.capturedSnapshotRole).toBe('Admin');
    expect(afterFirstSubmit[0].value.authorized).toBeTrue();

    // Change secondary role again
    component.role$.next('Viewer');
    expect(component.events.filter(e => e.type === 'next').length).toBe(1);

    // Second primary submit trigger captures 'Viewer'
    component.triggerSubmit();
    const afterSecondSubmit = component.events.filter(e => e.type === 'next');
    expect(afterSecondSubmit.length).toBe(2);
    expect(afterSecondSubmit[0].value.capturedSnapshotRole).toBe('Viewer');
    expect(afterSecondSubmit[0].value.authorized).toBeFalse();
  });
});
