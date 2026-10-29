import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ShareExampleComponent } from './share-example.component';
import { provideRouter } from '@angular/router';

describe('ShareExampleComponent', () => {
  let component: ShareExampleComponent;
  let fixture: ComponentFixture<ShareExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "share"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('share');
  });

  it('should multicast ticks to both consumers with a single upstream producer', fakeAsync(() => {
    component.initSharedStream();
    expect(component.producerExecutionCount).toBe(0);

    // Connect Consumer A
    component.toggleSubscriberA();
    tick(350); // 1 tick
    expect(component.producerExecutionCount).toBe(1);

    // Connect Consumer B
    component.toggleSubscriberB();
    tick(350); // 1 more tick shared by both
    expect(component.producerExecutionCount).toBe(2);

    // Consumer A and B both received events
    const nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBeGreaterThan(1);

    // Disconnect both
    component.toggleSubscriberA();
    component.toggleSubscriberB();
    expect(component.activeSubscriberCount).toBe(0);
    expect(component.isRunning).toBeFalse();
  }));
});
