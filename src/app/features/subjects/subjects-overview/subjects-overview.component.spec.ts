import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsOverviewComponent } from './subjects-overview.component';
import { provideRouter } from '@angular/router';

describe('SubjectsOverviewComponent', () => {
  let component: SubjectsOverviewComponent;
  let fixture: ComponentFixture<SubjectsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsOverviewComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize standard Subject', () => {
    expect(component).toBeTruthy();
    expect(component.selectedKind).toBe('Subject');
  });

  it('should only deliver events to active subscribers with standard Subject', () => {
    component.switchKind('Subject');
    // Early subscriber connects
    component.toggleSubA();
    component.nextEmitValue = 'Message 1';
    component.emitNext();

    // Late subscriber connects
    component.toggleSubB();
    component.nextEmitValue = 'Message 2';
    component.emitNext();

    const consumerAEvents = component.events.filter(e => typeof e.value === 'object' && e.value?.consumer === 'Consumer A');
    const consumerBEvents = component.events.filter(e => typeof e.value === 'object' && e.value?.consumer === 'Consumer B (Late)');

    expect(consumerAEvents.length).toBe(2);
    // Consumer B missed Message 1
    expect(consumerBEvents.length).toBe(1);
    expect(consumerBEvents[0].value.value).toBe('Message 2');
  });

  it('should immediately deliver seed and latest value to new subscriber with BehaviorSubject', () => {
    component.switchKind('BehaviorSubject');
    component.toggleSubA();

    // Consumer A receives seed immediately
    const aEvents = component.events.filter(e => typeof e.value === 'object' && e.value?.consumer === 'Consumer A');
    expect(aEvents.length).toBe(1);
    expect(aEvents[0].value.value).toContain('Default Seed');

    // Emit new state
    component.nextEmitValue = 'Updated State';
    component.emitNext();

    // Consumer B joins late and gets current state
    component.toggleSubB();
    const bEvents = component.events.filter(e => typeof e.value === 'object' && e.value?.consumer === 'Consumer B (Late)');
    expect(bEvents.length).toBe(1);
    expect(bEvents[0].value.value).toBe('Updated State');
  });

  it('should replay historical emissions with ReplaySubject', () => {
    component.switchKind('ReplaySubject');
    // Emit 2 values before Consumer B connects
    component.nextEmitValue = 'Hist-1';
    component.emitNext();
    component.nextEmitValue = 'Hist-2';
    component.emitNext();

    component.toggleSubB();
    const bEvents = component.events.filter(e => typeof e.value === 'object' && e.value?.consumer === 'Consumer B (Late)');
    expect(bEvents.length).toBe(2);
  });

  it('should emit only final value upon complete with AsyncSubject', () => {
    component.switchKind('AsyncSubject');
    component.toggleSubA();

    component.nextEmitValue = 'Temp 1';
    component.emitNext();
    component.nextEmitValue = 'Final Result';
    component.emitNext();

    // Nothing emitted before completion
    let nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBe(0);

    component.emitComplete();

    // Emits final value upon completion
    nextEvents = component.events.filter(e => e.type === 'next');
    expect(nextEvents.length).toBe(1);
    expect(nextEvents[0].value.value).toBe('Final Result');
  });
});
