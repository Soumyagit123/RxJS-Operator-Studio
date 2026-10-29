import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperatorDetailHostComponent } from './operator-detail-host.component';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('OperatorDetailHostComponent', () => {
  let component: OperatorDetailHostComponent;
  let fixture: ComponentFixture<OperatorDetailHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorDetailHostComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'switch-map' }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorDetailHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and resolve operator from route param', () => {
    expect(component).toBeTruthy();
    expect(component.operator?.id).toBe('switch-map');
    expect(component.operator?.name).toBe('switchMap');
  });
});
