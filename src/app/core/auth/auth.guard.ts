import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Functional Route Guard (CanActivateFn)
 * Protects application routes. Waits until initial Supabase session resolution finishes,
 * then allows entry if authenticated, or redirects to /login.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.state$.pipe(
    // Wait until initial session resolution finishes (filter out 'loading')
    filter(s => s.status !== 'loading'),
    take(1),
    map(s => {
      if (s.status === 'authenticated') {
        return true;
      }
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url !== '/' ? state.url : null }
      });
    })
  );
};

/**
 * Guest Guard: Redirects already authenticated users away from /login to dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.state$.pipe(
    filter(s => s.status !== 'loading'),
    take(1),
    map(s => {
      if (s.status === 'authenticated') {
        return router.createUrlTree(['/']);
      }
      return true;
    })
  );
};
