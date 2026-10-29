---
name: supabase-angular-auth
description: >-
  Enterprise implementation skill for Supabase Authentication with Google OAuth (PKCE) in Angular 17+ and RxJS.
  Use this skill whenever adding or refactoring user authentication, Google SSO, auth state streams,
  functional route guards, token lifecycle management, and Row Level Security (RLS) policies.
---

# Supabase Google Authentication for RxJS Operator Studio

This skill guides the implementation of client-side Supabase Google OAuth / Gmail sign-in tailored specifically for **RxJS Operator Studio** (client-side Angular 17+ SPA with no external database, where the entire playground remains open to explore, and login is used to identify the user and personalize their session/progress).

---

## 1. Architectural Blueprint (Lightweight & Focused)

Keep the implementation clean and focused on two core services:

1. **`SupabaseClientService`**: Initializes and exposes the singleton Supabase client using public project credentials.
2. **`AuthService`**: Manages user authentication state, triggers 1-click Google OAuth (PKCE), handles sign-out, and exposes reactive RxJS streams (`user$`, `isAuthenticated$`).
3. **Header / Profile UI**: A spatial login button / avatar dropdown in `AppHeaderComponent` showing the signed-in user's name/picture or a "Sign in with Google" button.

> [!NOTE]
> Since this is an interactive learning workbench, **no route guards or access walls are required**. All operators, labs, and scenarios remain freely accessible to everyone. Login simply enhances the experience (personalizing the user, saving progress stats, and remembering favorite operators).

---

## 2. Explicit Auth State Model

Avoid treating "still checking session" and "logged out" both as `null`:

```typescript
import { User, Session } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
}

export const INITIAL_AUTH_STATE: AuthState = {
  status: 'loading',
  user: null,
  session: null,
  error: null
};
```

---

## 3. Reactive `AuthService` Implementation

### Core Principles
- **One Supabase Client**: Kept in `SupabaseClientService`.
- **Single Central Listener**: Listen to `onAuthStateChange` inside `AuthService`.
- **RxJS Observable Exposure**: Encapsulate `BehaviorSubject<AuthState>`, exposing read-only `state$`, `user$`, and `isAuthenticated$`.
- **No Gmail Scopes**: Request standard Google SSO (`openid`, `email`, `profile`). Do **not** request Gmail API scopes.

```typescript
import { Injectable, DestroyRef, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client.service';
import { AuthState, INITIAL_AUTH_STATE } from './auth.model';

@Injectable({ providedIn: 'root' })
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

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener(): void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
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
   * Redirects user to Google sign-in and returns to the current URL
   */
  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href, // Returns smoothly to the current page
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
   * Sign out and return state to unauthenticated
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      this._state$.next({ ...this._state$.value, error: error.message });
      throw error;
    }
  }
}
```

---

## 4. Redirect & PKCE Auto-Exchange

- Under standard browser usage, Supabase JS automatically detects the PKCE auth code/token in the URL on startup when returning from Google and establishes the session.
- Setting `redirectTo: window.location.href` allows users to log in directly from whichever operator lab they are currently testing without needing dedicated redirect routes or losing their place.

---

## 5. Security Checklist

1. **Public Credentials Only**: Use only your Supabase Project URL and public `anon` / `publishable` key. Never check in or bundle the `service_role` secret key.
2. **Allowlist in Supabase**: Ensure your Vercel URL (e.g., `https://*.vercel.app/**`) and local dev URL (`http://localhost:4200/**`) are added to **Authentication → URL Configuration → Redirect URLs** in the Supabase Dashboard.
3. **No Sensitive Scopes**: Do not add extra Gmail API scopes—standard Google identity scopes (`email`, `profile`, `openid`) are all that is needed.

