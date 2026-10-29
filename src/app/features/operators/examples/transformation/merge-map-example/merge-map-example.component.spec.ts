import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MergeMapExampleComponent } from './merge-map-example.component';
import { provideRouter } from '@angular/router';

describe('MergeMapExampleComponent', () => {
  let component: MergeMapExampleComponent;
  let fixture: ComponentFixture<MergeMapExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergeMapExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MergeMapExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "merge-map"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('merge-map');
  });

  it('should process inner tasks concurrently and complete out-of-order based on duration', fakeAsync(() => {
    component.executeStream();
    expect(component.isRunning).toBeTrue();

    // Fast task Doc-B (150ms) completes first
    tick(200);
    const bEvents = component.events.filter(e => e.type === 'next' && e.value.id === 'Doc-B');
    expect(bEvents.length).toBe(1);

    // Medium task Doc-C (350ms) completes second
    tick(200);
    const cEvents = component.events.filter(e => e.type === 'next' && e.value.id === 'Doc-C');
    expect(cEvents.length).toBe(1);

    // Slow task Doc-A (600ms) completes last
    tick(250);
    const aEvents = component.events.filter(e => e.type === 'next' && e.value.id === 'Doc-A');
    expect(aEvents.length).toBe(1);
    expect(component.isRunning).toBeFalse();

    component.ngOnDestroy();
  }));
});
