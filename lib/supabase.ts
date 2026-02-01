
import { createClient } from '@supabase/supabase-js';

// Accessing environment variables directly for better compatibility
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

// If keys are missing, we export null to prevent immediate crash
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
