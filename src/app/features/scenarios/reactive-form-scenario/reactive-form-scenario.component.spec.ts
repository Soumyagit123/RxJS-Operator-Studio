import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormScenarioComponent } from './reactive-form-scenario.component';
import { provideRouter } from '@angular/router';

describe('ReactiveFormScenarioComponent', () => {
  let component: ReactiveFormScenarioComponent;
  let fixture: ComponentFixture<ReactiveFormScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormScenarioComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveFormScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the reactive form scenario component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form when reserved username "admin" is entered asynchronously', fakeAsync(() => {
    const usernameCtrl = component.signupForm.get('username')!;
    usernameCtrl.setValue('admin');
    usernameCtrl.markAsTouched();

    // Advance validator timer(350) + checkUsernameAvailable delay(200)
    tick(550);

    expect(usernameCtrl.hasError('usernameTaken')).toBeTrue();
    expect(usernameCtrl.valid).toBeFalse();
  }));

  it('should validate form successfully when unique username is entered', fakeAsync(() => {
    const usernameCtrl = component.signupForm.get('username')!;
    usernameCtrl.setValue('john.doe');
    usernameCtrl.markAsTouched();

    tick(550);

    expect(usernameCtrl.valid).toBeTrue();
    expect(usernameCtrl.hasError('usernameTaken')).toBeFalse();
  }));
});
