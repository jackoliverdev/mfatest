import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<UserProfile>(supabaseUrl, supabaseAnonKey); 