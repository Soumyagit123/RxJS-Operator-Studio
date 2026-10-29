import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ShareReplayExampleComponent } from './share-replay-example.component';
import { provideRouter } from '@angular/router';

describe('ShareReplayExampleComponent', () => {
  let component: ShareReplayExampleComponent;
  let fixture: ComponentFixture<ShareReplayExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareReplayExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReplayExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "share-replay"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('share-replay');
  });

  it('should reuse cached response for late subscriber without duplicate HTTP call', fakeAsync(() => {
    component.initSharedStream();
    expect(component.backendCallCount).toBe(0);

    // Subscriber A joins
    component.subscribeSubscriberA();
    tick(350);

    expect(component.backendCallCount).toBe(1);
    expect(component.isSubscribedA).toBeTrue();

    // Subscriber B joins late
    component.subscribeSubscriberB();
    tick(50);

    // HTTP call count must remain 1
    expect(component.backendCallCount).toBe(1);
    expect(component.isSubscribedB).toBeTrue();

    const replayEmissions = component.events.filter(e => typeof e.value === 'object' && e.value?.subscriber?.includes('Replay Buffer'));
    expect(replayEmissions.length).toBe(1);
  }));
});
