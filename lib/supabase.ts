import { createClient } from '@supabase/supabase-js';

// For Raf's DB:
// const supabaseUrl = 'https://udhtoivsehidjggntlqx.supabase.co';
// const supabaseAnonKey = 'sb_publishable_gJIzmh9VDtpO7-P41V5U0A_hMIWN5EV';

// For testing, Abigail's DB:
const supabaseUrl = 'SUPABASE_URL';
const supabaseAnonKey = 'PUBLIC_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);