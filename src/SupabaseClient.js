import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and public key
const SUPABASE_URL = 'https://duiqqscnftxsycmjeihf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);