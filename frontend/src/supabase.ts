import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://dlyppptfmcrhqjrxovsi.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRseXBwcHRmbWNyaHFqcnhvdnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTA4NDMsImV4cCI6MjA5MjU4Njg0M30.O7vHA_sSwGlDfkD4Oyqx9kcMnv-3a_0JKaVBhEQpzck';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

