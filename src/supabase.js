import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sigjwmgekmrwehylvuvu.supabase.co';
const supabasePublishableKey = 'sb_publishable_CTqamiGR3_lXNW2mBx9wMA_ObemQMAC';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
