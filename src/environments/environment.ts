export interface EnvironmentConfig {
  production: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const environment: EnvironmentConfig = {
  production: false,
  // Public credentials for Supabase Google Authentication
  // Replace with your Supabase Project URL and public anon key from Project Settings -> API
  supabaseUrl: 'https://upuqfefrgstwmrpsfeqx.supabase.co',
  supabaseAnonKey: 'sb_publishable_UKrJTH0l3O2EN9oWK6bGFQ_eo8YF51b'
};
