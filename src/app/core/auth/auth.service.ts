import { Injectable, DestroyRef, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { User, Session } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client.service';
import { AuthState, INITIAL_AUTH_STATE } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state$ = new BehaviorSubject<AuthState>(INITIAL_AUTH_STATE);

  readonly state$: Observable<AuthState> = this._state$.asObservable();

  readonly user$: Observable<User | null> = this.state$.pipe(
    map(s => s.user),
    distinctUntilChanged()
  );

  readonly isAuthenticated$: Observable<boolean> = this.state$.pipe(
    map(s => s.status === 'authenticated'),
    distinctUntilChanged()
  );

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map(s => s.status === 'loading'),
    distinctUntilChanged()
  );

  constructor() {
    this.initAuthListener();
  }

  get currentState(): AuthState {
    return this._state$.value;
  }

  private initAuthListener(): void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (session?.user) {
        this._state$.next({
          status: 'authenticated',
          user: session.user,
          session,
          error: null
        });
      } else {
        this._state$.next({
          status: 'unauthenticated',
          user: null,
          session: null,
          error: null
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  /**
   * 1-Click Google OAuth (PKCE)
   * Redirects user to Google OAuth flow and returns seamlessly to the current page.
   */
  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      this._state$.next({ ...this._state$.value, status: 'error', error: error.message });
      throw error;
    }
  }

  /**
   * Email & Password Sign In
   */
  async signInWithEmail(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Email & Password Sign Up
   */
  async signUpWithEmail(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Sign out and clear active session.
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      this._state$.next({ ...this._state$.value, error: error.message });
      throw error;
    }
    this._state$.next({
      status: 'unauthenticated',
      user: null,
      session: null,
      error: null
    });
  }
}
