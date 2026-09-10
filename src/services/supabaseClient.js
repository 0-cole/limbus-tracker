import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hfslprldsjilclkeaodw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmc2xwcmxkc2ppbGNsa2Vhb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzQxNjIsImV4cCI6MjEwNDY1MDE2Mn0.xaGTGPkkcNuwaC_Suj01CR8qADiwKz6O3m9wUvY5IXY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
