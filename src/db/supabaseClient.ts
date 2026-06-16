import { createClient } from '@supabase/supabase-js';

// Get keys from localStorage (so users can paste theirs in the Web UI dynamically)
// or fallback to vite environment variable if compiled.
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('supabase_url');
  const customKey = localStorage.getItem('supabase_anon_key');

  return {
    url: customUrl || (import.meta as any).env.VITE_SUPABASE_URL || '',
    key: customKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ''
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return !!(url && key && url.includes('supabase.co'));
};

let supabaseInstance: any = null;

export const getSupabase = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const { url, key } = getSupabaseConfig();
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('Error initializing real Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
};
