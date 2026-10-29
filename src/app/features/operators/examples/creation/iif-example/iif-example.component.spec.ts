import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IifExampleComponent } from './iif-example.component';
import { provideRouter } from '@angular/router';

describe('IifExampleComponent', () => {
  let component: IifExampleComponent;
  let fixture: ComponentFixture<IifExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IifExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(IifExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "iif"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('iif');
  });

  it('should subscribe to true branch when isAuthenticated is true', () => {
    component.isAuthenticated = true;
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && e.value?.role === 'ADMIN');
    expect(nexts.length).toBe(1);
  });

  it('should subscribe to false branch when isAuthenticated is false', () => {
    component.isAuthenticated = false;
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next' && typeof e.value === 'object' && e.value?.role === 'GUEST');
    expect(nexts.length).toBe(1);
  });
});
