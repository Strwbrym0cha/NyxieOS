import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yirlqcymqzjizdgxhtgk.supabase.co';
const supabasePublishableKey = 'sb_publishable_f2x4He6q2T-qJH_payH_3A_-1MlniBx';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
