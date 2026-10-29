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
