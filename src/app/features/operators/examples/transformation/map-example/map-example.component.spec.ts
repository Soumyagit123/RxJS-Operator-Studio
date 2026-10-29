import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapExampleComponent } from './map-example.component';
import { provideRouter } from '@angular/router';

describe('MapExampleComponent', () => {
  let component: MapExampleComponent;
  let fixture: ComponentFixture<MapExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapExampleComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MapExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load operator metadata for "map"', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('map');
  });

  it('should transform raw strings to uppercase view models', () => {
    component.selectedTransform = 'uppercase';
    component.inputRaw = 'rxjs, angular';
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(2);
    expect(nexts[1].value).toBe('RXJS');
    expect(nexts[0].value).toBe('ANGULAR');
  });

  it('should transform to structured DTOs with auto-increment IDs', () => {
    component.selectedTransform = 'dto';
    component.inputRaw = 'Report A, Report B';
    component.executeStream();

    const nexts = component.events.filter(e => e.type === 'next');
    expect(nexts.length).toBe(2);
    expect(nexts[1].value.id).toBe(1);
    expect(nexts[1].value.active).toBeTrue();
  });
});
