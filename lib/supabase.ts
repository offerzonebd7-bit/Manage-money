
import { createClient } from '@supabase/supabase-js';

// Standard Vite environment variable access
// Using 'as any' to bypass TypeScript build issues while ensuring runtime functionality
const getEnv = (key: string): string => {
  try {
    const env = (import.meta as any).env;
    return env[key] || '';
  } catch (e) {
    return '';
  }
};

export const supabaseUrl = getEnv('VITE_SUPABASE_URL');
export const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

// Initialize client with error checking
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
