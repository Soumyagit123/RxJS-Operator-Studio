import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseClientService } from './supabase-client.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabaseClient: any;
  let authStateCallback: any;

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        onAuthStateChange: jasmine.createSpy('onAuthStateChange').and.callFake((callback: any) => {
          authStateCallback = callback;
          return {
            data: {
              subscription: {
                unsubscribe: jasmine.createSpy('unsubscribe')
              }
            }
          };
        }),
        signInWithOAuth: jasmine.createSpy('signInWithOAuth').and.returnValue(Promise.resolve({ error: null })),
        signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve({ error: null }))
      }
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseClientService,
          useValue: { client: mockSupabaseClient }
        }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with loading state', (done) => {
    service.state$.subscribe(state => {
      expect(state.status).toBe('loading');
      done();
    });
  });

  it('should transition to authenticated when session is emitted', (done) => {
    const mockUser = { id: 'u1', email: 'architect@example.com' } as any;
    const mockSession = { user: mockUser } as any;

    authStateCallback('SIGNED_IN', mockSession);

    service.state$.subscribe(state => {
      if (state.status === 'authenticated') {
        expect(state.user?.email).toBe('architect@example.com');
        expect(state.status).toBe('authenticated');
        done();
      }
    });
  });

  it('should transition to unauthenticated on sign out', (done) => {
    authStateCallback('SIGNED_OUT', null);

    service.state$.subscribe(state => {
      if (state.status === 'unauthenticated') {
        expect(state.user).toBeNull();
        done();
      }
    });
  });

  it('should delegate signInWithGoogle to Supabase signInWithOAuth with PKCE', async () => {
    await service.signInWithGoogle();
    expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith(
      jasmine.objectContaining({
        provider: 'google'
      })
    );
  });

  it('should delegate signOut to Supabase signOut', async () => {
    await service.signOut();
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });
});
