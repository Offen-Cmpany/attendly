import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Hardcoded fallbacks ensure the production web build always works,
// even if env vars aren't injected at build time (e.g. Cloudflare Pages).
const FALLBACK_URL = 'https://wgmewavrxupzoijcdwfr.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbWV3YXZyeHVwem9pamNkd2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjA5ODAsImV4cCI6MjA5NjAzNjk4MH0.46tevOI5nrPabt1btBCgnfYchwxySd4J35QdsueDK6o';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
